// ── Persona Types ─────────────────────────────────────────────────────────

export type PersonaCategory =
  | "adversarial"
  | "social_engineering"
  | "edge_case"
  | "standard"
  | "security";

export type PersonaDifficulty = "low" | "medium" | "high" | "extreme";

export interface PersonaGoal {
  description: string;
  successCriteria: string;
}

export interface Persona {
  id: string;
  name: string;
  slug: string;
  category: PersonaCategory;
  difficulty: PersonaDifficulty;
  description: string;
  personality: string;
  goal: PersonaGoal;
  sampleOpener: string;
  tags: string[];
  color: string; // hex color for avatar dot
  emoji: string;
  successRate?: number; // % of time this persona catches issues
  createdAt: string;
  isBuiltIn: boolean;
  isActive: boolean;
}

export interface PersonaListResponse {
  personas: Persona[];
  total: number;
}
