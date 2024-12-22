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

      if (!isGroup) {
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
                msg.senderId == currentUser
                  ? "message-sent"
                  : "message-received"
              }
            >
              {msg.content}
              {msg.senderId == currentUser && (
                <span className="message-status">
                  {msg.status == "pending" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="12px"
                      viewBox="0 -960 960 960"
                      width="12px"
                      fill="#ff0000"
                    >
                      {/* Thumbs Down SVG */}
                      <path d="M240.96-831.63h441.43v529.09L405.98-26.13l-56.29-53.78q-7.89-7.52-12.98-20.72-5.1-13.2-5.1-25.63v-11.37l43.28-164.91H120q-36.07 0-63.53-27.47Q29-357.48 29-393.54v-65.42q0-7.58 2-16.24 2-8.67 4.48-15.91l121.43-286.06q10.2-22.87 34.19-38.67 23.99-15.79 49.86-15.79Zm354.02 91H240.96L120.48-458.96v65.42H486.7l-51.13 208.28 159.41-159.41v-395.96Zm0 395.96V-740.63v395.96Zm87.41 42.13v-91h112.59v-347.09H682.39v-91h203.59v529.09H682.39Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="12px"
                      viewBox="0 -960 960 960"
                      width="12px"
                      fill="#2854C5"
                    >
                      {/* Thumbs Up SVG */}
                      <path d="M714.02-106.13H272.59v-529.09L549-911.63l56.29 53.78q7.88 7.52 12.98 20.72 5.1 13.2 5.1 25.63v11.37l-43.28 164.91h254.89q36.06 0 63.53 27.47t27.47 63.53v65.42q0 7.58-2 16.24-2 8.67-4.48 15.91L798.07-160.59q-10.2 22.87-34.19 38.67-23.99 15.79-49.86 15.79Zm-354.02-91h354.02L834.5-478.8v-65.42H468.28l51.13-208.28L360-593.09v395.96Zm0-395.96V-197.13v-395.96Zm-87.41-42.13v91H160v347.09h112.59v91H69v-529.09h203.59Z" />
                    </svg>
                  )}
                </span>
              )}
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
