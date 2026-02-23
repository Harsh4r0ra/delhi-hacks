import AgentCard from "./AgentCard";
import type { AgentStatus } from "@/lib/api";

interface AgentGridProps {
  agents: AgentStatus[];
}

export default function AgentGrid({ agents }: AgentGridProps) {
  if (agents.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Agent Nodes
        </h2>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="glass-card h-24 animate-pulse p-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Agent Nodes ({agents.filter((a) => a.status === "ONLINE").length}/{agents.length} Online)
      </h2>
      {agents.map((agent) => (
        <AgentCard key={agent.agent_id} agent={agent} />
      ))}
    </div>
  );
}
