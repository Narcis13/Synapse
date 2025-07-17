"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Brain,
  Clock,
  GraduationCap,
  User,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  BarChart3,
  Lightbulb,
  BookOpen,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionConfig {
  personality: string
  difficultyLevel: number
  topics: string[]
  duration: number
  focusAreas: string[]
}

interface SessionManagerProps {
  documentId: string
  documentTitle: string
  availableTopics: string[]
  onStartSession: (config: SessionConfig) => void
  previousSessions?: SessionHistory[]
}

interface SessionHistory {
  id: string
  date: Date
  duration: number
  personality: string
  comprehensionScore: number
  topicseCovered: string[]
  weakAreas: string[]
}

interface PerformanceMetrics {
  accuracy: number
  clarity: number
  completeness: number
  improvement: number
}

const AI_PERSONALITIES = [
  {
    id: "curious_child",
    name: "Alex the Curious",
    avatar: "🧒",
    description: "A curious 10-year-old who asks lots of 'why' questions",
    traits: ["Simple questions", "Gets excited easily", "Needs basic explanations"],
    difficulty: 1,
    color: "bg-green-500"
  },
  {
    id: "peer_student",
    name: "Sam the Peer",
    avatar: "👩‍🎓",
    description: "A fellow student learning alongside you",
    traits: ["Relatable mistakes", "Collaborative", "Asks for clarification"],
    difficulty: 2,
    color: "bg-blue-500"
  },
  {
    id: "skeptical_professor",
    name: "Dr. Morgan",
    avatar: "👨‍🏫",
    description: "A skeptical professor who challenges your understanding",
    traits: ["Challenges assumptions", "Asks for evidence", "Demands precision"],
    difficulty: 4,
    color: "bg-purple-500"
  },
  {
    id: "practical_professional",
    name: "Jordan the Pro",
    avatar: "💼",
    description: "A professional seeking real-world applications",
    traits: ["Practical examples", "Industry context", "ROI focused"],
    difficulty: 3,
    color: "bg-orange-500"
  }
]

