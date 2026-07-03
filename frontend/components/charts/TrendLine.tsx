"use client";
import { useMemo } from "react";
import { cn } from "@/utils/cn";

interface DataPoint {
  date: string;
  value: number;
}

interface TrendLineProps {
  data: DataPoint[];
  color?: string;
  width?: number;
  height?: number;
  showDots?: boolean;
  className?: string;
  gradient?: boolean;
  label?: string;
}

/**
 * Lightweight hand-rolled SVG sparkline.
 * No chart library dependency — minimal bundle footprint.
 */
export function TrendLine({
  data,
  color = "#6C5CE7",
  width = 200,
  height = 60,
  showDots = true,
  className,
  gradient = true,
  label,
}: TrendLineProps) {
  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const { points, pathD, areaD } = useMemo(() => {
    if (!data.length) return { points: [], pathD: "", areaD: "" };

    const values = data.map((d) => d.value);
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const range = maxV - minV || 1;

    const pts = values.map((v, i) => ({
      x: padding + (i / (values.length - 1)) * chartWidth,
      y: padding + chartHeight - ((v - minV) / range) * chartHeight,
    }));

    // Build smooth path using cubic bezier curves
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = (pts[i - 1].x + pts[i].x) / 2;
      const cp1y = pts[i - 1].y;
      const cp2x = (pts[i - 1].x + pts[i].x) / 2;
      const cp2y = pts[i].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i].x} ${pts[i].y}`;
    }

    // Area path (filled)
    const areaBottom = padding + chartHeight;
    const area =
      `${d} L ${pts[pts.length - 1].x} ${areaBottom} L ${pts[0].x} ${areaBottom} Z`;

    return { points: pts, pathD: d, areaD: area };
  }, [data, chartWidth, chartHeight]);

  const gradientId = `tl-${color.replace("#", "")}-${width}`;

  if (!data.length) {
    return (
      <div
        style={{ width, height }}
        className={cn(
          "flex items-center justify-center text-xs text-ink-muted",
          className
        )}
      >
        No data
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {label && (
        <p className="text-xs text-ink-muted mb-1 font-sans">{label}</p>
      )}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label={label ?? "Trend line chart"}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {gradient && (
          <path d={areaD} fill={`url(#${gradientId})`} />
        )}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {showDots &&
          points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="3"
              fill="white"
              stroke={color}
              strokeWidth="2"
            />
          ))}
      </svg>
    </div>
  );
}
