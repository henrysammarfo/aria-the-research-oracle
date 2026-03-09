/**
 * Simple Z.AI test: one chat completion to verify API key and model work.
 * Usage:
 *   Set ZAI_API_KEY in .env (temporarily), then: node scripts/test-zai.mjs
 *   Or: ZAI_API_KEY=your_key node scripts/test-zai.mjs
 *
 * Uses free model glm-4.5-flash. No Supabase or edge function involved.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env
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

const ZAI_URL = "https://api.z.ai/api/paas/v4/chat/completions";
const MODEL = "glm-4.5-flash"; // free model
const apiKey = process.env.ZAI_API_KEY;

if (!apiKey) {
  console.error("ZAI_API_KEY not set. Add it to .env or run: ZAI_API_KEY=your_key node scripts/test-zai.mjs");
  process.exit(1);
}

console.log("Z.AI quick test");
console.log("Model:", MODEL);
console.log("Endpoint:", ZAI_URL);
console.log("");

const start = Date.now();
try {
  const res = await fetch(ZAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: "Reply with exactly: Z.AI works." }],
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
    console.log("Z.AI is working. Model", MODEL, "responded successfully.");
    process.exit(0);
  } else {
    console.error("Unexpected response shape:", JSON.stringify(data).slice(0, 200));
    process.exit(1);
  }
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}
