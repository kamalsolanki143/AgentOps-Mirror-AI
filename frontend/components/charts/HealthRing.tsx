"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/utils/cn";

import { formatHealthScore } from "@/lib/formatters";

// ── Size presets ──────────────────────────────────────────────────────────
const SIZE_PRESETS = {
  sm: { size: 48, strokeWidth: 4, fontSize: "text-xs", labelSize: "text-2xs" },
  md: { size: 120, strokeWidth: 8, fontSize: "text-xl", labelSize: "text-xs" },
  lg: { size: 240, strokeWidth: 12, fontSize: "text-2xl", labelSize: "text-sm" },
} as const;

type RingSizePreset = keyof typeof SIZE_PRESETS;

interface HealthRingProps {
  score: number;             // 0–100
  size?: RingSizePreset;
  sizeOverride?: number;     // px, overrides preset
  label?: string;            // shown below score in ring
  running?: boolean;         // triggers heartbeat pulse
  className?: string;
  showScore?: boolean;
  gradientId?: string;       // unique SVG gradient ID (required when multiple rings on page)
}

/**
 * HealthRing — The visual signature of AgentOps Mirror AI.
 * An animated circular progress ring that fills with a violet→teal gradient
 * as the AI Health Score computes. Pulses with a heartbeat animation
 * while a test is running.
 */
export function HealthRing({
  score,
  size = "md",
  sizeOverride,
  label,
  running = false,
  className,
  showScore = true,
  gradientId = "health-ring-gradient",
}: HealthRingProps) {
  const preset = SIZE_PRESETS[size];
  const diameter = sizeOverride ?? preset.size;
  const strokeWidth = preset.strokeWidth;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = diameter / 2;

  // Animate the score value
  const motionScore = useMotionValue(0);
  const spring = useSpring(motionScore, { stiffness: 80, damping: 20 });
  const dashOffset = useTransform(
    spring,
    [0, 100],
    [circumference, 0]
  );

  useEffect(() => {
    motionScore.set(score);
  }, [score, motionScore]);



  // Use a unique gradient ID to prevent SVG conflicts when multiple rings rendered
  const uniqueGradientId = `${gradientId}-${diameter}`;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center flex-shrink-0",
        running && "animate-health-pulse",
        className
      )}
      style={{ width: diameter, height: diameter }}
      role="img"
      aria-label={`Health score: ${score}%`}
    >
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="absolute inset-0 rotate-[-90deg]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={uniqueGradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6C5CE7" />
            <stop offset="100%" stopColor="#00C2A8" />
          </linearGradient>
          {/* Glow filter for running state */}
          <filter id={`${uniqueGradientId}-glow`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track ring (background) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring — animated fill */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${uniqueGradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
          filter={running ? `url(#${uniqueGradientId}-glow)` : undefined}
        />
      </svg>

      {/* Score label in center */}
      {showScore && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <ScoreNumber
            spring={spring}
            className={cn("font-display font-bold text-ink leading-none", preset.fontSize)}
          />
          {label && (
            <span
              className={cn(
                "text-ink-muted font-sans leading-tight mt-0.5 text-center",
                preset.labelSize
              )}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Animated number that counts up
function ScoreNumber({
  spring,
  className,
}: {
  spring: ReturnType<typeof useSpring>;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatHealthScore(latest);
      }
    });
    return unsubscribe;
  }, [spring]);

  return (
    <span ref={ref} className={cn("font-mono", className)}>
      0
    </span>
  );
}
