"use client";
import { useReports } from "@/hooks/useReports";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { RiskBadge } from "@/components/common/RiskBadge";
import { HealthRing } from "@/components/charts/HealthRing";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { formatDate } from "@/lib/formatters";
import { FileText, ArrowRight } from "lucide-react";
import { scoreToRiskLevel } from "@/utils/riskLevel";

export default function ReportsPage() {
  const { reports, loading, error } = useReports();

  return (
    <div className="page-container">
      <PageHeader title="Reports" subtitle="AI Health Score reports from completed stress test runs" />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#F3F4F6] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 border-red-200 bg-red-50/30 text-center max-w-xl mx-auto my-12">
          <p className="text-sm text-ink-muted">Error loading reports: {error}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Link key={report.id} href={ROUTES.REPORT_DETAIL(report.id)} className="block">
              <Card hover className="p-5">
                <div className="flex items-center gap-5">
                  {/* Score ring */}
                  <HealthRing
                    score={report.scores.overall}
                    size="sm"
                    gradientId={`report-ring-${report.id}`}
                    showScore
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-semibold font-display text-ink truncate">
                        {report.agentName}
                      </h3>
                      <RiskBadge level={scoreToRiskLevel(report.scores.overall)} size="sm" />
                    </div>
                    <p className="text-xs text-ink-muted">
                      {report.totalConversations} conversations · {report.flaggedConversations} flagged ·{" "}
                      {report.riskSummary.critical} critical risks
                    </p>
                  </div>

                  {/* Date + arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-ink-muted hidden sm:block">
                      {formatDate(report.createdAt)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-12 h-12 text-ink-muted mb-4" />
          <h3 className="text-base font-semibold font-display text-ink mb-1">No reports yet</h3>
          <p className="text-sm text-ink-muted mb-6">Run a stress test to generate your first report.</p>
          <Link href={ROUTES.STRESS_TEST}>
            <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
              Start a Stress Test
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
