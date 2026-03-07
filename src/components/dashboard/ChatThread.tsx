import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Brain, Search, Code, FileText, Cpu } from "lucide-react";
import ChatMessage from "./ChatMessage";
import type { ChatMsg } from "@/hooks/useChat";
import type { AgentEvent, AgentName } from "@/types/aria";

const agentIcons: Record<AgentName, typeof Brain> = {
  Orchestrator: Cpu,
  Researcher: Search,
  Analyst: Brain,
  Coder: Code,
  Writer: FileText,
};

const agentColors: Record<AgentName, string> = {
  Orchestrator: "#22D3EE",
  Researcher: "#3B82F6",
  Analyst: "#A855F7",
  Coder: "#10B981",
  Writer: "#F59E0B",
};

interface ChatThreadProps {
  messages: ChatMsg[];
  isStreaming: boolean;
  isResearching: boolean;
  researchEvents: AgentEvent[];
  isDark: boolean;
}

export default function ChatThread({
  messages,
  isStreaming,
  isResearching,
  researchEvents,
  isDark,
}: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, researchEvents.length, isStreaming]);

  const c = {
    empty: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.45)",
    emptyText: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.7)",
    researchBg: isDark
      ? "rgba(255,255,255,0.02)"
      : "rgba(0,0,0,0.03)",
    researchBorder: isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.12)",
    eventText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.75)",
    eventDim: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)",
    streamingDot: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)",
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      style={{ padding: "16px 8px", scrollBehavior: "smooth" }}
    >
      <div className="max-w-3xl mx-auto px-1 sm:px-4">
        {messages.length === 0 && !isResearching && (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="rounded-full flex items-center justify-center mb-4"
              style={{
                width: 48,
                height: 48,
                background: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.04)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              <Activity size={20} style={{ color: c.empty }} />
            </div>
            <p
              className="font-medium mb-1"
              style={{ fontSize: 16, color: c.emptyText }}
            >
              Start a conversation
            </p>
            <p style={{ fontSize: 13, color: c.empty }}>
              Ask a question or start deep research
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatMessage message={msg} isDark={isDark} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming indicator */}
        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1]?.role === "user" && (
            <div className="mb-4 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: c.streamingDot,
                    }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Research in progress */}
        {isResearching && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl overflow-hidden"
            style={{
              background: c.researchBg,
              border: `1px solid ${c.researchBorder}`,
            }}
          >
            <div
              className="flex items-center gap-2"
              style={{ padding: "12px 16px", borderBottom: `1px solid ${c.researchBorder}` }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Activity size={14} className="text-blue-400" />
              </motion.div>
              <span
                className="font-mono"
                style={{ fontSize: 11, color: "#3B82F6" }}
              >
                Deep Research in progress...
              </span>
              <span
                className="font-mono ml-auto"
                style={{ fontSize: 10, color: c.eventDim }}
              >
                {researchEvents.length} events
              </span>
            </div>

            <div
              style={{
                maxHeight: 200,
                overflowY: "auto",
                padding: "8px 0",
              }}
            >
              {researchEvents.slice(-8).map((event) => {
                const Icon = agentIcons[event.agent] || Brain;
                const color = agentColors[event.agent] || "#888";
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-2"
                    style={{ padding: "4px 16px" }}
                  >
                    <Icon
                      size={12}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color }}
                    />
                    <span
                      className="font-mono"
                      style={{ fontSize: 11, color: c.eventText }}
                    >
                      <span style={{ color, fontWeight: 500 }}>
                        {event.agent}
                      </span>{" "}
                      {event.content.slice(0, 120)}
                      {event.content.length > 120 ? "..." : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
