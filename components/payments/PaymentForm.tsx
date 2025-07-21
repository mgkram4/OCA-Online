'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const paymentSchema = z.object({
  scholarshipCode: z.string().optional(),
})

type PaymentFormProps = {
  courseId: string
  courseTitle: string
  courseCredits: number
  onSuccess: () => void
  onCancel: () => void
}

function PaymentFormContent({ courseId, courseTitle, courseCredits, onSuccess, onCancel }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const stripe = useStripe()
  const elements = useElements()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
  })

  const onSubmit = async (data: z.infer<typeof paymentSchema>) => {
    if (!stripe || !elements) {
      toast.error('Stripe not loaded')
      return
    }

    setIsProcessing(true)

    try {
      // Create payment intent
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          scholarshipCode: data.scholarshipCode,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent')
      }

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(result.paymentIntent.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Payment successful! You are now enrolled.')
      onSuccess()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const coursePrice = courseCredits * 250 // $250 per credit

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Enroll in {courseTitle}</CardTitle>
        <CardDescription>
          Complete your enrollment by providing payment information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Course Details</Label>
            <div className="text-sm text-muted-foreground">
              <p>Credits: {courseCredits}</p>
              <p>Price: ${coursePrice}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scholarshipCode">Scholarship Code (Optional)</Label>
            <Input
              id="scholarshipCode"
              {...register('scholarshipCode')}
              placeholder="Enter scholarship code"
            />
            {errors.scholarshipCode && (
              <p className="text-sm text-red-500">{errors.scholarshipCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Information</Label>
            <div className="border rounded-md p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : `Pay $${coursePrice}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  )
} 