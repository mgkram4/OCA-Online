import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const { userId: authUserId } = await auth()
  if (!authUserId || authUserId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all progress records for the user
    const progressRecords = await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true
              }
            }
          }
        }
      }
    })

    // Get user enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            }
          }
        }
      }
    })

    // Calculate overall stats
    const totalLessons = progressRecords.length
    const completedLessons = progressRecords.filter(p => p.completed).length
    const totalTime = progressRecords.reduce((sum, p) => sum + p.timeSpent, 0)
    const averageScore = progressRecords.length > 0
      ? progressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / progressRecords.length
      : 0
    const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

    // Group progress by course
    const courseProgress = enrollments.map(enrollment => {
      const courseProgressRecords = progressRecords.filter(
        p => p.lesson.module.course.id === enrollment.course.id
      )
      
      const courseCompletedLessons = courseProgressRecords.filter(p => p.completed).length
      const courseTotalLessons = enrollment.course.modules.reduce(
        (sum, module) => sum + module.lessons.length, 0
      )
      const courseProgress = courseTotalLessons > 0 
        ? (courseCompletedLessons / courseTotalLessons) * 100 
        : 0
      const courseAverageScore = courseProgressRecords.length > 0
        ? courseProgressRecords.reduce((sum, p) => sum + (p.score || 0), 0) / courseProgressRecords.length
        : 0
      const courseTimeSpent = courseProgressRecords.reduce((sum, p) => sum + p.timeSpent, 0)

      return {
        id: enrollment.course.id,
        title: enrollment.course.title,
        subject: enrollment.course.subject,
        completedLessons: courseCompletedLessons,
        totalLessons: courseTotalLessons,
        progress: courseProgress,
        averageScore: courseAverageScore,
        timeSpent: courseTimeSpent
      }
    })

    // Mock achievements (in a real app, these would come from a separate table)
    const achievements = [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Learning'
      },
      {
        id: '2',
        title: 'Dedicated Learner',
        description: 'Study for 5 hours total',
        icon: '⏰',
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Time'
      },
      {
        id: '3',
        title: 'Perfect Score',
        description: 'Get 100% on a lesson',
        icon: '🏆',
        unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Achievement'
      }
    ]

    // Mock recent activity
    const recentActivity = [
      {
        id: '1',
        type: 'lesson_completed' as const,
        title: 'Completed Introduction to Variables',
        description: 'Great job! You finished the lesson with 95% accuracy.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'course_started' as const,
        title: 'Started Introduction to Mathematics',
        description: 'You enrolled in your first course!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'achievement_unlocked' as const,
        title: 'Unlocked Perfect Score Achievement',
        description: 'Congratulations on getting 100%!',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({
      overall: {
        totalLessons,
        completedLessons,
        totalTime,
        averageScore,
        completionRate
      },
      courses: courseProgress,
      achievements,
      recentActivity
    })
  } catch (error) {
    console.error('Error fetching detailed progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 