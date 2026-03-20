import { useAuth } from "@/hooks/useAuth";
import { useStreaks } from "@/hooks/useStreaks";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { CATEGORY_META, type FlashcardCategory } from "@/data/flashcards";
import { useInView } from "@/hooks/useInView";
import { Flame } from "lucide-react";
import AnimatedCardPreview from "./AnimatedCardPreview";

const categories: FlashcardCategory[] = ["vocab", "idioms", "quant_formulas", "lrdi_tips"];

interface Props {
  onStartPracticing: () => void;
}

export default function FlashcardHero({ onStartPracticing }: Props) {
  const { user } = useAuth();
  const { currentStreak } = useStreaks();
  const { getTodayCount } = useFlashcardProgress();
  const { ref, inView } = useInView<HTMLElement>();

  const categoriesDoneToday = user
    ? categories.filter((c) => getTodayCount(c) >= 5).length
    : 0;

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      aria-label="Flashcard practice hero"
      className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24"
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, hsla(24,100%,50%,0.06) 0%, transparent 70%)" }} />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div
            className="transition-all duration-700"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              filter: inView ? "blur(0)" : "blur(4px)",
            }}
          >
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-8 h-8 text-[hsl(24,100%,50%)]" />
                  <span className="text-3xl font-bold text-[hsl(0,0%,8%)]">{currentStreak} day streak</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(0,0%,8%)] leading-[1.1] mb-4">
                  Welcome back, {user.user_metadata?.full_name?.split(" ")[0] || "learner"}! Keep your streak alive.
                </h1>
                <p className="text-[hsl(0,0%,40%)] text-base md:text-lg mb-3">
                  {categoriesDoneToday}/4 categories practiced today
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {categories.map((c) => {
                    const done = getTodayCount(c) >= 5;
                    return (
                      <span
                        key={c}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{
                          background: done ? `${CATEGORY_META[c].color}15` : "hsl(0,0%,96%)",
                          color: done ? CATEGORY_META[c].color : "hsl(0,0%,60%)",
                          border: `1px solid ${done ? CATEGORY_META[c].color + "30" : "hsl(0,0%,90%)"}`,
                        }}
                      >
                        {done ? "✓" : ""} {CATEGORY_META[c].label}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={onStartPracticing}
                  className="px-8 py-3.5 rounded-xl text-base font-semibold text-white active:scale-[0.97] transition-transform"
                  style={{ background: "hsl(24,100%,50%)" }}
                >
                  Continue Practicing
                </button>
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(0,0%,8%)] leading-[1.1] mb-5">
                  Master 500+ CAT Concepts in 5 Minutes a Day
                </h1>
                <p className="text-[hsl(0,0%,40%)] text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                  Flashcards with clever mnemonics, LaTeX-rendered formulas, and spaced revision — built by 7-time CAT 100%iler faculty.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={onStartPracticing}
                    className="px-8 py-3.5 rounded-xl text-base font-semibold text-white active:scale-[0.97] transition-transform"
                    style={{ background: "hsl(24,100%,50%)" }}
                  >
                    Start Practicing — Free
                  </button>
                  <button
                    onClick={scrollToHowItWorks}
                    className="px-8 py-3.5 rounded-xl text-base font-semibold border-2 active:scale-[0.97] transition-transform"
                    style={{ borderColor: "hsl(0,0%,85%)", color: "hsl(0,0%,8%)" }}
                  >
                    See How It Works
                  </button>
                </div>
                <p className="text-sm text-[hsl(0,0%,55%)]">
                  557 flashcards · 4 categories · Used by 2,000+ aspirants
                </p>
              </>
            )}
          </div>

          {/* Right: Animated card preview */}
          <div
            className="flex justify-center transition-all duration-700 delay-200"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              filter: inView ? "blur(0)" : "blur(4px)",
            }}
          >
            <AnimatedCardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
