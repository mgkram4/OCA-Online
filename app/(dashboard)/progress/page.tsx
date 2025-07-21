'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/useUser'
import { Award, BookOpen, Clock, Target, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProgressData {
  overall: {
    totalLessons: number
    completedLessons: number
    totalTime: number
    averageScore: number
    completionRate: number
  }
  courses: Array<{
    id: string
    title: string
    subject: string
    completedLessons: number
    totalLessons: number
    progress: number
    averageScore: number
    timeSpent: number
  }>
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    unlockedAt: string
    category: string
  }>
  recentActivity: Array<{
    id: string
    type: 'lesson_completed' | 'course_started' | 'achievement_unlocked'
    title: string
    description: string
    timestamp: string
  }>
}

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user?.id) {
      fetchProgressData()
    }
  }, [user?.id])

  const fetchProgressData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/progress/detailed/${user?.id}`)
      const data = await response.json()
      setProgressData(data)
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No progress data available
          </h3>
          <p className="text-gray-600">
            Start learning to see your progress!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Learning Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your achievements and learning journey
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.overall.completionRate}%</div>
              <Progress value={progressData.overall.completionRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progressData.overall.completedLessons} of {progressData.overall.totalLessons} lessons
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(progressData.overall.totalTime)}</div>
              <p className="text-xs text-muted-foreground">
                Average 2.5 hours per week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.overall.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.achievements.length}</div>
              <p className="text-xs text-muted-foreground">
                Unlocked this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Course Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {progressData.courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge variant="secondary">{course.subject}</Badge>
                    </div>
                    <CardDescription>
                      {course.completedLessons} of {course.totalLessons} lessons completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="w-full" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Average Score:</span>
                          <div className="font-medium">{course.averageScore}%</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Time Spent:</span>
                          <div className="font-medium">{formatTime(course.timeSpent)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {progressData.achievements.map((achievement) => (
                <Card key={achievement.id} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {achievement.category}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">
                      Unlocked {formatDate(achievement.unlockedAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="space-y-4">
              {progressData.recentActivity.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.type === 'lesson_completed' && <Trophy className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'course_started' && <BookOpen className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'achievement_unlocked' && <Award className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
  )
} 