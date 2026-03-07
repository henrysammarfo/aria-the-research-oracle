import { Book, Code2, Lightbulb } from "lucide-react";
import { articles, categoryLabels, type DocArticle, type DocCategory } from "./DocsData";
import { cn } from "@/lib/utils";

const categoryOrder: DocCategory[] = ["guide", "api", "kb"];
const categoryIcons: Record<DocCategory, typeof Book> = {
  all: Book,
  guide: Book,
  api: Code2,
  kb: Lightbulb,
};

interface DocsSidebarProps {
  selectedId: string | null;
  onSelect: (article: DocArticle) => void;
  mobile?: boolean;
}

export default function DocsSidebar({ selectedId, onSelect, mobile }: DocsSidebarProps) {
  return (
    <nav
      className={cn(
        mobile
          ? "block"
          : "hidden lg:block w-56 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto pr-4"
      )}
    >
      {categoryOrder.map((cat) => {
        const Icon = categoryIcons[cat];
        const items = articles.filter((a) => a.category === cat);
        return (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color: "hsl(0 0% 40%)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "hsl(0 0% 40%)" }}
              >
                {categoryLabels[cat]}
              </span>
            </div>
            <ul className="space-y-0.5">
              {items.map((article) => (
                <li key={article.id}>
                  <button
                    onClick={() => onSelect(article)}
                    className="w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors truncate"
                    style={{
                      background: selectedId === article.id ? "hsl(0 0% 12%)" : "transparent",
                      color: selectedId === article.id ? "hsl(0 0% 90%)" : "hsl(0 0% 50%)",
                      fontWeight: selectedId === article.id ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedId !== article.id) {
                        e.currentTarget.style.color = "hsl(0 0% 75%)";
                        e.currentTarget.style.background = "hsl(0 0% 8%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedId !== article.id) {
                        e.currentTarget.style.color = "hsl(0 0% 50%)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {article.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
