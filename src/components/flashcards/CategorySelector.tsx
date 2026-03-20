import { CATEGORY_META, getTotalCards, type FlashcardCategory } from "@/data/flashcards";

interface Props {
  onSelect: (cat: FlashcardCategory) => void;
  getTodayCount: (cat: FlashcardCategory) => number;
}

const categories: FlashcardCategory[] = ["vocab", "idioms", "quant_formulas", "lrdi_tips"];

export default function CategorySelector({ onSelect, getTodayCount }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mx-auto">
      {categories.map((cat) => {
        const { label, color } = CATEGORY_META[cat];
        const total = getTotalCards(cat);
        const today = getTodayCount(cat);
        const done = today >= 5;
        const pct = Math.min((today / 5) * 100, 100);

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="relative text-left rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden active:scale-[0.97]"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <p className="font-bold text-[#141414] text-lg leading-tight">{label}</p>
            <p className="text-sm text-gray-500 mt-1">{total} cards</p>
            <p className="text-xs mt-2 font-medium" style={{ color: done ? "#22C55E" : color }}>
              {done ? "✓ Done today" : `${today}/5 today`}
            </p>
            {/* Mini progress bar */}
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: done ? "#22C55E" : color }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
