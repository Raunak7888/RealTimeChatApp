// Ok.js (App component)
import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

function Ok() {
    const [selectedUserId, setSelectedUserId] = useState(null); // Initially, no user is selected
    const [selectedUsername, setSelectedUsername] = useState(null); // Initially, no user is selected

    // Handle user selection (this would be triggered when a user is selected from the chat list)
    const handleUserSelect = (userId, username) => {
        console.log('Selected User:', userId, username); // Debug log
        setSelectedUserId(userId);
        setSelectedUsername(username);
    };
    

    return (
        <div className="chat-container">
            <div className="sidebar">
                <ChatList onUserSelect={handleUserSelect} />
            </div>
            <div className="chat-area">
                {selectedUserId && selectedUsername && (
                    <ChatWindow 
                        recipientId={selectedUserId}
                        recipientUsername={selectedUsername} 
                    />
                )}
                {/* Optionally, you can show a message like "Select a user to start chatting" if no user is selected */}
            </div>
        </div>
    );
}

export default Ok;
