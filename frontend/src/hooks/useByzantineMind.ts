/**
 * useByzantineMind.ts — Real-time hook connecting to the ByzantineMind backend.
 *
 * Manages:
 * - WebSocket connection to ws://localhost:8000/ws for live consensus events
 * - Polling /api/agents every 5 seconds for health status
 * - Polling /api/history on each new round completed
 * - Exposes submitQuery and injectFault/clearFaults functions
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api, type AgentStatus, type QueryResponse, type AuditEntry, type IntentDeclaration } from "@/lib/api";
import { toast } from "sonner";

const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) ?? "ws://localhost:8000/ws";

export type ConsensusPhase =
    | "idle"
    | "AGENT_EXECUTION"
    | "PRE_PREPARE"
    | "PREPARE"
    | "COMMIT"
    | "decided";

export interface AgentDecision {
    agent_id: string;
    status: "OK" | "TIMEOUT" | "ERROR" | "pending";
    decision?: "APPROVE" | "REJECT";
}

export interface LiveRound {
    phase: ConsensusPhase;
    action_id: string;
    sequence: number;
    agentDecisions: Record<string, AgentDecision>;
    finalDecision: "APPROVE" | "REJECT" | null;
    certificateHash: string | null;
    prepareCount: number;
    commitCount: number;
}
export interface ViewChangeEvent {
    old_view: number;
    new_view: number;
    new_primary: string;
    reason: string;
    sequence: number;
}

export function useByzantineMind() {
    const [agents, setAgents] = useState<AgentStatus[]>([]);
    const [round, setRound] = useState<LiveRound>({
        phase: "idle",
        action_id: "",
        sequence: 0,
        agentDecisions: {},
        finalDecision: null,
        certificateHash: null,
        prepareCount: 0,
        commitCount: 0,
    });
    const [history, setHistory] = useState<AuditEntry[]>([]);
    const [lastQueryResponse, setLastQueryResponse] = useState<QueryResponse | null>(null);
    const [intent, setIntent] = useState<IntentDeclaration | null>(null);
    const [viewChange, setViewChange] = useState<ViewChangeEvent | null>(null);
    const [isQuerying, setIsQuerying] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── WebSocket setup ──────────────────────────────────────────────────────
    useEffect(() => {
        function connect() {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                setWsConnected(true);
                pingRef.current = setInterval(() => ws.send("ping"), 30_000);
            };

            ws.onclose = () => {
                setWsConnected(false);
                if (pingRef.current) clearInterval(pingRef.current);
                // Reconnect after 3s
                setTimeout(connect, 3_000);
            };

            ws.onerror = () => ws.close();

            ws.onmessage = (evt) => {
                try {
                    const msg: { event: string; data: Record<string, unknown> } = JSON.parse(evt.data as string);
                    handleWsEvent(msg.event, msg.data);
                } catch {
                    // ignore malformed
                }
            };
        }

        connect();
        return () => {
            wsRef.current?.close();
            if (pingRef.current) clearInterval(pingRef.current);
        };
    }, []);

    const handleWsEvent = useCallback((event: string, data: Record<string, unknown>) => {
        switch (event) {
            case "round_started":
                // If we see a new round started, clear any stale view change notification
                setViewChange(null);
                setRound((prev) => ({
                    ...prev,
                    phase: "AGENT_EXECUTION",
                    action_id: String(data.action_id ?? ""),
                    sequence: Number(data.sequence ?? 0),
                    agentDecisions: {},
                    finalDecision: null,
                    certificateHash: null,
                    prepareCount: 0,
                    commitCount: 0,
                }));
                break;

            case "view_change":
                setViewChange({
                    old_view: Number(data.old_view),
                    new_view: Number(data.new_view),
                    new_primary: String(data.new_primary),
                    reason: String(data.reason),
                    sequence: Number(data.sequence),
                });
                toast.error(`Primary failed. View Change: ${data.old_view} → ${data.new_view}`, {
                    icon: "⚡"
                });
                break;

            case "phase_update":
                setRound((prev) => ({
                    ...prev,
                    phase: String(data.phase ?? prev.phase) as ConsensusPhase,
                }));
                break;

            case "agent_response":
                setRound((prev) => ({
                    ...prev,
                    agentDecisions: {
                        ...prev.agentDecisions,
                        [String(data.agent_id)]: {
                            agent_id: String(data.agent_id),
                            status: String(data.status ?? "pending") as AgentDecision["status"],
                            decision: data.decision as "APPROVE" | "REJECT" | undefined,
                        },
                    },
                }));
                break;

            case "consensus_reached":
                setRound((prev) => ({
                    ...prev,
                    phase: "decided",
                    finalDecision: String(data.decision ?? "") as "APPROVE" | "REJECT",
                    prepareCount: Number(data.prepare_count ?? 0),
                    commitCount: Number(data.commit_count ?? 0),
                }));
                // Refresh history
                api.getHistory().then((res) => setHistory(res.history)).catch(() => null);
                break;
        }
    }, []);

    // ── Agent polling (every 5s) ─────────────────────────────────────────────
    useEffect(() => {
        const poll = () => api.getAgents().then((r) => setAgents(r.agents)).catch(() => null);
        poll();
        const t = setInterval(poll, 5_000);
        return () => clearInterval(t);
    }, []);

    // ── History initial load ─────────────────────────────────────────────────
    useEffect(() => {
        api.getHistory().then((r) => setHistory(r.history)).catch(() => null);
    }, []);

    // ── Actions ──────────────────────────────────────────────────────────────
    const submitQuery = useCallback(
        async (operation: string, target: string, description?: string, strict_mode?: boolean) => {
            setIsQuerying(true);
            try {
                const response = await api.submitQuery({
                    operation,
                    target,
                    description: description ?? "",
                    strict_mode: strict_mode ?? true,
                });
                setLastQueryResponse(response);
                setIntent(response.intent ?? null);
                if (response.certificate) {
                    setRound((prev) => ({
                        ...prev,
                        certificateHash: response.certificate!.result_hash,
                    }));
                }
                // Refresh agents and history
                api.getAgents().then((r) => setAgents(r.agents)).catch(() => null);
                api.getHistory().then((r) => setHistory(r.history)).catch(() => null);
                return response;
            } finally {
                setIsQuerying(false);
            }
        },
        []
    );

    const injectFault = useCallback(async (agentId: string, faultType: string) => {
        await api.injectFault(agentId, faultType);
        api.getAgents().then((r) => setAgents(r.agents)).catch(() => null);
    }, []);

    const clearFaults = useCallback(async (agentId?: string) => {
        await api.clearFaults(agentId);
        api.getAgents().then((r) => setAgents(r.agents)).catch(() => null);
    }, []);

    return {
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
    };
}
