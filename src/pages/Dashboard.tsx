import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  LogOut,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import ChatThread from "@/components/dashboard/ChatThread";
import ChatInput from "@/components/dashboard/ChatInput";
import SessionHistory from "@/components/dashboard/SessionHistory";
import { useChat } from "@/hooks/useChat";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("aria_theme") as "dark" | "light") || "dark";
  });
  const [profile, setProfile] = useState<{
    display_name: string | null;
    avatar_url: string | null;
  }>({ display_name: null, avatar_url: null });

  const { user } = useAuth();
  const { signOut } = useAuth();

  const {
    conversationId,
    messages,
    isStreaming,
    isResearching,
    researchEvents,
    loadConversation,
    newConversation,
    sendMessage,
    startResearch,
  } = useChat();

  const {
    sessions,
    loading: sessionsLoading,
    deleteSession,
    refetch: refetchSessions,
  } = useSessionHistory();

  // Refetch sessions when conversation changes
  useEffect(() => {
    if (conversationId) {
      const timer = setTimeout(refetchSessions, 500);
      return () => clearTimeout(timer);
    }
  }, [conversationId, messages.length, refetchSessions]);

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
        setProfile({
          display_name: d.display_name,
          avatar_url: d.avatar_url,
        });
      });
  }, [user]);

  useEffect(() => {
    if (!isMobile) return;
    setSidebarOpen(false);
  }, [isMobile]);

  const handleThemeChange = useCallback(
    async (newTheme: "dark" | "light") => {
      setTheme(newTheme);
      localStorage.setItem("aria_theme", newTheme);
      if (user) {
        await supabase
          .from("profiles")
          .update({ theme_preference: newTheme } as any)
          .eq("id", user.id);
      }
    },
    [user]
  );

  const handleSelectSession = useCallback(
    async (sessionId: string) => {
      await loadConversation(sessionId);
      if (isMobile) setSidebarOpen(false);
    },
    [loadConversation, isMobile]
  );

  const handleNew = useCallback(() => {
    newConversation();
  }, [newConversation]);

  const handleSend = useCallback(
    (msg: string, files?: any[]) => {
      sendMessage(msg, files);
      if (isMobile) setSidebarOpen(false);
    },
    [sendMessage, isMobile]
  );

  const handleDeepResearch = useCallback(
    (query: string, files?: any[]) => {
      startResearch(query, files);
      if (isMobile) setSidebarOpen(false);
    },
    [startResearch, isMobile]
  );

  const isDark = theme === "dark";
  const isLoading = isStreaming || isResearching;
  const showExamples = messages.length === 0 && !isLoading;

  const c = {
    topBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)",
    dimText: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.8)",
    brandText: isDark ? "#fff" : "#000",
    pathText: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.6)",
    btnColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.85)",
    btnBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
    btnBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)",
    avatarBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    avatarText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.85)",
    nameText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.9)",
    panelBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)",
  };

  return (
    <div
      className={`flex flex-col h-screen w-full ${isDark ? "dashboard-dark" : "dashboard-light"}`}
      style={{ background: isDark ? "#0A0A0A" : "#F5F5F4" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: isMobile ? "10px 12px" : "10px 20px",
          borderBottom: `1px solid ${c.topBorder}`,
        }}
      >
        <div className="flex items-center gap-3">
          {isMobile ? (
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              style={{ color: c.dimText }}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center transition-colors"
                style={{ color: c.dimText }}
              >
                <ArrowLeft size={14} />
              </Link>
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                style={{ color: c.dimText }}
              >
                {sidebarOpen ? (
                  <PanelLeftClose size={16} />
                ) : (
                  <PanelLeft size={16} />
                )}
              </button>
            </>
          )}
          <span
            className="font-bold tracking-[0.2em] uppercase"
            style={{ fontSize: isMobile ? 13 : 14, color: c.brandText }}
          >
            ARIA
          </span>
          {!isMobile && (
            <span
              className="font-mono"
              style={{ fontSize: 10, color: c.pathText }}
            >
              / chat
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleThemeChange(isDark ? "light" : "dark")}
            className="rounded-lg transition-colors"
            style={{
              padding: "6px",
              color: c.btnColor,
              background: c.btnBg,
              border: `1px solid ${c.btnBorder}`,
            }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <Link
            to="/settings"
            className="rounded-lg transition-colors hidden sm:flex"
            style={{
              padding: "6px",
              color: c.btnColor,
              background: c.btnBg,
              border: `1px solid ${c.btnBorder}`,
            }}
          >
            <Settings size={14} />
          </Link>

          <Link
            to="/settings"
            className="flex items-center gap-2 ml-1"
            title="Profile"
          >
            <Avatar className="h-7 w-7">
              {profile.avatar_url ? (
                <AvatarImage
                  src={profile.avatar_url}
                  alt={profile.display_name || "User"}
                />
              ) : null}
              <AvatarFallback
                className="text-[10px] font-bold"
                style={{
                  background: c.avatarBg,
                  color: c.avatarText,
                }}
              >
                {(profile.display_name || user?.email || "U")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <span
                className="font-medium max-w-[100px] truncate"
                style={{ fontSize: 12, color: c.nameText }}
              >
                {profile.display_name ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </span>
            )}
          </Link>

          <button
            onClick={signOut}
            className="rounded-lg transition-colors"
            style={{
              padding: "6px",
              color: c.btnColor,
              background: c.btnBg,
              border: `1px solid ${c.btnBorder}`,
            }}
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

        {/* Sidebar */}
        {sidebarOpen && (
          <div
            className={`flex-shrink-0 overflow-hidden ${isMobile ? "absolute left-0 top-0 bottom-0 z-50" : ""}`}
            style={{
              width: isMobile ? 280 : 260,
              borderRight: `1px solid ${c.panelBorder}`,
              background: isDark ? "#0A0A0A" : "#F5F5F4",
            }}
          >
            <SessionHistory
              sessions={sessions}
              loading={sessionsLoading}
              activeId={conversationId || ""}
              onSelect={handleSelectSession}
              onDelete={deleteSession}
              onNew={handleNew}
              isDark={isDark}
            />
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatThread
            messages={messages}
            isStreaming={isStreaming}
            isResearching={isResearching}
            researchEvents={researchEvents}
            isDark={isDark}
          />

          {/* Input area */}
          <div
            className="flex-shrink-0 w-full mx-auto"
            style={{
              padding: isMobile ? "6px 8px 10px" : "8px 24px 16px",
              maxWidth: 800,
            }}
          >
            <ChatInput
              onSend={handleSend}
              onDeepResearch={handleDeepResearch}
              isLoading={isLoading}
              isDark={isDark}
              showExamples={showExamples}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
