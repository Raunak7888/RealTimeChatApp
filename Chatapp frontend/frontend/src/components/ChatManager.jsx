// src/components/ChatManager.js

const ChatManager = {
    initializeChat(stompClient, onPublicMessageReceived, onPrivateMessageReceived, currentUser) {
        // Subscribe to public messages
        stompClient.subscribe('/topic/messages', (msg) => {
            const message = JSON.parse(msg.body);
            onPublicMessageReceived(message);
        });

        // Subscribe to private messages for the current user
        stompClient.subscribe(`/user/${currentUser}/queue/private`, (msg) => {
            const message = JSON.parse(msg.body);
            onPrivateMessageReceived(message);
        });
    },

    sendMessage(stompClient, messageDTO) {
        if (stompClient && messageDTO) {
            stompClient.send('/app/send/message', {}, JSON.stringify(messageDTO));
        }
    },
};

export default ChatManager;
