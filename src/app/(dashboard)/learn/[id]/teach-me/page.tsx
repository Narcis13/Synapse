"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { SessionManager } from "@/components/teach-me/SessionManager"
import { TeachingInterface } from "@/components/teach-me/TeachingInterface"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface SessionConfig {
  personality: string
  difficultyLevel: number
  topics: string[]
  duration: number
  focusAreas: string[]
}

export default function TeachMePage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as Id<"documents">
  
  const document = useQuery(api.documents.getDocument, { documentId })
  const [activeSession, setActiveSession] = useState<SessionConfig | null>(null)
  const [sessionId, setSessionId] = useState<Id<"teachMeSessions"> | null>(null)

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Mock data - in production, these would come from document processing
  const availableTopics = [
    "Introduction",
    "Core Concepts",
    "Implementation Details",
    "Best Practices",
    "Common Pitfalls",
    "Advanced Topics"
  ]

  const previousSessions = [
    {
      id: "1",
      date: new Date(Date.now() - 86400000),
      duration: 25,
      personality: "peer_student",
      comprehensionScore: 78,
      topicseCovered: ["Introduction", "Core Concepts"],
      weakAreas: ["Implementation Details", "Best Practices"]
    },
    {
      id: "2",
      date: new Date(Date.now() - 172800000),
      duration: 30,
      personality: "curious_child",
      comprehensionScore: 85,
      topicseCovered: ["Core Concepts", "Best Practices"],
      weakAreas: ["Advanced Topics"]
    },
    {
      id: "3",
      date: new Date(Date.now() - 259200000),
      duration: 20,
      personality: "skeptical_professor",
      comprehensionScore: 72,
      topicseCovered: ["Implementation Details", "Advanced Topics"],
      weakAreas: ["Implementation Details", "Common Pitfalls"]
    }
  ]

  const handleStartSession = async (config: SessionConfig) => {
    // In production, create a new teach me session in the database
    // For now, we'll just set the active session
    setActiveSession(config)
    
    // Mock session ID - in production, this would come from the database
    setSessionId("mock-session-id" as Id<"teachMeSessions">)
  }

  const handleEndSession = () => {
    setActiveSession(null)
    setSessionId(null)
  }

  if (activeSession && sessionId) {
    return (
      <div className="flex-1 p-8">
        <Button
          variant="ghost"
          onClick={handleEndSession}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          End Session
        </Button>

        <TeachingInterface
          sessionId={sessionId}
          documentId={documentId}
          documentTitle={document.title}
          sessionConfig={activeSession}
          onEndSession={handleEndSession}
        />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.push(`/learn/${documentId}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Document
      </Button>

      <SessionManager
        documentId={documentId}
        documentTitle={document.title}
        availableTopics={availableTopics}
        previousSessions={previousSessions}
        onStartSession={handleStartSession}
      />
    </div>
  )
}