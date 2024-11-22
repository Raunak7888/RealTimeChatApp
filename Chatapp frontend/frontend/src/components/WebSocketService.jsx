// src/components/WebSocketService.js
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const WebSocketService = {
    client: null,

    connect(onConnected, onMessageReceived, token) {
        const socket = new SockJS('http://localhost:8080/chat');
        this.client = Stomp.over(socket);

        const headers = token ? { Authorization: token } : {};
        
        this.client.connect(headers, () => {
            console.log('Connected to WebSocket');
            onConnected();
        }, (error) => console.error('Connection error:', error));
    },

    disconnect() {
        if (this.client) {
            this.client.disconnect();
        }
    },

    subscribe(destination, callback) {
        if (this.client) {
            return this.client.subscribe(destination, (msg) => callback(JSON.parse(msg.body)));
        }
    },

    send(destination, message) {
        if (this.client && this.client.connected) {
            this.client.send(destination, {}, JSON.stringify(message));
        }
    },
};

export default WebSocketService;
