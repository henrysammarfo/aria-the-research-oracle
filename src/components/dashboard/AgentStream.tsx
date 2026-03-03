import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, Code, FileText, Cpu, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import type { AgentEvent, AgentName, EventType } from "@/types/aria";

const agentMeta: Record<AgentName, { icon: typeof Brain; accent: string }> = {
  Orchestrator: { icon: Cpu, accent: "#22D3EE" },
  Researcher: { icon: Search, accent: "#3B82F6" },
  Analyst: { icon: Brain, accent: "#A855F7" },
  Coder: { icon: Code, accent: "#10B981" },
  Writer: { icon: FileText, accent: "#F59E0B" },
};

const typeStyles: Record<EventType, { label: string; color: string; icon: typeof Brain }> = {
  thinking: { label: "thinking", color: "rgba(255,255,255,0.3)", icon: Brain },
  action: { label: "action", color: "#3B82F6", icon: Zap },
  result: { label: "result", color: "#10B981", icon: CheckCircle2 },
  error: { label: "error", color: "#EF4444", icon: AlertCircle },
  plan: { label: "plan", color: "#22D3EE", icon: Cpu },
  code: { label: "code", color: "#10B981", icon: Code },
  complete: { label: "done", color: "#10B981", icon: CheckCircle2 },
};

const AgentStream = ({ events }: { events: AgentEvent[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      style={{ scrollBehavior: "smooth" }}
    >
      <AnimatePresence initial={false}>
        {events.map((event) => {
          const agent = agentMeta[event.agent];
          const style = typeStyles[event.type];
          const AgentIcon = agent.icon;
          const isThinking = event.type === "thinking";
          const isCode = event.type === "code";
          const isPlan = event.type === "plan";
          const isComplete = event.type === "complete";

          let displayContent = event.content;
          // Strip <think> tags for display
          if (isThinking && displayContent.startsWith("<think>")) {
            displayContent = displayContent.replace(/<\/?think>/g, "").trim();
          }

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`border-l-2 ${isComplete ? "border-l-emerald-500/50" : ""}`}
              style={{
                borderLeftColor: isComplete ? undefined : `${agent.accent}30`,
                padding: "12px 16px 12px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-1.5">
                <AgentIcon size={13} style={{ color: agent.accent }} />
                <span className="font-medium" style={{ fontSize: 12, color: agent.accent }}>
                  {event.agent}
                </span>
                <span
                  className="rounded font-mono"
                  style={{
                    fontSize: 9,
                    padding: "1px 6px",
                    color: style.color,
                    background: `${style.color}15`,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {style.label}
                </span>
                <span className="ml-auto font-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.12)" }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Content */}
              {isCode ? (
                <pre
                  className="rounded-lg overflow-x-auto font-mono"
                  style={{
                    fontSize: 11,
                    lineHeight: 1.5,
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.5)",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {displayContent}
                </pre>
              ) : isPlan ? (
                <div
                  className="rounded-lg font-mono"
                  style={{
                    fontSize: 11,
                    padding: "10px 14px",
                    color: "rgba(34,211,238,0.5)",
                    background: "rgba(34,211,238,0.03)",
                    border: "1px solid rgba(34,211,238,0.08)",
                    lineHeight: 1.6,
                  }}
                >
                  {(() => {
                    try {
                      const plan = JSON.parse(displayContent);
                      return plan.plan?.map((t: any) => (
                        <div key={t.id} className="flex gap-2">
                          <span style={{ color: "rgba(34,211,238,0.3)" }}>{t.id}.</span>
                          <span>[{t.type}]</span>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>{t.description}</span>
                        </div>
                      ));
                    } catch {
                      return displayContent;
                    }
                  })()}
                </div>
              ) : (
                <p
                  className={isThinking ? "italic" : ""}
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: isThinking
                      ? "rgba(255,255,255,0.25)"
                      : isComplete
                      ? "rgba(16,185,129,0.7)"
                      : "rgba(255,255,255,0.5)",
                  }}
                >
                  {displayContent}
                </p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {events.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/10 font-mono" style={{ fontSize: 12 }}>
            Waiting for task...
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentStream;
