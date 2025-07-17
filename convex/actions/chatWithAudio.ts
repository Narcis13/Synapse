import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatWithDocument = action({
  args: {
    message: v.string(),
    documentId: v.id("documents"),
    sessionId: v.optional(v.id("chatSessions")),
    includeTimestamps: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get or create chat session
    let sessionId = args.sessionId;
    if (!sessionId) {
      sessionId = await ctx.runMutation(internal.chat.createSessionInternal, {
        documentId: args.documentId,
      });
    }

    // Store user message
    await ctx.runMutation(internal.chat.addMessage, {
      sessionId,
      role: "user",
      content: args.message,
    });

    // Generate embedding for the user's query
    const queryEmbedding = await generateEmbedding(args.message);

    // Perform vector search with audio-aware filtering
    const relevantChunks = await ctx.runQuery(internal.chat.searchRelevantChunks, {
      documentId: args.documentId,
      embedding: queryEmbedding,
      limit: 5, // Top 5 most relevant chunks
    });

    // Build context with timestamp information
    const context = buildContextFromChunks(relevantChunks, args.includeTimestamps);

    // Get conversation history for better context
    const conversationHistory = await ctx.runQuery(internal.chat.getRecentMessages, {
      sessionId,
      limit: 10,
    });

    // Generate response using OpenAI
    const systemPrompt = buildSystemPrompt(args.includeTimestamps);
    const userPrompt = buildUserPrompt(args.message, context, conversationHistory);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantResponse = completion.choices[0].message.content || "";

    // Extract audio references from the response
    const audioReferences = args.includeTimestamps 
      ? extractAudioReferences(assistantResponse, relevantChunks)
      : [];

    // Store assistant message
    const messageId = await ctx.runMutation(internal.chat.addMessage, {
      sessionId,
      role: "assistant",
      content: assistantResponse,
      metadata: {
        chunkIds: relevantChunks.map(c => c._id),
        audioReferences,
      },
    });

    return {
      messageId,
      content: assistantResponse,
      audioReferences,
      relevantChunks: relevantChunks.map(chunk => ({
        id: chunk._id,
        content: chunk.content.substring(0, 200) + "...",
        metadata: chunk.metadata,
        score: chunk._score,
      })),
    };
  },
});

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

function buildContextFromChunks(
  chunks: any[],
  includeTimestamps: boolean
): string {
  return chunks
    .map((chunk, index) => {
      let context = `[Chunk ${index + 1}]:\n${chunk.content}`;
      
      if (includeTimestamps && chunk.metadata?.startTime !== undefined) {
        const startTime = formatTimestamp(chunk.metadata.startTime);
        const endTime = chunk.metadata.endTime 
          ? formatTimestamp(chunk.metadata.endTime)
          : "end";
        context = `[Chunk ${index + 1} - Audio ${startTime} to ${endTime}]:\n${chunk.content}`;
      }
      
      return context;
    })
    .join("\n\n");
}

function buildSystemPrompt(includeTimestamps: boolean): string {
  let prompt = `You are a helpful AI assistant that answers questions about documents. 
You have access to relevant excerpts from the document to help answer questions accurately.
Always cite the specific chunks you're referencing in your answer.`;

  if (includeTimestamps) {
    prompt += `\n\nWhen the content comes from audio/video sources, include timestamp references in your responses.
Format timestamps as [MM:SS] or [HH:MM:SS] in your response when referring to specific audio segments.
This helps users navigate to the exact moment in the audio where the information is discussed.`;
  }

  prompt += `\n\nBe concise but thorough. If you're unsure about something, say so rather than making up information.`;

  return prompt;
}

function buildUserPrompt(
  message: string,
  context: string,
  conversationHistory: any[]
): string {
  let prompt = `Previous conversation:\n`;
  
  // Add recent conversation history
  conversationHistory.forEach(msg => {
    prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
  });
  
  prompt += `\nRelevant document excerpts:\n${context}\n\n`;
  prompt += `Current question: ${message}\n\n`;
  prompt += `Please answer the question based on the provided context and conversation history.`;
  
  return prompt;
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

interface AudioReference {
  timestamp: number;
  duration: number;
  text: string;
  chunkId: string;
}

function extractAudioReferences(
  response: string,
  chunks: any[]
): AudioReference[] {
  const references: AudioReference[] = [];
  
  // Look for timestamp patterns in the response
  const timestampPattern = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;
  const matches = response.matchAll(timestampPattern);
  
  for (const match of matches) {
    const timestampStr = match[1];
    const timestamp = parseTimestamp(timestampStr);
    
    // Find the chunk that contains this timestamp
    const matchingChunk = chunks.find(chunk => {
      if (!chunk.metadata?.startTime) return false;
      const start = chunk.metadata.startTime;
      const end = chunk.metadata.endTime || start + 300; // Default 5 min chunks
      return timestamp >= start && timestamp <= end;
    });
    
    if (matchingChunk) {
      // Extract surrounding text for context
      const startIndex = Math.max(0, match.index! - 50);
      const endIndex = Math.min(response.length, match.index! + 100);
      const text = response.substring(startIndex, endIndex).trim();
      
      references.push({
        timestamp,
        duration: matchingChunk.metadata.endTime 
          ? matchingChunk.metadata.endTime - matchingChunk.metadata.startTime
          : 30, // Default 30 seconds
        text,
        chunkId: matchingChunk._id,
      });
    }
  }
  
  return references;
}

function parseTimestamp(timestamp: string): number {
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

// Additional action for streaming responses (for future enhancement)
export const chatWithDocumentStream = action({
  args: {
    message: v.string(),
    documentId: v.id("documents"),
    sessionId: v.id("chatSessions"),
    includeTimestamps: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Similar to chatWithDocument but with streaming support
    // This would require WebSocket or Server-Sent Events integration
    // Placeholder for future implementation
    throw new Error("Streaming not yet implemented");
  },
});