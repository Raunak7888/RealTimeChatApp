import React, { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import WebSocketService from "./WebSocketService";
import ChatUtil from "./ChatUtil";

const Ok = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [isGroup, setIsGroup] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection on component mount
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("Authorization="))
      ?.split("=")[1];

    if (token && !WebSocketService.client?.connected) {
      WebSocketService.connect(
        () => console.log("WebSocket connected"),
        (error) => console.error("WebSocket connection error:", error),
        token
      );
    }

    return () => {
      WebSocketService.disconnect(); // Clean up WebSocket connection on component unmount
    };
  }, []);

  const handleUserSelect = (id, name, isGroup) => {
    setSelectedUserId(id); // ID of the user or group
    setSelectedUsername(name); // Name of the user or group
    setIsGroup(isGroup); // Flag to indicate whether it's a group or user
  };

  return (
    <div className="chat-container">
      <div className="sidebar">
        <ChatList onChatSelect={handleUserSelect} />
      </div>
      <div className="chat-area">
        {selectedUserId && selectedUsername ? (
          <ChatWindow
            recipientId={selectedUserId}
            recipientUsername={selectedUsername}
            isGroup={isGroup}
          />
        ) : (
          <div className="no-chat">Select a user to start chatting</div>
        )}
      </div>
      <div className="chat-help-utils">
        <ChatUtil />
      </div>
    </div>
  );
};

export default Ok;
