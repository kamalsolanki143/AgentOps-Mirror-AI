import type { StressTestRun, StressTestConfig, RunListResponse } from "@/types/run.types";
import { apiClient } from "@/lib/apiClient";
import runMock from "./mocks/runs.json";

const USE_MOCKS = true;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const stressTestService = {
  async list(agentId?: string): Promise<RunListResponse> {
    const getMockFiltered = () => {
      const runs = [runMock as StressTestRun];
      const filtered = agentId ? runs.filter((r) => r.agentId === agentId) : runs;
      return { runs: filtered, total: filtered.length };
    };

    if (USE_MOCKS) {
      await delay(400);
      return getMockFiltered();
    }
    const params = agentId ? `?agentId=${agentId}` : "";
    const res = await apiClient.get<RunListResponse>(`/api/v1/stress-test/${params}`);
    if (!res || !res.runs || res.runs.length === 0) {
      console.log("Seeding empty runs with demo data...");
      return getMockFiltered();
    }
    return res;
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
    return apiClient.get<StressTestRun>(`/api/v1/stress-test/${runId}`);
  },

  async launch(config: StressTestConfig): Promise<{ runId: string }> {
    if (USE_MOCKS) {
      await delay(800);
      return { runId: `run-${Date.now()}` };
    }
    const res = await apiClient.post<any>("/api/v1/stress-test/", config);
    const runId = res.id;
    await apiClient.post(`/api/v1/stress-test/${runId}/start`);
    return { runId };
  },

  async cancel(runId: string): Promise<void> {
    if (USE_MOCKS) {
      await delay(300);
      return;
    }
    return apiClient.post(`/api/v1/stress-test/${runId}/cancel`);
  },
};
