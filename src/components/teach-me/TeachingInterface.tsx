"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  Mic,
  MicOff,
  Brain,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  Award,
  Volume2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Id } from "@/convex/_generated/dataModel"

interface SessionConfig {
  personality: string
  difficultyLevel: number
  topics: string[]
  duration: number
  focusAreas: string[]
}

interface TeachingInterfaceProps {
  sessionId: Id<"teachMeSessions">
  documentId: Id<"documents">
  documentTitle: string
  sessionConfig: SessionConfig
  onEndSession: () => void
}

interface Message {
  id: string
  role: "user" | "ai_student" | "system"
  content: string
  timestamp: Date
  feedback?: {
    clarity: number
    accuracy: number
    completeness: number
    suggestions: string[]
  }
}

const AI_PERSONALITIES = {
  curious_child: {
    name: "Alex",
    avatar: "🧒",
    systemPrompt: "You are a curious 10-year-old student who loves asking 'why' and 'how' questions. You get excited about learning new things but need simple explanations.",
    responses: {
      greeting: "Hi! I'm really excited to learn about this! Can you explain it to me?",
      confused: "Hmm, I don't really understand that part. Can you explain it differently?",
      understanding: "Oh, I think I get it! So it's like...",
      followUp: "But why does that happen? Can you tell me more?"
    }
  },
  peer_student: {
    name: "Sam",
    avatar: "👩‍🎓",
    systemPrompt: "You are a fellow student who is collaborative and makes relatable mistakes. You ask for clarification and share your understanding.",
    responses: {
      greeting: "Hey! Ready to study together? I've been trying to understand this topic.",
      confused: "Wait, I'm a bit confused. Can we go over that part again?",
      understanding: "Okay, so if I understand correctly...",
      followUp: "That makes sense! But what about..."
    }
  },
  skeptical_professor: {
    name: "Dr. Morgan",
    avatar: "👨‍🏫",
    systemPrompt: "You are a skeptical professor who challenges assumptions and demands precision. You ask for evidence and test deep understanding.",
    responses: {
      greeting: "Good day. I've reviewed the material. Please explain your understanding of the core concepts.",
      confused: "Your explanation lacks precision. Can you provide more rigorous reasoning?",
      understanding: "I see. That's a reasonable explanation, however...",
      followUp: "What evidence supports this claim? How does this relate to..."
    }
  },
  practical_professional: {
    name: "Jordan",
    avatar: "💼",
    systemPrompt: "You are a professional seeking practical applications. You focus on real-world use cases and ROI.",
    responses: {
      greeting: "Thanks for meeting with me. I need to understand how this applies to real-world scenarios.",
      confused: "I'm not seeing the practical application here. Can you give me a concrete example?",
      understanding: "Alright, so in practice this would mean...",
      followUp: "How would this impact our bottom line? What about edge cases?"
    }
  }
}

