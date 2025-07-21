import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

interface CourseWithModules {
  id: string
  title: string
  description: string
  subject: string
  credits: number
  price: number
  isFree: boolean
  requiresProctoring: boolean
  proctoringType: string | null
  totalHours: number | null
  difficulty: string | null
  gradeLevel: number
  modules: Array<{
    lessons: Array<{ id: string }>
  }>
  enrollments: Array<{ id: string }>
  teachers: Array<{
    teacher: {
      id: string
      name: string
    }
    role: string
  }>
}

interface CourseWithStats {
  id: string
  title: string
  description: string
  subject: string
  credits: number
  price: number
  isFree: boolean
  requiresProctoring: boolean
  proctoringType: string | null
  totalHours: number | null
  difficulty: string | null
  modules: number
  enrollments: number
  isEnrolled: boolean
  totalLessons: number
  gradeLevel: number
  teachers: Array<{
    name: string
    role: string
  }>
}

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const grade = searchParams.get('grade')
  const subject = searchParams.get('subject')
  const difficulty = searchParams.get('difficulty')
  const priceRange = searchParams.get('priceRange')
  const requiresProctoring = searchParams.get('requiresProctoring')

  try {
    // Build where clause for filtering
    const whereClause: {
      isActive: boolean
      gradeLevel?: number
      subject?: string
      difficulty?: string
      requiresProctoring?: boolean
    } = {
      isActive: true
    }

    if (grade) {
      whereClause.gradeLevel = parseInt(grade)
    }

    if (subject) {
      whereClause.subject = subject
    }

    if (difficulty) {
      whereClause.difficulty = difficulty
    }

    if (requiresProctoring) {
      whereClause.requiresProctoring = requiresProctoring === 'true'
    }

    // Get all courses with enrollment status for the current user
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        modules: {
          include: {
            lessons: true
          }
        },
        enrollments: {
          where: {
            userId: userId
          }
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    })

    const coursesWithStats = courses.map((course: CourseWithModules): CourseWithStats => {
      const totalLessons = course.modules.reduce((sum: number, module) => sum + module.lessons.length, 0)
      const isEnrolled = course.enrollments.length > 0
      
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        subject: course.subject,
        credits: course.credits,
        price: course.price,
        isFree: course.isFree,
        requiresProctoring: course.requiresProctoring,
        proctoringType: course.proctoringType,
        totalHours: course.totalHours,
        difficulty: course.difficulty,
        modules: course.modules.length,
        enrollments: Math.floor(Math.random() * 50) + 10, // Simulate enrollment numbers for demo
        isEnrolled,
        totalLessons,
        gradeLevel: course.gradeLevel,
        teachers: course.teachers.map(t => ({
          name: t.teacher.name || 'Unknown Teacher',
          role: t.role
        }))
      }
    })

    // Apply price range filter if specified
    let filteredCourses = coursesWithStats
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => parseFloat(p))
      filteredCourses = filteredCourses.filter((course: CourseWithStats) => {
        if (course.isFree) return min === 0
        return course.price >= min && course.price <= max
      })
    }

    return NextResponse.json(filteredCourses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only teachers and admins can create courses
  if (user?.publicMetadata?.role !== 'TEACHER' && user?.publicMetadata?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const {
      title,
      description,
      subject,
      credits,
      gradeLevel,
      price,
      isFree,
      requiresProctoring,
      proctoringType,
      totalHours,
      difficulty,
      prerequisites,
      syllabus,
      thumbnail,
      maxStudents,
      startDate,
      endDate
    } = body

    // Validate required fields
    if (!title || !description || !subject || !credits || !gradeLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        subject,
        credits: parseInt(credits),
        gradeLevel: parseInt(gradeLevel),
        price: price || 250.0,
        isFree: isFree || false,
        requiresProctoring: requiresProctoring || false,
        proctoringType,
        totalHours: totalHours ? parseInt(totalHours) : null,
        difficulty,
        prerequisites: prerequisites ? JSON.stringify(prerequisites) : null,
        syllabus,
        thumbnail,
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    // Add the creator as a teacher
    await prisma.courseTeacher.create({
      data: {
        courseId: course.id,
        teacherId: userId,
        role: 'instructor'
      }
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 