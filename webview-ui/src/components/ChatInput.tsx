// webview-ui/src/components/ChatInput.tsx

import React, { useRef, useLayoutEffect } from "react";
import "./ChatInput.css";

type ChatInputProps = {
  value: string;
  showPicker: boolean;
  filteredFiles: string[];
  onSendMessage: () => void; // No argument needed, App.tsx has the value
  onValueChange: (value: string) => void;
  onFileSelect: (file: string) => void;
};

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  showPicker,
  filteredFiles,
  onSendMessage,
  onValueChange,
  onFileSelect,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // This effect auto-resizes the textarea
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to shrink when text is deleted
      textarea.style.height = "auto";
      // Set height to the scroll height to grow with text
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]); 

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="chat-input-container">
      {/* The File Picker UI */}
      {showPicker && (
        <>
          {console.log("🎯 showPicker is TRUE")}
          {console.log("🎯 filteredFiles count:", filteredFiles.length)}
        <div className="file-picker">
            {filteredFiles.length > 0 ? (
              filteredFiles
              .slice(0, 10) // Show a max of 10 files
              .map((file) => (
                <div
                key={file}
                className="file-item"
                // Use onMouseDown to fire before the textarea loses focus
                onMouseDown={() => onFileSelect(file)}
                >
                    {file}
                  </div>
                ))
              ) : (
                <div className="file-item-empty">No matching files found</div>
              )}
          </div>
        </>
      )}

      {/* The Text Input Area */}
      <textarea
        className="chat-input"
        placeholder="Ask a question or type @ to attach a file..."
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="send-button" onClick={onSendMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;