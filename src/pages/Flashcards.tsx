import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import CategorySelector from "@/components/flashcards/CategorySelector";
import FlashcardPractice from "@/components/flashcards/FlashcardPractice";
import ReviseTab from "@/components/flashcards/ReviseTab";
import type { FlashcardCategory } from "@/data/flashcards";
import { Loader2 } from "lucide-react";
import "katex/dist/katex.min.css";

type Tab = "practice" | "revise";

export default function FlashcardsPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { loading, getTodayCount, getTodayCardIds, getRevisionCards, recordAnswer } = useFlashcardProgress();

  const [tab, setTab] = useState<Tab>("practice");
  const [selectedCategory, setSelectedCategory] = useState<FlashcardCategory | null>(null);
  // Key to force remount FlashcardPractice on category change
  const [sessionKey, setSessionKey] = useState(0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-7 h-7 animate-spin text-[#FF6600]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center gap-4">
        <h1 className="text-2xl font-bold text-[#141414]">Flashcard Practice</h1>
        <p className="text-gray-500 text-sm max-w-md">Sign in to start practicing flashcards and track your progress across sessions.</p>
        <button
          onClick={() => signIn("/flashcards")}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white active:scale-[0.97] transition-transform"
          style={{ background: "#FF6600" }}
        >
          Sign in to start practicing
        </button>
      </div>
    );
  }

  const handleBack = () => {
    setSelectedCategory(null);
    setSessionKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#141414] text-center mb-6">Flashcard Practice</h1>

        {/* Tab toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full border border-gray-200 p-1 bg-gray-50">
            {(["practice", "revise"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelectedCategory(null); }}
                className="px-6 py-2 rounded-full text-sm font-semibold transition-colors capitalize active:scale-[0.97]"
                style={{
                  background: tab === t ? "#FF6600" : "transparent",
                  color: tab === t ? "#fff" : "#141414",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Practice Tab */}
        {tab === "practice" && !selectedCategory && (
          <CategorySelector onSelect={setSelectedCategory} getTodayCount={getTodayCount} />
        )}

        {tab === "practice" && selectedCategory && (
          <FlashcardPractice
            key={sessionKey}
            category={selectedCategory}
            todayCardIds={getTodayCardIds(selectedCategory)}
            onRecord={recordAnswer}
            onBack={handleBack}
            onSwitchToRevise={() => { setTab("revise"); setSelectedCategory(null); }}
          />
        )}

        {/* Revise Tab */}
        {tab === "revise" && (
          <ReviseTab
            revisionCards={getRevisionCards()}
            onMarkKnown={async (cardId, cat) => { await recordAnswer(cardId, cat, true); }}
          />
        )}
      </div>
    </div>
  );
}
