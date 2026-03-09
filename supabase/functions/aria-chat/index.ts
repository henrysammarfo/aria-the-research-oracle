import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ZAI_GATEWAY = "https://api.z.ai/api/paas/v4/chat/completions";
const OPENAI_GATEWAY = "https://api.openai.com/v1/chat/completions";
const ZAI_CHAT_MODEL = "glm-4-plus";
const OPENAI_CHAT_MODEL = "gpt-4o-mini";

// Rate limit: max chat requests per window per key. Protects OpenAI credits and reduces abuse.
const RATE_LIMIT_REQUESTS = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;
const FALLBACK_DELAY_MS = 1500;

const requestTimestamps: Map<string, number[]> = new Map();

function getRateLimitKey(req: Request): string {
  const auth = req.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const token = auth.slice(7);
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.sub) return `u:${payload.sub}`;
    } catch {
      // ignore
    }
  }
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon";
  return `ip:${ip}`;
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  let list = requestTimestamps.get(key) ?? [];
  list = list.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (list.length >= RATE_LIMIT_REQUESTS) return false;
  list.push(now);
  requestTimestamps.set(key, list);
  return true;
}

async function classifyIntent(
  zaiKey: string | undefined,
  openaiKey: string | undefined,
  userContent: string
): Promise<"quick_chat" | "deep_research"> {
  const systemPrompt = `You decide if the user message needs a quick chat answer or a deep research report.
Reply with exactly one word: QUICK_CHAT or DEEP_RESEARCH.

Use DEEP_RESEARCH when the user:
- Asks for comprehensive analysis, comparison, or investigation
- Wants a detailed report with sources/citations
- Uses words like "research", "analyze in depth", "comprehensive", "report", "deep dive", "investigate"
- Asks complex multi-faceted questions that need structured analysis

Use QUICK_CHAT for simple factual questions, casual conversation, quick opinions, code help, definitions, follow-ups.`;

  const call = async (url: string, key: string, model: string): Promise<string> => {
    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        stream: false,
      }),
    });
    if (!resp.ok) throw new Error(`AI call failed (${resp.status}): ${await resp.text()}`);
    const data = await resp.json();
    return (data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning_content || "").trim().toUpperCase();
  };

  if (zaiKey) {
    try {
      const out = await call(ZAI_GATEWAY, zaiKey, ZAI_CHAT_MODEL);
      if (out.includes("DEEP_RESEARCH")) return "deep_research";
      return "quick_chat";
    } catch {
      if (openaiKey) {
        await new Promise((r) => setTimeout(r, FALLBACK_DELAY_MS));
        try {
          const out = await call(OPENAI_GATEWAY, openaiKey, OPENAI_CHAT_MODEL);
          if (out.includes("DEEP_RESEARCH")) return "deep_research";
          return "quick_chat";
        } catch {
          // default to quick_chat on fallback failure
        }
      }
    }
  }
  if (openaiKey) {
    const out = await call(OPENAI_GATEWAY, openaiKey, OPENAI_CHAT_MODEL);
    if (out.includes("DEEP_RESEARCH")) return "deep_research";
    return "quick_chat";
  }
  return "quick_chat";
}

async function streamChat(
  zaiKey: string | undefined,
  openaiKey: string | undefined,
  messages: { role: string; content: string }[]
): Promise<Response> {
  const systemContent = `You are ARIA, an intelligent research assistant. You help users with questions, analysis, and information.
Provide concise, helpful answers using markdown formatting.
Be conversational, helpful, and precise.
When you don't know something, say so honestly.
If the user's question would genuinely benefit from a comprehensive multi-source research report, mention they can use "Deep Research" for that.`;

  const body = {
    model: "",
    messages: [{ role: "system", content: systemContent }, ...messages],
    stream: true,
  };

  const tryZai = async (): Promise<Response> => {
    const resp = await fetch(ZAI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${zaiKey!}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model: ZAI_CHAT_MODEL }),
    });
    if (resp.ok && resp.body) return resp;
    throw new Error(`Z.AI ${resp.status}`);
  };

  const tryOpenAI = async (): Promise<Response> => {
    const resp = await fetch(OPENAI_GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey!}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, model: OPENAI_CHAT_MODEL }),
    });
    if (resp.ok && resp.body) return resp;
    throw new Error(`OpenAI ${resp.status}`);
  };

  if (zaiKey) {
    try {
      return new Response((await tryZai()).body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } catch {
      if (openaiKey) {
        await new Promise((r) => setTimeout(r, FALLBACK_DELAY_MS));
        try {
          return new Response((await tryOpenAI()).body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ error: "AI service temporarily unavailable. Please try again in a moment." }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }
  }
  if (openaiKey) {
    try {
      return new Response((await tryOpenAI()).body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } catch {
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
  return new Response(
    JSON.stringify({ error: "Set ZAI_API_KEY or OPENAI_API_KEY in Edge Function secrets." }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const zaiKey = Deno.env.get("ZAI_API_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!zaiKey && !openaiKey) {
    return new Response(
      JSON.stringify({ error: "Set at least one of ZAI_API_KEY or OPENAI_API_KEY in Edge Function secrets." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const rateKey = getRateLimitKey(req);
  if (!checkRateLimit(rateKey)) {
    return new Response(
      JSON.stringify({ error: "Too many messages. Please wait a minute before trying again." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();
    const lastUserMsg = [...(messages || [])].reverse().find((m: { role?: string }) => m.role === "user");
    if (!lastUserMsg?.content) {
      return new Response(
        JSON.stringify({ error: "No user message found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const needsResearch = await classifyIntent(zaiKey, openaiKey, lastUserMsg.content);
    if (needsResearch === "deep_research") {
      return new Response(
        JSON.stringify({ action: "deep_research", query: lastUserMsg.content }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedMessages = (messages as { role: string; content: string }[]).slice(-20);
    return await streamChat(zaiKey, openaiKey, trimmedMessages);
  } catch (e) {
    console.error("aria-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
