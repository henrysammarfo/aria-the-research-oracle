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
              <Icon size={14} className="text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {categoryLabels[cat]}
              </span>
            </div>
            <ul className="space-y-0.5">
              {items.map((article) => (
                <li key={article.id}>
                  <button
                    onClick={() => onSelect(article)}
                    className={cn(
                      "w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors truncate",
                      selectedId === article.id
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
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
