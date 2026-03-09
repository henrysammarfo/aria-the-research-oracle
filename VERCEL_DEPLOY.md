# Deploy ARIA on Vercel

Frontend-only deployment. Edge functions stay on Supabase.

## 1. Connect repo

- Go to [vercel.com](https://vercel.com) → Add New → Project.
- Import `henrysammarfo/aria-the-research-oracle` (or your fork).
- Choose **main** (or your default branch).

## 2. Build settings

| Setting | Value |
|--------|--------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` (default) |

## 3. Environment variables

In Vercel → Project → **Settings → Environment Variables**, add **only these three** (public, from Supabase → Settings → API):

| Name | Value | Notes |
|------|--------|--------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your anon/public key | Anon key |
| `VITE_SUPABASE_PROJECT_ID` | Your project ref | Optional |

**Do not** add `ZAI_API_KEY` or `LOVABLE_API_KEY` to Vercel — they live only in **Lovable Cloud** (Supabase) edge function secrets (server-side). Lovable Cloud auto-configures `LOVABLE_API_KEY`; it’s encrypted and only available to edge functions at runtime.

## 4. SPA routing

The repo already includes `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This sends all routes to `index.html` so client-side routing works. No change needed.

## 5. Deploy

- Click **Deploy**. Vercel runs `npm install` and `npm run build`, then serves the `dist` folder.
- Edge functions (aria-research, aria-chat) keep running on your Supabase project; the frontend calls them via `VITE_SUPABASE_URL`.

## Troubleshooting

- **Build fails with "vite: command not found"**  
  Use **Build Command**: `npx vite build` instead of `npm run build`.

- **Blank page or 404 on refresh**  
  Ensure `vercel.json` is in the repo and contains the `rewrites` above.

- **API/SSE errors**  
  Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in Vercel and that Supabase edge function secrets (`ZAI_API_KEY`, `LOVABLE_API_KEY`) are set in Supabase.
