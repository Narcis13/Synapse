"use client"

import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight, BookOpen, Brain, Lightbulb, Target, Users, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const blogPosts = [
  {
    slug: "master-any-subject-with-feynman-technique",
    title: "Master Any Subject with the Feynman Technique",
    excerpt: "Learn how Nobel Prize winner Richard Feynman's learning method can transform your understanding of complex topics.",
    category: "Learning Techniques",
    readTime: "5 min read",
    date: "January 15, 2025",
    featured: true,
    icon: Brain,
    tags: ["Feynman Technique", "Active Learning", "Study Tips"]
  },
  {
    slug: "5-ways-ai-is-revolutionizing-education",
    title: "5 Ways AI is Revolutionizing Education",
    excerpt: "Discover how artificial intelligence is creating personalized, efficient, and engaging learning experiences.",
    category: "Product Updates",
    readTime: "7 min read",
    date: "January 12, 2025",
    featured: true,
    icon: Zap,
    tags: ["AI", "EdTech", "Innovation"]
  },
  {
    slug: "from-passive-to-active-learning",
    title: "From Passive to Active: Transform Your Study Habits",
    excerpt: "Stop highlighting and start engaging. Learn proven techniques to make your study sessions more effective.",
    category: "Study Tips",
    readTime: "6 min read",
    date: "January 10, 2025",
    icon: Target,
    tags: ["Study Habits", "Active Learning", "Productivity"]
  },
  {
    slug: "case-study-medical-student-success",
    title: "Case Study: How a Medical Student Improved Retention by 300%",
    excerpt: "Real results from a medical student who used Synapse to prepare for board exams.",
    category: "Case Studies",
    readTime: "8 min read",
    date: "January 8, 2025",
    icon: Users,
    tags: ["Case Study", "Medical", "Success Story"]
  },
  {
    slug: "science-of-spaced-repetition",
    title: "The Science Behind Spaced Repetition",
    excerpt: "Understanding the psychological principles that make spaced repetition the most effective memorization technique.",
    category: "Learning Science",
    readTime: "10 min read",
    date: "January 5, 2025",
    icon: BookOpen,
    tags: ["Memory", "Psychology", "Learning Science"]
  },
  {
    slug: "audio-learning-benefits",
    title: "Why Audio Learning Works: The Multisensory Advantage",
    excerpt: "Explore how combining visual and auditory learning can boost comprehension and retention.",
    category: "Learning Techniques",
    readTime: "6 min read",
    date: "January 3, 2025",
    icon: Lightbulb,
    tags: ["Audio Learning", "Multisensory", "Research"]
  }
]

const categories = [
  { name: "All Posts", count: blogPosts.length },
  { name: "Learning Techniques", count: 2 },
  { name: "Product Updates", count: 1 },
  { name: "Case Studies", count: 1 },
  { name: "Study Tips", count: 1 },
  { name: "Learning Science", count: 1 }
]

export default function BlogPage() {
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
            Synapse Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tips, insights, and updates to help you learn smarter, not harder
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`hover:shadow-xl transition-shadow duration-300 ${post.featured ? 'border-blue-500' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                            <post.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              {post.category}
                            </Badge>
                            {post.featured && (
                              <Badge className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-2xl mb-2 hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`} className="flex items-center gap-1">
                            Read More
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.article>
              ))}
            </div>

            <aside className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {categories.map((category) => (
                        <li key={category.name}>
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex justify-between items-center">
                            <span>{category.name}</span>
                            <Badge variant="secondary">{category.count}</Badge>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle>Subscribe to Updates</CardTitle>
                    <CardDescription>
                      Get the latest learning tips and product updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      />
                      <Button className="w-full">Subscribe</Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {["AI Learning", "Study Techniques", "Memory Science", "Productivity", "EdTech", "Case Studies", "Tips & Tricks"].map((topic) => (
                        <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </aside>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands who are already learning smarter with Synapse
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Start Learning Today</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  )
}