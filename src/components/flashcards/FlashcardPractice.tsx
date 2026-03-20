import { useState, useCallback, useRef } from "react";
import { flashcardData, CATEGORY_META, type FlashcardCategory, type AnyCard } from "@/data/flashcards";
import FlashcardDisplay from "./FlashcardDisplay";
import ProgressDots from "./ProgressDots";
import ActionButtons from "./ActionButtons";
import PracticeSummary from "./PracticeSummary";
import { ArrowLeft } from "lucide-react";

interface Props {
  category: FlashcardCategory;
  todayCardIds: string[];
  onRecord: (cardId: string, category: FlashcardCategory, knew: boolean) => Promise<void>;
  onBack: () => void;
  onSwitchToRevise: () => void;
}

const DAILY_LIMIT = 5;

function pickCards(category: FlashcardCategory, excludeIds: string[]): AnyCard[] {
  const pool = flashcardData[category].filter((c) => !excludeIds.includes(c.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, DAILY_LIMIT - excludeIds.length);
}

export default function FlashcardPractice({ category, todayCardIds, onRecord, onBack, onSwitchToRevise }: Props) {
  const alreadyDone = todayCardIds.length;

  const [cards] = useState<AnyCard[]>(() => {
    if (alreadyDone >= DAILY_LIMIT) return [];
    return pickCards(category, todayCardIds);
  });

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [done, setDone] = useState(alreadyDone >= DAILY_LIMIT);
  const total = cards.length;
  const color = CATEGORY_META[category].color;

  // Swipe support
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (Math.abs(dx) > 60) {
      if (dx > 0) handleKnew();
      else handleDidntKnow();
    }
    touchStart.current = null;
  };

  const advance = useCallback(
    (dir: "left" | "right") => {
      setSwipeDir(dir);
      setTimeout(() => {
        setSwipeDir(null);
        setFlipped(false);
        if (idx + 1 >= total) {
          setDone(true);
        } else {
          setIdx((i) => i + 1);
        }
      }, 350);
    },
    [idx, total]
  );

  const handleKnew = useCallback(() => {
    if (!flipped) {
      setFlipped(true);
      setTimeout(() => {
        setCorrect((c) => c + 1);
        onRecord(cards[idx].id, category, true);
        advance("right");
      }, 600);
      return;
    }
    setCorrect((c) => c + 1);
    onRecord(cards[idx].id, category, true);
    advance("right");
  }, [flipped, idx, cards, category, onRecord, advance]);

  const handleDidntKnow = useCallback(() => {
    if (!flipped) {
      setFlipped(true);
      setTimeout(() => {
        setWrong((w) => w + 1);
        onRecord(cards[idx].id, category, false);
        advance("left");
      }, 600);
      return;
    }
    setWrong((w) => w + 1);
    onRecord(cards[idx].id, category, false);
    advance("left");
  }, [flipped, idx, cards, category, onRecord, advance]);

  if (done && alreadyDone >= DAILY_LIMIT && total === 0) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8 sm:py-12 px-2">
        <p className="text-base sm:text-lg font-semibold text-white">
          You've completed today's practice for {CATEGORY_META[category].label}!
        </p>
        <p className="text-sm text-white/50">Come back tomorrow for new cards, or revise your weak cards.</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onBack} className="px-5 py-2.5 rounded-[14px] text-sm font-semibold text-white active:scale-[0.97]" style={{ background: "#FF6600" }}>
            Other categories
          </button>
          <button
            onClick={onSwitchToRevise}
            className="px-5 py-2.5 rounded-[14px] text-sm font-semibold active:scale-[0.97]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}
          >
            Revise weak cards
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <PracticeSummary
        correct={correct}
        total={total}
        category={category}
        onPracticeAnother={onBack}
        onRevise={onSwitchToRevise}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <button onClick={onBack} className="self-start flex items-center gap-1 text-sm text-white/50 hover:text-white mb-3 sm:mb-4 active:scale-[0.97] transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <ProgressDots total={total} current={idx} color={color} />

      <div
        className="w-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <FlashcardDisplay
          card={cards[idx]}
          category={category}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
          swipeDir={swipeDir}
        />
      </div>

      <ActionButtons
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
        onDidntKnow={handleDidntKnow}
        onKnewIt={handleKnew}
      />

      {/* Score tracker */}
      <div className="flex items-center gap-4 mt-3 sm:mt-4 text-[13px] text-white/60">
        <span className="text-emerald-400">✓ {correct}</span>
        <span className="text-red-400">✗ {wrong}</span>
      </div>
    </div>
  );
}
