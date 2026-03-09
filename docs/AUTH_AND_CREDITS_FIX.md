# Fix: Auth redirect + “AI credits exhausted”

Two common issues when using the Vercel app with the Lovable (Supabase) backend:

---

## 1. Email verification link goes to Lovable instead of Vercel

**Symptom:** After signup, the “Verify your email” link in the inbox takes you to an aria **lovable.app** URL instead of **aria-the-research-oracle.vercel.app**.

**Cause:** Supabase builds the confirmation link using the **Site URL** from the project. If that is set to a Lovable URL, the link points there.

**Fix (in Lovable / Supabase dashboard):**

1. Open your project in **Lovable** (or Supabase dashboard for this project).
2. Go to **Authentication → URL Configuration** (or **Auth → URL Configuration**).
3. Set **Site URL** to:
   ```text
   https://aria-the-research-oracle.vercel.app
   ```
4. In **Redirect URLs**, add the same URL if it’s not already there:
   ```text
   https://aria-the-research-oracle.vercel.app
   ```
5. Save.

New verification and password-reset emails will then point to the Vercel app. Existing emails already sent will still use the old URL.

---

## 2. “AI credits exhausted. Please add credits”

**Symptom:** When you ask a question, a popup says “AI credits exhausted. Please add credits.”

**Cause:** The pipeline uses **Z.AI** first. If Z.AI returns **402** (payment/credits), the Edge Function is supposed to fall back to **OpenAI**. That only works if:

- The **deployed** Edge Function includes the Z.AI → OpenAI fallback logic, and  
- **OPENAI_API_KEY** is set in the Edge Function secrets in Lovable.

**Fix:**

1. **Confirm Edge Function fallback**  
   The repo’s `supabase/functions/aria-research/index.ts` implements: try Z.AI → then Lovable (if key set) → then OpenAI (if key set). Sync this code to Lovable (see `docs/LOVABLE_SYNC_PROMPT.md`) so the **deployed** function has the same behavior.

2. **Set OpenAI in Lovable**  
   In Lovable, open **Edge Function → aria-research → Secrets** (or the place where you set env for that function). Add:
   - **OPENAI_API_KEY** = your OpenAI API key (starts with `sk-...`).

Then when Z.AI returns 402, the pipeline will automatically use OpenAI and the “credits exhausted” message should stop (unless OpenAI also fails).

**Check:** Run `node scripts/test-openai.mjs` locally with `OPENAI_API_KEY` in `.env` to confirm the key works.

---

## Summary

| Issue | Where to fix | What to set |
|-------|----------------|-------------|
| Verify link → wrong domain | Lovable/Supabase → Auth → URL Configuration | **Site URL** = `https://aria-the-research-oracle.vercel.app`, and add it to **Redirect URLs** |
| “Credits exhausted” | Lovable → Edge Function `aria-research` → Secrets | **OPENAI_API_KEY** = your OpenAI key; ensure deployed code has Z.AI → OpenAI fallback |
