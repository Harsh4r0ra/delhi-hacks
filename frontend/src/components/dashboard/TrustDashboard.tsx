import { useState, useEffect } from "react";
import { Activity, ShieldAlert, CheckCircle2, XCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";

export default function TrustDashboard() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchTrust = () => api.getTrustScores().then(setData).catch(() => null);
        fetchTrust();
        const t = setInterval(fetchTrust, 5000);
        return () => clearInterval(t);
    }, []);

    if (!data) {
        return (
            <div className="flex items-center justify-center p-12">
                <Activity className="h-6 w-6 animate-pulse text-muted-foreground" />
            </div>
        );
    }

    const { scores } = data;
    const agents = Object.entries(scores).map(([id, stats]: [string, any]) => ({ id, ...stats }));

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {agents.map((agent) => (
                    <div key={agent.id} className="glass-card flex flex-col p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-mono text-sm font-bold text-foreground">{agent.id}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${agent.score >= 90 ? "bg-green-500/20 text-green-400" :
                                    agent.score >= 70 ? "bg-amber-500/20 text-amber-400" :
                                        "bg-red-500/20 text-red-400"
                                }`}>
                                {agent.score.toFixed(1)} / 100
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle2 className="h-3 w-3 text-green-400" /> Agreements</span>
                                <span className="font-mono">{agent.agreements}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground"><XCircle className="h-3 w-3 text-red-400" /> Disagreements</span>
                                <span className="font-mono">{agent.disagreements}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3 w-3 text-blue-400" /> Avg Latency</span>
                                <span className="font-mono">{agent.avg_latency_ms} ms</span>
                            </div>
                        </div>

                        {agent.score < 50 && (
                            <div className="mt-4 flex items-center gap-2 rounded bg-destructive/10 p-2 text-xs text-destructive">
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                <span className="font-semibold">Trust Critical — Flagged for manual review</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
