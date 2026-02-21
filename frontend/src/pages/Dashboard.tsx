import { Link } from "react-router-dom";
import { Shield, Wifi, WifiOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useByzantineMind } from "@/hooks/useByzantineMind";
import AgentGrid from "@/components/dashboard/AgentGrid";
import ConsensusFlow from "@/components/dashboard/ConsensusFlow";
import IntentPanel from "@/components/dashboard/IntentPanel";
import FaultInjection from "@/components/dashboard/FaultInjection";
import AuditTimeline from "@/components/dashboard/AuditTimeline";
import QueryInput from "@/components/dashboard/QueryInput";

export default function Dashboard() {
  const {
    agents,
    round,
    history,
    intent,
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
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-foreground">
                Byzantine<span className="text-primary">Mind</span>
              </span>
            </Link>
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
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px]">
              {/* Left: Agent Grid */}
              <aside className="order-2 lg:order-1">
                <AgentGrid agents={agents} />
              </aside>

              {/* Center: Consensus Flow */}
              <main className="order-1 lg:order-2">
                <ConsensusFlow round={round} lastResponse={lastQueryResponse} />
              </main>

              {/* Right: Intent Panel */}
              <aside className="order-3">
                <IntentPanel intent={intent} lastResponse={lastQueryResponse} />
              </aside>
            </div>

            {/* Fault Injection Console */}
            <FaultInjection
              agents={agents}
              onInject={injectFault}
              onClearAll={() => clearFaults()}
            />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTimeline history={history} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
