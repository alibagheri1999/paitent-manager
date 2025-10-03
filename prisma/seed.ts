import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Iranian names
const firstNamesMale = [
  'علی', 'محمد', 'حسین', 'رضا', 'مهدی', 'احمد', 'حسن', 'امیر', 'سعید', 'مجید',
  'محسن', 'مسعود', 'بهمن', 'فرهاد', 'کاوه', 'پیمان', 'آرش', 'سینا', 'پوریا', 'امین',
  'داریوش', 'کیوان', 'شهرام', 'بهروز', 'منوچهر'
];

const firstNamesFemale = [
  'فاطمه', 'زهرا', 'مریم', 'سارا', 'نرگس', 'مهسا', 'نازنین', 'الهام', 'شیوا', 'ندا',
  'مینا', 'رویا', 'لیلا', 'شهره', 'پریسا', 'نیلوفر', 'ترانه', 'ساناز', 'هانیه', 'آزاده',
  'فریبا', 'فرزانه', 'شکوفه', 'سمیرا', 'مهناز'
];

const lastNames = [
  'احمدی', 'محمدی', 'کریمی', 'رضایی', 'حسینی', 'علی‌پور', 'نوری', 'مرادی', 'اکبری', 'صادقی',
  'میرزایی', 'حسن‌زاده', 'یوسفی', 'ابراهیمی', 'جعفری', 'رحمانی', 'قاسمی', 'باقری', 'فتحی', 'زارعی',
  'نجفی', 'موسوی', 'طاهری', 'عسگری', 'سلیمانی', 'خانی', 'شریفی', 'فرهادی', 'امینی', 'حیدری'
];

// Tehran addresses
const streets = [
  'ولیعصر', 'انقلاب', 'آزادی', 'شریعتی', 'کریمخان', 'ستارخان', 'میرداماد', 'نیاوران', 'پاسداران', 'فرمانیه',
  'ونک', 'سعادت‌آباد', 'تهرانپارس', 'نارمک', 'آجودانیه', 'اقدسیه', 'جردن', 'الهیه', 'یوسف‌آباد', 'شهرک غرب'
];

const neighborhoods = [
  'تهران', 'ونک', 'سعادت‌آباد', 'جردن', 'نیاوران', 'فرمانیه', 'یوسف‌آباد', 'شهرک غرب', 'پونک', 'تجریش',
  'میرداماد', 'قیطریه', 'زعفرانیه', 'کامرانیه', 'اختیاریه', 'پاسداران', 'الهیه', 'آجودانیه', 'اقدسیه', 'فرشته'
];

const treatments = [
  'CONSULTATION', 'CLEANING', 'FILLING', 'EXTRACTION', 'CROWN', 'BRIDGE', 'IMPLANT', 'ROOT_CANAL', 'ORTHODONTICS', 'COSMETIC', 'OTHER'
];

const appointmentStatuses = [
  'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
];

const medicalConditions = [
  'هیچ بیماری خاصی ندارد', 'دیابت نوع ۱', 'دیابت نوع ۲', 'فشار خون بالا', 'بیماری قلبی', 'آسم', 'حساسیت دارویی',
  'آرتریت', 'مشکلات تیروئید', 'اضطراب', 'افسردگی', 'آپنه خواب', 'میگرن'
];

const allergies = [
  'ندارد', 'پنی‌سیلین', 'لاتکس', 'بی‌حس کننده‌های موضعی', 'آسپرین', 'ایبوپروفن', 'غذاهای دریایی', 'آجیل', 'گرده گیاهان'
];

const insuranceProviders = [
  'بیمه ایران', 'بیمه تامین اجتماعی', 'بیمه سلامت ایرانیان', 'بیمه آسیا', 'بیمه دانا', 'بیمه پاسارگاد', 'بیمه البرز'
];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomPhoneNumber(): string {
  const prefixes = ['0912', '0913', '0914', '0915', '0916', '0917', '0918', '0919', '0921', '0922'];
  const prefix = getRandomItem(prefixes);
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `${prefix}${number}`;
}

function getRandomNationalId(): string {
  return (Math.floor(Math.random() * 9000000000) + 1000000000).toString().padStart(10, '0');
}

function generateAddress(): string {
  const number = Math.floor(Math.random() * 999) + 1;
  const street = getRandomItem(streets);
  const neighborhood = getRandomItem(neighborhoods);
  const building = Math.floor(Math.random() * 50) + 1;
  const unit = Math.floor(Math.random() * 20) + 1;
  return `تهران، ${neighborhood}، خیابان ${street}، پلاک ${number}، واحد ${unit}`;
}

function generateBirthDate(): Date {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 80;
  const maxYear = currentYear - 18;
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
}

