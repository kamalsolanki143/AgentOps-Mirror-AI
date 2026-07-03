import { format, formatDistanceToNow, parseISO } from "date-fns";

// ── Score Formatters ──────────────────────────────────────────────────────

/** Format a 0-100 score as "94%" */
export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

/** Format a 0-100 score as "94.2" (one decimal) */
export function formatScoreDecimal(score: number): string {
  return score.toFixed(1);
}

/** Format a score for display in the health ring center */
export function formatHealthScore(score: number): string {
  return String(Math.round(score));
}

// ── Latency Formatters ────────────────────────────────────────────────────

/** Format milliseconds as "1.2s" or "340ms" */
export function formatLatency(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${Math.round(ms)}ms`;
}

// ── Date Formatters ───────────────────────────────────────────────────────

/** Format ISO date as "Jan 15, 2025" */
export function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

/** Format ISO date as "Jan 15, 2025 at 3:42 PM" */
export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return iso;
  }
}

/** Format ISO date as relative time: "2 hours ago" */
export function formatRelative(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

// ── Number Formatters ─────────────────────────────────────────────────────

/** Format large numbers: 1200 → "1.2k" */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

/** Format duration in ms as "2m 34s" */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/** Format a score delta as "+5.2" or "-3.1" */
export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}`;
}
