import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"

export const store = internalMutation({
  args: {
    documentId: v.id("documents"),
    type: v.union(
      v.literal("summary"),
      v.literal("quiz"),
      v.literal("flashcards"),
      v.literal("podcast"),
      v.literal("teach_me_script")
    ),
    content: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("generatedContent", {
      documentId: args.documentId,
      type: args.type,
      content: args.content,
      createdAt: Date.now(),
      ...(args.metadata && { metadata: args.metadata }),
    })
  },
})

export const getByDocumentAndType = query({
  args: {
    documentId: v.id("documents"),
    type: v.union(
      v.literal("summary"),
      v.literal("quiz"),
      v.literal("flashcards"),
      v.literal("podcast"),
      v.literal("teach_me_script")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    return await ctx.db
      .query("generatedContent")
      .withIndex("by_document_and_type", (q) => 
        q.eq("documentId", args.documentId).eq("type", args.type)
      )
      .order("desc")
      .first()
  },
})