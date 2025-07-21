import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        module: {
          include: {
            course: true
          }
        },
        assignments: true
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Get user's progress for this lesson
    const progress = await prisma.progress.findFirst({
      where: {
        userId,
        lessonId: params.lessonId
      }
    })

    return NextResponse.json({
      lesson,
      progress
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 })
  }
} 