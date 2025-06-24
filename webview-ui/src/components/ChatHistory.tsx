import React from "react";
import Message from "./Message";
import "./ChatHistory.css";

// Structure of a message object
export type ChatMessage = {
  text: string;
  sender: "user" | "ai";
};

type ChatHistoryProps = {
  messages: ChatMessage[];
};

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  return (
    <div className="chat-history">
      {messages.map((msg, index) => (
        <Message key={index} text={msg.text} sender={msg.sender} />
      ))}
    </div>
  );
};

export default ChatHistory;