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
  if (len <= 8) return "text-[40px]";
  if (len <= 14) return "text-[32px]";
  return "text-[24px]";
}

export default function FlashcardDisplay({ card, category, flipped, onFlip, swipeDir }: Props) {
  const color = CATEGORY_META[category].color;
  const secondaryColor = CATEGORY_SECONDARY[category];
  const front = getCardFront(card, category);
  const { main, hint } = getCardBack(card, category);
  const useLtx = needsLatex(category);
  const Icon = CATEGORY_ICONS[category];

  const frontFontSize = useMemo(() => (useLtx ? "text-2xl md:text-[28px]" : getFontSize(front)), [front, useLtx]);

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
    borderRadius: "24px",
  };

  const cardGlassBack = {
    ...cardGlass,
    background: "rgba(255, 255, 255, 0.08)",
  };

  return (
    <div className="relative flex items-center justify-center w-full" style={{ perspective: "1200px" }}>
      {/* Glow orbs behind card */}
      <motion.div
        className="absolute -top-8 -right-8 w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(80px)", opacity: 0.25, zIndex: -1 }}
        animate={{
          x: flipped ? [0, -15] : [0, 0],
          opacity: [0.25, 0.3, 0.25],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-8 -left-8 w-[160px] h-[160px] rounded-full pointer-events-none"
        style={{ background: secondaryColor, filter: "blur(60px)", opacity: 0.2, zIndex: -1 }}
        animate={{
          x: flipped ? [0, 15] : [0, 0],
          opacity: [0.2, 0.25, 0.2],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Flip flashcard"
        className="relative w-full max-w-[400px] h-[360px] cursor-pointer will-change-transform"
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
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 overflow-hidden"
            style={{ ...cardGlass, backfaceVisibility: "hidden" }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[24px]" style={{ background: color }} />

            {/* Category icon (watermark) */}
            <Icon size={48} style={{ color, opacity: 0.5 }} className="mb-3" />

            {/* Category badge */}
            <span
              className="text-[11px] font-medium uppercase tracking-[1px] mb-5 px-3.5 py-1 rounded-[20px]"
              style={{ color, background: `${color}26` }}
            >
              {CATEGORY_META[category].label}
            </span>

            {/* The Word */}
            {useLtx ? (
              <div
                className="font-bold text-white leading-relaxed text-2xl md:text-[28px]"
                style={{ letterSpacing: "-0.02em", textShadow: `0 2px 20px ${color}4D` }}
                dangerouslySetInnerHTML={{ __html: renderLatex(front) }}
              />
            ) : (
              <p
                className={`font-bold text-white leading-tight ${frontFontSize}`}
                style={{ letterSpacing: "-0.02em", textShadow: `0 2px 20px ${color}4D` }}
              >
                {front}
              </p>
            )}

            {/* Tap to reveal */}
            <motion.span
              className="absolute bottom-5 flex items-center gap-1.5 text-[14px] text-white/35"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Tap to reveal
              <ChevronDown size={14} />
            </motion.span>
          </div>

          {/* ─── BACK ─── */}
          <div
            className="absolute inset-0 flex flex-col justify-center p-6 overflow-y-auto text-left"
            style={{ ...cardGlassBack, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[24px]" style={{ background: color }} />

            <span className="text-[11px] uppercase text-white/40 tracking-[1.5px] mb-2 font-medium">Meaning</span>

            {useLtx ? (
              <div
                className="text-[20px] font-medium text-white leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderLatex(main) }}
              />
            ) : (
              <p className="text-[20px] font-medium text-white leading-relaxed">{main}</p>
            )}

            {hint && (
              <>
                <div className="w-full h-px bg-white/[0.08] my-4" />
                <span className="text-[11px] uppercase tracking-[1.5px] mb-2 font-medium" style={{ color }}>
                  Memory Key
                </span>
                <p className="text-[15px] text-white/75 leading-[1.7]">
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
