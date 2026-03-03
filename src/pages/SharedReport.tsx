import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ExternalLink, Copy, CheckCircle2, Download, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface SharedReport {
  report_title: string | null;
  report_markdown: string | null;
  report_sources: { title: string; url: string }[] | null;
  query: string;
  created_at: string;
}

const SharedReportPage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [report, setReport] = useState<SharedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!shareId) return;
    (async () => {
      const { data, error } = await supabase
        .from("research_sessions")
        .select("report_title, report_markdown, report_sources, query, created_at")
        .eq("share_id", shareId)
        .single();
      if (error || !data || !data.report_markdown) {
        setNotFound(true);
      } else {
        setReport({ ...data, report_sources: data.report_sources as any });
      }
      setLoading(false);
    })();
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#0A0A0A" }}>
        <motion.div
          className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: "#0A0A0A" }}>
        <p className="text-white/40 font-mono" style={{ fontSize: 14 }}>Report not found or no longer shared.</p>
        <Link to="/" className="text-blue-400 hover:text-blue-300 font-mono transition-colors" style={{ fontSize: 13 }}>
          ← Back to ARIA
        </Link>
      </div>
    );
  }

  const title = report.report_title || report.query;
  const sources = report.report_sources || [];
  const wordCount = report.report_markdown?.split(/\s+/).length || 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report.report_markdown || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md" style={{ background: "rgba(10,10,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between" style={{ padding: "14px 24px" }}>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/30 hover:text-white/60 transition-colors"><ArrowLeft size={16} /></Link>
            <span className="text-white font-bold tracking-[0.2em] uppercase" style={{ fontSize: 12 }}>ARIA</span>
            <span className="text-white/10 font-mono" style={{ fontSize: 10 }}>/ shared report</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 rounded-lg text-white/40 hover:text-white/70 transition-colors" style={{ padding: "6px 12px", fontSize: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto" style={{ padding: "40px 24px 80px" }}>
        <h1 className="text-white font-bold" style={{ fontSize: 28, lineHeight: 1.3, marginBottom: 8 }}>{title}</h1>
        <p className="text-white/20 font-mono mb-10" style={{ fontSize: 11 }}>
          {new Date(report.created_at).toLocaleDateString()} · {wordCount} words · {sources.length} sources
        </p>

        <div
          className="prose prose-invert prose-sm max-w-none"
          style={{
            '--tw-prose-headings': 'rgba(255,255,255,0.9)',
            '--tw-prose-body': 'rgba(255,255,255,0.5)',
            '--tw-prose-bold': 'rgba(255,255,255,0.7)',
            '--tw-prose-links': '#3B82F6',
            '--tw-prose-code': 'rgba(255,255,255,0.6)',
          } as React.CSSProperties}
        >
          <ReactMarkdown>{report.report_markdown || ""}</ReactMarkdown>
        </div>

        {sources.length > 0 && (
          <div className="mt-12 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <h4 className="text-white/40 font-mono mb-4" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Sources ({sources.length})
            </h4>
            <div className="flex flex-col gap-2">
              {sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-lg hover:bg-white/[0.03] transition-colors" style={{ padding: "8px 12px" }}>
                  <span className="text-white/15 font-mono flex-shrink-0" style={{ fontSize: 11, width: 20 }}>[{i + 1}]</span>
                  <span className="text-white/40 group-hover:text-white/60 transition-colors" style={{ fontSize: 13 }}>{s.title}</span>
                  <ExternalLink size={12} className="ml-auto text-white/10 group-hover:text-white/30 flex-shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedReportPage;
