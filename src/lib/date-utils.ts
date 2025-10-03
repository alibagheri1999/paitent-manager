/**
 * Date utilities for Jalali (Persian) calendar
 * Pure JavaScript implementation - no external dependencies
 */

import { 
  gregorianToJalali, 
  formatJalaliDate, 
  jalaliToGregorian,
  parseJalaliToISO,
  getPersianMonthName,
  getPersianDayName,
  englishToPersianNumbers
} from './jalali-converter';

/**
 * Convert Gregorian date to Jalali (Persian/Solar) date
 * @param date Date string or Date object
 * @param format Output format
 * @returns Formatted Jalali date string
 */
export function toJalali(date: Date | string, format: string = 'jYYYY/jMM/jDD'): string {
  if (!date) return '';
  
  try {
    const gDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(gDate.getTime())) return '';
    
    const jalali = gregorianToJalali(gDate);
    
    // Handle different format patterns
    let result = format;
    
    // Year formats
    result = result.replace(/jYYYY/g, String(jalali.year));
    result = result.replace(/jYY/g, String(jalali.year).slice(-2));
    
    // Month formats
    result = result.replace(/jMMMM/g, jalali.monthName); // Full month name
    result = result.replace(/jMMM/g, jalali.monthName.substring(0, 3)); // Short month name
    result = result.replace(/jMM/g, String(jalali.month).padStart(2, '0')); // 2-digit month
    result = result.replace(/jM/g, String(jalali.month)); // 1-digit month
    
    // Day formats
    result = result.replace(/jDD/g, String(jalali.day).padStart(2, '0')); // 2-digit day
    result = result.replace(/jD/g, String(jalali.day)); // 1-digit day
    
    return result;
  } catch (error) {
    console.error('Error converting to Jalali:', error);
    return '';
  }
}

/**
 * Convert Jalali date to Gregorian ISO format for backend
 * @param jalaliDate Jalali date string (format: YYYY/MM/DD or YYYY-MM-DD)
 * @returns ISO date string in Gregorian (YYYY-MM-DD) for backend
 */
export function jalaliToGregorianISO(jalaliDate: string): string {
  return parseJalaliToISO(jalaliDate);
}

/**
 * Convert Jalali date to Gregorian Date object
 * @param jalaliDate Jalali date string (format: YYYY/MM/DD)
 * @returns Date object in Gregorian
 */
export function toGregorian(jalaliDate: string): Date {
  try {
    const isoDate = jalaliToGregorianISO(jalaliDate);
    return isoDate ? new Date(isoDate) : new Date();
  } catch (error) {
    console.error('Error converting to Gregorian:', error);
    return new Date();
  }
}

/**
 * Format date with Jalali calendar
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'تاریخ نامعتبر';
    }
    
    return formatJalaliDate(dateObj, { format: 'long', locale: 'fa' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'تاریخ نامعتبر';
  }
}

/**
 * Format date and time with Jalali calendar
 */
export function formatDateTime(date: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'تاریخ نامعتبر';
    }
    
    const jalaliDate = formatJalaliDate(dateObj, { format: 'long', locale: 'fa' });
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${jalaliDate} - ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'تاریخ نامعتبر';
  }
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'زمان نامعتبر';
    }
    
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'زمان نامعتبر';
  }
}

/**
 * Get current date in Jalali
 */
export function getCurrentJalaliDate(format: string = 'jYYYY/jMM/jDD'): string {
  return toJalali(new Date(), format);
}

/**
 * Get relative time (e.g., "2 روز پیش")
 */
export function getRelativeTime(date: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffSec < 60) return 'همین الان';
    if (diffMin < 60) return `${diffMin} دقیقه پیش`;
    if (diffHour < 24) return `${diffHour} ساعت پیش`;
    if (diffDay < 30) return `${diffDay} روز پیش`;
    if (diffMonth < 12) return `${diffMonth} ماه پیش`;
    return `${diffYear} سال پیش`;
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Return ISO format for input type="date"
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

/**
 * Format date for Excel export
 */
export function formatDateForExcel(date: string | Date): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return formatJalaliDate(dateObj, { separator: '/', locale: 'fa' });
  } catch (error) {
    console.error('Error formatting date for Excel:', error);
    return '';
  }
}

/**
 * Format datetime for Excel export
 */
export function formatDateTimeForExcel(date: string | Date): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const jalaliDate = formatJalaliDate(dateObj, { separator: '/', locale: 'fa' });
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${jalaliDate} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting datetime for Excel:', error);
    return '';
  }
}

/**
 * Parse Jalali date from input (various formats)
 */
export function parseJalaliDate(jalaliStr: string): Date | null {
  if (!jalaliStr) return null;
  
  try {
    const isoDate = parseJalaliToISO(jalaliStr);
    return isoDate ? new Date(isoDate) : null;
  } catch (error) {
    console.error('Error parsing Jalali date:', error);
    return null;
  }
}

/**
 * Get Jalali month names
 */
export const jalaliMonthNames = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/**
 * Get Jalali day names
 */
export const jalaliDayNames = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه',
];

/**
 * Get short day names
 */
export const jalaliDayNamesShort = [
  'ی',
  'د',
  'س',
  'چ',
  'پ',
  'ج',
  'ش',
];
