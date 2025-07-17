"use node"

import { v } from "convex/values"
import { action } from "../_generated/server"
import { internal } from "../_generated/api"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// AI Student Personalities for Teach Me mode
const AI_STUDENT_PERSONALITIES = {
  curious_child: {
    name: "Alex",
    description: "A curious 10-year-old who asks lots of 'why' questions",
    traits: ["asks why often", "needs simple explanations", "gets excited about learning"],
    systemPrompt: `You are Alex, a curious 10-year-old student. You:
- Ask lots of "why" questions
- Need simple, easy-to-understand explanations
- Get excited when you understand something new
- Sometimes make innocent mistakes or misunderstandings
- Say things like "Oh wow!" or "That's so cool!" when learning
- Ask for examples related to everyday life`
  },
  skeptical_professor: {
    name: "Dr. Morgan",
    description: "A skeptical professor who challenges assumptions",
    traits: ["challenges assumptions", "asks for evidence", "rigorous questioning"],
    systemPrompt: `You are Dr. Morgan, a skeptical academic. You:
- Challenge assumptions and ask for evidence
- Point out logical inconsistencies
- Ask probing questions to test understanding
- Appreciate well-reasoned arguments
- Sometimes play devil's advocate
- Request citations or sources when appropriate`
  },
  peer_student: {
    name: "Sam",
    description: "A fellow student learning alongside you",
    traits: ["relatable mistakes", "collaborative", "encouraging"],
    systemPrompt: `You are Sam, a fellow student. You:
- Make relatable mistakes and confusions
- Think out loud and work through problems together
- Offer encouragement like "I think I get it now!"
- Share your own understanding to check if it's right
- Ask clarifying questions in a friendly way
- Sometimes say "Wait, can you explain that part again?"`
  }
}

export const generateTeachMeScript = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    try {
      // Get document and its chunks
      const document = await ctx.runQuery(internal.documents.getById, {
        documentId: args.documentId
      })
      
      if (!document) {
        throw new Error("Document not found")
      }

      // Get all document chunks for analysis
      const chunks = await ctx.runQuery(internal.documents.getChunksByDocument, {
        documentId: args.documentId
      })

      if (!chunks || chunks.length === 0) {
        throw new Error("No content chunks found for document")
      }

      // Combine chunks to get full content (limit to first 10 chunks for initial analysis)
      const contentForAnalysis = chunks
        .slice(0, 10)
        .map(chunk => chunk.content)
        .join("\n\n")

      // Step 1: Analyze document for key concepts
      const conceptAnalysis = await generateText({
        model: openai('gpt-4'),
        messages: [{
          role: 'system',
          content: `You are an expert educator analyzing content for teaching. Extract the key concepts, main ideas, and potential areas of confusion from the following content. Format your response as JSON with:
{
  "keyConcepts": ["concept1", "concept2", ...],
  "mainIdeas": ["idea1", "idea2", ...],
  "potentialConfusions": ["confusion1", "confusion2", ...],
  "suggestedTeachingOrder": ["topic1", "topic2", ...]
}`
        }, {
          role: 'user',
          content: contentForAnalysis
        }]
      })

      let parsedConcepts
      try {
        parsedConcepts = JSON.parse(conceptAnalysis.text)
      } catch (e) {
        // Fallback if JSON parsing fails
        parsedConcepts = {
          keyConcepts: ["Main topic from the document"],
          mainIdeas: ["Core idea from the content"],
          potentialConfusions: ["Common misconception"],
          suggestedTeachingOrder: ["Introduction", "Main concepts", "Summary"]
        }
      }

      // Step 2: Select AI student personality (rotate through them)
      const personalities = Object.keys(AI_STUDENT_PERSONALITIES) as Array<keyof typeof AI_STUDENT_PERSONALITIES>
      const selectedPersonalityKey = personalities[Math.floor(Math.random() * personalities.length)]
      const selectedPersonality = AI_STUDENT_PERSONALITIES[selectedPersonalityKey]

      // Step 3: Generate initial conversation script
      const scriptGeneration = await generateText({
        model: openai('gpt-4'),
        messages: [{
          role: 'system',
          content: `You are creating a Teach Me mode conversation script. The user will teach ${selectedPersonality.name} about the topic.

Create an engaging opening for the teaching session that:
1. Introduces ${selectedPersonality.name} with their personality
2. Shows what ${selectedPersonality.name} already knows (very basic)
3. Asks the user to explain the first key concept: "${parsedConcepts.keyConcepts[0]}"
4. Include 2-3 follow-up questions ${selectedPersonality.name} might ask based on their personality
5. Add one intentional misconception that ${selectedPersonality.name} might have

Format as a conversation starter, not a full script.`
        }, {
          role: 'user',
          content: `Topic: ${document.title}\nKey concepts to cover: ${parsedConcepts.keyConcepts.join(', ')}`
        }]
      })

      // Step 4: Generate targeted questions for each concept
      const targetedQuestions = await generateText({
        model: openai('gpt-4'),
        messages: [{
          role: 'system',
          content: `As ${selectedPersonality.name}, create specific questions for each key concept that match the personality. Questions should test understanding and encourage deeper explanation.`
        }, {
          role: 'user',
          content: `Concepts: ${JSON.stringify(parsedConcepts.keyConcepts)}
Personality traits: ${selectedPersonality.traits.join(', ')}`
        }]
      })

      // Step 5: Create misconception traps
      const misconceptionTraps = await generateText({
        model: openai('gpt-4'),
        messages: [{
          role: 'system',
          content: `Create 3-5 common misconceptions about the topic that ${selectedPersonality.name} might have. These should be realistic misunderstandings that help test if the teacher truly understands the material.`
        }, {
          role: 'user',
          content: `Topic: ${document.title}
Main ideas: ${parsedConcepts.mainIdeas.join(', ')}
Potential confusions: ${parsedConcepts.potentialConfusions.join(', ')}`
        }]
      })

      // Combine everything into a structured teach me script
      const teachMeScript = {
        documentId: args.documentId,
        personality: {
          key: selectedPersonalityKey,
          name: selectedPersonality.name,
          description: selectedPersonality.description,
          systemPrompt: selectedPersonality.systemPrompt
        },
        conceptAnalysis: parsedConcepts,
        conversationStarter: scriptGeneration.text,
        targetedQuestions: targetedQuestions.text,
        misconceptionTraps: misconceptionTraps.text,
        metadata: {
          generatedAt: Date.now(),
          modelUsed: 'gpt-4',
          chunkCount: chunks.length
        }
      }

      // Store the generated script
      await ctx.runMutation(internal.generatedContent.store, {
        documentId: args.documentId,
        type: "teach_me_script",
        content: JSON.stringify(teachMeScript),
        metadata: {
          personality: selectedPersonalityKey,
          conceptCount: parsedConcepts.keyConcepts.length
        }
      })

      // Create a new teach me session
      const user = await ctx.runQuery(internal.users.getCurrentUser)
      if (!user) {
        throw new Error("User not found")
      }

      await ctx.runMutation(internal.teachMeSessions.create, {
        userId: user._id,
        documentId: args.documentId,
        currentTopic: parsedConcepts.keyConcepts[0] || "Introduction",
        personality: selectedPersonalityKey
      })

      return {
        success: true,
        script: teachMeScript,
        personality: selectedPersonality.name,
        conceptCount: parsedConcepts.keyConcepts.length
      }

    } catch (error) {
      console.error("Teach Me script generation error:", error)
      throw error
    }
  }
})