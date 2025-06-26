import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

// The name for my secret key (In My case it is comming from Google)
const SECRET_KEY_NAME = "googleGeminiApiKey";

// This function will be called by VS code itself using the main entry point ("main": "./out/extension.js") mentioned in package.json
export function activate(context: vscode.ExtensionContext) {
  // Initial log to check that app is starting properly or not by Toggle developer tools console.
  console.log('Congratulations, your extension "ai-chat-assistant" is now active!');

  // Command to set the API key
  const setApiKeyCommand = vscode.commands.registerCommand(
    "ai-chat-assistant.setApiKey",
    async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: "Please enter your Google Gemini API Key",
        password: true,
        ignoreFocusOut: true,
      });
      if (apiKey) {
        await context.secrets.store(SECRET_KEY_NAME, apiKey);
        vscode.window.showInformationMessage("Google Gemini API Key stored successfully!");
      }
    }
  );

  // Command to start the chat panel
  const startChatCommand = vscode.commands.registerCommand(
    "ai-chat-assistant.start",
    () => {
      ChatPanel.createOrShow(context);
    }
  );

  context.subscriptions.push(setApiKeyCommand, startChatCommand);
}

class ChatPanel {
  public static currentPanel: ChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri; // Universal resource identifier
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = []; //Unregister listeners when panel is closed

  public static createOrShow(context: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
          "chatPanel",
          "AI Chat Assistant",
          column || vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "webview-ui", "dist")],
            // Controls if the webview panel's content (iframe) is kept around even when the panel * is no longer visible.
            retainContextWhenHidden: true,
          }
        );
    ChatPanel.currentPanel = new ChatPanel(panel, context);
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._context = context;
    this._extensionUri = context.extensionUri;
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "userMessage": {
            const apiKey = await this._context.secrets.get(SECRET_KEY_NAME);
            if (!apiKey) {
              vscode.window.showErrorMessage(
                "Google Gemini API Key not set. Please run 'AI Chat: Set API Key' from the command palette."
              );
              return;
            }
            // variable to holds User inputed prompt and file if attached.
            let prompt = message.payload.text;
            const attachedFiles = message.payload.attachedFiles || [];

            // 1. Get the root URI of the user's workspace and User attacjed d file with prompt.
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && attachedFiles.length > 0) {
              const workspaceRoot = workspaceFolders[0].uri; // Use the first workspace folder
              
              let contextText = "";
              for (const filePath of attachedFiles) {
                try {
                  // 2. Create a correct URI by joining the workspace root with the relative file path
                  const fileUri = vscode.Uri.joinPath(workspaceRoot, filePath);
                  const fileContent = await vscode.workspace.fs.readFile(fileUri);
                  const decodedContent = Buffer.from(fileContent).toString('utf8');

                  console.log('fileUri ', fileUri);
                  console.log('fileContent ', fileContent);
                  console.log('decodedContent ', decodedContent);

                  contextText += `--- CONTEXT FROM: ${filePath} ---\n\n${decodedContent}\n\n--- END OF CONTEXT ---\n\n`;
                } catch (error) {
                  console.error(`Error reading file ${filePath}:`, error);
                  this._panel.webview.postMessage({
                    command: "aiResponse",
                    payload: { text: `Error: Could not read the file ${filePath}. Please make sure it exists and the path is correct.` },
                  });
                  return; 
                }
              }
              // Now prompt = prompt + File Data
              prompt = `${contextText}
                          Based on the context from the files above, please answer the following question:\n\n
                        ${prompt}`;
            }

            // Here i send the request to google gemini to get back response of final prompt.
            try {
              const aiResponse = await this.askGoogleGemini(prompt, apiKey);
              this._panel.webview.postMessage({
                command: "aiResponse",
                payload: { text: aiResponse },
              });
            } catch (error: any) {
              const errorMessage = error.message || "An unknown error occurred.";
              vscode.window.showErrorMessage(`Error from Google Gemini: ${errorMessage}`);
              this._panel.webview.postMessage({
                command: "aiResponse",
                payload: { text: `Error: Could not get a response from Google Gemini.` },
              });
            }
            return;
          }
          
          // Case to pick a file from User Input
          case "getWorkspaceFiles": {
            console.log(" getWorkspaceFiles command received from WebView");
            const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**');
            const filePaths = files.map(file => vscode.workspace.asRelativePath(file));
            // debugging
            console.log(`Found ${filePaths.length} files. Sending to WebView.`);
            console.log(filePaths.slice(0, 5));
            this._panel.webview.postMessage({
              command: "fileList",
              payload: { files: filePaths },
            });
            return;
          }
        }
      },
      undefined,
      this._disposables
    );
  }

  // FUNCTION TO CALL GOOGLE GEMINI ---
  private async askGoogleGemini(prompt: string, apiKey: string): Promise<string> {
      // For text-only input, I used the gemini-1.5-flash-latest model
      const genAI = new GoogleGenerativeAI(apiKey);
      // This is the updated, correct model name
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
  }

  // dispose and _getHtmlForWebview methods are the same as before
  public dispose() {
    ChatPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const buildPath = path.join(this._extensionUri.fsPath, "webview-ui", "dist");
    const scriptFile = fs.readdirSync(path.join(buildPath, "assets")).find(file => file.startsWith('index-') && file.endsWith('.js'));
    const styleFile = fs.readdirSync(path.join(buildPath, "assets")).find(file => file.startsWith('index-') && file.endsWith('.css'));

    if (!scriptFile || !styleFile) {
        return `<h1>Error: Build files not found.</h1><p>Please run 'npm run build' in the 'webview-ui' directory.</p>`;
    }

    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist", "assets", scriptFile));
    const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "webview-ui", "dist", "assets", styleFile));
    const nonce = getNonce();

    return `<!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                  <link rel="stylesheet" type="text/css" href="${stylesUri}">
                  <title>AI Chat Assistant</title>
                </head>
                <body>
                  <div id="root">
                  </div>
                  <script nonce="${nonce}" src="${scriptUri}">
                  </script>
                </body>
              </html>`;
  }
}

function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}