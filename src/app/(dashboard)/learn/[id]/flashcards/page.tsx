"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { FlashcardDeck } from "@/components/learning/FlashcardDeck"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Brain,
  Zap,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface FlashcardProgress {
  totalCards: number
  reviewedCards: number
  masteredCards: number
  difficultCards: number
  averageDifficulty: number
  studyTime: number
}

export default function FlashcardsPage() {
  const params = useParams()
  const router = useRouter()
  const documentId = params.id as Id<"documents">
  
  const document = useQuery(api.documents.getDocument, { documentId })
  const [progress, setProgress] = useState<FlashcardProgress | null>(null)
  const [showFlashcards, setShowFlashcards] = useState(false)

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Mock flashcards for now - in production, these would come from the document processing
  const mockFlashcards = [
    {
      id: "1",
      front: "What is the primary benefit of using TypeScript?",
      back: "TypeScript provides static type checking, which helps catch errors at compile time rather than runtime, improving code reliability and developer productivity.",
      difficulty: 3,
      lastReviewed: Date.now() - 86400000, // 1 day ago
      nextReview: Date.now() + 259200000, // 3 days from now
      reviewCount: 2,
      category: "TypeScript Basics"
    },
    {
      id: "2",
      front: "Explain the concept of 'type inference' in TypeScript",
      back: "Type inference is TypeScript's ability to automatically determine the type of a variable based on its initial value, without explicitly declaring the type.",
      difficulty: 2,
      lastReviewed: Date.now() - 172800000, // 2 days ago
      nextReview: Date.now() + 604800000, // 7 days from now
      reviewCount: 3,
      category: "TypeScript Features"
    },
    {
      id: "3",
      front: "What are generics in TypeScript?",
      back: "Generics allow you to create reusable components that work with multiple types while maintaining type safety. They act as type variables that can be specified when the component is used.",
      difficulty: 4,
      lastReviewed: Date.now() - 259200000, // 3 days ago
      nextReview: Date.now() + 86400000, // 1 day from now
      reviewCount: 1,
      category: "Advanced TypeScript"
    },
    {
      id: "4",
      front: "What is the difference between 'interface' and 'type' in TypeScript?",
      back: "Interfaces are used to define object shapes and can be extended/implemented. Types are more flexible and can represent any type including unions, intersections, and primitives.",
      difficulty: 3,
      lastReviewed: undefined,
      nextReview: undefined,
      reviewCount: 0,
      category: "TypeScript Basics"
    },
    {
      id: "5",
      front: "Explain the 'readonly' modifier in TypeScript",
      back: "The readonly modifier makes a property immutable after initialization. It prevents reassignment of the property, helping to create more predictable and maintainable code.",
      difficulty: 2,
      lastReviewed: undefined,
      nextReview: undefined,
      reviewCount: 0,
      category: "TypeScript Modifiers"
    }
  ]

  const handleProgress = (newProgress: FlashcardProgress) => {
    setProgress(newProgress)
  }

  const getStudyStreakDays = () => {
    // Mock calculation - in production, this would check actual study history
    return 5
  }

  if (showFlashcards) {
    return (
      <div className="flex-1 p-8">
        <Button
          variant="ghost"
          onClick={() => setShowFlashcards(false)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>

        <FlashcardDeck
          flashcards={mockFlashcards}
          documentId={documentId}
          documentTitle={document.title}
          onProgress={handleProgress}
          enableAudio={true}
          enableSpacedRepetition={true}
        />
      </div>
    )
  }

  // Overview screen
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
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Flashcard Study Session</CardTitle>
          <CardDescription className="text-lg mt-2">
            {document.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{mockFlashcards.length}</p>
              <p className="text-sm text-muted-foreground">Total Cards</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-green-600">{getStudyStreakDays()}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full"
            onClick={() => setShowFlashcards(true)}
          >
            <Zap className="mr-2 h-5 w-5" />
            Start Study Session
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Spaced Repetition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cards are scheduled based on your performance. Easy cards appear less frequently, while difficult ones are reviewed more often.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Adaptive Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Rate each card's difficulty to personalize your learning experience and focus on areas that need improvement.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Study Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Progress
          </CardTitle>
          <CardDescription>
            Track your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Cards Due Today</span>
                <span className="font-medium">
                  {mockFlashcards.filter(card => 
                    card.nextReview && card.nextReview <= Date.now() + 86400000
                  ).length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ 
                    width: `${(mockFlashcards.filter(card => 
                      card.nextReview && card.nextReview <= Date.now() + 86400000
                    ).length / mockFlashcards.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">New Cards</span>
                <span className="font-medium">
                  {mockFlashcards.filter(card => card.reviewCount === 0).length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ 
                    width: `${(mockFlashcards.filter(card => card.reviewCount === 0).length / mockFlashcards.length) * 100}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Mastered Cards</span>
                <span className="font-medium">
                  {mockFlashcards.filter(card => card.difficulty <= 2 && card.reviewCount > 0).length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ 
                    width: `${(mockFlashcards.filter(card => card.difficulty <= 2 && card.reviewCount > 0).length / mockFlashcards.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Study Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Swipe right or rate 1-2 for cards you find easy
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Swipe left or rate 4-5 for cards that need more practice
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Use auto-play mode for a hands-free study session
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Review cards daily to maintain your streak
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Alternative Actions */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/learn/${documentId}/quiz`}>
            <BookOpen className="mr-2 h-4 w-4" />
            Take Quiz Instead
          </Link>
        </Button>
      </div>
    </div>
  )
}