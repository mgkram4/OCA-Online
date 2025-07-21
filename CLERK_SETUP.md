# Clerk Integration Setup Guide

This guide explains how to complete the Clerk authentication setup for the OCA WebSchool application.

## ✅ What's Already Done

1. **Clerk SDK Installed**: `@clerk/nextjs@latest` has been installed
2. **Middleware Configured**: `middleware.ts` with `clerkMiddleware()` is set up
3. **Layout Updated**: `app/layout.tsx` now uses `ClerkProvider`
4. **Authentication Pages**: Login and register pages updated to use Clerk components
5. **API Routes Updated**: All API routes now use Clerk's `auth()` function
6. **Navigation Updated**: Navigation component uses Clerk's `useUser` hook
7. **Dashboard Protected**: Dashboard routes are protected with Clerk authentication
8. **Webhook Handler**: Created webhook handler to sync users with database
9. **SSO Callbacks**: Created SSO callback pages for authentication redirects

## 🔧 Next Steps to Complete Setup

### 1. Create a Clerk Account

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Clerk Configuration
# Get these values from your Clerk Dashboard: https://dashboard.clerk.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Optional: Customize sign-in/sign-up URLs
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL="file:./prisma/dev.db"

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

### 3. Get Your Clerk Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy the **Publishable Key** (starts with `pk_test_`)
3. Copy the **Secret Key** (starts with `sk_test_`)
4. Paste them into your `.env.local` file

### 4. Configure SSO Callbacks (Important!)

In your Clerk Dashboard:

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Scroll down to **Redirect URLs**
3. Add these callback URLs:
   - `http://localhost:3002/register/sso-callback`
   - `http://localhost:3002/login/sso-callback`
   - For production: `https://your-domain.com/register/sso-callback`
   - For production: `https://your-domain.com/login/sso-callback`

### 5. Set Up Webhooks (Important!)

To automatically sync users with your database:

1. In your Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Set the **Endpoint URL** to: `https://your-domain.com/api/webhooks/clerk`
   - For local development: `http://localhost:3002/api/webhooks/clerk`
4. Select these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add it to your `.env.local` as `CLERK_WEBHOOK_SECRET`

### 6. Configure Authentication Settings

In your Clerk Dashboard:

1. **User & Authentication** → **Email, Phone, Username**
   - Enable email authentication
   - Configure password requirements
   - Set up email verification

2. **User & Authentication** → **Social Connections** (Optional)
   - Add Google, GitHub, or other social providers

3. **Appearance** → **Branding**
   - Upload your logo
   - Customize colors to match your app

### 7. Test the Integration

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3002`
3. Click "Sign Up" or "Sign In"
4. Complete the authentication flow
5. Verify you can access the dashboard

## 🚀 Features Now Available

### Client-Side Components
- `<SignIn>` - Sign-in component (used in `/login`)
- `<SignUp>` - Sign-up component (used in `/register`)
- `<SignOutButton>` - Sign-out button (used in navigation)
- `<SignedIn>` - Shows content only to authenticated users
- `<SignedOut>` - Shows content only to unauthenticated users

### Server-Side Authentication
- `auth()` from `@clerk/nextjs/server` - Get user info in API routes
- `clerkMiddleware()` - Protects routes automatically

### Hooks
- `useUser()` - Get current user data
- `useAuth()` - Get authentication state

### Database Integration
- Automatic user creation when signing up
- User data synced between Clerk and your database
- Webhook handler at `/api/webhooks/clerk`

### SSO Callbacks
- `/register/sso-callback` - Handles sign-up redirects
- `/login/sso-callback` - Handles sign-in redirects

## 🔒 Protected Routes

The following routes are now protected:
- `/dashboard/*` - All dashboard pages
- `/api/dashboard/*` - Dashboard API routes
- `/api/courses/*` - Course API routes
- `/api/lessons/*` - Lesson API routes
- `/api/progress/*` - Progress API routes
- `/api/ai/*` - AI chat API routes
- `/api/todos/*` - Todo API routes
- `/api/payments/*` - Payment API routes
- `/api/proctoring/*` - Proctoring API routes
- `/api/parent/*` - Parent API routes
- `/api/modules/*` - Module API routes

## 📝 Migration Notes

This integration replaces the previous JWT-based authentication. Key changes:

1. **Authentication Provider**: JWT → Clerk
2. **Session Management**: Custom hooks → `useUser()`
3. **API Authentication**: Custom middleware → `auth()`
4. **Route Protection**: Custom middleware → `clerkMiddleware()`
5. **User Interface**: Custom forms → Clerk components
6. **Database Sync**: Manual → Automatic via webhooks
7. **SSO Support**: Added callback pages for social authentication

## 🛠️ Customization

### Custom Sign-In/Sign-Up Pages

The current setup uses Clerk's default components. If you want more customization:

1. Create `app/sign-in/[[...sign-in]]/page.tsx`
2. Create `app/sign-up/[[...sign-up]]/page.tsx`
3. Update environment variables to point to these routes

### Database Integration

The webhook handler automatically:
1. Creates users in your database when they sign up with Clerk
2. Updates user data when they update their profile
3. Deletes users when they delete their account

## 🆘 Troubleshooting

### Common Issues

1. **"Clerk not initialized" error**
   - Check that environment variables are set correctly
   - Restart your development server

2. **Middleware not working**
   - Ensure `middleware.ts` is in the root directory
   - Check that the matcher configuration is correct

3. **Authentication not persisting**
   - Verify Clerk keys are correct
   - Check browser console for errors

4. **Foreign key constraint errors**
   - Ensure webhooks are set up correctly
   - Check that users are being created in the database
   - Verify the webhook endpoint is accessible

5. **Webhook not working**
   - Check that the webhook URL is correct
   - Verify the signing secret is set correctly
   - Test with a tool like ngrok for local development

6. **SSO callback 404 errors**
   - Ensure callback URLs are configured in Clerk dashboard
   - Check that the callback pages exist in your app
   - Verify the URLs match exactly (including protocol and port)

### Getting Help

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Discord](https://discord.gg/clerk)
- [Clerk Support](https://clerk.com/support) 