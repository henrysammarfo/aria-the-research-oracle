/**
 * Simple OpenAI test: one chat completion to verify API key works.
 * Usage:
 *   OPENAI_API_KEY=your_key node scripts/test-openai.mjs
 *
 * No Supabase or edge function involved.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

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
} catch {}

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("OPENAI_API_KEY not set. Run: OPENAI_API_KEY=your_key node scripts/test-openai.mjs");
  process.exit(1);
}

console.log("OpenAI quick test");
console.log("Model:", MODEL);
console.log("");

const start = Date.now();
try {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: "Reply with exactly: OpenAI works." }],
      max_tokens: 20,
    }),
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  if (!res.ok) {
    const text = await res.text();
    console.error("Request failed:", res.status, text);
    process.exit(1);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content?.trim() || "";

  console.log("Response (" + elapsed + "s):", content || "(empty)");
  console.log("");
  if (content) {
    console.log("OpenAI is working. Model", MODEL, "responded successfully.");
    process.exit(0);
  } else {
    console.error("Unexpected response shape:", JSON.stringify(data).slice(0, 200));
    process.exit(1);
  }
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
