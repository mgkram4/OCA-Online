'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, DollarSign, GraduationCap, Users } from 'lucide-react'
import { useState } from 'react'

interface Course {
  id: string
  title: string
  description: string
  subject: string
  credits: number
  price: number
  isFree: boolean
  requiresProctoring: boolean
  totalHours: number | null
  difficulty: string | null
  teachers: Array<{
    name: string
    role: string
  }>
}

interface CourseEnrollmentModalProps {
  course: Course
  isOpen: boolean
  onClose: () => void
  onEnrollmentSuccess: () => void
}

const paymentOptions = [
  {
    id: 'full',
    name: 'Full Payment',
    description: 'Pay the full course amount upfront',
    icon: DollarSign
  },
  {
    id: 'monthly',
    name: 'Monthly Payment Plan',
    description: 'Pay in monthly installments',
    icon: CreditCard
  },
  {
    id: 'semester',
    name: 'Semester Payment Plan',
    description: 'Pay in two equal installments',
    icon: GraduationCap
  }
]

export function CourseEnrollmentModal({
  course,
  isOpen,
  onClose,
  onEnrollmentSuccess
}: CourseEnrollmentModalProps) {
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('full')
  const [isLoading, setIsLoading] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const { toast } = useToast()

  const calculatePayment = () => {
    const basePrice = course.price
    let discount = 0

    // Apply promo code discount (example: 10% off)
    if (promoCode === 'WELCOME10') {
      discount = basePrice * 0.1
    }

    const discountedPrice = basePrice - discount

    switch (selectedPaymentOption) {
      case 'full':
        return {
          total: discountedPrice,
          monthly: discountedPrice,
          installments: 1
        }
      case 'monthly':
        return {
          total: discountedPrice,
          monthly: discountedPrice / 6, // 6 months
          installments: 6
        }
      case 'semester':
        return {
          total: discountedPrice,
          monthly: discountedPrice / 2, // 2 installments
          installments: 2
        }
      default:
        return {
          total: discountedPrice,
          monthly: discountedPrice,
          installments: 1
        }
    }
  }

  const handleEnrollment = async () => {
    if (course.isFree) {
      await handleFreeEnrollment()
    } else {
      await handlePaidEnrollment()
    }
  }

  const handleFreeEnrollment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: course.id,
          paymentType: 'free'
        })
      })

      if (response.ok) {
        toast({
          title: 'Enrollment Successful!',
          description: `You have been enrolled in ${course.title}`,
        })
        onEnrollmentSuccess()
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to enroll')
      }
    } catch (error) {
      toast({
        title: 'Enrollment Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaidEnrollment = async () => {
    setIsLoading(true)
    try {
      if (selectedPaymentOption === 'full') {
        // Create payment intent for full payment
        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: calculatePayment().total,
            courseId: course.id,
            description: `Enrollment in ${course.title}`,
            metadata: {
              paymentType: 'full',
              promoCode
            }
          })
        })

        if (response.ok) {
          const { clientSecret } = await response.json()
          // Redirect to payment page or handle Stripe payment
          window.location.href = `/payment?client_secret=${clientSecret}&course_id=${course.id}`
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create payment')
        }
      } else {
        // Create payment plan
        const response = await fetch('/api/payments/payment-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: selectedPaymentOption.toUpperCase(),
            totalAmount: calculatePayment().total,
            monthlyAmount: calculatePayment().monthly,
            courseIds: [course.id]
          })
        })

        if (response.ok) {
          const paymentPlan = await response.json()
          toast({
            title: 'Payment Plan Created!',
            description: `Your ${selectedPaymentOption} payment plan has been set up.`,
          })
          onEnrollmentSuccess()
          onClose()
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create payment plan')
        }
      }
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const payment = calculatePayment()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enroll in {course.title}</DialogTitle>
          <DialogDescription>
            Choose your payment option and complete your enrollment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Course Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Subject:</span> {course.subject}
                </div>
                <div>
                  <span className="font-medium">Credits:</span> {course.credits}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {course.totalHours || 'N/A'} hours
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span> {course.difficulty || 'N/A'}
                </div>
              </div>
              
              {course.teachers.length > 0 && (
                <div>
                  <span className="font-medium text-sm">Instructors:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {course.teachers.map((teacher, index) => (
                      <span key={index} className="text-sm text-muted-foreground">
                        {teacher.name} ({teacher.role})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {course.requiresProctoring && (
                <div className="flex items-center gap-2 text-amber-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">This course requires proctored exams</span>
                </div>
              )}
            </CardContent>
          </Card>

          {!course.isFree && (
            <>
              {/* Payment Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Options</CardTitle>
                  <CardDescription>
                    Choose how you'd like to pay for this course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={selectedPaymentOption}
                    onValueChange={setSelectedPaymentOption}
                    className="space-y-4"
                  >
                    {paymentOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <div key={option.id} className="flex items-center space-x-3">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{option.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Promo Code (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
                  </div>
                  {promoCode === 'WELCOME10' && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ 10% discount applied!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Course Price:</span>
                      <span>${course.price.toFixed(2)}</span>
                    </div>
                    {promoCode === 'WELCOME10' && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (10%):</span>
                        <span>-${(course.price * 0.1).toFixed(2)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>${payment.total.toFixed(2)}</span>
                    </div>
                    {selectedPaymentOption !== 'full' && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Monthly Payment:</span>
                        <span>${payment.monthly.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleEnrollment}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : course.isFree ? 'Enroll Free' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 