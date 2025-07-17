"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Plus, 
  Search,
  Clock,
  FileAudio,
  Trash2,
  Download,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"

export default function DocumentsPage() {
  const user = useQuery(api.users.getCurrentUser)
  const documents = useQuery(api.documents.getRecentDocuments)
  const [searchQuery, setSearchQuery] = useState("")

  if (!user || !documents) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB'
    else return Math.round(bytes / 1048576) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('audio/')) {
      return <FileAudio className="h-5 w-5" />
    }
    return <FileText className="h-5 w-5" />
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-2">
            Manage your learning materials
          </p>
        </div>
        <Button asChild>
          <Link href="/documents/new">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getFileIcon(doc.fileType)}
                      <span className="text-xs text-muted-foreground uppercase">
                        {doc.fileType.split('/')[1]}
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(doc._creationTime), { addSuffix: true })}
                        </span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/learn/${doc._id}`}>
                      <BookOpen className="mr-2 h-3 w-3" />
                      Learn
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Status Badge */}
                <div className="mt-3">
                  {doc.status === "completed" ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      Ready
                    </span>
                  ) : doc.status === "processing" ? (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      Processing
                    </span>
                  ) : doc.status === "failed" ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                      Failed
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      Uploading
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery ? 
                "No documents found matching your search." : 
                "No documents yet. Upload your first document to get started!"
              }
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/documents/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Warning for Free Users */}
      {user.subscription.tier === "free" && user.subscription.documentsUsed >= user.subscription.documentsLimit * 0.8 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Approaching Document Limit</CardTitle>
            <CardDescription className="text-orange-700">
              You've used {user.subscription.documentsUsed} of {user.subscription.documentsLimit} documents in your free plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" asChild>
              <Link href="/settings/billing">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}