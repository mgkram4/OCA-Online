# OCA WebSchool - Online High School Diploma Platform Setup Guide

## 🚀 Quick Start

This guide will help you set up a comprehensive, accredited online high school diploma platform with payment processing, multi-role authentication, and advanced academic tracking.

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (recommended for production)
- Stripe account for payment processing
- OpenAI API key for AI tutoring
- Email service (SendGrid, Mailgun, etc.)

## 🔧 Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/oca_webschool"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Stripe (for payment processing)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage (for course materials)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"

# Video Streaming (optional)
VIMEO_CLIENT_ID="your-vimeo-client-id"
VIMEO_CLIENT_SECRET="your-vimeo-client-secret"
VIMEO_ACCESS_TOKEN="your-vimeo-access-token"

# Proctoring Service (optional)
PROCTORU_API_KEY="your-proctoru-api-key"
PROCTORU_SECRET="your-proctoru-secret"

# Analytics (optional)
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
MIXPANEL_TOKEN="your-mixpanel-token"

# Security
JWT_SECRET="your-jwt-secret-key"
ENCRYPTION_KEY="your-32-character-encryption-key"

# Feature Flags
ENABLE_PAYMENTS="true"
ENABLE_PROCTORING="false"
ENABLE_VIDEO_STREAMING="true"
ENABLE_AI_TUTOR="true"
```

## 🗄 Database Setup

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Run Database Migrations
```bash
npm run db:migrate
```

### 4. Seed Database (Optional)
```bash
npm run db:seed
```

## 💳 Stripe Configuration

### 1. Create Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Get your API keys from the dashboard

### 2. Set Up Webhooks
- Go to Stripe Dashboard > Webhooks
- Add endpoint: `https://yourdomain.com/api/payments/webhook`
- Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the webhook secret to your `.env.local`

### 3. Create Products and Prices
Create the following products in Stripe:
- Course enrollment ($250 per credit)
- Full diploma program ($6,000)
- Monthly payment plans

## 🎓 Academic Structure

### Credit System
- **Total Credits Required**: 22 credits
- **Core Subjects**:
  - English: 4 credits
  - Mathematics: 4 credits
  - Science: 3 credits
  - Social Studies: 3 credits
  - Physical Education: 2 credits
  - Electives: 6 credits

### Course Pricing
- **Per Credit**: $250
- **Typical Course**: 1 credit = $250
- **Full Diploma**: $6,000 (24 credits)

## 🔐 Security & Compliance

### FERPA Compliance
- All student data is encrypted at rest
- Access logs for all data operations
- Parent/guardian consent tracking
- Data retention policies

### Security Features
- SSL encryption throughout
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting

## 📱 User Roles & Permissions

### Student
- Enroll in courses
- Access learning materials
- Submit assignments
- Track progress
- Access AI tutor

### Teacher
- Create and manage courses
- Grade assignments
- Monitor student progress
- Generate reports
- Communicate with students

### Parent/Guardian
- View child's progress
- Access transcripts
- Receive notifications
- Manage payments

### Admin
- User management
- Course catalog management
- System configuration
- Analytics and reporting
- Compliance monitoring

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
- Student enrollment tracking
- Course completion rates
- Payment analytics
- Learning progress metrics
- User engagement data

### Third-party Integration
- Google Analytics
- Mixpanel
- Sentry (error tracking)
- LogRocket (session replay)

## 🔧 Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Database operations
npm run db:migrate
npm run db:generate
npm run db:studio
npm run db:seed

# Linting
npm run lint
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (via NextAuth)

### Course Endpoints
- `GET /api/courses` - List all courses
- `POST /api/courses/enroll` - Enroll in course
- `GET /api/courses/[courseId]` - Get course details

### Payment Endpoints
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/webhook` - Stripe webhook handler

### Dashboard Endpoints
- `GET /api/dashboard/student` - Student dashboard data
- `GET /api/dashboard/teacher` - Teacher dashboard data
- `GET /api/dashboard/admin` - Admin dashboard data

## 🎯 Next Steps

### Phase 1: MVP (4-6 weeks)
- [x] User authentication and roles
- [x] Course catalog
- [x] Payment processing
- [x] Basic progress tracking

### Phase 2: Core LMS (6-8 weeks)
- [ ] Full course content management
- [ ] Assignment submission and grading
- [ ] Grade book and transcripts
- [ ] Communication system
- [ ] Parent portal

### Phase 3: Advanced Features (4-6 weeks)
- [ ] Proctoring integration
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Advanced payment features
- [ ] Compliance hardening

## 🆘 Support

For technical support:
- Create an issue in the repository
- Check the documentation
- Contact the development team

## 📄 Legal & Compliance

### Accreditation
- Research state-specific requirements
- Partner with accredited institutions
- Maintain compliance documentation
- Regular audit preparation

### Data Protection
- GDPR compliance (if applicable)
- COPPA compliance for under-13 users
- State-specific privacy laws
- Regular security audits

---

**Built with ❤️ for the future of education**

This platform is designed to provide a legitimate, accredited online high school experience that meets educational standards while leveraging modern technology for enhanced learning outcomes. 