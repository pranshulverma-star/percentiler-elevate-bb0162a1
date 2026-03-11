import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, XCircle, MinusCircle, RotateCcw, BookOpen, Zap, ChevronRight, Lock, Trophy, TrendingUp, BarChart3, Flame, Shield, Star, Swords, Target, Crown, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const QUIZ_DURATION = 900;
const QUIZ_QUESTION_COUNT = 10;
const XP_PER_CORRECT = 15;
const XP_PER_SPEED_BONUS = 5;

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getRank(totalXP: number) {
  if (totalXP >= 500) return { name: "Grandmaster", icon: "👑", color: "text-amber-400", next: null, xpToNext: 0 };
  if (totalXP >= 300) return { name: "Diamond", icon: "💎", color: "text-cyan-400", next: 500, xpToNext: 500 - totalXP };
  if (totalXP >= 150) return { name: "Gold", icon: "🥇", color: "text-amber-500", next: 300, xpToNext: 300 - totalXP };
  if (totalXP >= 50) return { name: "Silver", icon: "🥈", color: "text-muted-foreground", next: 150, xpToNext: 150 - totalXP };
  return { name: "Bronze", icon: "🥉", color: "text-amber-700", next: 50, xpToNext: 50 - totalXP };
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

// ─── Leaderboard Data ────────────────────────────────────────────────────────
const leaderboardData = [
  { rank: 1, name: "Aarav M.", xp: 980, streak: 12, badge: "👑" },
  { rank: 2, name: "Priya S.", xp: 945, streak: 10, badge: "💎" },
  { rank: 3, name: "Rohan K.", xp: 920, streak: 9, badge: "🥇" },
  { rank: 4, name: "Ananya D.", xp: 890, streak: 8, badge: "🥈" },
  { rank: 5, name: "Karthik N.", xp: 870, streak: 7, badge: "🥈" },
];

// ─── XP Bar Component ────────────────────────────────────────────────────────
function XPBar({ current, max, label, className = "" }: { current: number; max: number; label?: string; className?: string }) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-primary">{current}/{max} XP</span>
        </div>
      )}
      <div className="relative h-2.5 rounded-full bg-secondary overflow-hidden border border-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400 xp-bar-fill"
          style={{ "--xp-width": `${pct}%` } as React.CSSProperties}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      </div>
    </div>
  );
}

