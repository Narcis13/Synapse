"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileUp,
  Brain,
  MessageSquare,
  Headphones,
  BookOpen,
  Cloud,
  Sparkles,
  FileText,
  FileAudio,
  GraduationCap,
  Lightbulb,
  Mic,
  Volume2,
  NotebookPen,
  Target,
  RefreshCw,
  Shield,
  Check,
  X,
  ChevronRight,
  Zap,
  Users,
  Trophy,
} from "lucide-react";

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  preview?: React.ReactNode;
  color: string;
}

interface CompetitorFeature {
  feature: string;
  synapse: boolean;
  competitor1: boolean;
  competitor2: boolean;
  competitor3: boolean;
}

const Features: React.FC = () => {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("features");

  // Helper function for Tailwind color classes
  const getFeatureColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-500/10 text-blue-600",
      purple: "bg-purple-500/10 text-purple-600",
      green: "bg-green-500/10 text-green-600",
      orange: "bg-orange-500/10 text-orange-600",
      indigo: "bg-indigo-500/10 text-indigo-600",
      cyan: "bg-cyan-500/10 text-cyan-600",
    };
    return colorMap[color] || "bg-primary/10 text-primary";
  };

  const features: Feature[] = [
    {
      id: "upload",
      icon: <FileUp className="h-6 w-6" />,
      title: "File Upload & Processing",
      subtitle: "Support for all major formats",
      description: "Upload PDFs, text files, markdown documents, and audio recordings. Our AI instantly processes and understands your content.",
      details: [
        "PDF documents with OCR support",
        "Plain text and markdown files",
        "Audio files (MP3, WAV, M4A)",
        "Automatic content extraction",
        "Smart formatting preservation",
      ],
      preview: (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="flex-1 bg-blue-500/10 rounded-lg p-2">
              <div className="h-2 bg-blue-500/30 rounded w-3/4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FileAudio className="h-8 w-8 text-purple-500" />
            <div className="flex-1 bg-purple-500/10 rounded-lg p-2">
              <div className="h-2 bg-purple-500/30 rounded w-1/2" />
            </div>
          </div>
        </div>
      ),
      color: "blue",
    },
    {
      id: "ai-learning",
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Learning",
      subtitle: "Transform content into knowledge",
      description: "Generate comprehensive summaries, interactive quizzes, and smart flashcards from any uploaded content.",
      details: [
        "Intelligent summarization",
        "Auto-generated quizzes",
        "Smart flashcard creation",
        "Key concept extraction",
        "Difficulty adaptation",
      ],
      preview: (
        <div className="space-y-3">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">AI Summary</span>
            </div>
            <div className="space-y-1">
              <div className="h-2 bg-purple-500/20 rounded w-full" />
              <div className="h-2 bg-purple-500/20 rounded w-4/5" />
              <div className="h-2 bg-purple-500/20 rounded w-3/5" />
            </div>
          </div>
        </div>
      ),
      color: "purple",
    },
    {
      id: "teach-mode",
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Teach Me Mode",
      subtitle: "Learn by teaching",
      description: "Engage in Socratic dialogue with an AI student. Explain concepts and receive thoughtful questions to deepen understanding.",
      details: [
        "Interactive AI student",
        "Socratic method learning",
        "Concept verification",
        "Progressive difficulty",
        "Real-time feedback",
      ],
      preview: (
        <div className="space-y-3">
          <div className="bg-green-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">AI Student</span>
            </div>
            <p className="text-xs text-muted-foreground">
              "Can you explain photosynthesis to me?"
            </p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 ml-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">You</span>
            </div>
            <p className="text-xs text-muted-foreground">
              "Sure! Photosynthesis is..."
            </p>
          </div>
        </div>
      ),
      color: "green",
    },
    {
      id: "audio",
      icon: <Headphones className="h-6 w-6" />,
      title: "Audio Support",
      subtitle: "Listen and learn",
      description: "Upload lectures for transcription or generate voice explanations. Perfect for auditory learners.",
      details: [
        "Lecture transcription",
        "Voice synthesis",
        "Multiple voice options",
        "Speed control",
        "Download audio summaries",
      ],
      preview: (
        <div className="space-y-3">
          <div className="bg-orange-500/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Mic className="h-5 w-5 text-orange-500" />
              <Volume2 className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-orange-500/30 rounded" />
              <div className="h-12 w-1 bg-orange-500/50 rounded" />
              <div className="h-6 w-1 bg-orange-500/30 rounded" />
              <div className="h-10 w-1 bg-orange-500/40 rounded" />
              <div className="h-8 w-1 bg-orange-500/30 rounded" />
              <div className="h-14 w-1 bg-orange-500/60 rounded" />
              <div className="h-6 w-1 bg-orange-500/30 rounded" />
            </div>
          </div>
        </div>
      ),
      color: "orange",
    },
    {
      id: "study-tools",
      icon: <BookOpen className="h-6 w-6" />,
      title: "Study Tools",
      subtitle: "Everything you need to succeed",
      description: "Take notes, highlight important sections, and track your learning progress with comprehensive study tools.",
      details: [
        "Interactive note-taking",
        "Smart highlighting",
        "Progress tracking",
        "Study reminders",
        "Performance analytics",
      ],
      preview: (
        <div className="space-y-3">
          <div className="bg-indigo-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <NotebookPen className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium">Study Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full w-3/4" />
                </div>
                <span className="text-xs text-muted-foreground">75%</span>
              </div>
            </div>
          </div>
        </div>
      ),
      color: "indigo",
    },
    {
      id: "sync",
      icon: <Cloud className="h-6 w-6" />,
      title: "Real-time Sync",
      subtitle: "Access anywhere, anytime",
      description: "Your learning materials and progress sync instantly across all your devices. Never lose your work.",
      details: [
        "Automatic cloud backup",
        "Cross-device sync",
        "Offline access",
        "Version history",
        "Secure encryption",
      ],
      preview: (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-cyan-500 animate-spin" />
            <div className="space-y-1">
              <div className="h-2 w-20 bg-cyan-500/30 rounded" />
              <div className="h-2 w-16 bg-cyan-500/20 rounded" />
            </div>
          </div>
        </div>
      ),
      color: "cyan",
    },
  ];

  const competitorComparison: CompetitorFeature[] = [
    { feature: "AI-powered summaries", synapse: true, competitor1: true, competitor2: false, competitor3: true },
    { feature: "Interactive quizzes", synapse: true, competitor1: true, competitor2: true, competitor3: false },
    { feature: "Teach Me Mode", synapse: true, competitor1: false, competitor2: false, competitor3: false },
    { feature: "Audio transcription", synapse: true, competitor1: false, competitor2: true, competitor3: true },
    { feature: "Voice synthesis", synapse: true, competitor1: false, competitor2: false, competitor3: true },
    { feature: "Smart flashcards", synapse: true, competitor1: true, competitor2: true, competitor3: true },
    { feature: "Real-time sync", synapse: true, competitor1: true, competitor2: true, competitor3: true },
    { feature: "PDF & text support", synapse: true, competitor1: true, competitor2: true, competitor3: true },
    { feature: "Progress tracking", synapse: true, competitor1: false, competitor2: true, competitor3: true },
    { feature: "Unlimited uploads", synapse: true, competitor1: false, competitor2: false, competitor3: true },
  ];

  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const expandAnimation = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemAnimation} className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Master Any Subject
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI-driven tools designed to accelerate your learning journey and help you retain knowledge effectively.
            </p>
          </motion.div>

          {/* Tabs for Features and Comparison */}
          <motion.div variants={itemAnimation}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="comparison">Compare</TabsTrigger>
              </TabsList>

              {/* Features Tab */}
              <TabsContent value="features" className="mt-0">
                <motion.div
                  variants={containerAnimation}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {features.map((feature) => (
                    <motion.div
                      key={feature.id}
                      variants={itemAnimation}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <Card
                        className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/20"
                        onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${getFeatureColorClasses(feature.color)}`}>
                              {feature.icon}
                            </div>
                            <ChevronRight
                              className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                                expandedFeature === feature.id ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                          <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{feature.subtitle}</p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{feature.description}</p>
                          
                          {/* Preview on hover */}
                          <div className="mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {feature.preview}
                          </div>

                          {/* Expandable details */}
                          <AnimatePresence>
                            {expandedFeature === feature.id && (
                              <motion.div {...expandAnimation}>
                                <div className="border-t pt-4 mt-4">
                                  <ul className="space-y-2">
                                    {feature.details.map((detail, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison" className="mt-0">
                <motion.div variants={itemAnimation}>
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="text-2xl">How Synapse Compares</CardTitle>
                      <p className="text-muted-foreground">
                        See why thousands of learners choose Synapse over other platforms
                      </p>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="text-left p-4 font-medium">Features</th>
                              <th className="text-center p-4 min-w-[120px]">
                                <div className="flex flex-col items-center gap-1">
                                  <Trophy className="h-5 w-5 text-primary" />
                                  <span className="font-semibold text-primary">Synapse</span>
                                </div>
                              </th>
                              <th className="text-center p-4 min-w-[120px]">
                                <span className="text-muted-foreground">Competitor A</span>
                              </th>
                              <th className="text-center p-4 min-w-[120px]">
                                <span className="text-muted-foreground">Competitor B</span>
                              </th>
                              <th className="text-center p-4 min-w-[120px]">
                                <span className="text-muted-foreground">Competitor C</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {competitorComparison.map((row, index) => (
                              <motion.tr
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="border-b hover:bg-muted/20 transition-colors"
                              >
                                <td className="p-4 font-medium">{row.feature}</td>
                                <td className="text-center p-4">
                                  {row.synapse ? (
                                    <div className="flex justify-center">
                                      <div className="p-1 rounded-full bg-green-500/10">
                                        <Check className="h-5 w-5 text-green-500" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex justify-center">
                                      <div className="p-1 rounded-full bg-red-500/10">
                                        <X className="h-5 w-5 text-red-500" />
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="text-center p-4">
                                  {row.competitor1 ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                                <td className="text-center p-4">
                                  {row.competitor2 ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                                <td className="text-center p-4">
                                  {row.competitor3 ? (
                                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CTA after comparison */}
                  <motion.div
                    variants={itemAnimation}
                    className="mt-8 text-center"
                  >
                    <p className="text-lg mb-4">
                      Ready to experience the most advanced learning platform?
                    </p>
                    <Button size="lg" className="group">
                      Start Learning Free
                      <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;