"use client";
import { useMemo } from "react";
import { cn } from "@/utils/cn";

interface HeatmapCell {
  persona: string;
  week: string;
  failureCount: number;
}

interface RiskHeatmapProps {
  data: HeatmapCell[];
  className?: string;
}

function getCellColor(count: number, maxCount: number): string {
  if (count === 0) return "#F3F4F6";
  const intensity = count / maxCount;
  if (intensity > 0.7) return "#FF5A5F"; // critical
  if (intensity > 0.4) return "#FFB020"; // medium
  if (intensity > 0.1) return "#FFD580"; // mild
  return "#8ED1B0"; // low
}

function getCellOpacity(count: number, maxCount: number): number {
  if (count === 0) return 1;
  return 0.4 + (count / maxCount) * 0.6;
}

export function RiskHeatmap({ data, className }: RiskHeatmapProps) {
  const { personas, weeks, matrix, maxCount } = useMemo(() => {
    const personaSet = Array.from(new Set(data.map((d) => d.persona)));
    const weekSet = Array.from(new Set(data.map((d) => d.week)));
    const counts = data.map((d) => d.failureCount);
    const max = Math.max(...counts, 1);

    const mat: Record<string, Record<string, number>> = {};
    personaSet.forEach((p) => {
      mat[p] = {};
      weekSet.forEach((w) => {
        mat[p][w] = 0;
      });
    });
    data.forEach((d) => {
      mat[d.persona][d.week] = d.failureCount;
    });

    return { personas: personaSet, weeks: weekSet, matrix: mat, maxCount: max };
  }, [data]);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="border-separate border-spacing-1 min-w-full">
        <thead>
          <tr>
            <th className="w-36" />
            {weeks.map((week) => (
              <th
                key={week}
                className="text-2xs font-medium text-ink-muted text-center pb-2 w-16"
              >
                {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {personas.map((persona) => (
            <tr key={persona}>
              <td className="text-xs text-ink-muted pr-3 whitespace-nowrap font-sans py-0.5">
                {persona}
              </td>
              {weeks.map((week) => {
                const count = matrix[persona]?.[week] ?? 0;
                const bgColor = getCellColor(count, maxCount);
                const opacity = getCellOpacity(count, maxCount);
                return (
                  <td key={week} className="p-0">
                    <div
                      title={`${persona} — ${week}: ${count} failures`}
                      className="w-14 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-default"
                      style={{ backgroundColor: bgColor, opacity }}
                    >
                      {count > 0 && (
                        <span className="text-2xs font-bold text-white drop-shadow-sm">
                          {count}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 ml-36">
        <span className="text-2xs text-ink-muted">Fewer failures</span>
        {["#8ED1B0", "#FFD580", "#FFB020", "#FF5A5F"].map((c) => (
          <div
            key={c}
            className="w-5 h-5 rounded"
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="text-2xs text-ink-muted">More failures</span>
      </div>
    </div>
  );
}
