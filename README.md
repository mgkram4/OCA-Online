# OCA WebSchool - Comprehensive Online High School Diploma Platform

A modern, accredited online high school diploma platform built with Next.js, TypeScript, and Prisma. This platform provides a complete learning management system with advanced features for students, teachers, parents, and administrators.

## 🎓 Features

### Core Academic System
- **Multi-Role Authentication**: Students, Teachers, Admins, and Parents
- **Course Management**: Dynamic course creation with modules, lessons, and assignments
- **Credit Tracking**: Real-time progress toward 22-credit graduation requirement
- **Grade Book**: Automated and manual grading systems
- **Transcript Generation**: PDF generation with official formatting
- **Learning Paths**: Personalized course recommendations

### Advanced Payment System
- **Stripe Integration**: Secure payment processing
- **Multiple Payment Plans**: Full payment, monthly installments, semester plans
- **Promo Codes**: Discount system for scholarships and financial aid
- **Invoice Generation**: Automated billing and email delivery
- **Refund Processing**: Automated refund system

### Proctoring & Assessment
- **Online Proctoring**: Integration with proctoring services
- **Anti-Cheating Measures**: Timer functionality, full-screen mode
- **Assignment Types**: Quizzes, homework, projects, midterms, finals
- **Auto-Grading**: Automated grading for objective questions
- **Plagiarism Detection**: Integration with plagiarism detection services

### Communication & Collaboration
- **In-App Messaging**: Direct communication between students and teachers
- **Announcement System**: School-wide and course-specific announcements
- **Discussion Forums**: Course-specific discussion boards
- **Parent Portal**: Real-time access to child's academic progress
- **Virtual Office Hours**: Scheduling system for teacher-student meetings

### Analytics & Reporting
- **Student Dashboards**: Comprehensive progress tracking
- **Teacher Analytics**: Grade books and class management tools
- **Admin Reports**: Enrollment, completion rates, revenue analytics
- **Graduation Tracking**: Automated eligibility verification
- **Performance Metrics**: Detailed learning analytics

### Compliance & Security
- **FERPA Compliance**: Secure handling of student data
- **SSL Encryption**: End-to-end encryption
- **Data Backup**: Automated backup and recovery systems
- **Audit Logging**: Complete administrative action tracking
- **WCAG 2.1 AA**: Accessibility compliance

## 🚀 Technology Stack

- **Frontend**: Next.js 15 with TypeScript and React 19
- **Backend**: Next.js API Routes with Node.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma with comprehensive schema
- **Authentication**: NextAuth.js with multi-role support
- **Payment**: Stripe with subscription management
- **UI**: shadcn/ui with Tailwind CSS
- **State Management**: Zustand
- **Notifications**: Sonner toast notifications
- **AI Integration**: OpenAI for intelligent tutoring

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (recommended for production)
- Stripe account for payment processing
- OpenAI API key for AI tutoring
- Email service (SendGrid, Mailgun, etc.)

## 🔧 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd oca-webschool
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/oca_webschool"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### 4. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄 Database Schema

The platform uses a comprehensive Prisma schema with the following key models:

- **Users**: Multi-role user management (students, teachers, admins, parents)
- **Courses**: Course catalog with pricing, proctoring settings, and content
- **Modules & Lessons**: Hierarchical content organization
- **Enrollments**: Student-course relationships with payment tracking
- **Assignments & Submissions**: Assessment and grading system
- **Payments & PaymentPlans**: Flexible payment options
- **ProctoringSessions**: Exam proctoring management
- **Transcripts**: Official academic records
- **Messages & Announcements**: Communication system

## 💳 Payment Integration

### Supported Payment Methods
- **Full Payment**: One-time course enrollment
- **Monthly Plans**: 6-month installment plans
- **Semester Plans**: 2-installment plans
- **Course-by-Course**: Individual course payments

### Pricing Structure
- **Per Credit**: $250 (standard rate)
- **Typical Course**: 1 credit = $250
- **Full Diploma**: $6,000 (24 credits)
- **Promo Codes**: Available for scholarships and discounts

## 🎯 User Roles & Permissions

### Student
- Enroll in courses with flexible payment options
- Access interactive learning materials
- Submit assignments and take proctored exams
- Track real-time progress and grades
- Access AI-powered tutoring assistance
- View official transcripts

### Teacher
- Create and manage course content
- Grade assignments and provide feedback
- Monitor student progress and engagement
- Generate detailed reports
- Communicate with students and parents
- Schedule virtual office hours

### Parent/Guardian
- View child's academic progress in real-time
- Access official transcripts and reports
- Receive notifications about important events
- Manage payment plans and billing
- Communicate with teachers

### Admin
- User management and role assignment
- Course catalog management
- System configuration and settings
- Analytics and reporting dashboard
- Compliance monitoring and auditing
- Payment and financial management

## 🔐 Security Features

- **Multi-Factor Authentication**: Enhanced security for all users
- **Role-Based Access Control**: Granular permissions system
- **Data Encryption**: All sensitive data encrypted at rest
- **Secure File Uploads**: Virus scanning and validation
- **Rate Limiting**: API protection against abuse
- **Audit Trails**: Complete action logging for compliance

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/session` - Session management

### Courses
- `GET /api/courses` - Course catalog with filtering
- `POST /api/courses` - Create new course (teachers/admins)
- `GET /api/courses/[courseId]` - Course details
- `POST /api/courses/enroll` - Course enrollment

### Payments
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/payment-plans` - Payment plan management
- `POST /api/payments/webhook` - Stripe webhook handler

### Academic
- `GET /api/dashboard/student` - Student dashboard data
- `GET /api/progress/[userId]` - Progress tracking
- `POST /api/assignments/[assignmentId]/submit` - Assignment submission
- `GET /api/transcripts/[userId]` - Transcript generation

### Parent Portal
- `GET /api/parent/children` - Children's academic data
- `GET /api/parent/progress/[childId]` - Child's progress

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### Database Migration
```bash
# Production database migration
npx prisma migrate deploy
```

### Environment Variables
Ensure all environment variables are set in your deployment platform.

## 📊 Monitoring & Analytics

### Built-in Analytics
- Student enrollment and completion rates
- Course popularity and performance metrics
- Payment analytics and revenue tracking
- Learning progress and engagement data
- Teacher performance and student satisfaction

### Third-party Integration
- Google Analytics for user behavior
- Sentry for error tracking
- LogRocket for session replay
- Mixpanel for advanced analytics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)
- [Deployment Guide](./docs/deployment.md)
- [Security Guidelines](./docs/security.md)
- [Compliance Checklist](./docs/compliance.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.oca-webschool.com](https://docs.oca-webschool.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/oca-webschool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/oca-webschool/discussions)
- **Email**: support@oca-webschool.com

## 🏆 Accreditation & Compliance

This platform is designed to meet:
- **State Education Standards**: Research-based requirements for online education
- **FERPA Compliance**: Family Educational Rights and Privacy Act
- **COPPA Compliance**: Children's Online Privacy Protection Act
- **WCAG 2.1 AA**: Web Content Accessibility Guidelines
- **ISO 27001**: Information security management

---

**Built with ❤️ for the future of education**

This platform represents the next generation of online education, combining cutting-edge technology with proven pedagogical methods to deliver exceptional learning experiences for high school students worldwide.
# OCA-Online
