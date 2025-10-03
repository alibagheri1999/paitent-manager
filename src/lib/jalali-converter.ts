/**
 * Pure JavaScript Jalali (Persian/Farsi) Date Converter
 * No external dependencies - converts Gregorian dates to Jalali
 */

/**
 * Persian (Farsi) month names
 */
const PERSIAN_MONTHS = [
  'فروردین',    // Farvardin (1)
  'اردیبهشت',   // Ordibehesht (2)
  'خرداد',      // Khordad (3)
  'تیر',        // Tir (4)
  'مرداد',      // Mordad (5)
  'شهریور',     // Shahrivar (6)
  'مهر',        // Mehr (7)
  'آبان',       // Aban (8)
  'آذر',        // Azar (9)
  'دی',         // Dey (10)
  'بهمن',       // Bahman (11)
  'اسفند'       // Esfand (12)
];

/**
 * Persian month names in English
 */
const PERSIAN_MONTHS_EN = [
  'Farvardin',
  'Ordibehesht',
  'Khordad',
  'Tir',
  'Mordad',
  'Shahrivar',
  'Mehr',
  'Aban',
  'Azar',
  'Dey',
  'Bahman',
  'Esfand'
];

/**
 * Persian day names
 */
const PERSIAN_DAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه'
];

/**
 * Jalali date interface
 */
export interface JalaliDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  monthNameEn: string;
}

/**
 * Converts Gregorian date to Jalali (Persian/Farsi) date
 * @param date - Gregorian date (Date object, string, or timestamp)
 * @returns Jalali date object
 */
