# Lovable = our Supabase. Repo is disconnected — tell Lovable when we change things.

**How it works**

- **Lovable** is our backend: it serves as our Supabase (auth, DB, Edge Functions). There is no separate Supabase login; Lovable manages the project and secrets.
- **Vercel** (and local `npm run dev`) is the frontend. It **calls** that backend using the **Supabase URL and anon key**. So: same keys in `.env` (local) or in Vercel env vars → frontend fetches/auth against the Lovable-managed Supabase.
- **Repo is disconnected from Lovable.** Changes we make in the GitHub repo do **not** sync to Lovable. So whenever we edit the Edge Function, env setup, or anything the backend needs, we have to **tell Lovable** (e.g. paste this prompt or the changed code) so Lovable can update its project.

Use the prompt below in Lovable to bring its project in line with the repo. Repeat or update it whenever we change something in the repo that affects the backend or how Vercel/local should call it.

---

## Prompt to paste into Lovable

**Context:** Our GitHub repo is disconnected from Lovable. Lovable serves as our Supabase (auth, DB, Edge Functions). Vercel hosts the frontend and calls this backend using the Supabase URL and anon key. Any edits we make in the repo must be communicated here so Lovable can update. Please apply the following so the project matches the repo.

**1. Backend (Lovable = our Supabase)**

- Edge Function `aria-research`: primary LLM is Z.AI (`https://api.z.ai/api/paas/v4/chat/completions`), models `glm-4-plus` / `glm-4.7`. Fallback: OpenAI (`https://api.openai.com/v1/chat/completions`, `gpt-4o-mini`) when Z.AI returns 429 or 402.
- Secrets in Lovable (Edge Function secrets): `ZAI_API_KEY`, `OPENAI_API_KEY`. Optional: `LOVABLE_API_KEY`.
- Request: `POST` body `{ query: string }`. Response: SSE stream of events; final event `type: "complete"`, `agent: "Orchestrator"`, `content` = JSON string `{ title, markdown, sources }`.

**2. How the frontend calls the backend**

- Frontend (Vercel or local) only needs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. It uses these to call your Supabase (Lovable). No API keys in the frontend.
- Local: copy `.env.example` to `.env` and set those three (from Lovable for this project). Vercel: set the same three in Environment Variables. Then Vercel/local can fetch and auth against this backend.

**3. Deploy this Edge Function code (fixes credits fallback)**

- The repo has the full, up-to-date `aria-research` Edge Function with **Z.AI primary → OpenAI fallback** on 429/402. Lovable’s deployed version may be older and not do the fallback.
- **Action:** Open `docs/LOVABLE_EDGE_FUNCTION_ARIA_RESEARCH.md` in the repo, copy the entire `index.ts` code block, and in Lovable replace the **entire** `aria-research` function code with it, then deploy. No need to change secrets if `ZAI_API_KEY` and `OPENAI_API_KEY` are already set.

**4. Auth redirect (Vercel app)**

- **Site URL:** In Auth → URL Configuration, set **Site URL** to `https://aria-the-research-oracle.vercel.app` so email verification and password-reset links go to the Vercel app, not lovable.app. Add that URL to **Redirect URLs** as well. See `docs/AUTH_AND_CREDITS_FIX.md` for full steps.

**5. Repo changes → tell Lovable**

- When we change the Edge Function or backend contract in the repo, we will paste updated instructions or code here so you can update the Lovable project. Keep the project in sync with the repo manually.

---

Use this whenever the repo has been updated and Lovable needs to match.
