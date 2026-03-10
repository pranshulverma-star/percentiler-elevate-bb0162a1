import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, MinusCircle, RotateCcw, BookOpen, Zap, ChevronRight, Lock, Trophy, Users, TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { practiceLabSections, type SectionData, type Chapter, type PracticeQuestion } from "@/data/practiceLabQuestions";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";
import { supabase } from "@/integrations/supabase/client";

type Phase = "sections" | "chapters" | "quiz" | "results";

const QUIZ_DURATION = 900; // 15 minutes
const QUIZ_QUESTION_COUNT = 10;

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

// ─── Section Cards ───────────────────────────────────────────────────────────

// ─── Mock Leaderboard Data ───────────────────────────────────────────────────

const leaderboardData = [
  { rank: 1, name: "Aarav M.", score: 980, streak: 12, badge: "🥇" },
  { rank: 2, name: "Priya S.", score: 945, streak: 10, badge: "🥈" },
  { rank: 3, name: "Rohan K.", score: 920, streak: 9, badge: "🥉" },
  { rank: 4, name: "Ananya D.", score: 890, streak: 8, badge: "" },
  { rank: 5, name: "Karthik N.", score: 870, streak: 7, badge: "" },
];

const practiceTestimonials = [
  { name: "Meera T.", text: "The timed quizzes helped me improve my speed. Jumped from 85 to 98 percentile!", highlight: "85 → 98 percentile" },
  { name: "Karthik N.", text: "Practising chapter-wise before mocks made a huge difference in my accuracy.", highlight: "Accuracy boost" },
  { name: "Divya S.", text: "The leaderboard kept me motivated. Competing with peers pushed me harder.", highlight: "Peer motivation" },
];

// ─── Section Cards ───────────────────────────────────────────────────────────

