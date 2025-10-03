// Farsi (Persian) translations for the application
export const translations = {
  // Common
  search: "جستجو",
  add: "افزودن",
  edit: "ویرایش",
  delete: "حذف",
  cancel: "لغو",
  save: "ذخیره",
  close: "بستن",
  back: "بازگشت",
  next: "بعدی",
  previous: "قبلی",
  loading: "در حال بارگذاری...",
  success: "موفقیت",
  error: "خطا",
  warning: "هشدار",
  confirm: "تایید",
  yes: "بله",
  no: "خیر",
  today: "امروز",
  
  // App Name
  appName: "مدیریت بیماران دندانپزشکی",
  appTitle: "دندان‌پزشکی",
  
  // Navigation
  nav: {
    dashboard: "داشبورد",
    patients: "بیماران",
    appointments: "نوبت‌ها",
    records: "پرونده‌ها",
    debts: "بدهی‌ها",
    analytics: "تحلیل و گزارش",
    staff: "کارمندان",
    settings: "تنظیمات",
    signOut: "خروج",
  },
  
  // Dashboard
  dashboard: {
    title: "داشبورد",
    description: "نمای کلی کلینیک دندانپزشکی",
    totalPatients: "کل بیماران",
    todayAppointments: "نوبت‌های امروز",
    monthlyRevenue: "درآمد ماهانه",
    activePatients: "بیماران فعال",
    recentAppointments: "نوبت‌های اخیر",
    upcomingAppointments: "نوبت‌های آینده",
    revenueChart: "نمودار درآمد",
    noAppointments: "نوبتی وجود ندارد",
    viewAll: "مشاهده همه",
  },
  
  // Patients
  patients: {
    title: "بیماران",
    description: "مدیریت بیماران کلینیک دندانپزشکی",
    addPatient: "افزودن بیمار",
    editPatient: "ویرایش بیمار",
    patientDetails: "جزئیات بیمار",
    searchPatients: "جستجوی بیماران...",
    exportPatients: "خروجی اکسل بیماران",
    firstName: "نام",
    lastName: "نام خانوادگی",
    fullName: "نام کامل",
    email: "ایمیل",
    phone: "تلفن",
    nationalId: "کد ملی",
    dateOfBirth: "تاریخ تولد",
    address: "آدرس",
    emergencyContact: "تماس اضطراری",
    emergencyPhone: "تلفن اضطراری",
    medicalHistory: "سابقه پزشکی",
    allergies: "حساسیت‌ها",
    notes: "یادداشت‌ها",
    insuranceInfo: "اطلاعات بیمه",
    insuranceProvider: "شرکت بیمه",
    insuranceNumber: "شماره بیمه",
    groupNumber: "شماره گروه",
    createdAt: "تاریخ ثبت",
    isActive: "وضعیت",
    active: "فعال",
    inactive: "غیرفعال",
    actions: "عملیات",
    viewHistory: "مشاهده تاریخچه",
    sendMessage: "ارسال پیام",
    debtOverview: "بررسی بدهی‌ها",
    debtOverviewDescription: "نمای سریع بیماران با پرداخت‌های معوق",
    totalDebt: "کل بدهی",
    patientCreated: "بیمار با موفقیت ایجاد شد",
    patientUpdated: "بیمار با موفقیت به‌روزرسانی شد",
    patientDeleted: "بیمار با موفقیت حذف شد",
    confirmDelete: "آیا مطمئن هستید که می‌خواهید این بیمار را حذف کنید؟",
    noPatients: "بیماری یافت نشد",
    required: "الزامی",
    firstNameRequired: "نام الزامی است",
    lastNameRequired: "نام خانوادگی الزامی است",
    invalidEmail: "ایمیل نامعتبر است",
  },
  
  // Appointments
  appointments: {
    title: "نوبت‌ها",
    description: "مدیریت نوبت‌های کلینیک",
    addAppointment: "افزودن نوبت",
    editAppointment: "ویرایش نوبت",
    appointmentDetails: "جزئیات نوبت",
    calendar: "تقویم",
    date: "تاریخ",
    time: "زمان",
    startTime: "زمان شروع",
    endTime: "زمان پایان",
    duration: "مدت زمان",
    patient: "بیمار",
    treatmentType: "نوع درمان",
    appointmentDescription: "توضیحات",
    status: "وضعیت",
    reschedule: "تغییر زمان",
    cancelAppointment: "لغو نوبت",
    confirmAppointment: "تایید نوبت",
    completeAppointment: "تکمیل نوبت",
    month: "ماه",
    week: "هفته",
    day: "روز",
    total: "کل",
    scheduled: "برنامه‌ریزی شده",
    confirmed: "تایید شده",
    inProgress: "در حال انجام",
    completed: "تکمیل شده",
    cancelled: "لغو شده",
    noShow: "عدم حضور",
    appointmentCreated: "نوبت با موفقیت ایجاد شد",
    appointmentUpdated: "نوبت با موفقیت به‌روزرسانی شد",
    appointmentCancelled: "نوبت با موفقیت لغو شد",
    noAppointments: "نوبتی یافت نشد",
    selectDate: "انتخاب تاریخ",
    selectPatient: "انتخاب بیمار",
    cancellationReason: "دلیل لغو",
  },
  
  // Records
  records: {
    title: "پرونده‌ها",
    description: "مدیریت پرونده‌های درمانی",
    addRecord: "افزودن پرونده",
    editRecord: "ویرایش پرونده",
    recordDetails: "جزئیات پرونده",
    treatmentType: "نوع درمان",
    date: "تاریخ",
    diagnosis: "تشخیص",
    treatment: "درمان",
    prescription: "نسخه",
    cost: "هزینه",
    paid: "پرداخت شده",
    remaining: "باقیمانده",
    paymentStatus: "وضعیت پرداخت",
    fullyPaid: "پرداخت کامل",
    partiallyPaid: "پرداخت جزئی",
    unpaid: "پرداخت نشده",
    files: "فایل‌ها",
    uploadFiles: "بارگذاری فایل",
    downloadFile: "دانلود فایل",
    deleteFile: "حذف فایل",
    recordCreated: "پرونده با موفقیت ایجاد شد",
    recordUpdated: "پرونده با موفقیت به‌روزرسانی شد",
    recordDeleted: "پرونده با موفقیت حذف شد",
    noRecords: "پرونده‌ای یافت نشد",
    exportRecords: "خروجی اکسل پرونده‌ها",
    teethChart: "نمودار دندان",
    xray: "رادیوگرافی",
    photo: "عکس",
  },
  
  // Debts
  debts: {
    title: "بدهی‌ها",
    description: "مدیریت بدهی‌های بیماران",
    totalDebt: "کل بدهی",
    patientName: "نام بیمار",
    amount: "مبلغ",
    dueDate: "سررسید",
    overdue: "معوق",
    paid: "پرداخت شده",
    pending: "در انتظار",
    recordPayment: "ثبت پرداخت",
    paymentHistory: "تاریخچه پرداخت",
    noDebts: "بدهی‌ای یافت نشد",
    exportDebts: "خروجی اکسل بدهی‌ها",
  },
  
  // Analytics
  analytics: {
    title: "تحلیل و گزارش",
    description: "تحلیل عملکرد کلینیک",
    patientGrowth: "رشد بیماران",
    revenue: "درآمد",
    treatmentStats: "آمار درمان‌ها",
    monthlyRevenue: "درآمد ماهانه",
    yearlyRevenue: "درآمد سالانه",
    topTreatments: "پرطرفدارترین درمان‌ها",
    exportAnalytics: "خروجی اکسل گزارشات",
  },
  
  // Staff
  staff: {
    title: "کارمندان",
    description: "مدیریت کارمندان کلینیک",
    addStaff: "افزودن کارمند",
    editStaff: "ویرایش کارمند",
    name: "نام",
    role: "نقش",
    email: "ایمیل",
    phone: "تلفن",
    specialization: "تخصص",
    hireDate: "تاریخ استخدام",
    status: "وضعیت",
    active: "فعال",
    inactive: "غیرفعال",
    staffCreated: "کارمند با موفقیت ایجاد شد",
    staffUpdated: "کارمند با موفقیت به‌روزرسانی شد",
    noStaff: "کارمندی یافت نشد",
    roles: {
      admin: "مدیر",
      dentist: "دندانپزشک",
      hygienist: "بهداشت‌کار دندان",
      assistant: "دستیار",
      receptionist: "منشی",
    },
  },
  
  // Settings
  settings: {
    title: "تنظیمات",
    description: "تنظیمات کلینیک",
    clinicInfo: "اطلاعات کلینیک",
    clinicName: "نام کلینیک",
    clinicPhone: "تلفن کلینیک",
    clinicEmail: "ایمیل کلینیک",
    clinicAddress: "آدرس کلینیک",
    workingHours: "ساعات کاری",
    currency: "واحد پول",
    timezone: "منطقه زمانی",
    language: "زبان",
    settingsUpdated: "تنظیمات با موفقیت به‌روزرسانی شد",
  },
  
  // Payments
  payments: {
    amount: "مبلغ",
    paymentMethod: "روش پرداخت",
    paymentDate: "تاریخ پرداخت",
    cash: "نقدی",
    card: "کارت",
    transfer: "انتقال",
    insurance: "بیمه",
    installment: "قسطی",
    paymentRecorded: "پرداخت با موفقیت ثبت شد",
    paymentHistory: "تاریخچه پرداخت",
  },
  
  // Pagination
  pagination: {
    showing: "نمایش",
    of: "از",
    results: "نتیجه",
    page: "صفحه",
    perPage: "در هر صفحه",
    first: "اولین",
    last: "آخرین",
    noResults: "نتیجه‌ای یافت نشد",
  },
  
  // Status translations
  statuses: {
    SCHEDULED: "برنامه‌ریزی شده",
    CONFIRMED: "تایید شده",
    IN_PROGRESS: "در حال انجام",
    COMPLETED: "تکمیل شده",
    CANCELLED: "لغو شده",
    NO_SHOW: "عدم حضور",
    PENDING: "در انتظار",
    PAID: "پرداخت شده",
    UNPAID: "پرداخت نشده",
    PARTIALLY_PAID: "پرداخت جزئی",
  },
  
  // Treatment types (common ones)
  treatments: {
    cleaning: "جرم‌گیری",
    filling: "ترمیم دندان",
    extraction: "کشیدن دندان",
    rootCanal: "عصب‌کشی",
    crown: "روکش دندان",
    bridge: "بریج",
    implant: "ایمپلنت",
    denture: "دندان مصنوعی",
    whitening: "سفید کردن دندان",
    braces: "ارتودنسی",
    checkup: "معاینه",
    consultation: "مشاوره",
    emergency: "اورژانس",
    other: "سایر",
  },
  
  // Days of week
  days: {
    saturday: "شنبه",
    sunday: "یکشنبه",
    monday: "دوشنبه",
    tuesday: "سه‌شنبه",
    wednesday: "چهارشنبه",
    thursday: "پنج‌شنبه",
    friday: "جمعه",
  },
  
  // Months (Jalali)
  months: {
    farvardin: "فروردین",
    ordibehesht: "اردیبهشت",
    khordad: "خرداد",
    tir: "تیر",
    mordad: "مرداد",
    shahrivar: "شهریور",
    mehr: "مهر",
    aban: "آبان",
    azar: "آذر",
    dey: "دی",
    bahman: "بهمن",
    esfand: "اسفند",
  },
  
  // Messages
  messages: {
    confirmDelete: "آیا از حذف این مورد اطمینان دارید؟",
    deleteSuccess: "با موفقیت حذف شد",
    updateSuccess: "با موفقیت به‌روزرسانی شد",
    createSuccess: "با موفقیت ایجاد شد",
    errorOccurred: "خطایی رخ داد",
    noData: "داده‌ای برای نمایش وجود ندارد",
    savingChanges: "در حال ذخیره تغییرات...",
    saving: "در حال ذخیره...",
    pleaseWait: "لطفا صبر کنید...",
    invalidInput: "ورودی نامعتبر است",
    requiredField: "این فیلد الزامی است",
  },
  
  // Auth
  auth: {
    signIn: "ورود",
    signOut: "خروج",
    email: "ایمیل",
    password: "رمز عبور",
    rememberMe: "مرا به خاطر بسپار",
    forgotPassword: "رمز عبور را فراموش کردید؟",
    signInTitle: "ورود به سیستم",
    signInDescription: "برای ورود اطلاعات خود را وارد کنید",
    invalidCredentials: "ایمیل یا رمز عبور اشتباه است",
    signInSuccess: "با موفقیت وارد شدید",
    signOutSuccess: "با موفقیت خارج شدید",
  },
};

export type TranslationKey = keyof typeof translations;

// Helper function to get nested translation
export function t(key: string): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

