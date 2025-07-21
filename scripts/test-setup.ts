import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSetup() {
  try {
    console.log('🔍 Testing OCA WebSchool Setup...\n')

    // Test database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful\n')

    // Check if users exist
    console.log('2. Checking users in database...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database')
      console.log('   This is normal if you haven\'t signed up yet')
      console.log('   Users will be created automatically when you sign up with Clerk\n')
    } else {
      console.log(`✅ Found ${users.length} user(s) in database:`)
      users.forEach((user: any) => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
      })
      console.log()
    }

    // Check if courses exist
    console.log('3. Checking courses in database...')
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        subject: true,
        isActive: true
      }
    })
    
    if (courses.length === 0) {
      console.log('⚠️  No courses found in database')
      console.log('   You can create courses through the admin interface\n')
    } else {
      console.log(`✅ Found ${courses.length} course(s) in database:`)
      courses.forEach((course: any) => {
        console.log(`   - ${course.title} (${course.subject}) - ${course.isActive ? 'Active' : 'Inactive'}`)
      })
      console.log()
    }

    // Check environment variables
    console.log('4. Checking environment variables...')
    const requiredEnvVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'DATABASE_URL'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are set\n')
    } else {
      console.log('❌ Missing environment variables:')
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`)
      })
      console.log('\n   Please check your .env.local file\n')
    }

    console.log('🎉 Setup test completed!')
    console.log('\nNext steps:')
    console.log('1. Make sure your Clerk keys are set in .env.local')
    console.log('2. Set up webhooks in your Clerk dashboard')
    console.log('3. Visit http://localhost:3002 to test the application')
    console.log('4. Sign up for a new account to test the full flow')

  } catch (error) {
    console.error('❌ Setup test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSetup() 