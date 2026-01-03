import React from "react";

interface ServiceStatus {
    name: string;
    status: string;
    details?: Record<string, any>;
    last_updated: string;
}

interface MCPServiceCardProps {
    service: ServiceStatus;
    showStatus?: boolean;
}

const MCPServiceCard: React.FC<MCPServiceCardProps> = ({ service, showStatus = true }) => {
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
                return "text-green-400";
            case "degraded":
                return "text-yellow-400";
            case "down":
                return "text-red-400";
            default:
                return "text-gray-400";
        }
    }

    return (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-md">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                {showStatus && (
                    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700">
                        <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(service.status)}`}></span>
                        <span className={`text-sm font-medium ${getStatusTextColor(service.status)}`}>{service.status}</span>
                    </div>
                )}
            </div>
            <div className="mb-3 text-zinc-300 text-sm">
                {service.details && Object.keys(service.details).length > 0 ? (
                    <ul className="space-y-1">
                        {Object.entries(service.details)
                            .filter(([key]) => key !== "tools") // Filter out tools for now, we'll display them separately
                            .map(([key, value]) => (
                                <li key={key}>
                                    <strong className="text-zinc-400">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p className="text-zinc-500 italic">No additional details</p>
                )}

                {/* Tools section */}
                {service.details && service.details.tools && (
                    <div className="mt-4">
                        <h4 className="mb-2 text-zinc-200 font-medium flex items-center gap-2 text-base">
                            <span>🛠️</span>
                            Available Tools ({service.details.tool_count || service.details.tools.split("|").length})
                        </h4>
                        <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-700/50 grid gap-3">
                            {service.details.tools.split("|").map((toolInfo: string, toolIndex: number) => {
                                const parts = toolInfo.split(":");
                                const name = parts[0] || "Unnamed Tool";
                                const description = parts[1] || "";
                                return (
                                    <div key={toolIndex} className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700 transition-all hover:bg-zinc-700/80 hover:-translate-y-0.5 hover:shadow-lg group">
                                        <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600/30 transition-colors">
                                            <span className="text-lg">🔧</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <strong className="text-zinc-200 text-sm block mb-1">
                                                {name}
                                            </strong>
                                            <p className="text-zinc-400 text-xs m-0 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                                {description || "No description available"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
                Last updated: {new Date(service.last_updated).toLocaleString()}
            </div>
        </div>
    );
};

export default MCPServiceCard;
