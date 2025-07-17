"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { QuizInterface } from "@/components/learning/QuizInterface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart,
  RefreshCw,
  ArrowLeft,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface QuizResults {
  totalQuestions: number
  correctAnswers: number
  skippedQuestions: number
  timeSpent: number
  answers: {
    questionId: string
    selectedAnswer: number | null
    isCorrect: boolean
    timeSpent: number
  }[]
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as Id<"documents">
  
  const document = useQuery(api.documents.getDocument, { documentId })
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Mock quiz questions for now - in production, these would come from the document processing
  const mockQuestions = [
    {
      id: "1",
      question: "What is the main purpose of the document?",
      options: [
        "To provide entertainment",
        "To educate about the topic",
        "To sell a product",
        "To share personal stories"
      ],
      correctAnswer: 1,
      explanation: "The document is primarily educational in nature, focusing on teaching concepts.",
      difficulty: "easy" as const
    },
    {
      id: "2",
      question: "Which of the following concepts was discussed in detail?",
      options: [
        "Implementation strategies",
        "Historical context",
        "Future predictions",
        "All of the above"
      ],
      correctAnswer: 3,
      explanation: "The document covers implementation strategies, provides historical context, and discusses future implications.",
      difficulty: "medium" as const
    },
    {
      id: "3",
      question: "What methodology is recommended in the document?",
      options: [
        "Agile development",
        "Waterfall approach",
        "Hybrid methodology",
        "No specific methodology"
      ],
      correctAnswer: 0,
      explanation: "The document specifically recommends using Agile development for better flexibility and iteration.",
      difficulty: "hard" as const
    }
  ]

  const handleQuizComplete = (results: QuizResults) => {
    setQuizResults(results)
    setShowQuiz(false)
    // In production, save results to database
  }

  const calculateScore = () => {
    if (!quizResults) return 0
    return Math.round((quizResults.correctAnswers / quizResults.totalQuestions) * 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent!", variant: "default" as const }
    if (score >= 80) return { text: "Great Job!", variant: "secondary" as const }
    if (score >= 70) return { text: "Good Work", variant: "outline" as const }
    if (score >= 60) return { text: "Keep Practicing", variant: "outline" as const }
    return { text: "Need Review", variant: "destructive" as const }
  }

  if (showQuiz) {
    return (
      <div className="flex-1 p-8">
        <QuizInterface
          questions={mockQuestions}
          documentId={documentId}
          documentTitle={document.title}
          onComplete={handleQuizComplete}
          allowSkip={true}
          instantFeedback={true}
          timeLimit={600} // 10 minutes
        />
      </div>
    )
  }

  if (quizResults) {
    const score = calculateScore()
    const scoreBadge = getScoreBadge(score)
    const avgTimePerQuestion = quizResults.timeSpent / quizResults.totalQuestions

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

        {/* Results Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                <CardDescription>
                  {document.title}
                </CardDescription>
              </div>
              <Trophy className={cn("h-12 w-12", getScoreColor(score))} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className={cn("text-6xl font-bold mb-2", getScoreColor(score))}>
                {score}%
              </div>
              <Badge variant={scoreBadge.variant} className="text-lg px-4 py-1">
                {scoreBadge.text}
              </Badge>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{quizResults.correctAnswers}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">
                  {quizResults.totalQuestions - quizResults.correctAnswers - quizResults.skippedQuestions}
                </p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div>
                <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{quizResults.skippedQuestions}</p>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
              <div>
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-semibold">{Math.round(avgTimePerQuestion)}s</p>
                <p className="text-sm text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
            <CardDescription>Review your answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockQuestions.map((question, index) => {
                const answer = quizResults.answers[index]
                const isCorrect = answer?.isCorrect || false
                const wasSkipped = answer?.selectedAnswer === null

                return (
                  <div key={question.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        isCorrect && "bg-green-100 text-green-700",
                        !isCorrect && !wasSkipped && "bg-red-100 text-red-700",
                        wasSkipped && "bg-orange-100 text-orange-700"
                      )}>
                        {isCorrect && <CheckCircle className="h-5 w-5" />}
                        {!isCorrect && !wasSkipped && <XCircle className="h-5 w-5" />}
                        {wasSkipped && <Target className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">Question {index + 1}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {question.question}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        {question.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(answer?.timeSpent || 0)}s
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={() => setShowQuiz(true)} size="lg" className="flex-1">
            <RefreshCw className="h-5 w-5 mr-2" />
            Retake Quiz
          </Button>
          <Button variant="outline" size="lg" className="flex-1" asChild>
            <Link href={`/learn/${documentId}/flashcards`}>
              <BookOpen className="h-5 w-5 mr-2" />
              Study Flashcards
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Initial quiz start screen
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
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Ready to Test Your Knowledge?</CardTitle>
          <CardDescription className="text-lg mt-2">
            {document.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Quiz Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{mockQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Limit</span>
                  <span className="font-medium">10 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className="font-medium">Mixed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passing Score</span>
                  <span className="font-medium">70%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Instant feedback after each answer
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Pause timer when you need a break
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  Skip questions and return later
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-purple-600" />
                  Retake quiz with new question order
                </li>
              </ul>
            </div>

            <Button 
              size="lg" 
              className="w-full"
              onClick={() => setShowQuiz(true)}
            >
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ')
}