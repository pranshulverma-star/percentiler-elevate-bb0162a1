import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import FlashcardHero from "@/components/flashcards/landing/FlashcardHero";
import CategoryShowcase from "@/components/flashcards/landing/CategoryShowcase";
import HowItWorks from "@/components/flashcards/landing/HowItWorks";
import FeatureHighlights from "@/components/flashcards/landing/FeatureHighlights";
import SampleCardsPreview from "@/components/flashcards/landing/SampleCardsPreview";
import SocialProof from "@/components/flashcards/landing/SocialProof";
import FlashcardCTA from "@/components/flashcards/landing/FlashcardCTA";
import FlashcardFAQ from "@/components/flashcards/landing/FlashcardFAQ";
import CategorySelector from "@/components/flashcards/CategorySelector";
import FlashcardPractice from "@/components/flashcards/FlashcardPractice";
import ReviseTab from "@/components/flashcards/ReviseTab";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import type { FlashcardCategory } from "@/data/flashcards";
import { Loader2, ArrowLeft } from "lucide-react";
import "katex/dist/katex.min.css";

type View = "landing" | "practice";
type Tab = "practice" | "revise";

const SCHEMA_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LearningResource",
  name: "CAT Flashcards by Percentilers",
  description: "557 flashcards covering Vocabulary, Quant Formulas, Idioms, and LRDI Tips for CAT preparation with mnemonic memory techniques.",
  provider: { "@type": "Organization", name: "Percentilers", url: "https://percentilers.in" },
  educationalLevel: "Graduate",
  audience: { "@type": "EducationalAudience", educationalRole: "student" },
  isAccessibleForFree: true,
  inLanguage: "en",
  about: ["CAT Preparation", "MBA Entrance Exam", "Quantitative Aptitude", "Verbal Ability", "Logical Reasoning", "Data Interpretation"],
};

export default function FlashcardsPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const { loading, getTodayCount, getTodayCardIds, getRevisionCards, recordAnswer } = useFlashcardProgress();

  const [view, setView] = useState<View>("landing");
  const [tab, setTab] = useState<Tab>("practice");
  const [selectedCategory, setSelectedCategory] = useState<FlashcardCategory | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const handleStartPracticing = useCallback(() => {
    if (!user) {
      signIn("/flashcards");
      return;
    }
    setView("practice");
    window.scrollTo(0, 0);
  }, [user, signIn]);

  const handleCategoryPractice = useCallback((cat: FlashcardCategory) => {
    if (!user) {
      signIn("/flashcards");
      return;
    }
    setView("practice");
    setSelectedCategory(cat);
    window.scrollTo(0, 0);
  }, [user, signIn]);

  const handleBack = () => {
    setSelectedCategory(null);
    setSessionKey((k) => k + 1);
  };

  const handleBackToLanding = () => {
    setView("landing");
    setSelectedCategory(null);
    setTab("practice");
  };

  // Practice view (logged in only)
  if (view === "practice") {
    if (authLoading || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: "hsl(24,100%,50%)" }} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-xl mx-auto px-4 py-8">
          <button
            onClick={handleBackToLanding}
            className="flex items-center gap-2 text-sm text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,8%)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Flashcards
          </button>

          <h2 className="text-2xl font-bold text-[hsl(0,0%,8%)] text-center mb-6">Flashcard Practice</h2>

          {/* Tab toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-full border border-[hsl(0,0%,90%)] p-1 bg-[hsl(0,0%,97%)]">
              {(["practice", "revise"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelectedCategory(null); }}
                  className="px-6 py-2 rounded-full text-sm font-semibold transition-colors capitalize active:scale-[0.97]"
                  style={{
                    background: tab === t ? "hsl(24,100%,50%)" : "transparent",
                    color: tab === t ? "#fff" : "hsl(0,0%,8%)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

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

  // Landing page (public)
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>CAT Flashcards — 557 Free Cards with Mnemonics | Percentilers</title>
        <meta name="description" content="Master CAT Vocabulary, Quant Formulas, Idioms & LRDI with 557 free flashcards. Mnemonic memory tricks, LaTeX math, daily practice & spaced revision. Built by 7-time CAT 100%iler faculty." />
        <link rel="canonical" href="https://percentilers.in/flashcards" />
        <meta property="og:title" content="CAT Flashcards — 557 Free Cards with Mnemonics | Percentilers" />
        <meta property="og:description" content="Master CAT Vocab, Quant, Idioms & LRDI with clever memory tricks. 5 cards/day, streak tracking, revision bank. Free." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://percentilers.in/flashcards" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CAT Flashcards — 557 Free Cards | Percentilers" />
        <meta name="twitter:description" content="Mnemonic flashcards for CAT 2026. Vocab, Quant Formulas, Idioms, LRDI. Free." />
        <script type="application/ld+json">{JSON.stringify(SCHEMA_JSON_LD)}</script>
      </Helmet>

      <Navbar />
      <FlashcardHero onStartPracticing={handleStartPracticing} />
      <CategoryShowcase onPractice={handleCategoryPractice} />
      <HowItWorks />
      <FeatureHighlights />
      <SampleCardsPreview onSignUp={handleStartPracticing} />
      <SocialProof />
      <FlashcardCTA onStart={handleStartPracticing} />
      <FlashcardFAQ />
      <Footer />
    </div>
  );
}
