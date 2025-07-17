import { v } from "convex/values"
import { internalMutation, query, mutation } from "./_generated/server"

export const create = internalMutation({
  args: {
    userId: v.id("users"),
    documentId: v.id("documents"),
    currentTopic: v.string(),
    personality: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("teachMeSessions", {
      userId: args.userId,
      documentId: args.documentId,
      status: "active",
      currentTopic: args.currentTopic,
      weakAreas: [],
      createdAt: Date.now(),
      metadata: {
        personality: args.personality,
      },
    })
  },
})

export const updateSession = mutation({
  args: {
    sessionId: v.id("teachMeSessions"),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    )),
    currentTopic: v.optional(v.string()),
    comprehensionScore: v.optional(v.number()),
    weakAreas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const updates: any = {}
    if (args.status !== undefined) updates.status = args.status
    if (args.currentTopic !== undefined) updates.currentTopic = args.currentTopic
    if (args.comprehensionScore !== undefined) updates.comprehensionScore = args.comprehensionScore
    if (args.weakAreas !== undefined) updates.weakAreas = args.weakAreas
    
    if (args.status === "completed") {
      updates.completedAt = Date.now()
    }

    await ctx.db.patch(args.sessionId, updates)
    return { success: true }
  },
})

export const getActiveSession = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    return await ctx.db
      .query("teachMeSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("documentId"), args.documentId),
          q.eq(q.field("status"), "active")
        )
      )
      .order("desc")
      .first()
  },
})

export const getUserSessions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    const query = ctx.db
      .query("teachMeSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")

    if (args.limit) {
      return await query.take(args.limit)
    }

    return await query.collect()
  },
})