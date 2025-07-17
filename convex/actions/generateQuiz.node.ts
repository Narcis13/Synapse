"use node"

import { v } from "convex/values"
import { action } from "../_generated/server"
import { internal } from "../_generated/api"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  timestamp?: {
    start: number
    end: number
    displayTime: string
  }
  type: "multiple_choice" | "true_false" | "timestamp_based"
}

const DIFFICULTY_LEVELS = {
  easy: {
    description: "Basic recall and understanding",
    questionCount: 5,
    concepts: "fundamental"
  },
  medium: {
    description: "Application and analysis", 
    questionCount: 8,
    concepts: "intermediate"
  },
  hard: {
    description: "Synthesis and evaluation",
    questionCount: 10,
    concepts: "advanced"
  }
}

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export const generateQuiz = action({
  args: { 
    documentId: v.id("documents"),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    includeTimestamps: v.optional(v.boolean())
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

      const difficulty = args.difficulty || "medium"
      const difficultyConfig = DIFFICULTY_LEVELS[difficulty]
      
      // Check if this is an audio document
      const isAudioDocument = document.fileType === "audio"
      const includeTimestamps = isAudioDocument && (args.includeTimestamps !== false)

      // Prepare chunks with timestamp information for audio
      const chunksWithTimestamps = chunks.map(chunk => ({
        content: chunk.content,
        startTime: chunk.metadata?.startTime,
        endTime: chunk.metadata?.endTime,
        hasTimestamp: !!(chunk.metadata?.startTime && chunk.metadata?.endTime)
      }))

      // Select relevant chunks based on difficulty
      const selectedChunks = difficulty === "hard" 
        ? chunksWithTimestamps // Use all chunks for hard difficulty
        : chunksWithTimestamps.slice(0, Math.ceil(chunksWithTimestamps.length * 0.7))

      // Combine content for analysis
      const contentForAnalysis = selectedChunks
        .map((chunk, index) => {
          if (includeTimestamps && chunk.hasTimestamp) {
            const timeLabel = `[${formatTimestamp(chunk.startTime!)} - ${formatTimestamp(chunk.endTime!)}]`
            return `${timeLabel}\n${chunk.content}`
          }
          return chunk.content
        })
        .join("\n\n")

      // Generate quiz questions based on content
      const quizGeneration = await generateText({
        model: openai('gpt-4'),
        messages: [{
          role: 'system',
          content: `You are an expert quiz creator. Generate ${difficultyConfig.questionCount} ${difficulty} difficulty questions based on the provided content.

${includeTimestamps ? `This is audio content with timestamps. Include ${Math.floor(difficultyConfig.questionCount / 3)} timestamp-based questions that reference specific times in the audio (e.g., "What did the speaker mention at 2:15?").` : ''}

Requirements:
1. Questions should test ${difficultyConfig.description}
2. Include a mix of question types
3. Each question must have 4 options (A, B, C, D)
4. Provide clear explanations for correct answers
5. ${includeTimestamps ? 'For timestamp questions, reference specific times from the provided timestamps' : ''}
6. Ensure questions are context-aware and meaningful

Output format (JSON):
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct",
      "type": "multiple_choice",
      ${includeTimestamps ? '"timestamp": { "start": 135, "end": 150, "displayTime": "2:15" },' : ''}
      "difficulty": "${difficulty}"
    }
  ]
}`
        }, {
          role: 'user',
          content: `Document Title: ${document.title}
          
Content:
${contentForAnalysis}`
        }]
      })

      let parsedQuiz
      try {
        parsedQuiz = JSON.parse(quizGeneration.text)
      } catch (e) {
        console.error("Failed to parse quiz JSON:", e)
        // Generate fallback questions
        parsedQuiz = {
          questions: [{
            question: `What is the main topic discussed in "${document.title}"?`,
            options: [
              "A) The introduction to the subject",
              "B) Advanced concepts and applications", 
              "C) Historical background",
              "D) Future developments"
            ],
            correctAnswer: 0,
            explanation: "Based on the document content, the main focus is on introducing the subject.",
            type: "multiple_choice",
            difficulty: difficulty
          }]
        }
      }

      // Add unique IDs to questions
      const questions: QuizQuestion[] = parsedQuiz.questions.map((q: any, index: number) => ({
        id: `q_${Date.now()}_${index}`,
        ...q
      }))

      // Generate adaptive difficulty questions if requested
      if (difficulty === "medium" || difficulty === "hard") {
        const adaptiveQuestions = await generateAdaptiveQuestions(
          contentForAnalysis,
          questions,
          difficulty,
          includeTimestamps
        )
        questions.push(...adaptiveQuestions)
      }

      // Store the generated quiz
      const quizContent = {
        documentId: args.documentId,
        questions: questions.slice(0, difficultyConfig.questionCount), // Ensure we don't exceed the count
        difficulty,
        metadata: {
          generatedAt: Date.now(),
          totalQuestions: questions.length,
          isAudioQuiz: isAudioDocument,
          hasTimestampQuestions: includeTimestamps
        }
      }

      await ctx.runMutation(internal.generatedContent.store, {
        documentId: args.documentId,
        type: "quiz",
        content: JSON.stringify(quizContent),
        metadata: {
          difficulty,
          questionCount: questions.length,
          hasTimestamps: includeTimestamps
        }
      })

      return {
        success: true,
        quiz: quizContent,
        questionCount: questions.length,
        difficulty
      }

    } catch (error) {
      console.error("Quiz generation error:", error)
      throw error
    }
  }
})

// Helper function to generate adaptive questions based on difficulty
async function generateAdaptiveQuestions(
  content: string,
  existingQuestions: QuizQuestion[],
  difficulty: "medium" | "hard",
  includeTimestamps: boolean
): Promise<QuizQuestion[]> {
  
  const adaptivePrompt = difficulty === "hard" 
    ? `Generate 3 challenging questions that require:
       - Synthesis of multiple concepts
       - Critical thinking and evaluation
       - Application to new scenarios`
    : `Generate 2 questions that require:
       - Understanding relationships between concepts
       - Applying knowledge to examples
       - Comparing and contrasting ideas`

  const adaptiveGeneration = await generateText({
    model: openai('gpt-4'),
    messages: [{
      role: 'system',
      content: `Create additional adaptive questions that build on existing knowledge.
      
${adaptivePrompt}

${includeTimestamps ? 'Include at least one question that references multiple timestamps to test comprehensive listening.' : ''}

Use the same JSON format as before.`
    }, {
      role: 'user',
      content: `Existing questions cover: ${existingQuestions.map(q => q.question).join('; ')}
      
Content: ${content.substring(0, 2000)}...`
    }]
  })

  try {
    const parsed = JSON.parse(adaptiveGeneration.text)
    return parsed.questions.map((q: any, index: number) => ({
      id: `adaptive_${Date.now()}_${index}`,
      ...q,
      difficulty
    }))
  } catch (e) {
    console.error("Failed to parse adaptive questions:", e)
    return []
  }
}