"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Eye, 
  MessageSquare,
  Brain,
  ListChecks,
  Sparkles,
  FileText,
  FileAudio,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type DocumentStatus = "uploading" | "uploaded" | "processing" | "completed" | "failed"

interface Document {
  _id: string
  title: string
  fileType: string
  fileSize: number
  status: DocumentStatus
  uploadedAt: number
  processed: boolean
  audioDuration?: number
  error?: string
}

interface DocumentsTableProps {
  documents: Document[]
  onView?: (documentId: string) => void
  onDelete?: (documentId: string) => void
  onChat?: (documentId: string) => void
  onGenerateContent?: (documentId: string, type: "summary" | "quiz" | "flashcards") => void
  isLoading?: boolean
}

const statusConfig: Record<DocumentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  uploading: { 
    label: "Uploading", 
    variant: "secondary", 
    icon: <Loader2 className="h-3 w-3 animate-spin" /> 
  },
  uploaded: { 
    label: "Uploaded", 
    variant: "secondary", 
    icon: <Clock className="h-3 w-3" /> 
  },
  processing: { 
    label: "Processing", 
    variant: "secondary", 
    icon: <Loader2 className="h-3 w-3 animate-spin" /> 
  },
  completed: { 
    label: "Completed", 
    variant: "default", 
    icon: <CheckCircle className="h-3 w-3" /> 
  },
  failed: { 
    label: "Failed", 
    variant: "destructive", 
    icon: <XCircle className="h-3 w-3" /> 
  },
}

export function DocumentsTable({
  documents,
  onView,
  onDelete,
  onChat,
  onGenerateContent,
  isLoading = false,
}: DocumentsTableProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("audio/")) return FileAudio
    return FileText
  }

  const getFileTypeLabel = (fileType: string) => {
    const typeMap: Record<string, string> = {
      "application/pdf": "PDF",
      "text/plain": "TXT",
      "text/markdown": "MD",
      "audio/mpeg": "MP3",
      "audio/wav": "WAV",
      "audio/x-m4a": "M4A",
      "audio/mp4": "M4A",
      "audio/webm": "WebM",
    }
    return typeMap[fileType] || fileType
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No documents yet</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Upload your first document to get started
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => {
            const Icon = getFileIcon(document.fileType)
            const status = statusConfig[document.status]
            
            return (
              <TableRow key={document._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{document.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getFileTypeLabel(document.fileType)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatFileSize(document.fileSize)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {document.audioDuration ? formatDuration(document.audioDuration) : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="gap-1">
                    {status.icon}
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {document.status === "completed" && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => onView?.(document._id)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Document
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => onChat?.(document._id)}
                            className="gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Chat with AI
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => onGenerateContent?.(document._id, "summary")}
                            className="gap-2"
                          >
                            <Sparkles className="h-4 w-4" />
                            Generate Summary
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => onGenerateContent?.(document._id, "quiz")}
                            className="gap-2"
                          >
                            <Brain className="h-4 w-4" />
                            Generate Quiz
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => onGenerateContent?.(document._id, "flashcards")}
                            className="gap-2"
                          >
                            <ListChecks className="h-4 w-4" />
                            Generate Flashcards
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      <DropdownMenuItem 
                        onClick={() => window.open(`/api/documents/${document._id}/download`)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(document._id)}
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}