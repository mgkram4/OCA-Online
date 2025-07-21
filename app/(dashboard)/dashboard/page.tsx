'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUser } from '@/hooks/useUser'
import {
    BookOpen,
    Calendar,
    GraduationCap,
    Target,
    TrendingUp,
    Trophy
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  gradeLevel?: number
  gpa?: number
  totalCredits?: number
}

interface Enrollment {
  id: string
  status: string
  course: {
    id: string
    title: string
    subject: string
    credits: number
  }
}

interface Progress {
  id: string
  completedAt: string
  lesson: {
    title: string
  }
}

interface Todo {
  id: string
  title: string
  completed: boolean
}

interface DashboardData {
  user: User
  enrollments: Enrollment[]
  progress: Progress[]
  todos: Todo[]
}

export default function DashboardPage() {
  const { user, loading } = useUser()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/student')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalCredits = dashboardData?.user?.totalCredits || 0
  const targetCredits = 22 // Standard high school requirement
  const progressPercentage = (totalCredits / targetCredits) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
                     Here&apos;s your learning progress and upcoming tasks.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">
              of {targetCredits} required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.enrollments?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              courses in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.user?.gpa?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              current grade point average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Due</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                             {dashboardData?.todos?.filter((todo: Todo) => !todo.completed).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              pending tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graduation Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Graduation Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Credits Earned</span>
                  <span>{totalCredits} / {targetCredits}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <p className="text-sm text-gray-600">
                {targetCredits - totalCredits} credits remaining to graduate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                             {dashboardData?.progress?.slice(0, 3).map((item: Progress) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Completed {item.lesson?.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!dashboardData?.progress || dashboardData.progress.length === 0) && (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/courses">
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline">
              <Trophy className="h-4 w-4 mr-2" />
              AI Tutor Chat
            </Button>
          </Link>
          <Link href="/progress">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Progress
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 