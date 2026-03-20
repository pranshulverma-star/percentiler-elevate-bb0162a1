import { useInView } from "@/hooks/useInView";
import { useEffect, useState } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView<HTMLSpanElement>();

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1200;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 557, suffix: "+", label: "Total flashcards" },
  { value: 2000, suffix: "+", label: "Students practicing" },
  { value: 92, suffix: "%", label: "Report improved retention" },
];

const testimonials = [
  { quote: "The mnemonic tricks are genius. I remember words I learned 3 months ago.", author: "CAT 2025 aspirant" },
  { quote: "5 cards a day doesn't sound like much, but the streak system got me hooked.", author: "IIM Lucknow convert" },
];

export default function SocialProof() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} aria-label="Social proof and statistics" className="py-10 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h2
          className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(0,0%,8%)] text-center mb-8 sm:mb-14 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
        >
          Join thousands already building their CAT vocabulary
        </h2>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
          {stats.map(({ value, suffix, label }, i) => (
            <div
              key={label}
              className="text-center transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: "hsl(24,100%,50%)" }}>
                <AnimatedCounter target={value} suffix={suffix} />
              </p>
              <p className="text-[10px] sm:text-sm text-[hsl(0,0%,50%)] mt-0.5 sm:mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {testimonials.map(({ quote, author }, i) => (
            <div
              key={i}
              className="rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-700"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${(i + 3) * 100}ms`,
                background: "hsl(0,0%,98%)",
                border: "1px solid hsl(0,0%,93%)",
              }}
            >
              <p className="text-sm sm:text-base text-[hsl(0,0%,25%)] italic leading-relaxed mb-2 sm:mb-3">"{quote}"</p>
              <p className="text-xs sm:text-sm font-semibold text-[hsl(0,0%,50%)]">— {author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
