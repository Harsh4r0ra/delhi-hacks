/**
 * SystemOverview — Shows current ByzantineMind system config:
 * mode (fast/full), BFT parameters, agent model assignments.
 * Uses GET /api/config and GET /api/agents.
 */

import { useEffect, useState } from "react";
import { Shield, Cpu, Brain, Activity, Zap, Lock } from "lucide-react";
import { api, type ConfigResponse, type AgentStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const PROVIDER_META: Record<string, { icon: string; color: string; bg: string }> = {
    Mistral: { icon: "M", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
    Groq: { icon: "G", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    DeepSeek: { icon: "🐋", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    Cerebras: { icon: "C", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
    Simulated: { icon: "S", color: "text-muted-foreground", bg: "bg-muted/10 border-border/20" },
};

function getProviderMeta(modelId: string) {
    for (const [key, val] of Object.entries(PROVIDER_META)) {
        if (modelId.toLowerCase().includes(key.toLowerCase())) return { ...val, name: key };
    }
    return { ...PROVIDER_META.Simulated, name: "Unknown" };
}

interface Props {
    agents: AgentStatus[];
}

export default function SystemOverview({ agents }: Props) {
    const [config, setConfig] = useState<ConfigResponse | null>(null);

    useEffect(() => {
        api.getConfig().then(setConfig).catch(() => null);
    }, []);

    const isFullMode = config?.mode === "full";

    return (
        <div className="space-y-6">
            {/* Mode Banner */}
            <div
                className={cn(
                    "glass-card flex items-center gap-4 p-4 border",
                    isFullMode
                        ? "border-primary/30 bg-primary/5"
                        : "border-amber-400/30 bg-amber-400/5"
                )}
            >
                <div className={cn("rounded-xl p-3", isFullMode ? "bg-primary/10" : "bg-amber-400/10")}>
                    {isFullMode ? (
                        <Brain className={cn("h-6 w-6", "text-primary")} />
                    ) : (
                        <Zap className="h-6 w-6 text-amber-400" />
                    )}
                </div>
                <div>
                    <p className={cn("font-bold text-sm", isFullMode ? "text-primary" : "text-amber-400")}>
                        {isFullMode ? "Full-Depth Mode — Real LLM Agents" : "⚡ Fast Mode — Simulated Agents"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {isFullMode
                            ? "All 4 nodes are powered by distinct commercial LLM providers for true cognitive diversity."
                            : "SimulatedAgent used for instant demos. Set MODE=full in .env for real model inference."}
                    </p>
                </div>
            </div>

            {/* BFT Parameters */}
            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    BFT Configuration
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: "Total Agents (n)", value: config?.n_agents ?? 4, icon: Cpu },
                        { label: "Fault Tolerance (f)", value: config?.f_faults ?? 1, icon: Shield },
                        { label: "Quorum Required", value: config?.quorum_size ?? 3, icon: Lock },
                        { label: "Formula", value: "n = 3f + 1", icon: Activity },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="glass-card p-4 text-center">
                            <Icon className="mx-auto mb-2 h-5 w-5 text-primary/60" />
                            <p className="text-2xl font-black text-foreground">{value}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Agent Model Registry */}
            <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Consensus Node Registry
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {agents.map((agent, idx) => {
                        const provider = getProviderMeta(agent.model_id);
                        return (
                            <div key={agent.agent_id} className="glass-card p-4 space-y-3">
                                {/* Node number + status dot */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        Node {idx + 1}
                                    </span>
                                    <span
                                        className={cn(
                                            "h-2 w-2 rounded-full",
                                            agent.status === "ONLINE"
                                                ? "bg-primary animate-pulse"
                                                : agent.status === "FAULTY"
                                                    ? "bg-amber-400"
                                                    : "bg-destructive"
                                        )}
                                    />
                                </div>

                                {/* Provider badge */}
                                <div className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-2 w-full", provider.bg)}>
                                    <span className={cn("text-base font-black", provider.color)}>{provider.icon}</span>
                                    <div>
                                        <p className={cn("text-xs font-bold", provider.color)}>{provider.name}</p>
                                        <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[130px]">
                                            {agent.model_id}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>✓ {agent.successful_participations} approved</span>
                                    <span>✗ {agent.failed_participations} failed</span>
                                </div>

                                {agent.fault && (
                                    <div className="rounded bg-destructive/10 px-2 py-1 text-[10px] font-mono text-destructive">
                                        FAULT: {agent.fault}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* What is PBFT explainer */}
            <div className="glass-card p-5 space-y-3 border border-border/30">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    How Byzantine Fault Tolerance Works
                </h3>
                <div className="grid gap-4 text-xs text-muted-foreground sm:grid-cols-3">
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">Pre-Prepare</p>
                        <p>The primary leader broadcasts the action proposal to all replica nodes for initial acknowledgment.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">Prepare</p>
                        <p>Each replica independently evaluates the request and broadcasts its signed vote to all peers.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="font-semibold text-foreground">Commit</p>
                        <p>Once 2f+1 prepare votes are collected, the quorum commits. A cryptographic certificate is issued.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
