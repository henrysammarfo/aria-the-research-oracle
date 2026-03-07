import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Activity, PanelLeftClose, PanelLeft, Sun, Moon, LogOut, Settings, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import TaskInput from "@/components/dashboard/TaskInput";
import type { UploadedFile } from "@/components/dashboard/TaskInput";
import AgentStream from "@/components/dashboard/AgentStream";
import ReportView from "@/components/dashboard/ReportView";
import SessionHistory from "@/components/dashboard/SessionHistory";
import { runAIPipeline } from "@/lib/aiPipeline";
import { runSimulatedPipeline } from "@/lib/simulatedPipeline";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { AgentEvent, TaskState } from "@/types/aria";

async function uploadFiles(files: UploadedFile[], userId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    const ext = f.file.name.split(".").pop() || "bin";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("research-attachments").upload(path, f.file);
    if (!error) {
      const { data } = supabase.storage.from("research-attachments").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
  }
  return urls;
}

const Dashboard = () => {
  const [task, setTask] = useState<TaskState>({
    id: "",
    query: "",
    status: "idle",
    events: [],
  });
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"stream" | "report">("stream");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("aria_theme") as "dark" | "light") || "dark";
  });
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null }>({ display_name: null, avatar_url: null });

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("theme_preference, display_name, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const d = data as any;
        const t = d.theme_preference as string | null;
        if (t === "light" || t === "dark") {
          setTheme(t);
          localStorage.setItem("aria_theme", t);
        }
        setProfile({ display_name: d.display_name, avatar_url: d.avatar_url });
      });
  }, [user]);

  useEffect(() => {
    if (!isMobile) return;
    setSidebarOpen(false);
  }, [isMobile]);

  const handleThemeChange = useCallback(async (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("aria_theme", newTheme);
    if (user) {
      await supabase.from("profiles").update({ theme_preference: newTheme } as any).eq("id", user.id);
    }
  }, [user]);

  const { sessions, loading, saveSession, loadSession, deleteSession, shareSession, unshareSession, refetch } = useSessionHistory();
  const { signOut } = useAuth();

  const handleSubmit = useCallback(async (query: string, files?: UploadedFile[]) => {
    const taskId = crypto.randomUUID();
    const newTask: TaskState = {
      id: taskId,
      query,
      status: "running",
      events: [],
    };
    setTask(newTask);
    if (isMobile) {
      setSidebarOpen(false);
      setMobilePanel("stream");
    }

    // Upload files if any
    let fileUrls: string[] = [];
    if (files && files.length > 0 && user) {
      try {
        fileUrls = await uploadFiles(files, user.id);
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }

    // Append file context to query
    const fullQuery = fileUrls.length > 0
      ? `${query}\n\n[Attached files: ${fileUrls.join(", ")}]`
      : query;

    const onEvent = (event: AgentEvent) => {
      setTask((prev) => ({
        ...prev,
        events: [...prev.events, event],
      }));
    };

    try {
      const report = await runAIPipeline(fullQuery, onEvent);
      const completeTask: TaskState = {
        id: taskId,
        query,
        status: "complete",
        events: [],
        report,
      };
      setTask((prev) => ({ ...prev, status: "complete", report }));

      // Save session with the complete task data
      saveSession(completeTask).catch((err) => {
        console.error("Failed to save session:", err);
        toast.error("Failed to save session");
      });
    } catch (err) {
      console.error("AI pipeline failed, falling back to simulation:", err);
      toast.error("AI backend unavailable — running demo mode");
      const fallbackId = crypto.randomUUID();
      setTask({ id: fallbackId, query, status: "running", events: [] });
      try {
        const report = await runSimulatedPipeline(query, onEvent);
        const completeTask: TaskState = {
          id: fallbackId,
          query,
          status: "complete",
          events: [],
          report,
        };
        setTask((prev) => ({ ...prev, status: "complete", report }));
        saveSession(completeTask).catch(console.error);
      } catch (simErr) {
        console.error("Simulation also failed:", simErr);
        setTask((prev) => ({ ...prev, status: "error" }));
      }
    }

    if (isMobile) setMobilePanel("report");
  }, [saveSession, isMobile, user]);

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
    if (isMobile) {
      setSidebarOpen(false);
      setMobilePanel("report");
    }
  }, [loadSession, isMobile]);

  const handleNew = useCallback(() => {
    setTask({ id: "", query: "", status: "idle", events: [] });
    // Don't close sidebar — user should see their sessions list
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

  const c = {
    topBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)",
    dimText: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)",
    brandText: isDark ? "#fff" : "#111",
    pathText: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.35)",
    statusText: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.45)",
    btnColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.55)",
    btnBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
    btnBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)",
    avatarBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    avatarText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)",
    nameText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)",
    panelBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)",
    streamLabel: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.45)",
    streamCount: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.3)",
    streamBorder: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.08)",
    spinnerBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)",
    spinnerBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)",
    spinnerIcon: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.3)",
    spinnerText: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.35)",
  };

  return (
    <div
      className={`flex flex-col h-screen w-full ${isDark ? "dashboard-dark" : "dashboard-light"}`}
      style={{ background: isDark ? "#0A0A0A" : "#F5F5F4" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{ padding: isMobile ? "10px 12px" : "12px 24px", borderBottom: `1px solid ${c.topBorder}` }}
      >
        <div className="flex items-center gap-3">
          {isMobile ? (
            <button onClick={() => setSidebarOpen((v) => !v)} style={{ color: c.dimText }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          ) : (
            <>
              <Link to="/" className="flex items-center gap-2 transition-colors" style={{ fontSize: 13, color: c.dimText }}>
                <ArrowLeft size={14} />
              </Link>
              <button onClick={() => setSidebarOpen((v) => !v)} style={{ color: c.dimText }}>
                {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
              </button>
            </>
          )}
          <span className="font-bold tracking-[0.2em] uppercase" style={{ fontSize: isMobile ? 13 : 14, color: c.brandText }}>
            ARIA
          </span>
          {!isMobile && (
            <span className="font-mono" style={{ fontSize: 10, color: c.pathText }}>/ dashboard</span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isRunning && !isMobile && (
            <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Activity size={13} className="text-emerald-400 animate-pulse" />
              <span className="text-emerald-400/70 font-mono" style={{ fontSize: 11 }}>Agents working...</span>
            </motion.div>
          )}

          {isComplete && !isMobile && (
            <span className="font-mono" style={{ fontSize: 11, color: c.statusText }}>
              {task.events.length} events · complete
            </span>
          )}

          <button
            onClick={() => handleThemeChange(isDark ? "light" : "dark")}
            className="rounded-lg transition-colors"
            style={{ padding: "6px", color: c.btnColor, background: c.btnBg, border: `1px solid ${c.btnBorder}` }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <Link
            to="/settings"
            className="rounded-lg transition-colors hidden sm:flex"
            style={{ padding: "6px", color: c.btnColor, background: c.btnBg, border: `1px solid ${c.btnBorder}` }}
            title="Settings"
          >
            <Settings size={14} />
          </Link>

          <Link to="/settings" className="flex items-center gap-2 ml-1" title="Profile settings">
            <Avatar className="h-7 w-7">
              {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.display_name || "User"} /> : null}
              <AvatarFallback className="text-[10px] font-bold" style={{ background: c.avatarBg, color: c.avatarText }}>
                {(profile.display_name || user?.email || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <span className="font-medium max-w-[100px] truncate" style={{ fontSize: 12, color: c.nameText }}>
                {profile.display_name || user?.email?.split("@")[0] || "User"}
              </span>
            )}
          </Link>

          <button
            onClick={signOut}
            className="rounded-lg transition-colors"
            style={{ padding: "6px", color: c.btnColor, background: c.btnBg, border: `1px solid ${c.btnBorder}` }}
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="absolute inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* History sidebar */}
        {sidebarOpen && (
          <div
            className={`flex-shrink-0 overflow-hidden ${isMobile ? "absolute left-0 top-0 bottom-0 z-50" : ""}`}
            style={{
              width: isMobile ? 280 : 240,
              borderRight: `1px solid ${c.panelBorder}`,
              background: isDark ? "#0A0A0A" : "#F5F5F4",
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

        {/* Mobile: show either stream or report */}
        {isMobile ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {!showStream ? (
              <div className="flex-1 overflow-auto" style={{ padding: "20px 16px" }}>
                <TaskInput onSubmit={handleSubmit} isLoading={isRunning} isDark={isDark} />
              </div>
            ) : (
              <>
                <div className="flex flex-shrink-0" style={{ borderBottom: `1px solid ${c.streamBorder}` }}>
                  <button
                    onClick={() => setMobilePanel("stream")}
                    className="flex-1 font-mono text-center py-2.5"
                    style={{
                      fontSize: 11,
                      color: mobilePanel === "stream" ? (isDark ? "#fff" : "#111") : c.dimText,
                      borderBottom: mobilePanel === "stream" ? `2px solid ${isDark ? "#fff" : "#111"}` : "2px solid transparent",
                    }}
                  >
                    Agent Stream ({task.events.length})
                  </button>
                  <button
                    onClick={() => setMobilePanel("report")}
                    className="flex-1 font-mono text-center py-2.5"
                    style={{
                      fontSize: 11,
                      color: mobilePanel === "report" ? (isDark ? "#fff" : "#111") : c.dimText,
                      borderBottom: mobilePanel === "report" ? `2px solid ${isDark ? "#fff" : "#111"}` : "2px solid transparent",
                    }}
                  >
                    Report {isComplete ? "✓" : "..."}
                  </button>
                </div>

                {mobilePanel === "stream" ? (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-shrink-0" style={{ padding: "8px 16px" }}>
                      <TaskInput onSubmit={handleSubmit} isLoading={isRunning} isDark={isDark} />
                    </div>
                    <AgentStream events={task.events} isDark={isDark} />
                  </div>
                ) : (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {isComplete && task.report ? (
                      <ReportView report={task.report} isDark={isDark} sessionId={task.id} onShare={handleShare} onUnshare={handleUnshare} />
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <motion.div
                            className="mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ width: 48, height: 48, background: c.spinnerBg, border: `1px solid ${c.spinnerBorder}` }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            <Activity size={20} style={{ color: c.spinnerIcon }} />
                          </motion.div>
                          <p className="font-mono" style={{ fontSize: 12, color: c.spinnerText }}>
                            Report generating...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Desktop layout */
          <>
            {/* Left panel */}
            <div
              className="flex flex-col flex-shrink-0 overflow-hidden"
              style={{
                width: showStream ? "40%" : "100%",
                maxWidth: showStream ? 520 : 720,
                borderRight: showStream ? `1px solid ${c.panelBorder}` : "none",
                transition: "width 0.3s ease, max-width 0.3s ease",
                margin: showStream ? 0 : "0 auto",
              }}
            >
              <div className="flex-shrink-0" style={{ padding: showStream ? "20px 20px 16px" : "80px 24px 24px" }}>
                <TaskInput onSubmit={handleSubmit} isLoading={isRunning} isDark={isDark} />
              </div>

              {showStream && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div
                    className="flex items-center gap-2 flex-shrink-0"
                    style={{
                      padding: "10px 20px",
                      borderTop: `1px solid ${c.streamBorder}`,
                      borderBottom: `1px solid ${c.streamBorder}`,
                    }}
                  >
                    <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: c.streamLabel }}>
                      Agent Stream
                    </span>
                    <span className="font-mono" style={{ fontSize: 10, color: c.streamCount }}>
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
                        style={{ width: 48, height: 48, background: c.spinnerBg, border: `1px solid ${c.spinnerBorder}` }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Activity size={20} style={{ color: c.spinnerIcon }} />
                      </motion.div>
                      <p className="font-mono" style={{ fontSize: 12, color: c.spinnerText }}>
                        Report generating...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
