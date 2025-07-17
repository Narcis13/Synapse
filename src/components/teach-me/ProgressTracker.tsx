"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Brain, 
  Target, 
  TrendingUp, 
  MessageSquare,
  Award,
  Zap,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface TeachingSession {
  id: string
  topicUnderstanding: number
  explanationClarity: number
  questionsAnswered: number
  totalQuestions: number
  conceptsCovered: string[]
  duration: number // in seconds
  engagementScore: number
  difficultyHandled: "beginner" | "intermediate" | "advanced"
}

interface ProgressTrackerProps {
  session: TeachingSession
  showDetails?: boolean
  className?: string
}

export function ProgressTracker({ 
  session, 
  showDetails = true,
  className 
}: ProgressTrackerProps) {
  const overallProgress = Math.round(
    (session.topicUnderstanding + session.explanationClarity + session.engagementScore) / 3
  )
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const getProgressColor = (value: number) => {
    if (value >= 80) return "text-green-500"
    if (value >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Teaching Progress</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              {overallProgress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Metrics */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span>Topic Understanding</span>
                </div>
                <span className={cn("font-medium", getProgressColor(session.topicUnderstanding))}>
                  {session.topicUnderstanding}%
                </span>
              </div>
              <Progress value={session.topicUnderstanding} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>Explanation Clarity</span>
                </div>
                <span className={cn("font-medium", getProgressColor(session.explanationClarity))}>
                  {session.explanationClarity}%
                </span>
              </div>
              <Progress value={session.explanationClarity} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Engagement Score</span>
                </div>
                <span className={cn("font-medium", getProgressColor(session.engagementScore))}>
                  {session.engagementScore}%
                </span>
              </div>
              <Progress value={session.engagementScore} className="h-2" />
            </div>
          </div>

          {/* Session Stats */}
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                <span>Questions</span>
              </div>
              <span className="font-medium">
                {session.questionsAnswered}/{session.totalQuestions}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Duration</span>
              </div>
              <span className="font-medium">{formatDuration(session.duration)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      {showDetails && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Concepts Covered</p>
              <div className="flex flex-wrap gap-2">
                {session.conceptsCovered.map((concept, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {concept}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Difficulty Level</p>
              <Badge 
                variant={
                  session.difficultyHandled === "advanced" ? "default" :
                  session.difficultyHandled === "intermediate" ? "secondary" :
                  "outline"
                }
              >
                {session.difficultyHandled}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}