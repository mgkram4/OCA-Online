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

    // Only teachers can access this endpoint
    if (user?.publicMetadata?.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get teacher's courses
    const teacherCourses = await prisma.courseTeacher.findMany({
      where: { teacherId: userId },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    gradeLevel: true,
                    gpa: true,
                    totalCredits: true
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
                            title: true
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
                }
              }
            },
            modules: {
              include: {
                lessons: true
              }
            },
            assignments: {
              include: {
                submissions: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    // Calculate course statistics
    const courseStats = teacherCourses.map((courseTeacher: any) => {
      const course = courseTeacher.course
      const activeEnrollments = course.enrollments.filter((e: any) => e.status === 'ACTIVE')
      const completedEnrollments = course.enrollments.filter((e: any) => e.status === 'COMPLETED')
      
      const totalLessons = course.modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0)
      
      const averageProgress = activeEnrollments.length > 0 
        ? activeEnrollments.reduce((sum: number, enrollment: any) => {
            const completedLessons = enrollment.progress.filter((p: any) => p.completed).length
            return sum + (completedLessons / totalLessons) * 100
          }, 0) / activeEnrollments.length
        : 0

      const pendingSubmissions = course.assignments.reduce((sum: number, assignment: any) => 
        sum + assignment.submissions.filter((s: any) => s.status === 'SUBMITTED').length, 0
      )

      return {
        id: course.id,
        title: course.title,
        subject: course.subject,
        credits: course.credits,
        totalStudents: course.enrollments.length,
        activeStudents: activeEnrollments.length,
        completedStudents: completedEnrollments.length,
        averageProgress: Math.round(averageProgress),
        pendingSubmissions,
        totalLessons,
        gradeLevel: course.gradeLevel
      }
    })

    // Get recent student activities
    const recentActivities = await prisma.progress.findMany({
      where: {
        lesson: {
          module: {
            course: {
              teachers: {
                some: {
                  teacherId: userId
                }
              }
            }
          }
        },
        completed: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                title: true,
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
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10
    })

    // Get recent submissions that need grading
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        assignment: {
          course: {
            teachers: {
              some: {
                teacherId: userId
              }
            }
          }
        },
        status: 'SUBMITTED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignment: {
          select: {
            id: true,
            title: true,
            type: true,
            points: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 10
    })

    // Calculate overall statistics
    const totalStudents = teacherCourses.reduce((sum: number, ct: any) => sum + ct.course.enrollments.length, 0)
    const totalActiveStudents = teacherCourses.reduce((sum: number, ct: any) => 
      sum + ct.course.enrollments.filter((e: any) => e.status === 'ACTIVE').length, 0
    )
    const totalPendingSubmissions = teacherCourses.reduce((sum: number, ct: any) => 
      sum + ct.course.assignments.reduce((aSum: number, assignment: any) => 
        aSum + assignment.submissions.filter((s: any) => s.status === 'SUBMITTED').length, 0
      ), 0
    )

    return NextResponse.json({
      teacher: {
        id: userId,
        name: user?.fullName,
        email: user?.emailAddresses[0]?.emailAddress,
        role: user?.publicMetadata?.role
      },
      courses: courseStats,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: 'lesson_completed',
        title: `${activity.user.name} completed ${activity.lesson.title}`,
        subtitle: `${activity.lesson.module.course.title} • ${activity.lesson.module.title}`,
        timestamp: activity.completedAt,
        studentId: activity.user.id,
        studentName: activity.user.name,
        courseId: activity.lesson.module.course.id,
        courseTitle: activity.lesson.module.course.title
      })),
      recentSubmissions: recentSubmissions.map(submission => ({
        id: submission.id,
        type: 'assignment_submitted',
        title: `${submission.user.name} submitted ${submission.assignment.title}`,
        subtitle: `${submission.assignment.course.title} • ${submission.assignment.type}`,
        timestamp: submission.submittedAt,
        studentId: submission.user.id,
        studentName: submission.user.name,
        courseId: submission.assignment.course.id,
        courseTitle: submission.assignment.course.title,
        assignmentId: submission.assignment.id,
        assignmentTitle: submission.assignment.title,
        points: submission.assignment.points
      })),
      statistics: {
        totalCourses: teacherCourses.length,
        totalStudents,
        activeStudents: totalActiveStudents,
        pendingSubmissions: totalPendingSubmissions,
        averageProgress: courseStats.length > 0 
          ? Math.round(courseStats.reduce((sum, course) => sum + course.averageProgress, 0) / courseStats.length)
          : 0
      }
    })

  } catch (error) {
    console.error('Teacher dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teacher dashboard data' },
      { status: 500 }
    )
  }
} 