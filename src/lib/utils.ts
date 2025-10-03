import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "۰ ریال";
  }
  // Format currency for Iranian Rial
  return "ریال " + new Intl.NumberFormat("fa-IR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Re-export date functions from date-utils for backward compatibility
export { formatDate, formatDateTime, formatTime, toJalali, jalaliToGregorianISO, getCurrentJalaliDate } from './date-utils';

export function generatePatientCode(firstName: string, lastName: string): string {
  const prefix = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}
