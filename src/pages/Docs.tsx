import { useState, useMemo } from "react";
import { Search, ChevronRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DocsSidebar from "@/components/docs/DocsSidebar";
import { articles, categoryLabels, type DocArticle, type DocCategory } from "@/components/docs/DocsData";

const Docs = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DocCategory>("all");
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(null);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pb-24 pt-8 flex gap-8">
        {/* Sidebar TOC */}
        <DocsSidebar selectedId={selectedArticle?.id ?? null} onSelect={handleSelect} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-bold tracking-tight text-foreground" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
              Documentation
            </h1>
            <p className="mt-3 text-muted-foreground" style={{ fontSize: 16, maxWidth: 560 }}>
              API reference, user guides, and everything you need to get the most out of ARIA.
            </p>
          </div>

          {selectedArticle ? (
            <div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 mb-8 transition-colors text-muted-foreground hover:text-foreground"
                style={{ fontSize: 14 }}
              >
                <ArrowLeft size={16} />
                Back to docs
              </button>

              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {categoryLabels[selectedArticle.category]}
              </span>

              <h2 className="font-bold mb-3 text-foreground" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
                {selectedArticle.title}
              </h2>
              <p className="mb-8 text-muted-foreground" style={{ fontSize: 15 }}>
                {selectedArticle.summary}
              </p>

              <div className="rounded-xl p-6 md:p-8 bg-card border border-border">
                <ol className="space-y-4">
                  {selectedArticle.content.map((step, i) => (
                    <li key={i} className="flex gap-4 text-card-foreground" style={{ fontSize: 14.5, lineHeight: 1.7 }}>
                      <span className="flex-shrink-0 font-mono font-bold mt-0.5 text-muted-foreground" style={{ fontSize: 13, minWidth: 20 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono" style={{ wordBreak: "break-word" }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <>
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center gap-3 flex-1 rounded-xl px-4 bg-card border border-border" style={{ height: 48 }}>
                  <Search size={16} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search documentation…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none flex-1 placeholder:text-muted-foreground/40 text-foreground"
                    style={{ fontSize: 14 }}
                  />
                </div>

                <div className="flex gap-2">
                  {(Object.keys(categoryLabels) as DocCategory[]).map((cat) => {
                    const active = category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-all border ${
                          active
                            ? "bg-accent text-accent-foreground border-border"
                            : "text-muted-foreground border-transparent hover:text-foreground"
                        }`}
                      >
                        {categoryLabels[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Articles Grid */}
              {filtered.length === 0 ? (
                <p className="text-center py-20 text-muted-foreground" style={{ fontSize: 15 }}>
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
                        className="group text-left rounded-xl p-5 transition-all duration-200 hover:scale-[1.01] bg-card border border-border hover:border-accent"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center justify-center rounded-lg bg-accent" style={{ width: 36, height: 36 }}>
                            <Icon size={16} className="text-muted-foreground" />
                          </div>
                          <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                            style={{ marginTop: 4 }}
                          />
                        </div>
                        <h3 className="font-semibold mb-1 text-foreground" style={{ fontSize: 15 }}>
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.5 }}>
                          {article.summary}
                        </p>
                        <span className="inline-block mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
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
