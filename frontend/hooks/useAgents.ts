"use client";
import { useState, useEffect } from "react";
import { agentsService } from "@/services/agents.service";
import type { Agent, AgentListResponse } from "@/types/agent.types";

export function useAgents() {
  const [data, setData] = useState<AgentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    agentsService
      .list()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { agents: data?.agents ?? [], total: data?.total ?? 0, loading, error };
}

export function useAgent(id: string) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    agentsService
      .getById(id)
      .then(setAgent)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { agent, loading, error };
}
