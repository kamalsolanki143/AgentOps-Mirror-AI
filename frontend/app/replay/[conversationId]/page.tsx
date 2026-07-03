"use client";
import { use, useEffect, useState } from "react";
import { reportsService } from "@/services/reports.service";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { formatLatency } from "@/lib/formatters";
import type { ConversationReplay } from "@/types/conversation.types";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { HealthRing } from "@/components/charts/HealthRing";

const ANNOTATION_COLORS = {
  hallucination: "border-l-risk-medium bg-risk-medium-bg",
  security_risk: "border-l-risk-critical bg-risk-critical-bg",
  jailbreak_attempt: "border-l-primary bg-primary/5",
  business_goal_miss: "border-l-risk-medium bg-risk-medium-bg",
  quality_issue: "border-l-risk-low bg-risk-low-bg",
  latency_spike: "border-l-[#9CA3AF] bg-[#F9FAFB]",
  safe: "",
};

interface ReplayPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ReplayPage({ params }: ReplayPageProps) {
  const { conversationId } = use(params);
  const [replay, setReplay] = useState<ConversationReplay | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    reportsService.getConversation(conversationId).then((data) => {
      setReplay(data);
      setCurrentStep(data.messages.length - 1); // Show all by default
    });
  }, [conversationId]);

  useEffect(() => {
    if (!playing || !replay) return;
    if (currentStep >= replay.messages.length - 1) {
      const timer = setTimeout(() => setPlaying(false), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), 1200);
    return () => clearTimeout(timer);
  }, [playing, currentStep, replay]);

  if (!replay) return null;

  const visibleMessages = replay.messages.slice(0, currentStep + 1);
  const activeMessage = replay.messages[currentStep];

  return (
    <div className="page-container max-w-5xl">
      <PageHeader
        title="Conversation Replay"
        subtitle={`${replay.personaEmoji} ${replay.personaName} → ${replay.agentName}`}
        breadcrumb={[{ label: "Reports", href: ROUTES.REPORTS }, { label: "Replay" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat transcript */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {/* Controls */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#E5E7EB] bg-[#FAFAFC]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Prev
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPlaying((p) => !p)}
                leftIcon={playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              >
                {playing ? "Pause" : "Play"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep((s) => Math.min(replay.messages.length - 1, s + 1))}
                disabled={currentStep === replay.messages.length - 1}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
              <span className="ml-auto text-xs text-ink-muted font-mono">
                {currentStep + 1} / {replay.messages.length}
              </span>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {visibleMessages.map((msg) => {
                const isUser = msg.role === "user";
                const isFlagged = msg.annotations.some((a) => a.type !== "safe");
                const critAnnotation = msg.annotations.find((a) => a.severity === "critical");

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      isUser ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0",
                        isUser ? "text-xl" : "bg-primary/10 text-primary font-bold font-display"
                      )}
                    >
                      {isUser ? replay.personaEmoji : "A"}
                    </div>

                    {/* Bubble */}
                    <div className={cn("max-w-[75%]", isUser ? "" : "items-end flex flex-col")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm leading-relaxed border-l-4",
                          isUser
                            ? "bg-[#F3F4F6] text-ink border-l-transparent rounded-tl-sm"
                            : isFlagged
                            ? critAnnotation
                              ? "border-l-risk-critical bg-risk-critical-bg text-ink rounded-tr-sm"
                              : "border-l-risk-medium bg-risk-medium-bg text-ink rounded-tr-sm"
                            : "bg-primary/5 text-ink border-l-primary/30 rounded-tr-sm"
                        )}
                      >
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-2xs text-ink-muted font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                        {msg.latencyMs && (
                          <span className="text-2xs text-ink-muted">
                            {formatLatency(msg.latencyMs)}
                          </span>
                        )}
                        {msg.annotations.filter(a => a.type !== "safe").map((ann, i) => (
                          <span
                            key={i}
                            className={cn(
                              "text-2xs font-bold px-1.5 py-0.5 rounded",
                              ann.severity === "critical" ? "bg-risk-critical text-white" :
                              "bg-risk-medium text-white"
                            )}
                          >
                            {ann.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Side panel: annotations + reasoning */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <HealthRing score={replay.healthScore} size="sm" gradientId={`replay-ring-${conversationId}`} />
              <div>
                <p className="text-xs text-ink-muted">Health Score</p>
                <p className="text-sm font-bold font-display text-ink">{replay.personaName}</p>
              </div>
            </div>
            <div className="text-xs text-ink-muted leading-relaxed border-t border-[#E5E7EB] pt-3">
              {replay.summary}
            </div>
          </Card>

          {activeMessage && (
            <Card className="p-5">
              <h3 className="text-xs font-semibold text-ink mb-3 uppercase tracking-wide">
                Step {activeMessage.index + 1} Analysis
              </h3>
              {activeMessage.reasoning && (
                <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB] mb-3">
                  <p className="text-2xs text-ink-muted font-medium mb-1">AI Reasoning</p>
                  <p className="text-xs text-ink leading-relaxed">{activeMessage.reasoning}</p>
                </div>
              )}
              {activeMessage.annotations.map((ann, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl p-3 border-l-4 mb-2",
                    ANNOTATION_COLORS[ann.type] || "bg-[#F9FAFB] border-l-[#E5E7EB]"
                  )}
                >
                  <p className="text-xs font-semibold text-ink mb-0.5">{ann.label}</p>
                  <p className="text-2xs text-ink-muted leading-relaxed">{ann.detail}</p>
                  {ann.score && (
                    <p className="text-2xs font-mono text-ink-muted mt-1">
                      Confidence: {ann.score}%
                    </p>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
