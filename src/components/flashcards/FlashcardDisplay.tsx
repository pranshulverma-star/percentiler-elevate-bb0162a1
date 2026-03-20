import { useState, useRef, useEffect } from "react";
import type { AnyCard, FlashcardCategory } from "@/data/flashcards";
import { getCardFront, getCardBack, CATEGORY_META } from "@/data/flashcards";
import { renderLatex } from "@/lib/renderLatex";

interface Props {
  card: AnyCard;
  category: FlashcardCategory;
  flipped: boolean;
  onFlip: () => void;
  swipeDir: "left" | "right" | null;
}

const needsLatex = (cat: FlashcardCategory) => cat === "quant_formulas" || cat === "lrdi_tips";

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

  return (
    <div className="relative flex items-center justify-center w-full" style={{ perspective: "1200px" }}>
      {/* Glow orbs */}
      <div
        className="absolute -top-8 -left-8 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(60px)", opacity: 0.12 }}
      />
      <div
        className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: color, filter: "blur(60px)", opacity: 0.1 }}
      />

      <div
        className={`relative w-full max-w-[440px] h-[300px] cursor-pointer transition-all duration-500 ${exitClass}`}
        style={{ transformStyle: "preserve-3d", transition: swipeDir ? "transform 0.4s ease, opacity 0.4s ease" : undefined }}
        onClick={onFlip}
      >
        <div
          className="absolute inset-0 transition-transform duration-[550ms]"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transitionTimingFunction: "cubic-bezier(.4,.0,.2,1)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-center items-center text-center"
            style={{
              backfaceVisibility: "hidden",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              borderTop: `4px solid ${color}`,
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color }}>
              {CATEGORY_META[category].label}
            </span>
            {useLtx ? (
              <div
                className="text-xl md:text-2xl font-bold text-[#141414] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderLatex(front) }}
              />
            ) : (
              <p className="text-2xl md:text-3xl font-bold text-[#141414]">{front}</p>
            )}
            <span className="text-xs text-gray-400 mt-auto">Tap to reveal</span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-center items-center text-center overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              borderTop: `4px solid ${color}`,
            }}
          >
            {useLtx ? (
              <div
                className="text-lg md:text-xl font-semibold text-[#141414] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderLatex(main) }}
              />
            ) : (
              <p className="text-lg md:text-xl font-semibold text-[#141414]">{main}</p>
            )}
            {hint && (
              <p className="text-sm text-gray-500 mt-4 italic border-t border-gray-200 pt-3">
                💡 {hint}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
