import { CATEGORY_META, getTotalCards, type FlashcardCategory } from "@/data/flashcards";
import { BookOpen, MessageCircle, Sigma, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  onSelect: (cat: FlashcardCategory) => void;
  getTodayCount: (cat: FlashcardCategory) => number;
}

const categories: FlashcardCategory[] = ["vocab", "idioms", "quant_formulas", "lrdi_tips"];

const CATEGORY_ICONS: Record<FlashcardCategory, React.ElementType> = {
  vocab: BookOpen,
  idioms: MessageCircle,
  quant_formulas: Sigma,
  lrdi_tips: BrainCircuit,
};


export default function CategorySelector({ onSelect, getTodayCount }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl mx-auto">
      {categories.map((cat, i) => {
        const { label, color } = CATEGORY_META[cat];
        const total = getTotalCards(cat);
        const today = getTodayCount(cat);
        const done = today >= 5;
        const Icon = CATEGORY_ICONS[cat];

        return (
          <motion.button
            key={cat}
            onClick={() => onSelect(cat)}
            className="relative flex flex-col items-center text-center rounded-[20px] p-5 overflow-hidden
              active:scale-[0.97] transition-all duration-200
              hover:border-white/20"
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(24px) saturate(1.2)",
              WebkitBackdropFilter: "blur(24px) saturate(1.2)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
          >
            {/* Glow orb behind */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full pointer-events-none"
              style={{ background: color, filter: "blur(60px)", opacity: 0.15 }}
            />

            <Icon size={48} style={{ color, opacity: 0.6 }} className="mb-3 relative z-10" />
            <p className="font-bold text-white text-base leading-tight relative z-10">{label}</p>
            <p className="text-[13px] text-white/40 mt-1 relative z-10">{total} cards</p>

            <span
              className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.5px] px-2.5 py-1 rounded-full relative z-10"
              style={{
                color: done ? "#22C55E" : color,
                background: done ? "rgba(34,197,94,0.15)" : `${color}1A`,
              }}
            >
              {done ? "✓ Done" : `${today}/5 today`}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
