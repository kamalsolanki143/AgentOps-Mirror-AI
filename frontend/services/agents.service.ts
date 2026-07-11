import type { Agent, AgentListResponse, CreateAgentPayload } from "@/types/agent.types";
import { apiClient } from "@/lib/apiClient";
import agentsMock from "./mocks/agents.json";

const USE_MOCKS = true;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const agentsService = {
  async list(): Promise<AgentListResponse> {
    if (USE_MOCKS) {
      await delay(400);
      return { agents: agentsMock as Agent[], total: agentsMock.length };
    }
    const res = await apiClient.get<AgentListResponse>("/api/v1/agents/");
    if (!res || !res.agents || res.agents.length === 0) {
      console.log("Seeding empty agents with demo data...");
      try {
        const newAgent = await this.create({
          name: "Demo Agent",
          description: "Default seeded AI assistant agent",
          connector: "openai",
          endpoint: "https://api.openai.com/v1/chat/completions",
          tags: ["demo", "openai"]
        });
        return { agents: [newAgent], total: 1 };
      } catch (err) {
        console.error("Failed to seed agent on backend:", err);
        return { agents: agentsMock as Agent[], total: agentsMock.length };
      }
    }
    return res;
  },

  async getById(id: string): Promise<Agent> {
    if (USE_MOCKS) {
      await delay(300);
      const agent = (agentsMock as Agent[]).find((a) => a.id === id);
      if (!agent) throw new Error(`Agent ${id} not found`);
      return agent;
    }
    return apiClient.get<Agent>(`/api/v1/agents/${id}`);
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
    return apiClient.post<Agent>("/api/v1/agents/", payload);
  },

  async delete(id: string): Promise<void> {
    if (USE_MOCKS) {
      await delay(300);
      return;
    }
    return apiClient.delete(`/api/v1/agents/${id}`);
  },
};
