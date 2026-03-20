import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, XCircle, MinusCircle, BookOpen,
  BarChart3, Flame, Target, ChevronRight, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useStreaks } from "@/hooks/useStreaks";
import { supabase } from "@/integrations/supabase/client";
import WorkshopRecommendation, { getWorkshopRecommendations } from "@/components/WorkshopRecommendation";
import { practiceLabSections, type PracticeQuestion } from "@/data/practiceLabQuestions";

// Lazy load the shareable card (pulls in html-to-image)
const ShareableResultCard = lazy(() => import("@/components/ShareableResultCard"));

// Quiz topic icon images
import iconNumberSystem from "@/assets/quiz-icon-number-system.png";
import iconTsd from "@/assets/quiz-icon-tsd.png";
import iconGeometry from "@/assets/quiz-icon-geometry.png";
import iconAlgebra from "@/assets/quiz-icon-algebra.png";
import iconRc from "@/assets/quiz-icon-rc.png";
import iconLrdi from "@/assets/quiz-icon-lrdi.png";

// Map chapter slugs/names to icons — covers ALL QA chapters + VARC + LRDI
const quizIconMap: Record<string, string> = {
  // QA — Arithmetic
  "percentages": iconNumberSystem,
  "ratios-proportions-and-variation": iconNumberSystem,
  "average-and-alligation": iconNumberSystem,
  "profit-loss": iconNumberSystem,
  "si-ci": iconNumberSystem,
  "tsd": iconTsd,
  "t-w": iconTsd,
  "time-speed-distance": iconTsd,
  "time-and-work": iconTsd,
  // QA — Number System
  "number-system": iconNumberSystem,
  "number-systems": iconNumberSystem,
  // QA — Geometry
  "geometry": iconGeometry,
  "mensuration": iconGeometry,
  "triangles": iconGeometry,
  "circles": iconGeometry,
  // QA — Algebra
  "simple-equations": iconAlgebra,
  "quadratic-equations": iconAlgebra,
  "sequence-series": iconAlgebra,
  "modulus-inequalities": iconAlgebra,
  "max-min": iconAlgebra,
  "algebra": iconAlgebra,
  "linear-equations": iconAlgebra,
  "inequalities": iconAlgebra,
  "functions": iconAlgebra,
  // QA — Modern Maths
  "permutation-combination": iconNumberSystem,
  "probability": iconNumberSystem,
  "indices-surds": iconAlgebra,
  "logs": iconAlgebra,
  // VARC
  "reading-comprehension": iconRc,
  "para-jumbles": iconRc,
  // LRDI
  "cat-lrdi-arena": iconLrdi,
};

