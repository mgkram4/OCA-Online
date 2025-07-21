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
        lesson: true
      }
    })

    // Calculate statistics
    const totalLessons = progressRecords.length
    const completedLessons = progressRecords.filter((p: { completed: boolean }) => p.completed).length
    const totalTime = progressRecords.reduce((sum: number, p: { timeSpent: number }) => sum + p.timeSpent, 0)
    const averageScore = progressRecords.length > 0
      ? progressRecords.reduce((sum: number, p: { score: number | null }) => sum + (p.score || 0), 0) / progressRecords.length
      : 0

    return NextResponse.json({
      totalLessons,
      completedLessons,
      totalTime,
      averageScore
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 