import { v } from "convex/values"
import { mutation, query, internalQuery } from "./_generated/server"
import { Doc, Id } from "./_generated/dataModel"

// Update user subscription from Stripe webhook
export const updateSubscriptionFromStripe = mutation({
  args: {
    stripeCustomerId: v.string(),
    subscriptionData: v.object({
      stripeSubscriptionId: v.string(),
      stripePriceId: v.string(),
      status: v.union(v.literal("free"), v.literal("active"), v.literal("canceled")),
      currentPeriodEnd: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Find user by Stripe customer ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer_id", (q) =>
        q.eq("subscription.stripeCustomerId", args.stripeCustomerId)
      )
      .first()

    if (!user) {
      throw new Error(`User not found for Stripe customer ID: ${args.stripeCustomerId}`)
    }

    // Update user subscription
    await ctx.db.patch(user._id, {
      subscription: {
        ...user.subscription,
        status: args.subscriptionData.status,
        stripeSubscriptionId: args.subscriptionData.stripeSubscriptionId,
        stripePriceId: args.subscriptionData.stripePriceId,
        currentPeriodEnd: args.subscriptionData.currentPeriodEnd,
      },
    })

    // If subscription is canceled or downgraded to free, you might want to
    // reset usage or perform other cleanup
    if (args.subscriptionData.status === "canceled" || args.subscriptionData.status === "free") {
      // Optional: Add any cleanup logic here
      console.log(`Subscription canceled/downgraded for user ${user._id}`)
    }

    return { success: true, userId: user._id }
  },
})

// Get user by email (useful for creating Stripe customers)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()
  },
})

// Update user's Stripe customer ID (useful when creating a new customer)
export const updateStripeCustomerId = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error("User not found")
    }

    await ctx.db.patch(args.userId, {
      subscription: {
        ...user.subscription,
        stripeCustomerId: args.stripeCustomerId,
      },
    })

    return { success: true }
  },
})

// Get user subscription status
export const getSubscriptionStatus = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Check if subscription has expired
    const now = Date.now()
    const isExpired = user.subscription.currentPeriodEnd 
      ? user.subscription.currentPeriodEnd < now 
      : false

    return {
      status: isExpired ? "free" : user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      isExpired,
      stripeCustomerId: user.subscription.stripeCustomerId,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId,
    }
  },
})

// Check usage limits (read-only)
export const checkUsageLimits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Check if usage needs reset
    const now = Date.now()
    const lastReset = new Date(user.usage.lastResetDate)
    const currentMonth = new Date(now).getMonth()
    const lastResetMonth = lastReset.getMonth()

    const needsReset = currentMonth !== lastResetMonth

    const limits = user.subscription.status === "active" 
      ? {
          documents: Infinity,
          audioMinutes: Infinity,
          aiTokens: Infinity,
          teachMeSessions: Infinity,
        }
      : {
          documents: 5,
          audioMinutes: 10,
          aiTokens: 10000,
          teachMeSessions: 3,
        }

    // If needs reset, return zeroed usage
    const usage = needsReset ? {
      documentsProcessed: 0,
      audioMinutesProcessed: 0,
      aiTokensUsed: 0,
    } : user.usage;

    return {
      usage,
      limits,
      needsReset,
      canUploadDocument: usage.documentsProcessed < limits.documents,
      canProcessAudio: usage.audioMinutesProcessed < limits.audioMinutes,
      remainingDocuments: Math.max(0, limits.documents - usage.documentsProcessed),
      remainingAudioMinutes: Math.max(0, limits.audioMinutes - usage.audioMinutesProcessed),
    }
  },
})

// Reset usage limits (mutation)
export const resetUsageLimits = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error("User not found")
    }

    await ctx.db.patch(args.userId, {
      usage: {
        documentsProcessed: 0,
        audioMinutesProcessed: 0,
        aiTokensUsed: 0,
        lastResetDate: Date.now(),
      },
    })

    return { success: true }
  },
})

// Increment usage when processing documents
export const incrementUsage = mutation({
  args: {
    userId: v.id("users"),
    documentsProcessed: v.optional(v.number()),
    audioMinutesProcessed: v.optional(v.number()),
    aiTokensUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error("User not found")
    }

    await ctx.db.patch(args.userId, {
      usage: {
        ...user.usage,
        documentsProcessed: user.usage.documentsProcessed + (args.documentsProcessed || 0),
        audioMinutesProcessed: user.usage.audioMinutesProcessed + (args.audioMinutesProcessed || 0),
        aiTokensUsed: user.usage.aiTokensUsed + (args.aiTokensUsed || 0),
      },
    })

    return { success: true }
  },
})

// Internal query to get current user
export const getCurrentUser = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity || !identity.email) {
      return null
    }

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first()
  },
})