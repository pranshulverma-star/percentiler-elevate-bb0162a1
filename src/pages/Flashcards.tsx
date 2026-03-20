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
import { CATEGORY_META, type FlashcardCategory } from "@/data/flashcards";
import { Loader2, ArrowLeft } from "lucide-react";
import { useBackToDashboard } from "@/hooks/useBackToDashboard";
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

const CATEGORY_SECONDARY: Record<FlashcardCategory, string> = {
  vocab: "#FF9944",
  idioms: "#F472B6",
  quant_formulas: "#818CF8",
  lrdi_tips: "#2DD4BF",
};

function PracticeBg({ category }: { category: FlashcardCategory | null }) {
  const cat = category || "vocab";
  const primary = CATEGORY_META[cat].color;
  const secondary = CATEGORY_SECONDARY[cat];

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute inset-0" style={{ background: "#0A0A0F" }} />
      <div
        className="absolute top-0 right-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full"
        style={{ background: primary, filter: "blur(100px)", opacity: 0.15 }}
      />
      <div
        className="absolute bottom-0 left-0 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] rounded-full"
        style={{ background: secondary, filter: "blur(100px)", opacity: 0.12 }}
      />
    </div>
  );
}

export default function FlashcardsPage() {
  useBackToDashboard();
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

  const activeColor = selectedCategory ? CATEGORY_META[selectedCategory].color : "#FF6600";

  // Practice view
  if (view === "practice") {
    if (authLoading || loading) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#FF6600" }} />
        </div>
      );
    }

    return (
      <div className="flashcard-practice min-h-screen relative">
        <PracticeBg category={selectedCategory} />

        <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-5 py-6 sm:py-8 pb-[env(safe-area-inset-bottom,16px)]">
          <button
            onClick={handleBackToLanding}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Flashcards
          </button>

          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-4 sm:mb-6">Flashcard Practice</h2>

          {/* Tab toggle */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div
              className="inline-flex rounded-full p-1"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {(["practice", "revise"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelectedCategory(null); }}
                  className="px-5 sm:px-6 py-1.5 sm:py-2 rounded-full text-[13px] sm:text-sm font-medium transition-all capitalize active:scale-[0.97]"
                  style={{
                    background: tab === t ? activeColor : "transparent",
                    color: tab === t ? "#fff" : "rgba(255,255,255,0.5)",
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

  // Landing page
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
