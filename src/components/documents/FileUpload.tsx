"use client"

import { useState, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Upload, File, FileAudio, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  maxSizeInMB: number
  isUploading?: boolean
  uploadProgress?: number
  className?: string
}

const ALLOWED_FILE_TYPES = {
  "application/pdf": { ext: ".pdf", icon: FileText },
  "text/plain": { ext: ".txt", icon: FileText },
  "text/markdown": { ext: ".md", icon: FileText },
  "audio/mpeg": { ext: ".mp3", icon: FileAudio },
  "audio/wav": { ext: ".wav", icon: FileAudio },
  "audio/x-m4a": { ext: ".m4a", icon: FileAudio },
  "audio/mp4": { ext: ".m4a", icon: FileAudio },
}

const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md", ".mp3", ".wav", ".m4a"]

export function FileUpload({
  onFileSelect,
  maxSizeInMB,
  isUploading = false,
  uploadProgress = 0,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
    const isValidType = ALLOWED_FILE_TYPES[file.type] || ALLOWED_EXTENSIONS.includes(fileExtension)
    
    if (!isValidType) {
      return `Invalid file type. Allowed types: PDF, TXT, MD, MP3, WAV, M4A`
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      return `File size exceeds ${maxSizeInMB}MB limit`
    }

    return null
  }

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError("")
    setSelectedFile(file)
    
    // Handle audio duration for audio files
    if (file.type.startsWith("audio/")) {
      const url = URL.createObjectURL(file)
      const audio = new Audio(url)
      
      audio.addEventListener("loadedmetadata", () => {
        setAudioDuration(audio.duration)
        URL.revokeObjectURL(url)
      })
      
      audio.addEventListener("error", () => {
        console.error("Error loading audio file")
        URL.revokeObjectURL(url)
      })
    }

    onFileSelect(file)
  }, [maxSizeInMB, onFileSelect])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (file: File) => {
    const fileType = ALLOWED_FILE_TYPES[file.type]
    if (fileType) return fileType.icon
    
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
    if ([".mp3", ".wav", ".m4a"].includes(ext)) return FileAudio
    if ([".pdf", ".txt", ".md"].includes(ext)) return FileText
    return File
  }

  const clearFile = () => {
    setSelectedFile(null)
    setAudioDuration(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-colors",
        isDragging && "border-primary bg-primary/5",
        error && "border-destructive",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={ALLOWED_EXTENSIONS.join(",")}
          className="hidden"
          disabled={isUploading}
        />

        {!selectedFile && !isUploading && (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold">Upload a file</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag and drop or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supported: PDF, TXT, MD, MP3, WAV, M4A (max {maxSizeInMB}MB)
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              Select File
            </Button>
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {(() => {
                const Icon = getFileIcon(selectedFile)
                return <Icon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                  {audioDuration && ` • ${formatDuration(audioDuration)}`}
                </p>
              </div>
              <Button
                onClick={clearFile}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedFile.type.startsWith("audio/") && (
              <audio
                ref={audioRef}
                controls
                className="w-full h-10"
                src={URL.createObjectURL(selectedFile)}
              />
            )}
          </div>
        )}

        {isUploading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {selectedFile && (() => {
                const Icon = getFileIcon(selectedFile)
                return <Icon className="h-8 w-8 text-muted-foreground" />
              })()}
              <div className="flex-1">
                <p className="text-sm font-medium">Uploading...</p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile?.name}
                </p>
              </div>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {uploadProgress}% complete
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-destructive text-center">{error}</p>
        )}
      </div>
    </Card>
  )
}