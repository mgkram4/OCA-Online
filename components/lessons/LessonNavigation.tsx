'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface LessonNavigationProps {
  lessonId: string
}

interface Lesson {
  id: string
  title: string
  order: number
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export function LessonNavigation({ lessonId }: LessonNavigationProps) {
  const [module, setModule] = useState<Module | null>(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchModuleData()
  }, [lessonId])

  const fetchModuleData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/lessons/${lessonId}`)
      const data = await response.json()
      
      // Fetch all lessons in the module
      const moduleResponse = await fetch(`/api/modules/${data.module.id}/lessons`)
      const moduleData = await moduleResponse.json()
      
      setModule(moduleData)
      const lessonIndex = moduleData.lessons.findIndex((l: Lesson) => l.id === lessonId)
      setCurrentLessonIndex(lessonIndex)
    } catch (error) {
      console.error('Error fetching module data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!module) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Module not found</p>
        </CardContent>
      </Card>
    )
  }

  const currentLesson = module.lessons[currentLessonIndex]
  const hasPrevious = currentLessonIndex > 0
  const hasNext = currentLessonIndex < module.lessons.length - 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {module.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Lesson {currentLessonIndex + 1} of {module.lessons.length}
          </div>
          
          <div className="space-y-2">
            {module.lessons.map((lesson, index) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <div className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  lesson.id === lessonId
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{lesson.title}</span>
                    {index < currentLessonIndex && (
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrevious}
              onClick={() => {
                if (hasPrevious) {
                  window.location.href = `/lessons/${module.lessons[currentLessonIndex - 1].id}`
                }
              }}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNext}
              onClick={() => {
                if (hasNext) {
                  window.location.href = `/lessons/${module.lessons[currentLessonIndex + 1].id}`
                }
              }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 