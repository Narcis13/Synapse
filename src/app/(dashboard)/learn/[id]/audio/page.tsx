"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { AudioLearning } from "@/components/audio/AudioLearning"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Headphones,
  Clock,
  Brain,
  Sparkles,
  FileAudio,
  BookOpen,
  MessageSquare,
  Download,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

interface Note {
  id: string
  timestamp: number
  content: string
  isHighlight: boolean
  createdAt: Date
}

export default function AudioPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as Id<"documents">
  
  const document = useQuery(api.documents.getDocument, { documentId })
  const [showAudioPlayer, setShowAudioPlayer] = useState(false)
  const [savedNotes, setSavedNotes] = useState<Note[]>([])

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if document has audio
  const hasAudio = document.fileType.startsWith('audio/') || document.transcript

  // Mock audio data - in production, this would come from storage
  const audioUrl = "/mock-audio.mp3" // Replace with actual audio URL
  const transcript = document.transcript || "Audio transcript will appear here once processed..."
  
  // Mock chapters - in production, these would be generated from audio analysis
  const mockChapters = [
    {
      id: "1",
      title: "Introduction & Overview",
      startTime: 0,
      endTime: 300,
      summary: "Setting the context and introducing key concepts"
    },
    {
      id: "2",
      title: "Core Concepts Explained",
      startTime: 300,
      endTime: 900,
      summary: "Deep dive into the fundamental principles"
    },
    {
      id: "3",
      title: "Practical Applications",
      startTime: 900,
      endTime: 1500,
      summary: "Real-world examples and use cases"
    },
    {
      id: "4",
      title: "Summary & Key Takeaways",
      startTime: 1500,
      endTime: 1800,
      summary: "Recap of main points and action items"
    }
  ]

  const handleNoteSave = (notes: Note[]) => {
    setSavedNotes(notes)
    // In production, save notes to database
    console.log("Saving notes:", notes)
  }

  const getAudioDuration = () => {
    if (document.audioDuration) {
      const minutes = Math.floor(document.audioDuration / 60)
      const seconds = document.audioDuration % 60
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    return "30:00" // Mock duration
  }

  if (!hasAudio) {
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

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileAudio className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Audio Available</h3>
            <p className="text-muted-foreground text-center mb-6">
              This document doesn't have audio content. You can upload an audio file or use text-to-speech to generate audio.
            </p>
            <div className="flex gap-3">
              <Button variant="outline">
                Upload Audio File
              </Button>
              <Button>
                Generate Audio with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showAudioPlayer) {
    return (
      <div className="flex-1 p-8">
        <Button
          variant="ghost"
          onClick={() => setShowAudioPlayer(false)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>

        <AudioLearning
          audioUrl={audioUrl}
          documentId={documentId}
          documentTitle={document.title}
          transcript={transcript}
          initialChapters={mockChapters}
          onNoteSave={handleNoteSave}
        />
      </div>
    )
  }

  // Audio overview screen
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

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Audio Learning Mode</CardTitle>
          <CardDescription className="text-lg mt-2">
            {document.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{getAudioDuration()}</p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{mockChapters.length}</p>
              <p className="text-sm text-muted-foreground">Chapters</p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full"
            onClick={() => setShowAudioPlayer(true)}
          >
            <Headphones className="mr-2 h-5 w-5" />
            Start Audio Session
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Smart Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Adjustable playback speed (0.5x - 2x)</li>
              <li>• Auto-generated chapter markers</li>
              <li>• One-click highlight important sections</li>
              <li>• Export notes with timestamps</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileAudio className="h-5 w-5 text-blue-500" />
              Audio Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Visual waveform navigation</li>
              <li>• Skip forward/backward 10 seconds</li>
              <li>• Volume control</li>
              <li>• Keyboard shortcuts support</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Chapter Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5" />
            Chapter Overview
          </CardTitle>
          <CardDescription>
            Navigate directly to any chapter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockChapters.map((chapter, index) => (
              <div 
                key={chapter.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{chapter.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.floor(chapter.startTime / 60)}:{(chapter.startTime % 60).toString().padStart(2, '0')} - 
                    {Math.floor(chapter.endTime / 60)}:{(chapter.endTime % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chapter.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro tip:</strong> Use keyboard shortcuts while listening - 
          Space to play/pause, ← → to skip, and N to add a note at the current timestamp.
        </AlertDescription>
      </Alert>

      {/* Alternative Actions */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/learn/${documentId}/chat`}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat About Audio
          </Link>
        </Button>
        <Button variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download Transcript
        </Button>
      </div>
    </div>
  )
}