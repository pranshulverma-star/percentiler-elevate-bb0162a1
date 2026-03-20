import { CATEGORY_META, type FlashcardCategory } from "@/data/flashcards";

interface Props {
  correct: number;
  total: number;
  category: FlashcardCategory;
  onPracticeAnother: () => void;
  onRevise: () => void;
}

export default function PracticeSummary({ correct, total, category, onPracticeAnother, onRevise }: Props) {
  const color = CATEGORY_META[category].color;
  const pct = Math.round((correct / total) * 100);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <h2 className="text-2xl font-bold text-[#141414]">Session Complete!</h2>

      {/* Progress ring */}
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#141414]">
          {correct}/{total}
        </span>
      </div>

      <p className="text-gray-500">
        You knew <strong style={{ color }}>{correct}</strong> out of {total} cards
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onPracticeAnother}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white active:scale-[0.97] transition-transform"
          style={{ background: "#FF6600" }}
        >
          Practice another category
        </button>
        <button
          onClick={onRevise}
          className="px-6 py-3 rounded-xl text-sm font-semibold border border-gray-300 text-[#141414] bg-white hover:bg-gray-50 active:scale-[0.97] transition-transform"
        >
          Revise weak cards
        </button>
      </div>
    </div>
  );
}
