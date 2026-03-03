import { useState } from "react";
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
}

const SessionHistory = ({ sessions, loading, activeId, onSelect, onDelete, onNew }: SessionHistoryProps) => {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? sessions.filter((s) => {
        const q = search.toLowerCase();
        return (
          s.query.toLowerCase().includes(q) ||
          (s.report_title && s.report_title.toLowerCase().includes(q))
        );
      })
    : sessions;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-white/25" />
          <span
            className="font-mono text-white/30"
            style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            History
          </span>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
          style={{ padding: "4px 8px", fontSize: 11 }}
        >
          <Plus size={12} />
          New
        </button>
      </div>

      {/* Search */}
      <div
        className="flex-shrink-0"
        style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div
          className="flex items-center gap-2 rounded-lg"
          style={{
            padding: "6px 10px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Search size={12} className="text-white/20 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="bg-transparent text-white/60 placeholder:text-white/15 outline-none w-full"
            style={{ fontSize: 11 }}
          />
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "4px 0" }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-4 h-4 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8" style={{ padding: "0 16px" }}>
            <FileText size={20} className="mx-auto mb-2 text-white/10" />
            <p className="text-white/15 font-mono" style={{ fontSize: 11 }}>
              {search.trim() ? "No matching sessions" : "No research sessions yet"}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  onClick={() => onSelect(session.id)}
                  className={`group w-full text-left transition-colors ${
                    activeId === session.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                  }`}
                  style={{ padding: "10px 16px", display: "block" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate"
                        style={{
                          fontSize: 12,
                          color: activeId === session.id ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.45)",
                          lineHeight: 1.4,
                        }}
                      >
                        {session.report_title || session.query}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-white/15 font-mono" style={{ fontSize: 9 }}>
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                        {session.events_count != null && session.events_count > 0 && (
                          <span className="text-white/10 font-mono" style={{ fontSize: 9 }}>
                            {session.events_count} events
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-white/15 hover:text-red-400/70 transition-all flex-shrink-0 mt-0.5"
                      style={{ padding: 2 }}
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
