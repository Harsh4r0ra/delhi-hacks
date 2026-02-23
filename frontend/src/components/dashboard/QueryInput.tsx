/**
 * QueryInput — Submit an action for PBFT consensus.
 * Connects to POST /api/query via the useByzantineMind hook.
 */

import { useState } from "react";
import { Send, Loader2, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
    onSubmit: (operation: string, target: string, description?: string, strict_mode?: boolean) => Promise<QueryResponse>;
    isLoading: boolean;
}

export default function QueryInput({ onSubmit, isLoading }: Props) {
    const [operation, setOperation] = useState("PING");
    const [target, setTarget] = useState("health_endpoint");
    const [description, setDescription] = useState("");
    const [strictMode, setStrictMode] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!operation || !target.trim()) return;

        try {
            const result = await onSubmit(operation, target.trim(), description, strictMode);
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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Action
                        </label>
                        <Select value={operation} onValueChange={setOperation}>
                            <SelectTrigger className="w-full border-border/50 bg-background/50 font-mono text-xs">
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
                        {selectedOp && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Predicted risk:{" "}
                                <span
                                    className={
                                        selectedOp.risk === "LOW"
                                            ? "text-green-400 font-bold"
                                            : selectedOp.risk === "MEDIUM"
                                                ? "text-amber-400 font-bold"
                                                : selectedOp.risk === "HIGH"
                                                    ? "text-orange-400 font-bold"
                                                    : "text-destructive font-bold"
                                    }
                                >
                                    {selectedOp.risk}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Guardrail Mode Toggle */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Guardrail Mode
                        </label>
                        <button
                            type="button"
                            onClick={() => setStrictMode((prev) => !prev)}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all",
                                strictMode
                                    ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    : "border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                            )}
                        >
                            {strictMode ? (
                                <>
                                    <Shield className="h-4 w-4 shrink-0" />
                                    <span>Strict — ArmorIQ blocks before consensus</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="h-4 w-4 shrink-0" />
                                    <span>Consensus — bypass guardrail, agents decide</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Target Resource
                        </label>
                        <Input
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="e.g. production_database"
                            className="w-full border-border/50 bg-background/50 font-mono text-xs placeholder:text-muted-foreground/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Description (Optional)
                        </label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Reason for query..."
                            className="w-full border-border/50 bg-background/50 font-mono text-xs placeholder:text-muted-foreground/30"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        <span className="ml-2">{isLoading ? "Submitting Request…" : "Run Consensus"}</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
