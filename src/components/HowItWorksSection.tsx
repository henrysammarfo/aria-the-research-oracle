import { motion } from "framer-motion";
import { MessageSquare, Cpu, Search, Brain, Code, FileText, FileDown } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    label: "Your Question",
    description: "Ask any complex research question or analysis task",
    color: "text-white",
    bg: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  {
    icon: Cpu,
    label: "Orchestrator",
    description: "GLM-4-Plus decomposes into subtasks & plans execution",
    color: "text-cyan-400",
    bg: "rgba(34,211,238,0.08)",
    borderColor: "rgba(34,211,238,0.2)",
  },
  {
    icon: Search,
    label: "Researcher",
    description: "Searches the web, fetches sources, tracks citations",
    color: "text-blue-400",
    bg: "rgba(96,165,250,0.08)",
    borderColor: "rgba(96,165,250,0.2)",
    sub: true,
  },
  {
    icon: Brain,
    label: "Analyst",
    description: "GLM-Z1 deep reasoning — patterns, gaps, insights",
    color: "text-purple-400",
    bg: "rgba(192,132,252,0.08)",
    borderColor: "rgba(192,132,252,0.2)",
    sub: true,
  },
  {
    icon: Code,
    label: "Coder",
    description: "Generates & executes Python in a secure sandbox",
    color: "text-emerald-400",
    bg: "rgba(52,211,153,0.08)",
    borderColor: "rgba(52,211,153,0.2)",
    sub: true,
  },
  {
    icon: FileText,
    label: "Writer",
    description: "Synthesizes findings into a structured report",
    color: "text-amber-400",
    bg: "rgba(251,191,36,0.08)",
    borderColor: "rgba(251,191,36,0.2)",
    sub: true,
  },
  {
    icon: FileDown,
    label: "Final Report",
    description: "Cited, exportable markdown & PDF with executive summary",
    color: "text-white",
    bg: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.15)",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "#000", padding: "120px 0" }}
    >
      {/* Subtle divider line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{
          width: "60%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Header */}
      <motion.div
        className="text-center mx-auto px-6"
        style={{ maxWidth: 600 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <span
          className="inline-flex items-center rounded-full font-medium mb-6"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "6px 16px",
            fontSize: 12,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          How It Works
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
          From Question to Report in Minutes
        </h2>
        <p
          className="text-white/50 font-normal mt-5"
          style={{ fontSize: 15, lineHeight: 1.7 }}
        >
          Watch ARIA think, search, analyze, and write — all streamed live to
          your dashboard.
        </p>
      </motion.div>

      {/* Flow */}
      <div
        className="relative mx-auto mt-16 px-6"
        style={{ maxWidth: 720 }}
      >
        {/* Vertical connector line */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-px"
          style={{
            top: 0,
            bottom: 0,
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.1) 10%, rgba(255,255,255,0.1) 90%, transparent)",
          }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        <div className="flex flex-col items-center" style={{ gap: 0 }}>
          {steps.map((step, i) => {
            const isAgent = step.sub;
            return (
              <motion.div
                key={step.label}
                className="relative w-full flex justify-center"
                style={{ paddingTop: i === 0 ? 0 : isAgent ? 12 : 24, paddingBottom: isAgent ? 12 : 24 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
                }}
              >
                {/* Node */}
                <div
                  className={`relative flex items-center gap-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    isAgent ? "ml-8 md:ml-16" : ""
                  }`}
                  style={{
                    background: step.bg,
                    border: `1px solid ${step.borderColor}`,
                    padding: isAgent ? "16px 24px" : "20px 28px",
                    width: isAgent ? "85%" : "100%",
                    maxWidth: isAgent ? 520 : 600,
                  }}
                >
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center rounded-lg ${step.color}`}
                    style={{
                      width: isAgent ? 36 : 44,
                      height: isAgent ? 36 : 44,
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <step.icon size={isAgent ? 18 : 22} />
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`font-medium ${step.color}`}
                      style={{ fontSize: isAgent ? 15 : 17 }}
                    >
                      {step.label}
                    </h3>
                    <p
                      className="text-white/40 font-normal mt-1"
                      style={{ fontSize: isAgent ? 12 : 13, lineHeight: 1.5 }}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Step number */}
                  <span
                    className="absolute -left-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full text-white/30 font-medium"
                    style={{
                      width: 24,
                      height: 24,
                      fontSize: 10,
                      background: "#000",
                      border: `1px solid ${step.borderColor}`,
                    }}
                  >
                    {i + 1}
                  </span>
                </div>

                {/* Connector dot */}
                {i < steps.length - 1 && (
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: "rgba(255,255,255,0.15)",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
