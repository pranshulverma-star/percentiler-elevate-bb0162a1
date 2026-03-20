import { CATEGORY_META, getTotalCards, flashcardData, getCardFront, type FlashcardCategory } from "@/data/flashcards";
import { useAuth } from "@/hooks/useAuth";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { useInView } from "@/hooks/useInView";
import { BookOpen, MessageCircle, Calculator, Puzzle } from "lucide-react";

const categories: { key: FlashcardCategory; icon: typeof BookOpen }[] = [
  { key: "vocab", icon: BookOpen },
  { key: "idioms", icon: MessageCircle },
  { key: "quant_formulas", icon: Calculator },
  { key: "lrdi_tips", icon: Puzzle },
];

interface Props {
  onPractice: (cat: FlashcardCategory) => void;
}

export default function CategoryShowcase({ onPractice }: Props) {
  const { user } = useAuth();
  const { getTodayCount, progress } = useFlashcardProgress();
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} aria-label="Flashcard categories" className="py-10 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div
          className="text-center mb-8 sm:mb-12 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[hsl(0,0%,8%)] mb-2 sm:mb-3">Four pillars of CAT mastery</h2>
          <p className="text-sm sm:text-base text-[hsl(0,0%,45%)] max-w-lg mx-auto">
            Pick a category. Practice 5 cards. Come back tomorrow. Consistency beats cramming.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-5">
          {categories.map(({ key, icon: Icon }, i) => {
            const { label, color } = CATEGORY_META[key];
            const total = getTotalCards(key);
            const sampleCard = flashcardData[key][0];
            const sampleText = getCardFront(sampleCard, key);
            const todayCount = user ? getTodayCount(key) : 0;
            const mastered = user ? progress.filter((p) => p.category === key && p.knew).length : 0;
            const pct = Math.min((todayCount / 5) * 100, 100);

            return (
              <div
                key={key}
                className="relative rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-700 cursor-pointer group active:scale-[0.97]"
                style={{
                  opacity: inView ? 1 : 0,
                  transform: inView ? "translateY(0)" : "translateY(24px)",
                  transitionDelay: `${i * 100}ms`,
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                  borderTop: `3px solid ${color}`,
                }}
                onClick={() => onPractice(key)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[hsl(0,0%,8%)] text-sm sm:text-lg leading-tight">{label}</h3>
                    <p className="text-[11px] sm:text-sm text-[hsl(0,0%,55%)] mt-0.5">{total} cards</p>
                  </div>
                </div>

                <p className="text-[11px] sm:text-sm text-[hsl(0,0%,50%)] mt-3 sm:mt-4 italic line-clamp-2 hidden sm:block">"{sampleText}"</p>

                {user && (
                  <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span style={{ color }}>{todayCount}/5 today</span>
                      <span className="text-[hsl(0,0%,55%)] hidden sm:inline">{mastered} mastered</span>
                    </div>
                    <div className="h-1 sm:h-1.5 rounded-full bg-[hsl(0,0%,95%)] overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: todayCount >= 5 ? "hsl(142,71%,45%)" : color }} />
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-sm font-semibold mt-3 sm:mt-4 group-hover:underline" style={{ color }}>
                  Practice →
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
