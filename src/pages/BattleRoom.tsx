import { useState, useEffect, useCallback, useRef } from "react";
import { pickGroupedRandom } from "@/lib/pickGroupedQuestions";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Copy, Share2, Users, Swords, Crown, Shield, Target, Trophy, BookOpen, CheckCircle2, XCircle, MinusCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { PracticeQuestion } from "@/data/practiceLabQuestions";
import { practiceLabSections } from "@/data/practiceLabQuestions";
import ShareableResultCard from "@/components/ShareableResultCard";
import WorkshopRecommendation, { getWorkshopRecommendations } from "@/components/WorkshopRecommendation";

const QUIZ_DURATION = 900;
const QUIZ_QUESTION_COUNT = 10;

// pickRandom kept for non-question use
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
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
  transition: { duration: 0.35 },
};

interface BattleRoom {
  id: string;
  code: string;
  host_user_id: string;
  section_id: string;
  chapter_slug: string;
  questions_json: PracticeQuestion[];
  status: string;
  max_players: number;
  started_at: string | null;
}

interface BattlePlayer {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  answers_json: Record<number, number | string | null> | null;
  score_pct: number;
  correct: number;
  time_used_seconds: number;
  finished_at: string | null;
  joined_at: string;
}

// ─── Lobby ──────────────────────────────────────────────────────────────────
function BattleLobby({
  room,
  players,
  isHost,
  onStart,
}: {
  room: BattleRoom;
  players: BattlePlayer[];
  isHost: boolean;
  onStart: () => void;
}) {
  const shareUrl = `${window.location.origin}/practice-lab/battle/${room.code}`;
  const canStart = players.length >= 3;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied!", description: "Share it with your friends." });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Battle Quiz Challenge!", text: `Join my quiz battle! Code: ${room.code}`, url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  const playerColors = ["text-amber-400", "text-cyan-400", "text-emerald-400", "text-purple-400", "text-rose-400"];

  return (
    <motion.div {...fadeUp} className="max-w-lg mx-auto space-y-6 text-center">
      <div className="space-y-2">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ ease: "backOut" }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full game-badge text-[10px] md:text-xs font-bold uppercase tracking-wider">
            <Swords className="w-3 h-3" /> Battle Arena
          </div>
        </motion.div>
        <h1 className="text-2xl md:text-4xl font-black text-foreground">
          Waiting for <span className="text-primary">Warriors</span>
        </h1>
        <p className="text-sm text-muted-foreground">{room.chapter_slug.replace(/-/g, " ")} · {(room.questions_json as any[]).length} questions</p>
      </div>

      {/* Room Code */}
      <Card className="p-5 border space-y-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Room Code</p>
          <p className="text-3xl md:text-4xl font-black tracking-[0.2em] text-primary font-mono">{room.code}</p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </Button>
          <Button size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
        </div>
      </Card>

      {/* Players */}
      <Card className="p-5 border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Warriors</span>
          </div>
          <Badge variant="secondary" className="text-[10px]">{players.length}/{room.max_players}</Badge>
        </div>

        <div className="space-y-2">
          {players.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50"
            >
              <div className={`w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold ${playerColors[i] || "text-foreground"}`}>
                {p.display_name?.[0]?.toUpperCase() || "?"}
              </div>
              <span className="text-sm font-semibold text-foreground flex-1 text-left truncate">{p.display_name || "Anonymous"}</span>
              {p.user_id === room.host_user_id && (
                <Badge variant="outline" className="text-[9px]">
                  <Crown className="w-2.5 h-2.5 mr-0.5" /> Host
                </Badge>
              )}
            </motion.div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: room.max_players - players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-3 p-2.5 rounded-lg border border-dashed border-border">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground italic">Waiting...</span>
            </div>
          ))}
        </div>
      </Card>

      {isHost ? (
        <Button onClick={onStart} disabled={!canStart} className="w-full gap-2 font-bold game-glow-pulse" size="lg">
          <Swords className="w-4 h-4" /> {canStart ? "Start Battle!" : `Need ${3 - players.length} more player${3 - players.length === 1 ? "" : "s"}`}
        </Button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Waiting for host to start...
        </div>
      )}
    </motion.div>
  );
}

