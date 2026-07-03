"use client";
import { use } from "react";
import { useStressTest } from "@/hooks/useStressTest";
import { HealthRing } from "@/components/charts/HealthRing";
import { Card } from "@/components/ui/Card";
import { RiskBadge } from "@/components/common/RiskBadge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/constants/routes";
import { formatDuration } from "@/lib/formatters";

import { cn } from "@/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { PersonaConversation } from "@/types/run.types";
import { FileText, StopCircle } from "lucide-react";

interface LiveRunPageProps {
  params: Promise<{ runId: string }>;
}

export default function LiveRunPage({ params }: LiveRunPageProps) {
  const { runId } = use(params);
  const { run, loading } = useStressTest(runId);

  if (loading || !run) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <HealthRing score={0} size="lg" running gradientId="loading-ring" label="Loading…" />
      </div>
    );
  }

  const isRunning = run.status === "running";
  const isComplete = run.status === "complete";
  const progress = Math.round(
    (run.metrics.completedConversations / run.metrics.totalConversations) * 100
  );

  return (
    <div className="page-container">
      <PageHeader
        title={isRunning ? "Test Running…" : "Test Complete"}
        subtitle={`${run.agentName} · ${run.config.selectedPersonaIds.length} personas · ${run.config.difficulty} difficulty`}
        breadcrumb={[
          { label: "Stress Tests", href: ROUTES.STRESS_TEST },
          { label: run.id },
        ]}
        action={
          isComplete && run.id === "run-001" ? (
            <Link href={ROUTES.REPORT_DETAIL("report-001")}>
              <Button variant="gradient" leftIcon={<FileText className="w-4 h-4" />}>
                View Report
              </Button>
            </Link>
          ) : isRunning ? (
            <Button variant="danger" leftIcon={<StopCircle className="w-4 h-4" />}>
              Cancel Run
            </Button>
          ) : null
        }
      />

      {/* Main layout: pulse grid + health ring + risk tally */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persona pulse grid */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-sm font-semibold font-display text-ink mb-5">
              Persona Conversations
              <span className="ml-2 text-ink-muted font-normal text-xs">
                {run.metrics.completedConversations}/{run.metrics.totalConversations} complete
              </span>
            </h2>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-signature"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            {/* Persona dot grid */}
            <div className="flex flex-wrap gap-4">
              <AnimatePresence>
                {run.conversations.map((conv, i) => (
                  <PersonaDot key={conv.id} conversation={conv} index={i} isRunning={isRunning} />
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Right column: Health ring + risk tally */}
        <div className="space-y-4">
          {/* Live Health Ring */}
          <Card className="p-6 flex flex-col items-center">
            <p className="text-xs text-ink-muted mb-4 font-sans text-center">
              {isRunning ? "Computing AI Health Score…" : "Final AI Health Score"}
            </p>
            <HealthRing
              score={run.metrics.avgHealthScore}
              size="lg"
              gradientId={`ring-run-${runId}`}
              label={isRunning ? "live" : "overall"}
              running={isRunning}
            />
            <div className="mt-4 text-center">
              <p className="text-xs text-ink-muted">
                {run.metrics.completedConversations} conversations scored
              </p>
            </div>
          </Card>

          {/* Risk tally */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold font-display text-ink mb-4">
              Risk Tally
            </h3>
            <div className="space-y-3">
              {[
                { level: "critical" as const, count: run.metrics.criticalRisks, label: "Critical" },
                { level: "medium" as const, count: run.metrics.mediumRisks, label: "Medium" },
                { level: "low" as const, count: run.metrics.lowRisks, label: "Low" },
              ].map(({ level, count }) => (
                <div key={level} className="flex items-center justify-between">
                  <RiskBadge level={level} size="sm" />
                  <span className="text-sm font-bold font-mono text-ink">{count}</span>
                </div>
              ))}
            </div>

            {run.metrics.durationMs && (
              <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Duration</span>
                  <span className="font-mono text-ink font-medium">
                    {formatDuration(run.metrics.durationMs)}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// Persona dot — pulses while running, settles to risk color on complete
function PersonaDot({
  conversation,
  index,
  isRunning,
}: {
  conversation: PersonaConversation;
  index: number;
  isRunning: boolean;
}) {
  const isConvRunning = conversation.status === "running";
  const isConvComplete = conversation.status === "complete";
  const riskLevel = conversation.riskLevel ?? "safe";
  const riskColors = {
    critical: "#FF5A5F",
    medium: "#FFB020",
    low: "#8ED1B0",
    safe: "#00C2A8",
  };
  const bgColor = isConvComplete ? riskColors[riskLevel] : conversation.personaColor;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-xl",
          "border-2 transition-all duration-500",
          isConvRunning && isRunning ? "persona-dot-running" : "",
          isConvComplete ? "border-transparent" : "border-white shadow-sm"
        )}
        style={{
          backgroundColor: `${bgColor}20`,
          borderColor: isConvComplete ? bgColor : "transparent",
          boxShadow: isConvRunning ? `0 0 16px ${bgColor}60` : "none",
        }}
        title={`${conversation.personaName} — ${conversation.status}`}
      >
        {conversation.personaEmoji}
      </div>
      <span className="text-2xs text-ink-muted text-center max-w-[48px] truncate">
        {conversation.personaName.split(" ")[0]}
      </span>
      {isConvComplete && conversation.healthScore !== undefined && (
        <span
          className="text-2xs font-bold font-mono"
          style={{ color: bgColor }}
        >
          {conversation.healthScore}
        </span>
      )}
    </motion.div>
  );
}
