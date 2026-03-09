# Lovable ↔ GitHub ↔ Vercel — who does what

Lovable is **disconnected from GitHub**. This is how things work:

| Where | What happens |
|-------|----------------|
| **Lovable** | You (or Lovable’s AI) can edit code, deploy Edge Functions (they go live immediately), run DB migrations, manage secrets, and debug. **Lovable cannot push to your GitHub repo** — any code changes made in Lovable must be **manually synced by you** into this repo. |
| **Backend (Edge Functions, DB, secrets)** | Changes in Lovable deploy automatically. Your Vercel app and local dev already call Lovable’s Supabase, so backend updates are used as soon as they’re deployed. No GitHub push needed for backend-only changes to take effect. |
| **Frontend** | Frontend code edited **in Lovable** only appears on Lovable’s preview/published URL. It does **not** appear on your **Vercel** deployment until you copy those changes into this repo and push to GitHub (so Vercel can rebuild). |
| **This repo (GitHub)** | Edits here (e.g. in Cursor) do **not** sync to Lovable. To get backend changes live, copy the updated code into Lovable and deploy. To get frontend changes live on Vercel, push to GitHub so Vercel rebuilds. |

**Summary:** Backend in Lovable = deploy there, works for Vercel immediately. Frontend in Lovable = only on Lovable until you sync to this repo and push. This repo = source of truth for what’s on GitHub and Vercel; sync from here to Lovable when you want the backend to match.
