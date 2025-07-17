import { openai } from '@ai-sdk/openai'

export const aiModels = {
  summary: openai('gpt-3.5-turbo'),
  quiz: openai('gpt-4'),
  teachMe: openai('gpt-4'),
  chat: openai('gpt-3.5-turbo-16k')
}