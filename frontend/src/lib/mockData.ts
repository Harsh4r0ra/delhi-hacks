export type AgentStatus = "online" | "crashed" | "faulty";
export type Decision = "approve" | "reject";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ConsensusPhase = "idle" | "pre-prepare" | "prepare" | "commit" | "decided";

export interface Agent {
  id: number;
  name: string;
  model: string;
  status: AgentStatus;
  lastDecision: Decision | null;
  signature: string;
}

export interface ConsensusRound {
  roundId: number;
  phase: ConsensusPhase;
  quorum: number;
  totalAgents: number;
  decision: Decision | null;
  certificateHash: string;
  agents: Agent[];
  intent: ParsedIntent;
  riskLevel: RiskLevel;
  guardrailPassed: boolean;
  sentryValidated: boolean;
  prepareProgress: number;
}

export interface ParsedIntent {
  operation: string;
  target: string;
  description: string;
  parameters: Record<string, unknown>;
}

const models = ["SimulatedAgent", "Mistral-7B", "GPT-4", "Claude-3"];
const operations = ["transfer_funds", "deploy_contract", "update_policy", "execute_trade"];
const targets = ["treasury.vault", "main.contract", "governance.dao", "trading.engine"];
const descriptions = [
  "Transfer 500 USDC to operations wallet",
  "Deploy updated smart contract v2.4.1",
  "Update risk threshold parameters",
  "Execute limit order BTC/USDC at 67,450",
];

function randomHash(len = 64): string {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

function randomSignature(): string {
  return `ed25519:${randomHash(32)}`;
}

export function generateAgents(): Agent[] {
  return models.map((model, i) => ({
    id: i + 1,
    name: `Agent ${i + 1}`,
    model,
    status: "online" as AgentStatus,
    lastDecision: null,
    signature: randomSignature(),
  }));
}

export function generateRound(roundId: number, agents: Agent[]): ConsensusRound {
  const idx = roundId % operations.length;
  return {
    roundId,
    phase: "idle",
    quorum: 0,
    totalAgents: agents.length,
    decision: null,
    certificateHash: `0x${randomHash()}`,
    agents,
    intent: {
      operation: operations[idx],
      target: targets[idx],
      description: descriptions[idx],
      parameters: {
        amount: Math.floor(Math.random() * 10000),
        priority: "high",
        nonce: randomHash(8),
      },
    },
    riskLevel: (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as RiskLevel[])[Math.floor(Math.random() * 4)],
    guardrailPassed: Math.random() > 0.15,
    sentryValidated: Math.random() > 0.1,
    prepareProgress: 0,
  };
}
