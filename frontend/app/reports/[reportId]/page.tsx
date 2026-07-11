"use client";
import { use, useEffect, useState } from "react";
import { reportsService } from "@/services/reports.service";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { HealthRing } from "@/components/charts/HealthRing";
import { RiskBadge } from "@/components/common/RiskBadge";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import type { Report } from "@/types/report.types";
import { formatDate } from "@/lib/formatters";
import { Download, GitBranch } from "lucide-react";
import { cn } from "@/utils/cn";

const SCORE_LABELS: Record<string, string> = {
  reliability: "Reliability",
  security: "Security",
  businessGoal: "Business Goal",
  hallucination: "Hallucination-Free",
  quality: "Quality",
  latency: "Latency",
};

interface ReportDetailPageProps {
  params: Promise<{ reportId: string }>;
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { reportId } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    reportsService.getById(reportId)
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading report:", err);
        setError("Failed to load report details.");
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return (
      <div className="page-container max-w-5xl">
        <PageHeader title="Loading Report..." />
        <div className="h-64 rounded-2xl bg-[#F3F4F6] animate-pulse" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="page-container max-w-5xl">
        <PageHeader title="Error" />
        <Card className="p-8 border-red-200 bg-red-50/30 text-center">
          <p className="text-sm text-ink-muted">{error || "Report not found."}</p>
        </Card>
      </div>
    );
  }

  const scoreEntries = Object.entries(report.scores).filter(([k]) => k !== "overall") as [string, number][];

  return (
    <div className="page-container max-w-5xl">
      <PageHeader
        title={`Report — ${report.agentName}`}
        subtitle={`Generated ${formatDate(report.generatedAt)} · ${report.totalConversations} conversations`}
        breadcrumb={[{ label: "Reports", href: ROUTES.REPORTS }, { label: report.agentName }]}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" leftIcon={<GitBranch className="w-3.5 h-3.5" />}>
              GitHub Issue
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Overall score hero */}
      <Card className="p-6 mb-6 bg-gradient-signature-soft border-primary/20">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <HealthRing
            score={report.scores.overall}
            size="lg"
            gradientId={`report-detail-ring-${reportId}`}
            label="AI Health Score"
          />
          <div>
            <h2 className="text-xl font-bold font-display text-ink mb-2">
              {report.scores.overall >= 85 ? "Your agent is healthy" :
               report.scores.overall >= 65 ? "Some improvements needed" :
               report.scores.overall >= 40 ? "Several issues found" : "Critical issues detected"}
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed max-w-lg">
              {report.flaggedConversations} of {report.totalConversations} conversations had issues.{" "}
              {report.riskSummary.critical} critical, {report.riskSummary.medium} medium, {report.riskSummary.low} low severity risks found.
            </p>
            <div className="flex gap-3 mt-4">
              <RiskBadge level="critical" count={report.riskSummary.critical} />
              <RiskBadge level="medium" count={report.riskSummary.medium} />
              <RiskBadge level="low" count={report.riskSummary.low} />
            </div>
          </div>
        </div>
      </Card>

      {/* Score breakdown — 6 small rings */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-base font-semibold font-display text-ink">Score Breakdown</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {scoreEntries.map(([key, score], i) => (
              <div key={key} className="flex flex-col items-center gap-2">
                <HealthRing
                  score={score}
                  size="sm"
                  sizeOverride={64}
                  gradientId={`score-ring-${key}-${i}`}
                  label=""
                  showScore
                />
                <span className="text-2xs text-ink-muted text-center font-sans leading-tight">
                  {SCORE_LABELS[key] ?? key}
                </span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Risk list */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold font-display text-ink">Risk Items</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {report.risks.map((risk) => (
              <div
                key={risk.id}
                className={cn(
                  "rounded-xl border p-4",
                  risk.level === "critical" ? "border-risk-critical/20 bg-risk-critical-bg" :
                  risk.level === "medium" ? "border-risk-medium/20 bg-risk-medium-bg" :
                  "border-risk-low/20 bg-risk-low-bg"
                )}
              >
                <div className="flex items-start gap-3">
                  <RiskBadge level={risk.level} size="sm" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-ink mb-1">{risk.title}</h4>
                    <p className="text-xs text-ink-muted leading-relaxed mb-2">{risk.description}</p>
                    <blockquote className="text-xs font-mono text-ink bg-white/70 rounded-lg p-2.5 border border-[#E5E7EB] mb-2 italic">
                      {risk.messageExcerpt}
                    </blockquote>
                    <p className="text-xs text-ink-muted">
                      <span className="font-semibold text-ink">Recommendation:</span> {risk.recommendation}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-2xs text-ink-muted">
                        {risk.personaEmoji} {risk.personaName}
                      </span>
                      <span className="text-2xs text-ink-muted">·</span>
                      <span className="text-2xs text-ink-muted">Seen {risk.count}×</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-2xs"
                        onClick={() => {}}
                      >
                        View Replay →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
