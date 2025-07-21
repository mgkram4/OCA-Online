'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/useUser'
import {
    Activity,
    BookOpen,
    Eye,
    GraduationCap,
    MessageCircle,
    TrendingUp
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ParentDashboardData {
  parent: {
    id: string
    name: string
    email: string
    role: string
  }
  children: Array<{
    id: string
    name: string
    email: string
    gradeLevel: number
    graduationYear: number
    gpa: number
    totalCredits: number
    academicSummary: {
      activeCourses: number
      completedCourses: number
      totalCreditsEarned: number
      currentGPA: number
    }
    currentCourses: Array<{
      id: string
      title: string
      subject: string
      credits: number
      progress: number
      status: string
    }>
    recentProgress: Array<{
      id: string
      lessonTitle: string
      courseTitle: string
      completedAt: string
    }>
    recentGrades: Array<{
      id: string
      assignmentTitle: string
      courseTitle: string
      grade: number
      points: number
      submittedAt: string
    }>
    latestTranscript: {
      id: string
      gpa: number
      totalCredits: number
      createdAt: string
    } | null
  }>
}

export default function ParentDashboardPage() {
  const { user } = useUser()
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/parent/children')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Failed to fetch parent dashboard data:', error)
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
        <h1 className="text-2xl font-bold mb-4">Parent Dashboard</h1>
        <p>Failed to load dashboard data.</p>
      </div>
    )
  }

  const { parent, children } = dashboardData

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {parent.name}! Monitor your children's academic progress.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact Teachers
          </Button>
        </div>
      </div>

      {/* Children Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="mb-2">
                  Grade {child.gradeLevel}
                </Badge>
                <Badge variant="outline">
                  Class of {child.graduationYear}
                </Badge>
              </div>
              <CardTitle className="text-lg">{child.name}</CardTitle>
              <CardDescription>
                {child.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">GPA:</span>
                  <div className="text-2xl font-bold">{child.gpa.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Current GPA
                  </p>
                </div>
                <div>
                  <span className="font-medium">Credits:</span>
                  <div className="text-2xl font-bold">{child.totalCredits}</div>
                  <p className="text-xs text-muted-foreground">
                    {child.academicSummary.totalCreditsEarned} earned
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Graduation Progress</span>
                  <span>{Math.round((child.totalCredits / 22) * 100)}%</span>
                </div>
                <Progress value={(child.totalCredits / 22) * 100} className="h-2" />
              </div>

              <div className="text-sm">
                <p><span className="font-medium">Active Courses:</span> {child.academicSummary.activeCourses}</p>
                <p><span className="font-medium">Completed Courses:</span> {child.academicSummary.completedCourses}</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.location.href = `/parent/children/${child.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.location.href = `/parent/children/${child.id}/progress`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Recent Progress</TabsTrigger>
          <TabsTrigger value="grades">Recent Grades</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Academic Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Summary
                </CardTitle>
                <CardDescription>
                  Overall academic performance of your children
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Grade {child.gradeLevel} • GPA: {child.gpa.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{child.totalCredits}/22 credits</p>
                        <p className="text-xs text-muted-foreground">
                          {child.academicSummary.activeCourses} active courses
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Current Courses
                </CardTitle>
                <CardDescription>
                  Active course enrollments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {children.flatMap(child => 
                    child.currentCourses.map(course => ({
                      ...course,
                      childName: child.name
                    }))
                  ).slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.childName} • {course.subject}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{course.progress}%</p>
                        <p className="text-xs text-muted-foreground">
                          {course.credits} credits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Learning Progress</CardTitle>
              <CardDescription>
                Latest lesson completions and learning activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.flatMap(child => 
                  child.recentProgress.map(progress => ({
                    ...progress,
                    childName: child.name
                  }))
                ).slice(0, 10).map((progress) => (
                  <div key={progress.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">{progress.childName} completed {progress.lessonTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {progress.courseTitle} • {new Date(progress.completedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>
                Latest assignment grades and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.flatMap(child => 
                  child.recentGrades.map(grade => ({
                    ...grade,
                    childName: child.name
                  }))
                ).slice(0, 10).map((grade) => (
                  <div key={grade.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">{grade.childName} received {grade.grade}/{grade.points} on {grade.assignmentTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {grade.courseTitle} • {new Date(grade.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {Math.round((grade.grade / grade.points) * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Learning Activities
                </CardTitle>
                <CardDescription>
                  Latest lesson completions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {children.flatMap(child => 
                    child.recentProgress.map(progress => ({
                      ...progress,
                      childName: child.name
                    }))
                  ).slice(0, 5).map((progress) => (
                    <div key={progress.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{progress.childName}: {progress.lessonTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {progress.courseTitle} • {new Date(progress.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Grades
                </CardTitle>
                <CardDescription>
                  Latest assignment scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {children.flatMap(child => 
                    child.recentGrades.map(grade => ({
                      ...grade,
                      childName: child.name
                    }))
                  ).slice(0, 5).map((grade) => (
                    <div key={grade.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{grade.childName}: {grade.assignmentTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.courseTitle} • {new Date(grade.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round((grade.grade / grade.points) * 100)}%
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