"use node"

import { v } from "convex/values"
import { action } from "../_generated/server"
import { api, internal } from "../_generated/api"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

interface PodcastScript {
  style: "conversational" | "lecture"
  segments: PodcastSegment[]
  metadata: {
    totalDuration: number
    voiceCount: number
    generatedAt: number
  }
}

interface PodcastSegment {
  speaker: string
  voiceId: string
  text: string
  tone: string
  pauseAfter?: number
}

// ElevenLabs voice configurations
const VOICE_PROFILES = {
  conversational: {
    host: {
      name: "Alex",
      voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
      description: "Friendly and engaging podcast host"
    },
    expert: {
      name: "Dr. Sarah",
      voiceId: "AZnzlk1XvdvUeBnXmlld", // Domi voice
      description: "Knowledgeable expert guest"
    }
  },
  lecture: {
    professor: {
      name: "Professor James",
      voiceId: "VR6AewLTigWG4xSOukaG", // Arnold voice
      description: "Clear and authoritative lecturer"
    }
  }
}

async function synthesizeAudio(text: string, voiceId: string): Promise<Buffer> {
  const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY
  if (!elevenLabsApiKey) {
    throw new Error('ELEVEN_LABS_API_KEY is not configured')
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  return Buffer.from(audioBuffer)
}

async function concatenateAudioBuffers(buffers: Buffer[]): Promise<Buffer> {
  // In a production environment, you'd use ffmpeg or similar to properly concatenate audio
  // For now, we'll return the first buffer as a placeholder
  // TODO: Implement proper audio concatenation with ffmpeg
  return Buffer.concat(buffers)
}

export const generatePodcast = action({
  args: { 
    documentId: v.id("documents"),
    style: v.union(v.literal("conversational"), v.literal("lecture"))
  },
  handler: async (ctx, args) => {
    try {
      // Get document and its chunks
      const document = await ctx.runQuery(internal.documents.getById, {
        documentId: args.documentId
      })
      
      if (!document) {
        throw new Error("Document not found")
      }

      // Get all document chunks
      const chunks = await ctx.runQuery(internal.documents.getChunksByDocument, {
        documentId: args.documentId
      })

      if (!chunks || chunks.length === 0) {
        throw new Error("No content chunks found for document")
      }

      // Combine chunks for script generation (limit for initial podcast)
      const contentForPodcast = chunks
        .slice(0, 8) // Use first 8 chunks for reasonable podcast length
        .map((chunk: any) => chunk.content)
        .join("\n\n")

      // Get existing summary if available
      const existingSummary = await ctx.runQuery(api.generatedContent.getByDocumentAndType, {
        documentId: args.documentId,
        type: "summary"
      })

      const summaryContent = existingSummary ? JSON.parse(existingSummary.content).summary : ""

      // Generate podcast script based on style
      const scriptGeneration = await generatePodcastScript(
        document.title,
        contentForPodcast,
        summaryContent,
        args.style
      )

      // Parse the generated script
      let podcastScript: PodcastScript
      try {
        podcastScript = JSON.parse(scriptGeneration.text)
      } catch (e) {
        console.error("Failed to parse podcast script:", e)
        // Fallback script
        podcastScript = createFallbackScript(document.title, args.style)
      }

      // Generate audio for each segment
      const audioBuffers: Buffer[] = []
      let totalDuration = 0

      for (const segment of podcastScript.segments) {
        try {
          // Generate audio for this segment
          const audioBuffer = await synthesizeAudio(segment.text, segment.voiceId)
          audioBuffers.push(audioBuffer)
          
          // Estimate duration (rough approximation: 150 words per minute)
          const wordCount = segment.text.split(' ').length
          const segmentDuration = (wordCount / 150) * 60 // in seconds
          totalDuration += segmentDuration

          // Add pause if specified
          if (segment.pauseAfter) {
            // In production, add actual silence here
            totalDuration += segment.pauseAfter
          }
        } catch (error) {
          console.error(`Failed to synthesize segment for ${segment.speaker}:`, error)
          // Continue with other segments
        }
      }

      if (audioBuffers.length === 0) {
        throw new Error("Failed to generate any audio segments")
      }

      // Concatenate all audio segments
      const finalAudioBuffer = await concatenateAudioBuffers(audioBuffers)

      // Store the audio file in Convex storage
      const audioBlob = new Blob([finalAudioBuffer], { type: 'audio/mpeg' })
      const storageId = await ctx.storage.store(audioBlob)
      const audioUrl = await ctx.storage.getUrl(storageId)

      // Update the script metadata
      podcastScript.metadata.totalDuration = totalDuration
      podcastScript.metadata.generatedAt = Date.now()

      // Store the generated podcast information
      await ctx.runMutation(internal.generatedContent.store, {
        documentId: args.documentId,
        type: "podcast",
        content: JSON.stringify(podcastScript),
        metadata: {
          style: args.style,
          duration: totalDuration,
          storageId: storageId,
          audioUrl: audioUrl
        }
      })

      return {
        success: true,
        podcast: {
          script: podcastScript,
          audioUrl: audioUrl,
          duration: totalDuration,
          style: args.style
        }
      }

    } catch (error) {
      console.error("Podcast generation error:", error)
      throw error
    }
  }
})

async function generatePodcastScript(
  title: string,
  content: string,
  summary: string,
  style: "conversational" | "lecture"
): Promise<{ text: string }> {
  
  const systemPrompt = style === "conversational" 
    ? `You are creating a conversational podcast script between a host (Alex) and an expert guest (Dr. Sarah) discussing the topic. 
       
       Create an engaging dialogue that:
       1. Starts with a warm introduction
       2. Breaks down complex concepts through conversation
       3. Includes natural back-and-forth questions and answers
       4. Uses analogies and real-world examples
       5. Has moments of clarification and deeper dives
       6. Ends with key takeaways
       
       Voice profiles:
       - Alex (Host): voiceId "21m00Tcm4TlvDq8ikWAM", friendly and curious tone
       - Dr. Sarah (Expert): voiceId "AZnzlk1XvdvUeBnXmlld", knowledgeable and patient tone`
    : `You are creating a lecture-style podcast script for Professor James discussing the topic.
       
       Create an educational monologue that:
       1. Starts with a clear introduction of the topic
       2. Presents information in a logical, structured way
       3. Uses clear explanations and definitions
       4. Includes examples and case studies
       5. Summarizes key points periodically
       6. Ends with a comprehensive summary
       
       Voice profile:
       - Professor James: voiceId "VR6AewLTigWG4xSOukaG", clear and authoritative tone`

  const outputFormat = style === "conversational"
    ? `{
        "style": "conversational",
        "segments": [
          {
            "speaker": "Alex",
            "voiceId": "21m00Tcm4TlvDq8ikWAM",
            "text": "Welcome to our podcast! Today we're diving into...",
            "tone": "welcoming",
            "pauseAfter": 0.5
          },
          {
            "speaker": "Dr. Sarah",
            "voiceId": "AZnzlk1XvdvUeBnXmlld", 
            "text": "Thanks for having me, Alex! This is such an important topic...",
            "tone": "enthusiastic",
            "pauseAfter": 0.3
          }
        ],
        "metadata": {
          "voiceCount": 2
        }
      }`
    : `{
        "style": "lecture",
        "segments": [
          {
            "speaker": "Professor James",
            "voiceId": "VR6AewLTigWG4xSOukaG",
            "text": "Welcome to today's lecture on...",
            "tone": "professional",
            "pauseAfter": 0.5
          }
        ],
        "metadata": {
          "voiceCount": 1
        }
      }`

  return await generateText({
    model: openai('gpt-4'),
    messages: [{
      role: 'system',
      content: `${systemPrompt}
      
Generate a podcast script based on the provided content. The podcast should be approximately 5-8 minutes long when spoken.

Output format (JSON):
${outputFormat}

Important:
- Keep each segment under 150 words for natural speech
- Include appropriate pauses between segments (in seconds)
- Make the content engaging and easy to understand
- Use natural, conversational language`
    }, {
      role: 'user',
      content: `Title: ${title}

${summary ? `Summary: ${summary}\n\n` : ''}

Content to cover:
${content}`
    }]
  })
}

function createFallbackScript(title: string, style: "conversational" | "lecture"): PodcastScript {
  if (style === "conversational") {
    return {
      style: "conversational",
      segments: [
        {
          speaker: "Alex",
          voiceId: "21m00Tcm4TlvDq8ikWAM",
          text: `Welcome to our podcast! Today we're exploring "${title}". I'm joined by Dr. Sarah to break down this fascinating topic.`,
          tone: "welcoming",
          pauseAfter: 0.5
        },
        {
          speaker: "Dr. Sarah",
          voiceId: "AZnzlk1XvdvUeBnXmlld",
          text: "Thanks Alex! This is a topic I'm really passionate about. Let me start by explaining the key concepts.",
          tone: "enthusiastic",
          pauseAfter: 0.3
        }
      ],
      metadata: {
        totalDuration: 60,
        voiceCount: 2,
        generatedAt: Date.now()
      }
    }
  } else {
    return {
      style: "lecture",
      segments: [
        {
          speaker: "Professor James",
          voiceId: "VR6AewLTigWG4xSOukaG",
          text: `Welcome to today's lecture on "${title}". In this session, we'll explore the fundamental concepts and their practical applications.`,
          tone: "professional",
          pauseAfter: 0.5
        }
      ],
      metadata: {
        totalDuration: 30,
        voiceCount: 1,
        generatedAt: Date.now()
      }
    }
  }
}