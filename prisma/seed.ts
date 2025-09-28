import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Realistic data arrays
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Oliver',
  'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Mia', 'Henry', 'Harper', 'Alexander', 'Evelyn', 'Mason',
  'Abigail', 'Michael', 'Emily', 'Ethan', 'Elizabeth', 'Daniel', 'Sofia', 'Jacob', 'Avery', 'Logan',
  'Ella', 'Jackson', 'Madison', 'Levi', 'Scarlett', 'Sebastian', 'Victoria', 'Mateo', 'Aria', 'Jack',
  'Grace', 'Owen', 'Chloe', 'Theodore', 'Camila', 'Aiden', 'Penelope', 'Samuel', 'Riley', 'Joseph'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const streets = [
  'Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Cedar Ln', 'Maple Dr', 'First St', 'Second Ave', 'Park Rd', 'Washington St',
  'Lincoln Ave', 'Jefferson St', 'Madison Ave', 'Franklin St', 'Adams St', 'Jackson Ave', 'Monroe St', 'Roosevelt Rd', 'Kennedy Ave', 'Wilson St'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington'
];

const treatments = [
  'CONSULTATION', 'CLEANING', 'FILLING', 'EXTRACTION', 'CROWN', 'BRIDGE', 'IMPLANT', 'ROOT_CANAL', 'ORTHODONTICS', 'COSMETIC', 'OTHER'
];

const appointmentStatuses = [
  'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
];

const medicalConditions = [
  'None', 'Diabetes', 'High blood pressure', 'Heart condition', 'Asthma', 'Allergies to medications',
  'Arthritis', 'Thyroid condition', 'Anxiety', 'Depression', 'Sleep apnea', 'Migraines'
];

