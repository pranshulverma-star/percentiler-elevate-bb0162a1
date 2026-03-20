import { useInView } from "@/hooks/useInView";

interface Props {
  onStart: () => void;
}

export default function FlashcardCTA({ onStart }: Props) {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-label="Call to action"
      className="py-16 md:py-20"
      style={{ background: "hsl(24,100%,50%)" }}
    >
      <div
        className="container mx-auto px-4 md:px-6 max-w-3xl text-center transition-all duration-700"
        style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
          Your CAT prep deserves better than boring PDFs.
        </h2>
        <p className="text-white/80 mb-8 text-base md:text-lg">
          Start with 5 flashcards today. It takes less time than making chai.
        </p>
        <button
          onClick={onStart}
          className="px-10 py-3.5 rounded-xl text-base font-semibold active:scale-[0.97] transition-transform"
          style={{ background: "white", color: "hsl(24,100%,50%)" }}
        >
          Start Practicing — Free
        </button>
        <p className="text-white/60 text-sm mt-4">No credit card. No commitment. Just learning.</p>
      </div>
    </section>
  );
}
