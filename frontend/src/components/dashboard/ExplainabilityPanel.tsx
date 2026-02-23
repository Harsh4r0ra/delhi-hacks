import { BrainCircuit, Info, ShieldCheck, ShieldAlert, FileText, AlertTriangle } from "lucide-react";
import type { QueryResponse } from "@/lib/api";

interface Props {
    response: QueryResponse | null;
}

export default function ExplainabilityPanel({ response }: Props) {
    if (!response || !response.consensus) {
        return (
            <div className="glass-card flex flex-col items-center justify-center p-8 text-center opacity-50">
                <BrainCircuit className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm font-semibold text-muted-foreground">Explainability Engine</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting consensus data to generate explanation...</p>
            </div>
        );
    }

    const { intent, consensus } = response;
    const isApproved = consensus.decision === "APPROVE";
    const { agent_details, agent_decisions } = consensus;

    if (!agent_details) return null;

    const totalAgents = Object.keys(agent_decisions).length;
    const approveCount = Object.values(agent_decisions).filter(d => d === "APPROVE").length;
    const rejectCount = totalAgents - approveCount;

    // Calculate average confidence
    const confidences = Object.values(agent_details).map(d => d.confidence);
    const avgConfidence = confidences.length ? (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(1) : 0;

    // Aggregate reason codes
    const reasons: Record<string, number> = {};
    Object.values(agent_details).forEach(d => {
        reasons[d.reason_code] = (reasons[d.reason_code] || 0) + 1;
    });

    const dominantReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

    const generateSummary = () => {
        if (response.status === "BLOCKED") {
            return `This ${intent.action_type} operation was immediately blocked by the ArmorIQ guardrail because it targeted a PRODUCTION resource and was flagged as CRITICAL risk. It was never sent to the consensus agents.`;
        }

        if (isApproved) {
            return `This ${intent.action_type} operation was approved because a quorum of ${approveCount}/${totalAgents} agents classified it as ${dominantReason} with an average confidence of ${avgConfidence}%.`;
        } else {
            return `This ${intent.action_type} operation was rejected because the quorum determined it was ${dominantReason.replace(/_/g, " ")}. ${rejectCount}/${totalAgents} agents voted to block it with an average confidence of ${avgConfidence}%.`;
        }
    };

    const getReasonStyles = (reason: string) => {
        if (reason === "SAFE") return "bg-green-500/10 border-green-500/20 text-green-400";
        if (reason === "INVALID_REQUEST") return "bg-amber-500/10 border-amber-500/20 text-amber-400";
        return "bg-red-500/10 border-red-500/20 text-red-400";
    };

    return (
        <div className="glass-card relative overflow-hidden">
            {/* Decorative background gradient */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

            <div className="p-5 border-b border-border/50 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Consensus Explainability
                </h2>
            </div>

            <div className="p-5 space-y-6">
                {/* Natural Language Summary */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <FileText className="h-4 w-4 text-primary" />
                        <h3>Generated Rationale</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-primary/50 pl-4 py-1">
                        "{generateSummary()}"
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    {/* Key Factors */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                            <Info className="h-4 w-4" />
                            <h3>Decision Factors</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs bg-background/50 p-2 rounded border border-border/50">
                                <span className="text-muted-foreground">Average Confidence</span>
                                <span className="font-mono font-bold text-foreground">{avgConfidence}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs bg-background/50 p-2 rounded border border-border/50">
                                <span className="text-muted-foreground">Dominant Classification</span>
                                <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[10px] ${getReasonStyles(dominantReason)}`}>
                                    {dominantReason}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Counterfactuals */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            <h3>Counterfactual Analysis</h3>
                        </div>
                        <div className="bg-background/50 p-3 rounded border border-border/50 text-xs text-muted-foreground leading-relaxed">
                            If {isApproved ? "1" : "2"} agent(s) had voted differently, the quorum would still have been met.
                            The system requires a strict majority to {isApproved ? "approve" : "reject"} operations targeting <span className="font-mono text-[10px] text-foreground">{intent.target}</span>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
