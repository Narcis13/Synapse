"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  RotateCcw,
  Brain,
  Zap,
  Target,
  Trophy,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Shuffle,
  Play,
  Pause,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, useAnimation, PanInfo } from "framer-motion"

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: number // 1-5 scale
  lastReviewed?: number
  nextReview?: number
  reviewCount: number
  audioUrl?: string
  category?: string
}

interface FlashcardDeckProps {
  flashcards: Flashcard[]
  documentId: string
  documentTitle: string
  onProgress?: (progress: FlashcardProgress) => void
  enableAudio?: boolean
  enableSpacedRepetition?: boolean
}

interface FlashcardProgress {
  totalCards: number
  reviewedCards: number
  masteredCards: number
  difficultCards: number
  averageDifficulty: number
  studyTime: number
}

const SWIPE_THRESHOLD = 100
const ROTATION_THRESHOLD = 15

export function FlashcardDeck({
  flashcards: initialFlashcards,
  documentId,
  documentTitle,
  onProgress,
  enableAudio = true,
  enableSpacedRepetition = true
}: FlashcardDeckProps) {
  const [flashcards, setFlashcards] = useState(initialFlashcards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set())
  const [difficultyRatings, setDifficultyRatings] = useState<Map<string, number>>(new Map())
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [studyStartTime] = useState(Date.now())
  const [isShuffled, setIsShuffled] = useState(false)
  
  const controls = useAnimation()
  const currentCard = flashcards[currentIndex]
  const progress = (reviewedCards.size / flashcards.length) * 100

  // Calculate statistics
  const stats = {
    mastered: Array.from(difficultyRatings.values()).filter(d => d <= 2).length,
    difficult: Array.from(difficultyRatings.values()).filter(d => d >= 4).length,
    averageDifficulty: difficultyRatings.size > 0 
      ? Array.from(difficultyRatings.values()).reduce((a, b) => a + b, 0) / difficultyRatings.size 
      : 0
  }

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && !isFlipped) {
      const timer = setTimeout(() => {
        setIsFlipped(true)
      }, 3000)
      return () => clearTimeout(timer)
    } else if (isAutoPlay && isFlipped) {
      const timer = setTimeout(() => {
        handleNext()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isAutoPlay, isFlipped, currentIndex])

  // Spaced repetition algorithm
  const calculateNextReview = (difficulty: number, reviewCount: number) => {
    if (!enableSpacedRepetition) return null
    
    const intervals = [1, 3, 7, 14, 30, 90] // days
    const adjustedInterval = Math.max(0, 5 - difficulty) // Easy cards reviewed less frequently
    const intervalIndex = Math.min(reviewCount + adjustedInterval, intervals.length - 1)
    
    return Date.now() + (intervals[intervalIndex] * 24 * 60 * 60 * 1000)
  }

  const handleSwipe = async (info: PanInfo) => {
    const { offset, velocity } = info
    
    if (Math.abs(offset.x) > SWIPE_THRESHOLD || Math.abs(velocity.x) > 500) {
      if (offset.x > 0) {
        // Swiped right - easy
        await handleDifficultyRating(2)
        handleNext()
      } else {
        // Swiped left - hard
        await handleDifficultyRating(4)
        handleNext()
      }
    } else {
      // Spring back to center
      controls.start({ x: 0, rotate: 0, transition: { type: "spring" } })
    }
  }

  const handleDrag = (event: any, info: PanInfo) => {
    const { offset } = info
    const rotation = offset.x * 0.1
    controls.set({ x: offset.x, rotate: rotation })
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      controls.set({ x: 0, rotate: 0 })
    } else if (reviewedCards.size < flashcards.length) {
      // Loop back to unreviewed cards
      const nextUnreviewed = flashcards.findIndex(
        (card, idx) => !reviewedCards.has(card.id) && idx !== currentIndex
      )
      if (nextUnreviewed !== -1) {
        setCurrentIndex(nextUnreviewed)
        setIsFlipped(false)
        controls.set({ x: 0, rotate: 0 })
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      controls.set({ x: 0, rotate: 0 })
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!reviewedCards.has(currentCard.id)) {
      setReviewedCards(new Set([...reviewedCards, currentCard.id]))
    }
  }

  const handleDifficultyRating = async (rating: number) => {
    difficultyRatings.set(currentCard.id, rating)
    setDifficultyRatings(new Map(difficultyRatings))
    
    // Update card with spaced repetition data
    if (enableSpacedRepetition) {
      const updatedCard = {
        ...currentCard,
        difficulty: rating,
        lastReviewed: Date.now(),
        nextReview: calculateNextReview(rating, currentCard.reviewCount),
        reviewCount: currentCard.reviewCount + 1
      }
      
      const updatedCards = [...flashcards]
      updatedCards[currentIndex] = updatedCard
      setFlashcards(updatedCards)
      
      // In production, save to database
    }
  }

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setFlashcards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsShuffled(true)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setReviewedCards(new Set())
    setDifficultyRatings(new Map())
    setIsAutoPlay(false)
    if (isShuffled) {
      setFlashcards(initialFlashcards)
      setIsShuffled(false)
    }
  }

  const playAudio = () => {
    if (currentCard.audioUrl && enableAudio) {
      const audio = new Audio(currentCard.audioUrl)
      audio.play()
    }
  }

  const getDifficultyColor = (rating: number) => {
    if (rating <= 2) return "text-green-600"
    if (rating === 3) return "text-yellow-600"
    return "text-red-600"
  }

  // Send progress updates
  useEffect(() => {
    if (onProgress) {
      onProgress({
        totalCards: flashcards.length,
        reviewedCards: reviewedCards.size,
        masteredCards: stats.mastered,
        difficultCards: stats.difficult,
        averageDifficulty: stats.averageDifficulty,
        studyTime: (Date.now() - studyStartTime) / 1000
      })
    }
  }, [reviewedCards, difficultyRatings])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{documentTitle}</h2>
              <p className="text-muted-foreground">
                Card {currentIndex + 1} of {flashcards.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Brain className="h-3 w-3" />
                {reviewedCards.size} reviewed
              </Badge>
              {stats.mastered > 0 && (
                <Badge variant="secondary" className="gap-1 text-green-600">
                  <Trophy className="h-3 w-3" />
                  {stats.mastered} mastered
                </Badge>
              )}
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleShuffle}
                disabled={isAutoPlay}
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                {isAutoPlay ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Auto-play
                  </>
                )}
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <div className="relative h-96 perspective-1000">
        <motion.div
          drag="x"
          dragConstraints={{ left: -300, right: 300 }}
          onDrag={handleDrag}
          onDragEnd={(e, info) => handleSwipe(info)}
          animate={controls}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Card 
            className={cn(
              "absolute inset-0 w-full h-full cursor-pointer transition-all duration-500",
              "hover:shadow-xl",
              isFlipped && "rotate-y-180"
            )}
            onClick={handleFlip}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front of card */}
            <CardContent className="absolute inset-0 backface-hidden p-8 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                {currentCard.category && (
                  <Badge variant="outline" className="mb-2">
                    {currentCard.category}
                  </Badge>
                )}
                <h3 className="text-2xl font-semibold">{currentCard.front}</h3>
                {enableAudio && currentCard.audioUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      playAudio()
                    }}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="absolute bottom-4 text-sm text-muted-foreground">
                Click to flip
              </div>
            </CardContent>

            {/* Back of card */}
            <CardContent 
              className="absolute inset-0 rotate-y-180 backface-hidden p-8 flex flex-col items-center justify-center"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="text-center space-y-4 mb-8">
                <h3 className="text-xl font-medium text-muted-foreground">Answer</h3>
                <p className="text-lg">{currentCard.back}</p>
              </div>

              {/* Difficulty Rating */}
              {isFlipped && (
                <div className="space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    How difficult was this card?
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        size="sm"
                        variant={difficultyRatings.get(currentCard.id) === rating ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDifficultyRating(rating)
                        }}
                        className={cn(
                          "w-12",
                          difficultyRatings.get(currentCard.id) === rating && getDifficultyColor(rating)
                        )}
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Easy</span>
                    <span>Hard</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Swipe Indicators */}
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
          <div className="bg-green-500/20 rounded-r-lg p-4">
            <ThumbsUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
          <div className="bg-red-500/20 rounded-l-lg p-4">
            <ThumbsDown className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              {enableSpacedRepetition && currentCard.nextReview && (
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Next review: {new Date(currentCard.nextReview).toLocaleDateString()}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1 && reviewedCards.size === flashcards.length}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {reviewedCards.size === flashcards.length && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Trophy className="h-12 w-12 mx-auto" />
              <h3 className="text-2xl font-bold">Deck Complete!</h3>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-3xl font-bold">{stats.mastered}</p>
                  <p className="text-sm opacity-90">Mastered</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{stats.difficult}</p>
                  <p className="text-sm opacity-90">Need Practice</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {Math.round((Date.now() - studyStartTime) / 60000)}m
                  </p>
                  <p className="text-sm opacity-90">Study Time</p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleReset}
                className="mt-4"
              >
                Study Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper CSS class for 3D transforms
const style = `
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
`

if (typeof document !== "undefined") {
  const styleElement = document.createElement("style")
  styleElement.textContent = style
  document.head.appendChild(styleElement)
}