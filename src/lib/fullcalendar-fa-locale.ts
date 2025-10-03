// Farsi (Persian) locale for FullCalendar
export const faLocale = {
  code: 'fa',
  week: {
    dow: 6, // Saturday is the first day of the week
    doy: 4,
  },
  direction: 'rtl' as const,
  buttonText: {
    prev: 'قبلی',
    next: 'بعدی',
    today: 'امروز',
    month: 'ماه',
    week: 'هفته',
    day: 'روز',
    list: 'لیست',
  },
  weekText: 'هفته',
  allDayText: 'تمام روز',
  moreLinkText: (n: number) => `+ ${n} مورد دیگر`,
  noEventsText: 'رویدادی برای نمایش وجود ندارد',
  dayHeaderFormat: { weekday: 'short' },
  dayNames: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'],
  dayNamesShort: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه'],
};

