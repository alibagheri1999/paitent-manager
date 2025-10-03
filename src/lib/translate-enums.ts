// Translation functions for backend enums

/**
 * Translate appointment status from backend
 */
export function translateAppointmentStatus(status: string): string {
  const translations: Record<string, string> = {
    'SCHEDULED': 'برنامه‌ریزی شده',
    'CONFIRMED': 'تایید شده',
    'IN_PROGRESS': 'در حال انجام',
    'COMPLETED': 'تکمیل شده',
    'CANCELLED': 'لغو شده',
    'NO_SHOW': 'عدم حضور',
  };
  
  return translations[status] || status;
}

/**
 * Translate payment status from backend
 */
export function translatePaymentStatus(status: string): string {
  const translations: Record<string, string> = {
    'PAID': 'پرداخت شده',
    'UNPAID': 'پرداخت نشده',
    'PARTIALLY_PAID': 'پرداخت جزئی',
    'PENDING': 'در انتظار',
  };
  
  return translations[status] || status;
}

/**
 * Translate payment method from backend
 */
export function translatePaymentMethod(method: string): string {
  const translations: Record<string, string> = {
    'CASH': 'نقدی',
    'CARD': 'کارت',
    'TRANSFER': 'انتقال',
    'INSURANCE': 'بیمه',
    'INSTALLMENT': 'قسطی',
  };
  
  return translations[method] || method;
}

/**
 * Translate treatment type from backend
 */
export function translateTreatmentType(type: string): string {
  const translations: Record<string, string> = {
    'CLEANING': 'جرم‌گیری',
    'FILLING': 'ترمیم دندان',
    'EXTRACTION': 'کشیدن دندان',
    'ROOT_CANAL': 'عصب‌کشی',
    'CROWN': 'روکش دندان',
    'BRIDGE': 'بریج',
    'IMPLANT': 'ایمپلنت',
    'DENTURE': 'دندان مصنوعی',
    'WHITENING': 'سفید کردن دندان',
    'BRACES': 'ارتودنسی',
    'ORTHODONTICS': 'ارتودنسی',
    'COSMETIC': 'زیبایی',
    'CHECKUP': 'معاینه',
    'CONSULTATION': 'مشاوره',
    'EMERGENCY': 'اورژانس',
    'OTHER': 'سایر',
  };
  
  return translations[type] || type;
}

/**
 * Translate staff role from backend
 */
export function translateStaffRole(role: string): string {
  const translations: Record<string, string> = {
    'ADMIN': 'مدیر',
    'DENTIST': 'دندانپزشک',
    'HYGIENIST': 'بهداشت‌کار دندان',
    'ASSISTANT': 'دستیار',
    'RECEPTIONIST': 'منشی',
    'MANAGER': 'مدیر',
    'DOCTOR': 'دکتر',
    'EMPLOYEE': 'کارمند',
    'FINANCE': 'مالی',
  };
  
  return translations[role] || role;
}

/**
 * Translate user role from backend
 */
export function translateUserRole(role: string): string {
  return translateStaffRole(role);
}

/**
 * Translate active/inactive status
 */
export function translateActiveStatus(isActive: boolean): string {
  return isActive ? 'فعال' : 'غیرفعال';
}

/**
 * Translate day of week
 */
export function translateDayOfWeek(day: string): string {
  const translations: Record<string, string> = {
    'SATURDAY': 'شنبه',
    'SUNDAY': 'یکشنبه',
    'MONDAY': 'دوشنبه',
    'TUESDAY': 'سه‌شنبه',
    'WEDNESDAY': 'چهارشنبه',
    'THURSDAY': 'پنج‌شنبه',
    'FRIDAY': 'جمعه',
    'Saturday': 'شنبه',
    'Sunday': 'یکشنبه',
    'Monday': 'دوشنبه',
    'Tuesday': 'سه‌شنبه',
    'Wednesday': 'چهارشنبه',
    'Thursday': 'پنج‌شنبه',
    'Friday': 'جمعه',
  };
  
  return translations[day] || day;
}

/**
 * Translate record/file type
 */
export function translateFileType(type: string): string {
  const translations: Record<string, string> = {
    'XRAY': 'رادیوگرافی',
    'PHOTO': 'عکس',
    'DOCUMENT': 'سند',
    'PRESCRIPTION': 'نسخه',
    'OTHER': 'سایر',
  };
  
  return translations[type] || type;
}

/**
 * Get status color for badges
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'SCHEDULED': 'bg-blue-100 text-blue-800',
    'CONFIRMED': 'bg-green-100 text-green-800',
    'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
    'COMPLETED': 'bg-gray-100 text-gray-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'NO_SHOW': 'bg-purple-100 text-purple-800',
    'PAID': 'bg-green-100 text-green-800',
    'UNPAID': 'bg-red-100 text-red-800',
    'PARTIALLY_PAID': 'bg-yellow-100 text-yellow-800',
    'PENDING': 'bg-gray-100 text-gray-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

