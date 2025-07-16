import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { stripe, verifyWebhookSignature, processWebhookEvent } from "@/lib/stripe"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import Stripe from "stripe"

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = verifyWebhookSignature(body, signature)
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    // Process the webhook event using the helper function
    await processWebhookEvent(event)

    // Handle specific events and update Convex
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === "subscription" && session.subscription && session.customer) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Update user in Convex
          await convex.mutation(api.users.updateSubscriptionFromStripe, {
            stripeCustomerId: session.customer as string,
            subscriptionData: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: subscription.status === "active" ? "pro" : "free",
              currentPeriodEnd: subscription.current_period_end * 1000, // Convert to milliseconds
            },
          })
        }
        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        
        await convex.mutation(api.users.updateSubscriptionFromStripe, {
          stripeCustomerId: subscription.customer as string,
          subscriptionData: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: subscription.status === "active" ? "pro" : 
                    subscription.status === "canceled" ? "canceled" : "free",
            currentPeriodEnd: subscription.current_period_end * 1000,
          },
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        
        await convex.mutation(api.users.updateSubscriptionFromStripe, {
          stripeCustomerId: subscription.customer as string,
          subscriptionData: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: "canceled",
            currentPeriodEnd: subscription.current_period_end * 1000,
          },
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription && invoice.customer) {
          // Payment successful, ensure subscription is active
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          
          await convex.mutation(api.users.updateSubscriptionFromStripe, {
            stripeCustomerId: invoice.customer as string,
            subscriptionData: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: "pro",
              currentPeriodEnd: subscription.current_period_end * 1000,
            },
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription && invoice.customer) {
          // Payment failed, you might want to send an email or update status
          console.error("Payment failed for customer:", invoice.customer)
          
          // Optionally update the user's status to indicate payment issues
          // The subscription status will be updated by the subscription.updated event
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    // Return 200 to acknowledge receipt even if processing failed
    // This prevents Stripe from retrying
    return NextResponse.json(
      { error: "Webhook processing failed", received: true },
      { status: 200 }
    )
  }
}