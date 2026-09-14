import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in integer paise to currency display (e.g., 49900 -> ₹499.00)
 */
export function formatPaise(paise: number, currency = "INR"): string {
  const units = paise / 100;
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(units);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(units);
}

/**
 * Convert standard unit (e.g. 499.50) to integer paise (49950)
 */
export function toPaise(rupees: number | string): number {
  const num = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Generate standard PayCore prefixed identifiers
 */
export function generateId(prefix: "ord" | "pay" | "plink" | "cust" | "qr" | "wh" | "ref" | "sess" | "key"): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${randomStr}`;
}

export function generateOrderNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${rand}`;
}