async function main() {
  console.log('🌱 در حال ایجاد داده‌های نمونه با اطلاعات ایرانی...');

  // Clear existing data
  await prisma.record.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Create users with Iranian names
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.create({
    data: {
      name: 'دکتر مهدی احمدی',
      email: 'admin@dentalclinic.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const doctor = await prisma.user.create({
    data: {
      name: 'دکتر سارا کریمی',
      email: 'doctor@dentalclinic.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'DOCTOR',
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      name: 'زهرا محمدی',
      email: 'receptionist@dentalclinic.com',
      password: await bcrypt.hash('receptionist123', 12),
      role: 'RECEPTIONIST',
    },
  });

  const additionalDoctor = await prisma.user.create({
    data: {
      name: 'دکتر امیر رضایی',
      email: 'doctor2@dentalclinic.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'DOCTOR',
    },
  });

  console.log('✅ ایجاد ۴ کاربر');

  // Create 50 realistic Iranian patients
  const patients = [];
  for (let i = 0; i < 50; i++) {
    const isMale = Math.random() > 0.5;
    const firstName = isMale ? getRandomItem(firstNamesMale) : getRandomItem(firstNamesFemale);
    const lastName = getRandomItem(lastNames);
    const email = `patient${i + 1}@email.com`;
    const phone = getRandomPhoneNumber();
    const nationalId = getRandomNationalId();
    const dateOfBirth = generateBirthDate();
    const address = generateAddress();
    const emergencyFirstName = isMale ? getRandomItem(firstNamesFemale) : getRandomItem(firstNamesMale);
    const emergencyContact = `${emergencyFirstName} ${lastName}`;
    const emergencyPhone = getRandomPhoneNumber();
    const medicalHistory = getRandomItems(medicalConditions, Math.floor(Math.random() * 3) + 1).join('، ');
    const patientAllergies = getRandomItems(allergies, Math.floor(Math.random() * 2) + 1).join('، ');
    const notes = [
      'بیمار منظم، ترجیح به نوبت‌های صبح',
      'نیاز به زمان بیشتر برای درمان',
      'ترجیح به نوبت‌های بعدازظهر',
      'بیمار جدید، نیاز به معاینه کامل',
      'پیگیری درمان قبلی',
      'اضطراب دندانپزشکی - نیاز به رفتار ملایم',
      'ترجیح به همان دندانپزشک برای تداوم درمان',
      'نیاز به تایید بیمه',
      'پرداخت اقساطی',
      'بیمار VIP - اولویت در نوبت‌دهی'
    ][Math.floor(Math.random() * 10)];
    
    const userId = Math.random() > 0.5 ? admin.id : doctor.id;

    const patient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        nationalId,
        dateOfBirth,
        address,
        emergencyContact,
        emergencyPhone,
        medicalHistory,
        allergies: patientAllergies,
        notes,
        userId,
        isActive: Math.random() > 0.1,
      },
    });
    patients.push(patient);
  }

  console.log('✅ ایجاد ۵۰ بیمار');

  // Create 200 appointments
  const appointments = [];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const today = new Date();

  for (let i = 0; i < 200; i++) {
    const patient = getRandomItem(patients);
    const date = getRandomDate(sixMonthsAgo, today);
    const startHour = Math.floor(Math.random() * 8) + 8;
    const startMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const duration = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
    
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    const endHour = startHour + Math.floor(duration / 60);
    const endMinute = (startMinute + (duration % 60)) % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    const status = getRandomItem(appointmentStatuses) as any;
    const treatmentType = getRandomItem(treatments) as any;
    
    const descriptions = {
      'CONSULTATION': 'مشاوره و معاینه اولیه دندانپزشکی',
      'CLEANING': 'جرم‌گیری و بروساژ دندان',
      'FILLING': 'ترمیم دندان با کامپوزیت',
      'EXTRACTION': 'کشیدن دندان',
      'CROWN': 'روکش دندان',
      'BRIDGE': 'بریج دندان',
      'IMPLANT': 'کاشت ایمپلنت',
      'ROOT_CANAL': 'عصب‌کشی و درمان ریشه',
      'ORTHODONTICS': 'ارتودنسی و ردیف کردن دندان‌ها',
      'COSMETIC': 'زیبایی دندان',
      'OTHER': 'سایر خدمات دندانپزشکی'
    };
    
    const notes = [
      'بیمار به موقع حاضر شد',
      'عمل با موفقیت انجام شد',
      'نوبت بعدی برنامه‌ریزی شد',
      'بیمار نیاز به درمان تکمیلی دارد',
      'نیاز به تایید بیمه',
      'بیمار درخواست مسکن داشت',
      'مورد پیچیده - زمان بیشتری نیاز است',
      'آموزش‌های لازم به بیمار داده شد',
      'دستورالعمل‌های بعد از عمل ارائه شد',
      'نظرسنجی رضایت تکمیل شد'
    ];

    const userId = Math.random() > 0.5 ? admin.id : doctor.id;

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        date,
        startTime,
        endTime,
        status,
        treatmentType,
        description: descriptions[treatmentType as keyof typeof descriptions],
        notes: getRandomItem(notes),
        reminderSent: Math.random() > 0.3,
        userId,
      },
    });
    appointments.push(appointment);
  }

  console.log('✅ ایجاد ۲۰۰ نوبت');

  // Create 300 treatment records with Toman prices
  const records = [];
  for (let i = 0; i < 300; i++) {
    const patient = getRandomItem(patients);
    const treatmentType = getRandomItem(treatments) as any;
    const date = getRandomDate(sixMonthsAgo, today);
    
    // Prices in Toman
    const costRanges = {
      'CONSULTATION': [500000, 1000000],
      'CLEANING': [800000, 1500000],
      'FILLING': [1500000, 3000000],
      'EXTRACTION': [2000000, 5000000],
      'CROWN': [8000000, 20000000],
      'BRIDGE': [15000000, 30000000],
      'IMPLANT': [25000000, 50000000],
      'ROOT_CANAL': [5000000, 12000000],
      'ORTHODONTICS': [30000000, 80000000],
      'COSMETIC': [5000000, 25000000],
      'OTHER': [1000000, 5000000]
    };
    
    const [minCost, maxCost] = costRanges[treatmentType as keyof typeof costRanges];
    const cost = Math.random() * (maxCost - minCost) + minCost;
    
    const descriptions = {
      'CONSULTATION': 'معاینه جامع دندانپزشکی و برنامه‌ریزی درمان',
      'CLEANING': 'جرم‌گیری دندان، اسکیلینگ و پولیش',
      'FILLING': 'ترمیم دندان با کامپوزیت رنگی',
      'EXTRACTION': 'کشیدن دندان با بی‌حسی موضعی',
      'CROWN': 'روکش سرامیکی روی فلز',
      'BRIDGE': 'بریج ثابت با پانتیک‌های سرامیکی',
      'IMPLANT': 'کاشت ایمپلنت تیتانیوم با روکش',
      'ROOT_CANAL': 'عصب‌کشی و پر کردن کانال با گوتاپرکا',
      'ORTHODONTICS': 'برنامه‌ریزی ارتودنسی و نصب براکت',
      'COSMETIC': 'باندینگ زیبایی و سفید کردن دندان',
      'OTHER': 'خدمات تخصصی دندانپزشکی'
    };
    
    const notes = [
      'عمل با موفقیت انجام شد',
      'بیمار درمان را به خوبی تحمل کرد',
      'پیگیری بعدی توصیه می‌شود',
      'درخواست بیمه ثبت شد',
      'برنامه پرداخت اقساطی تنظیم شد',
      'آموزش‌های لازم به بیمار داده شد',
      'دستورالعمل‌های مراقبت بعد از عمل ارائه شد',
      'نظرسنجی رضایت تکمیل شد',
      'اقدامات کنترل کیفیت انجام شد',
      'مستندسازی کامل شد'
    ];

    const isCompleted = Math.random() > 0.15;
    const userId = Math.random() > 0.5 ? admin.id : doctor.id;

    const record = await prisma.record.create({
      data: {
        patientId: patient.id,
        treatmentType,
        description: descriptions[treatmentType as keyof typeof descriptions],
        cost: Math.round(cost / 100000) * 100000, // Round to nearest 100,000 Toman
        date,
        notes: getRandomItem(notes),
        isCompleted,
        userId,
      },
    });
    records.push(record);
  }

  console.log('✅ ایجاد ۳۰۰ پرونده درمانی');

  console.log('🎉 پایگاه داده با موفقیت با داده‌های ایرانی پر شد!');
  console.log('\n📊 خلاصه:');
  console.log('- ۴ کاربر (۱ مدیر، ۲ دندانپزشک، ۱ منشی)');
  console.log('- ۵۰ بیمار با اطلاعات واقعی ایرانی');
  console.log('- ۲۰۰ نوبت طی ۶ ماه گذشته');
  console.log('- ۳۰۰ پرونده درمانی با قیمت‌های تومانی');
  console.log('\n🔐 اطلاعات ورود:');
  console.log('مدیر: admin@dentalclinic.com / admin123');
  console.log('دندانپزشک ۱: doctor@dentalclinic.com / doctor123');
  console.log('دندانپزشک ۲: doctor2@dentalclinic.com / doctor123');
  console.log('منشی: receptionist@dentalclinic.com / receptionist123');
}

main()
  .catch((e) => {
    console.error('❌ خطا در ایجاد داده‌های نمونه:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });