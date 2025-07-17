"use client"

import { useState, useEffect, useCallback } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  Pause, 
  Play, 
  SkipForward, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  BookOpen,
  AlertCircle,
  Trophy,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
}

interface QuizInterfaceProps {
  questions: QuizQuestion[]
  documentId: string
  documentTitle: string
  onComplete: (results: QuizResults) => void
  allowSkip?: boolean
  instantFeedback?: boolean
  timeLimit?: number // in seconds
}

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

export function QuizInterface({
  questions,
  documentId,
  documentTitle,
  onComplete,
  allowSkip = true,
  instantFeedback = true,
  timeLimit = 1800 // 30 minutes default
}: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Map<string, { answer: number | null, timeSpent: number, isCorrect: boolean }>>(new Map())
  const [showFeedback, setShowFeedback] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [quizStartTime] = useState(Date.now())
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set())

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const hasSkippedQuestions = skippedQuestions.size > 0

  // Timer effect
  useEffect(() => {
    if (isTimerPaused || isReviewMode) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerPaused, isReviewMode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answer: number) => {
    setSelectedAnswer(answer)
    
    if (instantFeedback && !isReviewMode) {
      const isCorrect = answer === currentQuestion.correctAnswer
      const timeSpent = (Date.now() - questionStartTime) / 1000
      
      answers.set(currentQuestion.id, {
        answer,
        timeSpent,
        isCorrect
      })
      setAnswers(new Map(answers))
      setShowFeedback(true)
    }
  }

  const handleNextQuestion = () => {
    if (!instantFeedback && selectedAnswer !== null && !isReviewMode) {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer
      const timeSpent = (Date.now() - questionStartTime) / 1000
      
      answers.set(currentQuestion.id, {
        answer: selectedAnswer,
        timeSpent,
        isCorrect
      })
      setAnswers(new Map(answers))
    }

    // Remove from skipped if it was answered
    if (selectedAnswer !== null) {
      skippedQuestions.delete(currentQuestion.id)
      setSkippedQuestions(new Set(skippedQuestions))
    }

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setQuestionStartTime(Date.now())
    } else if (hasSkippedQuestions && !isReviewMode) {
      // Go back to first skipped question
      const firstSkippedIndex = questions.findIndex(q => skippedQuestions.has(q.id))
      if (firstSkippedIndex !== -1) {
        setCurrentQuestionIndex(firstSkippedIndex)
        setSelectedAnswer(null)
        setShowFeedback(false)
        setQuestionStartTime(Date.now())
      }
    }
  }

  const handleSkipQuestion = () => {
    if (!allowSkip || isReviewMode) return

    skippedQuestions.add(currentQuestion.id)
    setSkippedQuestions(new Set(skippedQuestions))
    
    handleNextQuestion()
  }

  const handleSubmitQuiz = () => {
    const totalTimeSpent = (Date.now() - quizStartTime) / 1000

    // Add any unanswered questions
    questions.forEach(question => {
      if (!answers.has(question.id) && !skippedQuestions.has(question.id)) {
        answers.set(question.id, {
          answer: null,
          timeSpent: 0,
          isCorrect: false
        })
      }
    })

    const results: QuizResults = {
      totalQuestions: questions.length,
      correctAnswers: Array.from(answers.values()).filter(a => a.isCorrect).length,
      skippedQuestions: skippedQuestions.size,
      timeSpent: totalTimeSpent,
      answers: questions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers.get(q.id)?.answer ?? null,
        isCorrect: answers.get(q.id)?.isCorrect ?? false,
        timeSpent: answers.get(q.id)?.timeSpent ?? 0
      }))
    }

    onComplete(results)
  }

  const handleReviewMistakes = () => {
    setIsReviewMode(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswers(new Map())
    setShowFeedback(false)
    setIsReviewMode(false)
    setSkippedQuestions(new Set())
    setTimeRemaining(timeLimit)
    setQuestionStartTime(Date.now())
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600"
      case "medium": return "text-yellow-600"
      case "hard": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{documentTitle} - Quiz</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardDescription>
            </div>
            
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className={cn(
                "h-5 w-5",
                timeRemaining < 300 ? "text-red-500" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-lg font-mono",
                timeRemaining < 300 && "text-red-500"
              )}>
                {formatTime(timeRemaining)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                disabled={isReviewMode}
              >
                {isTimerPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
                {isReviewMode && (
                  <Badge variant="secondary">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Review Mode
                  </Badge>
                )}
                {skippedQuestions.has(currentQuestion.id) && (
                  <Badge variant="outline" className="text-orange-600">
                    Skipped
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Answer Options */}
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            disabled={isReviewMode && !answers.has(currentQuestion.id)}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showResult = (showFeedback || isReviewMode) && 
                  (isSelected || (isReviewMode && isCorrect))

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center space-x-2 p-3 rounded-lg border transition-colors",
                      showResult && isCorrect && "bg-green-50 border-green-500",
                      showResult && isSelected && !isCorrect && "bg-red-50 border-red-500",
                      !showResult && isSelected && "bg-primary/10 border-primary"
                    )}
                  >
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer flex items-center justify-between"
                    >
                      <span>{option}</span>
                      {showResult && (
                        <span>
                          {isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                        </span>
                      )}
                    </Label>
                  </div>
                )
              })}
            </div>
          </RadioGroup>

          {/* Feedback */}
          {(showFeedback || (isReviewMode && answers.has(currentQuestion.id))) && currentQuestion.explanation && (
            <>
              <Separator />
              <Alert className={selectedAnswer === currentQuestion.correctAnswer ? "border-green-500" : "border-orange-500"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {allowSkip && !isReviewMode && !showFeedback && (
                <Button
                  variant="outline"
                  onClick={handleSkipQuestion}
                  disabled={isLastQuestion && !hasSkippedQuestions}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {!isLastQuestion || hasSkippedQuestions ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!instantFeedback && selectedAnswer === null && !isReviewMode}
                >
                  {showFeedback || isReviewMode ? "Next Question" : "Submit & Next"}
                </Button>
              ) : (
                <>
                  {!isReviewMode && (
                    <Button onClick={handleSubmitQuiz} variant="default">
                      <Trophy className="h-4 w-4 mr-2" />
                      Finish Quiz
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Options (shown after quiz completion) */}
      {isReviewMode && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Review Complete</p>
                <p className="text-sm text-muted-foreground">
                  You scored {Array.from(answers.values()).filter(a => a.isCorrect).length} out of {questions.length}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReviewMistakes}>
                  <Target className="h-4 w-4 mr-2" />
                  Review Mistakes
                </Button>
                <Button onClick={handleRetakeQuiz}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer Paused Alert */}
      {isTimerPaused && !isReviewMode && (
        <Alert>
          <Pause className="h-4 w-4" />
          <AlertDescription>
            Timer is paused. Click the play button to resume.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}