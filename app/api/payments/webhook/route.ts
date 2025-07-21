import { prisma } from '@/lib/db/prisma'
import { stripe } from '@/lib/stripe/client'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object as Stripe.Invoice)
        break
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { id, metadata, amount } = paymentIntent
  
  // Update payment status
  await prisma.payment.update({
    where: { stripePaymentIntentId: id },
    data: { 
      status: 'COMPLETED',
      updatedAt: new Date()
    }
  })

  // Handle course enrollment if applicable
  if (metadata.courseId && metadata.userId) {
    const course = await prisma.course.findUnique({
      where: { id: metadata.courseId }
    })

    if (course) {
      // Create or update enrollment
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: metadata.userId,
            courseId: metadata.courseId
          }
        },
        update: {
          status: 'ACTIVE',
          startDate: new Date()
        },
        create: {
          userId: metadata.userId,
          courseId: metadata.courseId,
          status: 'ACTIVE',
          startDate: new Date()
        }
      })

      // Update user's total credits
      await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          totalCredits: {
            increment: course.credits
          }
        }
      })
    }
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { id } = paymentIntent
  
  await prisma.payment.update({
    where: { stripePaymentIntentId: id },
    data: { 
      status: 'FAILED',
      updatedAt: new Date()
    }
  })
}

async function handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
  // Handle subscription payments
  console.log('Invoice payment succeeded:', invoice.id)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Handle new subscription creation
  console.log('Subscription created:', subscription.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Handle subscription updates
  console.log('Subscription updated:', subscription.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Handle subscription cancellation
  console.log('Subscription deleted:', subscription.id)
} 