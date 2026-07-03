"use client";
import { useEffect, useState } from "react";
import { analyticsService, type AnalyticsData } from "@/services/analytics.service";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { TrendLine } from "@/components/charts/TrendLine";
import { RiskHeatmap } from "@/components/charts/RiskHeatmap";
import { HealthRing } from "@/components/charts/HealthRing";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAll().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div className="page-container">
        <PageHeader title="Analytics" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { trends, heatmap, versionComparison } = data;

  return (
    <div className="page-container">
      <PageHeader title="Analytics" subtitle="Historical trends, failure patterns, and version comparison" />

      {/* Trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { title: "Overall Health Score", data: trends.overallHealthScore, color: "#6C5CE7", desc: "7-week trend" },
          { title: "Hallucination Incidents", data: trends.hallucination, color: "#FFB020", desc: "Fewer is better" },
          { title: "Security Incidents", data: trends.security, color: "#FF5A5F", desc: "Fewer is better" },
        ].map((chart) => (
          <Card key={chart.title}>
            <CardHeader>
              <h3 className="text-sm font-semibold font-display text-ink">{chart.title}</h3>
              <p className="text-2xs text-ink-muted mt-0.5">{chart.desc}</p>
            </CardHeader>
            <CardBody>
              <TrendLine
                data={chart.data}
                color={chart.color}
                width={280}
                height={80}
                showDots
                gradient
              />
              <div className="flex justify-between mt-2">
                <span className="text-2xs text-ink-muted">6 weeks ago</span>
                <span className="text-2xs text-ink-muted">This week</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-base font-semibold font-display text-ink">Failure Heatmap</h2>
          <p className="text-xs text-ink-muted mt-0.5">Failure count by persona over time</p>
        </CardHeader>
        <CardBody>
          <RiskHeatmap data={heatmap} />
        </CardBody>
      </Card>

      {/* Version comparison */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold font-display text-ink">Version Comparison</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {["Version", "Run Date", "Overall", "Reliability", "Security", "Hallucination"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-ink-muted py-2 pr-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {versionComparison.map((v, i) => (
                  <tr key={v.version} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-3 pr-4 text-sm font-mono font-bold text-ink">{v.version}</td>
                    <td className="py-3 pr-4 text-xs text-ink-muted">{v.runDate}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <HealthRing score={v.overall} size="sm" sizeOverride={32} gradientId={`vc-ring-${i}`} />
                        <span className="text-sm font-bold font-mono text-ink">{v.overall}%</span>
                      </div>
                    </td>
                    {([v.reliability, v.security, v.hallucination] as number[]).map((score, j) => (
                      <td key={j} className="py-3 pr-4">
                        <span
                          className="text-sm font-mono font-bold"
                          style={{ color: score >= 80 ? "#00C2A8" : score >= 60 ? "#FFB020" : "#FF5A5F" }}
                        >
                          {score}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
