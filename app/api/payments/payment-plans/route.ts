import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { createCustomer, createSubscription, stripe } from '@/lib/stripe/client'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const whereClause: {
      userId: string
      type?: string
    } = {
      userId: userId
    }

    if (type) {
      whereClause.type = type
    }

    const paymentPlans = await prisma.paymentPlan.findMany({
      where: whereClause,
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                credits: true,
                price: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(paymentPlans)
  } catch (error) {
    console.error('Payment plans fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      type,
      totalAmount,
      monthlyAmount,
      courseIds,
      startDate,
      endDate
    } = await request.json()

    if (!type || !totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid payment plan data' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripeCustomerId
    
    if (!stripeCustomerId) {
      const customer = await createCustomer({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          role: user.role
        }
      })
      
      stripeCustomerId = customer.id
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id }
      })
    }

    // Calculate next payment date based on plan type
    let nextPaymentDate: Date | null = null
    if (type === 'MONTHLY') {
      nextPaymentDate = new Date()
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
    } else if (type === 'SEMESTER') {
      nextPaymentDate = new Date()
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 6)
    }

    // Create payment plan
    const paymentPlan = await prisma.paymentPlan.create({
      data: {
        userId: user.id,
        type: type as 'FULL_PAYMENT' | 'MONTHLY' | 'SEMESTER' | 'COURSE_BY_COURSE',
        totalAmount,
        monthlyAmount: monthlyAmount || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        nextPaymentDate
      }
    })

    // If course IDs are provided, create enrollments
    if (courseIds && Array.isArray(courseIds)) {
      const enrollments = await Promise.all(
        courseIds.map(async (courseId: string) => {
          const course = await prisma.course.findUnique({
            where: { id: courseId }
          })

          if (!course) {
            throw new Error(`Course ${courseId} not found`)
          }

          return prisma.enrollment.create({
            data: {
              userId: user.id,
              courseId,
              paymentPlanId: paymentPlan.id,
              status: 'ACTIVE'
            }
          })
        })
      )

      // Create Stripe subscription for recurring payments
      if (type === 'MONTHLY' && monthlyAmount) {
        try {
          // First create a price
          const price = await stripe.prices.create({
            currency: 'usd',
            unit_amount: Math.round(monthlyAmount * 100),
            recurring: {
              interval: 'month'
            },
            product_data: {
              name: 'Monthly Tuition Payment'
            }
          })

          // Then create subscription
          const subscription = await createSubscription({
            customerId: stripeCustomerId,
            priceId: price.id,
            metadata: {
              paymentPlanId: paymentPlan.id,
              userId: user.id
            }
          })

          // Update payment plan with subscription ID
          await prisma.paymentPlan.update({
            where: { id: paymentPlan.id },
            data: { stripeSubscriptionId: subscription.id }
          })
        } catch (error) {
          console.error('Failed to create Stripe subscription:', error)
          // Continue without subscription - can be created later
        }
      }
    }

    return NextResponse.json(paymentPlan, { status: 201 })
  } catch (error) {
    console.error('Payment plan creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment plan' },
      { status: 500 }
    )
  }
} 