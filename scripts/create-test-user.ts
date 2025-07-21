import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        id: 'test_user_123', // This should match the Clerk user ID
        email: 'test@example.com',
        name: 'Test User',
        hashedPassword: 'dummy_hash', // Not used with Clerk
        role: 'STUDENT',
        gradeLevel: 11,
        gpa: 3.5,
        totalCredits: 15,
        graduationYear: 2025,
        isVerified: true,
        consentGiven: true,
        consentDate: new Date()
      }
    })

    console.log('Test user created:', user)

    // Create a test course
    const course = await prisma.course.create({
      data: {
        title: 'Introduction to Mathematics',
        description: 'A comprehensive introduction to high school mathematics',
        subject: 'Mathematics',
        gradeLevel: 11,
        credits: 3,
        price: 250.0,
        isActive: true,
        createdBy: user.id
      }
    })

    console.log('Test course created:', course)

    // Create a test module
    const courseModule = await prisma.module.create({
      data: {
        title: 'Algebra Fundamentals',
        description: 'Core concepts of algebra',
        order: 1,
        courseId: course.id
      }
    })

    console.log('Test module created:', courseModule)

    // Create a test lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: 'Linear Equations',
        content: 'Learn how to solve linear equations',
        order: 1,
        moduleId: courseModule.id,
        estimatedDuration: 45
      }
    })

    console.log('Test lesson created:', lesson)

    // Enroll the user in the course
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        status: 'ACTIVE',
        enrolledAt: new Date()
      }
    })

    console.log('Test enrollment created:', enrollment)

  } catch (error) {
    console.error('Error creating test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser() 