import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number | string, currency: string = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });
  return formatter.format(num);
}
// Add this to client/src/lib/utils.ts

export function getMaxParticipants(plan: "free" | "pro"): number {
  if (plan === "pro") {
    return 100; // Pro plan allows up to 100 participants
  }
  return 8; // Free plan allows up to 8 participants
}
