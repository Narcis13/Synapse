import Stripe from 'stripe';

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Subscription price IDs (you'll need to create these in Stripe Dashboard)
export const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_synapse_pro_monthly',
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_synapse_pro_yearly',
};

// Create checkout session for subscription
export async function createCheckoutSession({
  userId,
  userEmail,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          userId,
        },
      },
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Create customer portal session for managing subscriptions
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

// Resume subscription (remove cancellation)
export async function resumeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return subscription;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
}

// Webhook event types we handle
export const WEBHOOK_EVENTS = {
  CHECKOUT_COMPLETED: 'checkout.session.completed',
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',
} as const;

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

// Process webhook events
export async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case WEBHOOK_EVENTS.CHECKOUT_COMPLETED: {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        type: 'checkout_completed',
        userId: session.metadata?.userId || session.client_reference_id,
        customerId: session.customer as string,
        subscriptionId: session.subscription as string,
      };
    }

    case WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
    case WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED: {
      const subscription = event.data.object as Stripe.Subscription;
      return {
        type: 'subscription_updated',
        userId: subscription.metadata?.userId,
        customerId: subscription.customer as string,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end * 1000, // Convert to milliseconds
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }

    case WEBHOOK_EVENTS.SUBSCRIPTION_DELETED: {
      const subscription = event.data.object as Stripe.Subscription;
      return {
        type: 'subscription_deleted',
        userId: subscription.metadata?.userId,
        customerId: subscription.customer as string,
        subscriptionId: subscription.id,
      };
    }

    case WEBHOOK_EVENTS.PAYMENT_SUCCEEDED: {
      const invoice = event.data.object as Stripe.Invoice;
      return {
        type: 'payment_succeeded',
        customerId: invoice.customer as string,
        subscriptionId: invoice.subscription as string,
        amountPaid: invoice.amount_paid / 100, // Convert from cents
      };
    }

    case WEBHOOK_EVENTS.PAYMENT_FAILED: {
      const invoice = event.data.object as Stripe.Invoice;
      return {
        type: 'payment_failed',
        customerId: invoice.customer as string,
        subscriptionId: invoice.subscription as string,
        attemptCount: invoice.attempt_count,
      };
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
      return null;
  }
}

// Helper to format price for display
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

// Helper to get subscription status label
export function getSubscriptionStatusLabel(status: Stripe.Subscription.Status): string {
  const statusLabels: Record<Stripe.Subscription.Status, string> = {
    active: 'Active',
    canceled: 'Canceled',
    incomplete: 'Incomplete',
    incomplete_expired: 'Expired',
    past_due: 'Past Due',
    trialing: 'Trial',
    unpaid: 'Unpaid',
    paused: 'Paused',
  };
  return statusLabels[status] || status;
}