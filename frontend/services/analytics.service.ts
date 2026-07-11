import { apiClient } from "@/lib/apiClient";
import analyticsMock from "./mocks/analytics.json";

const USE_MOCKS = true;
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

export interface RecentRun {
  id: string;
  status: string;
  score: number | null;
  created_at: string;
}

export interface DashboardMetrics {
  total_runs: number;
  completed_runs: number;
  failed_runs: number;
  average_score: number | null;
  recent_runs: RecentRun[];
}

export interface RiskDistribution {
  category: string;
  average_score: number;
  count: number;
}

export interface FindingTrend {
  finding_type: string;
  count: number;
}

export interface TimeSeriesData {
  date: string;
  runs: number;
  average_score: number | null;
}

export const analyticsService = {
  async getAll(): Promise<AnalyticsData> {
    if (USE_MOCKS) {
      await delay(450);
      return analyticsMock as AnalyticsData;
    }
    return apiClient.get<AnalyticsData>("/api/v1/analytics/");
  },

  async getDashboard(): Promise<DashboardMetrics> {
    if (USE_MOCKS) return analyticsMock.overview as unknown as DashboardMetrics; // Fallback
    return apiClient.get<DashboardMetrics>("/api/v1/analytics/dashboard");
  },

  async getRiskDistribution(): Promise<RiskDistribution[]> {
    if (USE_MOCKS) return analyticsMock.heatmap as unknown as RiskDistribution[];
    return apiClient.get<RiskDistribution[]>("/api/v1/analytics/risk-distribution");
  },

  async getFindingTrends(): Promise<FindingTrend[]> {
    if (USE_MOCKS) return [];
    return apiClient.get<FindingTrend[]>("/api/v1/analytics/finding-trends");
  },

  async getTimeSeries(days: number = 30): Promise<TimeSeriesData[]> {
    if (USE_MOCKS) return analyticsMock.trends.overallHealthScore as unknown as TimeSeriesData[];
    return apiClient.get<TimeSeriesData[]>(`/api/v1/analytics/time-series?days=${days}`);
  }
};
