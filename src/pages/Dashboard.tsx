import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import TaskInput from "@/components/dashboard/TaskInput";
import AgentStream from "@/components/dashboard/AgentStream";
import ReportView from "@/components/dashboard/ReportView";
import { runSimulatedPipeline } from "@/lib/simulatedPipeline";
import type { AgentEvent, TaskState } from "@/types/aria";

const Dashboard = () => {
  const [task, setTask] = useState<TaskState>({
    id: "",
    query: "",
    status: "idle",
    events: [],
  });

  const handleSubmit = useCallback(async (query: string) => {
    setTask({
      id: crypto.randomUUID(),
      query,
      status: "running",
      events: [],
    });

    const report = await runSimulatedPipeline(query, (event: AgentEvent) => {
      setTask((prev) => ({
        ...prev,
        events: [...prev.events, event],
      }));
    });

    setTask((prev) => ({
      ...prev,
      status: "complete",
      report,
    }));
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
          {/* Task Input */}
          <div
            className="flex-shrink-0"
            style={{
              padding: showStream ? "20px 20px 16px" : "80px 24px 24px",
            }}
          >
            <TaskInput onSubmit={handleSubmit} isLoading={isRunning} />
          </div>

          {/* Agent Stream (in left panel when visible) */}
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
