import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "۰ تومان";
  }
  
  const absAmount = Math.abs(amount);
  
  // For amounts >= 1 million, show in millions
  if (absAmount >= 1000000) {
    const millions = amount / 1000000;
    const formatted = new Intl.NumberFormat("fa-IR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(millions);
    return `${formatted} میلیون تومان`;
  }
  
  // For amounts >= 1000, show in thousands
  if (absAmount >= 1000) {
    const thousands = amount / 1000;
    const formatted = new Intl.NumberFormat("fa-IR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(thousands);
    return `${formatted} هزار تومان`;
  }
  
  // For amounts < 1000, show as is
  return new Intl.NumberFormat("fa-IR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " تومان";
}

// Re-export date functions from date-utils for backward compatibility
export { formatDate, formatDateTime, formatTime, toJalali, jalaliToGregorianISO, getCurrentJalaliDate } from './date-utils';

export function generatePatientCode(firstName: string, lastName: string): string {
  const prefix = firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}
