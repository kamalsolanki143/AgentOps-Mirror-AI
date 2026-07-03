// ── Report Types ──────────────────────────────────────────────────────────

import type { RiskLevel } from "./run.types";

export interface ScoreBreakdown {
  reliability: number;    // 0–100
  security: number;       // 0–100
  businessGoal: number;   // 0–100
  hallucination: number;  // 0–100 (higher = fewer hallucinations)
  quality: number;        // 0–100
  latency: number;        // 0–100 (higher = faster responses)
  overall: number;        // weighted average
}

export interface RiskItem {
  id: string;
  level: RiskLevel;
  type: "hallucination" | "security" | "jailbreak" | "business_goal" | "quality" | "latency";
  title: string;
  description: string;
  personaId: string;
  personaName: string;
  personaEmoji: string;
  conversationId: string;
  messageExcerpt: string;
  recommendation: string;
  count: number; // how many times this risk appeared
}

export interface ReportVersion {
  id: string;
  runId: string;
  createdAt: string;
  overallScore: number;
}

export interface Report {
  id: string;
  runId: string;
  agentId: string;
  agentName: string;
  status: "generating" | "ready" | "failed";
  scores: ScoreBreakdown;
  risks: RiskItem[];
  riskSummary: {
    critical: number;
    medium: number;
    low: number;
    safe: number;
  };
  totalConversations: number;
  flaggedConversations: number;
  previousVersionId?: string | null;
  scoreDelta?: number | null; // improvement vs previous run
  generatedAt: string;
  createdAt: string;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
}
