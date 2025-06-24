import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
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
            code({ node, className, children, ...props }) {
              // Check for a language className ("language-js")
              const match = /language-(\w+)/.exec(className || "");
              // If there's a language, enable SyntaxHighlighter. Otherwise, render a normal `code` element.
              return match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...(props as any)}
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