import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { userId } = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId } = await params

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: {
                    userId: userId
                  }
                }
              },
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
    }

    // Calculate progress
    const totalLessons = course.modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0)
    const completedLessons = course.modules.reduce((sum: number, module: any) => 
      sum + module.lessons.filter((lesson: any) => lesson.progress.length > 0 && lesson.progress[0].completed).length, 0
    )
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Format lessons with progress data
    const modulesWithProgress = course.modules.map((module: any) => ({
      id: module.id,
      title: module.title,
      order: module.order,
      lessons: module.lessons.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        duration: lesson.duration,
        completed: lesson.progress.length > 0 && lesson.progress[0].completed,
        progress: lesson.progress.length > 0 ? lesson.progress[0].timeSpent : 0
      }))
    }))

    return NextResponse.json({
      id: course.id,
      title: course.title,
      description: course.description,
      subject: course.subject,
      credits: course.credits,
      modules: modulesWithProgress,
      totalLessons,
      completedLessons,
      progress
    })
  } catch (error) {
    console.error('Error fetching course details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 