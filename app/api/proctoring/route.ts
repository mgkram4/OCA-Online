import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignmentId = searchParams.get('assignmentId')

    const whereClause: {
      userId: string
      status?: string
      assignmentId?: string
    } = {
      userId: userId
    }

    if (status) {
      whereClause.status = status
    }

    if (assignmentId) {
      whereClause.assignmentId = assignmentId
    }

    const proctoringSessions = await prisma.proctoringSession.findMany({
      where: whereClause,
      include: {
        submissions: {
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(proctoringSessions)
  } catch (error) {
    console.error('Proctoring sessions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proctoring sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      assignmentId,
      status,
      startTime,
      endTime,
      duration,
      sessionData,
      flags,
      recordingUrl
    } = await request.json()

    // Validate required fields
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const proctoringSession = await prisma.proctoringSession.create({
      data: {
        userId: userId,
        assignmentId: assignmentId || null,
        status: status as 'NOT_REQUIRED' | 'REQUIRED' | 'SCHEDULED' | 'COMPLETED' | 'FAILED',
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        duration: duration || null,
        sessionData: sessionData || null,
        flags: flags || null,
        recordingUrl: recordingUrl || null
      }
    })

    return NextResponse.json(proctoringSession, { status: 201 })
  } catch (error) {
    console.error('Proctoring session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create proctoring session' },
      { status: 500 }
    )
  }
} 