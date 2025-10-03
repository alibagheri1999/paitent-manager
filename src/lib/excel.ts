import * as XLSX from 'xlsx';
import { formatDateForExcel as formatJalaliDateForExcel, formatDateTimeForExcel as formatJalaliDateTimeForExcel } from './date-utils';

export interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExcelExportOptions
): void {
  if (!data || data.length === 0) {
    throw new Error('هیچ داده‌ای برای خروجی وجود ندارد');
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'صفحه۱');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${options.filename}.xlsx`);
}

export function formatDateForExcel(date: string | Date): string {
  return formatJalaliDateForExcel(date);
}

export function formatDateTimeForExcel(date: string | Date): string {
  return formatJalaliDateTimeForExcel(date);
}

export function formatCurrencyForExcel(amount: number): string {
  if (amount === null || amount === undefined) return '۰';
  return new Intl.NumberFormat('fa-IR').format(amount);
}

export function formatFileUrls(files: any[]): string {
  if (!files || files.length === 0) return '';
  return files.map(file => file.fileUrl || '').filter(url => url).join('; ');
}
