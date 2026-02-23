import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Play, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const SCENARIOS = [
    {
        id: "compromised_agent",
        title: "Compromised Agent (Byzantine Fault)",
        description: "Simulates an attacker taking over one agent to maliciously APPROVE a dangerous DELETE request. Demonstrates how the remaining honest agents reach a safe consensus.",
        difficulty: "Easy",
        expected: "DEFENDED"
    },
    {
        id: "crash_recovery",
        title: "Node Crash During Consensus",
        description: "Simulates an agent crashing or losing network connection right when a query is submitted. Demonstrates PBFT fault tolerance requiring only 2f+1 nodes to proceed.",
        difficulty: "Medium",
        expected: "RECOVERED"
    },
    {
        id: "collusion_attempt",
        title: "Byzantine Collusion (f+1)",
        description: "Simulates 2 agents colluding to force through a malicious transaction. Since f=1, compromising 2 agents breaks the mathematical limits of BFT.",
        difficulty: "Hard",
        expected: "VULNERABLE"
    }
];

export default function AttackSimulator() {
    const [running, setRunning] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, any>>({});

    const handleRun = async (id: string) => {
        setRunning(id);
        try {
            const res = await api.runScenario(id);
            setResults(prev => ({ ...prev, [id]: res }));
            toast.success(`Scenario '${id}' executed`);
        } catch (e: any) {
            toast.error(`Failed to run scenario: ${e.message}`);
        } finally {
            setRunning(null);
        }
    };

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
                            <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
                            <Link to="/simulator" className="text-primary border-b-2 border-primary py-4">Attack Simulator</Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-screen-xl p-4 lg:p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                        Adversarial Simulator
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Launch live attacks against the ByzantineMind network to observe how the PBFT consensus handles compromised nodes, crashes, and collusion attempts in real-time.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 pt-4">
                    {/* Scenarios List */}
                    <div className="space-y-4">
                        {SCENARIOS.map((scenario) => (
                            <div key={scenario.id} className="glass-card flex flex-col p-5 group transition-colors hover:border-primary/30 relative overflow-hidden">
                                {results[scenario.id] && (
                                    <div className="absolute top-0 right-0 p-2">
                                        {results[scenario.id].system_safe || results[scenario.id].consensus_reached ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-foreground">{scenario.title}</h3>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border
                    ${scenario.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            scenario.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {scenario.difficulty}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    {scenario.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-xs font-mono text-muted-foreground">Expected: {scenario.expected}</span>
                                    <button
                                        onClick={() => handleRun(scenario.id)}
                                        disabled={running !== null}
                                        className="flex items-center gap-2 rounded bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                                    >
                                        {running === scenario.id ? (
                                            <>Executing Attack <Activity className="h-3 w-3 animate-spin" /> </>
                                        ) : (
                                            <>Launch Attack <Play className="h-3 w-3" /> </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Results Panel */}
                    <div className="glass-card flex flex-col bg-muted/5 border-l-4 border-l-primary/50 relative overflow-hidden h-[600px]">
                        <div className="p-4 border-b border-border/50 bg-background/50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Execution Telemetry</h3>
                            <Activity className="h-4 w-4 text-primary animate-pulse" />
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {Object.keys(results).length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-50">
                                    <Shield className="h-12 w-12" />
                                    <p className="text-sm font-medium">Awaiting simulation data...</p>
                                </div>
                            ) : (
                                Object.entries(results).reverse().map(([id, res]) => (
                                    <div key={id} className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                        <h4 className="font-mono text-xs font-bold text-primary flex items-center gap-2">
                                            <ChevronRight className="h-3 w-3" />
                                            [{new Date().toLocaleTimeString()}] Action: run_{id}
                                        </h4>

                                        <div className="bg-background rounded border border-border/50 p-4 space-y-4">
                                            <p className="text-sm text-foreground/90 leading-relaxed border-l-2 border-primary/50 pl-3">
                                                {res.explanation}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-muted-foreground uppercase">Agent Decisions</span>
                                                    <pre className="text-xs font-mono text-muted-foreground bg-muted/20 p-2 rounded">
                                                        {JSON.stringify(res.agent_decisions || res.responding_agents, null, 2)}
                                                    </pre>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-muted-foreground uppercase">Outcome</span>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-mono font-bold text-foreground">
                                                            Consensus: {res.consensus_decision || "N/A"}
                                                        </span>
                                                        {res.system_safe !== undefined && (
                                                            <span className={`text-xs font-bold px-2 py-1 rounded w-fit ${res.system_safe ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                                                                System Safe: {res.system_safe ? "TRUE" : "FALSE"}
                                                            </span>
                                                        )}
                                                        {res.tolerance_exceeded && (
                                                            <span className="text-xs text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded w-fit mt-1">
                                                                ⚠️ Byzantine Fault Tolerance Exceeded
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
