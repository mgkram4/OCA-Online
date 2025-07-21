import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { moduleId } = await params

  try {
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: moduleData.id,
      title: moduleData.title,
      lessons: moduleData.lessons.map((lesson: { id: string; title: string; order: number }) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order
      }))
    })
  } catch (error) {
    console.error('Error fetching module lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 