// ─── Section Cards (Level Select) ───────────────────────────────────────────
function SectionsView({ onSelect }: { onSelect: (s: SectionData) => void }) {
  const sectionThemes = [
    { gradient: "from-orange-500/15 to-amber-500/5", icon: "⚔️", subtitle: "Quantitative Arena" },
    { gradient: "from-blue-500/15 to-indigo-500/5", icon: "🧩", subtitle: "Logic Battleground" },
    { gradient: "from-emerald-500/15 to-teal-500/5", icon: "📜", subtitle: "Verbal Conquest" },
  ];

  const totalXP = 175; // Mock — would come from DB

  return (
    <motion.div {...fadeUp} className="space-y-8 md:space-y-10 game-grid-bg">
      {/* Hero */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full game-badge text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3 h-3" /> Practice Arena
          </div>
        </motion.div>
        <h1 className="text-2xl md:text-5xl font-black tracking-[-0.03em] text-foreground">
          Choose Your <span className="text-primary">Battle</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          10 questions · 15 minutes · Earn XP
        </p>

        {/* Player rank bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-[200px] md:max-w-xs mx-auto pt-1"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base md:text-xl">{getRank(totalXP).icon}</span>
            <span className="text-xs md:text-sm font-bold text-foreground">{getRank(totalXP).name}</span>
          </div>
          <XPBar current={totalXP} max={getRank(totalXP).next || totalXP} label="Rank Progress" />
        </motion.div>
      </div>

      {/* Section Cards — Game Style */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-5 max-w-4xl mx-auto">
        {practiceLabSections.map((section, i) => {
          const totalQ = section.chapters.reduce((sum, ch) => sum + ch.questions.length, 0);
          const available = section.chapters.filter(ch => ch.questions.length > 0).length;
          const theme = sectionThemes[i];
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: "backOut" }}
              className="flex"
            >
              <div
                className="game-card rounded-xl cursor-pointer flex flex-col w-full overflow-hidden"
                onClick={() => onSelect(section)}
              >
                <div className={`h-1 bg-gradient-to-r from-primary to-amber-400 opacity-60`} />
                
                <div className="p-4 md:p-7 flex flex-col flex-1 space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 md:block md:space-y-0">
                      <span className="text-2xl md:text-3xl">{theme.icon}</span>
                      <div className="md:hidden">
                        <h2 className="text-base font-bold text-foreground tracking-tight">{section.name}</h2>
                        <p className="text-[11px] text-muted-foreground">{theme.subtitle}</p>
                      </div>
                    </div>
                    {available > 0 ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <Swords className="w-3 h-3" /> Ready
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Locked</Badge>
                    )}
                  </div>
                  <div className="flex-1 hidden md:block">
                    <h2 className="text-lg font-bold text-foreground tracking-tight">{section.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{theme.subtitle}</p>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between text-[11px] md:text-xs text-muted-foreground">
                      <span>{available} missions</span>
                      <span className="font-semibold text-foreground">{totalQ} Qs</span>
                    </div>
                    <div className="h-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary/40" style={{ width: `${Math.min(100, available * 15)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leaderboard — Game Style */}
      <div className="max-w-2xl mx-auto space-y-3 md:space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <h2 className="text-base md:text-xl font-bold text-foreground tracking-tight">Arena Leaderboard</h2>
          <Badge variant="secondary" className="text-[10px] ml-auto">This Week</Badge>
        </div>
        <Card className="border overflow-hidden">
          <div className="divide-y divide-border">
            {leaderboardData.slice(0, 3).map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className={`flex items-center gap-3 px-3 py-2.5 md:px-6 md:py-4 transition-colors hover:bg-secondary/50 ${
                  entry.rank <= 3 ? "bg-primary/[0.03]" : ""
                }`}
              >
                <span className="text-lg md:text-xl w-6 md:w-8 text-center">{entry.badge}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-foreground truncate">{entry.name}</p>
                  <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
                    <Flame className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                    <span>{entry.streak}-day streak</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm font-bold text-primary">{entry.xp}</p>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
                </div>
              </motion.div>
            ))}
            {/* Show remaining on desktop */}
            {leaderboardData.slice(3).map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="hidden md:flex items-center gap-3 px-6 py-4 transition-colors hover:bg-secondary/50"
              >
                <span className="text-xl w-8 text-center">{entry.badge}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{entry.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3 text-primary" />
                    <span>{entry.streak}-day streak</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{entry.xp}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

// ─── Chapter Grid (Mission Select) ──────────────────────────────────────────
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
        <ArrowLeft className="w-4 h-4" /> Back to Arena
      </button>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xl md:text-2xl shrink-0">
          {section.icon}
        </div>
        <div>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">{section.name}</h2>
          <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
            <Target className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" /> Select a mission
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {section.chapters.map((ch, i) => {
          const hasQuestions = ch.questions.length > 0;
          const qCount = Math.min(ch.questions.length, QUIZ_QUESTION_COUNT);
          return (
            <motion.div
              key={ch.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
            >
              <div
                className={`game-card rounded-xl p-3.5 md:p-5 transition-all duration-200 ${
                  hasQuestions
                    ? "cursor-pointer"
                    : "opacity-40 cursor-not-allowed !shadow-none hover:!transform-none"
                }`}
                onClick={() => hasQuestions && onSelect(ch)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {hasQuestions ? (
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Swords className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{ch.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {hasQuestions ? (
                          <>
                            <span className="text-[10px] text-muted-foreground">{qCount} Qs · 15 min</span>
                            <span className="text-[10px] font-semibold text-primary">+{qCount * XP_PER_CORRECT} XP</span>
                          </>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">🔒 Coming soon</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {hasQuestions && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Quiz Phase (Battle Mode) ───────────────────────────────────────────────
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
  const [_streak] = useState(0);

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
  const isCritical = timeLeft <= 60;
  const answeredCount = questions.filter((qq) => answers[qq.id] !== undefined && answers[qq.id] !== null && answers[qq.id] !== "").length;
  const timeProgress = (timeLeft / QUIZ_DURATION) * 100;

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
      {/* HUD Bar */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[11px] md:text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Exit
        </button>
        <div className="flex items-center gap-2 md:gap-4">
          {answeredCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] md:text-xs font-bold">
              <Flame className={`w-3.5 h-3.5 md:w-4 md:h-4 ${answeredCount >= 3 ? "text-primary streak-glow" : "text-muted-foreground"}`} />
              <span className={answeredCount >= 3 ? "text-primary" : "text-muted-foreground"}>{answeredCount}</span>
            </div>
          )}
          <Badge variant="secondary" className="text-[9px] md:text-[10px] font-semibold hidden sm:inline-flex">{chapter.name}</Badge>
          <div className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full border text-xs md:text-sm font-mono font-bold transition-all
            ${isCritical 
              ? "border-destructive/50 bg-destructive/10 text-destructive animate-pulse" 
              : isLowTime 
                ? "border-primary/50 bg-primary/10 text-primary" 
                : "border-border text-foreground"}`}
          >
            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Timer progress bar */}
      <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden mb-5 border border-border/50">
        <motion.div
          className={`h-full rounded-full transition-colors duration-1000 ${
            isCritical ? "bg-destructive" : isLowTime ? "bg-primary" : "bg-gradient-to-r from-primary to-amber-400"
          }`}
          style={{ width: `${timeProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex gap-5">
        {/* Left Question Palette — HUD style */}
        <div className="hidden md:block w-52 shrink-0">
          <div className="game-card rounded-xl p-4 sticky top-24 space-y-4">
            {/* Mini scoreboard */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Mission</span>
              </div>
              <span className="text-[10px] font-mono text-primary font-bold">{answeredCount}/{questions.length}</span>
            </div>

            {/* Question grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((qq, i) => {
                const isAnswered = answers[qq.id] !== undefined && answers[qq.id] !== null && answers[qq.id] !== "";
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`relative w-8 h-8 rounded-lg text-[11px] font-bold transition-all duration-200 border
                      ${isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-md game-glow"
                        : isAnswered
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground/60 hover:bg-secondary"
                      }`}
                  >
                    {i + 1}
                    {isAnswered && !isCurrent && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="w-3.5 h-3.5 rounded bg-primary/15 border border-primary/40 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </span>
                Answered
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="w-3.5 h-3.5 rounded border border-border" />
                Unanswered
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="w-3.5 h-3.5 rounded bg-primary border border-primary game-glow" />
                Current
              </div>
            </div>

            {/* XP preview */}
            <div className="pt-2 border-t border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Zap className="w-3 h-3 text-primary" />
                <span>Potential XP: <strong className="text-primary">{questions.length * XP_PER_CORRECT}</strong></span>
              </div>
            </div>

            <Button onClick={handleSubmit} size="sm" className="w-full font-bold gap-1.5 game-glow-pulse">
              <Swords className="w-3.5 h-3.5" /> Finish Battle
            </Button>
          </div>
        </div>

        {/* Main question area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="p-4 md:p-8 border space-y-4 md:space-y-6 relative overflow-hidden">
                {/* Question number badge */}
                <div className="absolute top-0 right-0">
                  <div className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-bl-lg">
                    Q{currentIndex + 1}/{questions.length}
                  </div>
                </div>

                <div className="flex items-start gap-2 md:gap-3 pt-1 md:pt-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-[11px] md:text-xs font-bold text-primary">{currentIndex + 1}</span>
                  </div>
                  <p className="text-sm md:text-lg font-medium text-foreground leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {q.type === "mcq" ? (
                  <RadioGroup
                    value={answers[q.id] !== undefined && answers[q.id] !== null ? String(answers[q.id]) : ""}
                    onValueChange={(v) => handleSelect(Number(v))}
                    className="space-y-2 md:space-y-2.5"
                  >
                    {q.options.map((opt, idx) => {
                      const optLabels = ["A", "B", "C", "D"];
                      return (
                        <Label
                          key={idx}
                          htmlFor={`opt-${q.id}-${idx}`}
                          className={`flex items-center gap-2.5 md:gap-3 p-3 md:p-4 rounded-xl border cursor-pointer transition-all duration-200
                            ${answers[q.id] === idx
                              ? "border-primary bg-primary/5 shadow-sm game-glow"
                              : "border-border hover:border-muted-foreground/30 hover:bg-secondary/50"
                            }`}
                        >
                          <div className={`w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-[11px] md:text-xs font-bold shrink-0 transition-colors
                            ${answers[q.id] === idx
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground border border-border"
                            }`}
                          >
                            {optLabels[idx]}
                          </div>
                          <RadioGroupItem value={String(idx)} id={`opt-${q.id}-${idx}`} className="sr-only" />
                          <span className="text-sm text-foreground">{opt}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`numeric-${q.id}`} className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> Enter your answer (number only)
                    </Label>
                    <Input
                      id={`numeric-${q.id}`}
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 48"
                      value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^[-\d.:/ ]*$/.test(val)) {
                          handleNumericChange(val);
                        }
                      }}
                      className="text-base font-mono"
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
              ← Previous
            </Button>

            {isLast ? (
              <Button onClick={handleSubmit} className="px-6 gap-1.5 font-bold game-glow-pulse">
                <Swords className="w-4 h-4" /> Finish Battle
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                Next →
              </Button>
            )}
          </div>

          {/* Mobile question pills — compact scrollable strip */}
          <div className="flex gap-1.5 justify-center flex-wrap pt-1 pb-2 md:hidden">
            {questions.map((qq, i) => {
              const isAnswered = answers[qq.id] !== undefined && answers[qq.id] !== null && answers[qq.id] !== "";
              return (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`relative w-8 h-8 rounded-lg text-[11px] font-bold transition-all border
                    ${i === currentIndex
                      ? "border-primary bg-primary text-primary-foreground game-glow"
                      : isAnswered
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                >
                  {i + 1}
                </button>
              );
            })}
            {/* Mobile submit */}
            <Button onClick={handleSubmit} size="sm" className="w-full mt-2 font-bold gap-1.5 game-glow-pulse md:hidden">
              <Swords className="w-3.5 h-3.5" /> Finish Battle
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Results (Victory / Defeat Screen) ──────────────────────────────────────
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
        const userStr = String(a).trim().toLowerCase();
        const correctStr = (q.numericAnswer || "").trim().toLowerCase();
        if (correctStr && userStr === correctStr) correct++;
        else incorrect++;
      }
    });
    return { correct, incorrect, unanswered };
  }, [questions, answers]);

  const pct = Math.round((correct / questions.length) * 100);
  const xpEarned = correct * XP_PER_CORRECT + (timeUsed < 600 ? XP_PER_SPEED_BONUS * correct : 0);
  const isVictory = pct >= 60;
  const isPerfect = pct === 100;
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
  const [showReview, setShowReview] = useState(false);

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
  const improvement = pastAttempts.length >= 2 ? pastAttempts[0].score_pct - pastAttempts[pastAttempts.length - 1].score_pct : 0;

  return (
    <motion.div {...fadeUp} className="max-w-2xl mx-auto space-y-5 md:space-y-8">
      {/* Victory/Defeat Card */}
      <Card className="p-5 md:p-10 border text-center space-y-4 md:space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-amber-500/5" />
        {isPerfect && <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1)_0%,transparent_70%)]" />}
        
        <div className="relative z-10 space-y-3 md:space-y-5">
          {/* Stars */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            className="flex items-center justify-center gap-1.5 md:gap-2"
          >
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: s <= stars ? 1 : 0.6, rotate: 0 }}
                transition={{ delay: 0.3 + s * 0.15, duration: 0.4, ease: "backOut" }}
              >
                <Star
                  className={`w-8 h-8 md:w-12 md:h-12 ${
                    s <= stars
                      ? "text-amber-400 fill-amber-400 drop-shadow-lg"
                      : "text-border"
                  }`}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Victory/Defeat text */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
              style={{
                background: isVictory
                  ? "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(45 100% 50% / 0.1))"
                  : "hsl(var(--secondary))",
                color: isVictory ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              }}
            >
              {isPerfect ? <Crown className="w-3.5 h-3.5" /> : isVictory ? <Trophy className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
              {isPerfect ? "FLAWLESS VICTORY" : isVictory ? "MISSION COMPLETE" : "DEFEATED"}
            </div>
          </motion.div>

          {/* Score */}
          <div className="score-pop">
            <div className="text-5xl md:text-8xl font-black text-foreground tracking-tighter">
              {pct}<span className="text-2xl md:text-4xl text-muted-foreground">%</span>
            </div>
          </div>

          {/* XP Earned */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full game-badge text-sm font-bold">
              <Zap className="w-4 h-4" /> +{xpEarned} XP Earned
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-4 md:gap-6 pt-1 md:pt-2">
            <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
              <span className="text-foreground font-bold">{correct}</span>
              <span className="text-muted-foreground text-[10px] md:text-xs">correct</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
              <XCircle className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
              <span className="text-foreground font-bold">{incorrect}</span>
              <span className="text-muted-foreground text-[10px] md:text-xs">wrong</span>
            </div>
            <div className="flex items-center gap-1 md:gap-1.5 text-xs md:text-sm">
              <MinusCircle className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span className="text-foreground font-bold">{unanswered}</span>
              <span className="text-muted-foreground text-[10px] md:text-xs">skipped</span>
            </div>
          </div>

          {timeUsed > 0 && (
            <p className="text-[11px] md:text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {formatTime(timeUsed)}
              {timeUsed < 600 && <span className="text-primary font-semibold ml-1">⚡ Speed Bonus!</span>}
            </p>
          )}
        </div>
      </Card>

      {/* Analytics Card */}
      {pastAttempts.length > 1 && (
        <Card className="p-5 border space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Battle History</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="game-card rounded-xl p-3">
              <div className="text-xl font-black text-primary">{bestScore}%</div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Best</p>
            </div>
            <div className="game-card rounded-xl p-3">
              <div className="text-xl font-black text-foreground">{avgScore}%</div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Average</p>
            </div>
            <div className="game-card rounded-xl p-3">
              <div className={`text-xl font-black flex items-center justify-center gap-1 ${improvement > 0 ? "text-emerald-500" : improvement < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {improvement > 0 && <TrendingUp className="w-4 h-4" />}
                {improvement > 0 ? "+" : ""}{improvement}%
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Trend</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Recent Battles</p>
            {pastAttempts.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
                <span className="text-muted-foreground">{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{formatTime(a.time_used_seconds)}</span>
                  <span className={`font-bold ${a.score_pct >= 70 ? "text-emerald-500" : a.score_pct >= 40 ? "text-primary" : "text-destructive"}`}>
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
        <Button onClick={onRetry} className="gap-2 font-bold game-glow-pulse">
          <RotateCcw className="w-4 h-4" /> Battle Again
        </Button>
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Missions
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowReview((v) => !v)}
          className="gap-2"
        >
          <BookOpen className="w-4 h-4" /> {showReview ? "Hide Review" : "Review Answers"}
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
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSkipped ? "bg-secondary" : isCorrect ? "bg-emerald-500/15" : "bg-destructive/15"
                    }`}>
                      {isSkipped ? (
                        <MinusCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium text-foreground">Q{i + 1}. {q.question}</p>

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

  const pendingChapter = useRef<Chapter | null>(null);

  const handleSelectSection = useCallback((s: SectionData) => {
    setSelectedSection(s);
    setPhase("chapters");
  }, []);

  useEffect(() => {
    if (!pendingChapter.current) return;
    if (authLoading || phoneLoading) return;
    if (!isAuthenticated) return;
    if (!hasPhone) {
      setPhoneModalOpen(true);
      return;
    }
    const ch = pendingChapter.current;
    pendingChapter.current = null;
    setSelectedChapter(ch);
    setQuizQuestions(pickRandom(ch.questions, QUIZ_QUESTION_COUNT));
    setQuizAnswers({});
    setQuizTimeUsed(0);
    setPhase("quiz");
  }, [authLoading, phoneLoading, isAuthenticated, hasPhone]);

  const handleSelectChapter = useCallback((ch: Chapter) => {
    if (!isAuthenticated) {
      pendingChapter.current = ch;
      signIn(window.location.pathname);
      return;
    }
    if (!hasPhone) {
      pendingChapter.current = ch;
      setPhoneModalOpen(true);
      return;
    }
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
      <main className="min-h-screen bg-background pt-4 pb-12 px-3 md:pt-6 md:pb-16 md:px-6 game-grid-bg">
        <div className="max-w-5xl mx-auto py-6 md:py-16">
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
