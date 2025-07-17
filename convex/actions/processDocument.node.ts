"use node"

import { v } from "convex/values"
import { action } from "../_generated/server"
import { internal } from "../_generated/api"
import { openai } from "@ai-sdk/openai"
import { embedMany } from "ai"
import pdf from 'pdf-parse'
import { createClient } from '@deepgram/sdk'

interface ContentChunk {
  content: string
  index: number
  metadata: {
    startOffset: number
    endOffset: number
    startTime?: number
    endTime?: number
    pageNumber?: number
  }
}

// Text extraction functions
async function extractTextFromPDF(buffer: Buffer) {
  const data = await pdf(buffer)
  const cleanedText = data.text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim()
  
  return {
    content: cleanedText,
    metadata: {
      pageCount: data.numpages
    }
  }
}

async function extractTextFromAudio(audioUrl: string, duration: number) {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY
  if (!deepgramApiKey) {
    throw new Error('DEEPGRAM_API_KEY is not configured')
  }

  const deepgram = createClient(deepgramApiKey)
  const { result } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: audioUrl },
    {
      model: 'nova-2',
      smart_format: true,
      punctuate: true,
      paragraphs: true,
      utterances: true,
      diarize: true,
      language: 'en',
    }
  )

  if (!result?.results?.channels?.[0]?.alternatives?.[0]) {
    throw new Error('No transcription results found')
  }

  const channel = result.results.channels[0]
  const alternative = channel.alternatives[0]
  
  const segments = alternative.words?.map(word => ({
    text: word.word || '',
    start: word.start || 0,
    end: word.end || 0
  })) || []

  return {
    content: alternative.transcript || '',
    metadata: {
      duration,
      timestamps: segments
    }
  }
}

function extractTextFromMarkdown(content: string) {
  const cleanedContent = content
    .replace(/```[\s\S]*?```/g, (match) => {
      const codeContent = match.replace(/```\w*\n?/, '').replace(/```$/, '')
      return `\n[Code Block]\n${codeContent}\n`
    })
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[Image: $1]')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^[-*+]\s/gm, '• ')
    .replace(/^\d+\.\s/gm, '• ')
    .trim()
  
  return {
    content: cleanedContent,
    metadata: {}
  }
}

function extractTextFromTxt(content: string) {
  const cleanedContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim()
  
  return {
    content: cleanedContent,
    metadata: {}
  }
}

// Chunking function
function chunkContent(
  text: string,
  metadata?: {
    timestamps?: Array<{ text: string; start: number; end: number }>
  }
): ContentChunk[] {
  const maxChunkSize = 1500
  const minChunkSize = 100
  const overlap = 200
  const chunks: ContentChunk[] = []
  
  if (!text || text.trim().length === 0) {
    return chunks
  }

  let currentIndex = 0
  let chunkIndex = 0

  while (currentIndex < text.length) {
    let chunkEnd = Math.min(currentIndex + maxChunkSize, text.length)
    
    // Find sentence boundary
    if (chunkEnd < text.length) {
      const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n']
      let foundBoundary = false
      
      for (let i = chunkEnd; i >= currentIndex + minChunkSize; i--) {
        for (const ender of sentenceEnders) {
          if (text.slice(i, i + ender.length) === ender) {
            chunkEnd = i + ender.length
            foundBoundary = true
            break
          }
        }
        if (foundBoundary) break
      }
    }

    const chunkContent = text.slice(currentIndex, chunkEnd).trim()
    
    if (chunkContent.length >= minChunkSize) {
      // Map timestamps if available
      let startTime: number | undefined
      let endTime: number | undefined
      
      if (metadata?.timestamps) {
        let currentOffset = 0
        for (const segment of metadata.timestamps) {
          const segmentLength = segment.text.length
          const segmentEnd = currentOffset + segmentLength

          if (currentOffset <= currentIndex && segmentEnd > currentIndex) {
            startTime = segment.start
          }

          if (currentOffset < chunkEnd && segmentEnd >= chunkEnd) {
            endTime = segment.end
            break
          }

          if (segmentEnd <= chunkEnd) {
            endTime = segment.end
          }

          currentOffset = segmentEnd + 1
        }
      }

      chunks.push({
        content: chunkContent,
        index: chunkIndex++,
        metadata: {
          startOffset: currentIndex,
          endOffset: chunkEnd,
          ...(startTime !== undefined && { startTime }),
          ...(endTime !== undefined && { endTime })
        }
      })
    }

    currentIndex = Math.max(currentIndex + 1, chunkEnd - overlap)
  }

  return chunks
}

