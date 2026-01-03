import React from "react";

interface ServiceStatus {
    name: string;
    status: string;
    details?: Record<string, any>;
    last_updated: string;
}

interface ServiceCardProps {
    service: ServiceStatus;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
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

    // Tailwind adaptation for status colors
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
                <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(service.status)}`}></span>
                    <span className={`text-sm font-medium ${getStatusTextColor(service.status)}`}>{service.status}</span>
                </div>
            </div>
            <div className="mb-3 text-zinc-300 text-sm">
                {service.details && Object.keys(service.details).length > 0 ? (
                    <ul className="space-y-1">
                        {Object.entries(service.details)
                            .filter(([key]) => key !== "tool_count") // Don't show tool count
                            .map(([key, value]) => (
                                <li key={key}>
                                    <strong className="text-zinc-400">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p className="text-zinc-500 italic">No additional details</p>
                )}
            </div>
            <div className="text-xs text-zinc-500 mt-2 border-t border-zinc-700 pt-2">
                Last updated: {new Date(service.last_updated).toLocaleString()}
            </div>
        </div>
    );
};

export default ServiceCard;