// ─── Battle Quiz ────────────────────────────────────────────────────────────
function BattleQuiz({
  questions,
  onFinish,
}: {
  questions: PracticeQuestion[];
  onFinish: (answers: Record<number, number | string | null>, timeUsed: number) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string | null>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);

  useEffect(() => {
    if (timeLeft <= 0) { onFinish(answers, QUIZ_DURATION); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isLowTime = timeLeft <= 120;
  const isCritical = timeLeft <= 60;
  const answeredCount = questions.filter(qq => answers[qq.id] !== undefined && answers[qq.id] !== null && answers[qq.id] !== "").length;
  const timeProgress = (timeLeft / QUIZ_DURATION) * 100;

  const handleSubmit = () => onFinish(answers, QUIZ_DURATION - timeLeft);

  return (
    <motion.div {...fadeUp} className="max-w-3xl mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[9px] font-semibold">
            <Swords className="w-2.5 h-2.5 mr-1" /> Battle Mode
          </Badge>
          <span className="text-[11px] text-muted-foreground">{answeredCount}/{questions.length}</span>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-mono font-bold transition-all
          ${isCritical ? "border-destructive/50 bg-destructive/10 text-destructive animate-pulse"
            : isLowTime ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border text-foreground"}`}>
          <Clock className="w-3 h-3" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Timer bar */}
      <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden mb-5 border border-border/50">
        <motion.div
          className={`h-full rounded-full ${isCritical ? "bg-destructive" : isLowTime ? "bg-primary" : "bg-gradient-to-r from-primary to-amber-400"}`}
          style={{ width: `${timeProgress}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
          {/* Group context */}
          {q.group_context && (
            <Card className="p-4 md:p-6 border border-primary/20 bg-primary/[0.02] mb-3">
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-2">📖 Passage / Set</p>
              {q.group_context && (
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {q.group_context}
                </div>
              )}
            </Card>
          )}

          <Card className="p-4 md:p-8 border space-y-4 md:space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <div className="bg-primary/10 text-primary text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                Q{currentIndex + 1}/{questions.length}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-primary">{currentIndex + 1}</span>
              </div>
              <p className="text-sm md:text-lg font-medium text-foreground leading-relaxed whitespace-pre-line">{q.question}</p>
            </div>

            {q.type === "mcq" ? (
              <RadioGroup
                value={answers[q.id] !== undefined && answers[q.id] !== null ? String(answers[q.id]) : ""}
                onValueChange={v => setAnswers(prev => ({ ...prev, [q.id]: Number(v) }))}
                className="space-y-2"
              >
                {q.options.map((opt, idx) => {
                  const labels = ["A", "B", "C", "D"];
                  return (
                    <Label key={idx} htmlFor={`b-opt-${q.id}-${idx}`}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all
                        ${answers[q.id] === idx ? "border-primary bg-primary/5 shadow-sm game-glow" : "border-border hover:border-muted-foreground/30 hover:bg-secondary/50"}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0
                        ${answers[q.id] === idx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"}`}>
                        {labels[idx]}
                      </div>
                      <RadioGroupItem value={String(idx)} id={`b-opt-${q.id}-${idx}`} className="sr-only" />
                      <span className="text-sm text-foreground">{opt}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Enter your answer
                </Label>
                <Input
                  type="text" inputMode="decimal" placeholder="e.g. 48"
                  value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                  onChange={e => { const v = e.target.value; if (v === "" || /^[-\d.:/ ]*$/.test(v)) setAnswers(prev => ({ ...prev, [q.id]: v })); }}
                  className="text-base font-mono" autoComplete="off"
                />
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" size="sm" disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i - 1)}>← Previous</Button>
        {isLast ? (
          <Button onClick={handleSubmit} className="px-6 gap-1.5 font-bold game-glow-pulse">
            <Swords className="w-4 h-4" /> Finish Battle
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setCurrentIndex(i => i + 1)}>Next →</Button>
        )}
      </div>

      {/* Mobile pills */}
      <div className="flex gap-1.5 justify-center flex-wrap pt-3 md:hidden">
        {questions.map((qq, i) => {
          const isAnswered = answers[qq.id] !== undefined && answers[qq.id] !== null && answers[qq.id] !== "";
          return (
            <button key={i} onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-[11px] font-bold border
                ${i === currentIndex ? "border-primary bg-primary text-primary-foreground game-glow"
                  : isAnswered ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
              {i + 1}
            </button>
          );
        })}
        <Button onClick={handleSubmit} size="sm" className="w-full mt-2 font-bold gap-1.5 game-glow-pulse md:hidden">
          <Swords className="w-3.5 h-3.5" /> Finish Battle
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Waiting Overlay ────────────────────────────────────────────────────────
function WaitingOverlay({ finishedCount, totalCount }: { finishedCount: number; totalCount: number }) {
  return (
    <motion.div {...fadeUp} className="max-w-md mx-auto text-center space-y-4 py-16">
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Battle in Progress</h2>
      <p className="text-sm text-muted-foreground">{finishedCount}/{totalCount} warriors have finished</p>
      <p className="text-xs text-muted-foreground">Waiting for everyone to complete...</p>
    </motion.div>
  );
}

// ─── Battle Results ─────────────────────────────────────────────────────────

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
  if (pct >= 0.9) return `Scoring ${correct}+ here correlates with 99+ percentile in CAT.`;
  if (pct >= 0.7) return `Scoring ${correct}+ here correlates with 90+ percentile in CAT.`;
  if (pct >= 0.5) return `Scoring ${correct}+ here correlates with 80+ percentile in CAT.`;
  return `Focus on weak areas to boost your CAT percentile significantly.`;
}

function getDifficultyLabel(correct: number, total: number): { label: string; color: string } {
  const pct = correct / total;
  if (pct >= 0.8) return { label: "Easy", color: "text-emerald-500" };
  if (pct >= 0.5) return { label: "Medium", color: "text-amber-500" };
  return { label: "Hard", color: "text-destructive" };
}

function formatTimeLong(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function BattleResults({
  players,
  questions,
  currentUserId,
  sectionId,
  chapterSlug,
  onPlayAgain,
  onExit,
}: {
  players: BattlePlayer[];
  questions: PracticeQuestion[];
  currentUserId: string;
  sectionId: string;
  chapterSlug: string;
  onPlayAgain?: () => void;
  onExit: () => void;
}) {
  const ranked = [...players].sort((a, b) => b.score_pct - a.score_pct || a.time_used_seconds - b.time_used_seconds);
  const medalIcons = ["👑", "🥈", "🥉"];
  const myRank = ranked.findIndex(p => p.user_id === currentUserId);
  const myPlayer = ranked.find(p => p.user_id === currentUserId);
  const myAnswers = (myPlayer?.answers_json || {}) as Record<number, number | string | null>;
  const [showReview, setShowReview] = useState(false);

  // Compute analytics
  const correct = myPlayer?.correct ?? 0;
  const total = questions.length;
  const pct = myPlayer?.score_pct ?? 0;
  const timeUsed = myPlayer?.time_used_seconds ?? 0;
  const incorrect = questions.filter(q => {
    const a = myAnswers[q.id];
    return a !== undefined && a !== null && a !== "" && a !== q.correctAnswer;
  }).length;
  const unanswered = total - correct - incorrect;
  const percentile = estimatePercentile(correct, total);
  const totalStudents = 1327;
  const rank = estimateRank(percentile, totalStudents);
  const avgTimePerQ = total > 0 ? Math.round(timeUsed / total) : 0;
  const difficulty = getDifficultyLabel(correct, total);

  return (
    <motion.div {...fadeUp} className="max-w-2xl mx-auto px-1 space-y-4">
      {/* ─── 1. Hero Card with Score + Percentile ─── */}
      <Card className="p-4 md:p-6 border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-amber-500/3" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-foreground text-sm md:text-base">Battle Completed</span>
            {myRank === 0 && <Badge className="ml-auto text-[9px] bg-amber-500/15 text-amber-500 border-amber-500/30">🎉 Winner!</Badge>}
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
              <div className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Est. Percentile</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] md:text-xs text-muted-foreground">Time Taken</div>
              <div className="text-lg md:text-2xl font-black text-foreground leading-tight">{formatTimeLong(timeUsed)}</div>
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
            <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-muted-foreground">
              <span>Rank: <span className="font-bold text-foreground">#{rank}</span></span>
              <span className="text-muted-foreground/40">·</span>
              <span>{totalStudents.toLocaleString()} students</span>
            </div>
          </div>

          <div className="text-center text-[10px] md:text-xs text-muted-foreground border-t border-border/50 pt-3">
            {getInsightText(correct, total)}
          </div>
        </div>
      </Card>

      {/* ─── 2. Battle Leaderboard ─── */}
      <Card className="p-3 md:p-5 border space-y-2 md:space-y-3">
        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
          <Crown className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          <span className="text-xs md:text-sm font-bold text-foreground">Battle Leaderboard</span>
        </div>
        {ranked.map((p, i) => {
          const isMe = p.user_id === currentUserId;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl border transition-all ${isMe ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <span className="text-lg md:text-xl w-6 md:w-8 text-center">{medalIcons[i] || `#${i + 1}`}</span>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                  {p.display_name || "Anonymous"} {isMe && <span className="text-primary">(You)</span>}
                </p>
                <p className="text-[9px] md:text-[10px] text-muted-foreground flex items-center gap-0.5 md:gap-1">
                  <Clock className="w-2 h-2 md:w-2.5 md:h-2.5" /> {formatTime(p.time_used_seconds)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base md:text-lg font-black text-foreground">{p.score_pct}%</p>
                <p className="text-[9px] md:text-[10px] text-muted-foreground">{p.correct}/{questions.length}</p>
              </div>
            </motion.div>
          );
        })}
      </Card>

      {/* ─── 3. Performance Breakdown ─── */}
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
              <div className="text-lg md:text-xl font-black text-foreground leading-tight">{formatTimeLong(avgTimePerQ)}</div>
              <div className="border-t border-border/50 pt-1 mt-1">
                <span className="text-[10px] md:text-xs text-muted-foreground">Total: </span>
                <span className="text-[10px] md:text-xs font-bold text-primary">{formatTimeLong(timeUsed)}</span>
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
                <span className="text-muted-foreground">Your Rank</span>
                <span className="font-black text-foreground">#{myRank + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Players</span>
                <span className="font-bold text-foreground">{players.length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Shareable Card */}
      <ShareableResultCard
        correct={correct}
        total={questions.length}
        leaderboard={ranked.map(p => ({
          name: p.display_name || "Anonymous",
          score: p.score_pct,
          isMe: p.user_id === currentUserId,
        }))}
      />

      {/* Workshop Recommendation */}
      {incorrect > 0 && (
        <WorkshopRecommendation
          workshops={getWorkshopRecommendations(sectionId, chapterSlug)}
          title="Strengthen Your Weak Spot"
          subtitle="Based on your battle performance, this workshop can help:"
        />
      )}

      <div className="flex flex-col gap-2 md:flex-row md:gap-3 md:justify-center">
        {onPlayAgain && (
          <Button onClick={onPlayAgain} className="gap-2 font-bold game-glow-pulse w-full md:w-auto" size="sm">
            <Swords className="w-3.5 h-3.5" /> Play Again
          </Button>
        )}
        <Button variant="outline" onClick={onExit} className="gap-2 w-full md:w-auto" size="sm">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Practice Lab
        </Button>
      </div>

      {/* Review Answers Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => setShowReview(v => !v)}
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
            className="space-y-3 overflow-hidden text-left"
          >
            {questions.map((q, i) => {
              const userAnswer = myAnswers[q.id];
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
                      <p className="text-xs md:text-sm font-medium text-foreground whitespace-pre-line">Q{i + 1}. {q.question}</p>
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

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function BattleRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, signIn } = useAuth();
  const { hasPhone, loading: phoneLoading, refetch: refetchPhone } = useLeadPhone();
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  const [room, setRoom] = useState<BattleRoom | null>(null);
  const [players, setPlayers] = useState<BattlePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [myFinished, setMyFinished] = useState(false);
  const joinedRef = useRef(false);

  // Redirect to sign in if not authenticated, then ask for phone
  useEffect(() => {
    if (authLoading || phoneLoading) return;
    if (!isAuthenticated) {
      signIn(`/practice-lab/battle/${code}`);
      return;
    }
    if (!hasPhone) {
      setPhoneModalOpen(true);
    }
  }, [authLoading, phoneLoading, isAuthenticated, hasPhone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch room + join
  useEffect(() => {
    if (!isAuthenticated || !user || !code) return;

    const fetchAndJoin = async () => {
      // Fetch room
      const { data: roomData, error: roomErr } = await (supabase.from("battle_rooms") as any)
        .select("*")
        .eq("code", code.toUpperCase())
        .single();

      if (roomErr || !roomData) {
        setError("Battle room not found. Check the code and try again.");
        setLoading(false);
        return;
      }
      setRoom(roomData);

      // Fetch existing players
      const { data: playersData } = await (supabase.from("battle_players") as any)
        .select("*")
        .eq("room_id", roomData.id)
        .order("joined_at", { ascending: true });

      setPlayers(playersData || []);

      // Auto-join if not already in
      const alreadyJoined = (playersData || []).some((p: BattlePlayer) => p.user_id === user.id);
      if (!alreadyJoined && roomData.status === "waiting" && (playersData || []).length < roomData.max_players && !joinedRef.current) {
        joinedRef.current = true;
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Player";
        await (supabase.from("battle_players") as any).insert({
          room_id: roomData.id,
          user_id: user.id,
          display_name: displayName,
        });
      }

      // Check if I already finished
      const me = (playersData || []).find((p: BattlePlayer) => p.user_id === user.id);
      if (me?.finished_at) setMyFinished(true);

      setLoading(false);
    };

    fetchAndJoin();
  }, [isAuthenticated, user, code]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscriptions
  useEffect(() => {
    if (!room?.id) return;

    const roomChannel = supabase
      .channel(`battle-room-${room.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "battle_rooms", filter: `id=eq.${room.id}` },
        (payload: any) => {
          console.log("[Battle] Room update:", payload.new?.status);
          if (payload.new) setRoom(payload.new as BattleRoom);
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "battle_players", filter: `room_id=eq.${room.id}` },
        async (payload: any) => {
          console.log("[Battle] Players change:", payload.eventType);
          const { data } = await (supabase.from("battle_players") as any)
            .select("*").eq("room_id", room.id).order("joined_at", { ascending: true });
          if (data) setPlayers(data);
        })
      .on("broadcast", { event: "countdown" }, (payload: any) => {
        if (payload.payload?.value !== undefined) {
          setCountdown(payload.payload.value);
        }
      })
      .subscribe((status: string, err: any) => {
        console.log("[Battle] Channel status:", status, err);
      });

    return () => { supabase.removeChannel(roomChannel); };
  }, [room?.id]);

  // Host starts battle — trigger countdown
  const handleStart = useCallback(async () => {
    if (!room) return;
    setCountdown(3);
  }, [room]);

  // Countdown effect — host broadcasts each tick to all players
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= -1) {
      // Countdown finished, actually start the battle
      setCountdown(null);
      if (room) {
        // Optimistically update local state so quiz renders immediately
        setRoom(prev => prev ? { ...prev, status: "active", started_at: new Date().toISOString() } : prev);
        // Then persist to DB (triggers realtime for other players)
        (async () => {
          const { error } = await (supabase.from("battle_rooms") as any)
            .update({ status: "active", started_at: new Date().toISOString() })
            .eq("id", room.id);
          if (error) console.error("[Battle] Failed to start:", error);
        })();
      }
      return;
    }
    // Host broadcasts countdown to other players
    if (user?.id === room?.host_user_id && room) {
      supabase.channel(`battle-room-${room.id}`).send({
        type: "broadcast",
        event: "countdown",
        payload: { value: countdown },
      });
    }
    const timer = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(timer);
  }, [countdown, room, user]);

  // Player finishes quiz
  const handleFinishQuiz = useCallback(async (answers: Record<number, number | string | null>, timeUsed: number) => {
    if (!room || !user) return;
    const questions = room.questions_json as PracticeQuestion[];

    let correct = 0;
    questions.forEach(q => {
      const a = answers[q.id];
      if (a === undefined || a === null || a === "") return;
      if (a === q.correctAnswer) correct++;
    });

    const pct = Math.round((correct / questions.length) * 100);

    await (supabase.from("battle_players") as any)
      .update({
        answers_json: answers,
        score_pct: pct,
        correct,
        time_used_seconds: timeUsed,
        finished_at: new Date().toISOString(),
      })
      .eq("room_id", room.id)
      .eq("user_id", user.id);

    setMyFinished(true);

    // Check if all players finished
    const { data: allPlayers } = await (supabase.from("battle_players") as any)
      .select("finished_at").eq("room_id", room.id);
    
    if (allPlayers && allPlayers.every((p: any) => p.finished_at)) {
      // I'm the last one — mark room finished (only host can update, so try)
      await (supabase.from("battle_rooms") as any)
        .update({ status: "finished" })
        .eq("id", room.id);
    }
  }, [room, user]);

  const handlePlayAgain = useCallback(async () => {
    if (!room || !user) return;
    // Find the chapter's questions from the sections data
    const section = practiceLabSections.find(s => s.id === room.section_id);
    const chapter = section?.chapters.find(ch => ch.slug === room.chapter_slug);
    if (!chapter || chapter.questions.length === 0) return;

    const questions = pickGroupedRandom(chapter.questions, QUIZ_QUESTION_COUNT);
    const newCode = generateCode();
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Host";

    const { data: newRoom, error: err } = await (supabase.from("battle_rooms") as any).insert({
      code: newCode,
      host_user_id: user.id,
      section_id: room.section_id,
      chapter_slug: room.chapter_slug,
      questions_json: questions,
    }).select("id").single();

    if (err || !newRoom) return;

    await (supabase.from("battle_players") as any).insert({
      room_id: newRoom.id,
      user_id: user.id,
      display_name: displayName,
    });

    navigate(`/practice-lab/battle/${newCode}`);
  }, [room, user, navigate]);

  const handleExit = () => navigate("/practice-lab");

  // Loading / Error states
  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex items-center justify-center game-grid-bg">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    );
  }

  if (error || !room) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 game-grid-bg px-4">
          <Shield className="w-12 h-12 text-muted-foreground" />
          <h1 className="text-xl font-bold text-foreground">{error || "Room not found"}</h1>
          <Button onClick={handleExit} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Practice Lab
          </Button>
        </main>
      </>
    );
  }

  const isHost = user?.id === room.host_user_id;
  const questions = room.questions_json as PracticeQuestion[];
  const finishedCount = players.filter(p => p.finished_at).length;

  return (
    <>
      <SEO title={`Battle Quiz — ${room.code} | Percentilers`} description="Multiplayer battle quiz" canonical={`https://percentiler-elevate.lovable.app/practice-lab/battle/${room.code}`} />
      <Navbar />
      <main className="min-h-screen bg-background pt-4 pb-12 px-3 md:pt-6 md:pb-16 md:px-6 game-grid-bg">
        <div className="max-w-5xl mx-auto py-6 md:py-16">
          <AnimatePresence mode="wait">
            {/* Countdown overlay */}
            {countdown !== null && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "backOut" }}
                    className="text-center"
                  >
                    {countdown > 0 ? (
                      <span className="text-8xl md:text-[12rem] font-black text-primary drop-shadow-lg">{countdown}</span>
                    ) : (
                      <span className="text-6xl md:text-9xl font-black text-primary tracking-tight">GO!</span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {room.status === "waiting" && countdown === null && (
              <BattleLobby key="lobby" room={room} players={players} isHost={isHost} onStart={handleStart} />
            )}
            {room.status === "active" && !myFinished && (
              <BattleQuiz key="quiz" questions={questions} onFinish={handleFinishQuiz} />
            )}
            {room.status === "active" && myFinished && (
              <WaitingOverlay key="waiting" finishedCount={finishedCount} totalCount={players.length} />
            )}
            {room.status === "finished" && (
              <BattleResults
                key="results"
                players={players}
                questions={questions}
                currentUserId={user?.id || ""}
                sectionId={room.section_id}
                chapterSlug={room.chapter_slug}
                onPlayAgain={handlePlayAgain}
                onExit={handleExit}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <PhoneCaptureModal
        open={phoneModalOpen}
        onOpenChange={setPhoneModalOpen}
        source="battle-room"
        onSuccess={() => {
          refetchPhone();
          setPhoneModalOpen(false);
        }}
        title="One Last Step Before Battle"
        description="Share your phone number so we can track your progress."
      />
    </>
  );
}
