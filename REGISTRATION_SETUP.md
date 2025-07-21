# Registration System Setup

## Overview

The OCA WebSchool now has a custom registration system that allows users to choose their role during signup. The system supports three user roles:

- **Student**: High school students working toward their diploma
- **Parent/Guardian**: Parents monitoring their children's education
- **Administrator**: School staff with administrative privileges

## Features

### Role Selection
- Users can choose their role during registration
- Each role has different dashboard access and permissions
- Admin users require a school code for registration

### Authentication
- Custom login/logout system using JWT tokens
- Secure password hashing with bcrypt
- Role-based access control
- Automatic redirection to appropriate dashboards

### Dashboards
- **Student Dashboard**: Shows progress, courses, assignments, and graduation tracking
- **Parent Dashboard**: Monitors children's progress and academic performance
- **Admin Dashboard**: School management, student oversight, and course administration

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Admin school code for registration
ADMIN_SCHOOL_CODE=OCA2024

# JWT secret for authentication (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database URL
DATABASE_URL="file:./dev.db"
```

### 2. Database Setup

Run the following commands to set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with initial data
npx prisma db seed
```

### 3. Dependencies

The following packages have been added:

```bash
npm install bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken --legacy-peer-deps
```

## Usage

### Registration Flow

1. **Visit `/register`** - Users see role selection options
2. **Choose Role** - Select Student, Parent, or Administrator
3. **Fill Details** - Complete registration form
4. **Admin Code** - Administrators must enter the school code
5. **Account Created** - User is redirected to login

### Login Flow

1. **Visit `/login`** - Enter email and password
2. **Authentication** - System validates credentials
3. **Role Redirect** - Users are redirected to their role-specific dashboard:
   - Students → `/dashboard/student`
   - Parents → `/dashboard/parent`
   - Admins → `/dashboard/admin`

### Dashboard Access

- **Students**: Can access student dashboard and course content
- **Parents**: Can view children's progress and academic information
- **Admins**: Can manage students, courses, and school operations

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure authentication with JSON Web Tokens
- **Role-Based Access**: Middleware enforces role-based permissions
- **School Code Protection**: Admin registration requires valid school code
- **Input Validation**: All form inputs are validated server-side

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected Routes
- `/dashboard/*` - Role-specific dashboards
- `/api/dashboard/*` - Dashboard data APIs
- `/api/courses/*` - Course management
- `/api/lessons/*` - Lesson content
- `/api/progress/*` - Student progress tracking

## Customization

### Changing Admin School Code
Update the `ADMIN_SCHOOL_CODE` environment variable to change the required school code for admin registration.

### Adding New Roles
1. Update the `UserRole` enum in `prisma/schema.prisma`
2. Add role option in `app/(auth)/register/page.tsx`
3. Create role-specific dashboard at `app/(dashboard)/[role]/page.tsx`
4. Update middleware to handle new role routing

### Styling
The registration and login pages use the existing UI components from `@/components/ui/`. Customize the styling by modifying the component classes.

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure your database is running and accessible
2. **Environment Variables**: Check that all required environment variables are set
3. **JWT Secret**: Make sure the JWT secret is set and consistent
4. **School Code**: Verify the admin school code matches the environment variable

### Error Messages

- "Invalid school code" - Admin registration with incorrect school code
- "User already exists" - Email already registered
- "Invalid email or password" - Login credentials are incorrect
- "Account not verified" - Admin account pending verification

## Production Considerations

1. **Change Default Secrets**: Update JWT_SECRET and ADMIN_SCHOOL_CODE for production
2. **Database**: Use a production database (PostgreSQL, MySQL) instead of SQLite
3. **HTTPS**: Ensure all authentication happens over HTTPS
4. **Rate Limiting**: Implement rate limiting for registration and login endpoints
5. **Email Verification**: Add email verification for new accounts
6. **Password Policy**: Implement stronger password requirements
7. **Session Management**: Consider implementing session management and logout functionality 