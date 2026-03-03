import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, FileText, Plus, Search } from "lucide-react";
import type { SessionSummary } from "@/hooks/useSessionHistory";

interface SessionHistoryProps {
  sessions: SessionSummary[];
  loading: boolean;
  activeId?: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  isDark?: boolean;
}

const SessionHistory = ({ sessions, loading, activeId, onSelect, onDelete, onNew, isDark = true }: SessionHistoryProps) => {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? sessions.filter((s) => {
        const q = search.toLowerCase();
        return s.query.toLowerCase().includes(q) || (s.report_title && s.report_title.toLowerCase().includes(q));
      })
    : sessions;

  const c = {
    text: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.55)",
    textActive: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.8)",
    dim: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)",
    ghost: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    activeBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    hoverBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between flex-shrink-0" style={{ padding: "14px 16px", borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-2">
          <Clock size={12} style={{ color: c.dim }} />
          <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: c.dim }}>History</span>
        </div>
        <button onClick={onNew} className="flex items-center gap-1 rounded-md transition-colors" style={{ padding: "4px 8px", fontSize: 11, color: c.dim }}>
          <Plus size={12} />
          New
        </button>
      </div>

      <div className="flex-shrink-0" style={{ padding: "8px 12px", borderBottom: `1px solid ${c.border}` }}>
        <div className="flex items-center gap-2 rounded-lg" style={{ padding: "6px 10px", background: c.surface, border: `1px solid ${c.border}` }}>
          <Search size={12} style={{ color: c.dim }} className="flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="bg-transparent outline-none w-full"
            style={{ fontSize: 11, color: c.text, ...({ '::placeholder': { color: c.ghost } } as any) }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: "4px 0" }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: c.ghost, borderTopColor: c.dim }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8" style={{ padding: "0 16px" }}>
            <FileText size={20} className="mx-auto mb-2" style={{ color: c.ghost }} />
            <p className="font-mono" style={{ fontSize: 11, color: c.ghost }}>{search.trim() ? "No matching sessions" : "No research sessions yet"}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((session) => (
              <motion.div key={session.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
                <button
                  onClick={() => onSelect(session.id)}
                  className="group w-full text-left transition-colors"
                  style={{ padding: "10px 16px", display: "block", background: activeId === session.id ? c.activeBg : "transparent" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate" style={{ fontSize: 12, color: activeId === session.id ? c.textActive : c.text, lineHeight: 1.4 }}>
                        {session.report_title || session.query}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono" style={{ fontSize: 9, color: c.ghost }}>{new Date(session.created_at).toLocaleDateString()}</span>
                        {session.events_count != null && session.events_count > 0 && (
                          <span className="font-mono" style={{ fontSize: 9, color: c.ghost }}>{session.events_count} events</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5"
                      style={{ padding: 2, color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
