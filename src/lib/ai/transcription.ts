import { createClient } from '@deepgram/sdk'

export interface TranscriptionResult {
  transcript: string
  segments: {
    text: string
    start: number
    end: number
  }[]
  duration: number
}

export async function transcribeAudio(
  audioUrl: string,
  duration: number
): Promise<TranscriptionResult> {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY
  
  if (!deepgramApiKey) {
    throw new Error('DEEPGRAM_API_KEY is not configured')
  }

  const deepgram = createClient(deepgramApiKey)

  try {
    const { result } = await deepgram.listen.prerecorded.transcribeUrl(
      {
        url: audioUrl
      },
      {
        model: 'nova-2',
        smart_format: true,
        punctuate: true,
        paragraphs: true,
        utterances: true,
        diarize: true,
        language: 'en',
      }
    )

    if (!result?.results?.channels?.[0]?.alternatives?.[0]) {
      throw new Error('No transcription results found')
    }

    const channel = result.results.channels[0]
    const alternative = channel.alternatives[0]
    
    const segments = alternative.words?.map(word => ({
      text: word.word || '',
      start: word.start || 0,
      end: word.end || 0
    })) || []

    return {
      transcript: alternative.transcript || '',
      segments,
      duration
    }
  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}