// ── Stress Test Run Types ─────────────────────────────────────────────────

export type RunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type RiskLevel = "critical" | "medium" | "low" | "safe";

export interface PersonaConversation {
  id: string;
  runId: string;
  personaId: string;
  personaName: string;
  personaEmoji: string;
  personaColor: string;
  status: "queued" | "running" | "complete" | "failed";
  healthScore?: number;
  riskLevel?: RiskLevel;
  messageCount: number;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
  flags: ConversationFlag[];
}

export interface ConversationFlag {
  type: "hallucination" | "security" | "jailbreak" | "business_goal" | "quality";
  severity: RiskLevel;
  message: string;
  messageIndex: number;
}

export interface RunMetrics {
  totalConversations: number;
  completedConversations: number;
  failedConversations: number;
  avgHealthScore: number;
  criticalRisks: number;
  mediumRisks: number;
  lowRisks: number;
  hallucinationCount: number;
  securityCount: number;
  businessGoalCount: number;
  durationMs?: number;
}

export interface StressTestConfig {
  agentId: string;
  selectedPersonaIds: string[];
  difficulty: "easy" | "medium" | "hard" | "extreme";
  conversationsPerPersona: number;
  timeoutMs: number;
}

export interface StressTestRun {
  id: string;
  agentId: string;
  agentName: string;
  config: StressTestConfig;
  status: RunStatus;
  metrics: RunMetrics;
  conversations: PersonaConversation[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface RunListResponse {
  runs: StressTestRun[];
  total: number;
}
