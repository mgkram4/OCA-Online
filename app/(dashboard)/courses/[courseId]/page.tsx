'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, BookOpen, Clock, Play } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  order: number
  duration: number
  completed: boolean
  progress: number
}

interface Course {
  id: string
  title: string
  description: string
  subject: string
  credits: number
  modules: Module[]
  totalLessons: number
  completedLessons: number
  progress: number
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.courseId) {
      fetchCourseDetails()
    }
  }, [params.courseId])

  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/courses/${params.courseId}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      } else {
        router.push('/courses')
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
      router.push('/courses')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Course not found
          </h1>
          <Link href="/courses">
            <Button>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/courses" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Courses
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{course.subject}</Badge>
            <Badge variant="outline">{course.credits} credits</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {course.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {course.description}
          </p>
          
          {/* Progress Overview */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course Progress
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {course.completedLessons} of {course.totalLessons} lessons completed
                </span>
              </div>
              <Progress value={course.progress} className="mb-2" />
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.modules.length} modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.totalLessons} lessons</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Course Content
            </h2>
            <div className="space-y-4">
              {course.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Module {module.order}: {module.title}
                    </CardTitle>
                    <CardDescription>
                      {module.lessons.length} lessons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              lesson.completed 
                                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {lesson.completed ? '✓' : lesson.order}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {lesson.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {lesson.duration} minutes
                              </p>
                            </div>
                          </div>
                          <Link href={`/lessons/${lesson.id}`}>
                            <Button variant="outline" size="sm">
                              {lesson.completed ? 'Review' : 'Start'}
                              <Play className="ml-2 w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Subject</span>
                  <span className="font-medium">{course.subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Credits</span>
                  <span className="font-medium">{course.credits}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Modules</span>
                  <span className="font-medium">{course.modules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</span>
                  <span className="font-medium">{course.totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-medium">{course.completedLessons}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 