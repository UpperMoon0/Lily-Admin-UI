// LogService.ts

export interface LogEntry {
    id: string;
    timestamp: Date;
    type: string;
    message: string;
    details?: any;
}

class LogService {
    private listeners: Array<(logs: LogEntry[]) => void> = [];
    private logs: LogEntry[] = [];
    private maxLogs: number = 1000;

    // Register a listener to receive log updates
    registerListener(listener: (logs: LogEntry[]) => void) {
        this.listeners.push(listener);
        // Send current logs to the new listener
        listener(this.logs);
    }

    // Unregister a listener
    unregisterListener(listener: (logs: LogEntry[]) => void) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Add a log entry locally
    addLogEntry(type: string, message: string, details?: any) {
        const entry: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            type,
            message,
            details
        };

        this.logs = [entry, ...this.logs].slice(0, this.maxLogs);
        this.notifyListeners();
    }

    // Get all log entries
    getLogs(): LogEntry[] {
        return this.logs;
    }

    // Clear all log entries
    clearLogs() {
        this.logs = [];
        this.notifyListeners();
    }

    // Notify all listeners
    private notifyListeners() {
        this.listeners.forEach(listener => {
            listener(this.logs);
        });
    }

    // Log chat sent event
    logChatSent(message: string, details?: any) {
        this.addLogEntry('chat_sent', `Chat message sent: ${message}`, details);
    }

    // Log chat response received event
    logChatResponse(response: string, details?: any) {
        this.addLogEntry('chat_response', `Chat response received: ${response}`, details);
    }

    // Log TTS response received event
    logTTSResponse(details?: any) {
        this.addLogEntry('tts_response', 'TTS response received', details);
    }

    // Log info event
    logInfo(message: string, details?: any) {
        this.addLogEntry('info', message, details);
    }

    // Log error event
    logError(message: string, details?: any) {
        this.addLogEntry('error', message, details);
    }

    // Log debug event
    logDebug(message: string, details?: any) {
        this.addLogEntry('debug', message, details);
    }
}

// Create a singleton instance
const logService = new LogService();
export default logService;
