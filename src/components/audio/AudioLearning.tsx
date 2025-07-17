"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  Clock,
  Bookmark,
  FileText,
  Download,
  ChevronRight,
  Edit3,
  Trash2,
  Star,
  Zap,
  Hash,
  AlertCircle,
  CheckCircle,
  Search,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions'

interface Chapter {
  id: string
  title: string
  startTime: number
  endTime: number
  summary?: string
}

interface Note {
  id: string
  timestamp: number
  content: string
  isHighlight: boolean
  createdAt: Date
}

interface AudioLearningProps {
  audioUrl: string
  documentId: string
  documentTitle: string
  transcript?: string
  initialChapters?: Chapter[]
  onNoteSave?: (notes: Note[]) => void
}

export function AudioLearning({
  audioUrl,
  documentId,
  documentTitle,
  transcript,
  initialChapters = [],
  onNoteSave
}: AudioLearningProps) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const regions = useRef<RegionsPlugin | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(0.8)
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState("")
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterHighlights, setFilterHighlights] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return

    // Create WaveSurfer instance
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(148, 163, 184)',
      progressColor: 'rgb(99, 102, 241)',
      cursorColor: 'rgb(99, 102, 241)',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 80,
      barGap: 2,
      plugins: []
    })

    // Initialize regions plugin for highlights
    regions.current = wavesurfer.current.registerPlugin(RegionsPlugin.create())

    // Load audio
    wavesurfer.current.load(audioUrl)

    // Event listeners
    wavesurfer.current.on('ready', () => {
      setDuration(wavesurfer.current!.getDuration())
      generateChapters()
    })

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current!.getCurrentTime())
    })

    wavesurfer.current.on('play', () => setIsPlaying(true))
    wavesurfer.current.on('pause', () => setIsPlaying(false))

    return () => {
      wavesurfer.current?.destroy()
    }
  }, [audioUrl])

  // Generate chapters based on audio duration
  const generateChapters = () => {
    if (!wavesurfer.current || chapters.length > 0) return

    const audioDuration = wavesurfer.current.getDuration()
    const chapterCount = Math.max(3, Math.floor(audioDuration / 300)) // 5 min chapters
    const chapterDuration = audioDuration / chapterCount

    const generatedChapters: Chapter[] = []
    for (let i = 0; i < chapterCount; i++) {
      generatedChapters.push({
        id: `chapter-${i}`,
        title: `Chapter ${i + 1}`,
        startTime: i * chapterDuration,
        endTime: (i + 1) * chapterDuration,
        summary: `Auto-generated chapter covering ${formatTime(i * chapterDuration)} to ${formatTime((i + 1) * chapterDuration)}`
      })
    }

    setChapters(generatedChapters)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const togglePlayPause = () => {
    wavesurfer.current?.playPause()
  }

  const skipBackward = () => {
    wavesurfer.current?.skip(-10)
  }

  const skipForward = () => {
    wavesurfer.current?.skip(10)
  }

  const handlePlaybackRateChange = (rate: string) => {
    const newRate = parseFloat(rate)
    setPlaybackRate(newRate)
    wavesurfer.current?.setPlaybackRate(newRate)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    wavesurfer.current?.setVolume(newVolume)
  }

  const seekToTime = (time: number) => {
    wavesurfer.current?.seekTo(time / duration)
  }

  const addNote = () => {
    if (!currentNote.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      timestamp: currentTime,
      content: currentNote,
      isHighlight: false,
      createdAt: new Date()
    }

    const updatedNotes = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp)
    setNotes(updatedNotes)
    setCurrentNote("")
    
    if (onNoteSave) {
      onNoteSave(updatedNotes)
    }
  }

  const addHighlight = () => {
    if (!regions.current) return

    const start = Math.max(0, currentTime - 5)
    const end = Math.min(duration, currentTime + 5)

    // Create visual region
    const region = regions.current.addRegion({
      start,
      end,
      color: 'rgba(251, 191, 36, 0.3)',
      drag: false,
      resize: false
    })

    // Create note for the highlight
    const newNote: Note = {
      id: region.id,
      timestamp: start,
      content: `Highlighted section from ${formatTime(start)} to ${formatTime(end)}`,
      isHighlight: true,
      createdAt: new Date()
    }

    const updatedNotes = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp)
    setNotes(updatedNotes)

    if (onNoteSave) {
      onNoteSave(updatedNotes)
    }
  }

  const deleteNote = (noteId: string) => {
    // Remove visual highlight if it exists
    if (regions.current) {
      const region = regions.current.getRegions().find(r => r.id === noteId)
      if (region) {
        region.remove()
      }
    }

    const updatedNotes = notes.filter(n => n.id !== noteId)
    setNotes(updatedNotes)

    if (onNoteSave) {
      onNoteSave(updatedNotes)
    }
  }

  const jumpToChapter = (chapter: Chapter) => {
    seekToTime(chapter.startTime)
    setSelectedChapter(chapter.id)
  }

  const exportNotes = () => {
    const exportData = {
      documentTitle,
      audioTitle: documentTitle,
      exportDate: new Date().toISOString(),
      duration: formatTime(duration),
      chapters: chapters.map(ch => ({
        title: ch.title,
        time: formatTime(ch.startTime),
        summary: ch.summary
      })),
      notes: notes.map(note => ({
        time: formatTime(note.timestamp),
        content: note.content,
        type: note.isHighlight ? 'highlight' : 'note',
        created: note.createdAt.toLocaleString()
      }))
    }

    // Create markdown export
    let markdown = `# ${documentTitle} - Audio Notes\n\n`
    markdown += `**Exported:** ${new Date().toLocaleString()}\n`
    markdown += `**Duration:** ${formatTime(duration)}\n\n`
    
    markdown += `## Chapters\n\n`
    chapters.forEach(ch => {
      markdown += `### ${ch.title} (${formatTime(ch.startTime)})\n`
      if (ch.summary) {
        markdown += `${ch.summary}\n\n`
      }
    })

    markdown += `## Notes & Highlights\n\n`
    notes.forEach(note => {
      markdown += `**[${formatTime(note.timestamp)}]** ${note.isHighlight ? '🟨 ' : ''}`
      markdown += `${note.content}\n\n`
    })

    // Download file
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${documentTitle.replace(/\s+/g, '-')}-audio-notes.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowExportDialog(false)
  }

  const filteredNotes = notes.filter(note => {
    if (filterHighlights && !note.isHighlight) return false
    if (searchQuery && !note.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const currentChapter = chapters.find(ch => 
    currentTime >= ch.startTime && currentTime < ch.endTime
  )

  return (
    <div className="space-y-6">
      {/* Main Audio Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            {documentTitle}
          </CardTitle>
          <CardDescription>
            {currentChapter ? `${currentChapter.title}` : 'Audio Learning Session'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Waveform */}
          <div 
            ref={waveformRef} 
            className="w-full rounded-lg bg-muted/50 cursor-pointer"
          />

          {/* Progress and Time */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={skipBackward}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              size="icon"
              className="h-12 w-12"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={skipForward}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Playback Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Speed
              </Label>
              <Select
                value={playbackRate.toString()}
                onValueChange={handlePlaybackRateChange}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Volume2 className="h-3 w-3" />
                Volume
              </Label>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addHighlight}
            >
              <Star className="h-4 w-4 mr-2" />
              Highlight Section
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Add Note at {formatTime(currentTime)}</h4>
                    <Textarea
                      placeholder="Type your note..."
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={addNote}
                    disabled={!currentNote.trim()}
                  >
                    Save Note
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chapters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Chapters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {chapters.map((chapter) => {
                  const isActive = currentChapter?.id === chapter.id
                  const isSelected = selectedChapter === chapter.id
                  
                  return (
                    <div
                      key={chapter.id}
                      className={cn(
                        "p-3 rounded-lg cursor-pointer transition-colors",
                        isActive && "bg-primary/10 border border-primary/20",
                        !isActive && isSelected && "bg-muted",
                        !isActive && !isSelected && "hover:bg-muted"
                      )}
                      onClick={() => jumpToChapter(chapter)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{chapter.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                          </p>
                          {chapter.summary && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {chapter.summary}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Notes & Highlights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes & Highlights
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterHighlights(!filterHighlights)}
                  className={cn(filterHighlights && "bg-yellow-100")}
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Highlights
                </Button>
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Export Notes</DialogTitle>
                      <DialogDescription>
                        Export your notes and highlights with timestamps
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Export includes:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            All notes with timestamps
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Highlighted sections
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Chapter information
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Markdown formatting
                          </li>
                        </ul>
                      </div>
                      <Button onClick={exportNotes} className="w-full">
                        Download as Markdown
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Notes List */}
              <ScrollArea className="h-[350px]">
                {filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {notes.length === 0 
                        ? "No notes yet. Add notes while listening!"
                        : "No notes match your filter"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className={cn(
                          "p-3 rounded-lg border",
                          note.isHighlight && "bg-yellow-50 border-yellow-200"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => seekToTime(note.timestamp)}
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(note.timestamp)}
                              </Button>
                              {note.isHighlight && (
                                <Badge variant="secondary" className="text-xs">
                                  Highlight
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{note.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {note.createdAt.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transcript (if available) */}
      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transcript</CardTitle>
            <CardDescription>
              Full audio transcript with search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] rounded-lg border p-4">
              <p className="text-sm whitespace-pre-wrap">{transcript}</p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Add missing Label component import
import { Label } from "@/components/ui/label"