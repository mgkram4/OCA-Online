import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test users with different roles
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Test Student',
      hashedPassword,
      role: 'STUDENT',
      gradeLevel: 9,
      gpa: 3.5,
      totalCredits: 4,
    },
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: 'Test Teacher',
      hashedPassword,
      role: 'TEACHER',
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Test Admin',
      hashedPassword,
      role: 'ADMIN',
    },
  })

  const parent = await prisma.user.upsert({
    where: { email: 'parent@example.com' },
    update: {},
    create: {
      email: 'parent@example.com',
      name: 'Test Parent',
      hashedPassword,
      role: 'PARENT',
    },
  })

  // Create sample courses with enhanced data
  const mathCourse = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      title: 'Algebra I - 9th Grade',
      description: 'Master fundamental algebraic concepts including linear equations, inequalities, and functions. Perfect for 9th grade students building a strong mathematical foundation.',
      subject: 'Mathematics',
      credits: 4,
      gradeLevel: 9,
      price: 250.0,
      isFree: false,
      requiresProctoring: false,
      isActive: true,
    },
  })

  const scienceCourse = await prisma.course.upsert({
    where: { id: 'course-2' },
    update: {},
    create: {
      id: 'course-2',
      title: 'Biology - 9th Grade',
      description: 'Explore the fascinating world of living organisms, from cells to ecosystems. Understand the principles that govern life on Earth.',
      subject: 'Science',
      credits: 3,
      gradeLevel: 9,
      price: 250.0,
      isFree: false,
      requiresProctoring: false,
      isActive: true,
    },
  })

  const englishCourse = await prisma.course.upsert({
    where: { id: 'course-3' },
    update: {},
    create: {
      id: 'course-3',
      title: 'English I - 9th Grade',
      description: 'Develop critical reading and writing skills through the study of classic literature and modern texts.',
      subject: 'English',
      credits: 4,
      gradeLevel: 9,
      price: 250.0,
      isFree: false,
      requiresProctoring: false,
      isActive: true,
    },
  })

  const historyCourse = await prisma.course.upsert({
    where: { id: 'course-4' },
    update: {},
    create: {
      id: 'course-4',
      title: 'World History - 9th Grade',
      description: 'Journey through time to understand the major events, cultures, and civilizations that shaped our world.',
      subject: 'History',
      credits: 3,
      gradeLevel: 9,
      price: 250.0,
      isFree: false,
      requiresProctoring: false,
      isActive: true,
    },
  })

  const geometryCourse = await prisma.course.upsert({
    where: { id: 'course-5' },
    update: {},
    create: {
      id: 'course-5',
      title: 'Geometry - 10th Grade',
      description: 'Explore geometric concepts, proofs, and spatial reasoning. Build on your algebraic foundation.',
      subject: 'Mathematics',
      credits: 4,
      gradeLevel: 10,
      price: 250.0,
      isFree: false,
      requiresProctoring: false,
      isActive: true,
    },
  })

  const chemistryCourse = await prisma.course.upsert({
    where: { id: 'course-6' },
    update: {},
    create: {
      id: 'course-6',
      title: 'Chemistry - 10th Grade',
      description: 'Discover the composition, properties, and reactions of matter. Understand the building blocks of our world.',
      subject: 'Science',
      credits: 3,
      gradeLevel: 10,
      price: 250.0,
      isFree: false,
      requiresProctoring: false,
      isActive: true,
    },
  })

  // Create modules for the math course
  const mathModule1 = await prisma.module.upsert({
    where: { id: 'module-1' },
    update: {},
    create: {
      id: 'module-1',
      courseId: mathCourse.id,
      title: 'Algebra Fundamentals',
      description: 'Learn the basics of algebraic expressions and equations',
      order: 1,
      duration: 20,
      isActive: true,
    },
  })

  const mathModule2 = await prisma.module.upsert({
    where: { id: 'module-2' },
    update: {},
    create: {
      id: 'module-2',
      courseId: mathCourse.id,
      title: 'Linear Equations',
      description: 'Master solving linear equations and inequalities',
      order: 2,
      duration: 25,
      isActive: true,
    },
  })

  // Create lessons for math module 1
  const mathLesson1 = await prisma.lesson.upsert({
    where: { id: 'lesson-1' },
    update: {},
    create: {
      id: 'lesson-1',
      moduleId: mathModule1.id,
      title: 'Introduction to Variables',
      content: {
        overview: 'Learn about variables and how they represent unknown values in mathematical expressions.',
        sections: [
          {
            title: 'What are Variables?',
            content: 'Variables are symbols (usually letters) that represent unknown or changing values in mathematical expressions and equations.'
          },
          {
            title: 'Common Variables',
            content: 'The most commonly used variables are x, y, and z, but any letter can be used as a variable.'
          },
          {
            title: 'Examples',
            content: 'In the expression 2x + 3, x is a variable. If x = 5, then 2x + 3 = 2(5) + 3 = 13.'
          }
        ],
        exercises: [
          {
            question: 'What is the value of 3x + 2 when x = 4?',
            answer: '14',
            explanation: 'Substitute x = 4: 3(4) + 2 = 12 + 2 = 14'
          }
        ]
      },
      order: 1,
      duration: 30,
      objectives: 'Understand variables and basic algebraic expressions',
      isActive: true,
    },
  })

  const mathLesson2 = await prisma.lesson.upsert({
    where: { id: 'lesson-2' },
    update: {},
    create: {
      id: 'lesson-2',
      moduleId: mathModule1.id,
      title: 'Solving Linear Equations',
      content: {
        overview: 'Learn how to solve linear equations step by step.',
        sections: [
          {
            title: 'Linear Equations',
            content: 'A linear equation is an equation where the highest power of the variable is 1.'
          },
          {
            title: 'Solving Steps',
            content: '1. Combine like terms\n2. Move variables to one side\n3. Move constants to the other side\n4. Divide by the coefficient'
          },
          {
            title: 'Example',
            content: 'Solve: 2x + 3 = 11\nSubtract 3: 2x = 8\nDivide by 2: x = 4'
          }
        ],
        exercises: [
          {
            question: 'Solve for x: 3x - 6 = 12',
            answer: '6',
            explanation: 'Add 6: 3x = 18, then divide by 3: x = 6'
          }
        ]
      },
      order: 2,
      duration: 45,
      objectives: 'Solve linear equations using proper algebraic methods',
      isActive: true,
    },
  })

  // Create course teachers
  await prisma.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId: mathCourse.id, teacherId: teacher.id } },
    update: {},
    create: {
      courseId: mathCourse.id,
      teacherId: teacher.id,
      role: 'instructor',
    },
  })

  await prisma.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId: scienceCourse.id, teacherId: teacher.id } },
    update: {},
    create: {
      courseId: scienceCourse.id,
      teacherId: teacher.id,
      role: 'instructor',
    },
  })

  await prisma.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId: englishCourse.id, teacherId: teacher.id } },
    update: {},
    create: {
      courseId: englishCourse.id,
      teacherId: teacher.id,
      role: 'instructor',
    },
  })

  await prisma.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId: historyCourse.id, teacherId: teacher.id } },
    update: {},
    create: {
      courseId: historyCourse.id,
      teacherId: teacher.id,
      role: 'instructor',
    },
  })

  await prisma.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId: geometryCourse.id, teacherId: teacher.id } },
    update: {},
    create: {
      courseId: geometryCourse.id,
      teacherId: teacher.id,
      role: 'instructor',
    },
  })

  await prisma.courseTeacher.upsert({
    where: { courseId_teacherId: { courseId: chemistryCourse.id, teacherId: teacher.id } },
    update: {},
    create: {
      courseId: chemistryCourse.id,
      teacherId: teacher.id,
      role: 'instructor',
    },
  })

  // Create enrollment for the student in math course
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: mathCourse.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: mathCourse.id,
      status: 'ACTIVE',
    },
  })

  // Create some progress records
  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: student.id, lessonId: mathLesson1.id } },
    update: {},
    create: {
      userId: student.id,
      lessonId: mathLesson1.id,
      completed: true,
      score: 95,
      timeSpent: 1800, // 30 minutes
      completedAt: new Date(),
    },
  })

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: student.id, lessonId: mathLesson2.id } },
    update: {},
    create: {
      userId: student.id,
      lessonId: mathLesson2.id,
      completed: false,
      score: null,
      timeSpent: 900, // 15 minutes
    },
  })

  // Create a sample assignment
  const assignment = await prisma.assignment.upsert({
    where: { id: 'assignment-1' },
    update: {},
    create: {
      id: 'assignment-1',
      title: 'Algebra Quiz 1',
      description: 'Test your understanding of variables and basic equations',
      type: 'QUIZ',
      points: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      courseId: mathCourse.id,
      moduleId: mathModule1.id,
      questions: [
        {
          question: 'What is the value of 2x + 3 when x = 5?',
          type: 'multiple_choice',
          options: ['10', '13', '15', '17'],
          correctAnswer: '13'
        },
        {
          question: 'Solve for x: 3x - 6 = 12',
          type: 'text',
          correctAnswer: '6'
        }
      ]
    },
  })

  console.log('Database seeded successfully!')
  console.log('Test accounts:')
  console.log('- Student: student@example.com / password123')
  console.log('- Teacher: teacher@example.com / password123')
  console.log('- Admin: admin@example.com / password123')
  console.log('- Parent: parent@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 