export function gregorianToJalali(date: Date | string | number): JalaliDate {
  const gDate = new Date(date);
  
  const gy = gDate.getFullYear();
  const gm = gDate.getMonth() + 1;
  const gd = gDate.getDate();

  let jy: number, jm: number, jd: number;
  
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  
  if (gy > 1600) {
    jy = 979;
    const gyOffset = gy - 1600;
    const gy2 = (gm > 2) ? (gyOffset + 1) : gyOffset;
    let days = (365 * gyOffset) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + 
               (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    
    if (days < 186) {
      jm = 1 + Math.floor(days / 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + Math.floor((days - 186) / 30);
      jd = 1 + ((days - 186) % 30);
    }
  } else {
    jy = 0;
    const gyOffset = gy - 621;
    const gy2 = (gm > 2) ? (gyOffset + 1) : gyOffset;
    let days = (365 * gyOffset) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + 
               (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
    
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    
    if (days < 186) {
      jm = 1 + Math.floor(days / 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + Math.floor((days - 186) / 30);
      jd = 1 + ((days - 186) % 30);
    }
  }
  
  return {
    year: jy,
    month: jm,
    day: jd,
    monthName: PERSIAN_MONTHS[jm - 1],
    monthNameEn: PERSIAN_MONTHS_EN[jm - 1]
  };
}

/**
 * Converts Jalali date to Gregorian date
 * @param jy - Jalali year
 * @param jm - Jalali month (1-12)
 * @param jd - Jalali day
 * @returns Date object
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  let gy: number, gm: number, gd: number;
  
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }
  
  const days = (365 * jy) + ((Math.floor(jy / 33)) * 8) + (Math.floor(((jy % 33) + 3) / 4)) + 
               78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  
  gy += 400 * Math.floor(days / 146097);
  let daysRemaining = days % 146097;
  
  if (daysRemaining >= 36525) {
    daysRemaining--;
    gy += 100 * Math.floor(daysRemaining / 36524);
    daysRemaining %= 36524;
    
    if (daysRemaining >= 365) {
      daysRemaining++;
    }
  }
  
  gy += 4 * Math.floor(daysRemaining / 1461);
  daysRemaining %= 1461;
  
  if (daysRemaining >= 366) {
    daysRemaining--;
    gy += Math.floor(daysRemaining / 365);
    daysRemaining = daysRemaining % 365;
  }
  
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 
                 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  gm = 0;
  while (gm < 13 && daysRemaining >= sal_a[gm]) {
    daysRemaining -= sal_a[gm];
    gm++;
  }
  
  gd = daysRemaining + 1;
  
  return new Date(gy, gm - 1, gd);
}

/**
 * Format options for Jalali date
 */
export interface FormatOptions {
  separator?: string;
  locale?: 'en' | 'fa';
  format?: 'numeric' | 'short' | 'long';
  includeMonthName?: boolean;
}

/**
 * Formats Jalali date with various options
 * @param date - Gregorian date
 * @param options - Formatting options
 * @returns Formatted Jalali date string
 */
export function formatJalaliDate(date: Date | string | number, options: FormatOptions = {}): string {
  const {
    separator = '/',
    locale = 'fa',
    format = 'numeric',
    includeMonthName = false
  } = options;
  
  const jalali = gregorianToJalali(date);
  const year = jalali.year;
  const month = String(jalali.month).padStart(2, '0');
  const day = String(jalali.day).padStart(2, '0');
  
  if (format === 'long') {
    const monthName = locale === 'fa' ? jalali.monthName : jalali.monthNameEn;
    return `${day} ${monthName} ${year}`;
  }
  
  if (format === 'short') {
    const monthName = locale === 'fa' ? jalali.monthName : jalali.monthNameEn;
    return `${day} ${monthName.substring(0, 3)} ${year}`;
  }
  
  // numeric format
  if (includeMonthName) {
    const monthName = locale === 'fa' ? jalali.monthName : jalali.monthNameEn;
    return `${year}${separator}${month} (${monthName})${separator}${day}`;
  }
  
  return `${year}${separator}${month}${separator}${day}`;
}

/**
 * Get Persian month name by month number
 * @param monthNumber - Month number (1-12)
 * @param locale - 'fa' or 'en'
 * @returns Month name
 */
export function getPersianMonthName(monthNumber: number, locale: 'en' | 'fa' = 'en'): string {
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error('Month number must be between 1 and 12');
  }
  return locale === 'fa' ? PERSIAN_MONTHS[monthNumber - 1] : PERSIAN_MONTHS_EN[monthNumber - 1];
}

/**
 * Get Persian day name
 * @param date - Date object
 * @returns Persian day name
 */
export function getPersianDayName(date: Date | string | number): string {
  const gDate = new Date(date);
  return PERSIAN_DAYS[gDate.getDay()];
}

/**
 * Convert Persian/Arabic numerals to English
 * @param str - String with Persian/Arabic numerals
 * @returns String with English numerals
 */
export function persianToEnglishNumbers(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
}

/**
 * Convert English numerals to Persian
 * @param str - String with English numerals
 * @returns String with Persian numerals
 */
export function englishToPersianNumbers(str: string): string {
  return str.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
}

/**
 * Parse Jalali date string and convert to Gregorian ISO format
 * @param jalaliStr - Jalali date string (e.g., "1404/07/11" or "۱۴۰۴/۰۷/۱۱")
 * @returns ISO date string (YYYY-MM-DD) or empty string if invalid
 */
export function parseJalaliToISO(jalaliStr: string): string {
  try {
    // Convert Persian numbers to English
    const cleanDate = persianToEnglishNumbers(jalaliStr);
    
    // Parse the date
    const parts = cleanDate.split('/').map(p => parseInt(p.trim()));
    
    if (parts.length !== 3) {
      return '';
    }
    
    const [year, month, day] = parts;
    
    // Validate
    if (year < 1300 || year > 1500 || month < 1 || month > 12 || day < 1 || day > 31) {
      return '';
    }
    
    // Convert to Gregorian
    const gregorianDate = jalaliToGregorian(year, month, day);
    
    // Return ISO format
    return gregorianDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error parsing Jalali date:', error);
    return '';
  }
}

export { PERSIAN_MONTHS, PERSIAN_MONTHS_EN, PERSIAN_DAYS };

