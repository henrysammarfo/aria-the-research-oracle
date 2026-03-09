# ARIA — Autonomous Research Intelligence Agent

**Don't Google It. ARIA It.** — Production-grade autonomous research powered by **Z.AI GLM** with OpenAI fallback.

ARIA turns a research question into a structured report via a multi-agent pipeline: orchestration → research synthesis → analysis → code/data viz → report writing.

**Backend:** Supabase (auth, DB, Edge Functions) is managed by **Lovable Cloud** — Lovable *is* our Supabase. There is no separate Supabase dashboard login; Lovable manages the project and Edge Function secrets. The frontend (Vercel or local) **calls** this backend using the Supabase URL and anon key. The GitHub repo is **disconnected** from Lovable, so any edits in the repo must be communicated to Lovable (e.g. via `docs/LOVABLE_SYNC_PROMPT.md`) so the backend stays in sync.

---

## Quick start (clone and run locally)

```bash
git clone https://github.com/henrysammarfo/aria-the-research-oracle.git
cd aria-the-research-oracle
cp .env.example .env
npm install
npm run dev
```

Open the URL shown (e.g. http://localhost:5173). Go to Dashboard and run a research query. For local test, fill `.env` with your Supabase URL and anon key (from Lovable Cloud for this project, or your own). Z.AI and OpenAI keys live in **Lovable** (Edge Function secrets), not in `.env` — the frontend only needs the Supabase keys to call the backend.

**Local verification before PR / Vercel**

1. `.env` has `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` (from Lovable for this project).
2. In Lovable, set Edge Function secrets: `ZAI_API_KEY`, `OPENAI_API_KEY`.
3. `npm run build` — must succeed (Vercel runs this).
4. `npm run test:e2e-pipeline` — calls the backend; takes ~2–3 min. Optional: `npm run verify` runs build then e2e.

---

## For judges / reviewers

**Option A — Live demo**  
Use the **Vercel deployment URL** from our submission. Sign in and run a query to test the full pipeline.

**Option B — Clone and test locally**  
Follow [Quick start](#quick-start-clone-and-run-locally) above. Copy `.env.example` to `.env` and add the Supabase URL and anon key (from Lovable for this project, or your own backend).

**Optional — E2E pipeline test**

```bash
npm run test:e2e-pipeline
```

Runs one full pipeline and checks that a report is returned (~2–3 min). Uses `.env` for the Supabase endpoint.

---

## Deploy on Vercel

1. **Import** the repo in [Vercel](https://vercel.com) (e.g. from GitHub).
2. **Environment variables** (Vercel → Project → Settings → Environment Variables): add the same three vars from `.env.example` (use your real values — from Lovable Cloud for this project or your own Supabase):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
3. **Deploy** — Vercel uses `vercel.json` (build: `npm run build`, output: `dist`, SPA rewrites). Frontend is on Vercel; the research pipeline runs on the Lovable-managed Edge Function.

Z.AI and OpenAI keys live only in **Lovable Cloud** (Edge Function secrets). They are not in the repo and not in Vercel env.

---

## Backend (Lovable Cloud)

The pipeline runs in **Supabase Edge Functions** managed by **Lovable Cloud**. Z.AI and OpenAI keys are set as **secrets in Lovable** (Edge Function secrets), not in `.env` or the repo. If you deploy your own copy of the Edge Function (e.g. your own Supabase project), you would set there:

- **ZAI_API_KEY** — [Z.AI Open Platform](https://chat.z.ai/) (full API key)
- **OPENAI_API_KEY** — [OpenAI API keys](https://platform.openai.com/api-keys) (fallback when Z.AI is rate-limited)

---

## What ARIA does

1. You enter a research question.
2. **Orchestrator** (Z.AI GLM-4-Plus) decomposes it into subtasks.
3. **Researcher** (GLM-4-Plus) produces a synthesis with data points and sources.
4. **Analyst** (GLM-4.7) returns findings with confidence scores.
5. **Coder** (GLM-4.7) generates Python for data and charts.
6. **Writer** (GLM-4-Plus) produces the final report (markdown, summary, citations).
7. You get a shareable report and session history.

---

## Project structure

```
aria-the-research-oracle/
├── src/                    # Frontend (Vite + React)
│   ├── components/         # UI components
│   ├── pages/              # Routes (Index, Dashboard, Settings, etc.)
│   ├── lib/                # API client, pipeline caller
│   ├── hooks/              # Auth, session history
│   └── integrations/      # Supabase client
├── supabase/
│   └── functions/
│       └── aria-research/  # Edge Function: Z.AI + OpenAI pipeline
├── scripts/
│   └── e2e-pipeline-test.mjs   # E2E test for pipeline
├── .env.example            # Copy to .env; Supabase URL + anon key (from Lovable or your own)
├── docs/
│   └── LOVABLE_SYNC_PROMPT.md   # Tell Lovable when repo changes (repo is disconnected)
├── vercel.json             # Vercel build and SPA config
└── package.json
```

---

## Tech stack

- **Frontend:** Vite, TypeScript, React, shadcn-ui, Tailwind CSS  
- **Backend:** Supabase (Auth, DB, Edge Functions) — Lovable Cloud  
- **AI:** Z.AI GLM (primary), OpenAI (fallback), via Edge Function  
- **Deploy:** Vercel (frontend), Lovable Cloud (backend)

---

*ARIA — Autonomous Research Intelligence Agent · Powered by Z.AI GLM*
