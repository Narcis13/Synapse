"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Citation, CitationText, Source } from "./Citation";
import { useAudioSync } from "@/hooks/useAudioSync";
import { useRouter } from "next/navigation";

interface MessageWithCitationsProps {
  content: string;
  sources: Source[];
  onSourceClick?: (source: Source) => void;
}

export function MessageWithCitations({
  content,
  sources,
  onSourceClick,
}: MessageWithCitationsProps) {
  const router = useRouter();
  const { jumpToTimestamp } = useAudioSync();

  // Parse content to extract citation markers [1], [2], etc.
  const parsedContent = useMemo(() => {
    const citationPattern = /\[(\d+(?:,\s*\d+)*)\]/g;
    const parts: (string | { type: "citation"; indices: number[] })[] = [];
    let lastIndex = 0;

    const matches = Array.from(content.matchAll(citationPattern));

    matches.forEach((match) => {
      // Add text before citation
      if (match.index! > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Parse citation indices
      const indices = match[1].split(",").map((s) => parseInt(s.trim()) - 1);
      parts.push({ type: "citation", indices });

      lastIndex = match.index! + match[0].length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  }, [content]);

  const handleSourceClick = (source: Source) => {
    // Handle audio/video sources with timestamps
    if (source.metadata?.startTime !== undefined) {
      jumpToTimestamp(source.metadata.startTime);
    } 
    // Handle document sources with page numbers
    else if (source.metadata?.pageNumber) {
      // Navigate to document viewer with page number
      router.push(`/documents/${source.documentId}?page=${source.metadata.pageNumber}`);
    }
    // Handle other sources
    else {
      router.push(`/documents/${source.documentId}`);
    }

    // Call custom handler if provided
    onSourceClick?.(source);
  };

  // Render content with inline citations
  const renderContent = () => {
    return parsedContent.map((part, index) => {
      if (typeof part === "string") {
        return <span key={index}>{part}</span>;
      }

      // Render citation
      const citedSources = part.indices
        .filter((i) => i >= 0 && i < sources.length)
        .map((i) => sources[i]);

      if (citedSources.length === 0) return null;

      return (
        <Citation
          key={index}
          sources={citedSources}
          citationNumber={part.indices.map((i) => i + 1).join(",")}
          onSourceClick={handleSourceClick}
        />
      );
    });
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {renderContent()}
    </div>
  );
}

// Example usage with markdown content
export function MarkdownWithCitations({
  content,
  sources,
  onSourceClick,
}: MessageWithCitationsProps) {
  const router = useRouter();
  const { jumpToTimestamp } = useAudioSync();

  const handleSourceClick = (source: Source) => {
    if (source.metadata?.startTime !== undefined) {
      jumpToTimestamp(source.metadata.startTime);
    } else if (source.metadata?.pageNumber) {
      router.push(`/documents/${source.documentId}?page=${source.metadata.pageNumber}`);
    } else {
      router.push(`/documents/${source.documentId}`);
    }
    onSourceClick?.(source);
  };

  // Custom markdown components to handle citations
  const components = {
    p: ({ children }: any) => {
      const content = children?.toString() || "";
      const citationPattern = /\[(\d+(?:,\s*\d+)*)\]/g;
      
      const parts = [];
      let lastIndex = 0;
      
      const matches = Array.from(content.matchAll(citationPattern));
      
      matches.forEach((match) => {
        if (match.index! > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        
        const indices = match[1].split(",").map((s) => parseInt(s.trim()) - 1);
        const citedSources = indices
          .filter((i) => i >= 0 && i < sources.length)
          .map((i) => sources[i]);
        
        if (citedSources.length > 0) {
          parts.push(
            <Citation
              key={match.index}
              sources={citedSources}
              citationNumber={match[1]}
              onSourceClick={handleSourceClick}
            />
          );
        }
        
        lastIndex = match.index! + match[0].length;
      });
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }
      
      return <p>{parts}</p>;
    },
  };

  return (
    <ReactMarkdown
      components={components}
      className="prose prose-sm dark:prose-invert max-w-none"
    >
      {content}
    </ReactMarkdown>
  );
}