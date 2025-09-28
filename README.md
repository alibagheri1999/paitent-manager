# Dental Patient Management System

A comprehensive dental clinic patient management system built with Next.js 15, TypeScript, Prisma, and PostgreSQL. This system provides modern UI/UX for dental professionals to manage patients, appointments, treatment records, and analytics.

## 🚀 Features

### Core Functionality
- **Patient Management**: Complete patient profiles with medical history, allergies, and contact information
- **Appointment Scheduling**: Interactive calendar with FullCalendar integration for appointment management
- **Treatment Records**: Detailed treatment history with billing and completion tracking
- **Staff Management**: Role-based access control (Admin, Doctor, Receptionist)
- **Analytics Dashboard**: Comprehensive reports and insights with revenue tracking

### Technical Features
- **Modern UI**: Built with Tailwind CSS and Radix UI components
- **Type Safety**: Full TypeScript implementation with strict typing
- **Authentication**: NextAuth.js with JWT and session management
- **Database**: PostgreSQL with Prisma ORM and optimized queries
- **Real-time Updates**: Live dashboard statistics and appointment notifications
- **Responsive Design**: Mobile-first design that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: NextAuth.js
- **Calendar**: FullCalendar
- **Charts**: Recharts
- **Deployment**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18 LTS or higher
- PostgreSQL 15 or higher
- Docker and Docker Compose (optional)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd dental-patient-manager
```

2. Copy environment variables:
```bash
cp env.example .env
```

3. Update the `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dental_clinic"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. Start the application with Docker:
```bash
docker-compose up -d
```

5. Run database migrations and seed data:
```bash
docker-compose exec app npm run db:push
docker-compose exec app npm run db:seed
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Local Development

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd dental-patient-manager
npm install
```

2. Set up PostgreSQL database and update `.env` file.

3. Run database setup:
```bash
npm run db:push
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

## 🔐 Demo Credentials

The system comes with pre-seeded demo accounts:

- **Admin**: admin@dentalclinic.com / admin123
- **Doctor**: doctor@dentalclinic.com / doctor123
- **Receptionist**: receptionist@dentalclinic.com / receptionist123

## 📱 Features Overview

### Dashboard
- Real-time statistics (patients, appointments, revenue)
- Recent appointments and upcoming schedule
- Revenue charts and analytics

### Patient Management
- Complete patient profiles
- Medical history and allergies tracking
- Emergency contact information
- Search and filter capabilities

### Appointment System
- Interactive calendar view
- Drag-and-drop scheduling
- Treatment type categorization
- Status tracking (Scheduled, Confirmed, Completed, Cancelled)

### Treatment Records
- Detailed treatment documentation
- Billing and cost tracking
- Treatment type categorization
- Completion status

### Analytics & Reports
- Revenue tracking and trends
- Treatment statistics
- Patient growth metrics
- Export capabilities

### Staff Management
- Role-based access control
- User account management
- Permission settings

## 🏗️ Database Schema

The system uses a well-structured PostgreSQL schema with the following main entities:

- **Users**: Staff members with role-based access
- **Patients**: Patient information and medical history
- **Appointments**: Scheduled visits with status tracking
- **Records**: Treatment history and billing information

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dental_clinic"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@dentalclinic.com"

# SMS (optional)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**:
   - Set up production PostgreSQL database
   - Configure environment variables
   - Set up email/SMS services for notifications

2. **Build and Deploy**:
```bash
npm run build
npm start
```

3. **Docker Production**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

The application is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **AWS** (ECS, Lambda, RDS)
- **Google Cloud** (Cloud Run, Cloud SQL)
- **Azure** (App Service, Database)

## 📊 Performance

- **Database Optimization**: Indexed queries for fast patient and appointment searches
- **Caching**: Implemented caching strategies for frequently accessed data
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting for optimal loading

## 🔒 Security

- **Authentication**: Secure JWT-based authentication
- **Authorization**: Role-based access control
- **Data Validation**: Input validation with Zod schemas
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **CORS Configuration**: Restricted CORS settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo credentials for testing

## 🔮 Future Enhancements

- **Mobile App**: React Native mobile application
- **Payment Integration**: Stripe/PayPal payment processing
- **Telemedicine**: Video consultation features
- **AI Integration**: Treatment recommendations
- **Multi-language Support**: Internationalization
- **Advanced Reporting**: PDF export and custom reports

---

Built with ❤️ for dental professionals worldwide.
