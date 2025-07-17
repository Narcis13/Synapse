import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Simple password hashing for demo purposes
// In production, use proper bcrypt or argon2 via an action
function simpleHash(password: string, salt: string): string {
  // This is a simple hash for demo - in production use proper crypto
  let hash = 0;
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Generate salt and hash password
    const salt = generateSalt();
    const hashedPassword = simpleHash(args.password, salt);

    // Create user with free tier
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: "student",
      passwordHash: hashedPassword,
      salt: salt,
      lastLoginAt: Date.now(),
      subscription: {
        status: "free",
        stripeCustomerId: undefined,
        stripePriceId: undefined,
        stripeSubscriptionId: undefined,
        currentPeriodEnd: undefined,
      },
      usage: {
        documentsProcessed: 0,
        audioMinutesProcessed: 0,
        aiTokensUsed: 0,
        lastResetDate: Date.now(),
      },
      createdAt: Date.now(),
    });

    // Initialize usage tracking
    await ctx.db.insert("usage", {
      userId,
      documentsUploaded: 0,
      quizzesGenerated: 0,
      summariesGenerated: 0,
      flashcardsGenerated: 0,
      teachMeSessionsUsed: 0,
      resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // Reset in 30 days
    });

    return { userId, email: args.email, subscription: { status: "free" } };
  },
});

export const checkSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get usage limits
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!usage) {
      throw new Error("Usage data not found");
    }

    // Check if subscription is active
    const isActive = user.subscription.status === "active" && 
                    user.subscription.currentPeriodEnd && 
                    user.subscription.currentPeriodEnd > Date.now();

    // Determine current tier based on subscription status
    const currentTier = isActive ? "pro" : "free";

    // Update tier limits based on current tier
    const limits = currentTier === "pro" ? {
      documentsLimit: -1, // Unlimited
      quizzesLimit: -1, // Unlimited
      summariesLimit: -1, // Unlimited
      flashcardsLimit: -1, // Unlimited
      teachMeSessionsLimit: -1, // Unlimited
    } : {
      documentsLimit: 3,
      quizzesLimit: 5,
      summariesLimit: 5,
      flashcardsLimit: 20,
      teachMeSessionsLimit: 3,
    };

    return {
      tier: currentTier,
      subscriptionStatus: user.subscription.status,
      subscriptionEndDate: user.subscription.currentPeriodEnd,
      usage: {
        documentsUploaded: usage.documentsUploaded,
        documentsLimit: limits.documentsLimit,
        quizzesGenerated: usage.quizzesGenerated,
        quizzesLimit: limits.quizzesLimit,
        summariesGenerated: usage.summariesGenerated,
        summariesLimit: limits.summariesLimit,
        flashcardsGenerated: usage.flashcardsGenerated,
        flashcardsLimit: limits.flashcardsLimit,
        teachMeSessionsUsed: usage.teachMeSessionsUsed,
        teachMeSessionsLimit: limits.teachMeSessionsLimit,
      },
      resetDate: usage.resetDate,
    };
  },
});

// Additional auth functions

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const hashedPassword = simpleHash(args.password, user.salt);
    if (hashedPassword !== user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    await ctx.db.patch(user._id, {
      lastLoginAt: Date.now(),
    });

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      subscription: user.subscription,
    };
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.optional(v.string()),
    status: v.union(v.literal("free"), v.literal("active"), v.literal("canceled")),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
      subscription: {
        ...user.subscription,
        stripeCustomerId: args.stripeCustomerId,
        stripeSubscriptionId: args.stripeSubscriptionId,
        stripePriceId: args.stripePriceId,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
      },
    });
  },
});