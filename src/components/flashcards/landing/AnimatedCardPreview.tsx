import { useState, useEffect } from "react";

const previewCards = [
  { category: "Vocab", color: "hsl(24,100%,50%)", front: "Cacophony", back: "Harsh, discordant noise", hint: "Sounds like 'kaun phone' — 50 people calling at once!" },
  { category: "Quant Formulas", color: "hsl(217,91%,60%)", front: "Sum of first n natural numbers?", back: "n(n+1)/2", hint: undefined },
  { category: "Idioms", color: "hsl(330,81%,60%)", front: "Break the ice", back: "Start conversation in an awkward silence", hint: undefined },
];

export default function AnimatedCardPreview() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFlipped(true);
      setTimeout(() => {
        setFlipped(false);
        setActiveIdx((i) => (i + 1) % previewCards.length);
      }, 1500);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const card = previewCards[activeIdx];

  return (
    <div className="relative w-[300px] h-[220px] md:w-[380px] md:h-[260px]" style={{ perspective: "1200px" }}>
      {/* Glow orb */}
      <div
        className="absolute -top-6 -left-6 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: card.color, filter: "blur(50px)", opacity: 0.15 }}
      />

      <div
        className="w-full h-full transition-transform duration-[550ms]"
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
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            borderTop: `4px solid ${card.color}`,
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: card.color }}>{card.category}</span>
          <p className="text-xl md:text-2xl font-bold text-[hsl(0,0%,8%)]">{card.front}</p>
          <span className="text-xs text-[hsl(0,0%,70%)] mt-auto">Tap to reveal</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-center items-center text-center"
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
          <p className="text-lg md:text-xl font-semibold text-[hsl(0,0%,8%)]">{card.back}</p>
          {card.hint && (
            <p className="text-sm text-[hsl(0,0%,50%)] mt-3 italic">💡 {card.hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
