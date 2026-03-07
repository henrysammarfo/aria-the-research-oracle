import { Book, Code2, Lightbulb } from "lucide-react";

export type DocCategory = "all" | "guide" | "api" | "kb";

export interface DocArticle {
  id: string;
  title: string;
  summary: string;
  category: DocCategory;
  icon: typeof Book;
  content: string[];
}

export const articles: DocArticle[] = [
  {
    id: "getting-started",
    title: "Getting Started with ARIA",
    summary: "Sign up, ask your first question, and get a research report in minutes.",
    category: "guide",
    icon: Book,
    content: [
      "Create an account at ariaoracle.lovable.app/auth using your email.",
      "After verifying your email and signing in, you'll land on the Dashboard.",
      "Type any research question into the chat input — e.g. \"Compare the top 5 cloud providers in 2026.\"",
      "ARIA's multi-agent pipeline will automatically kick in: Orchestrator → Researcher → Analyst → Coder → Writer.",
      "Watch each agent stream its progress in real-time on the left panel.",
      "Once complete, your structured report appears with citations, data points, and an executive summary.",
      "Use the Share button to generate a public link, or export to PDF.",
    ],
  },
  {
    id: "quick-chat",
    title: "Quick Chat vs Deep Research",
    summary: "Understand when ARIA gives a fast answer versus a full report.",
    category: "guide",
    icon: Book,
    content: [
      "Quick Chat: Simple questions like \"What is Python?\" get an instant conversational reply powered by Gemini Flash.",
      "Deep Research: Complex queries like \"Analyze market trends in renewable energy\" trigger the full 5-agent pipeline.",
      "ARIA auto-detects intent — you don't need to toggle anything for most queries.",
      "You can force Deep Research by enabling the toggle in the chat input area.",
      "Reports from Deep Research include citations, confidence scores, and structured sections.",
    ],
  },
  {
    id: "session-history",
    title: "Managing Session History",
    summary: "View, revisit, and manage your past research sessions.",
    category: "guide",
    icon: Book,
    content: [
      "All your research sessions are saved automatically when you're signed in.",
      "Click the session history panel on the left side of the Dashboard to browse past queries.",
      "Click any session to reload its report and chat thread.",
      "Delete sessions you no longer need from the session list.",
      "Shared reports remain accessible via their public link even after deletion from your history.",
    ],
  },
  {
    id: "sharing-reports",
    title: "Sharing & Exporting Reports",
    summary: "Generate shareable links and export reports.",
    category: "guide",
    icon: Book,
    content: [
      "After a report is generated, click the Share button in the report view.",
      "A unique public link is created — anyone with the link can view the report.",
      "Reports include the full markdown content, sources, and metadata.",
      "You can copy the link to clipboard or share directly.",
    ],
  },
  {
    id: "api-overview",
    title: "API Overview",
    summary: "ARIA's backend API architecture and endpoints.",
    category: "api",
    icon: Code2,
    content: [
      "ARIA exposes two main Edge Function endpoints:",
      "POST /functions/v1/aria-chat — Quick conversational responses with auto-intent classification.",
      "POST /functions/v1/aria-research — Full multi-agent research pipeline returning structured reports.",
      "Both endpoints require a valid Supabase auth token in the Authorization header.",
      "Requests are JSON; responses are streamed (text/event-stream) for real-time agent updates.",
    ],
  },
  {
    id: "api-chat",
    title: "aria-chat Endpoint",
    summary: "Send messages for quick answers or trigger research automatically.",
    category: "api",
    icon: Code2,
    content: [
      "Endpoint: POST /functions/v1/aria-chat",
      "Headers: Authorization: Bearer <access_token>, Content-Type: application/json",
      "Body: { \"message\": \"your question here\", \"conversationId\": \"uuid\" }",
      "The endpoint first classifies intent using Gemini Flash Lite.",
      "If classified as quick_chat, it streams a conversational response.",
      "If classified as deep_research, it returns { \"type\": \"deep_research\" } as JSON, signaling the client to call aria-research.",
      "Response: text/event-stream for chat, application/json for research signal.",
    ],
  },
  {
    id: "api-research",
    title: "aria-research Endpoint",
    summary: "Trigger the full 5-agent research pipeline.",
    category: "api",
    icon: Code2,
    content: [
      "Endpoint: POST /functions/v1/aria-research",
      "Headers: Authorization: Bearer <access_token>, Content-Type: application/json",
      "Body: { \"query\": \"your research question\", \"sessionId\": \"uuid\" }",
      "The pipeline runs 5 agents sequentially: Orchestrator → Researcher → Analyst → Coder → Writer.",
      "Each agent streams SSE events with type, agent name, and content.",
      "Event format: data: {\"type\":\"agent_start|agent_output|agent_complete|report\", \"agent\":\"orchestrator\", \"content\":\"...\"}",
      "Final event contains the complete report in markdown with sources array.",
      "Primary model: Z.AI GLM-4-Plus / GLM-4.7. Fallback: Lovable Gemini.",
    ],
  },
  {
    id: "api-models",
    title: "AI Models & Fallback",
    summary: "Which models power each agent and how fallback works.",
    category: "api",
    icon: Code2,
    content: [
      "Orchestrator: Z.AI GLM-4-Plus (concurrency 20) — task decomposition and planning.",
      "Researcher: Z.AI GLM-4-Plus (concurrency 20) — web research synthesis with citations.",
      "Analyst: Z.AI GLM-4.7 (concurrency 3) — deep reasoning with confidence scores.",
      "Coder: Z.AI GLM-4.7 (concurrency 3) — Python code generation for data analysis.",
      "Writer: Z.AI GLM-4-Plus (concurrency 20) — structured report with executive summary.",
      "Fallback: When Z.AI returns 429 (rate limit) or 402 (credits exhausted), ARIA automatically switches to Lovable Gemini for that call.",
      "Both ZAI_API_KEY and LOVABLE_API_KEY should be configured for the best experience.",
    ],
  },
  {
    id: "kb-agents",
    title: "Understanding ARIA's Agents",
    summary: "What each agent does and how they collaborate.",
    category: "kb",
    icon: Lightbulb,
    content: [
      "ARIA uses a multi-agent architecture where each agent has a specialized role.",
      "The Orchestrator decomposes your question into subtasks and determines the research plan.",
      "The Researcher gathers information from multiple sources, producing 8–12 data points with 5–8 citations.",
      "The Analyst applies deep reasoning, identifying contradictions and assigning confidence scores.",
      "The Coder generates Python code for data analysis and visualizations when needed.",
      "The Writer synthesizes everything into a structured report with executive summary, findings, and sources.",
      "Agents run sequentially, each building on the output of the previous one.",
    ],
  },
  {
    id: "kb-citations",
    title: "How Citations Work",
    summary: "Full provenance tracking for every claim in your report.",
    category: "kb",
    icon: Lightbulb,
    content: [
      "Every claim in an ARIA report is backed by a source citation.",
      "The Researcher agent tracks provenance as it synthesizes information.",
      "Sources include the URL, title, and relevant excerpt.",
      "Citations appear as numbered references in the report body.",
      "A full source list is provided at the end of every report.",
      "This ensures you can verify and trace every piece of information.",
    ],
  },
  {
    id: "kb-rate-limits",
    title: "Rate Limits & Credits",
    summary: "Understanding API rate limits and how ARIA handles them.",
    category: "kb",
    icon: Lightbulb,
    content: [
      "Z.AI GLM models have concurrency limits: GLM-4-Plus allows 20 concurrent requests, GLM-4.7 allows 3.",
      "If you hit a 429 (rate limit) error, ARIA automatically falls back to Lovable Gemini.",
      "A 402 error means Z.AI credits are exhausted — the same fallback applies.",
      "For best results, configure both ZAI_API_KEY and LOVABLE_API_KEY.",
      "The pipeline processes agents sequentially, so concurrency limits rarely affect single-user usage.",
    ],
  },
  {
    id: "kb-self-host",
    title: "Self-Hosting ARIA",
    summary: "Run ARIA on your own infrastructure.",
    category: "kb",
    icon: Lightbulb,
    content: [
      "Clone the repository: git clone https://github.com/henrysammarfo/aria-the-research-oracle.git",
      "Install dependencies: npm install",
      "Create a Supabase project and configure your .env with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      "Deploy Edge Functions using Supabase CLI: supabase functions deploy aria-research && supabase functions deploy aria-chat",
      "Set ZAI_API_KEY and/or LOVABLE_API_KEY in your Supabase Edge Function secrets.",
      "Run the app: npm run dev",
      "For production, use supabase db push to apply migrations and deploy the frontend to your preferred host.",
    ],
  },
];

export const categoryLabels: Record<DocCategory, string> = {
  all: "All",
  guide: "User Guides",
  api: "API Reference",
  kb: "Knowledge Base",
};
