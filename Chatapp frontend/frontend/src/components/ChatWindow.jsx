import React, { useState, useEffect, useRef } from "react";
import WebSocketService from "./WebSocketService";
import OnlineStatusService from "./OnlineStatusService";
import ChatManager from "./ChatManager";
import { getCurrentUserWithToken, fetchMessagesUntilLastDay } from "./api";
import "./css/chatsidebar.css";

const ChatWindow = ({ recipientId, recipientUsername, isGroup }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [status, setStatus] = useState("Unknown");
  const [currentUser, setCurrentUser] = useState(null);

  const messageSubscriptionRef = useRef(null);
  const statusSubscriptionRef = useRef(null);
  const senderSubscriptionRef = useRef(null);

  // Fetch current user ID on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userId = await getCurrentUserWithToken();
        setCurrentUser(userId);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    initializeUser();
  }, []);
  console.log(`Current user: ${currentUser} and recipient: ${recipientId}`);
  useEffect(() => {
    if (!recipientId || !currentUser || !WebSocketService.client?.connected) {
      return;
    }

    // Cleanup previous subscriptions
    if (messageSubscriptionRef.current) {
      messageSubscriptionRef.current.unsubscribe();
    }
    if (statusSubscriptionRef.current) {
      statusSubscriptionRef.current.unsubscribe();
    }
    if (senderSubscriptionRef.current) {
      senderSubscriptionRef.current.unsubscribe();
    }

    // Fetch previous messages for the selected recipient or group
    const loadMessages = async () => {
      try {
        const previousMessages = await fetchMessagesUntilLastDay(
          currentUser,
          recipientId,
          isGroup
        );
        setMessages(previousMessages);
      } catch (error) {
        console.error("Error fetching previous messages:", error);
      }
    };

    loadMessages();

    // Subscribe to new messages for recipient
    messageSubscriptionRef.current = ChatManager.subscribeToMessages(
      WebSocketService.client,
      currentUser,
      (newMessage) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === newMessage.tempId
              ? { ...msg, status: "delivered" }
              : msg
          )
        );
        setMessages((prev) => [...prev, newMessage]);
      },
      isGroup,
      recipientId
    );

    // Subscribe to online status updates for user chats
    if (!isGroup) {
      statusSubscriptionRef.current =
        OnlineStatusService.subscribeToStatusUpdates(
          WebSocketService.client,
          recipientId,
          (newStatus) => setStatus(newStatus)
        );

      OnlineStatusService.requestUserStatus(
        WebSocketService.client,
        recipientId
      );
    }

    // Subscribe to sender acknowledgment updates (e.g., sent, failed)
    senderSubscriptionRef.current = ChatManager.subscribeToSender(
      WebSocketService.client,
      currentUser,
      (ackMessage) => {
        const { tempId, status } = ackMessage;
        setMessages((prev) =>
          prev.map((msg) => (msg.tempId === tempId ? { ...msg, status } : msg))
        );
      },
      isGroup,
      recipientId
    );

    // Cleanup on recipient or user change or component unmount
    return () => {
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current.unsubscribe();
      }
      if (statusSubscriptionRef.current) {
        statusSubscriptionRef.current.unsubscribe();
      }
      if (senderSubscriptionRef.current) {
        senderSubscriptionRef.current.unsubscribe();
      }
    };
  }, [recipientId, currentUser, isGroup]); // Ensure this re-runs on dependency change

  const handleSendClick = () => {
    if (messageContent.trim() && currentUser) {
      const tempId = Date.now(); // Temporary ID for tracking pending messages
      const messageDTO = {
        senderId: currentUser,
        receiverId: recipientId,
        groupId: recipientId,
        content: messageContent,
        isGroup,
        tempId,
        status: "pending", // Initial status as "pending"
      };

      // Optimistic UI update
      
      if(!isGroup){
        setMessages((prev) => [...prev, messageDTO]);
      }

      // Send message through WebSocket
      ChatManager.sendMessage(
        WebSocketService.client,
        messageDTO,
        (response) => {
          if (response.success) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.tempId === tempId ? { ...msg, status: "sent" } : msg
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.tempId === tempId ? { ...msg, status: "failed" } : msg
              )
            );
          }
        }
      );

      setMessageContent("");
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <span className="chat-contact-name">
          {recipientUsername || "Group Chat"}
        </span>
        <br />
        {!isGroup && (
          <span className={`chat-status ${status.toLowerCase()}`}>
            {status}
          </span>
        )}
      </div>
      <div className="message-display">
        {messages.map((msg, index) => (
          <div key={msg.id || `msg-${index}`}>
            <div
              className={
                msg.senderId == currentUser // Use === to compare
                  ? "message-sent"
                  : "message-received"
              }
            >
              {msg.content}
              <span className="message-status">
                {msg.status === "pending" && " (Pending)"}
                {msg.status === "sent" && " (Sent)"}
                {msg.status === "failed" && " (Failed)"}
              </span>
            </div>
            <br />
            <br />
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          className="message-input"
          placeholder="Type a message"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <button className="send-button" onClick={handleSendClick}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
