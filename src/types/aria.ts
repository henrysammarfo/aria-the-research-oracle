export type AgentName = "Orchestrator" | "Researcher" | "Analyst" | "Coder" | "Writer";
export type EventType = "thinking" | "action" | "result" | "error" | "plan" | "code" | "complete";

export interface AgentEvent {
  id: string;
  agent: AgentName;
  type: EventType;
  content: string;
  timestamp: number;
}

export interface TaskState {
  id: string;
  query: string;
  status: "idle" | "running" | "complete" | "error";
  events: AgentEvent[];
  report?: {
    markdown: string;
    title: string;
    sources: { title: string; url: string }[];
  };
}
