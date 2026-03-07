import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";

const exampleQueries = [
  "Analyze the economic impact of AI on software engineering jobs",
  "Research and compare top vector databases for production use",
  "What are the implications of EU AI Act on startups?",
  "Compare transformer architectures: Mamba vs Attention vs RWKV",
];

export interface UploadedFile {
  file: File;
  preview?: string;
}

interface TaskInputProps {
  onSubmit: (query: string, files?: UploadedFile[]) => void;
  isLoading: boolean;
  isDark?: boolean;
}

const TaskInput = ({ onSubmit, isLoading, isDark = true }: TaskInputProps) => {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((!value.trim() && files.length === 0) || isLoading) return;
    onSubmit(value.trim(), files.length > 0 ? files : undefined);
    setValue("");
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
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
    text: isDark ? "#fff" : "#1a1a1a",
    placeholder: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.4)",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)",
    dim: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.35)",
    chipText: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.55)",
    chipBg: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)",
    chipBorder: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)",
    btnBg: (value.trim() || files.length > 0) ? (isDark ? "#fff" : "#1a1a1a") : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
    btnText: (value.trim() || files.length > 0) ? (isDark ? "#000" : "#fff") : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)"),
    fileBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    fileBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    fileText: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-xl overflow-hidden" style={{ background: c.surface, border: `1px solid ${c.border}` }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask ARIA anything..."
          rows={3}
          className="w-full bg-transparent resize-none outline-none font-normal"
          style={{ padding: "18px 20px 50px", fontSize: 15, lineHeight: 1.6, color: c.text }}
          disabled={isLoading}
        />

        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ padding: "0 16px 8px" }}>
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg group relative"
                style={{ padding: "4px 10px 4px 6px", background: c.fileBg, border: `1px solid ${c.fileBorder}` }}
              >
                {f.preview ? (
                  <img src={f.preview} alt="" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <FileText size={14} style={{ color: c.fileText }} />
                )}
                <span className="truncate max-w-[120px]" style={{ fontSize: 11, color: c.fileText }}>
                  {f.file.name}
                </span>
                <button
                  onClick={() => removeFile(i)}
                  className="rounded-full flex items-center justify-center transition-opacity"
                  style={{ width: 16, height: 16, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: c.fileText }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between" style={{ padding: "10px 16px" }}>
          <div className="flex items-center gap-2">
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
              className="rounded-lg transition-colors disabled:opacity-30"
              style={{ padding: "6px", color: c.dim }}
              title="Attach files (max 5)"
            >
              <Paperclip size={15} />
            </button>
            <span className="font-mono hidden sm:inline" style={{ fontSize: 11, color: c.dim }}>⌘ + Enter</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={(!value.trim() && files.length === 0) || isLoading}
            className="flex items-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: c.btnBg, color: c.btnText, padding: "8px 16px", fontSize: 13 }}
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
            {isLoading ? "Running..." : "Research"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 font-mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: c.dim }}>
          <Sparkles size={10} /> example queries
        </span>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((q) => (
            <motion.button
              key={q}
              onClick={() => { setValue(q); textareaRef.current?.focus(); }}
              className="rounded-lg text-left transition-colors duration-150"
              style={{ padding: "8px 14px", fontSize: 12, color: c.chipText, background: c.chipBg, border: `1px solid ${c.chipBorder}`, lineHeight: 1.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
            >
              {q}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskInput;
