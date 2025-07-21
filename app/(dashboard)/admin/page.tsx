'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/useUser'
import {
    Activity,
    BarChart3,
    BookOpen,
    DollarSign,
    Eye,
    GraduationCap,
    Settings,
    TrendingUp,
    UserPlus,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface AdminDashboardData {
  admin: {
    id: string
    name: string
    email: string
    role: string
  }
  statistics: {
    users: {
      total: number
      students: number
      teachers: number
      parents: number
      admins: number
    }
    courses: {
      total: number
      active: number
      totalEnrollments: number
      activeEnrollments: number
    }
    revenue: {
      total: number
      monthly: number
    }
    academic: {
      averageGPA: number
      totalCreditsAwarded: number
    }
  }
  recentActivities: Array<{
    id: string
    type: string
    title: string
    subtitle: string
    timestamp: string
    userId: string
    userName: string
    userRole: string
    courseId: string
    courseTitle: string
  }>
  recentPayments: Array<{
    id: string
    type: string
    title: string
    subtitle: string
    timestamp: string
    userId: string
    userName: string
    amount: number
    status: string
  }>
  topCourses: Array<{
    id: string
    title: string
    subject: string
    totalEnrollments: number
    activeEnrollments: number
    teachers: string
  }>
  userDistribution: {
    byRole: {
      students: number
      teachers: number
      parents: number
      admins: number
    }
    byGrade: Record<number, number>
  }
}

export default function AdminDashboardPage() {
  const { user } = useUser()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/admin')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Failed to load dashboard data.</p>
      </div>
    )
  }

  const { admin, statistics, recentActivities, recentPayments, topCourses, userDistribution } = dashboardData

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {admin.name}! Monitor the entire platform.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => window.location.href = '/admin/users'}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.users.students} students, {statistics.users.teachers} teachers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statistics.revenue.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${statistics.revenue.monthly.toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.courses.active}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.courses.activeEnrollments} active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.academic.averageGPA}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.academic.totalCreditsAwarded} credits awarded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="courses">Course Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">Platform Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  User Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of users by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Students</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(statistics.users.students / statistics.users.total) * 100} className="w-20" />
                      <span className="text-sm font-medium">{statistics.users.students}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Teachers</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(statistics.users.teachers / statistics.users.total) * 100} className="w-20" />
                      <span className="text-sm font-medium">{statistics.users.teachers}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Parents</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(statistics.users.parents / statistics.users.total) * 100} className="w-20" />
                      <span className="text-sm font-medium">{statistics.users.parents}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admins</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(statistics.users.admins / statistics.users.total) * 100} className="w-20" />
                      <span className="text-sm font-medium">{statistics.users.admins}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Courses
                </CardTitle>
                <CardDescription>
                  Most popular courses by enrollment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.subject} • {course.teachers}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{course.totalEnrollments}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.activeEnrollments} active
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Overview of all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{statistics.users.students}</div>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{statistics.users.teachers}</div>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{statistics.users.parents}</div>
                  <p className="text-sm text-muted-foreground">Parents</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{statistics.users.admins}</div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Users
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>
                Performance metrics for all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{statistics.courses.total}</div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{statistics.courses.active}</div>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{statistics.courses.totalEnrollments}</div>
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {topCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.subject} • {course.teachers}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium">{course.totalEnrollments}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{course.activeEnrollments}</p>
                          <p className="text-xs text-muted-foreground">Active</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Financial performance and payment tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    ${statistics.revenue.total.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    ${statistics.revenue.monthly.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Recent Payments</h3>
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.subtitle} • {new Date(payment.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${payment.amount}</p>
                      <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Platform Activity
                </CardTitle>
                <CardDescription>
                  Latest activities across all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.subtitle} • {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.userRole}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Statistics
                </CardTitle>
                <CardDescription>
                  Key platform metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Users</span>
                    <span className="font-medium">{statistics.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Courses</span>
                    <span className="font-medium">{statistics.courses.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Enrollments</span>
                    <span className="font-medium">{statistics.courses.activeEnrollments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average GPA</span>
                    <span className="font-medium">{statistics.academic.averageGPA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Credits Awarded</span>
                    <span className="font-medium">{statistics.academic.totalCreditsAwarded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Revenue</span>
                    <span className="font-medium">${statistics.revenue.monthly.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 