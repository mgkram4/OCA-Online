import { prisma } from '@/lib/db/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; lessonId: string }> }
) {
  const { userId: authUserId } = await auth()
  const { userId, lessonId } = await params
  
  if (!authUserId || authUserId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const progress = await prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: lessonId
        }
      }
    })

    return NextResponse.json(progress || {
      completed: false,
      score: null,
      timeSpent: 0,
      lastAccessed: new Date()
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; lessonId: string }> }
) {
  const { userId: authUserId } = await auth()
  const { userId, lessonId } = await params
  
  if (!authUserId || authUserId !== userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { completed, score, timeSpent } = await req.json()

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: lessonId
        }
      },
      update: {
        completed,
        score,
        timeSpent,
        lastAccessed: new Date()
      },
      create: {
        userId: userId,
        lessonId: lessonId,
        completed,
        score,
        timeSpent,
        lastAccessed: new Date()
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 