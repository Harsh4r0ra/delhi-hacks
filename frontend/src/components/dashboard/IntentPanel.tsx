import { ShieldCheck, ShieldAlert, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntentDeclaration, QueryResponse } from "@/lib/api";

const riskConfig = {
  LOW: { color: "text-green-400", bg: "bg-green-400/10", dot: "bg-green-400" },
  MEDIUM: { color: "text-amber-400", bg: "bg-amber-400/10", dot: "bg-amber-400" },
  HIGH: { color: "text-orange-400", bg: "bg-orange-400/10", dot: "bg-orange-400" },
  CRITICAL: { color: "text-destructive", bg: "bg-destructive/10", dot: "bg-destructive animate-pulse" },
  UNKNOWN: { color: "text-muted-foreground", bg: "bg-muted/10", dot: "bg-muted" },
} as const;

interface Props {
  intent: IntentDeclaration | null;
  lastResponse: QueryResponse | null;
}

export default function IntentPanel({ intent, lastResponse }: Props) {
  if (!intent && !lastResponse) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Intent & Risk
        </h2>
        <div className="glass-card flex items-center justify-center p-12 text-center">
          <p className="text-xs text-muted-foreground">Submit a query to see ArmorIQ intent analysis…</p>
        </div>
      </div>
    );
  }

  const risk = riskConfig[intent?.risk_level ?? "UNKNOWN"];
  const guardrailPassed = lastResponse?.status !== "BLOCKED";
  const sentryValid = lastResponse?.sentry_valid ?? true;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Intent & Risk
      </h2>

      {/* Parsed Intent */}
      {intent && (
        <div className="glass-card p-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Parsed Intent</p>
          <pre className="overflow-x-auto rounded-lg bg-background/50 p-3 font-mono text-xs leading-relaxed text-foreground/80">
            <span className="text-muted-foreground">{"{"}</span>{"\n"}
            {"  "}<span className="text-primary">"action_type"</span>: <span className="text-green-400">"{intent.action_type}"</span>,{"\n"}
            {"  "}<span className="text-primary">"target"</span>: <span className="text-green-400">"{intent.target}"</span>,{"\n"}
            {"  "}<span className="text-primary">"risk_level"</span>: <span className="text-amber-400">"{intent.risk_level}"</span>{"\n"}
            <span className="text-muted-foreground">{"}"}</span>
          </pre>
        </div>
      )}

      {/* Risk Level */}
      <div className="glass-card flex items-center justify-between p-4">
        <span className="text-xs font-semibold text-muted-foreground">Risk Level</span>
        <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold", risk.bg, risk.color)}>
          <span className={cn("h-2 w-2 rounded-full", risk.dot)} />
          {intent?.risk_level ?? "—"}
        </span>
      </div>

      {/* Guardrail */}
      <div className="glass-card flex items-center justify-between p-4">
        <span className="text-xs font-semibold text-muted-foreground">Guardrail</span>
        {guardrailPassed ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" /> Passed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <ShieldAlert className="h-4 w-4" /> Blocked
          </span>
        )}
      </div>

      {/* Sentry */}
      <div className="glass-card flex items-center justify-between p-4">
        <span className="text-xs font-semibold text-muted-foreground">Sentry Validation</span>
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", sentryValid ? "text-primary" : "text-destructive")}>
          <Eye className="h-4 w-4" />
          {sentryValid ? "Verified" : "Drift Detected"}
        </span>
      </div>
    </div>
  );
}
