import { useMemo } from "react";
import type { AnyCard, FlashcardCategory } from "@/data/flashcards";
import { getCardFront, getCardBack, CATEGORY_META } from "@/data/flashcards";
import { renderLatex } from "@/lib/renderLatex";
import { motion } from "framer-motion";
import { BookOpen, MessageCircle, Sigma, BrainCircuit, ChevronDown } from "lucide-react";

interface Props {
  card: AnyCard;
  category: FlashcardCategory;
  flipped: boolean;
  onFlip: () => void;
  swipeDir: "left" | "right" | null;
}

const needsLatex = (cat: FlashcardCategory) => cat === "quant_formulas" || cat === "lrdi_tips";

const CATEGORY_ICONS: Record<FlashcardCategory, React.ElementType> = {
  vocab: BookOpen,
  idioms: MessageCircle,
  quant_formulas: Sigma,
  lrdi_tips: BrainCircuit,
};

const CATEGORY_SECONDARY: Record<FlashcardCategory, string> = {
  vocab: "#FF9944",
  idioms: "#F472B6",
  quant_formulas: "#818CF8",
  lrdi_tips: "#2DD4BF",
};

function getFontSize(text: string): string {
  const len = text.length;
  if (len <= 8) return "text-[32px] sm:text-[40px]";
  if (len <= 14) return "text-[26px] sm:text-[32px]";
  return "text-[20px] sm:text-[24px]";
}

export default function FlashcardDisplay({ card, category, flipped, onFlip, swipeDir }: Props) {
  const color = CATEGORY_META[category].color;
  const secondaryColor = CATEGORY_SECONDARY[category];
  const front = getCardFront(card, category);
  const { main, hint } = getCardBack(card, category);
  const useLtx = needsLatex(category);
  const Icon = CATEGORY_ICONS[category];

  const frontFontSize = useMemo(() => (useLtx ? "text-xl sm:text-2xl" : getFontSize(front)), [front, useLtx]);

  const swipeShadow = swipeDir === "right"
    ? "-20px 0 40px rgba(34, 197, 94, 0.3)"
    : swipeDir === "left"
    ? "20px 0 40px rgba(239, 68, 68, 0.3)"
    : undefined;

  const exitTransform = swipeDir === "right"
    ? "translateX(120%) rotate(8deg)"
    : swipeDir === "left"
    ? "translateX(-120%) rotate(-8deg)"
    : undefined;

  const cardGlass = {
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(24px) saturate(1.2)",
    WebkitBackdropFilter: "blur(24px) saturate(1.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    borderRadius: "20px",
  };

  const cardGlassBack = {
    ...cardGlass,
    background: "rgba(255, 255, 255, 0.08)",
  };

  return (
    <div className="relative flex items-center justify-center w-full" style={{ perspective: "1200px" }}>
      {/* Glow orbs behind card — smaller on mobile */}
      <motion.div
        className="absolute -top-6 -right-6 w-[140px] h-[140px] sm:w-[200px] sm:h-[200px] rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(60px)", opacity: 0.25, zIndex: -1 }}
        animate={{ opacity: [0.25, 0.3, 0.25], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-6 -left-6 w-[110px] h-[110px] sm:w-[160px] sm:h-[160px] rounded-full pointer-events-none"
        style={{ background: secondaryColor, filter: "blur(50px)", opacity: 0.2, zIndex: -1 }}
        animate={{ opacity: [0.2, 0.25, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Flip flashcard"
        className="relative w-full max-w-[400px] h-[280px] sm:h-[340px] cursor-pointer will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transition: swipeDir ? "transform 0.4s ease, opacity 0.4s ease, box-shadow 0.4s ease" : undefined,
          transform: exitTransform,
          opacity: swipeDir ? 0 : 1,
          boxShadow: swipeShadow,
        }}
        onClick={onFlip}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onFlip(); } }}
      >
        <div
          className="absolute inset-0 transition-transform duration-[600ms]"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg) scale(1)" : "rotateY(0deg) scale(1)",
            transitionTimingFunction: "cubic-bezier(.4,.0,.2,1)",
          }}
        >
          {/* ─── FRONT ─── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-5 sm:p-6 overflow-hidden"
            style={{ ...cardGlass, backfaceVisibility: "hidden" }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]" style={{ background: color }} />

            {/* Category icon */}
            <Icon size={36} style={{ color, opacity: 0.5 }} className="mb-2 sm:mb-3 sm:!w-12 sm:!h-12" />

            {/* Category badge */}
            <span
              className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[1px] mb-3 sm:mb-5 px-3 py-0.5 sm:py-1 rounded-[20px]"
              style={{ color, background: `${color}26` }}
            >
              {CATEGORY_META[category].label}
            </span>

            {/* The Word */}
            {useLtx ? (
              <div
                className={`font-bold text-white leading-relaxed ${frontFontSize}`}
                style={{ letterSpacing: "-0.02em", textShadow: `0 2px 20px ${color}4D` }}
                dangerouslySetInnerHTML={{ __html: renderLatex(front) }}
              />
            ) : (
              <p
                className={`font-bold text-white leading-tight ${frontFontSize}`}
                style={{ letterSpacing: "-0.02em", textShadow: `0 2px 20px ${color}4D`, overflowWrap: "break-word" }}
              >
                {front}
              </p>
            )}

            {/* Tap to reveal */}
            <motion.span
              className="absolute bottom-4 flex items-center gap-1.5 text-[12px] sm:text-[14px] text-white/35"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Tap to reveal
              <ChevronDown size={12} />
            </motion.span>
          </div>

          {/* ─── BACK ─── */}
          <div
            className="absolute inset-0 flex flex-col justify-center p-5 sm:p-6 overflow-y-auto text-left"
            style={{ ...cardGlassBack, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]" style={{ background: color }} />

            <span className="text-[10px] sm:text-[11px] uppercase text-white/40 tracking-[1.5px] mb-1.5 sm:mb-2 font-medium">Meaning</span>

            {useLtx ? (
              <div
                className="text-base sm:text-[20px] font-medium text-white leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderLatex(main) }}
              />
            ) : (
              <p className="text-base sm:text-[20px] font-medium text-white leading-relaxed">{main}</p>
            )}

            {hint && (
              <>
                <div className="w-full h-px bg-white/[0.08] my-3 sm:my-4" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[1.5px] mb-1.5 sm:mb-2 font-medium" style={{ color }}>
                  Memory Key
                </span>
                <p className="text-[13px] sm:text-[15px] text-white/75 leading-[1.6] sm:leading-[1.7]">
                  {hint}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
