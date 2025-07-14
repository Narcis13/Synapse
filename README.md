# Synapse

An AI-powered learning platform that helps users learn through multiple modes including an innovative "Teach Me" feature where users explain concepts to an AI student.

## Features

- **File Upload & Processing**: Support for PDF, TXT, MD, and audio files
- **AI-Powered Learning**: Summaries, quizzes, flashcards, and chat interface
- **Teach Me Mode**: Interactive Socratic learning with AI student
- **Audio Support**: Transcription and voice synthesis
- **Subscription System**: Free tier + Pro ($12.99/mo) with Stripe

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React with TypeScript
- **UI**: shadcn/ui components with Tailwind CSS
- **Backend**: Convex (real-time database, serverless functions, file storage)
- **AI**: Vercel AI SDK, OpenAI APIs
- **Audio**: Deepgram (transcription), ElevenLabs (voice synthesis)
- **Payments**: Stripe
- **Authentication**: Custom JWT-based auth
- **Hosting**: Vercel

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Narcis13/Synapse.git
cd synapse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. Run the development server:
```bash
npm run dev
# In another terminal:
npx convex dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation

- [Product Requirements Document](/docs/synapse-learning-app-prd.md)
- [Implementation Plan](/docs/synapse-mvp-implementation-plan.md)

## Development Status

Currently in active development. Check the implementation plan for progress.

## License

Private project - All rights reserved