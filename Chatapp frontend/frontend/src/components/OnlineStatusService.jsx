const OnlineStatusService = {
    subscribeToStatusUpdates(stompClient, recipientId, callback) {
        if (!stompClient) {
            console.error("WebSocket client is not initialized.");
            return null;
        }

        const subscription = stompClient.subscribe(`/topic/status`, (msg) => {
            const statusUpdate = msg.body;

            console.log("Raw status update received:", statusUpdate);

            try {
                // Check if the message is valid JSON
                const parsedUpdate = JSON.parse(statusUpdate);
                if (parsedUpdate != undefined) {
                    callback(parsedUpdate == true ? "Online" : "Offline");
                } else {
                    console.error("Unexpected JSON structure:", parsedUpdate);
                }
            } catch (error) {
                // Handle non-JSON messages
                console.log("Message is plain text:", statusUpdate);
                if (statusUpdate.trim() == "true" || statusUpdate.trim() === "false") {
                    callback(statusUpdate.trim() == "true" ? "Online" : "Offline");
                } else {
                    console.warn("Unrecognized status message:", statusUpdate);
                    callback("Offline");
                }
            }
        });

        return subscription;
    },

    requestUserStatus(stompClient, userId) {
        if (!stompClient || !stompClient.connected) {
            console.error("WebSocket client is not connected.");
            return;
        }
        if (!userId) {
            console.error("User ID is required to request status.");
            return;
        }
        console.log("Requesting user status for:", userId);
        stompClient.send('/app/topic/status', {}, JSON.stringify({ userId }));
    },
};

export default OnlineStatusService;
