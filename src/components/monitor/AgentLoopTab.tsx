import React from "react";
import { type AgentLoop } from "../../types/monitor";

interface AgentLoopTabProps {
    agentLoopData: AgentLoop | null;
    agentLoopLoading: boolean;
}

const AgentLoopTab: React.FC<AgentLoopTabProps> = ({ agentLoopData, agentLoopLoading }) => {
    const formatStepIcon = (type: string) => {
        switch (type) {
            case "tool_call":
                return "🛠️";
            case "reasoning":
                return "💭";
            case "response":
                return "💬";
            default:
                return "📝";
        }
    };

    const formatStepType = (type: string) => {
        switch (type) {
            case "tool_call":
                return "Tool Call";
            case "reasoning":
                return "Reasoning";
            case "response":
                return "Response";
            default:
                return type;
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span>🤖</span> Agent Loop Trace
            </h2>
            {agentLoopLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mb-3"></div>
                    <div className="text-zinc-400">Loading agent loop data...</div>
                </div>
            ) : agentLoopData && agentLoopData.exists ? (
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden shadow-xl">
                    {/* Agent Header */}
                    <div className="p-6 border-b border-zinc-700 bg-zinc-900/50">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Latest Interaction
                            </h3>
                            <div className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                                {agentLoopData.duration_seconds !== undefined ? `${agentLoopData.duration_seconds.toFixed(2)}s` : ''}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-2"><span className="text-zinc-600">User:</span> <span className="text-zinc-200">{agentLoopData.user_id}</span></span>
                            <span className="flex items-center gap-2"><span className="text-zinc-600">Started:</span> <span className="text-zinc-200">{new Date(agentLoopData.start_time).toLocaleString()}</span></span>
                            <span className="flex items-center gap-2"><span className="text-zinc-600">Completed:</span>
                                <span className={agentLoopData.completed ? "text-green-400" : "text-yellow-400"}>{agentLoopData.completed ? "Yes" : "No"}</span>
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* User Message */}
                        <div className="bg-gradient-to-br from-blue-900/20 to-zinc-900 border-l-4 border-blue-500 rounded-r-lg p-4 mb-8 shadow-sm">
                            <strong className="text-blue-400 block mb-1 text-xs uppercase tracking-wider">User Input</strong>
                            <div className="text-zinc-100 text-lg">{agentLoopData.user_message}</div>
                        </div>

                        <div className="mb-8">
                            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                Execution Steps
                                <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{agentLoopData.steps.length}</span>
                            </h4>

                            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-700">
                                {agentLoopData.steps.map((step, index) => (
                                    <div key={index} className="relative group">
                                        {/* Step Indicator Dot */}
                                        <div className="absolute -left-[29px] top-4 w-6 h-6 rounded-full bg-zinc-800 border-4 border-zinc-900 shadow-sm z-10 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        </div>

                                        <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-xl p-5 hover:border-zinc-600 transition-all hover:bg-zinc-800 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3 border-b border-zinc-700/50 pb-3">
                                                <div className="p-2 bg-zinc-700/30 rounded-lg text-lg">
                                                    {formatStepIcon(step.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-blue-400">Step {step.step_number}</span>
                                                        <span className="bg-zinc-700/50 px-2 py-0.5 rounded text-xs text-zinc-300">{formatStepType(step.type)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div className="text-xs uppercase text-zinc-500 font-bold mb-1">Reasoning</div>
                                                <div className="text-zinc-300 leading-relaxed text-sm bg-zinc-900/30 p-3 rounded-lg">
                                                    {step.reasoning}
                                                </div>
                                            </div>

                                            {step.type === "tool_call" && (
                                                <div className="bg-black/20 rounded-lg border border-zinc-700/50 overflow-hidden text-sm">
                                                    <div className="px-3 py-2 bg-black/20 border-b border-zinc-700/50 flex items-center justify-between">
                                                        <strong className="text-purple-300">Tool: {step.tool_name}</strong>
                                                    </div>
                                                    <div className="p-3 font-mono text-xs overflow-x-auto">
                                                        {step.tool_parameters && Object.keys(step.tool_parameters).length > 0 && (
                                                            <div className="mb-2">
                                                                <div className="text-zinc-500 mb-1">Params:</div>
                                                                <div className="text-zinc-300 whitespace-pre-wrap">{JSON.stringify(step.tool_parameters, null, 2)}</div>
                                                            </div>
                                                        )}
                                                        {step.tool_result && (
                                                            <div>
                                                                <div className="text-zinc-500 mb-1">Result:</div>
                                                                <div className="text-green-300/80 whitespace-pre-wrap">{JSON.stringify(step.tool_result, null, 2)}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-xs text-zinc-600 mt-3 text-right">
                                                {new Date(step.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {agentLoopData.completed && (
                            <div className="bg-gradient-to-br from-green-900/10 to-zinc-800 border-l-4 border-green-500 rounded-r-lg p-5 shadow-sm mt-8">
                                <h4 className="flex items-center gap-2 text-green-500 font-bold mb-3">
                                    <span>✨</span> Final Response
                                </h4>
                                <div className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{agentLoopData.final_response}</div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-zinc-800/30 border border-zinc-700/50 rounded-xl">
                    <div className="text-6xl mb-6 opacity-30">🤖</div>
                    <h3 className="text-xl font-bold text-zinc-300 mb-2">No Agent Loop Data</h3>
                    <p className="text-zinc-500">Waiting for agent activity...</p>
                </div>
            )}
        </div>
    );
};

export default AgentLoopTab;
