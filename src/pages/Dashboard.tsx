import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, PanelLeftClose, PanelLeft } from "lucide-react";
import { Link } from "react-router-dom";
import TaskInput from "@/components/dashboard/TaskInput";
import AgentStream from "@/components/dashboard/AgentStream";
import ReportView from "@/components/dashboard/ReportView";
import SessionHistory from "@/components/dashboard/SessionHistory";
import { runAIPipeline } from "@/lib/aiPipeline";
import { runSimulatedPipeline } from "@/lib/simulatedPipeline";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { toast } from "sonner";
import type { AgentEvent, TaskState } from "@/types/aria";

const Dashboard = () => {
  const [task, setTask] = useState<TaskState>({
    id: "",
    query: "",
    status: "idle",
    events: [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { sessions, loading, saveSession, loadSession, deleteSession } = useSessionHistory();

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

  const isRunning = task.status === "running";
  const isComplete = task.status === "complete";
  const showStream = isRunning || isComplete;

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: "#0A0A0A" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
            style={{ fontSize: 13 }}
          >
            <ArrowLeft size={14} />
          </Link>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-white/20 hover:text-white/50 transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
          <span className="text-white font-bold tracking-[0.2em] uppercase" style={{ fontSize: 14 }}>
            ARIA
          </span>
          <span className="text-white/15 font-mono" style={{ fontSize: 10 }}>
            / dashboard
          </span>
        </div>

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
          <span className="text-white/20 font-mono" style={{ fontSize: 11 }}>
            {task.events.length} events · complete
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* History sidebar */}
        {sidebarOpen && (
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              width: 240,
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <SessionHistory
              sessions={sessions}
              loading={loading}
              activeId={task.id}
              onSelect={handleLoadSession}
              onDelete={deleteSession}
              onNew={handleNew}
            />
          </div>
        )}

        {/* Left panel */}
        <div
          className="flex flex-col flex-shrink-0 overflow-hidden"
          style={{
            width: showStream ? "40%" : "100%",
            maxWidth: showStream ? 520 : 720,
            borderRight: showStream ? "1px solid rgba(255,255,255,0.06)" : "none",
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
            <TaskInput onSubmit={handleSubmit} isLoading={isRunning} />
          </div>

          {showStream && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div
                className="flex items-center gap-2 flex-shrink-0"
                style={{
                  padding: "10px 20px",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span className="font-mono text-white/20" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Agent Stream
                </span>
                <span className="text-white/10 font-mono" style={{ fontSize: 10 }}>
                  ({task.events.length})
                </span>
              </div>
              <AgentStream events={task.events} />
            </div>
          )}
        </div>

        {/* Right panel — Report */}
        {showStream && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {isComplete && task.report ? (
              <ReportView report={task.report} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      width: 48,
                      height: 48,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Activity size={20} className="text-white/15" />
                  </motion.div>
                  <p className="text-white/15 font-mono" style={{ fontSize: 12 }}>
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
