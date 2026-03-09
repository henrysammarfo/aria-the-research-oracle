# LOVABLE BATCH 1 — Paste this into Lovable first

Copy everything below the line and paste into Lovable.

---

Our GitHub repo is disconnected from Lovable. Lovable is our Supabase backend (auth, DB, Edge Functions). Vercel hosts the frontend. **Auth redirect and secrets (ZAI_API_KEY, OPENAI_API_KEY) are already set.** Apply the following.

1) **AI CHAIN: Z.AI + OPENAI ONLY** (no Lovable/Gemini). Both Edge Functions **aria-research** and **aria-chat** must use Z.AI as primary and OpenAI (gpt-4o-mini) as fallback when Z.AI returns 429 or 402.

2) **RATE LIMITS** (in the code in the next batches): aria-research = 5 requests per minute per user/IP; aria-chat = 15 per minute. When falling back from Z.AI to OpenAI, the code waits 1.5 seconds to avoid burst rate limits and protect OpenAI credits.

3) **NEXT:** Replace the entire index.ts for **aria-research** and **aria-chat** with the code from our repo (see next batches / file paths in LOVABLE_SUPER_PROMPT.md), then deploy both functions.
