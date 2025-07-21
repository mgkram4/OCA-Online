'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUser } from '@/hooks/useUser'
import { BookOpen, Clock, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ProgressTracker() {
  const [progress, setProgress] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalTime: 0,
    averageScore: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    if (user?.id) {
      fetchProgress()
    }
  }, [user?.id])

  const fetchProgress = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/progress/user/${user?.id}`)
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completionPercentage = progress.totalLessons > 0 
    ? (progress.completedLessons / progress.totalLessons) * 100 
    : 0

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm text-gray-600">
                {progress.completedLessons} / {progress.totalLessons} lessons
              </span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">
              {completionPercentage.toFixed(1)}% complete
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Study Time</p>
                <p className="text-xs text-gray-600">
                  {formatTime(progress.totalTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Average Score</p>
                <p className="text-xs text-gray-600">
                  {progress.averageScore.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {completionPercentage >= 100 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Congratulations!</span>
              </div>
              <p className="text-sm mt-1">You&apos;ve completed all available lessons!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 