export function TeachingInterface({
  sessionId,
  documentId,
  documentTitle,
  sessionConfig,
  onEndSession
}: TeachingInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(sessionConfig.duration * 60)
  const [comprehensionScore, setComprehensionScore] = useState(0)
  const [coveredTopics, setCoveredTopics] = useState<Set<string>>(new Set())
  const [weakAreas, setWeakAreas] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const personality = AI_PERSONALITIES[sessionConfig.personality as keyof typeof AI_PERSONALITIES]

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          onEndSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onEndSession])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Initialize with greeting
  useEffect(() => {
    const greetingMessage: Message = {
      id: "1",
      role: "ai_student",
      content: personality.responses.greeting,
      timestamp: new Date()
    }
    setMessages([greetingMessage])
  }, [personality])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI processing and feedback
    setTimeout(() => {
      // Mock feedback based on message quality
      const feedback = {
        clarity: Math.random() * 100,
        accuracy: Math.random() * 100,
        completeness: Math.random() * 100,
        suggestions: [
          "Consider using more examples",
          "Try to simplify technical terms",
          "Connect to previous concepts"
        ].filter(() => Math.random() > 0.5)
      }

      // Update comprehension score
      const avgScore = (feedback.clarity + feedback.accuracy + feedback.completeness) / 3
      setComprehensionScore((prev) => (prev + avgScore) / 2)

      // Track covered topics (mock)
      sessionConfig.topics.forEach((topic) => {
        if (input.toLowerCase().includes(topic.toLowerCase())) {
          setCoveredTopics((prev) => new Set([...prev, topic]))
        }
      })

      // Generate AI response based on feedback
      let aiResponse = ""
      if (avgScore > 80) {
        aiResponse = personality.responses.understanding + " " + personality.responses.followUp
      } else if (avgScore > 60) {
        aiResponse = personality.responses.followUp
      } else {
        aiResponse = personality.responses.confused
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai_student",
        content: aiResponse,
        timestamp: new Date(),
        feedback
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleVoiceInput = () => {
    // Mock voice input - in production, use Web Speech API or similar
    setIsRecording(!isRecording)
  }

  const playAudioResponse = () => {
    // Mock audio playback - in production, use text-to-speech
    console.log("Playing audio response")
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const topicsCoveredPercentage = (coveredTopics.size / sessionConfig.topics.length) * 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Main Chat Interface */}
      <div className="lg:col-span-2 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "text-3xl w-12 h-12 rounded-full flex items-center justify-center",
                  "bg-primary/10"
                )}>
                  {personality.avatar}
                </div>
                <div>
                  <CardTitle>{personality.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Teaching: {documentTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(timeRemaining)}
                </Badge>
                <Button size="sm" variant="ghost" onClick={playAudioResponse}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <Separator />

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "justify-end"
                  )}
                >
                  {message.role === "ai_student" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                      {personality.avatar}
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {message.feedback && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span className={getScoreColor(message.feedback.clarity)}>
                              {Math.round(message.feedback.clarity)}% clear
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span className={getScoreColor(message.feedback.accuracy)}>
                              {Math.round(message.feedback.accuracy)}% accurate
                            </span>
                          </div>
                        </div>
                        
                        {message.feedback.suggestions.length > 0 && (
                          <div className="space-y-1">
                            {message.feedback.suggestions.map((suggestion, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                <Lightbulb className="h-3 w-3 mt-0.5" />
                                {suggestion}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                      You
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                    {personality.avatar}
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Explain the concept to your student..."
                className="min-h-[80px] resize-none"
              />
              <div className="flex flex-col gap-2">
                <Button
                  size="icon"
                  variant={isRecording ? "destructive" : "secondary"}
                  onClick={handleVoiceInput}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={handleSendMessage} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Panel */}
      <div className="space-y-4">
        {/* Real-time Scores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Comprehension Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={cn("text-4xl font-bold", getScoreColor(comprehensionScore))}>
                {Math.round(comprehensionScore)}%
              </div>
              <Progress value={comprehensionScore} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Topic Coverage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Topic Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={topicsCoveredPercentage} className="mb-3" />
            <div className="space-y-2">
              {sessionConfig.topics.map((topic) => (
                <div key={topic} className="flex items-center justify-between text-sm">
                  <span className={cn(
                    "text-muted-foreground",
                    coveredTopics.has(topic) && "text-foreground font-medium"
                  )}>
                    {topic}
                  </span>
                  {coveredTopics.has(topic) && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Difficulty</span>
              <Badge variant="outline">
                Level {sessionConfig.difficultyLevel}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Messages</span>
              <span className="font-medium">{messages.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Elapsed</span>
              <span className="font-medium">
                {Math.floor((sessionConfig.duration * 60 - timeRemaining) / 60)}m
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Weak Areas Alert */}
        {weakAreas.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Areas needing attention:</strong>
              <ul className="mt-1 text-sm">
                {weakAreas.map((area, idx) => (
                  <li key={idx}>• {area}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* End Session */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onEndSession}
        >
          End Teaching Session
        </Button>
      </div>
    </div>
  )
}