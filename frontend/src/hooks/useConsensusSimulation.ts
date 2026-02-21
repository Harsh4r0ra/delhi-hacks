import { useState, useEffect, useCallback, useRef } from "react";
import {
  type Agent,
  type AgentStatus,
  type ConsensusRound,
  type ConsensusPhase,
  generateAgents,
  generateRound,
} from "@/lib/mockData";

export interface RoundHistoryEntry {
  roundId: number;
  decision: "approve" | "reject" | null;
  certificateHash: string;
  timestamp: Date;
  agentSignatures: { name: string; model: string; decision: string | null; signature: string }[];
  quorum: number;
  totalAgents: number;
}

export type FaultType = "crash" | "byzantine" | "collusion";

export function useConsensusSimulation() {
  const roundCounter = useRef(47);
  const [agents, setAgents] = useState<Agent[]>(() => generateAgents());
  const [round, setRound] = useState<ConsensusRound>(() =>
    generateRound(roundCounter.current, generateAgents())
  );
  const [completedRounds, setCompletedRounds] = useState(47);
  const [failures, setFailures] = useState(0);
  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>([]);

  const injectFault = useCallback((type: FaultType, agentId?: number) => {
    setRound((prev) => {
      const updatedAgents = [...prev.agents];
      const targetIdx = agentId
        ? updatedAgents.findIndex((a) => a.id === agentId)
        : updatedAgents.findIndex((a) => a.status === "online");

      if (targetIdx === -1) return prev;

      if (type === "crash") {
        updatedAgents[targetIdx] = { ...updatedAgents[targetIdx], status: "crashed" as AgentStatus, lastDecision: null };
      } else if (type === "byzantine") {
        updatedAgents[targetIdx] = { ...updatedAgents[targetIdx], status: "faulty" as AgentStatus };
        // Faulty agent lies - flip decision
        if (updatedAgents[targetIdx].lastDecision) {
          updatedAgents[targetIdx] = {
            ...updatedAgents[targetIdx],
            lastDecision: updatedAgents[targetIdx].lastDecision === "approve" ? "reject" : "approve",
          };
        }
      } else if (type === "collusion") {
        // Make two agents collude by crashing them
        updatedAgents[targetIdx] = { ...updatedAgents[targetIdx], status: "faulty" as AgentStatus };
        const secondIdx = updatedAgents.findIndex((a, i) => i !== targetIdx && a.status === "online");
        if (secondIdx !== -1) {
          updatedAgents[secondIdx] = { ...updatedAgents[secondIdx], status: "faulty" as AgentStatus };
        }
      }

      setAgents(updatedAgents);
      return { ...prev, agents: updatedAgents };
    });
  }, []);

  const advancePhase = useCallback(() => {
    setRound((prev) => {
      const phases: ConsensusPhase[] = ["idle", "pre-prepare", "prepare", "commit", "decided"];
      const currentIdx = phases.indexOf(prev.phase);

      if (currentIdx >= phases.length - 1) {
        // Record history before starting new round
        setRoundHistory((h) => [
          {
            roundId: prev.roundId,
            decision: prev.decision,
            certificateHash: prev.certificateHash,
            timestamp: new Date(),
            agentSignatures: prev.agents.map((a) => ({
              name: a.name,
              model: a.model,
              decision: a.lastDecision,
              signature: a.signature,
            })),
            quorum: prev.quorum,
            totalAgents: prev.totalAgents,
          },
          ...h,
        ].slice(0, 50));

        roundCounter.current += 1;
        const newAgents = prev.agents.map((a) => {
          const roll = Math.random();
          let status: AgentStatus = "online";
          if (roll > 0.92) status = "faulty";
          else if (roll > 0.88) status = "crashed";
          return { ...a, status, lastDecision: null, signature: a.signature };
        });
        setAgents(newAgents);
        setCompletedRounds((c) => c + 1);
        return generateRound(roundCounter.current, newAgents);
      }

      const nextPhase = phases[currentIdx + 1];
      let quorum = prev.quorum;
      let decision = prev.decision;
      let prepareProgress = prev.prepareProgress;
      const updatedAgents = [...prev.agents];

      if (nextPhase === "pre-prepare") {
        quorum = 0;
        prepareProgress = 0;
      } else if (nextPhase === "prepare") {
        const onlineAgents = updatedAgents.filter((a) => a.status === "online");
        const votingCount = Math.min(onlineAgents.length, Math.floor(Math.random() * 2) + 2);
        onlineAgents.slice(0, votingCount).forEach((a) => {
          const agent = updatedAgents.find((ua) => ua.id === a.id)!;
          agent.lastDecision = Math.random() > 0.2 ? "approve" : "reject";
        });
        quorum = votingCount;
        prepareProgress = 60;
      } else if (nextPhase === "commit") {
        updatedAgents.forEach((a) => {
          if (a.status === "online" && !a.lastDecision) {
            a.lastDecision = Math.random() > 0.15 ? "approve" : "reject";
          }
        });
        quorum = updatedAgents.filter((a) => a.lastDecision !== null).length;
        prepareProgress = 100;
      } else if (nextPhase === "decided") {
        const approvals = updatedAgents.filter((a) => a.lastDecision === "approve").length;
        decision = approvals >= Math.ceil((prev.totalAgents * 2) / 3 + 1) ? "approve" : "reject";
        quorum = updatedAgents.filter((a) => a.lastDecision !== null).length;
      }

      return {
        ...prev,
        phase: nextPhase,
        quorum,
        decision,
        prepareProgress,
        agents: updatedAgents,
      };
    });
  }, []);

  useEffect(() => {
    const phaseTimings: Record<ConsensusPhase, number> = {
      idle: 1500,
      "pre-prepare": 2000,
      prepare: 2500,
      commit: 2000,
      decided: 3000,
    };

    const timer = setInterval(() => {
      advancePhase();
    }, phaseTimings[round.phase]);

    return () => clearInterval(timer);
  }, [round.phase, advancePhase]);

  return { round, agents: round.agents, completedRounds, failures, roundHistory, injectFault };
}
