import { CheckCircle2, XCircle, Cpu, AlertTriangle } from "lucide-react";
import type { AgentStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const statusConfig = {
  ONLINE: {
    color: "bg-primary",
    label: "Online",
    glow: "shadow-[0_0_8px_hsl(184_100%_50%/0.5)]",
    cardClass: "animate-breathe",
  },
  CRASHED: {
    color: "bg-destructive",
    label: "Crashed",
    glow: "shadow-[0_0_8px_hsl(349_100%_62%/0.5)]",
    cardClass: "opacity-50",
  },
  FAULTY: {
    color: "bg-warning",
    label: "Faulty",
    glow: "shadow-[0_0_8px_hsl(43_100%_50%/0.5)]",
    cardClass: "animate-glitch",
  },
} as const;

export default function AgentCard({ agent }: { agent: AgentStatus }) {
  const status = statusConfig[agent.status] ?? statusConfig.ONLINE;

  return (
    <div className={cn("glass-card p-4 transition-all", status.cardClass)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{agent.agent_id}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", status.color, status.glow)} />
          <span className="text-xs text-muted-foreground">{status.label}</span>
        </div>
      </div>

      <p className="mb-2 font-mono text-xs text-muted-foreground">{agent.model_id}</p>

      {agent.fault && (
        <div className="mb-2 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          <span className="font-mono text-xs text-warning">{agent.fault}</span>
        </div>
      )}

      <div className="flex gap-3 text-xs text-muted-foreground/60">
        <span><CheckCircle2 className="inline h-3 w-3 text-primary/40 mr-1" />{agent.successful_participations}</span>
        <span><XCircle className="inline h-3 w-3 text-destructive/40 mr-1" />{agent.failed_participations}</span>
      </div>
    </div>
  );
}
