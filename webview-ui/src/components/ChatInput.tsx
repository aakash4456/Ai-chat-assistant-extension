import React, { useRef, useLayoutEffect } from "react";
import "./ChatInput.css";

type ChatInputProps = {
  value: string;
  showPicker: boolean;
  filteredFiles: string[];
  onSendMessage: () => void;
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

  // This effect will auto-resizes the textarea
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
        <div className="file-picker">
            {filteredFiles.length > 0 ? (
              filteredFiles
              .slice(0, 15)
              .map((file) => (
                <div
                  key={file}
                  className="file-item"
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
        ref={textareaRef}
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