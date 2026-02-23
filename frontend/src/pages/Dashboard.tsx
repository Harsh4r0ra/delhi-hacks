import { Link } from "react-router-dom";
import { Shield, Wifi, WifiOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useByzantineMind } from "@/hooks/useByzantineMind";
import AgentGrid from "@/components/dashboard/AgentGrid";
import ConsensusFlow from "@/components/dashboard/ConsensusFlow";
import IntentPanel from "@/components/dashboard/IntentPanel";
import ExplainabilityPanel from "@/components/dashboard/ExplainabilityPanel";
import FaultInjection from "@/components/dashboard/FaultInjection";
import AuditTimeline from "@/components/dashboard/AuditTimeline";
import QueryInput from "@/components/dashboard/QueryInput";
import SystemOverview from "@/components/dashboard/SystemOverview";
import VoteBreakdown from "@/components/dashboard/VoteBreakdown";
import ConsensusReplay from "@/components/dashboard/ConsensusReplay";
import TrustDashboard from "@/components/dashboard/TrustDashboard";
import PolicyConfig from "@/components/dashboard/PolicyConfig";

export default function Dashboard() {
  const {
    agents,
    round,
    history,
    intent,
    viewChange,
    lastQueryResponse,
    isQuerying,
    wsConnected,
    submitQuery,
    injectFault,
    clearFaults,
  } = useByzantineMind();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <Link to="/dashboard" className="text-primary border-b-2 border-primary py-4">Dashboard</Link>
              <Link to="/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {wsConnected ? (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <Wifi className="h-3 w-3" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <WifiOff className="h-3 w-3" />
                Reconnecting…
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-1.5 w-1.5 rounded-full ${wsConnected ? "bg-primary animate-pulse" : "bg-muted"}`} />
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Dashboard content */}
      <div className="mx-auto max-w-screen-2xl p-4 lg:p-6 space-y-4">
        {/* Query Input — always visible at top */}
        <QueryInput onSubmit={submitQuery} isLoading={isQuerying} />

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/30">
            <TabsTrigger value="live">Live Consensus</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          {/* ── Live Consensus Tab ─────────────────────────────────── */}
          <TabsContent value="live" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px]">
              {/* Left: Agent Grid */}
              <aside className="order-2 lg:order-1">
                <AgentGrid agents={agents} />
              </aside>

              {/* Center: Consensus Flow + Vote Breakdown */}
              <main className="order-1 lg:order-2 space-y-4">
                <ConsensusFlow round={round} lastResponse={lastQueryResponse} />
                <ConsensusReplay round={round} viewChange={viewChange} />
                <VoteBreakdown response={lastQueryResponse} />
              </main>

              {/* Right: Intent Panel + Explainability */}
              <aside className="order-3 space-y-4">
                <IntentPanel intent={intent} lastResponse={lastQueryResponse} />
                <ExplainabilityPanel response={lastQueryResponse} />
              </aside>
            </div>

            {/* Fault Injection Console */}
            <FaultInjection
              agents={agents}
              onInject={injectFault}
              onClearAll={() => clearFaults()}
            />
          </TabsContent>

          {/* ── Audit Log Tab ──────────────────────────────────────── */}
          <TabsContent value="audit">
            <AuditTimeline history={history} />
          </TabsContent>

          {/* ── System Overview Tab ────────────────────────────────── */}
          <TabsContent value="system" className="space-y-6">
            <SystemOverview agents={agents} />

            <div className="pt-4 border-t border-border/50">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Agent Reputation & Trust Scores
              </h3>
              <TrustDashboard />
            </div>
          </TabsContent>
          {/* ── Governance Tab ─────────────────────────────────────── */}
          <TabsContent value="governance">
            <PolicyConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
