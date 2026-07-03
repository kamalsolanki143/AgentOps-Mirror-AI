import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for safe, conflict-free class merging.
 * Usage: cn("base-class", condition && "conditional", "other-class")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
