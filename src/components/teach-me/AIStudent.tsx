"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type StudentPersonality = "curious" | "analytical" | "creative" | "practical"
export type StudentMood = "confused" | "interested" | "excited" | "thoughtful"

interface AIStudentProps {
  name?: string
  personality?: StudentPersonality
  mood?: StudentMood
  className?: string
}

const personalityTraits = {
  curious: {
    description: "Always asking questions",
    color: "text-purple-500",
    bgColor: "bg-purple-500"
  },
  analytical: {
    description: "Loves breaking things down",
    color: "text-blue-500",
    bgColor: "bg-blue-500"
  },
  creative: {
    description: "Thinks outside the box",
    color: "text-pink-500",
    bgColor: "bg-pink-500"
  },
  practical: {
    description: "Focused on real applications",
    color: "text-green-500",
    bgColor: "bg-green-500"
  }
}

const moodIndicators = {
  confused: "🤔",
  interested: "🧐",
  excited: "🤩",
  thoughtful: "💭"
}

export function AIStudent({ 
  name = "Alex", 
  personality = "curious",
  mood = "interested",
  className 
}: AIStudentProps) {
  const trait = personalityTraits[personality]
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src="/avatars/ai-student.png" />
          <AvatarFallback className={cn("text-white", trait.bgColor)}>
            {name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-1 -right-1 text-lg">
          {moodIndicators[mood]}
        </span>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{name}</h3>
          <Badge variant="outline" className="text-xs gap-1">
            <Brain className={cn("h-3 w-3", trait.color)} />
            {personality}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{trait.description}</p>
      </div>
      
      <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
    </div>
  )
}