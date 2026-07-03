"use client";
import { useState, useEffect } from "react";
import { agentsService } from "@/services/agents.service";
import type { Agent } from "@/types/agent.types";
import { scoreToRiskLevel } from "@/utils/riskLevel";

export function useHealthScore(agentId?: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!agentId) return;
    Promise.resolve().then(() => setLoading(true));
    agentsService
      .getById(agentId)
      .then(setAgent)
      .finally(() => setLoading(false));
  }, [agentId]);

  const score = agent?.healthScore ?? 0;
  const riskLevel = scoreToRiskLevel(score);

  return { score, riskLevel, agent, loading };
}
