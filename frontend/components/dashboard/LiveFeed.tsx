"use client";
import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/Card";
import { useState, useEffect } from "react";
import { analyticsService, type RecentRun } from "@/services/analytics.service";

const FEED_ITEMS = [
  { id: "mock-1", emoji: "✅", text: "SupportBot v2.3 completed stress test", sub: "91% health score · 24 conversations", time: "2m ago", color: "text-accent" },
  { id: "mock-2", emoji: "🔴", text: "LegalGuide critical risk detected", sub: "PII disclosure via Fraudster persona", time: "18m ago", color: "text-risk-critical" },
  { id: "mock-3", emoji: "🧪", text: "SalesAssist GPT test started", sub: "8 personas · medium difficulty", time: "1h ago", color: "text-primary" },
  { id: "mock-4", emoji: "📊", text: "Report generated for SupportBot v2.2", sub: "Scores improved +5.2 pts vs v2.1", time: "3h ago", color: "text-ink-muted" },
];

export function LiveFeed() {
  const [runs, setRuns] = useState<RecentRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboard()
      .then((data) => {
        setRuns(data.recent_runs || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const items = runs.length > 0
    ? runs.map((run) => {
        const score = run.score !== null ? Math.round(run.score * 100) : null;
        let emoji = "🧪";
        let color = "text-primary";
        let text = `Stress Test Run #${run.id} ${run.status}`;
        
        if (run.status === "completed") {
          emoji = "✅";
          color = "text-accent";
          text = `Stress Test #${run.id} completed successfully`;
        } else if (run.status === "failed") {
          emoji = "🔴";
          color = "text-risk-critical";
          text = `Stress Test #${run.id} failed`;
        } else if (run.status === "cancelled") {
          emoji = "⚠️";
          color = "text-ink-muted";
          text = `Stress Test #${run.id} was cancelled`;
        }

        const dateStr = new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          id: run.id,
          emoji,
          text,
          sub: score !== null ? `Health Score: ${score}%` : "In queue / processing",
          time: dateStr,
          color,
        };
      })
    : FEED_ITEMS;

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
        <h3 className="text-sm font-semibold font-display text-ink">
          Activity Feed
        </h3>
        <span className="flex items-center gap-1.5 text-2xs text-accent font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Live
        </span>
      </div>
      {loading ? (
        <div className="p-5 space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-[#F3F4F6]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 px-5 py-3.5 hover:bg-[#FAFAFC] transition-colors"
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-medium text-ink leading-snug", item.color)}>
                  {item.text}
                </p>
                <p className="text-2xs text-ink-muted mt-0.5">{item.sub}</p>
              </div>
              <span className="text-2xs text-ink-muted flex-shrink-0 mt-0.5">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
