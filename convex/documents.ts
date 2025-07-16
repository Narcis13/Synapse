import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { Id } from "./_generated/dataModel"

// Allowed file types and their max sizes (in MB)
const FILE_TYPE_LIMITS = {
  "application/pdf": { maxSize: 10, category: "document" },
  "text/plain": { maxSize: 5, category: "document" },
  "text/markdown": { maxSize: 5, category: "document" },
  "audio/mpeg": { maxSize: 50, category: "audio" },
  "audio/wav": { maxSize: 100, category: "audio" },
  "audio/x-m4a": { maxSize: 50, category: "audio" },
  "audio/mp4": { maxSize: 50, category: "audio" },
  "audio/webm": { maxSize: 50, category: "audio" },
} as const

// Get tier-based limits
const getTierLimits = (tier: string) => {
  if (tier === "pro") {
    return {
      maxFileSize: 100, // MB
      maxDocuments: Infinity,
      maxAudioMinutes: Infinity,
    }
  }
  
  // Free tier
  return {
    maxFileSize: 10, // MB
    maxDocuments: 5,
    maxAudioMinutes: 10,
  }
}

export const generateUploadUrl = mutation({
  args: {
    fileType: v.string(),
    userTier: v.string(),
    fileName: v.string(),
    fileSize: v.number(), // in bytes
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Validate file type
    const fileTypeConfig = FILE_TYPE_LIMITS[args.fileType as keyof typeof FILE_TYPE_LIMITS]
    if (!fileTypeConfig) {
      throw new Error(`Unsupported file type: ${args.fileType}`)
    }

    // Get tier limits
    const tierLimits = getTierLimits(args.userTier)
    const maxFileSizeBytes = Math.min(
      fileTypeConfig.maxSize * 1024 * 1024,
      tierLimits.maxFileSize * 1024 * 1024
    )

    // Check file size
    if (args.fileSize > maxFileSizeBytes) {
      const maxSizeMB = maxFileSizeBytes / (1024 * 1024)
      throw new Error(`File size exceeds ${maxSizeMB}MB limit for ${args.userTier} tier`)
    }

    // Get user to check usage limits
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Check usage limits based on file category
    if (fileTypeConfig.category === "document") {
      if (user.usage.documentsProcessed >= tierLimits.maxDocuments) {
        throw new Error(`Document limit reached. ${args.userTier === "free" ? "Upgrade to Pro for unlimited documents." : ""}`)
      }
    } else if (fileTypeConfig.category === "audio") {
      // For audio files, we'll need to check minutes after processing
      // For now, just check if they've hit the limit already
      if (user.usage.audioMinutesProcessed >= tierLimits.maxAudioMinutes) {
        throw new Error(`Audio processing limit reached. ${args.userTier === "free" ? "Upgrade to Pro for unlimited audio processing." : ""}`)
      }
    }

    // Generate presigned upload URL from Convex storage
    const uploadUrl = await ctx.storage.generateUploadUrl()

    // Create a pending document entry
    const documentId = await ctx.db.insert("documents", {
      userId: user._id,
      title: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      storageId: "", // Will be updated after upload
      status: "uploading",
      uploadedAt: Date.now(),
      processed: false,
      content: "",
      summary: null,
      flashcards: [],
      quiz: null,
      transcript: null,
      audioDuration: null,
    })

    return {
      uploadUrl,
      documentId,
      maxSizeBytes: maxFileSizeBytes,
    }
  },
})

// Confirm successful upload and update document
export const confirmUpload = mutation({
  args: {
    documentId: v.id("documents"),
    storageId: v.string(),
    audioDuration: v.optional(v.number()), // in seconds for audio files
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document) {
      throw new Error("Document not found")
    }

    // Update document with storage ID
    await ctx.db.patch(args.documentId, {
      storageId: args.storageId,
      status: "uploaded",
      audioDuration: args.audioDuration,
    })

    // If it's an audio file and we have duration, update usage
    if (args.audioDuration && document.fileType.startsWith("audio/")) {
      const audioMinutes = Math.ceil(args.audioDuration / 60)
      
      // Get the user to update usage
      const user = await ctx.db.get(document.userId)
      if (user) {
        // Increment user's audio usage
        await ctx.db.patch(document.userId, {
          usage: {
            documentsProcessed: user.usage.documentsProcessed,
            audioMinutesProcessed: user.usage.audioMinutesProcessed + audioMinutes,
            aiTokensUsed: user.usage.aiTokensUsed,
            lastResetDate: user.usage.lastResetDate,
          },
        })
      }
    }

    return { success: true }
  },
})

// Get user's documents
export const getUserDocuments = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 50)

    return documents
  },
})

// Get a single document
export const getDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document) {
      throw new Error("Document not found")
    }

    // Verify user has access
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user || user._id !== document.userId) {
      throw new Error("Access denied")
    }

    return document
  },
})

// Delete a document
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document) {
      throw new Error("Document not found")
    }

    // Verify user has access
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user || user._id !== document.userId) {
      throw new Error("Access denied")
    }

    // Delete from storage if exists
    if (document.storageId) {
      await ctx.storage.delete(document.storageId)
    }

    // Delete document record
    await ctx.db.delete(args.documentId)

    return { success: true }
  },
})

// Update document processing status
export const updateDocumentStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("uploading"),
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      status: args.status,
      ...(args.error && { error: args.error }),
    })

    return { success: true }
  },
})