"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Clock, 
  Brain, 
  Sparkles, 
  TrendingUp,
  Plus,
  BookOpen,
  Users
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const user = useQuery(api.users.getCurrentUser)
  const recentDocuments = useQuery(api.documents.getRecentDocuments)

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const stats = [
    {
      title: "Documents",
      value: user.subscription.documentsUsed,
      total: user.subscription.documentsLimit,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Audio Minutes",
      value: user.subscription.audioMinutesUsed,
      total: user.subscription.audioMinutesLimit,
      icon: Clock,
      color: "text-green-500",
    },
    {
      title: "Study Sessions",
      value: "12",
      total: "∞",
      icon: Brain,
      color: "text-purple-500",
    },
    {
      title: "AI Interactions",
      value: "48",
      total: user.subscription.tier === "free" ? "100" : "∞",
      icon: Sparkles,
      color: "text-yellow-500",
    },
  ]

  const quickActions = [
    {
      title: "Upload Document",
      description: "Add a new document to start learning",
      icon: Plus,
      href: "/documents/new",
      color: "bg-blue-500",
    },
    {
      title: "Start Study Session",
      description: "Continue where you left off",
      icon: BookOpen,
      href: "/study",
      color: "bg-green-500",
    },
    {
      title: "Teach Mode",
      description: "Explain concepts to AI student",
      icon: Users,
      href: "/teach",
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user.name ? `, ${user.name}` : ""}! 
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your learning progress and manage your documents
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const percentage = stat.total === "∞" ? 0 : (stat.value / parseInt(stat.total)) * 100
          
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{stat.total}
                  </span>
                </div>
                {stat.total !== "∞" && (
                  <Progress value={percentage} className="mt-2 h-1" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            
            return (
              <Card key={action.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4", action.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={action.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Documents</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/documents">View All</Link>
          </Button>
        </div>
        
        {recentDocuments && recentDocuments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentDocuments.slice(0, 6).map((doc) => (
              <Card key={doc._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base line-clamp-1">
                        {doc.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(doc._creationTime).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/learn/${doc._id}`}>Learn</Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/documents/${doc._id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No documents yet. Upload your first document to get started!
              </p>
              <Button asChild>
                <Link href="/documents/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Learning Progress */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Learning Progress</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>This Week's Activity</CardTitle>
                <CardDescription>Keep up the great work!</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Study Time</span>
                  <span className="font-medium">3h 45m</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Documents Reviewed</span>
                  <span className="font-medium">8/10</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Quiz Score Average</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA for Free Users */}
      {user.subscription.tier === "free" && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Unlock Your Full Learning Potential</CardTitle>
            <CardDescription className="text-white/90">
              Upgrade to Pro for unlimited documents, audio transcription, and advanced AI features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/settings/billing">
                Upgrade to Pro - $12.99/month
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ')
}