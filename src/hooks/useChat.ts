import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { runAIPipeline } from "@/lib/aiPipeline";
import { runSimulatedPipeline } from "@/lib/simulatedPipeline";
import { toast } from "sonner";
import type { AgentEvent } from "@/types/aria";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "report";
  metadata?: {
    report?: {
      title: string;
      markdown: string;
      sources: { title: string; url: string }[];
    };
    files?: { name: string; url: string }[];
  };
  created_at: string;
}

export interface UploadedFile {
  file: File;
  preview?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aria-chat`;

async function uploadFiles(
  files: UploadedFile[],
  userId: string
): Promise<{ name: string; url: string }[]> {
  const results: { name: string; url: string }[] = [];
  for (const f of files) {
    const ext = f.file.name.split(".").pop() || "bin";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("research-attachments")
      .upload(path, f.file);
    if (!error) {
      const { data } = supabase.storage
        .from("research-attachments")
        .getPublicUrl(path);
      results.push({ name: f.file.name, url: data.publicUrl });
    }
  }
  return results;
}

export function useChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchEvents, setResearchEvents] = useState<AgentEvent[]>([]);
  const { user } = useAuth();
  const abortRef = useRef<AbortController | null>(null);

  const createConversation = useCallback(
    async (query: string): Promise<string> => {
      const id = crypto.randomUUID();
      await supabase.from("research_sessions").insert({
        id,
        user_id: user!.id,
        device_id: user!.id,
        query,
      });
      setConversationId(id);
      return id;
    },
    [user]
  );

  const loadConversation = useCallback(
    async (id: string) => {
      if (!user) return;
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      const msgs: ChatMsg[] = (data ?? []).map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        type: m.message_type as "text" | "report",
        metadata: m.metadata || {},
        created_at: m.created_at,
      }));
      setMessages(msgs);
      setConversationId(id);
      setResearchEvents([]);
      setIsResearching(false);
      setIsStreaming(false);
    },
    [user]
  );

  const newConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setResearchEvents([]);
    setIsResearching(false);
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string, files?: UploadedFile[]) => {
      if (!user) return;

      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(content);
      }

      // Upload files
      let fileRefs: { name: string; url: string }[] = [];
      if (files && files.length > 0) {
        try {
          fileRefs = await uploadFiles(files, user.id);
        } catch (err) {
          console.error("File upload failed:", err);
        }
      }

      const fullContent =
        fileRefs.length > 0
          ? `${content}\n\n[Attached: ${fileRefs.map((f) => f.name).join(", ")}]`
          : content;

      // Add user message
      const userMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "user",
        content: fullContent,
        type: "text",
        metadata: fileRefs.length > 0 ? { files: fileRefs } : undefined,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Save user message to DB
      await supabase.from("chat_messages").insert({
        id: userMsg.id,
        conversation_id: convId,
        user_id: user.id,
        role: "user",
        content: fullContent,
        message_type: "text",
        metadata: userMsg.metadata || {},
      } as any);

      // Stream AI response
      setIsStreaming(true);
      const assistantId = crypto.randomUUID();
      let assistantContent = "";

      try {
        const allMsgs = [...messages, userMsg]
          .filter((m) => m.type === "text")
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        // Include report context if any
        const reportMsgs = [...messages, userMsg].filter(
          (m) => m.type === "report" && m.metadata?.report
        );
        if (reportMsgs.length > 0) {
          const lastReport = reportMsgs[reportMsgs.length - 1];
          allMsgs.unshift({
            role: "assistant" as const,
            content: `[Previous research report: "${lastReport.metadata!.report!.title}"]\n\n${lastReport.metadata!.report!.markdown.slice(0, 2000)}...`,
          });
        }

        const controller = new AbortController();
        abortRef.current = controller;

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: allMsgs }),
          signal: controller.signal,
        });

        // Check content-type to see if it's a JSON signal or SSE stream
        const contentType = resp.headers.get("content-type") || "";

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          if (resp.status === 429) {
            toast.error("Rate limit reached. Please wait a moment.");
          } else if (resp.status === 402) {
            toast.error("AI credits exhausted. Please add credits.");
          } else {
            toast.error(errData.error || "Failed to get response");
          }
          setIsStreaming(false);
          return;
        }

        // Handle deep_research signal from classifier
        if (contentType.includes("application/json")) {
          const data = await resp.json();
          if (data.action === "deep_research") {
            setIsStreaming(false);
            // Auto-trigger deep research with the original query
            triggerResearchInternal(convId!, content, userMsg);
            return;
          }
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const token = parsed.choices?.[0]?.delta?.content as
                | string
                | undefined;
              if (token) {
                assistantContent += token;
                const snapshot = assistantContent;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.id === assistantId) {
                    return prev.map((m, i) =>
                      i === prev.length - 1
                        ? { ...m, content: snapshot }
                        : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: assistantId,
                      role: "assistant" as const,
                      content: snapshot,
                      type: "text" as const,
                      created_at: new Date().toISOString(),
                    },
                  ];
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Chat stream error:", err);
        toast.error("Failed to get AI response");
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }

      // Save assistant message
      if (assistantContent) {
        await supabase.from("chat_messages").insert({
          id: assistantId,
          conversation_id: convId,
          user_id: user.id,
          role: "assistant",
          content: assistantContent,
          message_type: "text",
          metadata: {},
        } as any);

        // Update session title from first exchange
        if (messages.length === 0) {
          await supabase
            .from("research_sessions")
            .update({ report_title: content.slice(0, 100) })
            .eq("id", convId);
        }
      }
    },
    [user, conversationId, messages, createConversation]
  );

  // Internal: run research pipeline given a convId and existing user message
  const triggerResearchInternal = useCallback(
    async (convId: string, query: string, existingUserMsg?: ChatMsg) => {
      if (!user) return;

      // If no user message was already added (manual deep research), add one
      if (!existingUserMsg) {
        const userMsg: ChatMsg = {
          id: crypto.randomUUID(),
          role: "user",
          content: `🔬 Deep Research: ${query}`,
          type: "text",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        await supabase.from("chat_messages").insert({
          id: userMsg.id,
          conversation_id: convId,
          user_id: user.id,
          role: "user",
          content: userMsg.content,
          message_type: "text",
          metadata: {},
        } as any);
      }

      setIsResearching(true);
      setResearchEvents([]);

      const onEvent = (event: AgentEvent) => {
        setResearchEvents((prev) => [...prev, event]);
      };

      let report: any;
      try {
        report = await runAIPipeline(query, onEvent);
      } catch (err) {
        console.error("AI pipeline failed, falling back:", err);
        toast.error("AI backend unavailable — running demo mode");
        setResearchEvents([]);
        try {
          report = await runSimulatedPipeline(query, onEvent);
        } catch (simErr) {
          console.error("Simulation failed:", simErr);
          setIsResearching(false);
          toast.error("Research failed");
          return;
        }
      }

      const reportMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: report.title,
        type: "report",
        metadata: { report },
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, reportMsg]);
      setIsResearching(false);
      setResearchEvents([]);

      await supabase.from("chat_messages").insert({
        id: reportMsg.id,
        conversation_id: convId,
        user_id: user.id,
        role: "assistant",
        content: report.title,
        message_type: "report",
        metadata: { report },
      } as any);

      await supabase
        .from("research_sessions")
        .update({
          report_title: report.title,
          report_markdown: report.markdown,
          report_sources: report.sources,
        })
        .eq("id", convId);
    },
    [user]
  );

  const startResearch = useCallback(
    async (query: string, files?: UploadedFile[]) => {
      if (!user) return;

      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(query);
      }

      let fileRefs: { name: string; url: string }[] = [];
      if (files && files.length > 0) {
        try {
          fileRefs = await uploadFiles(files, user.id);
        } catch (err) {
          console.error("File upload failed:", err);
        }
      }

      const fullQuery =
        fileRefs.length > 0
          ? `${query}\n\n[Attached: ${fileRefs.map((f) => f.name).join(", ")}]`
          : query;

      const userMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "user",
        content: `🔬 Deep Research: ${query}`,
        type: "text",
        metadata: fileRefs.length > 0 ? { files: fileRefs } : undefined,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      await supabase.from("chat_messages").insert({
        id: userMsg.id,
        conversation_id: convId,
        user_id: user.id,
        role: "user",
        content: userMsg.content,
        message_type: "text",
        metadata: userMsg.metadata || {},
      } as any);

      await triggerResearchInternal(convId, fullQuery, userMsg);
    },
    [user, conversationId, createConversation, triggerResearchInternal]
  );

  return {
    conversationId,
    messages,
    isStreaming,
    isResearching,
    researchEvents,
    loadConversation,
    newConversation,
    sendMessage,
    startResearch,
  };
}
