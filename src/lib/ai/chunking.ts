export interface ContentChunk {
  content: string
  index: number
  metadata: {
    startOffset: number
    endOffset: number
    startTime?: number
    endTime?: number
    pageNumber?: number
  }
}

export interface ChunkingOptions {
  maxChunkSize?: number
  minChunkSize?: number
  overlap?: number
  preserveSentences?: boolean
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  maxChunkSize: 1500,
  minChunkSize: 100,
  overlap: 200,
  preserveSentences: true
}

function findSentenceBoundary(text: string, targetIndex: number, searchBackward = true): number {
  const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n']
  
  if (searchBackward) {
    for (let i = targetIndex; i >= 0; i--) {
      for (const ender of sentenceEnders) {
        if (text.slice(i, i + ender.length) === ender) {
          return i + ender.length
        }
      }
    }
    return 0
  } else {
    for (let i = targetIndex; i < text.length; i++) {
      for (const ender of sentenceEnders) {
        if (text.slice(i, i + ender.length) === ender) {
          return i + ender.length
        }
      }
    }
    return text.length
  }
}

function findParagraphBoundary(text: string, targetIndex: number): number {
  const newlineIndex = text.lastIndexOf('\n\n', targetIndex)
  return newlineIndex === -1 ? 0 : newlineIndex + 2
}

function mapTimestampToChunk(
  chunkStart: number,
  chunkEnd: number,
  timestamps?: Array<{ text: string; start: number; end: number }>
): { startTime?: number; endTime?: number } {
  if (!timestamps || timestamps.length === 0) {
    return {}
  }

  let currentOffset = 0
  let startTime: number | undefined
  let endTime: number | undefined

  for (const segment of timestamps) {
    const segmentLength = segment.text.length
    const segmentEnd = currentOffset + segmentLength

    if (currentOffset <= chunkStart && segmentEnd > chunkStart) {
      startTime = segment.start
    }

    if (currentOffset < chunkEnd && segmentEnd >= chunkEnd) {
      endTime = segment.end
      break
    }

    if (segmentEnd <= chunkEnd) {
      endTime = segment.end
    }

    currentOffset = segmentEnd + 1 // +1 for space between words
  }

  return { startTime, endTime }
}

export function chunkContent(
  text: string,
  metadata?: {
    timestamps?: Array<{ text: string; start: number; end: number }>
    pageBreaks?: number[]
  },
  options: ChunkingOptions = {}
): ContentChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const chunks: ContentChunk[] = []
  
  if (!text || text.trim().length === 0) {
    return chunks
  }

  let currentIndex = 0
  let chunkIndex = 0

  while (currentIndex < text.length) {
    let chunkEnd = Math.min(currentIndex + opts.maxChunkSize!, text.length)
    
    if (chunkEnd < text.length && opts.preserveSentences) {
      const paragraphBoundary = findParagraphBoundary(text, chunkEnd)
      if (paragraphBoundary > currentIndex + opts.minChunkSize!) {
        chunkEnd = paragraphBoundary
      } else {
        chunkEnd = findSentenceBoundary(text, chunkEnd, true)
      }
    }

    const chunkContent = text.slice(currentIndex, chunkEnd).trim()
    
    if (chunkContent.length >= opts.minChunkSize!) {
      const timeRange = mapTimestampToChunk(currentIndex, chunkEnd, metadata?.timestamps)
      
      let pageNumber: number | undefined
      if (metadata?.pageBreaks) {
        for (let i = 0; i < metadata.pageBreaks.length; i++) {
          if (currentIndex < metadata.pageBreaks[i]) {
            pageNumber = i + 1
            break
          }
        }
        if (pageNumber === undefined) {
          pageNumber = metadata.pageBreaks.length + 1
        }
      }

      chunks.push({
        content: chunkContent,
        index: chunkIndex++,
        metadata: {
          startOffset: currentIndex,
          endOffset: chunkEnd,
          ...timeRange,
          ...(pageNumber !== undefined && { pageNumber })
        }
      })
    }

    currentIndex = Math.max(currentIndex + 1, chunkEnd - opts.overlap!)
  }

  return chunks
}

export function mergeSmallChunks(chunks: ContentChunk[], minSize: number = 100): ContentChunk[] {
  if (chunks.length === 0) return chunks

  const mergedChunks: ContentChunk[] = []
  let currentChunk: ContentChunk | null = null

  for (const chunk of chunks) {
    if (!currentChunk) {
      currentChunk = { ...chunk }
    } else if (currentChunk.content.length + chunk.content.length < minSize * 2) {
      currentChunk.content += '\n\n' + chunk.content
      currentChunk.metadata.endOffset = chunk.metadata.endOffset
      if (chunk.metadata.endTime !== undefined) {
        currentChunk.metadata.endTime = chunk.metadata.endTime
      }
      if (chunk.metadata.pageNumber !== undefined) {
        currentChunk.metadata.pageNumber = chunk.metadata.pageNumber
      }
    } else {
      if (currentChunk.content.length >= minSize) {
        mergedChunks.push(currentChunk)
      }
      currentChunk = { ...chunk }
    }
  }

  if (currentChunk && currentChunk.content.length >= minSize) {
    mergedChunks.push(currentChunk)
  }

  return mergedChunks.map((chunk, index) => ({
    ...chunk,
    index
  }))
}