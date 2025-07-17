import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Public mutations and queries for chat functionality

export const createSession = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Verify user has access to the document
    const document = await ctx.db.get(args.documentId);
    if (!document || document.userId !== user._id) {
      throw new Error("Document not found or access denied");
    }

    return await ctx.db.insert("chatSessions", {
      userId: user._id,
      documentId: args.documentId,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    });
  },
});

export const getSession = query({
  args: {
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return null;
    }

    // Verify session belongs to user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    
    if (!user || session.userId !== user._id) {
      return null;
    }

    return session;
  },
});

export const getSessionMessages = query({
  args: {
    sessionId: v.id("chatSessions"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    // Verify session belongs to user
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    
    if (!user || session.userId !== user._id) {
      return [];
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(args.limit || 50);

    return messages.reverse();
  },
});

export const getDocumentSessions = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .unique();
    
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("chatSessions")
      .withIndex("by_user_document", (q) =>
        q.eq("userId", user._id).eq("documentId", args.documentId)
      )
      .order("desc")
      .collect();
  },
});

// Internal mutations and queries (called from actions)

export const createSessionInternal = internalMutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    // Get document to find userId
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    return await ctx.db.insert("chatSessions", {
      userId: document.userId,
      documentId: args.documentId,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    });
  },
});

export const addMessage = internalMutation({
  args: {
    sessionId: v.id("chatSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Update session last message time
    await ctx.db.patch(args.sessionId, {
      lastMessageAt: Date.now(),
    });

    return await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
  },
});

export const getRecentMessages = internalQuery({
  args: {
    sessionId: v.id("chatSessions"),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(args.limit);

    return messages.reverse();
  },
});

export const searchRelevantChunks = internalQuery({
  args: {
    documentId: v.id("documents"),
    embedding: v.array(v.float64()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("documentChunks")
      .withSearchIndex("by_embedding", (q) =>
        q.search("embedding", args.embedding).filter((q) =>
          q.eq("documentId", args.documentId)
        )
      )
      .take(args.limit);

    return results;
  },
});

// Helper function to clean up old sessions
export const cleanupInactiveSessions = internalMutation({
  args: {
    daysInactive: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - args.daysInactive * 24 * 60 * 60 * 1000;
    
    const inactiveSessions = await ctx.db
      .query("chatSessions")
      .filter((q) => q.lt(q.field("lastMessageAt"), cutoffTime))
      .collect();

    for (const session of inactiveSessions) {
      // Delete all messages for this session
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      
      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
      
      // Delete the session
      await ctx.db.delete(session._id);
    }

    return inactiveSessions.length;
  },
});