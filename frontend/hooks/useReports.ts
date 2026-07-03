"use client";
import { useState, useEffect } from "react";
import { reportsService } from "@/services/reports.service";
import type { Report, ReportListResponse } from "@/types/report.types";

export function useReports() {
  const [data, setData] = useState<ReportListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    reportsService
      .list()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { reports: data?.reports ?? [], total: data?.total ?? 0, loading, error };
}

export function useReport(id: string) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    reportsService
      .getById(id)
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { report, loading, error };
}
