# Lovable sync prompt — paste this into Lovable to capture and verify everything

Copy the block below into Lovable’s prompt/chat so it syncs and verifies the full ARIA + Z.AI setup.

---

**Prompt for Lovable:**

```
ARIA is our Z.AI bounty submission. Please sync and verify everything from the repo and make sure it all works.

CAPTURE & VERIFY:

1. Backend (Supabase Edge Function)
   - supabase/functions/aria-research/index.ts uses Z.AI as primary (api.z.ai, glm-4-plus for Orchestrator/Researcher/Writer, glm-4.7 for Analyst/Coder) and Lovable/Gemini as fallback when Z.AI returns 429 or 402. It reads ZAI_API_KEY and LOVABLE_API_KEY from Edge Function secrets (no keys in code). Ensure this function is deployed and that both secrets can be set in Supabase.

2. Frontend
   - Landing and dashboard unchanged in behavior. Components AgentFeaturesSection and HowItWorksSection show correct GLM model names (GLM-4.6/GLM-4.7 or GLM-4-Plus where we use it). No hardcoded API keys anywhere.

3. Env & security
   - .env is in .gitignore and never committed. .env.example has placeholders only and says judges use their own Supabase project and keys; we do not share any API keys. README says the same.

4. Docs
   - README has: Powered by Z.AI GLM table, live demo link placeholder, “Run locally” with clone + cp .env.example .env + npm i + npm run dev, “For judges” with Option 1 = live demo only, Option 2 = clone and use their own Supabase + their own ZAI_API_KEY/LOVABLE_API_KEY. No suggestion we give keys to anyone.

5. E2E test
   - scripts/e2e-pipeline-test.mjs calls the aria-research Edge Function, parses SSE, and checks for a complete report. npm run test:e2e-pipeline runs it. It uses VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from .env only.

6. TypeScript
   - tsconfig.app.json does NOT include "types": ["vitest/globals"] so the app builds without vitest type errors. Vitest is for tests only.

Please:
- Sync all of the above from the repo.
- Confirm the Edge Function is deployed and the pipeline runs (Z.AI or Lovable fallback).
- Confirm the app builds (npm run build) and that there are no broken imports or missing modules (framer-motion, lucide-react, react).
- Keep the live demo working and ensure “Publish” uses the latest code and function.
```

---

Use this in Lovable after pushing to GitHub so Lovable captures the repo state and can verify build, deploy, and pipeline.
