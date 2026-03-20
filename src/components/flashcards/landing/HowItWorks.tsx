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
    <section ref={ref} id="how-it-works" aria-label="How flashcards work" className="py-16 md:py-24 bg-[hsl(0,0%,98%)]">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h2
          className="text-2xl md:text-3xl font-bold text-[hsl(0,0%,8%)] text-center mb-14 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
        >
          How Percentilers Flashcards work
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="text-center transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "hsl(24,100%,50%,0.1)" }}>
                <Icon className="w-6 h-6" style={{ color: "hsl(24,100%,50%)" }} />
              </div>
              <p className="text-xs font-bold tracking-widest uppercase text-[hsl(0,0%,55%)] mb-2">Step {i + 1}</p>
              <h3 className="text-lg font-bold text-[hsl(0,0%,8%)] mb-2">{title}</h3>
              <p className="text-[hsl(0,0%,45%)] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
