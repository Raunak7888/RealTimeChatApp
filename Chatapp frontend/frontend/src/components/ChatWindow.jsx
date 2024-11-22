import React, { useState, useEffect } from 'react';
import WebSocketService from './WebSocketService';
import OnlineStatusService from './OnlineStatusService';
import ChatManager from './ChatManager';
import './css/chatsidebar.css';
import { getCurrentUserWithToken } from './api';

const ChatWindow = ({ recipientId, recipientUsername }) => {
    const [stompClient, setStompClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [status, setStatus] = useState('Unknown'); // Fallback for unknown status
    const [currentUser, setCurrentUser] = useState(null);

    // Fetch current user when the component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userId = await getCurrentUserWithToken();
                setCurrentUser(userId);
                console.log('Current user ID:', userId, 'Status: Success');
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchUser();
    }, []);

    // Handle WebSocket connection and subscription to recipient status
    useEffect(() => {
        if (!currentUser) return;

        const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('Authorization='))
            ?.split('=')[1];

        if (!token) {
            console.error('Authorization token is missing');
            return;
        }

        const handleWebSocketConnect = () => {
            setStompClient(WebSocketService.client);

            // Initialize chat messages and handle incoming/sent messages
            ChatManager.initializeChat(
                WebSocketService.client,
                (msg) => setMessages((prev) => [...prev, msg]), // Incoming messages
                (msg) => setMessages((prev) => [...prev, msg]), // Sent messages
                currentUser.id
            );

            // Subscribe to recipient's online/offline status
            const statusSubscription = OnlineStatusService.subscribeToStatusUpdates(
                WebSocketService.client,
                recipientId,
                (isOnline) => {
                    console.log("Recipient's status updated:", isOnline);
                    setStatus(isOnline);
                }
            );

            return () => {
                statusSubscription?.unsubscribe?.();
            };
        };

        WebSocketService.connect(handleWebSocketConnect, (error) => {
            console.error('WebSocket Error:', error);
        }, token);

        return () => {
            if (WebSocketService.client?.connected) {
                WebSocketService.disconnect();
            } else {
                console.warn('WebSocket was not connected during cleanup.');
            }
        };
    }, [currentUser, recipientId]);

    // Request recipient's initial status after WebSocket connection is established
    useEffect(() => {
        if (stompClient) {
            OnlineStatusService.requestUserStatus(stompClient, recipientId);
        }
    }, [stompClient, recipientId]);

    const handleSendClick = () => {
        if (messageContent.trim() && currentUser) {
            const messageDTO = {
                senderId: currentUser, // Use currentUser ID
                receiverId: recipientId || null,
                content: messageContent,
            };

            console.log('Sending message:', messageDTO); // Debugging log
            ChatManager.sendMessage(stompClient, messageDTO);
            setMessageContent(''); // Clear message input
        }
    };

    return (
        <div className="chat-area">
            {/* Chat Header */}
            <div className="chat-header">
                <span className="chat-contact-name">
                    {recipientUsername || 'Public Chat'}
                </span>
                <br />
                <span className={`chat-status ${status.toLowerCase()}`}>
                    {status}
                </span>
            </div>

            {/* Message Display */}
            <div className="message-display">
                {messages.map((msg, index) => (
                    <><div
                        key={index}
                        className={
                            msg.senderId == currentUser
                                ? 'message-sent'
                                : 'message-received'
                        }
                    >
                        {msg.content}
                    </div><br/><br/></>
                ))}
            </div>

            {/* Input Area */}
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
