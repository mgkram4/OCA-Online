'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/useUser'
import {
    AlertCircle,
    BookOpen,
    CheckCircle,
    Eye,
    FileText,
    MessageCircle,
    TrendingUp,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface TeacherDashboardData {
  teacher: {
    id: string
    name: string
    email: string
    role: string
  }
  courses: Array<{
    id: string
    title: string
    subject: string
    credits: number
    totalStudents: number
    activeStudents: number
    completedStudents: number
    averageProgress: number
    pendingSubmissions: number
    totalLessons: number
    gradeLevel: number
  }>
  recentActivities: Array<{
    id: string
    type: string
    title: string
    subtitle: string
    timestamp: string
    studentId: string
    studentName: string
    courseId: string
    courseTitle: string
  }>
  recentSubmissions: Array<{
    id: string
    type: string
    title: string
    subtitle: string
    timestamp: string
    studentId: string
    studentName: string
    courseId: string
    courseTitle: string
    assignmentId: string
    assignmentTitle: string
    points: number
  }>
  statistics: {
    totalCourses: number
    totalStudents: number
    activeStudents: number
    pendingSubmissions: number
    averageProgress: number
  }
}

export default function TeacherDashboardPage() {
  const { user } = useUser()
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/teacher')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Failed to fetch teacher dashboard data:', error)
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
        <h1 className="text-2xl font-bold mb-4">Teacher Dashboard</h1>
        <p>Failed to load dashboard data.</p>
      </div>
    )
  }

  const { teacher, courses, recentActivities, recentSubmissions, statistics } = dashboardData

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {teacher.name}! Monitor your students and courses.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => window.location.href = '/courses'}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Manage Courses
          </Button>
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Messages
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.activeStudents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              Need grading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Student Activity</TabsTrigger>
          <TabsTrigger value="submissions">Pending Submissions</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="mb-2">
                      {course.subject}
                    </Badge>
                    <Badge variant="outline">
                      Grade {course.gradeLevel}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>
                    {course.credits} credits • {course.totalLessons} lessons
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Students:</span>
                      <div className="text-2xl font-bold">{course.totalStudents}</div>
                      <p className="text-xs text-muted-foreground">
                        {course.activeStudents} active
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Progress:</span>
                      <div className="text-2xl font-bold">{course.averageProgress}%</div>
                      <p className="text-xs text-muted-foreground">
                        Average
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Course Progress</span>
                      <span>{course.averageProgress}%</span>
                    </div>
                    <Progress value={course.averageProgress} className="h-2" />
                  </div>

                  {course.pendingSubmissions > 0 && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">
                        {course.pendingSubmissions} submissions need grading
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.location.href = `/courses/${course.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Course
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.location.href = `/courses/${course.id}/students`}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Activity Overview</CardTitle>
              <CardDescription>
                Recent student activities across all your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.subtitle} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Student
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Submissions</CardTitle>
              <CardDescription>
                Assignments that need to be graded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending submissions</p>
                  </div>
                ) : (
                  recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">{submission.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.subtitle} • {new Date(submission.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{submission.points} points</p>
                        <Button size="sm" className="mt-1">
                          Grade
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Student Activities
                </CardTitle>
                <CardDescription>
                  Latest learning activities from your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.subtitle} • {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
                <CardDescription>
                  Latest assignment submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSubmissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{submission.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {submission.subtitle} • {new Date(submission.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {submission.points} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 