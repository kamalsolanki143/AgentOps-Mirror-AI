import type { Report, ReportListResponse } from "@/types/report.types";
import type { ConversationReplay } from "@/types/conversation.types";
import { apiClient } from "@/lib/apiClient";
import reportMock from "./mocks/reports.json";
import conversationMock from "./mocks/conversations.json";

const USE_MOCKS = true;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const reportsService = {
  async list(): Promise<ReportListResponse> {
    if (USE_MOCKS) {
      await delay(400);
      return { reports: [reportMock as Report], total: 1 };
    }
    const res = await apiClient.get<ReportListResponse>("/api/v1/reports/");
    if (!res || !res.reports || res.reports.length === 0) {
      console.log("Seeding empty reports with demo data...");
      return { reports: [reportMock as Report], total: 1 };
    }
    return res;
  },

  async getById(id: string): Promise<Report> {
    if (USE_MOCKS) {
      await delay(300);
      return reportMock as Report;
    }
    return apiClient.get<Report>(`/api/v1/reports/${id}`);
  },

  async getConversation(conversationId: string): Promise<ConversationReplay> {
    if (USE_MOCKS) {
      await delay(250);
      return conversationMock as ConversationReplay;
    }
    return apiClient.get<ConversationReplay>(`/api/v1/replay/conversation/${conversationId}`);
  },
};
