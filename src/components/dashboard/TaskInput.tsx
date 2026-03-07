import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

const exampleQueries = [
  "Analyze the economic impact of AI on software engineering jobs",
  "Research and compare top vector databases for production use",
  "What are the implications of EU AI Act on startups?",
  "Compare transformer architectures: Mamba vs Attention vs RWKV",
];

interface TaskInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  isDark?: boolean;
}

const TaskInput = ({ onSubmit, isLoading, isDark = true }: TaskInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const c = {
    text: isDark ? "#fff" : "#1a1a1a",
    placeholder: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.4)",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)",
    dim: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.35)",
    chipText: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.55)",
    chipBg: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)",
    chipBorder: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)",
    btnBg: value.trim() ? (isDark ? "#fff" : "#1a1a1a") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
    btnText: value.trim() ? (isDark ? "#000" : "#fff") : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask ARIA anything..."
          rows={3}
          className="w-full bg-transparent resize-none outline-none font-normal"
          style={{ padding: "18px 20px 50px", fontSize: 15, lineHeight: 1.6, color: c.text }}
          disabled={isLoading}
        />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between" style={{ padding: "10px 16px" }}>
          <span className="font-mono hidden sm:inline" style={{ fontSize: 11, color: c.dim }}>⌘ + Enter to submit</span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="flex items-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 ml-auto"
            style={{ background: c.btnBg, color: c.btnText, padding: "8px 16px", fontSize: 13 }}
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
            {isLoading ? "Running..." : "Research"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 font-mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: c.dim }}>
          <Sparkles size={10} /> example queries
        </span>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((q) => (
            <motion.button
              key={q}
              onClick={() => { setValue(q); textareaRef.current?.focus(); }}
              className="rounded-lg text-left transition-colors duration-150"
              style={{ padding: "8px 14px", fontSize: 12, color: c.chipText, background: c.chipBg, border: `1px solid ${c.chipBorder}`, lineHeight: 1.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskInput;
