import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useInView } from "@/hooks/useInView";
import { renderLatex } from "@/lib/renderLatex";
import "katex/dist/katex.min.css";

const sampleCards = [
  { category: "Vocab", color: "hsl(24,100%,50%)", front: "Cacophony", back: "Harsh, discordant noise", hint: "Sounds like 'kaun phone' — 50 people shouting at once!", latex: false },
  { category: "Quant Formulas", color: "hsl(217,91%,60%)", front: "Number of factors of $N = a^p \\times b^q$?", back: "$(p+1)(q+1)$", hint: undefined, latex: true },
  { category: "Idioms", color: "hsl(330,81%,60%)", front: "Break the ice", back: "Start conversation in awkward silence", hint: undefined, latex: false },
];

interface Props {
  onSignUp: () => void;
}

export default function SampleCardsPreview({ onSignUp }: Props) {
  const { user } = useAuth();
  const { ref, inView } = useInView<HTMLElement>();
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [flipCount, setFlipCount] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  const handleFlip = (idx: number) => {
    if (showCTA) return;
    const next = [...flipped];
    if (!next[idx]) {
      next[idx] = true;
      setFlipped(next);
      const newCount = flipCount + 1;
      setFlipCount(newCount);
      if (newCount >= 3 && !user) {
        setTimeout(() => setShowCTA(true), 600);
      }
    } else {
      next[idx] = false;
      setFlipped(next);
    }
  };

  return (
    <section ref={ref} aria-label="Sample flashcard preview" className="py-16 md:py-24 bg-[hsl(0,0%,98%)]">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h2
          className="text-2xl md:text-3xl font-bold text-[hsl(0,0%,8%)] text-center mb-4 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
        >
          Peek inside the deck
        </h2>
        <p className="text-[hsl(0,0%,45%)] text-center mb-12 text-sm">Tap any card to flip it</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {sampleCards.map((card, i) => (
            <div
              key={i}
              className="relative h-[240px] cursor-pointer transition-all duration-700"
              style={{
                perspective: "1200px",
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 100}ms`,
              }}
              onClick={() => handleFlip(i)}
            >
              <div
                className="w-full h-full transition-transform duration-[550ms]"
                style={{
                  transformStyle: "preserve-3d",
                  transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
                  transitionTimingFunction: "cubic-bezier(.4,.0,.2,1)",
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-center items-center text-center"
                  style={{
                    backfaceVisibility: "hidden",
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                    borderTop: `4px solid ${card.color}`,
                  }}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: card.color }}>{card.category}</span>
                  {card.latex ? (
                    <div className="text-lg font-bold text-[hsl(0,0%,8%)]" dangerouslySetInnerHTML={{ __html: renderLatex(card.front) }} />
                  ) : (
                    <p className="text-xl font-bold text-[hsl(0,0%,8%)]">{card.front}</p>
                  )}
                  <span className="text-xs text-[hsl(0,0%,70%)] mt-auto">Tap to reveal</span>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-center items-center text-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                    borderTop: `4px solid ${card.color}`,
                  }}
                >
                  {card.latex ? (
                    <div className="text-lg font-semibold text-[hsl(0,0%,8%)]" dangerouslySetInnerHTML={{ __html: renderLatex(card.back) }} />
                  ) : (
                    <p className="text-lg font-semibold text-[hsl(0,0%,8%)]">{card.back}</p>
                  )}
                  {card.hint && <p className="text-sm text-[hsl(0,0%,50%)] mt-3 italic">💡 {card.hint}</p>}
                </div>
              </div>
            </div>
          ))}

          {/* CTA Overlay after 3 flips */}
          {showCTA && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}>
              <div className="text-center px-6">
                <p className="text-lg font-bold text-[hsl(0,0%,8%)] mb-2">Sign up to unlock all 557 cards</p>
                <p className="text-sm text-[hsl(0,0%,45%)] mb-5">Free forever. No credit card.</p>
                <button
                  onClick={onSignUp}
                  className="px-8 py-3 rounded-xl text-white font-semibold active:scale-[0.97] transition-transform"
                  style={{ background: "hsl(24,100%,50%)" }}
                >
                  Start Practicing — Free
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
