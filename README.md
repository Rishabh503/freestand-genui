
# Freestand GenUI Generator

Freestand GenUI Generator is an AI‑powered lesson generation platform built with Next.js, Supabase, LangSmith, and Google’s Gemini models. The project uses Bun as the runtime and includes tracing support through LangSmith for monitoring and debugging AI workflows.

## Overview

Freestand GenUI Generator allows users to:

- Generate structured lessons using advanced AI models.
- Store and manage content using Supabase.
- Trace AI workflows using LangSmith for better observability.
- Run a fast development environment powered by Bun.
- Use a clean and responsive UI powered by Next.js.

## Tech Stack

- Next.js (App Router)
- Bun runtime
- Supabase (Auth + Database)
- LangSmith (Tracing & Debugging)
- Gemini 2.0 / 2.5 Flash API
- Tailwind CSS (optional)

## Features

- AI lesson generation with Gemini.
- Real‑time database interactions using Supabase.
- Full LangSmith tracing support.
- API routes built using Bun‑compatible Next.js handlers.
- Modern UI for interacting with generated lessons.

## Environment Variables

Create a `.env.local` file and add the following keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
GEMINI_KEY=

LANGSMITH_TRACING=
LANGSMITH_ENDPOINT=
LANGSMITH_API_KEY=
LANGSMITH_PROJECT=
```

## Tracing Links (LangSmith)

Here are some public trace links you can reference:

- https://smith.langchain.com/public/bbdd6f8c-0a68-43ad-9d2b-8d3ae676a77a/r
- https://smith.langchain.com/public/3bec87e9-1d70-40b2-b8aa-5555eab4be66/r
- https://smith.langchain.com/public/0b6742c5-f4fe-49f5-8dfb-2f2b7a121b22/r

## Usage

1. Open the UI.
2. Enter prompt or topic for lesson generation.
3. Review AI-generated structured lessons.
4. Save lessons to Supabase.
