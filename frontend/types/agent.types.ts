// ── Agent Types ──────────────────────────────────────────────────────────

export type AgentStatus = "healthy" | "warning" | "critical" | "idle" | "testing";

export type AgentConnector =
  | "rest_api"
  | "websocket"
  | "openai"
  | "langchain"
  | "rasa"
  | "botpress"
  | "dialogflow"
  | "custom";

export interface AgentConnectorMeta {
  id: AgentConnector;
  label: string;
  description: string;
  icon: string; // emoji or icon name
  docsUrl?: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  connector: AgentConnector;
  endpoint: string;
  apiKey?: string;
  status: AgentStatus;
  healthScore: number; // 0–100
  lastRunAt?: string; // ISO date
  lastRunId?: string;
  testsRun: number;
  avgHealthScore: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentListResponse {
  agents: Agent[];
  total: number;
}

export interface CreateAgentPayload {
  name: string;
  description?: string;
  connector: AgentConnector;
  endpoint: string;
  apiKey?: string;
  tags?: string[];
}
