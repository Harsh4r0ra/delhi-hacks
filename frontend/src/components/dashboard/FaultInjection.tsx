import { useState } from "react";
import { Zap, Skull, AlertTriangle, Users, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { AgentStatus } from "@/lib/api";

const faults = [
  {
    type: "BYZANTINE",
    icon: AlertTriangle,
    label: "Byzantine",
    description: "Agent sends malicious APPROVE for everything — lies to other nodes.",
    toast: "Byzantine fault injected — agent is now lying",
  },
  {
    type: "CRASH",
    icon: Skull,
    label: "Crash",
    description: "Immediately crash the agent, taking it offline.",
    toast: "Agent crashed — removed from consensus pool",
  },
  {
    type: "COLLUSION",
    icon: Users,
    label: "Collusion",
    description: "Agent coordinates with others to manipulate the vote. Tests the n=3f+1 guarantee.",
    toast: "Collusion fault injected",
  },
  {
    type: "OMISSION",
    icon: ShieldOff,
    label: "Omission",
    description: "Agent silently drops all messages — network partition simulation.",
    toast: "Omission fault injected — agent is silently dropping messages",
  },
];

interface Props {
  agents: AgentStatus[];
  onInject: (agentId: string, faultType: string) => Promise<void>;
  onClearAll: () => Promise<void>;
}

export default function FaultInjection({ agents, onInject, onClearAll }: Props) {
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const hasFaults = agents.some((a) => a.fault !== null);

  return (
    <div className="glass-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Fault Injection Console
          </h3>
        </div>
        {hasFaults && (
          <Button
            size="sm"
            variant="outline"
            className="border-primary/20 bg-primary/5 text-xs text-primary hover:bg-primary/10"
            onClick={async () => {
              setLoading(true);
              try {
                await onClearAll();
                toast.success("All faults cleared — system restored");
              } catch {
                toast.error("Failed to clear faults");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Clear All Faults
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span className="text-xs text-muted-foreground">Target agent:</span>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[180px] border-border/50 bg-background/50 text-xs">
            <SelectValue placeholder="Select agent…" />
          </SelectTrigger>
          <SelectContent className="border-border/50 bg-card">
            {agents.map((a) => (
              <SelectItem key={a.agent_id} value={a.agent_id} className="text-xs font-mono">
                {a.agent_id} — {a.status}
                {a.fault ? ` [${a.fault}]` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {faults.map((f) => (
          <AlertDialog key={f.type}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={!selectedAgent}
                className="h-auto flex-col gap-2 border-destructive/20 bg-destructive/5 py-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <f.icon className="h-5 w-5" />
                <span className="text-xs font-bold">{f.label}</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border/50 bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                  <f.icon className="h-5 w-5 text-destructive" />
                  Inject {f.label} Fault on {selectedAgent}
                </AlertDialogTitle>
                <AlertDialogDescription>{f.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border/50">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    try {
                      await onInject(selectedAgent, f.type);
                      toast.error(f.toast, { description: `Agent: ${selectedAgent}` });
                    } catch {
                      toast.error("Failed to inject fault");
                    }
                  }}
                >
                  Inject Fault
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>
    </div>
  );
}
