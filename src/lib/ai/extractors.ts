import pdf from 'pdf-parse'
import { transcribeAudio } from './transcription'

export interface ExtractedText {
  content: string
  metadata: {
    pageCount?: number
    duration?: number
    timestamps?: Array<{
      text: string
      start: number
      end: number
    }>
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractedText> {
  try {
    const data = await pdf(buffer)
    
    const cleanedText = data.text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim()
    
    return {
      content: cleanedText,
      metadata: {
        pageCount: data.numpages
      }
    }
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function extractTextFromAudio(
  audioUrl: string,
  duration: number
): Promise<ExtractedText> {
  try {
    const transcription = await transcribeAudio(audioUrl, duration)
    
    return {
      content: transcription.transcript,
      metadata: {
        duration: transcription.duration,
        timestamps: transcription.segments
      }
    }
  } catch (error) {
    console.error('Audio extraction error:', error)
    throw new Error(`Failed to extract text from audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function extractTextFromMarkdown(content: string): Promise<ExtractedText> {
  const cleanedContent = content
    .replace(/```[\s\S]*?```/g, (match) => {
      const codeContent = match.replace(/```\w*\n?/, '').replace(/```$/, '')
      return `\n[Code Block]\n${codeContent}\n`
    })
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[Image: $1]')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/^[-*+]\s/gm, '• ')
    .replace(/^\d+\.\s/gm, '• ')
    .trim()
  
  return {
    content: cleanedContent,
    metadata: {}
  }
}

export async function extractTextFromTxt(content: string): Promise<ExtractedText> {
  const cleanedContent = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim()
  
  return {
    content: cleanedContent,
    metadata: {}
  }
}

export async function extractText(
  file: File | Buffer | string,
  fileType: 'pdf' | 'txt' | 'md' | 'audio',
  audioMetadata?: { url: string; duration: number }
): Promise<ExtractedText> {
  switch (fileType) {
    case 'pdf':
      if (file instanceof Buffer) {
        return extractTextFromPDF(file)
      }
      throw new Error('PDF extraction requires a Buffer')
      
    case 'audio':
      if (!audioMetadata) {
        throw new Error('Audio extraction requires URL and duration')
      }
      return extractTextFromAudio(audioMetadata.url, audioMetadata.duration)
      
    case 'md':
      if (typeof file === 'string') {
        return extractTextFromMarkdown(file)
      }
      throw new Error('Markdown extraction requires a string')
      
    case 'txt':
      if (typeof file === 'string') {
        return extractTextFromTxt(file)
      }
      throw new Error('Text extraction requires a string')
      
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}