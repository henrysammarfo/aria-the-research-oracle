/**
 * E2E test: call the aria-research Edge Function and verify Z.AI pipeline returns a report.
 * Requires: .env with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
 * Edge Function must be deployed with ZAI_API_KEY (and/or LOVABLE_API_KEY) set in Supabase.
 *
 * Run: node scripts/e2e-pipeline-test.mjs
 * Or:  npm run test:e2e-pipeline
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env from project root
try {
  const envPath = resolve(process.cwd(), ".env");
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) {
      const k = line.slice(0, eq).trim();
      const v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
} catch {
  // .env optional if vars set elsewhere
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/aria-research`;
const TEST_QUERY = "What are three key benefits of solar energy?";
const TIMEOUT_MS = 120_000;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

console.log("E2E Pipeline Test (Z.AI / Lovable fallback)");
console.log("Endpoint:", FUNCTION_URL);
console.log("Query:", TEST_QUERY);
console.log("Timeout:", TIMEOUT_MS / 1000, "s\n");

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

try {
  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ query: TEST_QUERY }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!resp.ok) {
    const text = await resp.text();
    console.error("Request failed:", resp.status, text);
    process.exit(1);
  }

  if (!resp.body) {
    console.error("No response body");
    process.exit(1);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const events = [];
  let report = null;
  let errorMsg = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;
      try {
        const event = JSON.parse(jsonStr);
        events.push(event);
        if (event.type === "complete" && event.agent === "Orchestrator") {
          try {
            const data = JSON.parse(event.content);
            report = { title: data.title, markdown: data.markdown, sources: data.sources };
          } catch {}
        }
        if (event.type === "error") {
          errorMsg = event.content;
        }
        // Log progress
        if (event.agent && event.type) {
          console.log(`  [${event.agent}] ${event.type}: ${(event.content || "").slice(0, 60)}...`);
        }
      } catch {
        // skip partial JSON
      }
    }
  }

  if (errorMsg) {
    console.error("\nPipeline error event:", errorMsg);
    process.exit(1);
  }

  if (!report) {
    console.error("\nNo report in stream. Events:", events.length);
    process.exit(1);
  }

  console.log("\n--- Result ---");
  console.log("Title:", report.title);
  console.log("Markdown length:", report.markdown?.length ?? 0);
  console.log("Sources:", report.sources?.length ?? 0);
  console.log("\nE2E passed: Z.AI pipeline returned a valid report.");
  process.exit(0);
} catch (e) {
  clearTimeout(timeoutId);
  if (e.name === "AbortError") {
    console.error("Timeout: pipeline did not complete within", TIMEOUT_MS / 1000, "s");
  } else {
    console.error("Error:", e.message);
  }
  process.exit(1);
}
