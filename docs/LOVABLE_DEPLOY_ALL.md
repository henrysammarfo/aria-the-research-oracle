# Deploy all three Edge Functions to Lovable

**Workflow:** Lovable is disconnected from GitHub. Backend changes in Lovable deploy immediately (Vercel already uses that backend). Lovable cannot push to this repo — sync code manually. See **`docs/LOVABLE_GITHUB_VERCEL_WORKFLOW.md`** for the full picture.

Deployed function URLs (your project):

- **aria-research:** https://cgzryavrxphlrfivykdb.supabase.co/functions/v1/aria-research  
- **aria-chat:** https://cgzryavrxphlrfivykdb.supabase.co/functions/v1/aria-chat  
- **delete-account:** https://cgzryavrxphlrfivykdb.supabase.co/functions/v1/delete-account  

---

## Summary of behavior (Z.AI + OpenAI only, no Lovable)

| Function        | AI? | Behavior |
|----------------|-----|----------|
| **aria-research** | Yes | Z.AI primary → OpenAI fallback on 429/402. Rate limit: **5 requests per minute per user/IP**. 1.5s delay before first OpenAI fallback to avoid burst. |
| **aria-chat**     | Yes | Z.AI primary → OpenAI fallback. Intent classification then quick chat or `deep_research` redirect. Rate limit: **15 requests per minute per user/IP**. 1.5s delay before fallback. |
| **delete-account**| No  | No AI. Auth + delete user and storage. No code change needed; deploy as-is if you want it in sync with repo. |

**Secrets in Lovable (Edge Function secrets):** Set **ZAI_API_KEY** and **OPENAI_API_KEY** only. Do **not** set LOVABLE_API_KEY; it is not used.

---

## 1. Update and deploy `aria-research`

1. In Lovable, open the **aria-research** Edge Function.
2. Replace the **entire** `index.ts` with the contents of **`supabase/functions/aria-research/index.ts`** from this repo.
3. Deploy the function.

---

## 2. Update and deploy `aria-chat`

1. In Lovable, open the **aria-chat** Edge Function.
2. Replace the **entire** `index.ts` with the contents of **`supabase/functions/aria-chat/index.ts`** from this repo.
3. Deploy the function.

---

## 3. Deploy `delete-account` (optional)

- This function does **not** use Z.AI or OpenAI. It only deletes the authenticated user and their storage.
- To keep it in sync with the repo, replace its `index.ts` with **`supabase/functions/delete-account/index.ts`** and deploy. No new secrets required.

---

## Rate limits and abuse prevention

- **aria-research:** 5 requests per 60 seconds per user (from JWT) or per IP. Responses: `429` with message *"Too many research requests. Please wait a minute before trying again."*
- **aria-chat:** 15 requests per 60 seconds per user or per IP. Responses: `429` with message *"Too many messages. Please wait a minute before trying again."*

When Z.AI returns 429 or 402, the code waits **1.5 seconds** before calling OpenAI, so rapid repeated requests don’t all hit OpenAI at once and trigger its rate limit or burn credits.

---

## After deploying

1. Ensure **ZAI_API_KEY** and **OPENAI_API_KEY** are set in Lovable for both **aria-research** and **aria-chat** (same secrets can be used for both).
2. Test from the Vercel app: run a research query and a quick chat. If Z.AI is out of credits, you should see fallback to OpenAI and no “AI exhausted” once both keys are set and the new code is deployed.
