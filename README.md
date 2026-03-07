<p align="center">
  <img src="public/aria-logo-480.png" alt="ARIA Logo" width="120" />
</p>

<h1 align="center">ARIA — Autonomous Research Intelligence Agent</h1>

<p align="center">
  <strong>Don't Google It. ARIA It.</strong><br/>
  Production-grade autonomous research powered by <strong>Z.AI GLM series models</strong>.
</p>

<p align="center">
  <a href="https://ariaoracle.lovable.app"><img src="https://img.shields.io/badge/Live_Demo-ariaoracle.lovable.app-22D3EE?style=for-the-badge" alt="Live Demo" /></a>
  <a href="https://ariaoracle.lovable.app/docs"><img src="https://img.shields.io/badge/Docs-Documentation-3B82F6?style=for-the-badge" alt="Docs" /></a>
</p>

---

## Overview

ARIA transforms a single research question into a structured, cited report by orchestrating a **5-agent pipeline** — each agent powered by Z.AI's GLM models with automatic Gemini fallback for resilience.

```
User Question
     │
     ▼
┌─────────────────────────────────────────────────────┐
│  Orchestrator (GLM-4-Plus)                          │
│  Decomposes query → research plan with subtasks     │
└──────────────┬──────────────────────────────────────┘
               │
     ┌─────────┴─────────┐
     ▼                   ▼
┌──────────┐      ┌──────────┐
│Researcher│      │ Analyst  │
│GLM-4-Plus│      │ GLM-4.7  │
│Web synth.│      │Reasoning │
│8-12 pts  │      │Confidence│
│5-8 srcs  │      │scores    │
└────┬─────┘      └────┬─────┘
     │                 │
     └────────┬────────┘
              ▼
       ┌──────────┐
       │  Coder   │
       │ GLM-4.7  │
       │ Python   │
       │ analysis │
       └────┬─────┘
            ▼
       ┌──────────┐
       │  Writer  │
       │GLM-4-Plus│
       │ Final    │
       │ report   │
       └────┬─────┘
            ▼
    Shareable Report
    (Markdown + Sources)
```

## Z.AI Integration

ARIA uses Z.AI's GLM series as the **core** LLM component. Lovable/Gemini serves as an automatic fallback when Z.AI returns 429 (rate limit) or 402 (credits exhausted), ensuring the app stays live during demos.

| Agent | Primary Model | Concurrency | Fallback | Responsibility |
|-------|--------------|-------------|----------|----------------|
| **Orchestrator** | GLM-4-Plus | 20 | Gemini | Task decomposition, planning, source extraction |
| **Researcher** | GLM-4-Plus | 20 | Gemini | Multi-source synthesis, citations, data points |
| **Analyst** | GLM-4.7 | 3 | Gemini | Deep reasoning, confidence scores, contradictions |
| **Coder** | GLM-4.7 | 3 | Gemini | Python (pandas/matplotlib), data analysis & charts |
| **Writer** | GLM-4-Plus | 20 | Gemini | Final report: executive summary, findings, sources |

**Why two model tiers?**
- **GLM-4-Plus** (concurrency 20) — Fast, high-throughput. Used for orchestration, research, and writing where speed matters.
- **GLM-4.7** (concurrency 3) — Advanced reasoning. Used for deep analysis and code generation where accuracy matters.

**References:** [Z.AI API Docs](https://docs.z.ai/api-reference/llm/chat-completion) · [GLM-4.6 Guide](https://docs.z.ai/guides/llm/glm-4.6) · [GLM-4.7 Blog](https://z.ai/blog/glm-4.7)

## Live Demo

**[→ Try ARIA Live](https://ariaoracle.lovable.app)** — Sign up, ask a research question, and watch the agents work in real-time.

**[→ Documentation](https://ariaoracle.lovable.app/docs)** — Full feature docs and architecture overview.

## Features

- **🤖 5-Agent Pipeline** — Orchestrator → Researcher → Analyst → Coder → Writer
- **⚡ Real-time SSE Streaming** — Watch agents think, plan, and act live via Server-Sent Events
- **🧠 Intelligent Intent Classification** — Auto-routes between quick chat (Gemini) and deep research (Z.AI)
- **📊 Shareable Reports** — Export as markdown, share via unique links
- **📎 File Attachments** — Upload documents for context-aware research
- **💾 Persistent Sessions** — Full conversation history with authentication
- **🌓 Dark/Light Themes** — Polished dual-theme UI
- **📱 Responsive** — Desktop and mobile ready
- **🔄 Automatic Fallback** — Z.AI → Gemini failover keeps the app running

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions, Storage) |
| **AI (Primary)** | Z.AI GLM-4-Plus & GLM-4.7 |
| **AI (Fallback)** | Google Gemini via Lovable AI Gateway |
| **Hosting** | Lovable Cloud |

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm or bun
- A Supabase project (or use Lovable Cloud)
- Z.AI API key ([get one here](https://chat.z.ai/))

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/henrysammarfo/aria-the-research-oracle.git
cd aria-the-research-oracle

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase project credentials:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# 4. Start development server
npm run dev
```

### Edge Function Secrets

The research pipeline runs in Supabase Edge Functions. Configure these secrets in your Supabase project (Settings → Edge Functions → Secrets):

| Secret | Required | Description |
|--------|----------|-------------|
| `ZAI_API_KEY` | At least one | Z.AI API key (primary AI provider) |
| `LOVABLE_API_KEY` | At least one | Lovable AI Gateway key (fallback) |

> **Tip:** Set both keys for the best experience. If Z.AI hits rate limits, ARIA seamlessly falls back to Gemini.

### Database Setup

ARIA requires these tables (auto-created via migrations):

- `profiles` — User profiles with theme preferences
- `research_sessions` — Persisted research sessions with reports
- `chat_messages` — Conversation history

All tables have Row-Level Security (RLS) enabled.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── dashboard/       # Chat UI, agent stream, session history
│   │   ├── docs/            # Documentation hub
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # useChat, useAuth, useSessionHistory
│   ├── lib/                 # AI pipeline, utilities
│   ├── pages/               # Dashboard, Auth, Docs, Settings
│   └── types/               # TypeScript types (AgentEvent, etc.)
├── supabase/
│   └── functions/
│       ├── aria-research/   # Deep research pipeline (5-agent)
│       ├── aria-chat/       # Quick chat with intent classification
│       └── delete-account/  # Account deletion
└── public/                  # Static assets
```

## For Judges / Reviewers

### Option 1 — Live Demo (Recommended)

Visit **[ariaoracle.lovable.app](https://ariaoracle.lovable.app)**, sign up, and run a research query. The full 5-agent pipeline streams in real-time.

### Option 2 — Clone & Run

1. Clone, install, and configure `.env` (see [Quick Start](#quick-start))
2. Create your own Supabase project and deploy edge functions
3. Set `ZAI_API_KEY` and/or `LOVABLE_API_KEY` in edge function secrets
4. Run `npm run dev` and test from the Dashboard

### E2E Pipeline Test

```bash
npm run test:e2e-pipeline
```

Verifies the full pipeline returns a report (~2–3 minutes).

> **No API keys or credentials are shared by the authors.** Use the live demo or your own keys.

## Deploy

- **Lovable:** Open project → Share → Publish
- **GitHub → Lovable:** Push to GitHub, changes auto-sync to Lovable
- **Custom Domain:** Project → Settings → Domains

---

<p align="center">
  <strong>ARIA — Autonomous Research Intelligence Agent</strong><br/>
  Powered by Z.AI GLM · Built with Lovable
</p>
