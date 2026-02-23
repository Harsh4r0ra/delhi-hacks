/**
 * VoteBreakdown — Shows individual agent votes with confidence bars.
 * Appears in the ConsensusFlow panel after a query is submitted.
 */

import { cn } from "@/lib/utils";
import type { QueryResponse } from "@/lib/api";
import { motion } from "framer-motion";

const reasonLabels: Record<string, string> = {
    SAFE: "Safe",
    INVALID_REQUEST: "Invalid",
    UNSAFE_OR_UNKNOWN: "Unsafe",
};

const reasonColors: Record<string, string> = {
    SAFE: "text-primary",
    INVALID_REQUEST: "text-amber-400",
    UNSAFE_OR_UNKNOWN: "text-destructive",
};

interface Props {
    response: QueryResponse | null;
}

export default function VoteBreakdown({ response }: Props) {
    if (!response?.consensus) return null;

    const { agent_decisions, agent_errors, agent_details } = response.consensus;

    const agents = Object.keys(agent_decisions).length > 0
        ? Object.keys(agent_decisions)
        : Object.keys(agent_errors);

    if (agents.length === 0) return null;

    return (
        <div className="glass-card p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Agent Vote Breakdown
            </h3>
            <div className="space-y-2">
                {agents.map((agentId) => {
                    const decision = agent_decisions[agentId];
                    const error = agent_errors?.[agentId];
                    const detail = agent_details?.[agentId];
                    const isApprove = decision === "APPROVE";
                    const isError = !decision && !!error;

                    return (
                        <div key={agentId} className="rounded-lg bg-background/50 p-3 space-y-2">
                            {/* Agent row */}
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-semibold text-foreground">{agentId}</span>
                                <div className="flex items-center gap-2">
                                    {detail && (
                                        <span className={cn("text-[10px] font-semibold", reasonColors[detail.reason_code])}>
                                            {reasonLabels[detail.reason_code]}
                                        </span>
                                    )}
                                    <span
                                        className={cn(
                                            "rounded px-2 py-0.5 text-xs font-bold",
                                            isError
                                                ? "bg-muted/20 text-muted-foreground"
                                                : isApprove
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-destructive/10 text-destructive"
                                        )}
                                    >
                                        {isError ? "ERROR" : decision}
                                    </span>
                                </div>
                            </div>

                            {/* Confidence bar */}
                            {detail && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                        <span>Confidence</span>
                                        <span className="font-mono">{(detail.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                        <motion.div
                                            className={cn("h-full rounded-full", isApprove ? "bg-primary" : "bg-destructive")}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${detail.confidence * 100}%` }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Error message */}
                            {isError && (
                                <p className="font-mono text-[10px] text-muted-foreground/70 truncate">{error}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
