import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, MinusCircle, BookOpen,
  BarChart3, Flame, Swords, Target, Crown,
  AlertTriangle, ChevronRight, Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ShareableResultCard from "@/components/ShareableResultCard";
import WorkshopRecommendation, { getWorkshopRecommendations } from "@/components/WorkshopRecommendation";
import { practiceLabSections, type PracticeQuestion } from "@/data/practiceLabQuestions";

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

function formatTimeShort(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function estimatePercentile(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  const mean = 0.45;
  const sd = 0.18;
  const z = (ratio - mean) / sd;
  const cdf = 1 / (1 + Math.exp(-1.7 * z));
  const percentile = Math.min(99.8, Math.max(1, cdf * 100));
  return Math.round(percentile * 10) / 10;
}

function estimateRank(percentile: number, totalStudents: number): number {
  return Math.max(1, Math.round(totalStudents * (1 - percentile / 100)));
}

function getInsightText(correct: number, total: number): string {
  const pct = correct / total;
  if (pct >= 0.9) return `Students scoring ${correct}+ in this quiz usually reach 99+ percentile in CAT.`;
  if (pct >= 0.7) return `Students scoring ${correct}+ in this quiz usually reach 90+ percentile in CAT.`;
  if (pct >= 0.5) return `Students scoring ${correct}+ in this quiz usually reach 80+ percentile in CAT.`;
  return `Focus on weak areas to boost your CAT percentile significantly.`;
}

function getDifficultyLabel(correct: number, total: number): { label: string; color: string } {
  const pct = correct / total;
  if (pct >= 0.8) return { label: "Easy", color: "text-emerald-500" };
  if (pct >= 0.5) return { label: "Medium", color: "text-amber-500" };
  return { label: "Hard", color: "text-destructive" };
}

interface AttemptRecord {
  score_pct: number;
  correct: number;
  total_questions: number;
  time_used_seconds: number;
  created_at: string;
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

// Mock leaderboard for social proof
function generateLeaderboard(correct: number, total: number, timeUsed: number) {
  const names = ["Rahul Sharma", "Tanmay Verma", "Aryan Mehta", "Neha Gupta", "Simran Kaur", "Amit Das", "Priya Singh"];
  const entries: { name: string; score: number; time: number; isMe: boolean }[] = [];

  // Generate 2 entries above, user, then 2 below
  const above = [
    { name: names[0], score: Math.min(total, correct + 2), time: timeUsed - 60 - Math.floor(Math.random() * 60) },
    { name: names[1], score: Math.min(total, correct + 1), time: timeUsed - Math.floor(Math.random() * 60) },
  ];
  above.forEach(e => entries.push({ ...e, isMe: false }));
  entries.push({ name: "You", score: correct, time: timeUsed, isMe: true });
  const below = [
    { name: names[2], score: Math.max(0, correct), time: timeUsed + 90 + Math.floor(Math.random() * 60) },
    { name: names[3], score: Math.max(0, correct - 1), time: timeUsed + 60 + Math.floor(Math.random() * 60) },
  ];
  below.forEach(e => entries.push({ ...e, isMe: false }));

  return entries;
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
  const [pastAttempts, setPastAttempts] = useState<AttemptRecord[]>([]);
  const [_loadingHistory, setLoadingHistory] = useState(true);
  const savedRef = useRef(false);
  const [showReview, setShowReview] = useState(false);

  const { correct, incorrect, unanswered } = useMemo(() => {
    let correct = 0, incorrect = 0, unanswered = 0;
    questions.forEach((q) => {
      const a = answers[q.id];
      if (a === undefined || a === null || a === "") {
        unanswered++;
      } else if (a === q.correctAnswer) {
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
  const totalStudents = 1327; // Social proof number
  const rank = estimateRank(percentile, totalStudents);
  const avgTimePerQ = total > 0 ? Math.round(timeUsed / total) : 0;
  const difficulty = getDifficultyLabel(correct, total);
  const leaderboard = useMemo(() => generateLeaderboard(correct, total, timeUsed), [correct, total, timeUsed]);

  // Find weak area based on incorrect answers
  const weakArea = useMemo(() => {
    const wrongTopics: Record<string, number> = {};
    questions.forEach((q) => {
      const a = answers[q.id];
      const isCorrect = a === q.correctAnswer;
      if (!isCorrect) {
        // Use chapter name as the weak area
        wrongTopics[chapterName] = (wrongTopics[chapterName] || 0) + 1;
      }
    });
    const topWeak = Object.entries(wrongTopics).sort((a, b) => b[1] - a[1])[0];
    return topWeak ? topWeak[0] : null;
  }, [questions, answers, chapterName]);

  // Get recommended quizzes (other chapters from all sections)
  const recommendedQuizzes = useMemo(() => {
    const recs: { name: string; sectionId: string; slug: string; icon: string }[] = [];
    const sectionIcons: Record<string, string> = { qa: "📊", lrdi: "🧩", varc: "📖" };
    for (const section of practiceLabSections) {
      for (const ch of section.chapters) {
        if (ch.slug !== chapterSlug && ch.questions.length > 0) {
          recs.push({ name: ch.name, sectionId: section.id, slug: ch.slug, icon: sectionIcons[section.id] || "📘" });
        }
      }
    }
    // Shuffle and take 3
    return recs.sort(() => Math.random() - 0.5).slice(0, 3);
  }, [chapterSlug]);

  // Save attempt + fetch history
  useEffect(() => {
    if (!user?.id) { setLoadingHistory(false); return; }
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

  return (
    <motion.div {...fadeUp} className="max-w-2xl mx-auto px-1 space-y-4">
      {/* ─── 1. Quiz Completed Hero Card ─── */}
      <Card className="p-4 md:p-6 border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/3" />
        <div className="relative z-10 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-foreground text-sm md:text-base">Quiz Completed</span>
          </div>

          {/* Score + Percentile + Time row */}
          <div className="grid grid-cols-3 gap-3 items-center">
            <div>
              <div className="text-2xl md:text-4xl font-black text-foreground leading-none">
                {correct}<span className="text-sm md:text-lg text-muted-foreground font-medium">/{total}</span>
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                Accuracy: <span className="text-primary font-bold">{pct}%</span>
              </div>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, ease: "backOut" }}
                className="text-3xl md:text-5xl font-black text-foreground leading-none"
              >
                {percentile}<span className="text-xs md:text-sm text-muted-foreground font-medium">%</span>
              </motion.div>
              <div className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Estimated Percentile</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] md:text-xs text-muted-foreground">Time Taken</div>
              <div className="text-lg md:text-2xl font-black text-foreground leading-tight">{formatTime(timeUsed)}</div>
            </div>
          </div>

          {/* Percentile bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] md:text-[9px] text-muted-foreground/60 font-mono">
              <span>0%ile</span>
              <span>99.8%ile</span>
            </div>
            <div className="relative h-2.5 md:h-3 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (percentile / 99.8) * 100)}%` }}
                transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.6), hsl(var(--primary)), hsl(25 100% 50%))" }}
              />
              {/* YOU marker */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
                className="absolute -top-5 md:-top-6 flex flex-col items-center"
                style={{ left: `${Math.min(93, (percentile / 99.8) * 100)}%` }}
              >
                <span className="text-[8px] md:text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">YOU</span>
                <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-primary" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background bg-primary shadow-lg"
                style={{ left: `${Math.min(95, (percentile / 99.8) * 100)}%` }}
              />
            </div>
            {/* Rank info */}
            <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-muted-foreground">
              <span>Rank: <span className="font-bold text-foreground">#{rank}</span></span>
              <span className="text-muted-foreground/40">·</span>
              <span>{totalStudents.toLocaleString()} students</span>
            </div>
          </div>

          {/* Insight line */}
          <div className="text-center text-[10px] md:text-xs text-muted-foreground border-t border-border/50 pt-3">
            {getInsightText(correct, total)}
          </div>
        </div>
      </Card>

      {/* ─── 2. Performance Breakdown ─── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-sm md:text-base font-bold text-foreground">Performance Breakdown</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {/* Accuracy */}
          <Card className="p-3 md:p-4 border space-y-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] md:text-xs font-bold text-foreground">Accuracy</span>
            </div>
            <div className="space-y-1 text-[10px] md:text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Correct</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-0">{correct}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Incorrect</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-destructive/10 text-destructive border-0">{incorrect}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skipped</span>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{unanswered}</Badge>
              </div>
              <div className="border-t border-border/50 pt-1 mt-1">
                <span className="text-muted-foreground">Accuracy: </span>
                <span className="font-bold text-primary">{pct}%</span>
              </div>
            </div>
          </Card>

          {/* Speed */}
          <Card className="p-3 md:p-4 border space-y-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] md:text-xs font-bold text-foreground">Speed</span>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-muted-foreground">Avg Time/Question</div>
              <div className="text-lg md:text-xl font-black text-foreground leading-tight">{formatTime(avgTimePerQ)}</div>
              <div className="border-t border-border/50 pt-1 mt-1">
                <span className="text-[10px] md:text-xs text-muted-foreground">Accuracy: </span>
                <span className="text-[10px] md:text-xs font-bold text-primary">{pct}%</span>
              </div>
            </div>
          </Card>

          {/* Difficulty */}
          <Card className="p-3 md:p-4 border space-y-2">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] md:text-xs font-bold text-foreground">Difficulty</span>
            </div>
            <div className="space-y-1 text-[10px] md:text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quiz Level</span>
                <span className={`font-bold ${difficulty.color}`}>{difficulty.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Top Score</span>
                <span className="font-black text-foreground">{bestScore > pct ? bestScore : Math.min(total, correct + 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Score</span>
                <span className="font-bold text-foreground">{(total * 0.51).toFixed(1)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── 3. Leaderboard + Weak Area ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Leaderboard */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-primary" />
            <h3 className="text-sm md:text-base font-bold text-foreground">Leaderboard</h3>
          </div>
          <Card className="p-0 border overflow-hidden">
            <div className="divide-y divide-border">
              {leaderboard.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 text-xs md:text-sm ${
                    entry.isMe ? "bg-primary/8 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                    {String.fromCodePoint(0x1F464)}
                  </div>
                  <span className={`flex-1 truncate font-semibold ${entry.isMe ? "text-primary" : "text-foreground"}`}>
                    {entry.isMe ? `${user?.user_metadata?.full_name || user?.user_metadata?.name || "You"} (You)` : entry.name}
                  </span>
                  <span className="font-black text-foreground">{entry.score}</span>
                  <span className="text-[9px] text-muted-foreground">/ {formatTimeShort(Math.max(0, entry.time))}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Weak Area Detected */}
        {weakArea && incorrect > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm md:text-base font-bold text-foreground">Weak Area Detected</h3>
            </div>
            <Card className="p-4 border border-amber-500/20 bg-amber-500/[0.03] space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-black text-foreground">{weakArea}</span>
                <span className="text-base">🌱</span>
              </div>
              <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">
                Students who improve this topic increase their CAT percentile by ~8-10 points.
              </p>
              <Button
                onClick={onRetry}
                size="sm"
                className="gap-1.5 font-bold text-xs w-full md:w-auto"
              >
                Practice {weakArea} <ChevronRight className="w-3 h-3" />
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* ─── 4. Challenge Your Friends + Next Quizzes ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Challenge */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-primary" />
            <h3 className="text-sm md:text-base font-bold text-foreground">Challenge Your Friends</h3>
          </div>
          <Card className="p-4 border space-y-3">
            <p className="text-xs text-muted-foreground">Can your friends beat your score?</p>
            <div className="flex gap-2">
              <Button onClick={onRetry} size="sm" className="gap-1.5 font-bold flex-1">
                <Swords className="w-3.5 h-3.5" /> Start Battle
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 font-bold"
                onClick={async () => {
                  const shareText = `🎯 I scored ${correct}/${total} (${percentile}%ile) on CAT Practice Lab!\n\nCan you beat this? 👀\nTry → percentilers.in/practice-lab`;
                  if (navigator.share) {
                    await navigator.share({ text: shareText }).catch(() => {});
                  } else {
                    await navigator.clipboard.writeText(shareText);
                  }
                }}
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </div>
            <p className="text-[9px] text-muted-foreground">Complete another quiz tomorrow to keep your streak alive.</p>
          </Card>
        </div>

        {/* Next Recommended Quizzes */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm md:text-base font-bold text-foreground">Next Recommended Quizzes</h3>
          </div>
          <Card className="p-4 border space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {recommendedQuizzes.map((q, i) => (
                <div key={i} className="text-center space-y-1.5">
                  <div className="text-2xl">{q.icon}</div>
                  <p className="text-[9px] md:text-[10px] font-semibold text-foreground leading-tight line-clamp-2">{q.name}</p>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-[8px] md:text-[9px] h-5 md:h-6 px-2 font-bold w-full"
                    onClick={onBack}
                  >
                    Start Quiz
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={onBack} size="sm" className="gap-1.5 w-full text-xs">
              <ArrowLeft className="w-3 h-3" /> Back to Practice Lab
            </Button>
          </Card>
        </div>
      </div>

      {/* ─── 5. Shareable Card (Save Image) ─── */}
      <ShareableResultCard
        correct={correct}
        total={total}
        chapterName={chapterName}
        timeUsed={timeUsed}
      />

      {/* ─── 6. Battle History ─── */}
      {pastAttempts.length > 1 && (
        <Card className="p-3 md:p-5 border space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm md:text-base font-bold text-foreground">Battle History</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border p-2 md:p-3">
              <div className="text-base md:text-xl font-black text-primary">{bestScore}%</div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Best</p>
            </div>
            <div className="rounded-lg border border-border p-2 md:p-3">
              <div className="text-base md:text-xl font-black text-foreground">{avgScore}%</div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Average</p>
            </div>
            <div className="rounded-lg border border-border p-2 md:p-3">
              <div className="text-base md:text-xl font-black text-foreground">{pastAttempts.length}</div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">Attempts</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Recent</p>
            {pastAttempts.slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] py-1.5 border-b border-border last:border-0">
                <span className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{formatTimeShort(a.time_used_seconds)}</span>
                  <span className={`font-bold ${a.score_pct >= 70 ? "text-emerald-500" : a.score_pct >= 40 ? "text-primary" : "text-destructive"}`}>
                    {a.score_pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── 7. Want to improve faster? CTA ─── */}
      <Card className="p-4 md:p-6 border text-center space-y-2 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">🚀</span>
          <h3 className="text-sm md:text-lg font-bold text-foreground">Want to improve faster?</h3>
        </div>
        <p className="text-[11px] md:text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          {percentile < 80
            ? "Students scoring below 80 percentile usually struggle with CAT strategy. Watch the Free CAT Masterclass to learn proven frameworks."
            : "Serious about cracking 99+ percentile? Our structured mentorship program has helped 100+ students reach top IIMs."}
        </p>
        <Button
          onClick={() => navigate(percentile < 80 ? "/masterclass" : "/mentorship")}
          size="sm"
          className="gap-1.5 font-bold"
        >
          <Flame className="w-3.5 h-3.5" /> {percentile < 80 ? "Watch Free Masterclass" : "Explore Mentorship"}
        </Button>
      </Card>

      {/* ─── 8. Review Answers ─── */}
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
            className="space-y-3 overflow-hidden"
          >
            {questions.map((q, i) => {
              const userAnswer = answers[q.id];
              const isSkipped = userAnswer === undefined || userAnswer === null || userAnswer === "";
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <Card key={q.id} className="p-4 border space-y-2">
                  <div className="flex items-start gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isSkipped ? "bg-secondary" : isCorrect ? "bg-emerald-500/15" : "bg-destructive/15"
                    }`}>
                      {isSkipped ? <MinusCircle className="w-3 h-3 text-muted-foreground" /> :
                       isCorrect ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> :
                       <XCircle className="w-3 h-3 text-destructive" />}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs md:text-sm font-medium text-foreground">Q{i + 1}. {q.question}</p>
                      <div className="space-y-1">
                        {q.options.map((opt, idx) => {
                          let cls = "text-xs px-2.5 py-1 rounded-lg ";
                          if (idx === q.correctAnswer) cls += "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium";
                          else if (idx === userAnswer && !isCorrect) cls += "bg-destructive/10 text-destructive line-through";
                          else cls += "text-muted-foreground";
                          return <div key={idx} className={cls}>{opt}</div>;
                        })}
                      </div>
                      {q.explanation && (
                        <p className="text-[10px] text-muted-foreground italic border-t border-border pt-2 mt-1">
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
    </motion.div>
  );
}
