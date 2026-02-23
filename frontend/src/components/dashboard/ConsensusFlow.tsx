import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LiveRound } from "@/hooks/useByzantineMind";
import type { QueryResponse } from "@/lib/api";

const phaseOrder: LiveRound["phase"][] = ["AGENT_EXECUTION", "PRE_PREPARE", "PREPARE", "COMMIT"];
const phaseLabels: Record<string, string> = {
  AGENT_EXECUTION: "Agents",
  PRE_PREPARE: "Pre-Prepare",
  PREPARE: "Prepare",
  COMMIT: "Commit",
};

function PhaseNode({ phase, active, completed }: { phase: string; active: boolean; completed: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border px-3 py-3 transition-all sm:px-5 sm:py-4",
        completed
          ? "border-primary/40 bg-primary/10 animate-cascade-glow"
          : active
            ? "border-primary/30 bg-primary/5"
            : "border-border/50 bg-card/30"
      )}
    >
      <div
        className={cn(
          "h-3 w-3 rounded-full transition-all",
          completed ? "bg-primary glow-green" : active ? "bg-primary/50 animate-pulse" : "bg-muted"
        )}
      />
      <span className={cn("text-xs font-semibold", completed || active ? "text-primary" : "text-muted-foreground")}>
        {phaseLabels[phase] || phase}
      </span>
    </div>
  );
}

interface Props {
  round: LiveRound;
  lastResponse: QueryResponse | null;
}

export default function ConsensusFlow({ round, lastResponse }: Props) {
  const [copied, setCopied] = useState(false);
  const certHash = round.certificateHash ?? lastResponse?.certificate?.result_hash;

  const getPhaseState = (phase: LiveRound["phase"]) => {
    if (round.phase === "decided") return { active: false, completed: true };
    const idx = phaseOrder.indexOf(phase);
    const currentIdx = phaseOrder.indexOf(round.phase as LiveRound["phase"]);
    if (idx < currentIdx) return { active: false, completed: true };
    if (idx === currentIdx) return { active: true, completed: false };
    return { active: false, completed: false };
  };

  const copyHash = () => {
    if (!certHash) return;
    navigator.clipboard.writeText(certHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const agentCount = Object.keys(round.agentDecisions).length;
  const approvalCount = Object.values(round.agentDecisions).filter((a) => a.decision === "APPROVE").length;
  const rejectCount = Object.values(round.agentDecisions).filter((a) => a.decision === "REJECT").length;
  const decision = round.finalDecision ?? lastResponse?.consensus?.decision ?? null;
  const isDecided = round.phase === "decided" || decision !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Consensus Flow
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {round.phase === "idle" ? "Idle — submit a query to begin" : `Phase: ${round.phase}`}
        </span>
      </div>

      {/* Pipeline */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {phaseOrder.map((phase, i) => {
          const state = getPhaseState(phase);
          return (
            <div key={phase} className="flex items-center gap-2 sm:gap-3">
              <PhaseNode phase={phase} active={state.active} completed={state.completed} />
              {i < phaseOrder.length - 1 && (
                <div className={cn("h-px w-4 sm:w-8 transition-all", state.completed ? "bg-primary" : "bg-border/30")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Quorum progress */}
      <div className="glass-card p-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Agent Responses</span>
          <div className="flex gap-3 font-mono font-semibold">
            <span className="text-primary">{approvalCount} APPROVE</span>
            <span className="text-destructive">{rejectCount} REJECT</span>
            <span className="text-muted-foreground">{agentCount} / 7 responded</span>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(agentCount / 7) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Decision badge */}
      <AnimatePresence mode="wait">
        {isDecided && decision && (
          <motion.div
            key={`decision-${round.sequence}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "flex items-center justify-center rounded-xl border py-6 text-center text-2xl font-black uppercase tracking-widest",
              decision === "APPROVE"
                ? "border-primary/30 bg-primary/10 text-primary glow-green"
                : "border-destructive/30 bg-destructive/10 text-destructive glow-red"
            )}
          >
            {decision === "APPROVE" ? "✓ APPROVED" : "✗ REJECTED"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certificate hash */}
      {certHash && (
        <div className="glass-card flex items-center gap-2 p-3">
          <span className="text-xs text-muted-foreground">Certificate:</span>
          <code className="flex-1 truncate font-mono text-xs text-primary/80">{certHash}</code>
          <button onClick={copyHash} className="shrink-0 text-muted-foreground transition-colors hover:text-foreground">
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
