import { v } from "convex/values"
import { mutation, query, internalMutation, internalQuery } from "./_generated/server"
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
      summary: undefined,
      flashcards: [],
      quiz: undefined,
      transcript: undefined,
      audioDuration: undefined,
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

// Get recent documents for the current user
export const getRecentDocuments = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user) {
      return []
    }

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(10)

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

// Get a teach me session by ID
export const getTeachMeSession = query({
  args: {
    sessionId: v.id("teachMeSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      throw new Error("Teach me session not found")
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

    if (!user || user._id !== session.userId) {
      throw new Error("Access denied")
    }

    return session
  },
})

// Get a document chunk by ID
export const getDocumentChunk = query({
  args: {
    chunkId: v.id("documentChunks"),
  },
  handler: async (ctx, args) => {
    const chunk = await ctx.db.get(args.chunkId)
    if (!chunk) {
      throw new Error("Document chunk not found")
    }

    // Verify user has access through the document
    const document = await ctx.db.get(chunk.documentId)
    if (!document) {
      throw new Error("Associated document not found")
    }

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

    return chunk
  },
})

// Add a conversation to a teach me session
export const addTeachMeConversation = mutation({
  args: {
    sessionId: v.id("teachMeSessions"),
    role: v.union(
      v.literal("user"),
      v.literal("ai_student"),
      v.literal("system")
    ),
    content: v.string(),
    feedback: v.optional(v.object({
      clarity: v.number(),
      accuracy: v.number(),
      completeness: v.number(),
      suggestions: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Verify session exists and user has access
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      throw new Error("Teach me session not found")
    }

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user || user._id !== session.userId) {
      throw new Error("Access denied")
    }

    // Add the conversation
    const conversationId = await ctx.db.insert("teachMeConversations", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      feedback: args.feedback,
      timestamp: Date.now(),
    })

    return { conversationId }
  },
})

// Update teach me session comprehension score and weak areas
export const updateTeachMeSession = mutation({
  args: {
    sessionId: v.id("teachMeSessions"),
    comprehensionScore: v.optional(v.number()),
    weakAreas: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned")
    )),
    currentTopic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify session exists and user has access
    const session = await ctx.db.get(args.sessionId)
    if (!session) {
      throw new Error("Teach me session not found")
    }

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first()

    if (!user || user._id !== session.userId) {
      throw new Error("Access denied")
    }

    // Build update object
    const updateData: any = {}
    
    if (args.comprehensionScore !== undefined) {
      updateData.comprehensionScore = args.comprehensionScore
    }
    
    if (args.weakAreas !== undefined) {
      updateData.weakAreas = args.weakAreas
    }
    
    if (args.status !== undefined) {
      updateData.status = args.status
      
      // Set completedAt if status is completed
      if (args.status === "completed") {
        updateData.completedAt = Date.now()
      }
    }
    
    if (args.currentTopic !== undefined) {
      updateData.currentTopic = args.currentTopic
    }

    // Update the session
    await ctx.db.patch(args.sessionId, updateData)

    return { success: true }
  },
})

// Internal mutations for document processing

export const getById = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId)
  },
})

export const updateStatus = internalMutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("pending"),
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
  },
})

export const updateProgress = internalMutation({
  args: {
    documentId: v.id("documents"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      processingProgress: args.progress,
    })
  },
})

export const storeChunk = internalMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    embedding: v.array(v.float64()),
    chunkIndex: v.number(),
    metadata: v.object({
      startTime: v.optional(v.number()),
      endTime: v.optional(v.number()),
      pageNumber: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("documentChunks", {
      documentId: args.documentId,
      content: args.content,
      embedding: args.embedding,
      chunkIndex: args.chunkIndex,
      metadata: args.metadata,
    })
  },
})

export const storeContent = internalMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      content: args.content,
      processed: true,
      metadata: args.metadata,
    })
  },
})

export const getChunksByDocument = internalQuery({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documentChunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("asc")
      .collect()
  },
})