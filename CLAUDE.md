# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Synapse is an AI-powered learning platform that helps users learn through multiple modes including an innovative "Teach Me" feature where users explain concepts to an AI student. The project is currently in planning phase with comprehensive documentation in the `/docs` directory.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React with TypeScript
- **UI**: shadcn/ui components with Tailwind CSS
- **Backend**: Convex (real-time database, serverless functions, file storage)
- **AI**: Vercel AI SDK, OpenAI APIs
- **Audio**: Deepgram (transcription), ElevenLabs (voice synthesis)
- **Payments**: Stripe
- **Authentication**: Custom JWT-based auth
- **Hosting**: Vercel

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Convex development
npx convex dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Install shadcn/ui components
npx shadcn-ui@latest add [component-name]
```

## Project Structure

The planned structure follows Next.js 15 App Router conventions:

```
src/
├── app/
│   ├── (marketing)/     # Public marketing pages
│   ├── (auth)/         # Authentication pages
│   ├── (dashboard)/    # Protected dashboard pages
│   └── api/           # API routes (Stripe webhooks, etc.)
├── components/        # Reusable React components
├── lib/              # Utilities and business logic
│   ├── ai/          # AI processing functions
│   ├── audio/       # Audio processing utilities
│   └── stripe/      # Stripe integration
├── hooks/           # Custom React hooks
└── convex/          # Convex backend functions
```

## Key Features to Implement

1. **File Upload & Processing**: Support for PDF, TXT, MD, and audio files
2. **AI Features**: Summaries, quizzes, flashcards, chat interface
3. **Teach Me Mode**: Interactive Socratic learning with AI student
4. **Audio Support**: Transcription and voice synthesis
5. **Subscription System**: Free tier + Pro ($12.99/mo) with Stripe

## Important Implementation Notes

- The project uses Convex for all backend operations (no separate API server)
- Audio files should be compressed and use progressive loading
- Implement token counting before AI requests to manage costs
- Use proper error boundaries and loading states throughout
- All AI responses should be cached to reduce API costs
- Follow the 15-day implementation plan in `/docs/synapse-mvp-implementation-plan.md`

## Environment Variables Required

```
OPENAI_API_KEY
NEXT_PUBLIC_CONVEX_URL
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
DEEPGRAM_API_KEY
```

## Testing Focus Areas

- Authentication flow (registration, login, subscription status)
- File upload and processing pipeline
- AI generation accuracy and error handling
- Stripe payment and webhook handling
- Audio transcription and playback
- Teach Me mode interaction flow

## Workflow

- read the PRD document in /docs/PRD.md 
- Treat implementation plan in /docs/implementation-plan.md as a living document. Update checkboxes as tasks are completed and add new tasks as discovered
- **IMPORTANT**: When you are asked to implement a task from /docs/implementation-plan.md implement only that task nothink more nothing less!
- **CRITICAL**: ALWAYS update the implementation plan IMMEDIATELY after completing any task. Mark completed tasks with [x] by editing the /docs/synapse-mvp-implementation-plan.md file. This is MANDATORY - never skip this step!

## Memory Notes

- Always use context7 mcp server