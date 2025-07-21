import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        gradeLevel: true,
        gpa: true,
        totalCredits: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get student's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
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

    // Get student's progress
    const progress = await prisma.progress.findMany({
      where: { userId: user.id },
      include: {
        lesson: true
      }
    })

    // Get student's todos
    const todos = await prisma.todo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      user,
      enrollments,
      progress,
      todos
    })
  } catch (error) {
    console.error('Error fetching student dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
} 