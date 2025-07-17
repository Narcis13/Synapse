"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX,
  Repeat,
  Bookmark,
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils/audio";

interface Bookmark {
  id: string;
  timestamp: number;
  label: string;
  color?: string;
}

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onBookmarkAdd?: (bookmark: Bookmark) => void;
  onBookmarkClick?: (bookmark: Bookmark) => void;
  initialBookmarks?: Bookmark[];
  className?: string;
  autoPlay?: boolean;
  height?: number;
}

export function AudioPlayer({
  audioUrl,
  title,
  onTimeUpdate,
  onBookmarkAdd,
  onBookmarkClick,
  initialBookmarks = [],
  className,
  autoPlay = false,
  height = 128,
}: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "rgb(147, 51, 234)", // Purple color matching theme
      progressColor: "rgb(168, 85, 247)", // Lighter purple
      cursorColor: "rgb(124, 58, 237)",
      barWidth: 2,
      barRadius: 3,
      responsive: true,
      height: height,
      normalize: true,
      backend: "WebAudio",
      interact: true,
    });

    wavesurferRef.current = wavesurfer;

    // Event listeners
    wavesurfer.on("ready", () => {
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
      wavesurfer.setVolume(volume);
      
      if (autoPlay) {
        wavesurfer.play();
        setIsPlaying(true);
      }
    });

    wavesurfer.on("audioprocess", () => {
      const time = wavesurfer.getCurrentTime();
      setCurrentTime(time);
      onTimeUpdate?.(time);

      // Handle looping
      if (isLooping && loopEnd !== null && time >= loopEnd) {
        wavesurfer.seekTo((loopStart || 0) / duration);
      }
    });

    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    wavesurfer.on("finish", () => {
      if (isLooping) {
        wavesurfer.seekTo((loopStart || 0) / duration);
        wavesurfer.play();
      } else {
        setIsPlaying(false);
      }
    });

    wavesurfer.on("error", (error) => {
      console.error("WaveSurfer error:", error);
      setIsLoading(false);
    });

    // Load audio
    wavesurfer.load(audioUrl);

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, height, autoPlay, volume, isLooping, loopStart, loopEnd, duration, onTimeUpdate]);

  // Playback controls
  const togglePlayPause = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (wavesurferRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      wavesurferRef.current.seekTo(newTime / duration);
    }
  }, [currentTime, duration]);

  const skipForward = useCallback(() => {
    if (wavesurferRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      wavesurferRef.current.seekTo(newTime / duration);
    }
  }, [currentTime, duration]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (wavesurferRef.current) {
      if (isMuted) {
        wavesurferRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        wavesurferRef.current.setVolume(0);
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const handlePlaybackRateChange = useCallback((value: string) => {
    const rate = parseFloat(value);
    setPlaybackRate(rate);
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(rate);
    }
  }, []);

  const toggleLoop = useCallback(() => {
    if (!isLooping) {
      // Set loop to current visible region or full track
      setLoopStart(0);
      setLoopEnd(duration);
    } else {
      setLoopStart(null);
      setLoopEnd(null);
    }
    setIsLooping(!isLooping);
  }, [isLooping, duration]);

  const addBookmark = useCallback(() => {
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      timestamp: currentTime,
      label: `Bookmark at ${formatDuration(currentTime)}`,
      color: "purple",
    };
    setBookmarks([...bookmarks, bookmark]);
    onBookmarkAdd?.(bookmark);
  }, [currentTime, bookmarks, onBookmarkAdd]);

  const handleBookmarkClick = useCallback((bookmark: Bookmark) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.seekTo(bookmark.timestamp / duration);
    }
    onBookmarkClick?.(bookmark);
  }, [duration, onBookmarkClick]);

  // Jump to timestamp from external source
  useEffect(() => {
    const handleJumpToTime = (event: CustomEvent<{ timestamp: number }>) => {
      if (wavesurferRef.current && duration > 0) {
        wavesurferRef.current.seekTo(event.detail.timestamp / duration);
        if (!isPlaying) {
          wavesurferRef.current.play();
        }
      }
    };

    window.addEventListener("audio-jump-to-time" as any, handleJumpToTime);
    return () => {
      window.removeEventListener("audio-jump-to-time" as any, handleJumpToTime);
    };
  }, [duration, isPlaying]);

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Title */}
        {title && (
          <>
            <h3 className="font-semibold text-lg">{title}</h3>
            <Separator />
          </>
        )}

        {/* Waveform */}
        <div className="relative">
          <div ref={waveformRef} className="w-full" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {/* Bookmarks overlay */}
          {bookmarks.map((bookmark) => (
            <button
              key={bookmark.id}
              className="absolute top-0 bottom-0 w-1 bg-purple-500 hover:bg-purple-600 cursor-pointer"
              style={{ left: `${(bookmark.timestamp / duration) * 100}%` }}
              onClick={() => handleBookmarkClick(bookmark)}
              title={bookmark.label}
            />
          ))}

          {/* Loop region overlay */}
          {isLooping && loopStart !== null && loopEnd !== null && (
            <div
              className="absolute top-0 bottom-0 bg-purple-500/20 pointer-events-none"
              style={{
                left: `${(loopStart / duration) * 100}%`,
                width: `${((loopEnd - loopStart) / duration) * 100}%`,
              }}
            />
          )}
        </div>

        {/* Time display */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {/* Main controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={skipBackward}
              disabled={isLoading}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlayPause}
              disabled={isLoading}
              className="h-12 w-12"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={skipForward}
              disabled={isLoading}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Secondary controls */}
          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.01}
                className="w-24"
              />
            </div>

            {/* Speed control */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                <SelectTrigger className="w-20 h-8">
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

            {/* Loop toggle */}
            <Toggle
              pressed={isLooping}
              onPressedChange={toggleLoop}
              size="sm"
              aria-label="Toggle loop"
            >
              <Repeat className={cn("h-4 w-4", isLooping && "text-purple-500")} />
            </Toggle>

            {/* Bookmark button */}
            <Button
              variant="outline"
              size="sm"
              onClick={addBookmark}
              disabled={isLoading}
            >
              <Bookmark className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Bookmarks list */}
        {bookmarks.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Bookmarks</h4>
              <div className="flex flex-wrap gap-2">
                {bookmarks.map((bookmark) => (
                  <Badge
                    key={bookmark.id}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleBookmarkClick(bookmark)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(bookmark.timestamp)}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}