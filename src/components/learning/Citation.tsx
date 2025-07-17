"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Mic,
  Clock,
  ArrowRight,
  BookOpen,
  BarChart,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils/audio";

export interface Source {
  id: string;
  chunkId: Id<"documentChunks">;
  documentId: Id<"documents">;
  documentTitle: string;
  content: string;
  type: "text" | "audio" | "video";
  confidence: number; // 0-1
  metadata?: {
    pageNumber?: number;
    startTime?: number;
    endTime?: number;
    speaker?: string;
  };
}

interface CitationProps {
  sources: Source[];
  citationNumber?: number;
  onSourceClick?: (source: Source) => void;
  showInline?: boolean;
  className?: string;
}

export function Citation({
  sources,
  citationNumber,
  onSourceClick,
  showInline = true,
  className,
}: CitationProps) {
  const [isHovered, setIsHovered] = useState(false);

  const primarySource = sources[0];
  const additionalSourcesCount = sources.length - 1;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
  };

  const getSourceIcon = (type: Source["type"]) => {
    switch (type) {
      case "audio":
      case "video":
        return <Mic className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const formatSourceLocation = (source: Source) => {
    if (source.metadata?.startTime !== undefined) {
      return formatDuration(source.metadata.startTime);
    }
    if (source.metadata?.pageNumber) {
      return `Page ${source.metadata.pageNumber}`;
    }
    return "Document";
  };

  if (!showInline) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Sources ({sources.length})</span>
            <Badge variant="outline" className="text-xs">
              Avg. Confidence: {Math.round(sources.reduce((acc, s) => acc + s.confidence, 0) / sources.length * 100)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {sources.map((source, index) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  index={index + 1}
                  onSourceClick={onSourceClick}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className={cn(
            "inline-flex items-center gap-1 h-auto p-0 text-xs font-normal",
            "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <sup className="text-[10px]">
            [{citationNumber || sources.map((_, i) => i + 1).join(",")}]
          </sup>
          {additionalSourcesCount > 0 && (
            <span className="text-[10px] text-muted-foreground">
              +{additionalSourcesCount}
            </span>
          )}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-96 p-0"
        align="start"
        side="top"
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">Source Preview</h4>
            <Badge variant="outline" className="text-xs">
              {sources.length} source{sources.length > 1 ? "s" : ""}
            </Badge>
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div key={source.id}>
                  {index > 0 && <Separator className="my-3" />}
                  <SourcePreview
                    source={source}
                    index={index + 1}
                    onSourceClick={onSourceClick}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

interface SourcePreviewProps {
  source: Source;
  index: number;
  onSourceClick?: (source: Source) => void;
}

function SourcePreview({ source, index, onSourceClick }: SourcePreviewProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center">
            {index}
          </Badge>
          <div>
            <p className="font-medium text-sm flex items-center gap-1">
              {getSourceIcon(source.type)}
              {source.documentTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatSourceLocation(source)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onSourceClick?.(source)}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-xs line-clamp-3">{source.content}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <span className={cn("text-xs font-medium", getConfidenceColor(source.confidence))}>
            {getConfidenceLabel(source.confidence)} ({Math.round(source.confidence * 100)}%)
          </span>
        </div>
        {source.metadata?.speaker && (
          <Badge variant="outline" className="text-xs">
            {source.metadata.speaker}
          </Badge>
        )}
      </div>

      <Progress
        value={source.confidence * 100}
        className="h-1"
      />
    </div>
  );
}

interface SourceCardProps {
  source: Source;
  index: number;
  onSourceClick?: (source: Source) => void;
}

function SourceCard({ source, index, onSourceClick }: SourceCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => onSourceClick?.(source)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Badge variant="secondary" className="h-8 w-8 p-0 flex items-center justify-center">
            {index}
          </Badge>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm flex items-center gap-2">
                {getSourceIcon(source.type)}
                {source.documentTitle}
              </p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <p className="text-xs text-muted-foreground">
              {formatSourceLocation(source)}
              {source.metadata?.speaker && ` • ${source.metadata.speaker}`}
            </p>

            <p className="text-sm line-clamp-2">{source.content}</p>

            <div className="flex items-center gap-2 pt-1">
              <Progress value={source.confidence * 100} className="h-1 flex-1" />
              <span className={cn("text-xs font-medium", getConfidenceColor(source.confidence))}>
                {Math.round(source.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compound component for inline citations in text
export function CitationText({ 
  children, 
  sources,
  onSourceClick,
}: { 
  children: React.ReactNode;
  sources: Source[];
  onSourceClick?: (source: Source) => void;
}) {
  return (
    <>
      {children}
      <Citation
        sources={sources}
        onSourceClick={onSourceClick}
        className="ml-0.5"
      />
    </>
  );
}

// Helper component for rendering multiple citations
export function CitationList({
  citations,
  onSourceClick,
  className,
}: {
  citations: { id: string; sources: Source[] }[];
  onSourceClick?: (source: Source) => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        References
      </h3>
      <div className="space-y-2">
        {citations.map((citation, index) => (
          <div key={citation.id} className="flex items-start gap-2">
            <span className="text-sm text-muted-foreground">[{index + 1}]</span>
            <Citation
              sources={citation.sources}
              citationNumber={index + 1}
              onSourceClick={onSourceClick}
              showInline={false}
              className="flex-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}