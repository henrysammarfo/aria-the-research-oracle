import ReactMarkdown from "react-markdown";
import { Copy, Download, ExternalLink, CheckCircle2, FileText } from "lucide-react";
import { useState, useCallback } from "react";
import type { TaskState } from "@/types/aria";

const ReportView = ({ report }: { report: NonNullable<TaskState["report"]> }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = useCallback((content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadMd = useCallback(() => {
    const slug = report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const sourcesSection = report.sources.length
      ? `\n\n---\n\n## Sources\n\n${report.sources.map((s, i) => `${i + 1}. [${s.title}](${s.url})`).join("\n")}`
      : "";
    const content = `# ${report.title}\n\n${report.markdown}${sourcesSection}`;
    downloadFile(content, `${slug}.md`, "text/markdown;charset=utf-8");
  }, [report, downloadFile]);

  const handleDownloadPdf = useCallback(() => {
    const slug = report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const sourcesHtml = report.sources.length
      ? `<hr><h2>Sources</h2><ol>${report.sources.map((s) => `<li><a href="${s.url}">${s.title}</a></li>`).join("")}</ol>`
      : "";

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${report.title}</title>
<style>
  body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.7; font-size: 14px; }
  h1 { font-size: 24px; margin-bottom: 8px; }
  h2 { font-size: 18px; margin-top: 28px; }
  h3 { font-size: 15px; }
  a { color: #2563eb; }
  hr { border: none; border-top: 1px solid #e5e5e5; margin: 24px 0; }
  code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
  blockquote { border-left: 3px solid #d4d4d4; margin-left: 0; padding-left: 16px; color: #525252; }
</style></head><body>
<h1>${report.title}</h1>
<div id="content"></div>
${sourcesHtml}
<script>
  document.getElementById('content').innerHTML = ${JSON.stringify(report.markdown)}.replace(/^### (.*$)/gim,'<h3>$1</h3>').replace(/^## (.*$)/gim,'<h2>$1</h2>').replace(/^# (.*$)/gim,'<h1>$1</h1>').replace(/\\*\\*(.*?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.*?)\\*/g,'<em>$1</em>').replace(/\\n/g,'<br>');
  window.onload = () => { window.print(); };
</script></body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    // Cleanup after a delay
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [report]);

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
            onClick={handleDownloadMd}
            className="flex items-center gap-1.5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
            style={{
              padding: "6px 12px",
              fontSize: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <FileText size={13} />
            .md
          </button>
          <button
            onClick={handleDownloadPdf}
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
