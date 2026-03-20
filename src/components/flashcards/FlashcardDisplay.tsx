import type { AnyCard, FlashcardCategory } from "@/data/flashcards";
import { getCardFront, getCardBack, CATEGORY_META } from "@/data/flashcards";
import { renderLatex } from "@/lib/renderLatex";
import { motion } from "framer-motion";

interface Props {
  card: AnyCard;
  category: FlashcardCategory;
  flipped: boolean;
  onFlip: () => void;
  swipeDir: "left" | "right" | null;
}

const needsLatex = (cat: FlashcardCategory) => cat === "quant_formulas" || cat === "lrdi_tips";

// Category-specific mesh gradient SVG backgrounds
function MeshBg({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" viewBox="0 0 440 340" preserveAspectRatio="none">
      <defs>
        <radialGradient id="mesh1" cx="20%" cy="30%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mesh2" cx="80%" cy="70%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="440" height="340" fill="url(#mesh1)" />
      <rect width="440" height="340" fill="url(#mesh2)" />
    </svg>
  );
}

export default function FlashcardDisplay({ card, category, flipped, onFlip, swipeDir }: Props) {
  const color = CATEGORY_META[category].color;
  const front = getCardFront(card, category);
  const { main, hint } = getCardBack(card, category);
  const useLtx = needsLatex(category);

  const exitClass = swipeDir === "right"
    ? "translate-x-[120%] rotate-12 opacity-0"
    : swipeDir === "left"
    ? "-translate-x-[120%] -rotate-12 opacity-0"
    : "";

  const cardFaceBase =
    "absolute inset-0 rounded-2xl p-6 flex flex-col justify-center items-center text-center overflow-hidden";

  const glassBg = {
    background: `linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.48) 100%)`,
    backdropFilter: "blur(24px) saturate(1.4)",
    WebkitBackdropFilter: "blur(24px) saturate(1.4)",
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: `0 8px 40px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 1px ${color}18`,
  };

  return (
    <div className="relative flex items-center justify-center w-full" style={{ perspective: "1200px" }}>
      {/* Animated glow orbs */}
      <motion.div
        className="absolute -top-10 -left-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(72px)", opacity: 0.14 }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.14, 0.18, 0.14] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(72px)", opacity: 0.1 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="Flip flashcard"
        className={`relative w-full max-w-[440px] h-[340px] cursor-pointer transition-all duration-500 ${exitClass}`}
        style={{ transformStyle: "preserve-3d", transition: swipeDir ? "transform 0.4s ease, opacity 0.4s ease" : undefined }}
        onClick={onFlip}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onFlip(); } }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${color}40, transparent 40%, transparent 60%, ${color}30)`,
            opacity: 0.6,
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className="absolute inset-0 transition-transform duration-[550ms]"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transitionTimingFunction: "cubic-bezier(.4,.0,.2,1)",
          }}
        >
          {/* Front */}
          <div className={cardFaceBase} style={{ ...glassBg, backfaceVisibility: "hidden" }}>
            <MeshBg color={color} />
            {/* Top accent line */}
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

            <span
              className="text-[10px] font-bold uppercase tracking-[0.15em] mb-5 px-3 py-1 rounded-full"
              style={{ color, background: `${color}12` }}
            >
              {CATEGORY_META[category].label}
            </span>

            {useLtx ? (
              <div
                className="text-xl md:text-2xl font-bold text-foreground leading-relaxed relative z-10"
                dangerouslySetInnerHTML={{ __html: renderLatex(front) }}
              />
            ) : (
              <p className="text-2xl md:text-3xl font-bold text-foreground relative z-10">{front}</p>
            )}

            <motion.span
              className="text-[10px] text-muted-foreground mt-auto flex items-center gap-1"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span>↓</span> Tap to reveal
            </motion.span>
          </div>

          {/* Back */}
          <div
            className={`${cardFaceBase} overflow-y-auto`}
            style={{ ...glassBg, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <MeshBg color={color} />
            <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

            {useLtx ? (
              <div
                className="text-lg md:text-xl font-semibold text-foreground leading-relaxed relative z-10"
                dangerouslySetInnerHTML={{ __html: renderLatex(main) }}
              />
            ) : (
              <p className="text-lg md:text-xl font-semibold text-foreground relative z-10">{main}</p>
            )}
            {hint && (
              <p className="text-sm text-muted-foreground mt-4 italic border-t border-border/30 pt-3 relative z-10">
                💡 {hint}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
