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

    // Only parents can access this endpoint
    if (user?.publicMetadata?.role !== 'PARENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const children = await prisma.user.findMany({
      where: {
        parentId: userId
      },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                subject: true,
                credits: true
              }
            }
          }
        },
        progress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                module: {
                  select: {
                    course: {
                      select: {
                        id: true,
                        title: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        submissions: {
          include: {
            assignment: {
              select: {
                id: true,
                title: true,
                type: true,
                points: true
              }
            }
          }
        },
        transcripts: {
          where: {
            isOfficial: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    // Calculate academic summary for each child
    const childrenWithSummary = children.map((child: any) => {
      const activeEnrollments = child.enrollments.filter((e: any) => e.status === 'ACTIVE')
      const completedEnrollments = child.enrollments.filter((e: any) => e.status === 'COMPLETED')
      
      const totalCreditsEarned = completedEnrollments.reduce((sum: number, e: any) => sum + e.creditsEarned, 0)
      const currentGPA = child.gpa || 0
      
      const recentProgress = child.progress
        .filter((p: any) => p.completed)
        .sort((a: any, b: any) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 5)
      
      const recentSubmissions = child.submissions
        .filter((s: any) => s.status === 'GRADED')
        .sort((a: any, b: any) => new Date(b.gradedAt!).getTime() - new Date(a.gradedAt!).getTime())
        .slice(0, 5)

      return {
        id: child.id,
        name: child.name,
        email: child.email,
        gradeLevel: child.gradeLevel,
        graduationYear: child.graduationYear,
        gpa: currentGPA,
        totalCredits: child.totalCredits,
        academicSummary: {
          activeCourses: activeEnrollments.length,
          completedCourses: completedEnrollments.length,
          totalCreditsEarned,
          currentGPA,
          graduationProgress: (totalCreditsEarned / 22) * 100 // 22 credits for high school graduation
        },
        currentCourses: activeEnrollments.map((enrollment: any) => ({
          id: enrollment.id,
          course: enrollment.course,
          status: enrollment.status,
          startDate: enrollment.startDate
        })),
        recentProgress: recentProgress.map((progress: any) => ({
          id: progress.id,
          lessonTitle: progress.lesson.title,
          courseTitle: progress.lesson.module.course.title,
          completedAt: progress.completedAt,
          score: progress.score
        })),
        recentGrades: recentSubmissions.map((submission: any) => ({
          id: submission.id,
          assignmentTitle: submission.assignment.title,
          assignmentType: submission.assignment.type,
          score: submission.score,
          maxScore: submission.maxScore,
          gradedAt: submission.gradedAt
        })),
        latestTranscript: child.transcripts[0] || null
      }
    })

    return NextResponse.json(childrenWithSummary)
  } catch (error) {
    console.error('Parent children fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children data' },
      { status: 500 }
    )
  }
} 