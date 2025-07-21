import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const createPaymentIntent = async ({
  amount,
  currency = 'usd',
  metadata = {},
}: {
  amount: number
  currency?: string
  metadata?: Record<string, string>
}) => {
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

export const createCustomer = async ({
  email,
  name,
  metadata = {},
}: {
  email: string
  name?: string
  metadata?: Record<string, string>
}) => {
  return stripe.customers.create({
    email,
    name,
    metadata,
  })
}

export const createSubscription = async ({
  customerId,
  priceId,
  metadata = {},
}: {
  customerId: string
  priceId: string
  metadata?: Record<string, string>
}) => {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
  })
}

export const createRefund = async ({
  paymentIntentId,
  amount,
  reason = 'requested_by_customer',
}: {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}) => {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason,
  })
} 