const allergies = [
  'None', 'Penicillin', 'Latex', 'Local anesthetics', 'Aspirin', 'Ibuprofen', 'Shellfish', 'Nuts', 'Pollen', 'Dust mites'
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
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+1-${areaCode}-${exchange}-${number}`;
}

function getRandomSSN(): string {
  return Math.floor(Math.random() * 900000000) + 100000000 + '';
}

function generateAddress(): string {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const street = getRandomItem(streets);
  const city = getRandomItem(cities);
  const state = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'][Math.floor(Math.random() * 10)];
  const zip = Math.floor(Math.random() * 90000) + 10000;
  return `${streetNumber} ${street}, ${city}, ${state} ${zip}`;
}

function generateBirthDate(): Date {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 80;
  const maxYear = currentYear - 18;
  const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1; // Safe day range
  return new Date(year, month, day);
}

async function main() {
  console.log('🌱 Seeding database with comprehensive real data...');

  // Clear existing data
  await prisma.record.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Johnson',
      email: 'admin@dentalclinic.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const doctor = await prisma.user.create({
    data: {
      name: 'Dr. Michael Chen',
      email: 'doctor@dentalclinic.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'DOCTOR',
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      name: 'Emily Rodriguez',
      email: 'receptionist@dentalclinic.com',
      password: await bcrypt.hash('receptionist123', 12),
      role: 'RECEPTIONIST',
    },
  });

  const additionalDoctor = await prisma.user.create({
    data: {
      name: 'Dr. Jennifer Martinez',
      email: 'doctor2@dentalclinic.com',
      password: await bcrypt.hash('doctor123', 12),
      role: 'DOCTOR',
    },
  });

  console.log('✅ Created 4 users');

  // Create 50 realistic patients
  const patients = [];
  for (let i = 0; i < 50; i++) {
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    const phone = getRandomPhoneNumber();
    const nationalId = getRandomSSN();
    const dateOfBirth = generateBirthDate();
    const address = generateAddress();
    const emergencyContact = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
    const emergencyPhone = getRandomPhoneNumber();
    const medicalHistory = getRandomItems(medicalConditions, Math.floor(Math.random() * 3) + 1).join(', ');
    const patientAllergies = getRandomItems(allergies, Math.floor(Math.random() * 2) + 1).join(', ');
    const notes = [
      'Regular patient, prefers morning appointments',
      'Requires longer appointment times',
      'Prefers afternoon appointments',
      'New patient, needs comprehensive exam',
      'Follow-up from previous treatment',
      'Dental anxiety - requires gentle approach',
      'Prefers same dentist for continuity',
      'Insurance verification needed',
      'Payment plan required',
      'VIP patient - priority scheduling'
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
        isActive: Math.random() > 0.1, // 90% active patients
      },
    });
    patients.push(patient);
  }

  console.log('✅ Created 50 patients');

  // Create 200 appointments over the last 6 months
  const appointments = [];
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const today = new Date();

  for (let i = 0; i < 200; i++) {
    const patient = getRandomItem(patients);
    const date = getRandomDate(sixMonthsAgo, today);
    const startHour = Math.floor(Math.random() * 8) + 8; // 8 AM to 4 PM
    const startMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    const duration = [30, 45, 60, 90][Math.floor(Math.random() * 4)];
    
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    const endHour = startHour + Math.floor(duration / 60);
    const endMinute = (startMinute + (duration % 60)) % 60;
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    const status = getRandomItem(appointmentStatuses);
    const treatmentType = getRandomItem(treatments);
    
    const descriptions = {
      'CONSULTATION': 'Initial consultation and examination',
      'CLEANING': 'Professional dental cleaning and prophylaxis',
      'FILLING': 'Composite filling procedure',
      'EXTRACTION': 'Tooth extraction procedure',
      'CROWN': 'Dental crown placement',
      'BRIDGE': 'Dental bridge installation',
      'IMPLANT': 'Dental implant procedure',
      'ROOT_CANAL': 'Root canal treatment',
      'ORTHODONTICS': 'Orthodontic consultation and treatment',
      'COSMETIC': 'Cosmetic dental procedure',
      'OTHER': 'General dental procedure'
    };
    
    const notes = [
      'Patient arrived on time',
      'Procedure completed successfully',
      'Follow-up appointment scheduled',
      'Patient needs additional treatment',
      'Insurance pre-authorization required',
      'Patient requested pain management',
      'Complex case - additional time needed',
      'Patient education provided',
      'Post-operative instructions given',
      'Satisfaction survey completed'
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

  console.log('✅ Created 200 appointments');

  // Create 300 treatment records
  const records = [];
  for (let i = 0; i < 300; i++) {
    const patient = getRandomItem(patients);
    const treatmentType = getRandomItem(treatments);
    const date = getRandomDate(sixMonthsAgo, today);
    
    const costRanges = {
      'CONSULTATION': [100, 200],
      'CLEANING': [80, 150],
      'FILLING': [150, 400],
      'EXTRACTION': [200, 600],
      'CROWN': [800, 2000],
      'BRIDGE': [1500, 3000],
      'IMPLANT': [2000, 4000],
      'ROOT_CANAL': [800, 1500],
      'ORTHODONTICS': [3000, 8000],
      'COSMETIC': [500, 2000],
      'OTHER': [100, 500]
    };
    
    const [minCost, maxCost] = costRanges[treatmentType as keyof typeof costRanges];
    const cost = Math.random() * (maxCost - minCost) + minCost;
    
    const descriptions = {
      'CONSULTATION': 'Comprehensive dental examination and treatment planning',
      'CLEANING': 'Professional dental cleaning, scaling, and polishing',
      'FILLING': 'Composite resin filling restoration',
      'EXTRACTION': 'Surgical tooth extraction with local anesthesia',
      'CROWN': 'Porcelain-fused-to-metal crown restoration',
      'BRIDGE': 'Fixed dental bridge with ceramic pontics',
      'IMPLANT': 'Titanium dental implant with crown restoration',
      'ROOT_CANAL': 'Endodontic treatment with gutta-percha filling',
      'ORTHODONTICS': 'Orthodontic treatment planning and appliance placement',
      'COSMETIC': 'Cosmetic bonding and whitening treatment',
      'OTHER': 'Specialized dental procedure'
    };
    
    const notes = [
      'Procedure completed successfully',
      'Patient tolerated treatment well',
      'Additional follow-up recommended',
      'Insurance claim submitted',
      'Payment plan established',
      'Patient education provided',
      'Post-operative care instructions given',
      'Satisfaction survey completed',
      'Quality control measures implemented',
      'Documentation completed'
    ];

    const isCompleted = Math.random() > 0.15; // 85% completed
    const userId = Math.random() > 0.5 ? admin.id : doctor.id;

    const record = await prisma.record.create({
      data: {
        patientId: patient.id,
        treatmentType,
        description: descriptions[treatmentType as keyof typeof descriptions],
        cost: Math.round(cost * 100) / 100, // Round to 2 decimal places
        date,
        notes: getRandomItem(notes),
        isCompleted,
        userId,
      },
    });
    records.push(record);
  }

  console.log('✅ Created 300 treatment records');

  console.log('🎉 Database seeded successfully with comprehensive real data!');
  console.log('\n📊 Summary:');
  console.log('- 4 users (1 admin, 2 doctors, 1 receptionist)');
  console.log('- 50 patients with realistic demographics');
  console.log('- 200 appointments over 6 months');
  console.log('- 300 treatment records with varied costs');
  console.log('\n🔐 Demo credentials:');
  console.log('Admin: admin@dentalclinic.com / admin123');
  console.log('Doctor: doctor@dentalclinic.com / doctor123');
  console.log('Doctor 2: doctor2@dentalclinic.com / doctor123');
  console.log('Receptionist: receptionist@dentalclinic.com / receptionist123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
