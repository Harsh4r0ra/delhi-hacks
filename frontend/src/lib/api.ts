/**
 * api.ts — Typed REST client for the ByzantineMind FastAPI backend.
 * Base URL is configurable via VITE_API_URL (defaults to localhost:8000).
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AgentStatus {
    agent_id: string;
    model_id: string; // display label e.g. "Groq (llama-3.3-70b-versatile)"
    status: "ONLINE" | "FAULTY" | "CRASHED";
    last_active: string | null;
    successful_participations: number;
    failed_participations: number;
    fault: string | null;
}

export interface AgentsResponse {
    agents: AgentStatus[];
    mode: "fast" | "full";
    f: number;
    n: number;
}

export interface ConsensusCert {
    view_number: number;
    sequence_number: number;
    request_hash: string;
    pre_prepare_signature: string;
    prepare_quorum: { agent_id: string; signature: string }[];
    commit_quorum: { agent_id: string; signature: string }[];
    result_hash: string;
    decision: "APPROVE" | "REJECT";
    timestamp: string;
    quorum_met: { prepare: number; commit: number };
}

export interface IntentDeclaration {
    intent_id: string;
    action_type: string;
    target: string;
    description: string;
    risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNKNOWN";
    created_at: string;
}

export interface AgentDetail {
    decision: "APPROVE" | "REJECT";
    reason_code: "SAFE" | "INVALID_REQUEST" | "UNSAFE_OR_UNKNOWN";
    confidence: number;
}

export interface QueryResponse {
    status: "CONSENSUS_REACHED" | "NO_CONSENSUS" | "BLOCKED";
    reason?: string;
    intent: IntentDeclaration;
    guardrail_bypassed?: boolean;
    policy?: {
        policy_id: string;
        required_quorum: number;
        escalate_to_human: boolean;
        description: string;
    };
    consensus: {
        decision: "APPROVE" | "REJECT";
        agent_decisions: Record<string, "APPROVE" | "REJECT">;
        agent_errors: Record<string, string>;
        sequence_number: number;
        agent_details?: Record<string, AgentDetail>;
    } | null;
    certificate: ConsensusCert | null;
    sentry_valid: boolean;
    active_faults: Record<string, string>;
}

export interface AuditEntry {
    id: number;
    intent_id: string;
    timestamp: string;
    risk_level: string;
    action_type: string;
    target: string;
    consensus_reached: boolean;
    consensus_cert: string | null;
    sentry_validation: boolean;
}

export interface ConfigResponse {
    mode: string;
    f_faults: number;
    n_agents: number;
    quorum_size: number;
    active_faults: Record<string, string>;
    // Runtime info — the frontend polls /api/agents for this
    agent_model_labels?: Record<string, string>;
}

// ── Client ─────────────────────────────────────────────────────────────────

async function req<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        ...init,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error((err as { detail?: string }).detail ?? "Request failed");
    }
    return res.json() as Promise<T>;
}

export const api = {
    getAgents: () => req<AgentsResponse>("/api/agents"),
    getConfig: () => req<ConfigResponse>("/api/config"),
    getHistory: (limit = 50) => req<{ history: AuditEntry[]; count: number }>(`/api/history?limit=${limit}`),
    getTrustScores: () => req<any>("/api/trust"),
    getAnalytics: () => req<any>("/api/analytics"),
    getPolicies: () => req<{ policies: any[] }>("/api/policy"),
    updatePolicies: (yaml_content: string) => req<{ status: string; policies: any[] }>("/api/policy", {
        method: "POST",
        body: JSON.stringify({ yaml_content })
    }),
    runScenario: (scenario_name: string) => req<any>(`/api/scenarios/${scenario_name}`, { method: "POST" }),

    sendChat: (message: string, history: Array<{ role: string; content: string }>) =>
        req<{ reply: string }>("/api/chat", { method: "POST", body: JSON.stringify({ message, history }) }),

    exportSession: () => `${BASE}/api/session/export`,

    uploadSessionReport: async (file: File): Promise<{ explanation: string }> => {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${BASE}/api/session/explain`, { method: "POST", body: form });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error((err as { detail?: string }).detail ?? "Explain failed");
        }
        return res.json();
    },

    submitQuery: (body: { operation: string; target: string; description?: string; strict_mode?: boolean }) =>
        req<QueryResponse>("/api/query", { method: "POST", body: JSON.stringify(body) }),

    injectFault: (agent_id: string, fault_type: string, malicious_decision = "APPROVE") =>
        req("/api/faults/inject", {
            method: "POST",
            body: JSON.stringify({ agent_id, fault_type, malicious_decision }),
        }),

    clearFaults: (agent_id?: string) =>
        req("/api/faults/clear", {
            method: "POST",
            body: JSON.stringify({ agent_id: agent_id ?? null }),
        }),
};
