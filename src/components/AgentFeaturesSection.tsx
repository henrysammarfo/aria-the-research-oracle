import { motion } from "framer-motion";
import { Search, Brain, Code, FileText, ArrowRight } from "lucide-react";

const agents = [
  {
    name: "Researcher",
    icon: Search,
    model: "GLM-4-Plus",
    tagline: "Finds what others miss",
    description:
      "Deploys Tavily-powered web search across 50+ sources per query. Fetches, parses, and cross-references pages — building a citation graph before the Analyst even starts.",
    accent: "#3B82F6",
    capabilities: ["Web Search", "Source Extraction", "Citation Graph"],
    livePreview: "Searching 47 sources for 'AI regulation EU 2025'...",
  },
  {
    name: "Analyst",
    icon: Brain,
    model: "GLM-Z1 (Reasoning)",
    tagline: "Thinks deeper than you'd expect",
    description:
      "The only agent running on Z1's reasoning model. It doesn't summarize — it challenges, cross-examines, and stress-tests every claim against the evidence. Outputs numbered findings with confidence scores.",
    accent: "#A855F7",
    capabilities: ["Chain-of-Thought", "Claim Verification", "Confidence Scoring"],
    livePreview: "<think> Cross-referencing claim #3 against sources [4,7,12]...",
  },
  {
    name: "Coder",
    icon: Code,
    model: "GLM-4-Plus",
    tagline: "Runs the numbers. Literally.",
    description:
      "Generates Python analysis code, validates it via AST parsing for security, then executes in a 10-second sandboxed subprocess. Matplotlib charts are embedded directly into the final report.",
    accent: "#10B981",
    capabilities: ["AST Validation", "Sandbox Exec", "Chart Generation"],
    livePreview: "import pandas as pd; df = pd.read_csv...",
  },
  {
    name: "Writer",
    icon: FileText,
    model: "GLM-4-Plus",
    tagline: "Your findings, publication-ready",
    description:
      "Takes raw agent outputs and crafts a structured report: executive summary, numbered findings, inline citations, data tables, and charts. Exports to Markdown, styled HTML, and PDF via WeasyPrint.",
    accent: "#F59E0B",
    capabilities: ["Executive Summary", "Inline Citations", "PDF Export"],
    livePreview: "## Key Finding #1: EU AI Act enforcement...",
  },
];

const AgentFeaturesSection = () => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "#000", padding: "140px 0 120px" }}
    >
      {/* Divider */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: "80%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />

      {/* Header — left-aligned for editorial feel */}
      <motion.div
        className="mx-auto px-6 md:px-16"
        style={{ maxWidth: 1100 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20">
          <div style={{ maxWidth: 560 }}>
            <span
              className="inline-block font-mono tracking-wider mb-4"
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              // agent_registry
            </span>
            <h2
              className="font-medium"
              style={{
                fontSize: "clamp(32px, 4.5vw, 48px)",
                lineHeight: 1.15,
                color: "#fff",
              }}
            >
              Four agents.
              <br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>
                Zero hand-holding.
              </span>
            </h2>
          </div>
          <p
            className="font-normal"
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.35)",
              maxWidth: 340,
            }}
          >
            Each agent is purpose-built for one job, powered by the optimal GLM
            model, and orchestrated to work in dependency order — not in
            parallel-for-show.
          </p>
        </div>
      </motion.div>

      {/* Agent Cards — stacked full-width rows */}
      <div
        className="mx-auto px-6 md:px-16 flex flex-col"
        style={{ maxWidth: 1100, gap: 2 }}
      >
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            className="group relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderTop: i === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            }}
          >
            {/* Hover accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: agent.accent }}
            />

            <div
              className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10"
              style={{ padding: "28px 32px" }}
            >
              {/* Left: Icon + Name block */}
              <div className="flex items-center gap-4 md:w-56 flex-shrink-0">
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: 44,
                    height: 44,
                    border: `1px solid ${agent.accent}33`,
                    color: agent.accent,
                  }}
                >
                  <agent.icon size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium" style={{ fontSize: 16 }}>
                    {agent.name}
                  </h3>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {agent.model}
                  </span>
                </div>
              </div>

              {/* Middle: Description */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium mb-1"
                  style={{ fontSize: 13, color: agent.accent }}
                >
                  {agent.tagline}
                </p>
                <p
                  className="font-normal"
                  style={{
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {agent.description}
                </p>
              </div>

              {/* Right: Live preview snippet */}
              <div
                className="hidden lg:block flex-shrink-0 rounded-lg font-mono overflow-hidden"
                style={{
                  width: 260,
                  padding: "12px 16px",
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.25)",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span style={{ color: `${agent.accent}88` }}>▸ </span>
                {agent.livePreview}
              </div>

              {/* Arrow */}
              <ArrowRight
                size={16}
                className="hidden md:block flex-shrink-0 text-white/10 group-hover:text-white/30 transition-colors duration-200"
              />
            </div>

            {/* Capabilities row */}
            <div
              className="flex flex-wrap gap-2"
              style={{ padding: "0 32px 20px" }}
            >
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="rounded font-mono"
                  style={{
                    fontSize: 10,
                    padding: "3px 10px",
                    color: `${agent.accent}99`,
                    background: `${agent.accent}0A`,
                    border: `1px solid ${agent.accent}15`,
                    letterSpacing: "0.03em",
                  }}
                >
                  {cap}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AgentFeaturesSection;
