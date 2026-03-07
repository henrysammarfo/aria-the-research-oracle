import ReactMarkdown from "react-markdown";
import { Copy, Download, ExternalLink, CheckCircle2, FileText, Share2, Link2, X } from "lucide-react";
import { useState, useCallback, forwardRef } from "react";
import { toast } from "sonner";
import type { TaskState } from "@/types/aria";

interface ReportViewProps {
  report: NonNullable<TaskState["report"]>;
  isDark?: boolean;
  sessionId?: string;
  onShare?: () => Promise<string | null>;
  onUnshare?: () => Promise<void>;
}

const ReportView = forwardRef<HTMLDivElement, ReportViewProps>(({ report, isDark = true, sessionId, onShare, onUnshare }, ref) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const c = {
    text: isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.95)",
    textBody: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.8)",
    dim: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.45)",
    ghost: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.18)",
    btnText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.7)",
    btnBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    btnBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.16)",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.14)",
    sourceDim: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.4)",
    sourceText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.75)",
  };

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
    downloadFile(`# ${report.title}\n\n${report.markdown}${sourcesSection}`, `${slug}.md`, "text/markdown;charset=utf-8");
  }, [report, downloadFile]);

  const handleDownloadPdf = useCallback(() => {
    const slug = report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const sourcesHtml = report.sources.length
      ? `<hr><h2>Sources</h2><ol>${report.sources.map((s) => `<li><a href="${s.url}">${s.title}</a></li>`).join("")}</ol>`
      : "";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${report.title}</title>
<style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.7;font-size:14px}h1{font-size:24px}h2{font-size:18px;margin-top:28px}a{color:#2563eb}hr{border:none;border-top:1px solid #e5e5e5;margin:24px 0}code{background:#f5f5f5;padding:2px 6px;border-radius:4px}pre{background:#f5f5f5;padding:16px;border-radius:8px;overflow-x:auto}</style></head><body>
<h1>${report.title}</h1><div id="c"></div>${sourcesHtml}
<script>document.getElementById('c').innerHTML=${JSON.stringify(report.markdown)}.replace(/^### (.*$)/gim,'<h3>$1</h3>').replace(/^## (.*$)/gim,'<h2>$1</h2>').replace(/^# (.*$)/gim,'<h1>$1</h1>').replace(/\\*\\*(.*?)\\*\\*/g,'<strong>$1</strong>').replace(/\\*(.*?)\\*/g,'<em>$1</em>').replace(/\\n/g,'<br>');window.onload=()=>{window.print()};</script></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }, [report]);

  const handleShare = useCallback(async () => {
    if (!onShare) return;
    setSharing(true);
    try {
      const shareId = await onShare();
      if (shareId) {
        const url = `${window.location.origin}/report/${shareId}`;
        setShareUrl(url);
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to create share link");
    } finally {
      setSharing(false);
    }
  }, [onShare]);

  const handleUnshare = useCallback(async () => {
    if (!onUnshare) return;
    await onUnshare();
    setShareUrl(null);
    toast.success("Share link removed");
  }, [onUnshare]);

  const btnStyle = { padding: "6px 12px", fontSize: 12, background: c.btnBg, border: `1px solid ${c.btnBorder}`, color: c.btnText };

  return (
    <div ref={ref} className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2" style={{ padding: "12px 20px", borderBottom: `1px solid ${c.border}` }}>
        <div className="min-w-0">
          <h3 className="font-medium truncate" style={{ fontSize: 14, color: c.text }}>{report.title}</h3>
          <span className="font-mono" style={{ fontSize: 10, color: c.dim }}>
            {new Date().toLocaleDateString()} · {report.markdown.split(/\s+/).length} words · {report.sources.length} citations
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-lg transition-colors" style={btnStyle}>
            {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={handleDownloadMd} className="flex items-center gap-1.5 rounded-lg transition-colors" style={btnStyle}>
            <FileText size={13} />.md
          </button>
          <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 rounded-lg transition-colors" style={btnStyle}>
            <Download size={13} />PDF
          </button>
          {onShare && (
            <button
              onClick={shareUrl ? handleUnshare : handleShare}
              disabled={sharing}
              className="flex items-center gap-1.5 rounded-lg transition-colors"
              style={{
                ...btnStyle,
                ...(shareUrl ? { background: isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.08)", borderColor: isDark ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)", color: "#3B82F6" } : {}),
              }}
            >
              {shareUrl ? <><Link2 size={13} />Shared</> : <><Share2 size={13} />Share</>}
            </button>
          )}
        </div>
      </div>

      {/* Share banner */}
      {shareUrl && (
        <div className="flex items-center gap-3 flex-shrink-0" style={{ padding: "8px 20px", background: isDark ? "rgba(59,130,246,0.05)" : "rgba(59,130,246,0.04)", borderBottom: `1px solid ${isDark ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.08)"}` }}>
          <Link2 size={12} className="text-blue-400 flex-shrink-0" />
          <span className="font-mono truncate flex-1" style={{ fontSize: 11, color: "#3B82F6" }}>{shareUrl}</span>
          <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Copied!"); }} className="font-mono flex-shrink-0" style={{ fontSize: 10, color: "#3B82F6" }}>Copy</button>
          <button onClick={handleUnshare} className="flex-shrink-0" style={{ color: c.dim }}><X size={12} /></button>
        </div>
      )}

      {/* Report content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "24px 20px" }}>
        <div
          className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}`}
          style={{
            '--tw-prose-headings': c.text,
            '--tw-prose-body': c.textBody,
            '--tw-prose-bold': isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
            '--tw-prose-links': '#3B82F6',
            '--tw-prose-code': isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.75)",
            '--tw-prose-pre-bg': isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            '--tw-prose-pre-code': isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.75)",
            '--tw-prose-th-borders': c.ghost,
            '--tw-prose-td-borders': c.border,
            '--tw-prose-bullets': isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)",
            '--tw-prose-counters': isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)",
            '--tw-prose-quotes': isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)",
            '--tw-prose-quote-borders': isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)",
            color: c.textBody,
          } as React.CSSProperties}
        >
          <ReactMarkdown>{report.markdown}</ReactMarkdown>
        </div>

        <div className="mt-10 pt-6" style={{ borderTop: `1px solid ${c.border}` }}>
          <h4 className="font-mono mb-4" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: c.btnText }}>
            Sources ({report.sources.length})
          </h4>
          <div className="flex flex-col gap-2">
            {report.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg transition-colors" style={{ padding: "8px 12px" }}>
                <span className="font-mono flex-shrink-0" style={{ fontSize: 11, width: 20, color: c.sourceDim }}>[{i + 1}]</span>
                <span className="transition-colors break-all" style={{ fontSize: 13, color: c.sourceText }}>{s.title}</span>
                <ExternalLink size={12} className="ml-auto flex-shrink-0 transition-colors" style={{ color: c.ghost }} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

ReportView.displayName = "ReportView";

export default ReportView;
