import { supabase } from "@/integrations/supabase/client";
import type { AgentEvent, TaskState } from "@/types/aria";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aria-research`;

export async function runAIPipeline(
  query: string,
  onEvent: (e: AgentEvent) => void
): Promise<TaskState["report"]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("AUTH_REQUIRED");
  }

  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!resp.ok) {
    if (resp.status === 401) {
      throw new Error("AUTH_REQUIRED");
    }
    if (resp.status === 429) {
      const data = await resp.json().catch(() => ({}));
      const message =
        (data as any)?.error || "You have hit the research rate limit. Please wait and try again.";
      throw new Error(message);
    }
    const text = await resp.text();
    throw new Error(`Request failed (${resp.status}): ${text}`);
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let report: TaskState["report"] | undefined;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;

      try {
        const event: AgentEvent = JSON.parse(jsonStr);

        // Check if this is the complete event with report data
        if (event.type === "complete" && event.agent === "Orchestrator") {
          try {
            const reportData = JSON.parse(event.content);
            report = {
              title: reportData.title,
              markdown: reportData.markdown,
              sources: reportData.sources,
            };
            // Emit a clean complete event
            onEvent({
              ...event,
              content: "All agents finished successfully. Report ready.",
            });
          } catch {
            onEvent(event);
          }
        } else {
          onEvent(event);
        }
      } catch {
        // partial JSON, skip
      }
    }
  }

  if (!report) {
    throw new Error("Pipeline completed without generating a report");
  }

  return report;
}
