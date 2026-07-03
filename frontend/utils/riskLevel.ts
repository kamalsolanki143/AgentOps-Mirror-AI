import type { RiskLevel } from "@/types/run.types";

// ── Risk Level Mapping ────────────────────────────────────────────────────

interface RiskMeta {
  level: RiskLevel;
  label: string;
  color: string;       // text color token
  bgColor: string;     // background color token
  borderColor: string;
  emoji: string;
  description: string;
}

const RISK_MAP: Record<RiskLevel, RiskMeta> = {
  critical: {
    level: "critical",
    label: "Critical",
    color: "text-risk-critical",
    bgColor: "bg-risk-critical-bg",
    borderColor: "border-risk-critical/30",
    emoji: "🔴",
    description: "Immediate action required — security or major UX failure",
  },
  medium: {
    level: "medium",
    label: "Medium",
    color: "text-risk-medium",
    bgColor: "bg-risk-medium-bg",
    borderColor: "border-risk-medium/30",
    emoji: "🟠",
    description: "Should be addressed — affects reliability or user trust",
  },
  low: {
    level: "low",
    label: "Low",
    color: "text-[#5A9A7E]",
    bgColor: "bg-risk-low-bg",
    borderColor: "border-risk-low/30",
    emoji: "🟡",
    description: "Minor optimization opportunity",
  },
  safe: {
    level: "safe",
    label: "Safe",
    color: "text-accent",
    bgColor: "bg-risk-safe-bg",
    borderColor: "border-accent/30",
    emoji: "🟢",
    description: "No issues detected",
  },
};

/**
 * Maps a numeric health score (0–100) to a risk level.
 * Higher score = safer agent.
 */
export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 85) return "safe";
  if (score >= 65) return "low";
  if (score >= 40) return "medium";
  return "critical";
}

/**
 * Returns all metadata for a risk level.
 */
export function getRiskMeta(level: RiskLevel): RiskMeta {
  return RISK_MAP[level];
}

/**
 * Returns Tailwind classes for risk badge styling.
 */
export function getRiskClasses(level: RiskLevel): {
  text: string;
  bg: string;
  border: string;
} {
  const meta = RISK_MAP[level];
  return {
    text: meta.color,
    bg: meta.bgColor,
    border: meta.borderColor,
  };
}

/**
 * Maps score to hex color for SVG/canvas use.
 */
export function scoreToColor(score: number): string {
  if (score >= 85) return "#00C2A8"; // accent teal
  if (score >= 65) return "#8ED1B0"; // risk-low
  if (score >= 40) return "#FFB020"; // risk-medium
  return "#FF5A5F"; // risk-critical
}
