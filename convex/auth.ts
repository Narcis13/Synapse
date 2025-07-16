import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import crypto from "crypto";

// Helper function to hash passwords
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

// Helper function to generate salt
function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
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
    const hashedPassword = hashPassword(args.password, salt);

    // Create user with free tier
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash: hashedPassword,
      salt: salt,
      tier: "free",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: "inactive",
      subscriptionEndDate: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Initialize usage limits for free tier
    await ctx.db.insert("usage", {
      userId,
      documentsUploaded: 0,
      documentsLimit: 3, // Free tier limit
      quizzesGenerated: 0,
      quizzesLimit: 5, // Free tier limit
      summariesGenerated: 0,
      summariesLimit: 5, // Free tier limit
      flashcardsGenerated: 0,
      flashcardsLimit: 20, // Free tier limit
      teachMeSessionsUsed: 0,
      teachMeSessionsLimit: 3, // Free tier limit
      resetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // Reset in 30 days
    });

    return { userId, email: args.email, tier: "free" };
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
    const isActive = user.subscriptionStatus === "active" && 
                    user.subscriptionEndDate && 
                    user.subscriptionEndDate > Date.now();

    // Determine current tier based on subscription status
    const currentTier = isActive && user.tier === "pro" ? "pro" : "free";

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
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
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
    const hashedPassword = hashPassword(args.password, user.salt);
    if (hashedPassword !== user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    await ctx.db.patch(user._id, {
      lastLoginAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      tier: user.tier,
    };
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.string(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionStatus: args.status,
      subscriptionEndDate: args.endDate,
      tier: args.status === "active" ? "pro" : "free",
      updatedAt: Date.now(),
    });
  },
});