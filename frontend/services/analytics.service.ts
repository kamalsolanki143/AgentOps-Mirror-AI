import { apiClient } from "@/lib/apiClient";
import analyticsMock from "./mocks/analytics.json";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface AnalyticsOverview {
  agentsConnected: number;
  testsRunThisWeek: number;
  avgHealthScore: number;
  totalConversations: number;
  criticalIssuesFound: number;
  issuesResolvedThisWeek: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface HeatmapCell {
  persona: string;
  week: string;
  failureCount: number;
}

export interface VersionSnapshot {
  version: string;
  runDate: string;
  overall: number;
  reliability: number;
  security: number;
  hallucination: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trends: {
    hallucination: TrendDataPoint[];
    security: TrendDataPoint[];
    overallHealthScore: TrendDataPoint[];
  };
  heatmap: HeatmapCell[];
  versionComparison: VersionSnapshot[];
}

export const analyticsService = {
  async getAll(): Promise<AnalyticsData> {
    if (USE_MOCKS) {
      await delay(450);
      return analyticsMock as AnalyticsData;
    }
    return apiClient.get<AnalyticsData>("/api/analytics");
  },
};
