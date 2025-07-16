import { NextRequest, NextResponse } from "next/server"
import { createPortalSession } from "@/lib/stripe-helpers"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import { Id } from "@/convex/_generated/dataModel"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    // Note: Replace with your actual auth implementation
    const userId = req.headers.get("x-user-id") as Id<"users">

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's Stripe customer ID
    const subscriptionStatus = await convex.query(api.users.getSubscriptionStatus, { userId })

    if (!subscriptionStatus.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      )
    }

    // Create portal session
    const session = await createPortalSession(
      subscriptionStatus.stripeCustomerId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
    )

    return NextResponse.json({ 
      url: session.url 
    })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    )
  }
}