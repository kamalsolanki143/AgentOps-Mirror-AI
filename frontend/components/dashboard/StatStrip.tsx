"use client";
import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/Card";
import { analyticsService } from "@/services/analytics.service";
import { useEffect, useState } from "react";

import { TrendLine } from "@/components/charts/TrendLine";

interface Stat {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  trend?: { date: string; value: number }[];
  trendColor?: string;
}

export function StatStrip() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAll().then((data) => {
      const { overview, trends } = data;
      setStats([
        {
          label: "Agents Connected",
          value: overview.agentsConnected,
          delta: "+1 this month",
          positive: true,
        },
        {
          label: "Tests This Week",
          value: overview.testsRunThisWeek,
          delta: "+3 vs last week",
          positive: true,
          trend: trends.overallHealthScore,
          trendColor: "#6C5CE7",
        },
        {
          label: "Avg Health Score",
          value: `${overview.avgHealthScore}%`,
          delta: "+5.2 pts this week",
          positive: true,
          trend: trends.overallHealthScore,
          trendColor: "#00C2A8",
        },
        {
          label: "Critical Issues Found",
          value: overview.criticalIssuesFound,
          delta: `${overview.issuesResolvedThisWeek} resolved`,
          positive: false,
          trend: trends.security,
          trendColor: "#FF5A5F",
        },
      ]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-gradient-to-r from-[#F3F4F6] to-[#E9EAEC] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 overflow-hidden relative">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-ink-muted font-sans mb-1">{stat.label}</p>
              <p className="text-xl font-bold font-display text-ink">
                {stat.value}
              </p>
              {stat.delta && (
                <p
                  className={cn(
                    "text-2xs mt-1 font-medium",
                    stat.positive ? "text-accent" : "text-risk-critical"
                  )}
                >
                  {stat.positive ? "↑" : "↓"} {stat.delta}
                </p>
              )}
            </div>
            {stat.trend && (
              <div className="opacity-70 flex-shrink-0 mt-1">
                <TrendLine
                  data={stat.trend}
                  width={60}
                  height={36}
                  color={stat.trendColor ?? "#6C5CE7"}
                  showDots={false}
                />
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
