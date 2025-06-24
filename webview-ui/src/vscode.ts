// webview-ui/src/vscode.ts

// import type { WebviewApi } from "vscode-webview";

// We are defining a custom type to ensure we have the type-safe postMessage method
type VsCode = {
  postMessage: (message: any) => void;
};

// --- THIS IS THE FIX ---
// We're telling TypeScript that a function called "acquireVsCodeApi"
// will be available in the global scope, and it returns an object
// that matches our custom VsCode type.
declare function acquireVsCodeApi(): VsCode;
// --- END OF FIX ---

// A special function provided by VS Code to get the API object
// Now that we have declared it, TypeScript will no longer complain.
const vscode: VsCode = acquireVsCodeApi();

export default vscode;