export function SessionManager({
  documentId,
  documentTitle,
  availableTopics,
  onStartSession,
  previousSessions = []
}: SessionManagerProps) {
  const [selectedPersonality, setSelectedPersonality] = useState(AI_PERSONALITIES[1].id)
  const [difficultyLevel, setDifficultyLevel] = useState([3])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [duration, setDuration] = useState([20])
  const [showPerformanceReview, setShowPerformanceReview] = useState(false)
  const [lastSessionMetrics, setLastSessionMetrics] = useState<PerformanceMetrics | null>(null)

  const selectedPersonalityData = AI_PERSONALITIES.find(p => p.id === selectedPersonality)!

  // Calculate average performance from previous sessions
  const averageScore = previousSessions.length > 0
    ? previousSessions.reduce((acc, session) => acc + session.comprehensionScore, 0) / previousSessions.length
    : 0

  // Identify common weak areas
  const weakAreaFrequency = previousSessions.reduce((acc, session) => {
    session.weakAreas.forEach(area => {
      acc[area] = (acc[area] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topWeakAreas = Object.entries(weakAreaFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([area]) => area)

  const handleStartSession = () => {
    const config: SessionConfig = {
      personality: selectedPersonality,
      difficultyLevel: difficultyLevel[0],
      topics: selectedTopics.length > 0 ? selectedTopics : availableTopics,
      duration: duration[0],
      focusAreas: topWeakAreas
    }
    onStartSession(config)
  }

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }

  const getDifficultyLabel = (value: number) => {
    if (value <= 2) return "Easy"
    if (value <= 3) return "Medium"
    if (value <= 4) return "Hard"
    return "Expert"
  }

  const getDifficultyColor = (value: number) => {
    if (value <= 2) return "text-green-600"
    if (value <= 3) return "text-yellow-600"
    if (value <= 4) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Session Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Configure Your Teaching Session
          </CardTitle>
          <CardDescription>
            Customize your learning experience by teaching {documentTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Personality Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Choose Your AI Student
            </Label>
            <RadioGroup value={selectedPersonality} onValueChange={setSelectedPersonality}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_PERSONALITIES.map((personality) => (
                  <div key={personality.id}>
                    <RadioGroupItem
                      value={personality.id}
                      id={personality.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={personality.id}
                      className={cn(
                        "flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all",
                        "hover:bg-muted",
                        "peer-checked:border-primary peer-checked:bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "text-2xl w-12 h-12 rounded-full flex items-center justify-center",
                            personality.color
                          )}>
                            {personality.avatar}
                          </div>
                          <div>
                            <h4 className="font-semibold">{personality.name}</h4>
                            <Badge variant="outline" className="mt-1">
                              Difficulty {personality.difficulty}/5
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {personality.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {personality.traits.map((trait, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Difficulty Level */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Session Difficulty
            </Label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Adjust question complexity</span>
                <span className={cn("font-medium", getDifficultyColor(difficultyLevel[0]))}>
                  {getDifficultyLabel(difficultyLevel[0])}
                </span>
              </div>
              <Slider
                value={difficultyLevel}
                onValueChange={setDifficultyLevel}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Easy</span>
                <span>Expert</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Topic Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Focus Topics
            </Label>
            <p className="text-sm text-muted-foreground">
              Select specific topics or leave empty to cover all
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant={selectedTopics.includes(topic) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTopicToggle(topic)}
                >
                  {topic}
                  {selectedTopics.includes(topic) && (
                    <CheckCircle className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Session Duration */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Duration
            </Label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>How long would you like to teach?</span>
                <span className="font-medium">{duration[0]} minutes</span>
              </div>
              <Slider
                value={duration}
                onValueChange={setDuration}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button 
            size="lg" 
            className="w-full"
            onClick={handleStartSession}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Teaching Session
          </Button>
        </CardContent>
      </Card>

      {/* Previous Sessions & Performance */}
      {previousSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Teaching Performance
            </CardTitle>
            <CardDescription>
              Track your progress across sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {previousSessions.length}
                </div>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-3xl font-bold",
                  averageScore >= 80 ? "text-green-600" : 
                  averageScore >= 60 ? "text-yellow-600" : "text-red-600"
                )}>
                  {Math.round(averageScore)}%
                </div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(previousSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h
                </div>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>

            <Separator />

            {/* Weak Areas */}
            {topWeakAreas.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Areas for Improvement
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topWeakAreas.map((area) => (
                    <Badge key={area} variant="outline" className="text-orange-600">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Sessions</h4>
              <div className="space-y-2">
                {previousSessions.slice(0, 3).map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "text-lg w-10 h-10 rounded-full flex items-center justify-center",
                        AI_PERSONALITIES.find(p => p.id === session.personality)?.color
                      )}>
                        {AI_PERSONALITIES.find(p => p.id === session.personality)?.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {AI_PERSONALITIES.find(p => p.id === session.personality)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()} • {session.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline"
                        className={cn(
                          session.comprehensionScore >= 80 ? "text-green-600" :
                          session.comprehensionScore >= 60 ? "text-yellow-600" : "text-red-600"
                        )}
                      >
                        {session.comprehensionScore}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => setShowPerformanceReview(true)}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              View Detailed Performance
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Teaching Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              Start with simple concepts and build complexity gradually
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              Use analogies and real-world examples to explain abstract concepts
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              Check for understanding by asking the AI to summarize
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              Don't be afraid to admit when you need to review something
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Performance Review Dialog */}
      <Dialog open={showPerformanceReview} onOpenChange={setShowPerformanceReview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Review</DialogTitle>
            <DialogDescription>
              Detailed analysis of your teaching sessions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Accuracy</span>
                    <span className="text-2xl font-bold text-green-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Information correctness
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Clarity</span>
                    <span className="text-2xl font-bold text-blue-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Explanation clarity
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completeness</span>
                    <span className="text-2xl font-bold text-purple-600">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Topic coverage
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Improvement</span>
                    <span className="text-2xl font-bold text-orange-600">+12%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Since last session
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personalized Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-yellow-500 mt-0.5" />
                    Try teaching with Dr. Morgan for a greater challenge
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-yellow-500 mt-0.5" />
                    Focus on explaining technical implementations
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-yellow-500 mt-0.5" />
                    Use more visual analogies for complex concepts
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}