"use client";
import { useEffect, useState } from "react";
import { analyticsService, type TimeSeriesData, type RiskDistribution, type FindingTrend } from "@/services/analytics.service";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { TrendLine } from "@/components/charts/TrendLine";
import { RiskHeatmap } from "@/components/charts/RiskHeatmap";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [riskDist, setRiskDist] = useState<RiskDistribution[]>([]);
  const [findingTrends, setFindingTrends] = useState<FindingTrend[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      analyticsService.getTimeSeries(42), // 6 weeks
      analyticsService.getRiskDistribution(),
      analyticsService.getFindingTrends(),
    ])
      .then(([ts, risk, trends]) => {
        setTimeSeries(ts);
        setRiskDist(risk);
        setFindingTrends(trends);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading analytics:", err);
        setError("Failed to load analytics data from API.");
        setLoading(false);
      });
  }, []);

  if (loading) {
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

  if (error) {
    return (
      <div className="page-container">
        <PageHeader title="Analytics" />
        <Card className="p-8 border-red-200 bg-red-50/30 text-center max-w-xl mx-auto my-12">
          <p className="text-sm text-ink-muted">Error: {error}</p>
        </Card>
      </div>
    );
  }

  // Map time series to TrendLine data shape
  const overallHealthTrend = timeSeries.map((t) => ({ date: t.date, value: t.average_score || 0 }));
  const runVolumeTrend = timeSeries.map((t) => ({ date: t.date, value: t.runs || 0 }));

  // Map risk distribution to Heatmap format (fake weeks since we only get category/count)
  const heatmapData = riskDist.map((r) => ({
    persona: r.category,
    week: "All Time",
    failureCount: r.count,
  }));

  return (
    <div className="page-container">
      <PageHeader title="Analytics" subtitle="Historical trends, failure patterns, and finding trends" />

      {/* Trend charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold font-display text-ink">Overall Health Score</h3>
            <p className="text-2xs text-ink-muted mt-0.5">30-day trend</p>
          </CardHeader>
          <CardBody>
            <TrendLine data={overallHealthTrend} color="#6C5CE7" width={280} height={80} showDots gradient />
            <div className="flex justify-between mt-2">
              <span className="text-2xs text-ink-muted">{timeSeries[0]?.date}</span>
              <span className="text-2xs text-ink-muted">{timeSeries[timeSeries.length - 1]?.date}</span>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold font-display text-ink">Test Run Volume</h3>
            <p className="text-2xs text-ink-muted mt-0.5">Tests executed</p>
          </CardHeader>
          <CardBody>
            <TrendLine data={runVolumeTrend} color="#FFB020" width={280} height={80} showDots gradient />
            <div className="flex justify-between mt-2">
              <span className="text-2xs text-ink-muted">{timeSeries[0]?.date}</span>
              <span className="text-2xs text-ink-muted">{timeSeries[timeSeries.length - 1]?.date}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Heatmap mapped from Risk Distribution */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-base font-semibold font-display text-ink">Risk Distribution</h2>
          <p className="text-xs text-ink-muted mt-0.5">Failure count mapped to risk categories</p>
        </CardHeader>
        <CardBody>
          <RiskHeatmap data={heatmapData} />
        </CardBody>
      </Card>

      {/* Finding Trends replacing Version comparison */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold font-display text-ink">Finding Trends</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left text-xs font-medium text-ink-muted py-2 pr-4 whitespace-nowrap">
                    Finding Type
                  </th>
                  <th className="text-left text-xs font-medium text-ink-muted py-2 pr-4 whitespace-nowrap">
                    Occurrences (Count)
                  </th>
                </tr>
              </thead>
              <tbody>
                {findingTrends.map((ft) => (
                  <tr key={ft.finding_type} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="py-3 pr-4 text-sm font-bold text-ink">{ft.finding_type}</td>
                    <td className="py-3 pr-4 text-sm font-mono text-ink-muted">{ft.count}</td>
                  </tr>
                ))}
                {findingTrends.length === 0 && (
                  <tr><td colSpan={2} className="py-4 text-center text-sm text-ink-muted">No findings recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
