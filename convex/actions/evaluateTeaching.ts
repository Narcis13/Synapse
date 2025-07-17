"use node"

import { v } from "convex/values"
import { action } from "../_generated/server"
import { api } from "../_generated/api"
import OpenAI from "openai"
import { getPersonalityById, getRandomResponse, getPersonalitySystemPrompt } from "../../src/lib/ai/personalities"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const evaluateExplanation = action({
  args: {
    sessionId: v.id("teachMeSessions"),
    explanation: v.string(),
    chunkIds: v.array(v.id("documentChunks")),
    personalityType: v.string(),
    conversationHistory: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string()
    })))
  },
  handler: async (ctx, args): Promise<{
    evaluation: {
      accuracy: number;
      clarity: number;
      completeness: number;
      overallScore: number;
      misconceptions: string[];
      missingConcepts: string[];
      strengths: string[];
    };
    studentResponse: {
      type: "question" | "feedback" | "encouragement" | "clarification" | "confusion";
      content: string;
      personality: string;
      mood: "excited" | "confused" | "thoughtful" | "interested";
    };
    sessionUpdate: {
      comprehensionScore: number;
      questionsAnswered: number;
      totalQuestions: number;
    };
  }> => {
    // Fetch the session details
    const session: any = await ctx.runQuery(api.documents.getTeachMeSession, {
      sessionId: args.sessionId
    })
    
    if (!session) {
      throw new Error("Session not found")
    }

    // Fetch source material chunks
    const sourceChunks = await Promise.all(
      args.chunkIds.map(chunkId => 
        ctx.runQuery(api.documents.getDocumentChunk, { chunkId })
      )
    )
    
    const sourceMaterial = sourceChunks
      .filter((chunk): chunk is NonNullable<typeof chunk> => chunk !== null)
      .map(chunk => chunk.content)
      .join("\n\n")

    // Get the AI student personality
    const personality = getPersonalityById(args.personalityType as any)
    
    // Prepare evaluation prompt
    const evaluationPrompt = `
You are evaluating a teaching explanation for accuracy, clarity, and completeness.

Source Material:
${sourceMaterial}

Student's Explanation:
${args.explanation}

Current Topic: ${session.currentTopic}

Please evaluate the explanation on the following criteria:
1. Accuracy (0-100): How factually correct is the explanation compared to the source?
2. Clarity (0-100): How clear and understandable is the explanation?
3. Completeness (0-100): How well does it cover the key concepts?
4. Misconceptions: List any errors or misconceptions in the explanation
5. Missing Concepts: List important concepts that were not covered
6. Strengths: What did the teacher explain particularly well?

Provide your evaluation in JSON format.
`

    try {
      // Evaluate the explanation
      const evaluationResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert educational evaluator. Analyze teaching explanations for accuracy, clarity, and completeness."
          },
          {
            role: "user",
            content: evaluationPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      })

      const evaluation = JSON.parse(evaluationResponse.choices[0].message.content || "{}")
      
      // Calculate overall score
      const overallScore = Math.round(
        (evaluation.accuracy + evaluation.clarity + evaluation.completeness) / 3
      )

      // Generate AI student response based on evaluation
      const studentResponsePrompt = `
Based on this evaluation of the teacher's explanation:
- Accuracy: ${evaluation.accuracy}%
- Clarity: ${evaluation.clarity}%
- Completeness: ${evaluation.completeness}%
- Misconceptions: ${evaluation.misconceptions?.join(", ") || "None"}
- Missing concepts: ${evaluation.missingConcepts?.join(", ") || "None"}

Generate an appropriate response that:
1. Reflects your personality traits
2. Shows understanding where the explanation was clear
3. Asks for clarification where needed
4. Points out any confusion from misconceptions
5. Inquires about missing concepts naturally
6. Maintains engagement and encourages the teacher

Previous conversation for context:
${args.conversationHistory?.map(msg => `${msg.role}: ${msg.content}`).join("\n") || "No previous messages"}
`

      const studentResponse: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: getPersonalitySystemPrompt(personality, session.currentTopic)
          },
          {
            role: "user",
            content: studentResponsePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      })

      const aiResponse: string = studentResponse.choices[0].message.content || 
        getRandomResponse(personality, "confusion")

      // Determine response type based on evaluation
      let responseType: "question" | "feedback" | "encouragement" | "clarification"
      if (overallScore >= 80) {
        responseType = evaluation.missingConcepts?.length > 0 ? "question" : "encouragement"
      } else if (evaluation.clarity < 60) {
        responseType = "clarification"
      } else if (evaluation.accuracy < 70) {
        responseType = "feedback"
      } else {
        responseType = "question"
      }

      // Store the conversation
      await ctx.runMutation(api.documents.addTeachMeConversation, {
        sessionId: args.sessionId,
        role: "user",
        content: args.explanation,
        feedback: {
          clarity: Math.round(evaluation.clarity / 20), // Convert to 1-5 scale
          accuracy: Math.round(evaluation.accuracy / 20),
          completeness: Math.round(evaluation.completeness / 20),
          suggestions: [
            ...(evaluation.misconceptions || []),
            ...(evaluation.missingConcepts?.map((c: string) => `Cover: ${c}`) || [])
          ].slice(0, 3) // Limit to 3 suggestions
        }
      })

      await ctx.runMutation(api.documents.addTeachMeConversation, {
        sessionId: args.sessionId,
        role: "ai_student",
        content: aiResponse,
      })

      // Update session comprehension score
      await ctx.runMutation(api.documents.updateTeachMeSession, {
        sessionId: args.sessionId,
        comprehensionScore: overallScore,
        weakAreas: [
          ...(evaluation.accuracy < 70 ? ["accuracy"] : []),
          ...(evaluation.clarity < 70 ? ["clarity"] : []),
          ...(evaluation.completeness < 70 ? ["completeness"] : [])
        ]
      })

      return {
        evaluation: {
          accuracy: evaluation.accuracy,
          clarity: evaluation.clarity,
          completeness: evaluation.completeness,
          overallScore,
          misconceptions: evaluation.misconceptions || [],
          missingConcepts: evaluation.missingConcepts || [],
          strengths: evaluation.strengths || []
        },
        studentResponse: {
          type: responseType,
          content: aiResponse,
          personality: personality.name,
          mood: overallScore >= 80 ? "excited" : 
                evaluation.clarity < 60 ? "confused" :
                evaluation.accuracy < 70 ? "thoughtful" : "interested"
        },
        sessionUpdate: {
          comprehensionScore: overallScore,
          questionsAnswered: (session.questionsAnswered || 0) + 1,
          totalQuestions: (session.totalQuestions || 0) + 1
        }
      }
    } catch (error) {
      console.error("Error evaluating explanation:", error)
      
      // Fallback response
      const fallbackResponse = getRandomResponse(personality, "confusion")
      
      await ctx.runMutation(api.documents.addTeachMeConversation, {
        sessionId: args.sessionId,
        role: "ai_student",
        content: fallbackResponse,
      })
      
      return {
        evaluation: {
          accuracy: 50,
          clarity: 50,
          completeness: 50,
          overallScore: 50,
          misconceptions: [],
          missingConcepts: [],
          strengths: []
        },
        studentResponse: {
          type: "confusion" as const,
          content: fallbackResponse,
          personality: personality.name,
          mood: "confused" as const
        },
        sessionUpdate: {
          comprehensionScore: 50,
          questionsAnswered: (session.questionsAnswered || 0) + 1,
          totalQuestions: (session.totalQuestions || 0) + 1
        }
      }
    }
  }
})

