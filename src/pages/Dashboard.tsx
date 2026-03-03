import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, PanelLeftClose, PanelLeft, Sun, Moon, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import TaskInput from "@/components/dashboard/TaskInput";
import AgentStream from "@/components/dashboard/AgentStream";
import ReportView from "@/components/dashboard/ReportView";
import SessionHistory from "@/components/dashboard/SessionHistory";
import { runAIPipeline } from "@/lib/aiPipeline";
import { runSimulatedPipeline } from "@/lib/simulatedPipeline";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { AgentEvent, TaskState } from "@/types/aria";

const Dashboard = () => {
  const [task, setTask] = useState<TaskState>({
    id: "",
    query: "",
    status: "idle",
    events: [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("aria_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("aria_theme", theme);
  }, [theme]);

  const { sessions, loading, saveSession, loadSession, deleteSession, shareSession, unshareSession } = useSessionHistory();
  const { signOut } = useAuth();

  const handleSubmit = useCallback(async (query: string) => {
    const newTask: TaskState = {
      id: crypto.randomUUID(),
      query,
      status: "running",
      events: [],
    };
    setTask(newTask);

    const onEvent = (event: AgentEvent) => {
      setTask((prev) => ({
        ...prev,
        events: [...prev.events, event],
      }));
    };

    let finalTask: TaskState | null = null;

    try {
      const report = await runAIPipeline(query, onEvent);
      setTask((prev) => {
        finalTask = { ...prev, status: "complete", report };
        return finalTask;
      });
    } catch (err) {
      console.error("AI pipeline failed, falling back to simulation:", err);
      toast.error("AI backend unavailable — running demo mode");
      setTask({ id: crypto.randomUUID(), query, status: "running", events: [] });
      const report = await runSimulatedPipeline(query, onEvent);
      setTask((prev) => {
        finalTask = { ...prev, status: "complete", report };
        return finalTask;
      });
    }

    if (finalTask) {
      saveSession(finalTask).catch(() => {});
    }
  }, [saveSession]);

  const handleLoadSession = useCallback(async (sessionId: string) => {
    const session = await loadSession(sessionId);
    if (!session || !session.report_markdown) return;
    setTask({
      id: session.id,
      query: session.query,
      status: "complete",
      events: [],
      report: {
        title: session.report_title || session.query,
        markdown: session.report_markdown,
        sources: session.report_sources || [],
      },
    });
  }, [loadSession]);

  const handleNew = useCallback(() => {
    setTask({ id: "", query: "", status: "idle", events: [] });
  }, []);

  const handleShare = useCallback(async () => {
    if (!task.id) return null;
    return shareSession(task.id);
  }, [task.id, shareSession]);

  const handleUnshare = useCallback(async () => {
    if (!task.id) return;
    await unshareSession(task.id);
  }, [task.id, unshareSession]);

  const isRunning = task.status === "running";
  const isComplete = task.status === "complete";
  const showStream = isRunning || isComplete;
  const isDark = theme === "dark";

  return (
    <div
      className={`flex flex-col h-screen w-full ${isDark ? "dashboard-dark" : "dashboard-light"}`}
      style={{ background: isDark ? "#0A0A0A" : "#F5F5F4" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "12px 24px",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 transition-colors"
            style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
          >
            <ArrowLeft size={14} />
          </Link>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)" }}
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
          <span
            className="font-bold tracking-[0.2em] uppercase"
            style={{ fontSize: 14, color: isDark ? "#fff" : "#1a1a1a" }}
          >
            ARIA
          </span>
          <span className="font-mono" style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }}>
            / dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isRunning && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Activity size={13} className="text-emerald-400 animate-pulse" />
              <span className="text-emerald-400/70 font-mono" style={{ fontSize: 11 }}>
                Agents working...
              </span>
            </motion.div>
          )}

          {isComplete && (
            <span className="font-mono" style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)" }}>
              {task.events.length} events · complete
            </span>
          )}

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="rounded-lg transition-colors"
            style={{
              padding: "6px",
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            onClick={signOut}
            className="rounded-lg transition-colors"
            style={{
              padding: "6px",
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)",
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
            }}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* History sidebar */}
        {sidebarOpen && (
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: 240,
              borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
            }}
          >
            <SessionHistory
              sessions={sessions}
              loading={loading}
              activeId={task.id}
              onSelect={handleLoadSession}
              onDelete={deleteSession}
              onNew={handleNew}
              isDark={isDark}
            />
          </div>
        )}

        {/* Left panel */}
        <div
          className="flex flex-col flex-shrink-0 overflow-hidden"
          style={{
            width: showStream ? "40%" : "100%",
            maxWidth: showStream ? 520 : 720,
            borderRight: showStream ? `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}` : "none",
            transition: "width 0.3s ease, max-width 0.3s ease",
            margin: showStream ? 0 : "0 auto",
          }}
        >
          <div
            className="flex-shrink-0"
            style={{
              padding: showStream ? "20px 20px 16px" : "80px 24px 24px",
            }}
          >
            <TaskInput onSubmit={handleSubmit} isLoading={isRunning} isDark={isDark} />
          </div>

          {showStream && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div
                className="flex items-center gap-2 flex-shrink-0"
                style={{
                  padding: "10px 20px",
                  borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}`,
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}`,
                }}
              >
                <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.3)" }}>
                  Agent Stream
                </span>
                <span className="font-mono" style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)" }}>
                  ({task.events.length})
                </span>
              </div>
              <AgentStream events={task.events} isDark={isDark} />
            </div>
          )}
        </div>

        {/* Right panel — Report */}
        {showStream && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {isComplete && task.report ? (
              <ReportView report={task.report} isDark={isDark} sessionId={task.id} onShare={handleShare} onUnshare={handleUnshare} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      width: 48,
                      height: 48,
                      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity size={20} style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)" }} />
                  </motion.div>
                  <p className="font-mono" style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.25)" }}>
                    Report will appear here when agents finish
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
