/**
 * QueryInput — Submit an action for PBFT consensus.
 * Connects to POST /api/query via the useByzantineMind hook.
 */

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { QueryResponse } from "@/lib/api";

const OPERATIONS = [
    { value: "PING", label: "⚡ PING — health check", risk: "LOW" },
    { value: "READ", label: "📖 READ — read data", risk: "LOW" },
    { value: "LIST", label: "📋 LIST — list resources", risk: "LOW" },
    { value: "CREATE", label: "✏️ CREATE — create resource", risk: "MEDIUM" },
    { value: "UPDATE", label: "🔧 UPDATE — modify resource", risk: "HIGH" },
    { value: "GRANT_ACCESS", label: "🔐 GRANT_ACCESS — permissions", risk: "HIGH" },
    { value: "DELETE", label: "🗑️ DELETE — delete resource", risk: "CRITICAL" },
    { value: "TRANSFER_FUNDS", label: "💸 TRANSFER_FUNDS — financial", risk: "CRITICAL" },
];

interface Props {
    onSubmit: (operation: string, target: string, description?: string) => Promise<QueryResponse>;
    isLoading: boolean;
}

export default function QueryInput({ onSubmit, isLoading }: Props) {
    const [operation, setOperation] = useState("PING");
    const [target, setTarget] = useState("health_endpoint");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!operation || !target.trim()) return;

        try {
            const result = await onSubmit(operation, target.trim(), description);
            if (result.status === "BLOCKED") {
                toast.error(`🚫 Blocked by ArmorIQ guardrail`, {
                    description: result.reason,
                });
            } else if (result.status === "NO_CONSENSUS") {
                toast.warning("⚠️ Consensus failed — no quorum reached");
            } else {
                const d = result.consensus?.decision;
                if (d === "APPROVE") {
                    toast.success(`✓ Consensus: APPROVED — ${operation} on ${target}`);
                } else {
                    toast.error(`✗ Consensus: REJECTED — ${operation} on ${target}`);
                }
            }
        } catch (err: unknown) {
            toast.error("Backend error", { description: err instanceof Error ? err.message : "Unknown error" });
        }
    };

    const selectedOp = OPERATIONS.find((o) => o.value === operation);

    return (
        <div className="glass-card p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Submit Request for Consensus
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Select value={operation} onValueChange={setOperation}>
                        <SelectTrigger className="min-w-[220px] border-border/50 bg-background/50 font-mono text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-border/50 bg-card">
                            {OPERATIONS.map((op) => (
                                <SelectItem key={op.value} value={op.value} className="font-mono text-xs">
                                    {op.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="target (e.g. production_database)"
                        className="flex-1 border-border/50 bg-background/50 font-mono text-xs placeholder:text-muted-foreground/50"
                    />

                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="description (optional)"
                        className="flex-1 border-border/50 bg-background/50 font-mono text-xs placeholder:text-muted-foreground/50"
                    />

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        <span className="ml-2">{isLoading ? "Submitting…" : "Run Consensus"}</span>
                    </Button>
                </div>

                {selectedOp && (
                    <p className="text-xs text-muted-foreground">
                        Predicted risk:{" "}
                        <span
                            className={
                                selectedOp.risk === "LOW"
                                    ? "text-green-400"
                                    : selectedOp.risk === "MEDIUM"
                                        ? "text-amber-400"
                                        : selectedOp.risk === "HIGH"
                                            ? "text-orange-400"
                                            : "text-destructive"
                            }
                        >
                            {selectedOp.risk}
                        </span>
                    </p>
                )}
            </form>
        </div>
    );
}
