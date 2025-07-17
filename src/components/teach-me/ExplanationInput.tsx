"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, Mic, MicOff, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExplanationInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  placeholder?: string
  showSuggestions?: boolean
  className?: string
}

const suggestions = [
  "Start with a simple definition",
  "Use an everyday example",
  "Break it down step by step",
  "Relate it to something familiar"
]

export function ExplanationInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = "Explain the concept to your AI student...",
  showSuggestions = true,
  className
}: ExplanationInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  useEffect(() => {
    setCharCount(value.length)
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement actual recording functionality
  }

  const insertSuggestion = (suggestion: string) => {
    const newValue = value ? `${value} ${suggestion}` : suggestion
    onChange(newValue)
    textareaRef.current?.focus()
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-3">
        {showSuggestions && value.length < 50 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Try:</span>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => insertSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[120px] pr-12 resize-none"
            disabled={isLoading}
          />
          
          <Button
            onClick={toggleRecording}
            size="icon"
            variant="ghost"
            className="absolute bottom-2 right-2"
            disabled={isLoading}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{charCount} characters</span>
            <span>Press Enter to send</span>
          </div>
          
          <Button
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            size="sm"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send Explanation
          </Button>
        </div>
      </div>
    </Card>
  )
}