export const processDocument = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    try {
      // Get document details
      const document = await ctx.runQuery(internal.documents.getById, {
        documentId: args.documentId
      })
      
      if (!document) {
        throw new Error("Document not found")
      }

      // Update status to processing
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId: args.documentId,
        status: "processing"
      })

      // Get file from storage
      const fileUrl = await ctx.storage.getUrl(document.storageId)
      if (!fileUrl) {
        throw new Error("File not found in storage")
      }

      let extractedText
      let fileType: 'pdf' | 'audio' | 'md' | 'txt'

      // Determine file type from MIME type
      if (document.fileType === 'application/pdf') {
        fileType = 'pdf'
        const pdfResponse = await fetch(fileUrl)
        const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
        extractedText = await extractTextFromPDF(pdfBuffer)
      } else if (document.fileType.startsWith('audio/')) {
        fileType = 'audio'
        extractedText = await extractTextFromAudio(fileUrl, document.audioDuration || 0)
      } else if (document.fileType === 'text/markdown') {
        fileType = 'md'
        const textResponse = await fetch(fileUrl)
        const content = await textResponse.text()
        extractedText = extractTextFromMarkdown(content)
      } else if (document.fileType === 'text/plain') {
        fileType = 'txt'
        const textResponse = await fetch(fileUrl)
        const content = await textResponse.text()
        extractedText = extractTextFromTxt(content)
      } else {
        throw new Error(`Unsupported file type: ${document.fileType}`)
      }

      // Update progress
      await ctx.runMutation(internal.documents.updateProgress, {
        documentId: args.documentId,
        progress: 25
      })

      // Chunk the content
      const chunks = chunkContent(
        extractedText.content,
        {
          timestamps: (extractedText.metadata as any).timestamps
        }
      )

      // Update progress
      await ctx.runMutation(internal.documents.updateProgress, {
        documentId: args.documentId,
        progress: 50
      })

      // Generate embeddings for all chunks at once
      const { embeddings } = await embedMany({
        model: openai.embedding('text-embedding-3-small'),
        values: chunks.map(chunk => chunk.content)
      })

      // Store chunks with embeddings
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const embedding = embeddings[i]

        await ctx.runMutation(internal.documents.storeChunk, {
          documentId: args.documentId,
          content: chunk.content,
          embedding: Array.from(embedding),
          chunkIndex: chunk.index,
          metadata: {
            startTime: chunk.metadata.startTime,
            endTime: chunk.metadata.endTime,
            pageNumber: chunk.metadata.pageNumber
          }
        })

        // Update progress
        const progress = 50 + Math.floor(((i + 1) / chunks.length) * 40)
        await ctx.runMutation(internal.documents.updateProgress, {
          documentId: args.documentId,
          progress
        })
      }

      // Store the full content
      await ctx.runMutation(internal.documents.storeContent, {
        documentId: args.documentId,
        content: extractedText.content,
        metadata: extractedText.metadata
      })

      // Update document status to completed
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId: args.documentId,
        status: "completed"
      })

      // Update progress to 100%
      await ctx.runMutation(internal.documents.updateProgress, {
        documentId: args.documentId,
        progress: 100
      })

      return {
        success: true,
        chunksCreated: chunks.length,
        metadata: extractedText.metadata
      }

    } catch (error) {
      console.error("Document processing error:", error)
      
      // Update document status to failed
      await ctx.runMutation(internal.documents.updateStatus, {
        documentId: args.documentId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error"
      })

      throw error
    }
  }
})