import { motion } from "framer-motion";
import { Search, Brain, Code, FileText } from "lucide-react";

const agents = [
  {
    name: "Researcher",
    icon: Search,
    model: "GLM-4-Plus",
    description:
      "Autonomously searches the web, fetches pages, and synthesizes findings with full citation tracking.",
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-400",
    capabilities: ["Web Search", "Source Extraction", "Citation Mapping"],
  },
  {
    name: "Analyst",
    icon: Brain,
    model: "GLM-Z1",
    description:
      "Deep multi-step reasoning engine that identifies patterns, challenges assumptions, and derives insights.",
    color: "from-purple-500/20 to-purple-600/5",
    borderColor: "border-purple-500/20",
    iconColor: "text-purple-400",
    capabilities: ["Deep Reasoning", "Pattern Detection", "Gap Analysis"],
  },
  {
    name: "Coder",
    icon: Code,
    model: "GLM-4-Plus",
    description:
      "Generates and executes Python analysis code in a sandboxed environment, producing charts and data insights.",
    color: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    capabilities: ["Code Generation", "Sandbox Execution", "Chart Creation"],
  },
  {
    name: "Writer",
    icon: FileText,
    model: "GLM-4-Plus",
    description:
      "Synthesizes all agent outputs into structured, cited, exportable reports with executive summaries.",
    color: "from-amber-500/20 to-amber-600/5",
    borderColor: "border-amber-500/20",
    iconColor: "text-amber-400",
    capabilities: ["Report Synthesis", "PDF Export", "Executive Summary"],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.1 + i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const AgentFeaturesSection = () => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "#000", padding: "120px 0" }}
    >
      {/* Section Header */}
      <motion.div
        className="text-center mx-auto px-6"
        style={{ maxWidth: 680 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <span
          className="inline-flex items-center rounded-full font-medium mb-6"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 12,
            gap: 6,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Multi-Agent Architecture
        </span>
        <h2
          className="font-medium mt-4"
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 1.2,
            background:
              "linear-gradient(144.5deg, #FFFFFF 28%, rgba(255,255,255,0.4) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Four Specialized Agents. One Unified Intelligence.
        </h2>
        <p
          className="text-white/50 font-normal mt-5"
          style={{ fontSize: 15, lineHeight: 1.7 }}
        >
          ARIA orchestrates a team of purpose-built AI agents, each powered by
          the optimal GLM model for its task — working together in real-time.
        </p>
      </motion.div>

      {/* Agent Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-5 mx-auto mt-16 px-6"
        style={{ maxWidth: 960 }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            custom={i}
            variants={cardVariants}
            className={`group relative rounded-2xl border ${agent.borderColor} bg-gradient-to-b ${agent.color} backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:scale-[1.02]`}
            style={{ padding: "32px 28px" }}
          >
            {/* Agent Icon + Name */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex items-center justify-center rounded-xl ${agent.iconColor}`}
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <agent.icon size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium" style={{ fontSize: 17 }}>
                  {agent.name}
                </h3>
                <span
                  className="text-white/30 font-medium"
                  style={{ fontSize: 11, letterSpacing: "0.05em" }}
                >
                  {agent.model}
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              className="text-white/50 font-normal mb-5"
              style={{ fontSize: 14, lineHeight: 1.6 }}
            >
              {agent.description}
            </p>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="rounded-full text-white/40 font-medium"
                  style={{
                    fontSize: 11,
                    padding: "4px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {cap}
                </span>
              ))}
            </div>

            {/* Subtle glow on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.03), transparent 40%)",
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default AgentFeaturesSection;
