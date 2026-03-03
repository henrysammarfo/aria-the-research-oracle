import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is ARIA and how does it work?",
    a: "ARIA (Autonomous Research Intelligence Agent) is a production-grade multi-agent system powered by Z.AI's GLM models. You ask a complex question, and ARIA's Orchestrator decomposes it into subtasks, dispatches specialized agents (Researcher, Analyst, Coder, Writer) to work in parallel, and synthesizes everything into a structured, cited report — all streamed live to your dashboard.",
  },
  {
    q: "Which AI models power ARIA?",
    a: "ARIA uses three GLM models from Z.AI: GLM-4-Plus for orchestration, research synthesis, and report writing; GLM-Z1-Preview for deep multi-step reasoning and analysis; and GLM-4V-Plus for vision tasks and chart interpretation. Each agent uses the optimal model for its specialization.",
  },
  {
    q: "How accurate are ARIA's research reports?",
    a: "ARIA achieves 95% citation accuracy by grounding every finding in verifiable sources. The Researcher agent tracks provenance for every claim, the Analyst agent cross-references and challenges assumptions, and the Writer agent ensures all citations are properly linked in the final report.",
  },
  {
    q: "Can ARIA execute code and create visualizations?",
    a: "Yes. The Coder agent generates Python analysis code and executes it in a secure sandboxed environment with a 10-second timeout. It can produce charts, data tables, and statistical analysis — all included inline in the final report as base64-encoded images.",
  },
  {
    q: "How does ARIA handle security and sandboxing?",
    a: "Code execution is fully sandboxed using subprocess isolation with no network access. ARIA validates all generated code via AST parsing to block dangerous imports (os, sys, subprocess, socket). All API keys are stored as environment variables, never in code.",
  },
  {
    q: "Is ARIA open source?",
    a: "Yes. ARIA is fully open-source and deployable via Docker Compose with a single command. The entire stack — FastAPI backend, React frontend, Redis session memory, SQLite persistence — is containerized and production-ready.",
  },
  {
    q: "What output formats does ARIA support?",
    a: "ARIA generates reports in structured Markdown, styled HTML (with embedded dark-theme CSS and clickable citations), and downloadable PDF (via WeasyPrint). Reports include executive summaries, numbered findings with confidence scores, data visualizations, and a full source bibliography.",
  },
  {
    q: "How fast is ARIA compared to manual research?",
    a: "ARIA delivers comprehensive research reports in approximately 3 minutes — roughly 10x faster than manual research. The multi-agent architecture enables parallel execution: while the Researcher gathers sources, the Analyst can begin reasoning on early findings, and the Coder can start generating analysis code.",
  },
];

const FAQItem = ({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) => (
  <motion.div
    className="rounded-xl overflow-hidden transition-colors duration-200"
    style={{
      background: isOpen ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isOpen ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
    }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-30px" }}
    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
  >
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between text-left"
      style={{ padding: "20px 24px" }}
    >
      <span className="text-white/80 font-medium pr-4" style={{ fontSize: 15 }}>
        {q}
      </span>
      <ChevronDown
        size={16}
        className={`flex-shrink-0 text-white/30 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <p
            className="text-white/40 font-normal"
            style={{ padding: "0 24px 20px 24px", fontSize: 14, lineHeight: 1.7 }}
          >
            {a}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "#000", padding: "120px 0" }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
        style={{ width: "60%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
      />

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
          FAQ
        </span>
        <h2
          className="font-medium mt-4"
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 1.2,
            background: "linear-gradient(144.5deg, #FFFFFF 28%, rgba(255,255,255,0.4) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Frequently Asked Questions
        </h2>
        <p className="text-white/50 font-normal mt-5" style={{ fontSize: 15, lineHeight: 1.7 }}>
          Everything you need to know about ARIA's capabilities and architecture.
        </p>
      </motion.div>

      <div className="mx-auto mt-14 px-6 flex flex-col gap-3" style={{ maxWidth: 720 }}>
        {faqs.map((faq, i) => (
          <FAQItem
            key={i}
            q={faq.q}
            a={faq.a}
            isOpen={openIndex === i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
