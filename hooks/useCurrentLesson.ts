import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Lesson {
  id: string
  title: string
  content: Record<string, unknown>
  order: number
  duration: number
}

interface Module {
  id: string
  title: string
  order: number
}

interface Course {
  id: string
  title: string
  subject: string
  credits: number
}

export function useCurrentLesson() {
  const params = useParams()
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.lessonId) {
      fetchLessonData(params.lessonId as string)
    }
  }, [params.lessonId])

  const fetchLessonData = async (lessonId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/lessons/${lessonId}`)
      const data = await response.json()
      
      setCurrentLesson(data.lesson)
      setCurrentModule(data.module)
      setCurrentCourse(data.course)
    } catch (error) {
      console.error('Error fetching lesson data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    currentLesson,
    currentModule,
    currentCourse,
    isLoading,
  }
} 