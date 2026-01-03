import React from "react";
import ServiceCard from "../ServiceCard";
import MCPServiceCard from "../MCPServiceCard";
import { type MonitoringData } from "../../types/monitor";

interface GeneralTabProps {
    monitoringData: MonitoringData;
    isConnected: boolean;
    isRegistered: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ monitoringData, isConnected, isRegistered }) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "healthy":
                return "bg-green-500";
            case "degraded":
                return "bg-yellow-500";
            case "down":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "healthy":
                return "text-green-500";
            case "degraded":
                return "text-yellow-500";
            case "down":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    const formatUptime = (uptime: string | undefined) => {
        if (!uptime) return "N/A";
        if (uptime.includes(":")) return uptime;
        const seconds = parseInt(uptime, 10);
        if (isNaN(seconds)) return uptime;

        const days = Math.floor(seconds / (24 * 3600));
        const hours = Math.floor((seconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall System Status */}
                <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 shadow-lg relative overflow-hidden group hover:border-zinc-600 transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <h2 className="text-lg font-semibold mb-4 text-zinc-200">Overall System Status</h2>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/50 mb-4`}>
                        <span className={`w-3 h-3 rounded-full ${getStatusColor(monitoringData.status)} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></span>
                        <span className={`font-medium ${getStatusTextColor(monitoringData.status)}`}>{monitoringData.status}</span>
                    </div>
                    <div className="space-y-2 text-sm text-zinc-400">
                        <p><strong className="text-zinc-300">Service:</strong> {monitoringData.service_name}</p>
                        <p><strong className="text-zinc-300">Version:</strong> {monitoringData.version}</p>
                    </div>
                </div>

                {/* WebSocket Connection Status */}
                <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 shadow-lg relative overflow-hidden group hover:border-zinc-600 transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <h2 className="text-lg font-semibold mb-4 text-zinc-200">WebSocket Connection</h2>
                    <div className="flex items-center">
                        {isConnected ? (
                            <span className="inline-flex items-center gap-2 text-green-400 bg-green-900/20 px-3 py-1.5 rounded-full border border-green-900/50">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Connected {isRegistered ? "(Registered)" : "(Not Registered)"}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-2 text-red-400 bg-red-900/20 px-3 py-1.5 rounded-full border border-red-900/50">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Disconnected
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* System Metrics */}
            {monitoringData.metrics && (
                <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span>📊</span> System Metrics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {monitoringData.metrics.cpu_usage !== undefined && (
                            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
                                <h3 className="text-zinc-400 text-sm mb-2">CPU Usage</h3>
                                <div className="text-2xl font-bold font-mono mb-2">{monitoringData.metrics.cpu_usage.toFixed(1)}%</div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(monitoringData.metrics.cpu_usage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {monitoringData.metrics.memory_usage !== undefined && (
                            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
                                <h3 className="text-zinc-400 text-sm mb-2">Memory Usage</h3>
                                <div className="text-2xl font-bold font-mono mb-2">{monitoringData.metrics.memory_usage.toFixed(1)}%</div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(monitoringData.metrics.memory_usage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {monitoringData.metrics.disk_usage !== undefined && (
                            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
                                <h3 className="text-zinc-400 text-sm mb-2">Disk Usage</h3>
                                <div className="text-2xl font-bold font-mono mb-2">{monitoringData.metrics.disk_usage.toFixed(1)}%</div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(monitoringData.metrics.disk_usage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {monitoringData.metrics.uptime && (
                            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
                                <h3 className="text-zinc-400 text-sm mb-2">Uptime</h3>
                                <div className="text-xl font-bold font-mono text-zinc-200 truncate" title={formatUptime(monitoringData.metrics.uptime)}>
                                    {formatUptime(monitoringData.metrics.uptime)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Services Status */}
            {monitoringData.services && monitoringData.services.length > 0 && (
                <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span>🔌</span> Services Status
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {monitoringData.services
                            .filter(service => service.name !== "Tool Discovery Service" && service.name !== "MCP Services Summary")
                            .map((service, index) => (
                                <ServiceCard key={index} service={service} />
                            ))}
                    </div>
                </div>
            )}

            {/* MCP Servers Section */}
            {monitoringData.services && monitoringData.services.some(service => service.name === "MCP Services Summary") && (
                <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700">
                    {monitoringData.services
                        .filter(service => service.name === "MCP Services Summary")
                        .map((summaryService, summaryIndex) => (
                            <div key={summaryIndex} className="mb-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <span>🧩</span> MCP Servers
                                </h2>
                                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-xl font-semibold text-white">{summaryService.name}</h3>
                                    </div>
                                    <div className="mb-3 text-zinc-300 text-sm flex gap-6">
                                        {summaryService.details && summaryService.details.active_mcp_servers && (
                                            <div><strong className="text-zinc-400">Active Servers:</strong> {summaryService.details.active_mcp_servers}</div>
                                        )}
                                        {summaryService.details && summaryService.details.total_tools && (
                                            <div><strong className="text-zinc-400">Total Tools:</strong> {summaryService.details.total_tools}</div>
                                        )}
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
                                        Last updated: {new Date(summaryService.last_updated).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}

                    {/* Individual MCP Server Entries with Tools */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {monitoringData.services
                            .filter(service => service.name !== "MCP Services Summary" && service.details && service.details.type === "MCP Server")
                            .map((service, index) => (
                                <MCPServiceCard key={index} service={service} showStatus={false} />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralTab;
