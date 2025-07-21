import { authOptions } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { createCustomer, createPaymentIntent } from '@/lib/stripe/client'
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, courseId, description, metadata = {} } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
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

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: user.id,
        courseId: courseId || '',
        type: courseId ? 'course_enrollment' : 'tuition_payment',
        ...metadata
      }
    })

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount,
        currency: 'USD',
        status: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: stripeCustomerId,
        description: description || 'Course enrollment payment',
        metadata: metadata
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
      customerId: stripeCustomerId
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
} 