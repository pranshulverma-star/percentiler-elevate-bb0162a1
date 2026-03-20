import { useInView } from "@/hooks/useInView";
import { LayoutGrid, RotateCw, TrendingUp } from "lucide-react";

const steps = [
  { icon: LayoutGrid, title: "Pick a Category", desc: "Choose from Vocab, Idioms, Quant Formulas, or LRDI Tips." },
  { icon: RotateCw, title: "Flip & Learn", desc: "Each card has a question on front. Tap to flip and reveal the answer with a memory trick." },
  { icon: TrendingUp, title: "Track & Revise", desc: "Cards you didn't know go into your revision bank. Build streaks. Watch your CAT score climb." },
];

export default function HowItWorks() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} id="how-it-works" aria-label="How flashcards work" className="py-10 sm:py-16 md:py-24 bg-[hsl(0,0%,98%)]">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(0,0%,8%)] text-center mb-8 sm:mb-14 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
        >
          How Percentilers Flashcards work
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="flex sm:flex-col items-start sm:items-center sm:text-center gap-4 sm:gap-0 transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl sm:mx-auto sm:mb-5 flex items-center justify-center shrink-0" style={{ background: "hsl(24,100%,50%,0.1)" }}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "hsl(24,100%,50%)" }} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-[hsl(0,0%,55%)] mb-1 sm:mb-2">Step {i + 1}</p>
                <h3 className="text-base sm:text-lg font-bold text-[hsl(0,0%,8%)] mb-1 sm:mb-2">{title}</h3>
                <p className="text-[hsl(0,0%,45%)] text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
