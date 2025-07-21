'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useUser } from '@/hooks/useUser'
import { CheckCircle, Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LessonContentProps {
  lessonId: string
}

interface LessonData {
  id: string
  title: string
  content: Record<string, unknown>
  duration: number
}

export function LessonContent({ lessonId }: LessonContentProps) {
  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeSpent, setTimeSpent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    fetchLesson()
  }, [lessonId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const fetchLesson = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/lessons/${lessonId}`)
      const data = await response.json()
      setLesson(data.lesson)
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const markAsCompleted = async () => {
    if (!user?.id || !lessonId) return

    try {
      await fetch(`/api/progress/${user.id}/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          score: 100,
          timeSpent
        })
      })
    } catch (error) {
      console.error('Error marking lesson as completed:', error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!lesson) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Lesson not found</p>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = Math.min((timeSpent / (lesson.duration * 60)) * 100, 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{lesson.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markAsCompleted}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Duration: {lesson.duration} minutes</span>
          <span>Time spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          {/* Render lesson content based on its structure */}
          {typeof lesson.content === 'object' && lesson.content !== null && (
            <div>
              {Object.entries(lesson.content).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{key}</h3>
                  <div className="text-gray-700">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 