import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceId";
import type { TaskState } from "@/types/aria";

export interface SessionSummary {
  id: string;
  query: string;
  report_title: string | null;
  created_at: string;
  events_count: number | null;
}

export interface FullSession extends SessionSummary {
  report_markdown: string | null;
  report_sources: { title: string; url: string }[] | null;
  share_id: string | null;
}

export function useSessionHistory() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const deviceId = getDeviceId();

  const fetchSessions = useCallback(async () => {
    const { data } = await supabase
      .from("research_sessions")
      .select("id, query, report_title, created_at, events_count")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(50);
    setSessions(data ?? []);
    setLoading(false);
  }, [deviceId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const saveSession = useCallback(
    async (task: TaskState) => {
      if (!task.report) return;
      await supabase.from("research_sessions").insert({
        id: task.id,
        device_id: deviceId,
        query: task.query,
        report_title: task.report.title,
        report_markdown: task.report.markdown,
        report_sources: task.report.sources as any,
        events_count: task.events.length,
      });
      fetchSessions();
    },
    [deviceId, fetchSessions]
  );

  const loadSession = useCallback(
    async (sessionId: string): Promise<FullSession | null> => {
      const { data } = await supabase
        .from("research_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("device_id", deviceId)
        .single();
      if (!data) return null;
      return { ...data, report_sources: data.report_sources as any };
    },
    [deviceId]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await supabase
        .from("research_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("device_id", deviceId);
      fetchSessions();
    },
    [deviceId, fetchSessions]
  );

  const shareSession = useCallback(
    async (sessionId: string): Promise<string | null> => {
      const shareId = crypto.randomUUID().slice(0, 8);
      const { error } = await supabase
        .from("research_sessions")
        .update({ share_id: shareId })
        .eq("id", sessionId)
        .eq("device_id", deviceId);
      if (error) return null;
      return shareId;
    },
    [deviceId]
  );

  const unshareSession = useCallback(
    async (sessionId: string) => {
      await supabase
        .from("research_sessions")
        .update({ share_id: null })
        .eq("id", sessionId)
        .eq("device_id", deviceId);
    },
    [deviceId]
  );

  return { sessions, loading, saveSession, loadSession, deleteSession, shareSession, unshareSession, refetch: fetchSessions };
}
