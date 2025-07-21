'use client'

import { PaymentForm } from '@/components/payments/PaymentForm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, GraduationCap, Play, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    subject: string
    credits: number
    gradeLevel: number
    thumbnail?: string
    modules: Array<{
      id: string
      title: string
      lessons: Array<{
        id: string
        title: string
        duration: number
      }>
    }>
  }
  enrollment?: {
    id: string
    status: string
    progress?: number
  }
  onEnrollmentSuccess?: () => void
}

export function CourseCard({ course, enrollment, onEnrollmentSuccess }: CourseCardProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [isEnrolling, setIsEnrolling] = useState(false)

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
  const totalDuration = course.modules.reduce((acc, module) => 
    acc + module.lessons.reduce((sum, lesson) => sum + lesson.duration, 0), 0
  )

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      // Check if user is already enrolled
      if (enrollment) {
        toast.info('You are already enrolled in this course')
        return
      }

      setShowPaymentDialog(true)
    } catch (error) {
      console.error('Enrollment error:', error)
      toast.error('Failed to start enrollment process')
    } finally {
      setIsEnrolling(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false)
    toast.success('Successfully enrolled in course!')
    onEnrollmentSuccess?.()
  }

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false)
  }

  const getStatusBadge = () => {
    if (!enrollment) return null

    switch (enrollment.status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-500">Active</Badge>
      case 'COMPLETED':
        return <Badge variant="default" className="bg-blue-500">Completed</Badge>
      case 'PAUSED':
        return <Badge variant="secondary">Paused</Badge>
      default:
        return <Badge variant="outline">{enrollment.status}</Badge>
    }
  }

  const coursePrice = course.credits * 250 // $250 per credit

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.subject}</span>
            </div>
            <div className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>{course.credits} credits</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.round(totalDuration / 60)}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Grade {course.gradeLevel}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Course Structure</h4>
              <div className="text-sm text-muted-foreground">
                <p>{course.modules.length} modules • {totalLessons} lessons</p>
              </div>
            </div>

            {enrollment && enrollment.progress !== undefined && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{Math.round(enrollment.progress)}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
            )}

            <div className="text-sm">
              <p className="font-medium">Prerequisites:</p>
              <p className="text-muted-foreground">
                {course.gradeLevel > 9 ? `Grade ${course.gradeLevel - 1} or equivalent` : 'None'}
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-shrink-0">
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">${coursePrice}</span>
              {enrollment ? (
                <Button 
                  onClick={() => window.location.href = `/courses/${course.id}`}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Button>
              ) : (
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="w-full"
                    >
                      {isEnrolling ? 'Processing...' : 'Enroll Now'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Enroll in Course</DialogTitle>
                    </DialogHeader>
                    <PaymentForm
                      courseId={course.id}
                      courseTitle={course.title}
                      courseCredits={course.credits}
                      onSuccess={handlePaymentSuccess}
                      onCancel={handlePaymentCancel}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
} 