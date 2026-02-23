import { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, Cpu, Activity, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReplayProps {
    round: any; // PBFT round state from websocket
}

export default function ConsensusReplay({ round }: ReplayProps) {
    const [activePhase, setActivePhase] = useState<number>(0);
    const [logs, setLogs] = useState<string[]>([]);

    // Simulation of PBFT progression based on round state
    useEffect(() => {
        if (!round) {
            setActivePhase(0);
            setLogs([]);
            return;
        }

        const newLogs: string[] = [];
        let phase = 0;

        // Phase 1: Pre-Prepare
        if (round.status !== "IDLE") {
            phase = 1;
            newLogs.push("PRE-PREPARE: Leader broadcasting request to replicas.");
        }

        // Phase 2: Prepare (Waiting for 2f+1)
        if (round.status === "CONSENSUS_REACHED" || Object.keys(round.agent_results || {}).length > 0) {
            phase = 2;
            const responses = Object.keys(round.agent_results || {}).length;
            newLogs.push(`PREPARE: Receiving responses... (${responses} agents replied)`);
        }

        // Phase 3: Commit (Quorum Reached)
        if (round.status === "CONSENSUS_REACHED") {
            phase = 3;
            newLogs.push(`COMMIT: Quorum reached. Decision: ${round.consensus_decision}`);
        }

        setActivePhase(phase);
        setLogs(newLogs);
    }, [round]);

    const phases = [
        { title: "Idle", icon: Activity, desc: "Waiting for intent..." },
        { title: "Pre-Prepare", icon: Unlock, desc: "Leader proposes blocks" },
        { title: "Prepare", icon: Cpu, desc: "Replicas validate & hash" },
        { title: "Commit", icon: Lock, desc: "Quorum threshold met" }
    ];

    if (!round) return null;

    return (
        <div className="glass-card p-6 space-y-6 animate-in fade-in run-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Real-Time PBFT Replay
                </h3>
                {activePhase === 3 && (
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Consensus Finalized
                    </span>
                )}
            </div>

            {/* Timeline Visual */}
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-muted/30 -translate-y-1/2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${(activePhase / (phases.length - 1)) * 100}%` }}
                    />
                </div>

                {phases.map((phase, idx) => {
                    const isActive = activePhase >= idx;
                    const isCurrent = activePhase === idx;
                    const Icon = phase.icon;

                    return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                    isActive ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "bg-background border-muted text-muted-foreground",
                                    isCurrent && "animate-pulse"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="text-center absolute top-12 w-24">
                                <span className={cn("text-xs font-bold block", isActive ? "text-foreground" : "text-muted-foreground")}>
                                    {phase.title}
                                </span>
                                {isCurrent && (
                                    <span className="text-[9px] text-primary block truncate">{phase.desc}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Replay Logs */}
            <div className="mt-12 bg-muted/20 rounded-lg p-3 border border-border/50 font-mono text-xs space-y-2 h-32 overflow-y-auto">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="text-muted-foreground opacity-50">[{i + 1}]</span>
                        <span className={log.includes("COMMIT") ? "text-green-400 font-bold" : "text-foreground/80"}>
                            {log}
                        </span>
                    </div>
                ))}
                {activePhase < 3 && round.status !== "IDLE" && (
                    <div className="flex gap-2 animate-pulse text-muted-foreground">
                        <span>[...]</span>
                        <span>Awaiting next phase...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
