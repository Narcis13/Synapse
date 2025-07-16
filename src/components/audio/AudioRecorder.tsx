"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Pause, Play, Square, Download, Upload, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioRecorderProps {
  onSave?: (audioBlob: Blob, fileName: string) => void
  maxDurationInSeconds?: number
  className?: string
}

export function AudioRecorder({
  onSave,
  maxDurationInSeconds = 300, // 5 minutes default
  className,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string>("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedDurationRef = useRef<number>(0)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [recordedUrl])

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      ctx.fillStyle = "rgb(0, 0, 0, 0)"
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = isRecording && !isPaused ? "#ef4444" : "#6b7280"
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()
  }, [isRecording, isPaused])

  const startRecording = async () => {
    try {
      setError("")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up audio context and analyser for waveform
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 2048

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || "audio/webm" 
        })
        setRecordedBlob(blob)
        const url = URL.createObjectURL(blob)
        setRecordedUrl(url)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      startTimeRef.current = Date.now()
      pausedDurationRef.current = 0
      
      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          const elapsed = (Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000
          setDuration(Math.floor(elapsed))
          
          if (elapsed >= maxDurationInSeconds) {
            stopRecording()
          }
        }
      }, 100)

      drawWaveform()
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setError("Could not access microphone. Please check permissions.")
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      pausedDurationRef.current += Date.now() - startTimeRef.current
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      startTimeRef.current = Date.now()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }

  const resetRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setDuration(0)
    setIsPlaying(false)
    chunksRef.current = []
  }

  const playRecording = () => {
    if (audioRef.current && recordedUrl) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const saveAsVoiceMemo = () => {
    if (recordedBlob && onSave) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const fileName = `voice-memo-${timestamp}.webm`
      onSave(recordedBlob, fileName)
    }
  }

  const downloadRecording = () => {
    if (recordedBlob) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const fileName = `recording-${timestamp}.webm`
      const a = document.createElement("a")
      a.href = recordedUrl!
      a.download = fileName
      a.click()
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Waveform Canvas */}
        <div className="relative h-24 bg-muted/20 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            width={800}
            height={96}
          />
          {duration > 0 && (
            <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded text-sm">
              {formatDuration(duration)} / {formatDuration(maxDurationInSeconds)}
            </div>
          )}
        </div>

        {/* Recording Controls */}
        {!recordedBlob ? (
          <div className="flex items-center justify-center gap-2">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                variant="destructive"
                className="gap-2"
              >
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <>
                {!isPaused ? (
                  <Button
                    onClick={pauseRecording}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={resumeRecording}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Resume
                  </Button>
                )}
                <Button
                  onClick={stopRecording}
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                >
                  <Square className="h-5 w-5" />
                  Stop
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Playback Controls */}
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={recordedUrl!}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              
              <div className="flex items-center justify-center gap-2">
                {!isPlaying ? (
                  <Button
                    onClick={playRecording}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Play Recording
                  </Button>
                ) : (
                  <Button
                    onClick={pausePlayback}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={resetRecording}
                  size="lg"
                  variant="ghost"
                  className="gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  New Recording
                </Button>
              </div>

              {/* Save Options */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={downloadRecording}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                {onSave && (
                  <Button
                    onClick={saveAsVoiceMemo}
                    variant="default"
                    size="sm"
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Save as Voice Memo
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </div>
    </Card>
  )
}