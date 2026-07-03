"use client";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/Card";
import { HealthRing } from "@/components/charts/HealthRing";
import { RiskBadge } from "@/components/common/RiskBadge";
import { ROUTES } from "@/constants/routes";
import { formatRelative } from "@/lib/formatters";
import { scoreToRiskLevel } from "@/utils/riskLevel";
import type { Agent } from "@/types/agent.types";

const STATUS_DOTS: Record<Agent["status"], string> = {
  healthy: "bg-accent",
  warning: "bg-risk-medium",
  critical: "bg-risk-critical",
  idle: "bg-[#D1D5DB]",
  testing: "bg-primary animate-pulse",
};

interface AgentSummaryCardProps {
  agent: Agent;
}

export function AgentSummaryCard({ agent }: AgentSummaryCardProps) {
  const riskLevel = scoreToRiskLevel(agent.healthScore);

  return (
    <Link href={ROUTES.REPORTS} className="block group" tabIndex={-1}>
      <Card
        hover
        className="p-5 flex gap-4 items-start cursor-pointer"
      >
        {/* Small HealthRing */}
        <HealthRing
          score={agent.healthScore}
          size="sm"
          gradientId={`ring-${agent.id}`}
          label=""
          showScore={true}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn("w-2 h-2 rounded-full flex-shrink-0", STATUS_DOTS[agent.status])}
            />
            <h3 className="text-sm font-semibold font-display text-ink truncate group-hover:text-primary transition-colors">
              {agent.name}
            </h3>
          </div>

          {agent.description && (
            <p className="text-xs text-ink-muted line-clamp-2 mb-3 leading-relaxed">
              {agent.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <RiskBadge level={riskLevel} size="sm" />
            <span className="text-2xs text-ink-muted">
              {agent.testsRun} tests run
            </span>
          </div>

          {agent.lastRunAt && (
            <p className="text-2xs text-ink-muted mt-2">
              Last run {formatRelative(agent.lastRunAt)}
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
