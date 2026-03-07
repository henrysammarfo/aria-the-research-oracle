import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Share2,
  CheckCircle2,
  ExternalLink,
  Telescope,
} from "lucide-react";
import type { ChatMsg } from "@/hooks/useChat";

interface ChatMessageProps {
  message: ChatMsg;
  isDark: boolean;
}

export default function ChatMessage({ message, isDark }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isReport = message.type === "report";
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const c = {
    userBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    userText: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.95)",
    assistantText: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.9)",
    assistantBody: isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.85)",
    dim: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)",
    reportBg: isDark ? "rgba(59,130,246,0.04)" : "rgba(59,130,246,0.04)",
    reportBorder: isDark
      ? "rgba(59,130,246,0.15)"
      : "rgba(59,130,246,0.18)",
    reportTitle: isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.95)",
    btnText: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.65)",
    btnBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    btnBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
    sourceText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.75)",
    sourceDim: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.5)",
    border: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)",
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-3 sm:mb-4">
        <div
          className="rounded-2xl max-w-[90%] sm:max-w-[75%] md:max-w-[70%]"
          style={{
            padding: "10px 14px",
            background: c.userBg,
            color: c.userText,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {message.content}
          {message.metadata?.files && message.metadata.files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {message.metadata.files.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 rounded-md"
                  style={{
                    padding: "2px 8px",
                    fontSize: 11,
                    background: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)",
                    color: c.dim,
                  }}
                >
                  <FileText size={10} />
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isReport && message.metadata?.report) {
    const report = message.metadata.report;
    const btnStyle = {
      padding: "5px 10px",
      fontSize: 11,
      background: c.btnBg,
      border: `1px solid ${c.btnBorder}`,
      color: c.btnText,
    };

    return (
      <div className="mb-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: c.reportBg,
            border: `1px solid ${c.reportBorder}`,
          }}
        >
          {/* Report header */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between transition-colors hover:opacity-80"
            style={{ padding: "14px 18px" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Telescope size={16} className="text-blue-400 flex-shrink-0" />
              <h3
                className="font-semibold truncate text-left"
                style={{ fontSize: 15, color: c.reportTitle }}
              >
                {report.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span
                className="font-mono"
                style={{ fontSize: 10, color: c.dim }}
              >
                {report.markdown.split(/\s+/).length} words ·{" "}
                {report.sources.length} sources
              </span>
              {expanded ? (
                <ChevronUp size={16} style={{ color: c.dim }} />
              ) : (
                <ChevronDown size={16} style={{ color: c.dim }} />
              )}
            </div>
          </button>

          {expanded && (
            <>
              {/* Actions */}
              <div
                className="flex items-center gap-2 flex-wrap"
                style={{
                  padding: "0 18px 12px",
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(report.markdown);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 rounded-lg"
                  style={btnStyle}
                >
                  {copied ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <Copy size={12} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => {
                    const slug = report.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-");
                    const blob = new Blob(
                      [`# ${report.title}\n\n${report.markdown}`],
                      { type: "text/markdown" }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${slug}.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-1.5 rounded-lg"
                  style={btnStyle}
                >
                  <Download size={12} /> .md
                </button>
              </div>

              {/* Report body */}
              <div style={{ padding: "16px 18px" }}>
                <div
                  className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}`}
                  style={
                    {
                      "--tw-prose-headings": c.reportTitle,
                      "--tw-prose-body": c.assistantBody,
                      "--tw-prose-bold": isDark
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(0,0,0,0.85)",
                      "--tw-prose-links": "#3B82F6",
                      "--tw-prose-bullets": c.dim,
                      "--tw-prose-counters": c.dim,
                      "--tw-prose-code": isDark
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.7)",
                      "--tw-prose-pre-bg": isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.04)",
                      "--tw-prose-pre-code": isDark
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.7)",
                      color: c.assistantBody,
                    } as React.CSSProperties
                  }
                >
                  <ReactMarkdown>{report.markdown}</ReactMarkdown>
                </div>

                {/* Sources */}
                {report.sources.length > 0 && (
                  <div
                    className="mt-6 pt-4"
                    style={{ borderTop: `1px solid ${c.border}` }}
                  >
                    <h4
                      className="font-mono mb-3"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: c.btnText,
                      }}
                    >
                      Sources ({report.sources.length})
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {report.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg hover:opacity-80 transition-opacity"
                          style={{ padding: "4px 8px" }}
                        >
                          <span
                            className="font-mono flex-shrink-0"
                            style={{
                              fontSize: 10,
                              width: 18,
                              color: c.sourceDim,
                            }}
                          >
                            [{i + 1}]
                          </span>
                          <span
                            className="break-all"
                            style={{ fontSize: 12, color: c.sourceText }}
                          >
                            {s.title}
                          </span>
                          <ExternalLink
                            size={10}
                            className="ml-auto flex-shrink-0"
                            style={{ color: c.sourceDim }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Assistant text message
  return (
    <div className="mb-4 max-w-[90%] sm:max-w-[80%]">
      <div
        className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}`}
        style={
          {
            "--tw-prose-headings": c.assistantText,
            "--tw-prose-body": c.assistantBody,
            "--tw-prose-bold": isDark
              ? "rgba(255,255,255,0.85)"
              : "rgba(0,0,0,0.9)",
            "--tw-prose-links": "#3B82F6",
            "--tw-prose-bullets": c.dim,
            "--tw-prose-counters": c.dim,
            "--tw-prose-code": isDark
              ? "rgba(255,255,255,0.7)"
              : "rgba(0,0,0,0.8)",
            "--tw-prose-pre-bg": isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.05)",
            "--tw-prose-pre-code": isDark
              ? "rgba(255,255,255,0.7)"
              : "rgba(0,0,0,0.8)",
            color: c.assistantBody,
            fontSize: 14,
            lineHeight: 1.7,
          } as React.CSSProperties
        }
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}
