# AI Final-Year Project Idea Generator & Mentor

An AI-powered, single-page web app that helps final-year students go from
"I don't know what to build" to a concrete, week-by-week implementation plan
— then stays on as a scoped AI mentor for implementation questions.

## Overview

The app walks a student through one linear flow:

```
Student Profile → 3 Project Ideas → Project Deep Dive → Weekly Roadmap → AI Mentor Chat
```

Every screen exists to serve one of three jobs: **generating** a project
idea, **planning** its implementation, or **guiding** the student through
building it. There is no login, no database, and no dashboard — state lives
in memory for the length of the session, which is all this problem needs.

## Features

- **Project idea generation** — exactly 3 ideas tailored to branch, skills,
  interests, duration, and difficulty.
- **Project deep dive** — features, tech stack, architecture, development
  steps, challenges, and future scope, generated in a single AI call.
- **Weekly roadmap** — a week-by-week schedule scaled to the student's
  timeline and the deep dive's development steps.
- **AI mentor chat** — a conversation scoped to the selected project, with
  full project context passed on every turn.
- Loading, empty, error, and success states throughout, with skeleton
  loaders for in-flight AI calls.
- Fully keyboard-accessible forms and chat, with labels, ARIA attributes,
  and visible focus states.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Gemini API** (`gemini-1.5-flash` by default) for all generation
- **Zod** for request/response validation on both client and server

## Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ideas/route.ts       # POST — generate 3 project ideas
│   │   ├── deep-dive/route.ts   # POST — generate the implementation deep dive
│   │   ├── roadmap/route.ts     # POST — generate the weekly roadmap
│   │   └── mentor/route.ts      # POST — answer one mentor chat turn
│   ├── layout.tsx
│   ├── page.tsx                 # single-page flow orchestrator
│   └── globals.css
├── components/
│   ├── ui/                      # Button, Card, TagInput — generic primitives
│   ├── ProjectForm.tsx
│   ├── IdeaCard.tsx / IdeaList.tsx
│   ├── DeepDiveSection.tsx
│   ├── RoadmapSection.tsx
│   ├── MentorChat.tsx
│   ├── StepIndicator.tsx
│   ├── LoadingState.tsx / ErrorState.tsx / EmptyState.tsx
├── lib/
│   ├── validation.ts             # all Zod schemas (requests + AI response shapes)
│   ├── prompts.ts                # centralized Gemini prompt construction
│   ├── sanitize.ts                # prompt-safe text sanitization
│   ├── api-handler.ts             # shared, error-safe API route wrapper
│   ├── api-client.ts              # shared client-side fetch helper
│   └── constants.ts
├── services/
│   └── gemini.ts                  # the only place that calls the Gemini API
├── types/
│   └── index.ts                   # shared domain types
└── tests/
    ├── validation.test.ts
    └── prompt.test.ts
```

## Environment Setup

Copy the example env file and add your key:

```bash
cp env.example .env.local
```

```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash   # optional
```

`GEMINI_API_KEY` is read only on the server (inside `src/services/gemini.ts`
and API routes). It is never prefixed with `NEXT_PUBLIC_` and is never sent
to the browser.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run the test suite:

```bash
npm test
```

## Build

```bash
npm run build
npm start
```

## Security Notes

- All Gemini calls happen server-side in `src/services/gemini.ts`; the API
  key never reaches client code.
- Every API route validates its request body with Zod
  (`src/lib/api-handler.ts` + `src/lib/validation.ts`) before doing any work,
  and returns a generic, non-leaking error message on failure — raw
  exceptions and upstream error bodies are never forwarded to the client.
- Free-text fields (skills, interests, chat questions) are sanitized
  (`src/lib/sanitize.ts`) before being interpolated into a Gemini prompt.
- Gemini's own JSON output is re-validated against a Zod schema before it's
  trusted, so a malformed or unexpected model response can't reach the UI.

## Efficiency Notes

Each step of the flow makes **exactly one** Gemini call:

| Step | Calls |
|---|---|
| Generate 3 ideas | 1 |
| Deep dive (features, stack, architecture, steps, challenges, future scope) | 1 |
| Weekly roadmap | 1 |
| Each mentor chat turn | 1 |

All prompt construction is centralized in `src/lib/prompts.ts`, so there is
one place to tune token usage or prompt wording for the whole app.

## Deployment (Google Cloud Run)

Build and push the container:

```bash
docker build -t gcr.io/<PROJECT_ID>/afy-mentor .
docker push gcr.io/<PROJECT_ID>/afy-mentor
```

Deploy to Cloud Run, supplying the API key as a runtime secret/environment
variable (never bake it into the image):

```bash
gcloud run deploy afy-mentor \
  --image gcr.io/<PROJECT_ID>/afy-mentor \
  --platform managed \
  --region <REGION> \
  --set-env-vars GEMINI_MODEL=gemini-1.5-flash \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --allow-unauthenticated
```

The Dockerfile uses Next.js's `output: "standalone"` build and listens on
the `PORT` environment variable Cloud Run injects, defaulting to `8080`.
