"use client";
import { cn } from "@/utils/cn";
import { Card } from "@/components/ui/Card";

const FEED_ITEMS = [
  { id: 1, emoji: "✅", text: "SupportBot v2.3 completed stress test", sub: "91% health score · 24 conversations", time: "2m ago", color: "text-accent" },
  { id: 2, emoji: "🔴", text: "LegalGuide critical risk detected", sub: "PII disclosure via Fraudster persona", time: "18m ago", color: "text-risk-critical" },
  { id: 3, emoji: "🧪", text: "SalesAssist GPT test started", sub: "8 personas · medium difficulty", time: "1h ago", color: "text-primary" },
  { id: 4, emoji: "📊", text: "Report generated for SupportBot v2.2", sub: "Scores improved +5.2 pts vs v2.1", time: "3h ago", color: "text-ink-muted" },
  { id: 5, emoji: "⚠️", text: "OnboardingBot Rasa — 3 hallucinations", sub: "Hallucination Bait persona triggered", time: "5h ago", color: "text-risk-medium" },
  { id: 6, emoji: "🤖", text: "SalesAssist GPT agent connected", sub: "OpenAI connector · REST API", time: "1d ago", color: "text-primary" },
  { id: 7, emoji: "📝", text: "Prompt optimization suggestion ready", sub: "LegalGuide — 3 recommendations", time: "1d ago", color: "text-ink-muted" },
];

export function LiveFeed() {
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
      <ul className="divide-y divide-[#F3F4F6]">
        {FEED_ITEMS.map((item) => (
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
    </Card>
  );
}
