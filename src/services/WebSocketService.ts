// WebSocketService.ts
import logService from './LogService';

class WebSocketService {
    private isConnected: boolean = false;
    private isRegistered: boolean = false;
    private listeners: Array<(message: any) => void> = [];
    private connectionListeners: Array<(connected: boolean) => void> = [];
    private statusListeners: Array<(status: { connected: boolean; registered: boolean }) => void> = [];
    private socket: WebSocket | null = null;
    private reconnectInterval: number = 3000;
    private url: string = "ws://localhost:9002";

    constructor() {
        this.init();
    }

    // Initialize the WebSocket service
    init() {
        console.log("WebSocketService: Initializing");
        logService.logInfo("WebSocketService: Initializing", {
            timestamp: new Date().toISOString()
        });
        this.connect();
    }

    // Connect to WebSocket server
    connect() {
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        console.log("WebSocketService: Connecting to " + this.url);
        try {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = () => {
                console.log("WebSocketService: Connected");
                this.isConnected = true;
                this.isRegistered = true; // Assumed registered upon connection for now, or wait for handshake
                this.notifyConnectionListeners(true);
                this.notifyStatusListeners({ connected: true, registered: true });

                logService.logInfo("WebSocketService: Connected", {
                    url: this.url,
                    timestamp: new Date().toISOString()
                });
            };

            this.socket.onclose = () => {
                console.log("WebSocketService: Disconnected");
                this.isConnected = false;
                this.isRegistered = false;
                this.notifyConnectionListeners(false);
                this.notifyStatusListeners({ connected: false, registered: false });

                logService.logInfo("WebSocketService: Disconnected", {
                    timestamp: new Date().toISOString()
                });

                // Auto reconnect
                setTimeout(() => this.connect(), this.reconnectInterval);
            };

            this.socket.onerror = (error) => {
                console.error("WebSocketService: Error", error);
                logService.logError("WebSocketService: Connection Error", { error });
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.notifyMessageListeners(data);
                    logService.logInfo("WebSocketService: Message received", {
                        payload: data,
                        timestamp: new Date().toISOString()
                    });
                } catch (e) {
                    // Handle non-JSON or binary if needed
                    console.log("WebSocketService: Received non-JSON message", event.data);
                    logService.logInfo("WebSocketService: Binary/Text message received", {
                        data: event.data,
                        timestamp: new Date().toISOString()
                    });
                    this.notifyMessageListeners(event.data);
                }
            };

        } catch (error) {
            console.error("WebSocketService: Failed to create WebSocket", error);
            setTimeout(() => this.connect(), this.reconnectInterval);
        }
    }

    // Disconnect from WebSocket server
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        this.isRegistered = false;
    }

    // Send a message
    send(message: string | object) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const payload = typeof message === 'string' ? message : JSON.stringify(message);
            this.socket.send(payload);
            logService.logInfo("WebSocketService: Sent message", { message: payload });
        } else {
            console.warn("WebSocketService: Cannot send, socket not open");
            logService.logError("WebSocketService: Failed to send, socket closed");
        }
    }

    // Check if WebSocket is connected
    getIsConnected(): boolean {
        return this.isConnected;
    }

    // Check if WebSocket is registered
    getIsRegistered(): boolean {
        return this.isRegistered;
    }

    // Add a message listener
    addMessageListener(listener: (message: any) => void) {
        this.listeners.push(listener);
    }

    // Remove a message listener
    removeMessageListener(listener: (message: any) => void) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Add a connection status listener
    addConnectionListener(listener: (connected: boolean) => void) {
        this.connectionListeners.push(listener);
    }

    // Remove a connection status listener
    removeConnectionListener(listener: (connected: boolean) => void) {
        const index = this.connectionListeners.indexOf(listener);
        if (index !== -1) {
            this.connectionListeners.splice(index, 1);
        }
    }

    // Add a status listener
    addStatusListener(listener: (status: { connected: boolean; registered: boolean }) => void) {
        this.statusListeners.push(listener);
    }

    // Remove a status listener
    removeStatusListener(listener: (status: { connected: boolean; registered: boolean }) => void) {
        const index = this.statusListeners.indexOf(listener);
        if (index !== -1) {
            this.statusListeners.splice(index, 1);
        }
    }

    // Notify all message listeners
    private notifyMessageListeners(message: any) {
        this.listeners.forEach(listener => {
            listener(message);
        });
    }

    // Notify all connection listeners
    private notifyConnectionListeners(connected: boolean) {
        this.connectionListeners.forEach(listener => {
            listener(connected);
        });
    }

    // Notify all status listeners
    private notifyStatusListeners(status: { connected: boolean; registered: boolean }) {
        this.statusListeners.forEach(listener => {
            listener(status);
        });
    }
}

// Create a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
