import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, Hash, ShieldCheck } from "lucide-react";
import type { AuditEntry } from "@/lib/api";

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return ts;
  }
}

const riskColors: Record<string, string> = {
  LOW: "text-green-400",
  MEDIUM: "text-amber-400",
  HIGH: "text-orange-400",
  CRITICAL: "text-destructive",
};

export default function AuditTimeline({ history }: { history: AuditEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center p-12 text-center">
        <div>
          <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Audit log will populate as rounds complete…</p>
          <p className="mt-1 text-xs text-muted-foreground/50">Submit a query to start the audit trail.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <Accordion type="single" collapsible className="space-y-2">
        {history.map((entry) => {
          const cert = entry.consensus_cert
            ? (() => {
              try {
                return JSON.parse(entry.consensus_cert) as Record<string, unknown>;
              } catch {
                return null;
              }
            })()
            : null;

          return (
            <AccordionItem
              key={entry.id}
              value={`entry-${entry.id}`}
              className="glass-card border-white/[0.06] px-4"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex w-full items-center gap-4 pr-4">
                  <span className="font-mono text-xs font-bold text-muted-foreground">#{entry.id}</span>

                  <span className={`text-xs font-semibold ${riskColors[entry.risk_level] ?? "text-muted-foreground"}`}>
                    {entry.risk_level}
                  </span>

                  <Badge
                    variant="outline"
                    className={
                      entry.consensus_reached
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }
                  >
                    {entry.consensus_reached ? cert ? (cert.decision as string) : "REACHED" : "FAILED"}
                  </Badge>

                  <span className="font-mono text-xs text-muted-foreground/80 truncate max-w-[120px]">
                    {entry.action_type} → {entry.target}
                  </span>

                  {entry.sentry_validation && (
                    <span title="Sentry validated" className="shrink-0 flex items-center">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary/60" />
                    </span>
                  )}

                  <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex gap-6 text-xs text-muted-foreground">
                    <span>Intent ID: <code className="font-mono text-primary/70">{entry.intent_id.slice(0, 16)}…</code></span>
                    <span>Sentry: <span className={entry.sentry_validation ? "text-primary" : "text-destructive"}>{entry.sentry_validation ? "✓ Valid" : "⚠ Drift"}</span></span>
                  </div>

                  {cert && (
                    <div className="rounded-lg bg-background/50 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" />
                        Certificate
                      </p>
                      <div className="space-y-1 font-mono text-[10px] text-muted-foreground">
                        <div>result_hash: <span className="text-primary/70 break-all">{String(cert.result_hash ?? "—")}</span></div>
                        <div>prepare_quorum: <span className="text-amber-400">{(cert.prepare_quorum as unknown[])?.length ?? 0} signatures</span></div>
                        <div>commit_quorum: <span className="text-amber-400">{(cert.commit_quorum as unknown[])?.length ?? 0} signatures</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </ScrollArea>
  );
}
