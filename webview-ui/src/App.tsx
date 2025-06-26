import { useState, useEffect, useRef } from "react";
import ChatHistory, { type ChatMessage } from "./components/ChatHistory";
import ChatInput from "./components/ChatInput";
import LoadingIndicator from "./components/LoadingIndicator"; // Ensure this component is created
import vscode from "./vscode";
import "./App.css";

// Initial greeting message
const initialMessage: ChatMessage = {
  text: "Hello! I'm your AI Assistant. How can I help you with your code today?",
  sender: "ai",
};

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<string[]>([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // 1. Handle input changes from ChatInput.tsx
  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    const atIndex = newValue.lastIndexOf("@");
    const spaceAfterAtIndex = newValue.indexOf(" ", atIndex);

    if (atIndex !== -1 && spaceAfterAtIndex === -1) {
      console.log("Sending getWorkspaceFiles to extension");
      if (workspaceFiles.length === 0) {
        vscode.postMessage({ command: "getWorkspaceFiles" });
      }
      setShowFilePicker(true);
      const query = newValue.substring(atIndex + 1);
      setFilteredFiles(
        workspaceFiles.filter((file) =>
          file.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setShowFilePicker(false);
    }
  };

  // 2. Handle when a user clicks a file in the picker
  const handleFileSelect = (selectedFile: string) => {
    const atIndex = inputValue.lastIndexOf("@");
    const newValue = `${inputValue.substring(0, atIndex)}@${selectedFile} `;
    setInputValue(newValue);
    setShowFilePicker(false);
  };

  // --- LOGIC FOR SENDING MESSAGES ---
  const handleSendMessage = () => {
    // Prevent sending while loading
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue;
    const attachedFiles = messageText.match(/@(\S+)/g)?.map(f => f.substring(1)) || [];

    setMessages((prev) => [...prev, { sender: "user", text: messageText }]);
    setIsLoading(true);
    
    vscode.postMessage({
      command: "userMessage",
      payload: { text: messageText, attachedFiles },
    });
    setInputValue("");
    setShowFilePicker(false);
  };

  // Effect to update workspacefiles
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("React received message from extension:", event.data);
      const message = event.data;
      switch (message.command) {
        case "aiResponse":
          setIsLoading(false);
          setMessages((prev) => [...prev, { sender: "ai", text: message.payload.text }]);
          break;
        case "fileList":
          console.log("File list received:", message.payload.files);
          setWorkspaceFiles(message.payload.files);
          setFilteredFiles(message.payload.files);
          break;
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [workspaceFiles]);

  // Effect to auto-scroll chat
  useEffect(() => {
    chatHistoryRef.current?.scrollTo(0, chatHistoryRef.current.scrollHeight);
  }, [messages, isLoading]);

  return (
    <main className="app-container">
      <div className="chat-history-container" ref={chatHistoryRef}>
        <ChatHistory messages={messages} />
        {isLoading && <LoadingIndicator />}
      </div>

      <ChatInput
        value={inputValue}
        showPicker={showFilePicker}
        filteredFiles={filteredFiles}
        onSendMessage={handleSendMessage}
        onValueChange={handleInputChange}
        onFileSelect={handleFileSelect}
      />
    </main>
  );
}

export default App;