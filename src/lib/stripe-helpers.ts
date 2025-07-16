import { stripe } from "./stripe"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import { Id } from "@/convex/_generated/dataModel"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

/**
 * Create or get a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: Id<"users">,
  email: string,
  name?: string
) {
  // Check if user already has a Stripe customer ID
  const subscriptionStatus = await convex.query(api.users.getSubscriptionStatus, { userId })
  
  if (subscriptionStatus.stripeCustomerId) {
    return subscriptionStatus.stripeCustomerId
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId: userId,
    },
  })

  // Update user with Stripe customer ID
  await convex.mutation(api.users.updateStripeCustomerId, {
    userId,
    stripeCustomerId: customer.id,
  })

  return customer.id
}

/**
 * Create a checkout session for upgrading to Pro
 */
export async function createProCheckoutSession(
  userId: Id<"users">,
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const customerId = await getOrCreateStripeCustomer(userId, email)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: userId,
    },
    subscription_data: {
      metadata: {
        userId: userId,
      },
    },
    // Enable promo codes
    allow_promotion_codes: true,
    // Collect billing address
    billing_address_collection: "required",
  })

  return session
}

/**
 * Create a portal session for managing subscriptions
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

/**
 * Cancel a subscription immediately
 */
export async function cancelSubscriptionImmediately(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

/**
 * Cancel a subscription at the end of the billing period
 */
export async function cancelSubscriptionAtPeriodEnd(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
  return subscription
}

/**
 * Resume a subscription that was set to cancel at period end
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
  return subscription
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["latest_invoice", "customer"],
  })
  return subscription
}