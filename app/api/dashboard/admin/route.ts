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

    // Only admins can access this endpoint
    if (user?.publicMetadata?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all users with their basic information
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gradeLevel: true,
        gpa: true,
        totalCredits: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            course: {
              select: {
                id: true,
                title: true,
                subject: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all courses with enrollment statistics
    const courses = await prisma.course.findMany({
      include: {
        enrollments: {
          select: {
            id: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get recent activities across the platform
    const recentActivities = await prisma.progress.findMany({
      where: {
        completed: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
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
      take: 20
    })

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Calculate system statistics
    const totalUsers = users.length
    const totalStudents = users.filter(u => u.role === 'STUDENT').length
    const totalTeachers = users.filter(u => u.role === 'TEACHER').length
    const totalParents = users.filter(u => u.role === 'PARENT').length
    const totalAdmins = users.filter(u => u.role === 'ADMIN').length

    const totalCourses = courses.length
    const activeCourses = courses.filter(c => c.isActive).length
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollments.length, 0)
    const activeEnrollments = courses.reduce((sum, course) => 
      sum + course.enrollments.filter(e => e.status === 'ACTIVE').length, 0
    )

    const totalRevenue = recentPayments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0)

    const monthlyRevenue = recentPayments
      .filter(p => p.status === 'COMPLETED' && 
        new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, payment) => sum + payment.amount, 0)

    // Get user activity by role
    const studentActivity = recentActivities.filter(a => a.user.role === 'STUDENT')
    const teacherActivity = recentActivities.filter(a => a.user.role === 'TEACHER')

    // Calculate average GPA for students
    const students = users.filter(u => u.role === 'STUDENT')
    const averageGPA = students.length > 0 
      ? students.reduce((sum, student) => sum + (student.gpa || 0), 0) / students.length
      : 0

    return NextResponse.json({
      admin: {
        id: userId,
        name: user?.fullName,
        email: user?.emailAddresses[0]?.emailAddress,
        role: user?.publicMetadata?.role
      },
      statistics: {
        users: {
          total: totalUsers,
          students: totalStudents,
          teachers: totalTeachers,
          parents: totalParents,
          admins: totalAdmins
        },
        courses: {
          total: totalCourses,
          active: activeCourses,
          totalEnrollments,
          activeEnrollments
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue
        },
        academic: {
          averageGPA: Math.round(averageGPA * 100) / 100,
          totalCreditsAwarded: students.reduce((sum, student) => sum + student.totalCredits, 0)
        }
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: 'lesson_completed',
        title: `${activity.user.name} completed ${activity.lesson.title}`,
        subtitle: `${activity.lesson.module.course.title} • ${activity.lesson.module.title}`,
        timestamp: activity.completedAt,
        userId: activity.user.id,
        userName: activity.user.name,
        userRole: activity.user.role,
        courseId: activity.lesson.module.course.id,
        courseTitle: activity.lesson.module.course.title
      })),
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        type: 'payment',
        title: `${payment.user.name} made a payment`,
        subtitle: `$${payment.amount} • ${payment.status}`,
        timestamp: payment.createdAt,
        userId: payment.user.id,
        userName: payment.user.name,
        amount: payment.amount,
        status: payment.status
      })),
      topCourses: courses
        .map(course => ({
          id: course.id,
          title: course.title,
          subject: course.subject,
          totalEnrollments: course.enrollments.length,
          activeEnrollments: course.enrollments.filter(e => e.status === 'ACTIVE').length,
          teachers: course.teachers.map(t => t.teacher.name).join(', ')
        }))
        .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
        .slice(0, 5),
      userDistribution: {
        byRole: {
          students: totalStudents,
          teachers: totalTeachers,
          parents: totalParents,
          admins: totalAdmins
        },
        byGrade: users
          .filter(u => u.role === 'STUDENT' && u.gradeLevel)
          .reduce((acc, student) => {
            const grade = student.gradeLevel!
            acc[grade] = (acc[grade] || 0) + 1
            return acc
          }, {} as Record<number, number>)
      }
    })

  } catch (error) {
    console.error('Admin dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin dashboard data' },
      { status: 500 }
    )
  }
} 