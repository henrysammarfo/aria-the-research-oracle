# ARIA — Project Summary & Deployment Reference

Quick reference from Lovable for architecture, env, and deployment.

## Project Summary

ARIA is a **5-agent AI research platform**. Key components:

### Architecture

| Layer | Stack |
|-------|--------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind, shadcn/ui, Framer Motion |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions, Storage) |
| **AI** | Z.AI GLM-4-Plus & GLM-4.7 (primary) → Lovable AI / Gemini (fallback) |

### Edge Functions (3)

| Function | Purpose |
|----------|---------|
| **aria-research** | 5-agent deep research pipeline (SSE streaming) |
| **aria-chat** | Quick chat with intent classification (routes to research when needed) |
| **delete-account** | Account deletion |

### Database Tables

- **profiles** — User profiles, theme preferences
- **research_sessions** — Saved research with reports, share IDs
- **chat_messages** — Conversation history

Backend (Supabase) is **Lovable Cloud** — same project as the frontend; edge functions and secrets are managed there.

### Storage Buckets

- **avatars** (public)
- **research-attachments** (public)

### Pages

| Route | Page |
|-------|------|
| `/` | Landing |
| `/dashboard` | Main app (chat + research) |
| `/auth` | Sign in / Sign up |
| `/docs` | Documentation |
| `/settings` | User settings |
| `/reset-password` | Password reset |
| `/report/:shareId` | Public shared report |

---

## Environment Variables

### Frontend (required)

Set these in `.env` (copy from `.env.example`). Get values from your Supabase project: **Settings → API**.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Edge Function Secrets

Configure in **Lovable Cloud** (or Supabase → Project Settings → Edge Functions → Secrets) if you self-host:

| Secret | Purpose |
|--------|---------|
| **ZAI_API_KEY** | Your Z.AI API key (primary AI). Add in Lovable/Supabase edge function secrets if you deploy yourself. |
| **LOVABLE_API_KEY** | Lovable AI Gateway (Gemini fallback). **Auto-configured in Lovable Cloud** — encrypted, not readable. No need to add to `.env` or Vercel. |

**Local / Vercel:** Only the three `VITE_*` vars go in `.env` or Vercel env. They point at your **Lovable Cloud (Supabase)** project. The frontend calls those deployed edge functions; `ZAI_API_KEY` and `LOVABLE_API_KEY` are used only on the server.

---

## Vercel Deployment

Frontend-only: Vite + React SPA. Edge functions stay on Supabase.

1. **Connect** the repo to Vercel.
2. **Environment variables** (Vercel → Project Settings → Environment Variables): add the three `VITE_*` vars above.
3. **Build:** Build command `npm run build`, output directory `dist`.
4. **SPA routing:** `vercel.json` is already in the repo:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
5. Edge functions continue to use your Supabase project URL; no change needed for them.

---

## Local Testing

```bash
git clone https://github.com/henrysammarfo/aria-the-research-oracle.git
cd aria-the-research-oracle
npm install
cp .env.example .env   # fill in VITE_* from your Supabase project
npm run dev            # dev server (e.g. :8080)
npm test               # Vitest unit tests
npm run test:e2e-pipeline   # E2E pipeline test (calls deployed edge functions)
```

**Note:** Edge functions don’t run locally unless you use Supabase CLI (`supabase functions serve`). The E2E test hits your **deployed** Supabase edge function, so it works as long as `.env` points at that project.

---

*Reference: Lovable project summary. Keep env values in `.env` (gitignored); never commit secrets.*
