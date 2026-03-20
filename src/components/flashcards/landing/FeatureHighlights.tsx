import { useInView } from "@/hooks/useInView";
import { Lightbulb, Sigma, Clock, RotateCcw, Flame, Layers } from "lucide-react";

const features = [
  { icon: Lightbulb, title: "Mnemonic Memory Keys", desc: "Every word comes with a Hindi/English wordplay trick that makes it unforgettable." },
  { icon: Sigma, title: "LaTeX-Rendered Formulas", desc: "Quant formulas displayed in clean, textbook-quality math notation." },
  { icon: Clock, title: "5 Cards, 5 Minutes", desc: "Daily micro-sessions designed for consistency. Spaced repetition beats cramming." },
  { icon: RotateCcw, title: "Smart Revision Bank", desc: "Cards you got wrong automatically appear in your revision list." },
  { icon: Flame, title: "Streak System", desc: "Build daily streaks across flashcards, quizzes, and mock tests." },
  { icon: Layers, title: "557 Cards & Growing", desc: "150 Vocab + 50 Idioms + 302 Quant + 55 LRDI. New cards added regularly." },
];

export default function FeatureHighlights() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} aria-label="Flashcard features" className="py-10 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(0,0%,8%)] text-center mb-8 sm:mb-14 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
        >
          Why these aren't ordinary flashcards
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 80}ms`,
                background: "hsl(0,0%,98%)",
                border: "1px solid hsl(0,0%,93%)",
              }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl mb-3 sm:mb-4 flex items-center justify-center" style={{ background: "hsl(24,100%,50%,0.08)" }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "hsl(24,100%,50%)" }} />
              </div>
              <h3 className="font-bold text-[hsl(0,0%,8%)] text-sm sm:text-base mb-1 sm:mb-2">{title}</h3>
              <p className="text-xs sm:text-sm text-[hsl(0,0%,45%)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
