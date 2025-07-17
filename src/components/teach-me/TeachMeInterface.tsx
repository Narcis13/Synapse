"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Lightbulb, Brain, Target, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentMessage {
  id: string
  type: "question" | "feedback" | "encouragement" | "clarification"
  content: string
  timestamp: Date
}

interface Session {
  topicUnderstanding: number
  explanationClarity: number
  questionsAnswered: number
  totalQuestions: number
}

export function TeachMeInterface() {
  const [userExplanation, setUserExplanation] = useState("")
  const [studentMessages, setStudentMessages] = useState<StudentMessage[]>([
    {
      id: "1",
      type: "question",
      content: "Hi! I'm Alex, your AI student. What would you like to teach me today?",
      timestamp: new Date()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [session, setSession] = useState<Session>({
    topicUnderstanding: 0,
    explanationClarity: 0,
    questionsAnswered: 0,
    totalQuestions: 0
  })

  const handleSendExplanation = async () => {
    if (!userExplanation.trim()) return

    setUserExplanation("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const newMessage: StudentMessage = {
        id: Date.now().toString(),
        type: "question",
        content: "That's interesting! Can you explain that part about the key concepts in more detail?",
        timestamp: new Date()
      }
      setStudentMessages(prev => [...prev, newMessage])
      setIsTyping(false)
      
      // Update session progress
      setSession(prev => ({
        ...prev,
        topicUnderstanding: Math.min(prev.topicUnderstanding + 15, 100),
        explanationClarity: Math.min(prev.explanationClarity + 10, 100),
        questionsAnswered: prev.questionsAnswered + 1,
        totalQuestions: prev.totalQuestions + 1
      }))
    }, 2000)
  }

  const getMessageIcon = (type: StudentMessage["type"]) => {
    switch (type) {
      case "question":
        return <MessageCircle className="h-4 w-4" />
      case "feedback":
        return <Target className="h-4 w-4" />
      case "encouragement":
        return <Lightbulb className="h-4 w-4" />
      case "clarification":
        return <RefreshCw className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid gap-6 md:grid-cols-3">
        {/* AI Student Section */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/avatars/ai-student.png" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Alex - Your AI Student</CardTitle>
                    <p className="text-sm text-muted-foreground">Curious and eager to learn</p>
                  </div>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Brain className="h-3 w-3" />
                  Active Learning
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {studentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg",
                      "bg-muted/50"
                    )}
                  >
                    <div className="mt-1">{getMessageIcon(message.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-sm text-muted-foreground">Alex is thinking...</span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <Textarea
                  value={userExplanation}
                  onChange={(e) => setUserExplanation(e.target.value)}
                  placeholder="Explain the concept to Alex... Be clear and use examples!"
                  className="min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendExplanation()
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <Button 
                    onClick={handleSendExplanation}
                    disabled={!userExplanation.trim() || isTyping}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Explanation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracking Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Topic Understanding</span>
                  <span className="text-muted-foreground">{session.topicUnderstanding}%</span>
                </div>
                <Progress value={session.topicUnderstanding} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Explanation Clarity</span>
                  <span className="text-muted-foreground">{session.explanationClarity}%</span>
                </div>
                <Progress value={session.explanationClarity} className="h-2" />
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Questions Answered</span>
                  <span className="font-medium">{session.questionsAnswered}/{session.totalQuestions}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Teaching Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                <p className="text-muted-foreground">Use simple language and real-world examples</p>
              </div>
              <div className="flex gap-2 text-sm">
                <Brain className="h-4 w-4 text-purple-500 mt-0.5" />
                <p className="text-muted-foreground">Break complex ideas into smaller parts</p>
              </div>
              <div className="flex gap-2 text-sm">
                <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-muted-foreground">Check understanding with follow-up questions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}