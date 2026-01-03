export interface ServiceStatus {
    name: string;
    status: string;
    details?: Record<string, any>;
    last_updated: string;
}

export interface SystemMetrics {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    uptime?: string;
}

export interface MonitoringData {
    status: string;
    service_name: string;
    version: string;
    timestamp: string;
    metrics?: SystemMetrics;
    services?: ServiceStatus[];
    details?: Record<string, any>;
}

export interface AgentStep {
    step_number: number;
    type: string;
    reasoning: string;
    tool_name: string;
    tool_parameters: any;
    tool_result: any;
    timestamp: string;
}

export interface AgentLoop {
    exists: boolean;
    user_id: string;
    user_message: string;
    final_response: string;
    completed: boolean;
    start_time: string;
    end_time: string;
    duration_seconds?: number;
    steps: AgentStep[];
    message?: string;
}
