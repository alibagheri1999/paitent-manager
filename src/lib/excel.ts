import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  options: ExcelExportOptions
): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${options.filename}.xlsx`);
}

export function formatDateForExcel(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTimeForExcel(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrencyForExcel(amount: number): string {
  if (amount === null || amount === undefined) return '0.00';
  return amount.toFixed(2);
}

export function formatFileUrls(files: any[]): string {
  if (!files || files.length === 0) return '';
  return files.map(file => file.fileUrl || '').filter(url => url).join('; ');
}
