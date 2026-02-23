import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Activity, BarChart, Server, Clock, Fingerprint } from "lucide-react";
import { api } from "@/lib/api";

export default function Analytics() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchStats = () => api.getAnalytics().then(setData).catch(() => null);
        fetchStats();
        const t = setInterval(fetchStats, 5000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="text-sm font-bold text-foreground">
                                Byzantine<span className="text-primary">Mind</span>
                            </span>
                        </Link>
                        <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
                            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                            <Link to="/analytics" className="text-primary border-b-2 border-primary py-4">Analytics</Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-screen-2xl p-4 lg:p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">System Analytics</h1>
                    <p className="text-sm text-muted-foreground">Real-time metrics for the consensus network.</p>
                </div>

                {!data ? (
                    <div className="flex items-center justify-center p-24">
                        <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* KPI Cards */}
                        <div className="glass-card p-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Server className="h-4 w-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Total Queries</h3>
                            </div>
                            <p className="text-4xl font-mono font-bold tracking-tight mt-2">{data.total_queries}</p>
                        </div>

                        <div className="glass-card p-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Shield className="h-4 w-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Guardrail Blocks</h3>
                            </div>
                            <p className="text-4xl font-mono font-bold tracking-tight mt-2 text-destructive">{data.total_blocked_guardrail}</p>
                        </div>

                        <div className="glass-card p-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Fingerprint className="h-4 w-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Consensus Reached</h3>
                            </div>
                            <p className="text-4xl font-mono font-bold tracking-tight mt-2 text-primary">{data.total_consensus_reached}</p>
                        </div>

                        <div className="glass-card p-6 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Avg Latency</h3>
                            </div>
                            <p className="text-4xl font-mono font-bold tracking-tight mt-2 text-amber-400">{data.avg_latency_ms}<span className="text-lg opacity-50 ml-1">ms</span></p>
                        </div>

                        {/* Charts section (simplified for demo layout) */}
                        <div className="glass-card p-6 col-span-1 md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 mb-4 text-muted-foreground border-b border-border/50 pb-4">
                                <BarChart className="h-5 w-5" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Action Types Volume</h3>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(data.actions_count || {}).length > 0 ? Object.entries(data.actions_count).map(([action, count]: [string, any]) => (
                                    <div key={action} className="flex items-center justify-between">
                                        <span className="font-mono text-xs">{action}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${Math.min(100, (count / Math.max(1, data.total_queries)) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-xs font-bold w-6 text-right">{count}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-6 col-span-1 md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 mb-4 text-muted-foreground border-b border-border/50 pb-4">
                                <Fingerprint className="h-5 w-5" />
                                <h3 className="text-sm font-semibold uppercase tracking-wider">Consensus Decisions</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <span className="text-xs font-bold text-green-500 mb-2 uppercase tracking-wider">Approvals</span>
                                    <span className="text-3xl font-mono font-bold text-green-400">{data.decisions_count?.APPROVE || 0}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <span className="text-xs font-bold text-red-500 mb-2 uppercase tracking-wider">Rejections</span>
                                    <span className="text-3xl font-mono font-bold text-red-400">{data.decisions_count?.REJECT || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
