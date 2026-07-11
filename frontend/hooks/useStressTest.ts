"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { stressTestService } from "@/services/stressTest.service";
import type { StressTestRun } from "@/types/run.types";

const POLL_INTERVAL_MS = 3000;

export function useStressTest(runId?: string) {
  const [run, setRun] = useState<StressTestRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRun = useCallback(async () => {
    if (!runId) return;
    try {
      const data = await stressTestService.getById(runId);
      setRun(data);
      // Stop polling when run is complete or failed
      if (data.status === "completed" || data.status === "failed" || data.status === "cancelled") {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch run");
    }
  }, [runId]);

  useEffect(() => {
    if (!runId) return;
    Promise.resolve().then(() => {
      setLoading(true);
      fetchRun().finally(() => setLoading(false));
    });

    // Poll while run might be active
    pollingRef.current = setInterval(fetchRun, POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [runId, fetchRun]);

  return { run, loading, error };
}

export function useStressTestList(agentId?: string) {
  const [runs, setRuns] = useState<StressTestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    stressTestService
      .list(agentId)
      .then((data) => setRuns(data.runs))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [agentId]);

  return { runs, loading, error };
}
