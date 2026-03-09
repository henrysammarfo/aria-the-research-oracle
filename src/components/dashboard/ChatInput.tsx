import { useState, useRef } from "react";
import { Send, Sparkles, Paperclip, X, FileText, Telescope } from "lucide-react";
import type { UploadedFile } from "@/hooks/useChat";

const exampleQueries = [
  "What are the latest trends in AI?",
  "Explain quantum computing simply",
  "Compare React vs Vue for 2026",
  "Summarize the EU AI Act",
];

interface ChatInputProps {
  onSend: (message: string, files?: UploadedFile[]) => void;
  onDeepResearch: (query: string, files?: UploadedFile[]) => void;
  isLoading: boolean;
  isDark: boolean;
  showExamples: boolean;
}

export default function ChatInput({
  onSend,
  onDeepResearch,
  isLoading,
  isDark,
  showExamples,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [deepMode, setDeepMode] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent = value.trim() || files.length > 0;

  const handleSubmit = () => {
    if (!hasContent || isLoading || isCoolingDown) return;
    const trimmed = value.trim();
    const f = files.length > 0 ? files : undefined;
    if (deepMode) {
      onDeepResearch(trimmed, f);
    } else {
      onSend(trimmed, f);
    }
    setValue("");
    setFiles([]);
    setIsCoolingDown(true);
    setTimeout(() => setIsCoolingDown(false), 5000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = selectedFiles.map((file) => {
      const uf: UploadedFile = { file };
      if (file.type.startsWith("image/")) {
        uf.preview = URL.createObjectURL(file);
      }
      return uf;
    });
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const f = prev[index];
      if (f.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const c = {
    text: isDark ? "#fff" : "#000",
    surface: isDark ? "rgba(255,255,255,0.04)" : "#FFFFFF",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
    dim: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.7)",
    chipText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.9)",
    chipBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)",
    chipBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)",
    fileBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    fileBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)",
    fileText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.85)",
    // Toggle colors
    toggleOff: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    toggleOffBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.14)",
    toggleOffText: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.75)",
    toggleOn: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.12)",
    toggleOnBorder: isDark ? "rgba(59,130,246,0.35)" : "rgba(59,130,246,0.35)",
    toggleOnText: "#3B82F6",
    // Send button
    sendBg: hasContent
      ? deepMode
        ? isDark ? "rgba(59,130,246,0.9)" : "#3B82F6"
        : isDark ? "#fff" : "#111"
      : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    sendText: hasContent
      ? "#fff"
      : isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.5)",
  };

  // Override sendText for non-deep mode
  const finalSendText = hasContent && !deepMode
    ? (isDark ? "#000" : "#fff")
    : c.sendText;

  return (
    <div className="flex flex-col gap-3">
      {showExamples && (
        <div className="flex flex-col gap-2 mb-2">
          <span
            className="flex items-center gap-1.5 font-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: c.dim,
            }}
          >
            <Sparkles size={10} /> try asking
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {exampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setValue(q);
                  textareaRef.current?.focus();
                }}
                className="rounded-lg text-left transition-colors duration-150 hover:opacity-80"
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  color: c.chipText,
                  background: c.chipBg,
                  border: `1px solid ${c.chipBorder}`,
                  lineHeight: 1.4,
                }}
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: c.surface,
          border: `1px solid ${deepMode ? c.toggleOnBorder : c.border}`,
          boxShadow: isDark
            ? "0 2px 12px rgba(0,0,0,0.3)"
            : "0 1px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
          transition: "border-color 0.2s",
        }}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ padding: "10px 12px 0 12px" }}>
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg"
                style={{
                  padding: "4px 10px 4px 6px",
                  background: c.fileBg,
                  border: `1px solid ${c.fileBorder}`,
                }}
              >
                {f.preview ? (
                  <img src={f.preview} alt="" className="w-7 h-7 rounded object-cover" />
                ) : (
                  <FileText size={13} style={{ color: c.fileText }} />
                )}
                <span className="truncate max-w-[80px] sm:max-w-[120px]" style={{ fontSize: 11, color: c.fileText }}>
                  {f.file.name}
                </span>
                <button
                  onClick={() => removeFile(i)}
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 16, height: 16, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: c.fileText }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={deepMode ? "What should ARIA research in depth?" : "Ask ARIA anything..."}
          rows={2}
          className="w-full bg-transparent resize-none outline-none"
          style={{
            padding: "14px 14px 6px",
            fontSize: 14,
            lineHeight: 1.5,
            color: c.text,
          }}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between" style={{ padding: "2px 10px 8px" }}>
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.md"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || files.length >= 5}
              className="rounded-lg transition-colors disabled:opacity-30 p-1.5"
              style={{ color: c.dim }}
              title="Attach files"
            >
              <Paperclip size={15} />
            </button>

            {/* Deep Research Toggle */}
            <button
              onClick={() => setDeepMode((v) => !v)}
              className="flex items-center gap-1.5 rounded-full font-medium transition-all duration-200"
              style={{
                padding: "5px 12px",
                fontSize: 11,
                color: deepMode ? c.toggleOnText : c.toggleOffText,
                background: deepMode ? c.toggleOn : c.toggleOff,
                border: `1px solid ${deepMode ? c.toggleOnBorder : c.toggleOffBorder}`,
              }}
              title="Toggle deep research mode"
            >
              <Telescope size={13} />
              <span className="hidden xs:inline sm:inline">Deep Research</span>
              {deepMode && (
                <span
                  className="rounded-full"
                  style={{
                    width: 6,
                    height: 6,
                    background: "#3B82F6",
                    display: "inline-block",
                  }}
                />
              )}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!hasContent || isLoading || isCoolingDown}
            className="flex items-center gap-1.5 rounded-xl font-medium transition-all duration-200 disabled:opacity-30"
            style={{
              padding: "7px 14px",
              fontSize: 12,
              background: c.sendBg,
              color: finalSendText,
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>

      {!showExamples && (
        <div className="flex justify-center">
          <span className="font-mono" style={{ fontSize: 10, color: c.dim }}>
            {deepMode ? "Deep Research mode · Enter to send" : "Enter to send · Toggle deep research for comprehensive reports"}
          </span>
        </div>
      )}
    </div>
  );
}
