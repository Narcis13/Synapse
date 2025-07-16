"use client"

import { motion } from "framer-motion"
import { CheckCircle, FileText, Mic, MessageSquare, Brain, Users, Sparkles, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const features = [
  {
    title: "Smart Document Processing",
    description: "Upload PDFs, text files, or audio recordings and let AI extract key insights instantly",
    icon: FileText,
    demo: {
      type: "upload",
      formats: ["PDF", "TXT", "MD", "MP3", "WAV"]
    },
    benefits: [
      "Extract key concepts automatically",
      "Generate structured summaries",
      "Support for multiple file formats",
      "Audio transcription included"
    ]
  },
  {
    title: "Interactive Learning Tools",
    description: "Transform your content into engaging quizzes, flashcards, and study guides",
    icon: Brain,
    demo: {
      type: "interactive",
      tools: ["Quizzes", "Flashcards", "Mind Maps", "Study Guides"]
    },
    benefits: [
      "Auto-generated quiz questions",
      "Spaced repetition flashcards",
      "Visual mind maps",
      "Personalized study plans"
    ]
  },
  {
    title: "AI-Powered Chat",
    description: "Ask questions about your materials and get instant, contextual answers",
    icon: MessageSquare,
    demo: {
      type: "chat",
      examples: [
        "Explain this concept in simpler terms",
        "Give me a real-world example",
        "How does this relate to..."
      ]
    },
    benefits: [
      "Context-aware responses",
      "Deep understanding of your materials",
      "Available 24/7",
      "No question limits"
    ]
  },
  {
    title: "Teach Me Mode",
    description: "Master concepts by teaching them to an AI student using the Feynman Technique",
    icon: Users,
    demo: {
      type: "teach",
      interaction: "Socratic dialogue"
    },
    benefits: [
      "Active learning through teaching",
      "Identify knowledge gaps",
      "Build deeper understanding",
      "Boost retention rates"
    ]
  },
  {
    title: "Voice Learning",
    description: "Learn on the go with audio summaries and voice interactions",
    icon: Mic,
    demo: {
      type: "audio",
      features: ["Text-to-Speech", "Voice Commands", "Audio Notes"]
    },
    benefits: [
      "Natural voice synthesis",
      "Hands-free learning",
      "Perfect for commutes",
      "Multiple voice options"
    ]
  },
  {
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics and insights",
    icon: Zap,
    demo: {
      type: "analytics",
      metrics: ["Study Time", "Quiz Scores", "Retention Rate", "Progress"]
    },
    benefits: [
      "Visual progress charts",
      "Learning streak tracking",
      "Performance insights",
      "Goal setting tools"
    ]
  }
]

const useCases = [
  {
    title: "Students",
    scenario: "Ace your exams by turning lecture notes into interactive study materials",
    features: ["Quiz generation", "Flashcards", "Study guides", "Progress tracking"]
  },
  {
    title: "Professionals",
    scenario: "Master new skills and certifications with AI-powered learning tools",
    features: ["Document analysis", "Quick summaries", "Voice learning", "Time-efficient studying"]
  },
  {
    title: "Researchers",
    scenario: "Analyze papers and extract insights faster than ever before",
    features: ["PDF processing", "Key concept extraction", "Citation management", "Knowledge graphs"]
  },
  {
    title: "Lifelong Learners",
    scenario: "Turn any content into a personalized learning experience",
    features: ["Multiple formats", "Teach Me mode", "Self-paced learning", "Retention tools"]
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black">
      <section className="container px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Powerful Features for Modern Learning
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Discover how Synapse transforms the way you learn with AI-powered tools
            designed to maximize understanding and retention.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              {useCases.map((useCase, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  {useCase.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {useCases.map((useCase, index) => (
              <TabsContent key={index} value={index.toString()}>
                <Card>
                  <CardHeader>
                    <CardTitle>{useCase.scenario}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {useCase.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already experiencing the power of AI-enhanced education.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}