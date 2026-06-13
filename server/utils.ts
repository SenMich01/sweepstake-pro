import { nanoid } from "nanoid";

/**
 * Generate a URL-safe slug from a pool name
 * Combines the name with a unique ID to ensure uniqueness
 */
export function generatePoolSlug(poolName: string): string {
  const sanitized = poolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniqueId = nanoid(6).toLowerCase();
  return `${sanitized}-${uniqueId}`;
}

/**
 * Fisher-Yates shuffle algorithm for random team assignment
 * Ensures no duplicates and true randomness
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate points based on tournament stage
 * Used for leaderboard ranking
 */
export function calculatePoints(stage: string): number {
  const stagePoints: Record<string, number> = {
    "Group Stage": 1,
    "Round of 16": 2,
    "Quarter-Finals": 4,
    "Semi-Finals": 8,
    Final: 12,
    Winner: 16,
  };
  return stagePoints[stage] || 0;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | string, currency: string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });
  return formatter.format(num);
}

/**
 * Generate WhatsApp share message
 */
export function generateWhatsAppMessage(
  poolName: string,
  poolUrl: string,
  participantCount: number
): string {
  return `🎉 Join my World Cup Sweepstake! 🏆\n\n${poolName}\n${participantCount} participants already joined!\n\nView the results: ${poolUrl}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
