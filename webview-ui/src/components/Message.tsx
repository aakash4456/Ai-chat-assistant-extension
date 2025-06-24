// webview-ui/src/components/Message.tsx

import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// We use the CJS import as it's often more compatible with type systems
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import "./Message.css";

type MessageProps = {
  text: string;
  sender: "user" | "ai";
};

const Message: React.FC<MessageProps> = ({ text, sender }) => {
  return (
    <div className={`message ${sender}`}>
      <div className="message-content">
        <ReactMarkdown
          components={{
            // This is the definitive, correct implementation
            code({ node, className, children, ...props }) {
              // 1. Check for a language className (e.g., "language-js")
              const match = /language-(\w+)/.exec(className || "");

              // 2. If there's a language, use SyntaxHighlighter.
              //    Otherwise, render a normal `code` element.
              return match ? (
                // @ts-ignore - We are ignoring a known type mismatch issue in the library
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...(props as any)} // Use `as any` to prevent potential ref errors
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Message;