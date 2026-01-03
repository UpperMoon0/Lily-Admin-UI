import React from "react";
import { type LogEntry } from "../../services/LogService";

interface LogTabProps {
    logs: LogEntry[];
    logFilter: string;
    setLogFilter: (filter: string) => void;
    clearLogs: () => void;
}

const LogTab: React.FC<LogTabProps> = ({ logs, logFilter, setLogFilter, clearLogs }) => {
    const formatTimestamp = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getLogIcon = (type: LogEntry["type"]) => {
        switch (type) {
            case "chat_sent":
                return "📤";
            case "chat_response":
                return "📥";
            case "tts_response":
                return "🔊";
            case "error":
                return "❌";
            default:
                return "ℹ️";
        }
    };

    const getLogTypeColor = (type: LogEntry["type"]) => {
        switch (type) {
            case "chat_sent":
                return "border-l-blue-600";
            case "chat_response":
                return "border-l-green-500";
            case "tts_response":
                return "border-l-orange-500";
            case "error":
                return "border-l-red-500";
            default:
                return "border-l-gray-500";
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span>📜</span> System Logs
            </h2>
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 flex flex-col flex-1 overflow-hidden shadow-lg">
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-700 flex flex-wrap gap-4 items-center justify-between">
                    <select
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value)}
                        className="bg-zinc-800 text-zinc-200 border border-zinc-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="all">All Events</option>
                        <option value="chat_sent">Chat Sent</option>
                        <option value="chat_response">Chat Response</option>
                        <option value="tts_response">TTS Response</option>
                        <option value="info">Info</option>
                        <option value="error">Error</option>
                    </select>
                    <button
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-sm font-medium transition-all"
                        onClick={clearLogs}
                    >
                        Clear Logs
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-zinc-950/30 font-mono text-sm">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                            <p>No log entries yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div key={log.id} className={`bg-zinc-800 p-4 rounded-lg border border-zinc-700 flex flex-col md:flex-row gap-4 ${getLogTypeColor(log.type)}`}>
                                    <div className="flex items-center gap-3 md:w-48 text-zinc-500 text-xs shrink-0 border-b md:border-b-0 md:border-r border-zinc-700 pb-2 md:pb-0">
                                        <span>{formatTimestamp(log.timestamp)}</span>
                                        <span className="text-xl">{getLogIcon(log.type)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-zinc-300 break-words mb-2">{log.message}</div>
                                        {log.details && (
                                            <div className="bg-black/30 p-3 rounded text-xs text-zinc-400 overflow-x-auto">
                                                <pre>{typeof log.details === "object"
                                                    ? JSON.stringify(log.details, null, 2)
                                                    : log.details}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogTab;
