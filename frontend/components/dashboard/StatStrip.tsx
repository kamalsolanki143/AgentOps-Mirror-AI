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
    analyticsService.getDashboard().then((dashboard) => {
      setStats([
        {
          label: "Tests This Week",
          value: dashboard.total_runs,
          delta: "+3 vs last week",
          positive: true,
        },
        {
          label: "Avg Health Score",
          value: `${dashboard.average_score || 0}%`,
          delta: "+5.2 pts this week",
          positive: true,
        },
        {
          label: "Completed Runs",
          value: dashboard.completed_runs,
          positive: true,
        },
        {
          label: "Failed Runs",
          value: dashboard.failed_runs,
          positive: false,
        },
      ]);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load stat strip data:", err);
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