function SectionsView({ onSelect }: { onSelect: (s: SectionData) => void }) {
  const sectionColors = [
    "from-orange-500/20 to-amber-500/10 border-orange-500/20",
    "from-blue-500/20 to-cyan-500/10 border-blue-500/20",
    "from-emerald-500/20 to-teal-500/10 border-emerald-500/20",
  ];
  const sectionIcons = ["📐", "🧩", "📖"];

  return (
    <motion.div {...fadeUp} className="space-y-12">
      {/* Hero */}
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="text-xs tracking-wide uppercase font-medium">
          <Zap className="w-3 h-3 mr-1" /> Free Practice
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-foreground">
          Practice Lab
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Sharpen your CAT prep with timed quizzes across all three sections. Pick a section to begin.
        </p>
      </div>

      {/* Section Cards — equal height */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {practiceLabSections.map((section, i) => {
          const totalQ = section.chapters.reduce((sum, ch) => sum + ch.questions.length, 0);
          const available = section.chapters.filter(ch => ch.questions.length > 0).length;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex"
            >
              <Card
                className={`group relative overflow-hidden cursor-pointer border bg-gradient-to-br ${sectionColors[i]} 
                  hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col w-full`}
                onClick={() => onSelect(section)}
              >
                <div className="p-6 md:p-8 flex flex-col flex-1 space-y-4">
                  <div className="text-4xl">{sectionIcons[i]}</div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">{section.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-muted-foreground">
                      {section.chapters.length} chapters · {totalQ} questions
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {available === 0 && (
                    <Badge variant="outline" className="text-xs absolute top-4 right-4">Coming Soon</Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Leaderboard</h2>
        </div>
        <Card className="border overflow-hidden">
          <div className="divide-y divide-border">
            {leaderboardData.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 px-4 py-3 md:px-6 md:py-4 ${
                  entry.rank <= 3 ? "bg-primary/[0.03]" : ""
                }`}
              >
                <span className="w-8 text-center font-bold text-lg">
                  {entry.badge || `#${entry.rank}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.streak}-day streak</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{entry.score}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Testimonials */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">What Students Say</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {practiceTestimonials.map((t, i) => (
            <Card key={i} className="p-5 border space-y-3">
              <Badge variant="secondary" className="text-xs">{t.highlight}</Badge>
              <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
              <p className="text-xs font-medium text-foreground">— {t.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Chapter Grid ────────────────────────────────────────────────────────────

function ChaptersView({
  section,
  onBack,
  onSelect,
}: {
  section: SectionData;
  onBack: () => void;
  onSelect: (ch: Chapter) => void;
}) {
  return (
    <motion.div {...fadeUp} className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to sections
      </button>

      <div>
        <span className="text-3xl mb-2 block">{section.icon}</span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{section.name}</h2>
        <p className="text-muted-foreground mt-1">Select a chapter to start practicing</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {section.chapters.map((ch, i) => {
          const hasQuestions = ch.questions.length > 0;
          return (
            <motion.div
              key={ch.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <Card
                className={`p-5 border transition-all duration-200 ${
                  hasQuestions
                    ? "cursor-pointer hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={() => hasQuestions && onSelect(ch)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasQuestions ? (
                      <BookOpen className="w-5 h-5 text-primary" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <h3 className="font-medium text-foreground text-sm">{ch.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {hasQuestions ? `${ch.questions.length} questions` : "Coming soon"}
                      </span>
                    </div>
                  </div>
                  {hasQuestions && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Quiz Phase ──────────────────────────────────────────────────────────────

function QuizView({
  chapter,
  questions,
  onFinish,
  onBack,
}: {
  chapter: Chapter;
  questions: PracticeQuestion[];
  onFinish: (answers: Record<number, number | string | null>, timeUsed: number) => void;
  onBack: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string | null>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(answers, QUIZ_DURATION);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isLowTime = timeLeft <= 120;
  const answeredCount = questions.filter((qq) => answers[qq.id] !== undefined && answers[qq.id] !== null && answers[qq.id] !== "").length;

  const handleSelect = (optIndex: number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
  };

  const handleNumericChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const handleSubmit = () => {
    onFinish(answers, QUIZ_DURATION - timeLeft);
  };

  return (
    <motion.div {...fadeUp} className="max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-xs">{chapter.name}</Badge>
          <div className={`flex items-center gap-1.5 text-sm font-mono font-semibold ${isLowTime ? "text-destructive animate-pulse" : "text-foreground"}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left Question Palette */}
        <div className="hidden md:block w-48 shrink-0">
          <Card className="p-4 border sticky top-24 space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Questions</p>
              <p className="text-[10px] text-muted-foreground">{answeredCount}/{questions.length} answered</p>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((qq, i) => {
                const isAnswered = answers[qq.id] !== undefined && answers[qq.id] !== null && answers[qq.id] !== "";
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all border
                      ${i === currentIndex
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : isAnswered
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground/60"
                      }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-primary/10 border border-primary/40" />
                Answered
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="w-3 h-3 rounded-sm border border-border" />
                Not answered
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="w-3 h-3 rounded-sm bg-primary border border-primary" />
                Current
              </div>
            </div>
            <Button onClick={handleSubmit} size="sm" className="w-full mt-2">
              Submit Quiz
            </Button>
          </Card>
        </div>

        {/* Main question area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Progress bar */}
          <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5" />

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="p-6 md:p-8 border space-y-6">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-mono text-muted-foreground mt-1 shrink-0">Q{currentIndex + 1}.</span>
                  <p className="text-base md:text-lg font-medium text-foreground leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {q.type === "mcq" ? (
                  <RadioGroup
                    value={answers[q.id] !== undefined && answers[q.id] !== null ? String(answers[q.id]) : ""}
                    onValueChange={(v) => handleSelect(Number(v))}
                    className="space-y-3"
                  >
                    {q.options.map((opt, idx) => (
                      <Label
                        key={idx}
                        htmlFor={`opt-${q.id}-${idx}`}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                          ${answers[q.id] === idx
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                          }`}
                      >
                        <RadioGroupItem value={String(idx)} id={`opt-${q.id}-${idx}`} />
                        <span className="text-sm text-foreground">{opt}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`numeric-${q.id}`} className="text-sm text-muted-foreground">
                      Type your answer
                    </Label>
                    <Input
                      id={`numeric-${q.id}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter a number..."
                      value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow only numbers, decimal point, colon (for ratios), slash, and minus
                        if (val === "" || /^[-\d.:/ ]*$/.test(val)) {
                          handleNumericChange(val);
                        }
                      }}
                      className="text-base"
                      autoComplete="off"
                    />
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Previous
            </Button>

            {isLast ? (
              <Button onClick={handleSubmit} className="px-6">
                Submit Quiz
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                Next
              </Button>
            )}
          </div>

          {/* Mobile question pills */}
          <div className="flex flex-wrap gap-2 justify-center pt-2 md:hidden">
            {questions.map((qq, i) => {
              const isAnswered = answers[qq.id] !== undefined && answers[qq.id] !== null && answers[qq.id] !== "";
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all border
                    ${i === currentIndex
                      ? "border-primary bg-primary text-primary-foreground"
                      : isAnswered
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground"
                    }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface AttemptRecord {
  score_pct: number;
  correct: number;
  total_questions: number;
  time_used_seconds: number;
  created_at: string;
}

function ResultsView({
  questions,
  answers,
  timeUsed,
  chapterName,
  sectionId,
  chapterSlug,
  onRetry,
  onBack,
}: {
  questions: PracticeQuestion[];
  answers: Record<number, number | string | null>;
  timeUsed: number;
  chapterName: string;
  sectionId: string;
  chapterSlug: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [pastAttempts, setPastAttempts] = useState<AttemptRecord[]>([]);
  const [_loadingHistory, setLoadingHistory] = useState(true);
  const savedRef = useRef(false);

  const { correct, incorrect, unanswered } = useMemo(() => {
    let correct = 0, incorrect = 0, unanswered = 0;
    questions.forEach((q) => {
      const a = answers[q.id];
      if (a === undefined || a === null || a === "") {
        unanswered++;
      } else if (q.type === "mcq") {
        if (a === q.correctAnswer) correct++;
        else incorrect++;
      } else {
        // Numeric: normalize and compare
        const userStr = String(a).trim().toLowerCase();
        const correctStr = (q.numericAnswer || "").trim().toLowerCase();
        if (correctStr && userStr === correctStr) correct++;
        else incorrect++; // self-review will show correct answer
      }
    });
    return { correct, incorrect, unanswered };
  }, [questions, answers]);

  const pct = Math.round((correct / questions.length) * 100);
  const [showReview, setShowReview] = useState(false);

  // Save attempt + fetch history
  useEffect(() => {
    if (!user?.id) { setLoadingHistory(false); return; }

    const saveAndFetch = async () => {
      // Save current attempt (once)
      if (!savedRef.current) {
        savedRef.current = true;
        await (supabase.from("practice_lab_attempts") as any).insert({
          user_id: user.id,
          section_id: sectionId,
          chapter_slug: chapterSlug,
          total_questions: questions.length,
          correct,
          incorrect,
          unanswered,
          score_pct: pct,
          time_used_seconds: timeUsed,
          answers_json: answers,
        });
      }

      // Fetch past attempts for this chapter
      const { data } = await (supabase.from("practice_lab_attempts") as any)
        .select("score_pct, correct, total_questions, time_used_seconds, created_at")
        .eq("user_id", user.id)
        .eq("section_id", sectionId)
        .eq("chapter_slug", chapterSlug)
        .order("created_at", { ascending: false })
        .limit(10);

      setPastAttempts(data || []);
      setLoadingHistory(false);
    };

    saveAndFetch();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const bestScore = pastAttempts.length > 0 ? Math.max(...pastAttempts.map(a => a.score_pct)) : pct;
  const avgScore = pastAttempts.length > 0 ? Math.round(pastAttempts.reduce((s, a) => s + a.score_pct, 0) / pastAttempts.length) : pct;
  const improvement = pastAttempts.length >= 2 ? pastAttempts[0].score_pct - pastAttempts[pastAttempts.length - 1].score_pct : 0;

  return (
    <motion.div {...fadeUp} className="max-w-2xl mx-auto space-y-8">
      {/* Score Hero */}
      <Card className="p-8 md:p-10 border text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 space-y-4">
          <Badge variant="secondary" className="text-xs">{chapterName}</Badge>
          <div className="text-6xl md:text-7xl font-bold text-foreground tracking-tighter">
            {pct}<span className="text-3xl text-muted-foreground">%</span>
          </div>
          <p className="text-muted-foreground">
            You got <span className="text-foreground font-semibold">{correct}</span> out of {questions.length} correct
            {timeUsed > 0 && <> in <span className="font-semibold text-foreground">{formatTime(timeUsed)}</span></>}
          </p>

          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-foreground font-medium">{correct}</span>
              <span className="text-muted-foreground">correct</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-foreground font-medium">{incorrect}</span>
              <span className="text-muted-foreground">wrong</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <MinusCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{unanswered}</span>
              <span className="text-muted-foreground">skipped</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Card */}
      {pastAttempts.length > 1 && (
        <Card className="p-5 border space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Your Performance History</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-secondary p-3">
              <div className="text-xl font-bold text-primary">{bestScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">Best Score</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <div className="text-xl font-bold text-foreground">{avgScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <div className={`text-xl font-bold flex items-center justify-center gap-1 ${improvement > 0 ? "text-emerald-500" : improvement < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {improvement > 0 && <TrendingUp className="w-4 h-4" />}
                {improvement > 0 ? "+" : ""}{improvement}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Trend</p>
            </div>
          </div>

          {/* Mini attempt timeline */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium">Recent Attempts</p>
            {pastAttempts.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
                <span className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{formatTime(a.time_used_seconds)}</span>
                  <span className={`font-semibold ${a.score_pct >= 70 ? "text-emerald-500" : a.score_pct >= 40 ? "text-primary" : "text-destructive"}`}>
                    {a.score_pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRetry} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Try Again
        </Button>
        <Button variant="outline" onClick={onBack}>
          Back to Chapters
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowReview((v) => !v)}
        >
          {showReview ? "Hide Review" : "Review Answers"}
        </Button>
      </div>

      {/* Review */}
      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {questions.map((q, i) => {
              const userAnswer = answers[q.id];
              const isSkipped = userAnswer === undefined || userAnswer === null || userAnswer === "";
              const isCorrect = q.type === "mcq"
                ? userAnswer === q.correctAnswer
                : !isSkipped && String(userAnswer).trim().toLowerCase() === (q.numericAnswer || "").trim().toLowerCase();

              return (
                <Card key={q.id} className="p-5 border space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-muted-foreground mt-1">Q{i + 1}</span>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-foreground">{q.question}</p>

                      {q.type === "mcq" ? (
                        <div className="space-y-1">
                          {q.options.map((opt, idx) => {
                            let cls = "text-sm px-3 py-1.5 rounded-lg ";
                            if (idx === q.correctAnswer) cls += "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium";
                            else if (idx === userAnswer && !isCorrect) cls += "bg-destructive/10 text-destructive line-through";
                            else cls += "text-muted-foreground";
                            return <div key={idx} className={cls}>{opt}</div>;
                          })}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Your answer: </span>
                            <span className={isSkipped ? "text-muted-foreground italic" : isCorrect ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-destructive line-through"}>
                              {isSkipped ? "Skipped" : String(userAnswer)}
                            </span>
                          </div>
                          <div className="text-sm px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
                            Correct: {q.numericAnswer || "See explanation"}
                          </div>
                        </div>
                      )}

                      {q.explanation && (
                        <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                    <div className="mt-1">
                      {isSkipped ? (
                        <MinusCircle className="w-4 h-4 text-muted-foreground" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PracticeLab() {
  const [phase, setPhase] = useState<Phase>("sections");
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<PracticeQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | string | null>>({});
  const [quizTimeUsed, setQuizTimeUsed] = useState(0);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  const { isAuthenticated, loading: authLoading, signIn } = useAuth();
  const { hasPhone, loading: phoneLoading, refetch: refetchPhone } = useLeadPhone();

  // Store pending chapter selection while auth/phone gate resolves
  const pendingChapter = useRef<Chapter | null>(null);

  const handleSelectSection = useCallback((s: SectionData) => {
    setSelectedSection(s);
    setPhase("chapters");
  }, []);

  // After auth or phone resolves, check if we have a pending chapter to start
  useEffect(() => {
    if (!pendingChapter.current) return;
    if (authLoading || phoneLoading) return;
    if (!isAuthenticated) return; // still waiting for OAuth return
    if (!hasPhone) {
      setPhoneModalOpen(true);
      return;
    }
    // All gates passed — start quiz
    const ch = pendingChapter.current;
    pendingChapter.current = null;
    setSelectedChapter(ch);
    setQuizQuestions(pickRandom(ch.questions, QUIZ_QUESTION_COUNT));
    setQuizAnswers({});
    setQuizTimeUsed(0);
    setPhase("quiz");
  }, [authLoading, phoneLoading, isAuthenticated, hasPhone]);

  // CTA Type: Both (Gmail + Phone)
  // Handles: Scenario 1 (no auth → Google sign-in), 2 (auth, no phone → phone modal), 3 (N/A — Gmail first), 4 (cleared → re-gate)
  const handleSelectChapter = useCallback((ch: Chapter) => {
    // Gate: require sign-in first
    if (!isAuthenticated) {
      pendingChapter.current = ch;
      signIn(window.location.pathname);
      return;
    }
    // Gate: require phone number
    if (!hasPhone) {
      pendingChapter.current = ch;
      setPhoneModalOpen(true);
      return;
    }
    // All clear — start quiz
    setSelectedChapter(ch);
    setQuizQuestions(pickRandom(ch.questions, QUIZ_QUESTION_COUNT));
    setQuizAnswers({});
    setQuizTimeUsed(0);
    setPhase("quiz");
  }, [isAuthenticated, hasPhone, signIn]);

  const handleFinishQuiz = useCallback((answers: Record<number, number | string | null>, timeUsed: number) => {
    setQuizAnswers(answers);
    setQuizTimeUsed(timeUsed);
    setPhase("results");
  }, []);

  const handleRetry = useCallback(() => {
    if (selectedChapter) {
      setQuizQuestions(pickRandom(selectedChapter.questions, QUIZ_QUESTION_COUNT));
    }
    setQuizAnswers({});
    setQuizTimeUsed(0);
    setPhase("quiz");
  }, [selectedChapter]);

  const handleBackToChapters = useCallback(() => {
    setPhase("chapters");
  }, []);

  const handleBackToSections = useCallback(() => {
    setSelectedSection(null);
    setPhase("sections");
  }, []);

  return (
    <>
      <SEO
        title="Practice Lab — Free CAT Mock Quizzes | Percentilers"
        description="Sharpen your CAT preparation with timed practice quizzes across QA, LRDI and VARC. Free, no signup required."
        canonical="https://percentiler-elevate.lovable.app/practice-lab"
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-6 pb-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto py-10 md:py-16">
          <AnimatePresence mode="wait">
            {phase === "sections" && (
              <SectionsView key="sections" onSelect={handleSelectSection} />
            )}
            {phase === "chapters" && selectedSection && (
              <ChaptersView
                key="chapters"
                section={selectedSection}
                onBack={handleBackToSections}
                onSelect={handleSelectChapter}
              />
            )}
            {phase === "quiz" && selectedChapter && quizQuestions.length > 0 && (
              <QuizView
                key="quiz"
                chapter={selectedChapter}
                questions={quizQuestions}
                onFinish={handleFinishQuiz}
                onBack={handleBackToChapters}
              />
            )}
            {phase === "results" && selectedChapter && selectedSection && (
              <ResultsView
                key="results"
                questions={quizQuestions}
                answers={quizAnswers}
                timeUsed={quizTimeUsed}
                chapterName={selectedChapter.name}
                sectionId={selectedSection.id}
                chapterSlug={selectedChapter.slug}
                onRetry={handleRetry}
                onBack={handleBackToChapters}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <PhoneCaptureModal
        open={phoneModalOpen}
        onOpenChange={setPhoneModalOpen}
        source="practice-lab"
        onSuccess={() => {
          refetchPhone();
          setPhoneModalOpen(false);
        }}
        title="One Last Step Before Your Quiz"
        description="Share your phone number so we can track your progress."
      />
    </>
  );
}
