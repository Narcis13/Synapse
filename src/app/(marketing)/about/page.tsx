"use client"

import { motion } from "framer-motion"
import { Brain, Target, Users, Award, BookOpen, Lightbulb, Heart, Rocket } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const values = [
  {
    icon: Brain,
    title: "Deep Understanding",
    description: "We believe true learning comes from understanding, not memorization. Our tools help you grasp concepts at their core."
  },
  {
    icon: Users,
    title: "Accessible Education",
    description: "Quality education should be available to everyone. We're committed to making advanced learning tools affordable and easy to use."
  },
  {
    icon: Lightbulb,
    title: "Innovation First",
    description: "We constantly push the boundaries of what's possible with AI to create better learning experiences."
  },
  {
    icon: Heart,
    title: "Learner-Centric",
    description: "Every feature we build starts with one question: How does this help our learners succeed?"
  }
]

const milestones = [
  { year: "2024", event: "Synapse founded with a mission to revolutionize learning" },
  { year: "2024", event: "Launched AI-powered document processing" },
  { year: "2024", event: "Introduced Teach Me mode based on Feynman Technique" },
  { year: "2025", event: "Expanding to support more learning formats and languages" }
]

export default function AboutPage() {
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
            About Synapse
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Empowering learners worldwide with AI-driven education tools that make
            complex concepts simple and learning enjoyable.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <Card className="overflow-hidden">
            <CardHeader className="text-center pb-0">
              <CardTitle className="text-3xl mb-2">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                To democratize learning by making advanced AI tools accessible to everyone,
                helping learners achieve deeper understanding and better retention through
                innovative, science-backed methods.
              </p>
              <div className="flex justify-center gap-4">
                <Target className="w-12 h-12 text-blue-500" />
                <Rocket className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">The Feynman Technique</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Why We Built Teach Me Mode</CardTitle>
                <CardDescription className="text-base">
                  Inspired by Nobel Prize-winning physicist Richard Feynman
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  The Feynman Technique is a powerful learning method that involves explaining
                  concepts in simple terms as if teaching someone else. This process reveals
                  gaps in understanding and solidifies knowledge through active recall.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      Traditional Learning
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• Passive reading and highlighting</li>
                      <li>• Memorization without understanding</li>
                      <li>• Quick forgetting after exams</li>
                      <li>• Surface-level knowledge</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      Feynman Technique
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li>• Active explanation and teaching</li>
                      <li>• Deep conceptual understanding</li>
                      <li>• Long-term retention</li>
                      <li>• Ability to apply knowledge</li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-6">
                  Our Teach Me mode implements this technique by having you explain concepts
                  to an AI student who asks clarifying questions, helping you identify and
                  fill knowledge gaps naturally.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                        <value.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Your Instructor</h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">The Synapse Team</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Founded by educators and technologists passionate about learning
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      We're a small team dedicated to building the best learning tools
                      possible. Our background spans education, AI research, and software
                      engineering, united by a shared belief that learning should be
                      engaging, effective, and accessible to all.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Every feature in Synapse is tested by real learners and refined
                      based on feedback. We're not just building software – we're
                      creating a movement towards better, more effective learning.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="p-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl">
                      <Award className="w-32 h-32 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="flex gap-4 mb-6"
              >
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {milestone.year}
                  </span>
                </div>
                <div className="flex-grow border-l-2 border-gray-300 dark:border-gray-600 pl-4 pb-6">
                  <div className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full -ml-[22px] mt-1.5" />
                  <p className="text-gray-600 dark:text-gray-300 -mt-3">
                    {milestone.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Us on This Journey
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Experience the future of learning with AI-powered tools designed to help
            you truly understand and retain knowledge.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}