import { useEffect, useState } from "react";
import { CATEGORY_META, type FlashcardCategory } from "@/data/flashcards";
import { motion } from "framer-motion";

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
  const [offset, setOffset] = useState(circumference);
  const perfect = correct === total;

  useEffect(() => {
    const timer = setTimeout(() => setOffset(circumference - (pct / 100) * circumference), 100);
    return () => clearTimeout(timer);
  }, [pct, circumference]);

  return (
    <motion.div
      className="flex flex-col items-center text-center gap-5 sm:gap-6 py-6 sm:py-8 px-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h2 className="text-xl sm:text-2xl font-bold text-white">
        {perfect ? "✨ Perfect!" : "✨ Nice work!"}
      </h2>

      <div className="relative w-24 h-24 sm:w-28 sm:h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl font-bold text-white">
          {correct}/{total}
        </span>
      </div>

      <p className="text-sm sm:text-base text-white/60">
        You knew <strong style={{ color }}>{correct}</strong> out of {total} cards
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
        <button
          onClick={onPracticeAnother}
          className="px-6 py-3 rounded-[14px] text-sm font-semibold text-white active:scale-[0.97] transition-transform w-full sm:w-auto"
          style={{ background: "#FF6600" }}
        >
          Practice another category
        </button>
        <button
          onClick={onRevise}
          className="px-6 py-3 rounded-[14px] text-sm font-semibold active:scale-[0.97] transition-transform w-full sm:w-auto"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "white",
          }}
        >
          Revise weak cards
        </button>
      </div>
    </motion.div>
  );
}
