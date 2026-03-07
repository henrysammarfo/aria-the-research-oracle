import { motion } from "framer-motion";
import { MessageSquare, Cpu, Search, Brain, Code, FileText, FileDown, ChevronRight } from "lucide-react";

const pipeline = [
  {
    phase: "INPUT",
    icon: MessageSquare,
    label: "Your Question",
    detail: '"Analyze the economic impact of AI on software engineering jobs"',
    accent: "#fff",
  },
  {
    phase: "PLAN",
    icon: Cpu,
    label: "Orchestrator decomposes task",
    detail: "GLM-4-Plus → 5 subtasks identified → dependency graph built",
    accent: "#22D3EE",
  },
  {
    phase: "EXECUTE",
    icon: null,
    label: "Agents execute in dependency order",
    agents: [
      { icon: Search, name: "Researcher", status: "47 sources found", accent: "#3B82F6" },
      { icon: Brain, name: "Analyst", status: "5 findings, 2 gaps identified", accent: "#A855F7" },
      { icon: Code, name: "Coder", status: "3 charts generated", accent: "#10B981" },
      { icon: FileText, name: "Writer", status: "2,400 word report drafted", accent: "#F59E0B" },
    ],
    accent: "#fff",
  },
  {
    phase: "OUTPUT",
    icon: FileDown,
    label: "Structured Report",
    detail: "Executive summary + findings + charts + citations → Markdown + share link",
    accent: "#fff",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="relative w-full overflow-hidden"
      style={{ background: "#000", padding: "140px 0 120px" }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: "80%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />

      {/* Header */}
      <motion.div
        className="mx-auto px-6 md:px-16 mb-20"
        style={{ maxWidth: 1100 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div style={{ maxWidth: 520 }}>
            <span
              className="inline-block font-mono tracking-wider mb-4"
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              // execution_pipeline
            </span>
            <h2
              className="font-medium"
              style={{
                fontSize: "clamp(32px, 4.5vw, 48px)",
                lineHeight: 1.15,
                color: "#fff",
              }}
            >
              Question in.
              <br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>
                Report out.
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
            One API call triggers a full autonomous pipeline. Every step is
            streamed live via SSE — you watch ARIA think in real-time.
          </p>
        </div>
      </motion.div>

      {/* Pipeline visualization */}
      <div className="mx-auto px-6 md:px-16" style={{ maxWidth: 1100 }}>
        {pipeline.map((step, i) => (
          <motion.div
            key={step.phase}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            }}
          >
            {/* Phase row */}
            <div
              className="flex items-start gap-6 md:gap-10"
              style={{
                padding: "28px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Phase label */}
              <div
                className="flex-shrink-0 font-mono font-medium hidden md:block"
                style={{
                  width: 80,
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.2)",
                  paddingTop: 4,
                }}
              >
                {step.phase}
              </div>

              {/* Connector */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
                {step.icon ? (
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: 32,
                      height: 32,
                      border: `1px solid ${step.accent}25`,
                      color: step.accent,
                    }}
                  >
                    <step.icon size={16} />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: 32,
                      height: 32,
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <ChevronRight size={14} />
                  </div>
                )}
                {i < pipeline.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      minHeight: 20,
                      background: "rgba(255,255,255,0.06)",
                      marginTop: 4,
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="text-white font-medium mb-1"
                  style={{ fontSize: 16 }}
                >
                  {step.label}
                </h3>

                {step.detail && (
                  <p
                    className="font-mono"
                    style={{
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    {step.detail}
                  </p>
                )}

                {/* Agent sub-items */}
                {step.agents && (
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
                  >
                    {step.agents.map((agent) => (
                      <div
                        key={agent.name}
                        className="flex items-center gap-3 rounded-lg"
                        style={{
                          padding: "12px 16px",
                          background: `${agent.accent}08`,
                          border: `1px solid ${agent.accent}15`,
                        }}
                      >
                        <agent.icon size={16} style={{ color: agent.accent }} />
                        <div className="min-w-0">
                          <span
                            className="font-medium block"
                            style={{ fontSize: 13, color: agent.accent }}
                          >
                            {agent.name}
                          </span>
                          <span
                            className="font-mono block"
                            style={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.25)",
                            }}
                          >
                            {agent.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
