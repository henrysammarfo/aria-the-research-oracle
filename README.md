# ARIA — Autonomous Research Intelligence Agent

**Don't Google It. ARIA It.** — Production-grade autonomous research powered by **Z.AI GLM series models**.

ARIA turns a single research question into a structured report by running a multi-agent pipeline: orchestration → research synthesis → deep analysis → code/data visualization → report writing. Each agent is powered by Z.AI's GLM models.

## Powered by Z.AI GLM

ARIA uses Z.AI's GLM series as the **core** LLM component, with **Lovable/Gemini as fallback** when Z.AI is rate-limited or out of credits so the app stays live.

| Agent | Model (Z.AI) | Concurrency | Fallback | Role |
|-------|----------------|-------------|----------|------|
| Orchestrator | GLM-4-Plus | 20 | Gemini | Task decomposition, planning, source extraction |
| Researcher | GLM-4-Plus | 20 | Gemini | Research synthesis, citations, data points |
| Analyst | GLM-4.7 | 3 | Gemini | Deep reasoning, confidence scores, contradictions |
| Coder | GLM-4.7 | 3 | Gemini | Python (pandas/matplotlib), data analysis & charts |
| Writer | GLM-4-Plus | 20 | Gemini | Final report (markdown, executive summary, sources) |

When Z.AI returns 429 (rate limit) or 402 (credits), ARIA automatically uses Lovable’s Gemini for that call. Set **both** `ZAI_API_KEY` and `LOVABLE_API_KEY` in Supabase Edge Function secrets for best experience.

[Z.AI API](https://docs.z.ai/api-reference/llm/chat-completion) · [GLM-4.6](https://docs.z.ai/guides/llm/glm-4.6) · [GLM-4.7](https://z.ai/blog/glm-4.7)

## Live demo

**[Try ARIA →](https://ariaoracle.lovable.app)** (Live on Lovable Cloud)

## What ARIA does

1. You enter a research question.
2. **Orchestrator** (GLM-4-Plus, concurrency 20) decomposes it into subtasks (research → analyze → code → write).
3. **Researcher** (GLM-4-Plus, 20) produces a synthesis with 8–12 data points and 5–8 sources.
4. **Analyst** (GLM-4.7) returns key findings with confidence scores and limitations.
5. **Coder** (GLM-4.7) generates Python for data and charts.
6. **Writer** (GLM-4-Plus, 20) produces the final report (summary, findings, tables, sources).
7. You get a shareable report and optional session history. If Z.AI is rate-limited or out of credits, Lovable/Gemini is used automatically so the app keeps working.

## Tech stack

- **Frontend:** Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend:** Supabase (Auth, DB, Edge Functions)
- **AI:** Z.AI GLM API (primary: `glm-4-plus` concurrency 20, `glm-4.7` concurrency 3) with **Lovable/Gemini fallback** via Edge Function
- **Hosting:** Lovable Cloud (or self-host)

## Run locally

```sh
git clone https://github.com/henrysammarfo/aria-the-research-oracle.git
cd aria-the-research-oracle
cp .env.example .env
# Edit .env: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see below)
npm i
npm run dev
```

**Env:** Copy `.env.example` to `.env` and set with **your own** Supabase project (Settings → API): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. The pipeline runs in Supabase Edge Functions; use your project and your secrets (see [For judges](#for-judges--reviewers-clone-and-run) for full steps).

Pipeline needs **at least one** of these in **your** Supabase Edge Function secrets:
- **ZAI_API_KEY** (primary): Z.AI API key. Get a key at [Z.AI Open Platform](https://chat.z.ai/). Use your **API key** (the long value, e.g. `your-api-id.xxxx`) — not the API ID alone.
- **LOVABLE_API_KEY** (fallback): Lovable’s AI gateway key. When Z.AI returns 429 (rate limit) or 402 (credits), ARIA uses Lovable/Gemini. Set both for best experience.

Details:
  - Z.AI: ARIA uses **GLM-4-Plus** (concurrency 20) for Orchestrator, Researcher, Writer — better for free tier — and **GLM-4.7** (concurrency 3) for Analyst and Coder. Agents run sequentially. When Z.AI returns 429 or 402, ARIA switches to Lovable/Gemini for that call.
  - **Free tier / no credits:** If you see “AI credits exhausted”, that’s Z.AI 402; with `LOVABLE_API_KEY` set, the next call will use Gemini and the pipeline continues.

Without **both** keys, set at least one; the pipeline will use Z.AI only if `ZAI_API_KEY` is set, or Lovable only if `LOVABLE_API_KEY` is set.

## For judges / reviewers (clone and run)

**Option 1 — Live demo (no clone):** Use the **[live demo](https://ariaoracle.lovable.app)** from our submission. Sign in and run a research query to see the full pipeline.

**Option 2 — Clone and run locally (use your own backend):**

1. **Clone and install**
   ```sh
   git clone https://github.com/henrysammarfo/aria-the-research-oracle.git
   cd aria-the-research-oracle
   npm i
   ```

2. **Configure env**
   - Copy `.env.example` to `.env`.
   - Create your **own** Supabase project at [supabase.com](https://supabase.com).
   - Deploy the Edge Function: link your repo and deploy `supabase/functions/aria-research`, or use Supabase CLI.
   - In Supabase → Project Settings → Edge Functions → Secrets, set **your** `ZAI_API_KEY` and/or `LOVABLE_API_KEY` (get Z.AI key at [chat.z.ai](https://chat.z.ai/)).
   - In `.env`, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from **your** project (Supabase dashboard → Settings → API).

3. **Run**
   ```sh
   npm run dev
   ```
   Open the URL shown, go to Dashboard, and run a research query. The pipeline uses your Supabase project and your API keys.

4. **Optional — E2E test**
   ```sh
   npm run test:e2e-pipeline
   ```
   Verifies the pipeline returns a report (~2–3 min). Uses the Supabase URL and anon key from your `.env`.

**No API keys or credentials are shared by the authors.** Use the live demo or your own Supabase project and your own keys.

## Deploy

- **Lovable:** Open your [Lovable project](https://lovable.dev/projects/ea800b9d-669a-46b5-959e-d1704e333397) → **Share → Publish**.  
- **GitHub → Lovable:** When you push this repo to GitHub, Lovable syncs automatically. You’ll see all changes (Edge Function, UI, README) in Lovable and in your live app after the next publish.
- **Custom domain:** Project → Settings → Domains → [Connect Domain](https://docs.lovable.dev/features/custom-domain#custom-domain).

## Editing the code

- **Lovable** — Edit in the app; changes sync to this repo.
- **IDE** — Clone, edit, push; changes sync to Lovable.
- **GitHub / Codespaces** — Edit in the repo as usual.

---

*ARIA — Autonomous Research Intelligence Agent · Powered by Z.AI GLM*
