import { useState, useMemo } from "react";
import { CATEGORY_META, flashcardData, getCardFront, getCardBack, type FlashcardCategory, type AnyCard } from "@/data/flashcards";
import { renderLatex } from "@/lib/renderLatex";

interface RevisionRow {
  card_id: string;
  category: string;
  knew: boolean;
  practiced_at: string;
}

interface Props {
  revisionCards: RevisionRow[];
  onMarkKnown: (cardId: string, category: FlashcardCategory) => Promise<void>;
}

const allCats: (FlashcardCategory | "all")[] = ["all", "vocab", "idioms", "quant_formulas", "lrdi_tips"];

function findCard(cardId: string, category: string): AnyCard | null {
  const pool = flashcardData[category as FlashcardCategory];
  return pool?.find((c) => c.id === cardId) ?? null;
}

export default function ReviseTab({ revisionCards, onMarkKnown }: Props) {
  const [filter, setFilter] = useState<FlashcardCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const base = revisionCards.filter((r) => !dismissed.has(r.card_id));
    return filter === "all" ? base : base.filter((r) => r.category === filter);
  }, [revisionCards, filter, dismissed]);

  const needsLatex = (cat: string) => cat === "quant_formulas" || cat === "lrdi_tips";

  if (revisionCards.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 sm:py-16 text-center px-4">
        <p className="text-base sm:text-lg font-semibold text-white">No cards to revise 🎉</p>
        <p className="text-sm text-white/50 mt-1">Practice some flashcards first and any you didn't know will appear here.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 sm:mb-6 scrollbar-hide -mx-1 px-1">
        {allCats.map((cat) => {
          const active = filter === cat;
          const color = cat === "all" ? "#FF6600" : CATEGORY_META[cat].color;
          const label = cat === "all" ? "All" : CATEGORY_META[cat].label;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-colors active:scale-[0.96]"
              style={{
                background: active ? color : "transparent",
                color: active ? "#fff" : color,
                border: `1.5px solid ${color}`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-white/40 py-8">No weak cards in this category.</p>
      )}

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {filtered.map((row) => {
          const card = findCard(row.card_id, row.category);
          if (!card) return null;
          const cat = row.category as FlashcardCategory;
          const front = getCardFront(card, cat);
          const { main, hint } = getCardBack(card, cat);
          const isOpen = expanded === row.card_id;
          const useLtx = needsLatex(cat);

          return (
            <div
              key={row.card_id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : row.card_id)}
                className="w-full text-left p-3.5 sm:p-4 flex items-start justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  {useLtx ? (
                    <span className="font-bold text-white text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: renderLatex(front) }} />
                  ) : (
                    <span className="font-bold text-white text-sm sm:text-base">{front}</span>
                  )}
                </div>
                <span
                  className="flex-shrink-0 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ background: CATEGORY_META[cat].color }}
                >
                  {CATEGORY_META[cat].label}
                </span>
              </button>

              {isOpen && (
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 border-t border-white/[0.06] pt-3">
                  {useLtx ? (
                    <div className="text-sm text-white/80 mb-2" dangerouslySetInnerHTML={{ __html: renderLatex(main) }} />
                  ) : (
                    <p className="text-sm text-white/80 mb-2">{main}</p>
                  )}
                  {hint && <p className="text-xs text-white/50 italic mb-3">💡 {hint}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await onMarkKnown(row.card_id, cat);
                        setDismissed((s) => new Set(s).add(row.card_id));
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white active:scale-[0.96]"
                      style={{ background: "#22C55E" }}
                    >
                      I know it now
                    </button>
                    <button
                      onClick={() => setExpanded(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold active:scale-[0.96]"
                      style={{
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      Still learning
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
