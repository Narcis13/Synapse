// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("student"), v.literal("instructor")),
    passwordHash: v.string(),
    subscription: v.object({
      status: v.union(
        v.literal("free"),
        v.literal("pro"),
        v.literal("canceled")
      ),
      stripeCustomerId: v.optional(v.string()),
      stripePriceId: v.optional(v.string()),
      stripeSubscriptionId: v.optional(v.string()),
      currentPeriodEnd: v.optional(v.number()),
    }),
    usage: v.object({
      documentsProcessed: v.number(),
      audioMinutesProcessed: v.number(),
      aiTokensUsed: v.number(),
      lastResetDate: v.number(),
    }),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_stripe_customer_id", ["subscription.stripeCustomerId"]),

  documents: defineTable({
    title: v.string(),
    fileType: v.union(
      v.literal("pdf"), 
      v.literal("txt"), 
      v.literal("md"),
      v.literal("audio")
    ),
    storageId: v.id("_storage"),
    transcriptId: v.optional(v.id("_storage")), // For audio files
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    metadata: v.object({
      size: v.number(),
      duration: v.optional(v.number()), // For audio
      pageCount: v.optional(v.number()), // For PDFs
      language: v.optional(v.string()),
    }),
    uploadedBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_user", ["uploadedBy"]),

  documentChunks: defineTable({
    documentId: v.id("documents"),
    content: v.string(),
    embedding: v.array(v.float64()),
    chunkIndex: v.number(),
    metadata: v.object({
      startTime: v.optional(v.number()), // For audio chunks
      endTime: v.optional(v.number()),
      pageNumber: v.optional(v.number()), // For PDF chunks
    }),
  })
    .index("by_document", ["documentId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["documentId"],
    }),

  generatedContent: defineTable({
    documentId: v.id("documents"),
    type: v.union(
      v.literal("summary"),
      v.literal("quiz"),
      v.literal("flashcards"),
      v.literal("podcast"), // AI-generated audio
      v.literal("teach_me_script")
    ),
    content: v.string(),
    audioUrl: v.optional(v.string()), // For generated podcasts
    createdAt: v.number(),
  }).index("by_document_and_type", ["documentId", "type"]),

  teachMeSessions: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    ),
    currentTopic: v.string(),
    comprehensionScore: v.optional(v.number()),
    weakAreas: v.array(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_document", ["documentId"]),

  teachMeConversations: defineTable({
    sessionId: v.id("teachMeSessions"),
    role: v.union(
      v.literal("user"),
      v.literal("ai_student"),
      v.literal("system")
    ),
    content: v.string(),
    feedback: v.optional(v.object({
      clarity: v.number(), // 1-5
      accuracy: v.number(), // 1-5
      completeness: v.number(), // 1-5
      suggestions: v.array(v.string()),
    })),
    timestamp: v.number(),
  }).index("by_session", ["sessionId"]),

  chatSessions: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_session", ["sessionId"]),
});