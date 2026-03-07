import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    if (!lastUserMsg) {
      return new Response(
        JSON.stringify({ error: "No user message found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Classify whether this needs deep research using tool calling
    const classifyResp = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You decide if a user message needs a quick chat answer or a deep research report.

Call the classify tool with your decision.

Use "deep_research" when the user:
- Asks for comprehensive analysis, comparison, or investigation
- Wants a detailed report with sources/citations
- Uses words like "research", "analyze in depth", "comprehensive", "report", "deep dive", "investigate"
- Asks complex multi-faceted questions that need structured analysis
- Requests comparisons of multiple items with evidence

Use "quick_chat" for:
- Simple factual questions
- Casual conversation
- Quick opinions or summaries
- Code help or debugging
- Definitions or explanations
- Follow-up questions about a previous report`,
          },
          lastUserMsg,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify",
              description: "Classify the user intent",
              parameters: {
                type: "object",
                properties: {
                  mode: {
                    type: "string",
                    enum: ["quick_chat", "deep_research"],
                  },
                },
                required: ["mode"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify" } },
        stream: false,
      }),
    });

    let needsResearch = false;
    if (classifyResp.ok) {
      try {
        const classifyData = await classifyResp.json();
        const toolCall = classifyData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const args = JSON.parse(toolCall.function.arguments);
          needsResearch = args.mode === "deep_research";
        }
      } catch {
        // Classification failed, default to quick chat
      }
    } else {
      await classifyResp.text(); // consume body
    }

    // If deep research is needed, signal the frontend
    if (needsResearch) {
      return new Response(
        JSON.stringify({
          action: "deep_research",
          query: lastUserMsg.content,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Quick chat — stream response
    const trimmedMessages = messages.slice(-20);

    const response = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are ARIA, an intelligent research assistant. You help users with questions, analysis, and information.

Provide concise, helpful answers using markdown formatting.
Be conversational, helpful, and precise.
When you don't know something, say so honestly.
If the user's question would genuinely benefit from a comprehensive multi-source research report, mention they can toggle "Deep Research" mode for that.`,
          },
          ...trimmedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please wait a moment before sending another message." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("aria-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
