import type { StressTestRun, StressTestConfig, RunListResponse } from "@/types/run.types";
import { apiClient } from "@/lib/apiClient";
import runMock from "./mocks/runs.json";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const stressTestService = {
  async list(agentId?: string): Promise<RunListResponse> {
    if (USE_MOCKS) {
      await delay(400);
      const runs = [runMock as StressTestRun];
      const filtered = agentId ? runs.filter((r) => r.agentId === agentId) : runs;
      return { runs: filtered, total: filtered.length };
    }
    const params = agentId ? `?agentId=${agentId}` : "";
    return apiClient.get<RunListResponse>(`/api/runs${params}`);
  },

  async getById(runId: string): Promise<StressTestRun> {
    if (USE_MOCKS) {
      await delay(300);
      if (runId === runMock.id || runId === "run-001") {
        return runMock as StressTestRun;
      }
      // Simulate a running state for demo purposes
      return {
        ...runMock,
        id: runId,
        status: "running",
        metrics: {
          ...runMock.metrics,
          completedConversations: Math.floor(Math.random() * 15),
          avgHealthScore: Math.floor(60 + Math.random() * 30),
        },
      } as StressTestRun;
    }
    return apiClient.get<StressTestRun>(`/api/runs/${runId}`);
  },

  async launch(config: StressTestConfig): Promise<{ runId: string }> {
    if (USE_MOCKS) {
      await delay(800);
      return { runId: `run-${Date.now()}` };
    }
    return apiClient.post<{ runId: string }>("/api/runs", config);
  },

  async cancel(runId: string): Promise<void> {
    if (USE_MOCKS) {
      await delay(300);
      return;
    }
    return apiClient.post(`/api/runs/${runId}/cancel`);
  },
};
