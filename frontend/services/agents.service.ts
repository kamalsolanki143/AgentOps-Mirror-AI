import type { Agent, AgentListResponse, CreateAgentPayload } from "@/types/agent.types";
import { apiClient } from "@/lib/apiClient";
import agentsMock from "./mocks/agents.json";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const agentsService = {
  async list(): Promise<AgentListResponse> {
    if (USE_MOCKS) {
      await delay(400);
      return { agents: agentsMock as Agent[], total: agentsMock.length };
    }
    return apiClient.get<AgentListResponse>("/api/agents");
  },

  async getById(id: string): Promise<Agent> {
    if (USE_MOCKS) {
      await delay(300);
      const agent = (agentsMock as Agent[]).find((a) => a.id === id);
      if (!agent) throw new Error(`Agent ${id} not found`);
      return agent;
    }
    return apiClient.get<Agent>(`/api/agents/${id}`);
  },

  async create(payload: CreateAgentPayload): Promise<Agent> {
    if (USE_MOCKS) {
      await delay(600);
      return {
        id: `agent-${Date.now()}`,
        ...payload,
        status: "idle",
        healthScore: 0,
        testsRun: 0,
        avgHealthScore: 0,
        tags: payload.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Agent;
    }
    return apiClient.post<Agent>("/api/agents", payload);
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCKS) {
      await delay(300);
      return;
    }
    return apiClient.delete(`/api/agents/${id}`);
  },
};