function getQuizIcon(slug: string): string | null {
  if (quizIconMap[slug]) return quizIconMap[slug];
  for (const [key, icon] of Object.entries(quizIconMap)) {
    if (slug.includes(key) || key.includes(slug)) return icon;
  }
  return null;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function estimatePercentile(correct: number, total: number): number {
  if (total === 0) return 34;
  const ratio = correct / total;
  return Math.round((34 + ratio * (98.3 - 34)) * 10) / 10;
}

function getInsightText(correct: number, total: number): string {
  const pct = correct / total;
  if (pct >= 0.9) return `Students scoring ${correct}+ usually reach 99+ percentile in CAT.`;
  if (pct >= 0.7) return `Students scoring ${correct}+ usually reach 90+ percentile in CAT.`;
  if (pct >= 0.5) return `Students scoring ${correct}+ usually reach 80+ percentile in CAT.`;
  return `Focus on weak areas to boost your CAT percentile significantly.`;
}

interface ResultsViewProps {
  questions: PracticeQuestion[];
  answers: Record<number, number | string | null>;
  timeUsed: number;
  chapterName: string;
  sectionId: string;
  chapterSlug: string;
  onRetry: () => void;
  onBack: () => void;
}

export default function ResultsView({
  questions,
  answers,
  timeUsed,
  chapterName,
  sectionId,
  chapterSlug,
  onRetry,
  onBack,
}: ResultsViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pastAttempts, setPastAttempts] = useState<{ score_pct: number; correct: number; total_questions: number; time_used_seconds: number; created_at: string }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; isMe: boolean }[]>([]);
  const savedRef = useRef(false);
  const [showReview, setShowReview] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const { correct, incorrect, unanswered } = useMemo(() => {
    let correct = 0, incorrect = 0, unanswered = 0;
    questions.forEach((q) => {
      const a = answers[q.id];
      if (a === undefined || a === null || a === "") {
        unanswered++;
      } else if (
        q.type === "tita_text"
          ? String(a).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()
          : a === q.correctAnswer
      ) {
        correct++;
      } else {
        incorrect++;
      }
    });
    return { correct, incorrect, unanswered };
  }, [questions, answers]);

  const total = questions.length;
  const pct = Math.round((correct / total) * 100);
  const percentile = estimatePercentile(correct, total);
  const avgTimePerQ = total > 0 ? Math.round(timeUsed / total) : 0;

  // Recommended quizzes from other chapters
  const recommendedQuizzes = useMemo(() => {
    const recs: { name: string; sectionId: string; slug: string }[] = [];
    for (const section of practiceLabSections) {
      for (const ch of section.chapters) {
        if (ch.slug !== chapterSlug && ch.questions.length > 0) {
          recs.push({ name: ch.name, sectionId: section.id, slug: ch.slug });
        }
      }
    }
    return recs.sort(() => Math.random() - 0.5).slice(0, 4);
  }, [chapterSlug]);

  // Save attempt + fetch history
  useEffect(() => {
    if (!user?.id) return;
    const saveAndFetch = async () => {
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
      // Fetch personal history
      const { data } = await (supabase.from("practice_lab_attempts") as any)
        .select("score_pct, correct, total_questions, time_used_seconds, created_at")
        .eq("user_id", user.id)
        .eq("section_id", sectionId)
        .eq("chapter_slug", chapterSlug)
        .order("created_at", { ascending: false })
        .limit(10);
      setPastAttempts(data || []);

      // Fetch leaderboard — top 10 scores for this chapter across all users
      const { data: lbData } = await (supabase.from("practice_lab_attempts") as any)
        .select("user_id, score_pct")
        .eq("section_id", sectionId)
        .eq("chapter_slug", chapterSlug)
        .order("score_pct", { ascending: false })
        .limit(50);

      if (lbData) {
        // Deduplicate: best score per user
        const bestByUser: Record<string, number> = {};
        for (const row of lbData) {
          if (!bestByUser[row.user_id] || row.score_pct > bestByUser[row.user_id]) {
            bestByUser[row.user_id] = row.score_pct;
          }
        }

        // Fetch profile names for all user IDs
        const userIds = Object.keys(bestByUser);
        const { data: profilesData } = await (supabase.from("profiles") as any)
          .select("id, name")
          .in("id", userIds);
        const nameMap: Record<string, string> = {};
        if (profilesData) {
          for (const p of profilesData) {
            if (p.name) nameMap[p.id] = p.name.split(" ")[0]; // First name only
          }
        }

        const sorted = Object.entries(bestByUser)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([uid, score]) => ({
            name: uid === user.id
              ? (user.user_metadata?.name || user.email?.split("@")[0] || "You")
              : (nameMap[uid] || "CAT Aspirant"),
            score,
            isMe: uid === user.id,
          }));
        // Ensure current user is in leaderboard
        if (!sorted.some((s) => s.isMe)) {
          sorted.push({ name: user.user_metadata?.name || user.email?.split("@")[0] || "You", score: pct, isMe: true });
          sorted.sort((a, b) => b.score - a.score);
        }
        setLeaderboard(sorted.slice(0, 5));
      }
    };
    saveAndFetch();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const bestScore = pastAttempts.length > 0 ? Math.max(...pastAttempts.map(a => a.score_pct)) : pct;

  return (
    <motion.div {...fadeUp} className="max-w-lg mx-auto px-1 space-y-4">

      {/* ─── 1. Score Hero ─── */}
      <Card className="p-4 border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/3" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-foreground text-sm">Quiz Completed</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{chapterName}</span>
          </div>

          {/* Score + Percentile + Time */}
          <div className="grid grid-cols-3 gap-3 items-center text-center">
            <div>
              <div className="text-2xl font-black text-foreground leading-none">
                {correct}<span className="text-sm text-muted-foreground font-medium">/{total}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                <span className="text-primary font-bold">{pct}%</span> accuracy
              </div>
            </div>
            <div>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, ease: "backOut" }}
                className="text-3xl font-black text-foreground leading-none"
              >
                {percentile}<span className="text-xs text-muted-foreground font-medium">%ile</span>
              </motion.div>
              <div className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider">Est. Percentile</div>
            </div>
            <div>
              <div className="text-lg font-black text-foreground leading-tight">{formatTime(timeUsed)}</div>
              <div className="text-[10px] text-muted-foreground">{avgTimePerQ}s/Q</div>
            </div>
          </div>

          {/* Percentile bar */}
          <div className="space-y-1">
            <div className="relative h-2.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (percentile / 99.8) * 100)}%` }}
                transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.6), hsl(var(--primary)), hsl(25 100% 50%))" }}
              />
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] border-t border-border/50 pt-2">
            <div>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-0">
                ✓ {correct}
              </Badge>
            </div>
            <div>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-destructive/10 text-destructive border-0">
                ✗ {incorrect}
              </Badge>
            </div>
            <div>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                − {unanswered}
              </Badge>
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground">{getInsightText(correct, total)}</p>
        </div>
      </Card>

      {/* ─── 2. Actions Row ─── */}
      <div className="flex gap-2">
        <Button onClick={onRetry} size="sm" className="gap-1.5 font-bold flex-1 text-xs">
          <Target className="w-3.5 h-3.5" /> Retry Quiz
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 font-bold flex-1 text-xs"
          onClick={() => setShowShareCard((v) => !v)}
        >
          <Share2 className="w-3.5 h-3.5" /> {showShareCard ? "Hide Card" : "Share Image"}
        </Button>
      </div>

      {/* ─── 2b. Shareable Image Card (lazy loaded) ─── */}
      {showShareCard && (
        <Suspense fallback={<div className="h-40 rounded-2xl bg-secondary animate-pulse" />}>
          <ShareableResultCard
            correct={correct}
            total={total}
            percentile={percentile}
            chapterName={chapterName}
            timeUsed={timeUsed}
            leaderboard={leaderboard.length > 0 ? leaderboard : undefined}
          />
        </Suspense>
      )}

      {/* ─── 3. Weak Area + Workshop (only if incorrect) ─── */}
      {incorrect > 0 && (
        <Card className="p-3 border border-amber-500/20 bg-amber-500/[0.03] space-y-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-foreground">Improve: {chapterName}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Improving this topic can boost your CAT percentile by ~8-10 points.
          </p>
          <WorkshopRecommendation
            workshops={getWorkshopRecommendations(sectionId, chapterSlug)}
            title=""
            subtitle=""
          />
        </Card>
      )}

      {/* ─── 4. Next Quizzes ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Try Next</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {recommendedQuizzes.map((q, i) => {
            const iconImg = getQuizIcon(q.slug);
            return (
              <Card
                key={i}
                className="p-3 border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={onBack}
              >
                <div className="flex items-center gap-2">
                  {iconImg ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary/50 flex items-center justify-center shrink-0">
                      <img src={iconImg} alt={q.name} className="w-6 h-6 object-contain" loading="lazy" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">{q.name}</p>
                </div>
              </Card>
            );
          })}
        </div>
        <Button variant="outline" onClick={onBack} size="sm" className="gap-1.5 w-full text-xs">
          <ArrowLeft className="w-3 h-3" /> All Quizzes
        </Button>
      </div>

      {/* ─── 5. History (compact) ─── */}
      {/* ─── 5a. Leaderboard ─── */}
      {leaderboard.length > 0 && (
        <Card className="p-3 border space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">🏆</span>
            <span className="text-xs font-bold text-foreground">Leaderboard</span>
            <span className="text-[10px] text-muted-foreground ml-auto">{chapterName}</span>
          </div>
          {leaderboard.map((p, i) => {
            const medals = ["🥇", "🥈", "🥉"];
            return (
              <div
                key={i}
                className={`flex items-center justify-between text-[11px] py-1.5 px-2 rounded-lg ${
                  p.isMe ? "bg-primary/10 border border-primary/20" : "border-b border-border/50 last:border-0"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm w-5 text-center">{medals[i] || `#${i + 1}`}</span>
                  <span className={`font-bold ${p.isMe ? "text-foreground" : "text-muted-foreground"}`}>
                    {p.name}
                    {p.isMe && <span className="ml-1 text-[9px] font-black text-primary uppercase">(You)</span>}
                  </span>
                </span>
                <span className="font-black text-foreground">{p.score}%</span>
              </div>
            );
          })}
        </Card>
      )}

      {/* ─── 5b. History (compact) ─── */}
      {pastAttempts.length > 1 && (
        <Card className="p-3 border space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">History</span>
            <span className="text-[10px] text-muted-foreground ml-auto">Best: <span className="font-bold text-primary">{bestScore}%</span></span>
          </div>
          {pastAttempts.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              <span className={`font-bold ${a.score_pct >= 70 ? "text-emerald-500" : a.score_pct >= 40 ? "text-primary" : "text-destructive"}`}>
                {a.score_pct}%
              </span>
            </div>
          ))}
        </Card>
      )}

      {/* ─── 6. CTA ─── */}
      <Card
        className="p-3 border text-center space-y-1.5 bg-gradient-to-br from-primary/5 to-transparent cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => navigate(percentile < 80 ? "/masterclass" : "/mentorship")}
      >
        <div className="flex items-center justify-center gap-1.5">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            {percentile < 80 ? "Watch Free CAT Masterclass" : "Explore Mentorship"}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-primary" />
        </div>
      </Card>

      {/* ─── 7. Review Answers (collapsed) ─── */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => setShowReview((v) => !v)}
          className="gap-2 text-xs"
          size="sm"
        >
          <BookOpen className="w-3.5 h-3.5" /> {showReview ? "Hide Review" : "Review Answers"}
        </Button>
      </div>

      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {questions.map((q, i) => {
              const userAnswer = answers[q.id];
              const isSkipped = userAnswer === undefined || userAnswer === null || userAnswer === "";
              const isCorrect = q.type === "tita_text"
                ? String(userAnswer).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase()
                : userAnswer === q.correctAnswer;

              return (
                <Card key={q.id} className="p-3 border space-y-1.5">
                  <div className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                      isSkipped ? "bg-secondary" : isCorrect ? "bg-emerald-500/15" : "bg-destructive/15"
                    }`}>
                      {isSkipped ? <MinusCircle className="w-3 h-3 text-muted-foreground" /> :
                       isCorrect ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> :
                       <XCircle className="w-3 h-3 text-destructive" />}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs font-medium text-foreground">Q{i + 1}. {q.question}</p>
                      {q.type === "tita_text" ? (
                        <div className="space-y-1 text-xs">
                          <div className={`px-2 py-0.5 rounded ${isCorrect ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                            Your answer: {isSkipped ? "(skipped)" : String(userAnswer)}
                          </div>
                          {!isCorrect && (
                            <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                              Correct: {String(q.correctAnswer)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {q.options.map((opt, idx) => {
                            let cls = "text-xs px-2 py-0.5 rounded ";
                            if (idx === q.correctAnswer) cls += "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium";
                            else if (idx === userAnswer && !isCorrect) cls += "bg-destructive/10 text-destructive line-through";
                            else cls += "text-muted-foreground";
                            return <div key={idx} className={cls}>{opt}</div>;
                          })}
                        </div>
                      )}
                      {q.explanation && (
                        <p className="text-[10px] text-muted-foreground italic border-t border-border/50 pt-1">
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard nudge */}
      <Card
        className="p-3 bg-primary/5 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
        onClick={() => navigate("/dashboard")}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <div>
              <p className="font-semibold text-xs text-foreground">Track Your Progress</p>
              <p className="text-[10px] text-muted-foreground">View streaks & stats on your Dashboard</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </motion.div>
  );
}
