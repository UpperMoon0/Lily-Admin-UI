import React, { useState, useEffect, useRef } from "react";
import logService, { type LogEntry } from "../services/LogService";
import webSocketService from "../services/WebSocketService";
import { type AgentLoop, type MonitoringData } from "../types/monitor";
import GeneralTab from "./monitor/GeneralTab";
import AgentLoopTab from "./monitor/AgentLoopTab";
import LogTab from "./monitor/LogTab";

const Monitor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"general" | "agent" | "log">("general");
    const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
    const [agentLoopData, setAgentLoopData] = useState<AgentLoop | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [logFilter, setLogFilter] = useState<string>("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [agentLoopLoading, setAgentLoopLoading] = useState<boolean>(true);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isRegistered, setIsRegistered] = useState<boolean>(false);

    // Refs
    const scrollPositionRef = useRef(0);
    const lastNonZeroScrollRef = useRef(0);
    const monitorContainerRef = useRef<HTMLDivElement>(null);

    // Set up WebSocket status listener
    useEffect(() => {
        const handleConnectionChange = (connected: boolean) => {
            setIsConnected(connected);
            if (!connected) {
                setIsRegistered(false);
            }
        };

        webSocketService.addConnectionListener(handleConnectionChange);
        setIsConnected(webSocketService.getIsConnected());
        setIsRegistered(webSocketService.getIsRegistered());

        const handleStatusChange = (status: { connected: boolean; registered: boolean }) => {
            setIsConnected(status.connected);
            setIsRegistered(status.registered);
        };
        webSocketService.addStatusListener(handleStatusChange);

        return () => {
            webSocketService.removeConnectionListener(handleConnectionChange);
            webSocketService.removeStatusListener(handleStatusChange);
        };
    }, []);

    const fetchMonitoringData = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/monitoring");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: MonitoringData = await response.json();
            if (JSON.stringify(data) !== JSON.stringify(monitoringData)) {
                setMonitoringData(data);
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching monitoring data:", err);
            setError("Failed to connect to Lily-Core. Retrying automatically...");
        } finally {
            setLoading(false);
        }
    };

    // Fetch logs from log service
    useEffect(() => {
        const listener = (updatedLogs: LogEntry[]) => {
            const filtered = logFilter === "all"
                ? updatedLogs
                : updatedLogs.filter(log => log.type === logFilter);
            setLogs(filtered);
        };

        logService.registerListener(listener);

        return () => {
            logService.unregisterListener(listener);
        };
    }, [logFilter]);

    const fetchAgentLoopData = async () => {
        // Save detailed scroll state
        const container = monitorContainerRef.current;
        const preFetchScroll = container ? container.scrollTop : 0;

        if (activeTab === "agent") {
            scrollPositionRef.current = preFetchScroll;
            if (preFetchScroll > 0) {
                lastNonZeroScrollRef.current = preFetchScroll;
            }
        }

        if (!agentLoopData) {
            setAgentLoopLoading(true);
        }

        try {
            // Use port 8000 for standard HTTP endpoints if defined in previous repo
            const response = await fetch("http://localhost:8000/agent-loops");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AgentLoop = await response.json();

            if (JSON.stringify(data) !== JSON.stringify(agentLoopData)) {
                setAgentLoopData(() => data);
            }
        } catch (err) {
            console.error("Error fetching agent loop data:", err);
        } finally {
            if (agentLoopLoading) {
                setAgentLoopLoading(false);
            }
        }
    };

    useEffect(() => {
        // Restore scroll
        const savedScroll = parseInt(sessionStorage.getItem('agentScrollPosition') || '0', 10);
        const savedLastNonZero = parseInt(sessionStorage.getItem('agentLastNonZeroScroll') || '0', 10);
        if (savedScroll > 0) {
            scrollPositionRef.current = savedScroll;
        }
        if (savedLastNonZero > 0) {
            lastNonZeroScrollRef.current = savedLastNonZero;
        }

        fetchMonitoringData();
        fetchAgentLoopData();

        const intervalId = setInterval(() => {
            fetchMonitoringData();
        }, 10000);
        const agentLoopIntervalId = setInterval(() => {
            fetchAgentLoopData();
        }, 5000);

        return () => {
            clearInterval(intervalId);
            clearInterval(agentLoopIntervalId);
        };
    }, [activeTab]);

    useEffect(() => {
        const handleScroll = () => {
            if (activeTab === "agent" && monitorContainerRef.current) {
                const currentScroll = monitorContainerRef.current.scrollTop;
                scrollPositionRef.current = currentScroll;
                if (currentScroll > 0) {
                    lastNonZeroScrollRef.current = currentScroll;
                }
            }
        };

        const container = monitorContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [activeTab]);

    const clearLogs = () => {
        logService.clearLogs();
    };

    if (loading && !monitoringData && !error) {
        return (
            <div className="min-h-screen bg-zinc-900 text-white p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-zinc-700 border-t-white rounded-full animate-spin mb-4"></div>
                <div className="text-xl text-zinc-400">Loading monitoring data...</div>
            </div>
        );
    }

    if (error && !monitoringData) {
        return (
            <div className="min-h-screen bg-zinc-900 text-white p-8 flex items-center justify-center">
                <div className="bg-zinc-800 border border-red-500/50 rounded-xl p-8 max-w-lg w-full text-center shadow-lg shadow-red-900/10">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Connection Error</h2>
                    <p className="text-zinc-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-zinc-900 text-white flex flex-col overflow-hidden" ref={monitorContainerRef}>
            {/* Header */}
            <div className="bg-zinc-800/50 border-b border-zinc-700 p-6 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">System Monitoring</h1>
                <div className="text-sm text-zinc-400 font-mono bg-zinc-900 rounded-full px-3 py-1 border border-zinc-700">
                    Last updated: {monitoringData?.timestamp ? new Date(monitoringData.timestamp).toLocaleString() : "N/A"}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 border-b border-zinc-700 bg-zinc-800/30">
                <div className="flex gap-2">
                    {["general", "agent", "log"].map((tab) => (
                        <button
                            key={tab}
                            className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 relative top-[1px] ${activeTab === tab
                                ? "border-blue-500 text-blue-400 bg-zinc-800/50 rounded-t-lg"
                                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 rounded-t-lg"
                                }`}
                            onClick={() => setActiveTab(tab as any)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1) + (tab === 'agent' ? ' Loop' : '')}
                        </button>
                    ))}
                </div>
            </div>

            {monitoringData && (
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {activeTab === "general" && (
                        <GeneralTab
                            monitoringData={monitoringData}
                            isConnected={isConnected}
                            isRegistered={isRegistered}
                        />
                    )}

                    {activeTab === "agent" && (
                        <AgentLoopTab
                            agentLoopData={agentLoopData}
                            agentLoopLoading={agentLoopLoading}
                        />
                    )}

                    {activeTab === "log" && (
                        <LogTab
                            logs={logs}
                            logFilter={logFilter}
                            setLogFilter={setLogFilter}
                            clearLogs={clearLogs}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default Monitor;
