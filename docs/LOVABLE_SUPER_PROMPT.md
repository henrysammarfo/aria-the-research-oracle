# Super prompt for Lovable — copy-paste in batches

Paste each **BATCH** into Lovable in order. Lovable should accept multiple pastes (batches). After all batches, deploy **aria-research** and **aria-chat** in Lovable.

---

## BATCH 1 — Context and what to do

**File to copy from:** `docs/LOVABLE_BATCH_1_CONTEXT_AND_CONFIG.md`  
Or copy the block below and paste into Lovable.

```
Our GitHub repo is disconnected from Lovable. Lovable is our Supabase backend (auth, DB, Edge Functions). Vercel hosts the frontend. Auth redirect and secrets (ZAI_API_KEY, OPENAI_API_KEY) are already set. Apply the following.

1) AI CHAIN: Z.AI + OPENAI ONLY (no Lovable/Gemini). Both Edge Functions aria-research and aria-chat must use Z.AI as primary and OpenAI (gpt-4o-mini) as fallback when Z.AI returns 429 or 402.

2) RATE LIMITS (in the code you will paste): aria-research = 5 requests per minute per user/IP; aria-chat = 15 per minute. When falling back from Z.AI to OpenAI, the code waits 1.5 seconds to avoid burst rate limits and protect OpenAI credits.

3) NEXT: Replace the entire index.ts for aria-research and aria-chat with the code from our repo (see next batches / file paths below), then deploy both functions.
```

---

## BATCH 2 — aria-research: replace entire index.ts

In Lovable, open the **aria-research** Edge Function. Replace **all** of its code with the contents of **`supabase/functions/aria-research/index.ts`** from this repo (open that file, copy everything, paste into Lovable’s aria-research). Then deploy.

If you prefer to paste a batch to Lovable chat: say “Replace the entire aria-research Edge Function index.ts with the contents of the file supabase/functions/aria-research/index.ts from our GitHub repo (aria-the-research-oracle).” Then you still need to open that file in the repo and paste its contents into the function editor.

---

## BATCH 3 — aria-chat: replace entire index.ts

In Lovable, open the **aria-chat** Edge Function. Replace **all** of its code with the contents of **`supabase/functions/aria-chat/index.ts`** from this repo (open that file, copy everything, paste into Lovable’s aria-chat). Then deploy.

If pasting to Lovable chat: “Replace the entire aria-chat Edge Function index.ts with the contents of supabase/functions/aria-chat/index.ts from our repo.” Then paste the file contents into the function editor yourself.

---

## BATCH 4 — delete-account + checklist

**File to copy from:** `docs/LOVABLE_BATCH_4_CHECKLIST.md`  
Or copy the block below and paste into Lovable.

```
6) DELETE-ACCOUNT: The delete-account Edge Function does not use AI. To keep it in sync with the repo, replace its index.ts with the contents of supabase/functions/delete-account/index.ts from the repo and deploy. No new secrets needed.

7) CHECKLIST: (a) aria-research and aria-chat code replaced and deployed. (b) Test from Vercel: run a research query and a quick chat; when Z.AI is out of credits you should see OpenAI fallback and no "AI exhausted".
```

---

## ONE-SHOT SUPER PROMPT (paste once if Lovable accepts long messages)

Copy the entire block below and paste once into Lovable.

```
Our GitHub repo is disconnected from Lovable. Lovable is our Supabase backend (auth, DB, Edge Functions). Vercel hosts the frontend. Auth redirect and secrets are already set. Apply the following.

1) AI: Z.AI + OPENAI ONLY. aria-research and aria-chat use Z.AI primary, OpenAI (gpt-4o-mini) fallback on 429/402.

2) Replace the entire aria-research Edge Function code with the contents of supabase/functions/aria-research/index.ts from our repo (GitHub: aria-the-research-oracle). Replace the entire aria-chat Edge Function code with the contents of supabase/functions/aria-chat/index.ts. Deploy both. delete-account: optionally replace with supabase/functions/delete-account/index.ts.

3) CHECKLIST: Both functions updated and deployed; test from Vercel.
```

If Lovable cannot read your repo, you must open the repo files and paste their contents into each Edge Function in Lovable yourself after sending this prompt.

---

## File paths in repo (for manual copy)

- **aria-research:** `supabase/functions/aria-research/index.ts`
- **aria-chat:** `supabase/functions/aria-chat/index.ts`
- **delete-account:** `supabase/functions/delete-account/index.ts`

**Deployed URLs (your project):**
- https://cgzryavrxphlrfivykdb.supabase.co/functions/v1/aria-research
- https://cgzryavrxphlrfivykdb.supabase.co/functions/v1/aria-chat
- https://cgzryavrxphlrfivykdb.supabase.co/functions/v1/delete-account
