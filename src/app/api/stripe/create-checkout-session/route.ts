import { NextRequest, NextResponse } from "next/server"
import { createProCheckoutSession } from "@/lib/stripe-helpers"
import { auth } from "@/lib/auth" // Assuming you have an auth helper
import { Id } from "@/convex/_generated/dataModel"

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    // Note: You'll need to implement your auth logic here
    // This is a placeholder - replace with your actual auth implementation
    const userId = req.headers.get("x-user-id") as Id<"users">
    const userEmail = req.headers.get("x-user-email")

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { priceId, billingPeriod } = await req.json()

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      )
    }

    // Create checkout session
    const session = await createProCheckoutSession(
      userId,
      userEmail,
      priceId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=canceled`
    )

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}