export const generateFollowUpQuestion = action({
  args: {
    sessionId: v.id("teachMeSessions"),
    personalityType: v.string(),
    recentExplanation: v.string(),
    comprehensionLevel: v.number()
  },
  handler: async (ctx, args): Promise<{
    question: string;
    type: "advanced" | "clarification" | "understanding";
  }> => {
    const session: any = await ctx.runQuery(api.documents.getTeachMeSession, {
      sessionId: args.sessionId
    })
    
    if (!session) {
      throw new Error("Session not found")
    }

    const personality = getPersonalityById(args.personalityType as any)
    
    const prompt = `
Current topic: ${session.currentTopic}
Recent explanation: ${args.recentExplanation}
Student's comprehension level: ${args.comprehensionLevel}%

Generate a follow-up question that:
1. Matches the personality's learning style and difficulty preference
2. Probes deeper if comprehension is high (>70%)
3. Asks for clarification if comprehension is low (<50%)
4. Tests understanding if comprehension is moderate (50-70%)
5. Relates to real-world applications or examples
`

    try {
      const response: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: getPersonalitySystemPrompt(personality, session.currentTopic)
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 150,
      })

      const question: string = response.choices[0].message.content || 
        getRandomResponse(personality, "followUp")

      await ctx.runMutation(api.documents.addTeachMeConversation, {
        sessionId: args.sessionId,
        role: "ai_student",
        content: question,
      })

      return {
        question,
        type: args.comprehensionLevel > 70 ? "advanced" : 
              args.comprehensionLevel < 50 ? "clarification" : "understanding"
      }
    } catch (error) {
      console.error("Error generating follow-up question:", error)
      const fallback = getRandomResponse(personality, "followUp")
      
      return {
        question: fallback,
        type: "understanding"
      }
    }
  }
})