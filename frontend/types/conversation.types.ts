// ── Conversation Replay Types ─────────────────────────────────────────────

export type MessageRole = "user" | "agent" | "system";

export type AnnotationType =
  | "hallucination"
  | "security_risk"
  | "jailbreak_attempt"
  | "business_goal_miss"
  | "quality_issue"
  | "latency_spike"
  | "safe";

export interface MessageAnnotation {
  type: AnnotationType;
  severity: "critical" | "medium" | "low" | "info";
  label: string;
  detail: string;
  score?: number; // 0-100 confidence
}

export interface ConversationMessage {
  id: string;
  index: number;
  role: MessageRole;
  content: string;
  timestamp: string;
  latencyMs?: number; // only for agent responses
  annotations: MessageAnnotation[];
  reasoning?: string; // AI reasoning/decision note shown in side panel
}

export interface ConversationReplay {
  id: string;
  runId: string;
  reportId: string;
  agentId: string;
  agentName: string;
  personaId: string;
  personaName: string;
  personaEmoji: string;
  personaColor: string;
  healthScore: number;
  messages: ConversationMessage[];
  summary: string;
  flagCount: number;
  durationMs: number;
  startedAt: string;
  completedAt: string;
}
