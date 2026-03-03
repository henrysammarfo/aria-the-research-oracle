import ReactMarkdown from "react-markdown";
import { Copy, Download, ExternalLink, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { TaskState } from "@/types/aria";

const ReportView = ({ report }: { report: NonNullable<TaskState["report"]> }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div>
          <h3 className="text-white font-medium" style={{ fontSize: 14 }}>
            {report.title}
          </h3>
          <span className="text-white/20 font-mono" style={{ fontSize: 10 }}>
            {new Date().toLocaleDateString()} · {report.markdown.split(/\s+/).length} words · {report.sources.length} citations
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
            style={{
              padding: "6px 12px",
              fontSize: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
            style={{
              padding: "6px 12px",
              fontSize: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Download size={13} />
            PDF
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "24px 28px" }}>
        <div
          className="prose prose-invert prose-sm max-w-none"
          style={{
            '--tw-prose-headings': 'rgba(255,255,255,0.9)',
            '--tw-prose-body': 'rgba(255,255,255,0.5)',
            '--tw-prose-bold': 'rgba(255,255,255,0.7)',
            '--tw-prose-links': '#3B82F6',
            '--tw-prose-code': 'rgba(255,255,255,0.6)',
            '--tw-prose-th-borders': 'rgba(255,255,255,0.1)',
            '--tw-prose-td-borders': 'rgba(255,255,255,0.06)',
          } as React.CSSProperties}
        >
          <ReactMarkdown>{report.markdown}</ReactMarkdown>
        </div>

        {/* Sources */}
        <div className="mt-10 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <h4 className="text-white/40 font-mono mb-4" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Sources ({report.sources.length})
          </h4>
          <div className="flex flex-col gap-2">
            {report.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                style={{ padding: "8px 12px" }}
              >
                <span className="text-white/15 font-mono flex-shrink-0" style={{ fontSize: 11, width: 20 }}>
                  [{i + 1}]
                </span>
                <span className="text-white/40 group-hover:text-white/60 transition-colors" style={{ fontSize: 13 }}>
                  {s.title}
                </span>
                <ExternalLink size={12} className="ml-auto text-white/10 group-hover:text-white/30 flex-shrink-0 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
