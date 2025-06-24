// webview-ui/src/components/LoadingIndicator.tsx
import React from "react";
import "./LoadingIndicator.css";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="message ai">
      <div className="message-content typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default LoadingIndicator;