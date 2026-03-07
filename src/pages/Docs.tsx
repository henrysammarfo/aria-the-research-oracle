import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronRight, ArrowLeft, Menu } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import { articles, categoryLabels, type DocArticle, type DocCategory } from "@/components/docs/DocsData";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const CodeBlock = ({ children }: { children: string }) => (
  <code
    className="inline rounded px-1.5 py-0.5 font-mono text-[13px]"
    style={{
      background: "hsl(0 0% 10%)",
      color: "hsl(142 70% 65%)",
      border: "1px solid hsl(0 0% 14%)",
    }}
  >
    {children}
  </code>
);

/** Renders a content step, detecting inline `code` and code-block lines */
function renderStep(text: string) {
  // Full-line code (starts with common code patterns)
  const codePatterns = [
    /^(POST |GET |PUT |DELETE |PATCH |HEAD |OPTIONS )/,
    /^(Endpoint: |Headers: |Body: |Response: |Event format: )/,
    /^data: /,
  ];
  const isCodeLine = codePatterns.some((p) => p.test(text));

  if (isCodeLine) {
    return (
      <div
        className="rounded-lg px-4 py-3 font-mono text-[13px] overflow-x-auto"
        style={{
          background: "hsl(0 0% 8%)",
          color: "hsl(142 70% 65%)",
          border: "1px solid hsl(0 0% 14%)",
          wordBreak: "break-all",
        }}
      >
        {text}
      </div>
    );
  }

  // Inline code detection: anything between backtick-like quotes or known patterns
  const parts = text.split(/(`[^`]+`)/g);
  if (parts.length > 1) {
    return (
      <span>
        {parts.map((part, i) =>
          part.startsWith("`") && part.endsWith("`") ? (
            <CodeBlock key={i}>{part.slice(1, -1)}</CodeBlock>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  }

  return <span>{text}</span>;
}

const Docs = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DocCategory>("all");
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSelectedArticle(null);
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = category === "all" || a.category === category;
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category]);

  const handleSelect = (article: DocArticle) => {
    setSelectedArticle(article);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ background: "#050505", color: "hsl(0 0% 93%)" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 pt-8 flex gap-8">
        {/* Desktop Sidebar TOC */}
        <DocsSidebar selectedId={selectedArticle?.id ?? null} onSelect={handleSelect} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header + mobile TOC trigger */}
          <div className="mb-12 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-bold tracking-tight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "hsl(0 0% 95%)" }}>
                Documentation
              </h1>
              <p className="mt-3" style={{ fontSize: 16, color: "hsl(0 0% 45%)", maxWidth: 560 }}>
                API reference, user guides, and everything you need to get the most out of ARIA.
              </p>
            </div>

            {/* Mobile TOC button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden flex items-center gap-2 shrink-0 mt-2 px-3 py-2 rounded-lg transition-colors text-sm"
                  style={{
                    border: "1px solid hsl(0 0% 15%)",
                    background: "hsl(0 0% 8%)",
                    color: "hsl(0 0% 55%)",
                  }}
                >
                  <Menu size={16} />
                  <span className="hidden sm:inline">Contents</span>
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 p-0"
                style={{
                  background: "#080808",
                  borderColor: "hsl(0 0% 12%)",
                  color: "hsl(0 0% 90%)",
                }}
              >
                <div className="p-6 pt-10">
                  <h2
                    className="text-sm font-semibold uppercase tracking-widest mb-6"
                    style={{ color: "hsl(0 0% 40%)" }}
                  >
                    Table of Contents
                  </h2>
                  <DocsSidebar
                    selectedId={selectedArticle?.id ?? null}
                    onSelect={handleSelect}
                    mobile
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {selectedArticle ? (
            <div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 mb-8 transition-colors hover:opacity-80"
                style={{ color: "hsl(0 0% 50%)", fontSize: 14 }}
              >
                <ArrowLeft size={16} />
                Back to docs
              </button>

              <span
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "hsl(0 0% 40%)" }}
              >
                {categoryLabels[selectedArticle.category]}
              </span>

              <h2
                className="font-bold mb-3"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "hsl(0 0% 93%)" }}
              >
                {selectedArticle.title}
              </h2>
              <p className="mb-8" style={{ fontSize: 15, color: "hsl(0 0% 45%)" }}>
                {selectedArticle.summary}
              </p>

              <div
                className="rounded-xl p-6 md:p-8"
                style={{
                  background: "hsl(0 0% 6%)",
                  border: "1px solid hsl(0 0% 12%)",
                }}
              >
                <ol className="space-y-4">
                  {selectedArticle.content.map((step, i) => (
                    <li key={i} className="flex gap-4" style={{ fontSize: 14.5, color: "hsl(0 0% 72%)", lineHeight: 1.7 }}>
                      <span
                        className="flex-shrink-0 font-mono font-bold mt-0.5"
                        style={{ color: "hsl(0 0% 35%)", fontSize: 13, minWidth: 20 }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="font-mono" style={{ wordBreak: "break-word" }}>
                        {renderStep(step)}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <>
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div
                  className="flex items-center gap-3 flex-1 rounded-xl px-4"
                  style={{
                    background: "hsl(0 0% 6%)",
                    border: "1px solid hsl(0 0% 12%)",
                    height: 48,
                  }}
                >
                  <Search size={16} style={{ color: "hsl(0 0% 35%)" }} />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search documentation…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none flex-1 placeholder:text-white/20"
                    style={{ fontSize: 14, color: "hsl(0 0% 80%)" }}
                  />
                  <kbd
                    className="hidden sm:inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px]"
                    style={{
                      background: "hsl(0 0% 10%)",
                      color: "hsl(0 0% 40%)",
                      border: "1px solid hsl(0 0% 15%)",
                    }}
                  >
                    ⌘K
                  </kbd>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(categoryLabels) as DocCategory[]).map((cat) => {
                    const active = category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                        style={{
                          background: active ? "hsl(0 0% 15%)" : "transparent",
                          color: active ? "hsl(0 0% 90%)" : "hsl(0 0% 40%)",
                          border: active ? "1px solid hsl(0 0% 20%)" : "1px solid transparent",
                        }}
                      >
                        {categoryLabels[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Articles Grid */}
              {filtered.length === 0 ? (
                <p className="text-center py-20" style={{ color: "hsl(0 0% 30%)", fontSize: 15 }}>
                  No articles match your search.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filtered.map((article) => {
                    const Icon = article.icon;
                    return (
                      <button
                        key={article.id}
                        onClick={() => handleSelect(article)}
                        className="group text-left rounded-xl p-5 transition-all duration-200 hover:scale-[1.01]"
                        style={{
                          background: "hsl(0 0% 6%)",
                          border: "1px solid hsl(0 0% 10%)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "hsl(0 0% 18%)";
                          e.currentTarget.style.background = "hsl(0 0% 7%)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "hsl(0 0% 10%)";
                          e.currentTarget.style.background = "hsl(0 0% 6%)";
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="flex items-center justify-center rounded-lg"
                            style={{ width: 36, height: 36, background: "hsl(0 0% 10%)" }}
                          >
                            <Icon size={16} style={{ color: "hsl(0 0% 50%)" }} />
                          </div>
                          <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "hsl(0 0% 35%)", marginTop: 4 }}
                          />
                        </div>
                        <h3 className="font-semibold mb-1" style={{ fontSize: 15, color: "hsl(0 0% 88%)" }}>
                          {article.title}
                        </h3>
                        <p style={{ fontSize: 13, color: "hsl(0 0% 40%)", lineHeight: 1.5 }}>
                          {article.summary}
                        </p>
                        <span
                          className="inline-block mt-3 text-xs font-medium uppercase tracking-wider"
                          style={{ color: "hsl(0 0% 30%)" }}
                        >
                          {categoryLabels[article.category]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Docs;
