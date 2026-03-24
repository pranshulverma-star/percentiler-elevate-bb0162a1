import { useEffect, useState, useCallback } from "react";
import { List } from "lucide-react";

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 or 3
}

interface BlogTableOfContentsProps {
  items: TocItem[];
}

const BlogTableOfContents = ({ items }: BlogTableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");

  const handleScroll = useCallback(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    // Find the heading closest to the top of the viewport
    let current = "";
    for (const heading of headings) {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 120) {
        current = heading.id;
      } else {
        break;
      }
    }
    setActiveId(current);
  }, [items]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (items.length < 2) return null;

  return (
    <nav className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-28">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          <List className="h-3.5 w-3.5" />
          On this page
        </div>
        <ul className="space-y-1 border-l border-border pl-0">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`block text-[13px] leading-snug py-1 transition-all duration-200 border-l-2 -ml-[1px] ${
                  item.level === 3 ? "pl-5" : "pl-3"
                } ${
                  activeId === item.id
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                }`}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default BlogTableOfContents;
