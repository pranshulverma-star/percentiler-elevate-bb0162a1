import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight, Calculator, PuzzleIcon, FileText, RefreshCw,
  Target, CalendarDays, BookOpen, ChevronLeft, ChevronRight,
  AlertTriangle, Zap, MonitorPlay, CheckCircle2, Phone, Play,
  Flame, TrendingUp,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  generateFullPlan,
  getDaysUntilCAT,
  type DailyTask,
  type PlanConfig,
} from "@/lib/masterCurriculum";
import {
  logActivity,
  recalculateHeatScore,
  fetchHeatScore,
  getInactiveDays,
  type HeatScoreData,
} from "@/lib/heatScoring";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const PHASE_COLORS: Record<string, string> = {
  "Foundation Phase": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Strength Phase": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Mock Phase": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

// ─── Lead Capture ───

interface LeadData {
  phone: string;
  name: string;
  targetYear: number;
  prepLevel: string;
  startDate: string;
}

function LeadCapture({ onComplete }: { onComplete: (data: LeadData) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [prepLevel, setPrepLevel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Name is required");
    if (!/^\d{10}$/.test(phone)) return setError("Enter a valid 10-digit phone number");
    if (!targetYear) return setError("Select your target CAT year");
    if (!currentStatus) return setError("Select your current status");
    if (!prepLevel) return setError("Select your prep level");
    setError("");
    setSubmitting(true);

    try {
      const { data: existing } = await supabase
        .from("leads")
        .select("phone_number")
        .eq("phone_number", phone)
        .maybeSingle();

      if (!existing) {
        await supabase.from("leads").insert({
          name,
          phone_number: phone,
          source: "planner",
          target_year: targetYear,
          prep_level: prepLevel,
          current_status: currentStatus,
          target_percentile: 99,
        });
      }

      const today = new Date().toISOString().split("T")[0];

      const { data: existingStats } = await supabase
        .from("planner_stats")
        .select("phone_number, start_date")
        .eq("phone_number", phone)
        .maybeSingle();

      const daysLeft = getDaysUntilCAT(parseInt(targetYear));
      const isCrash = daysLeft <= 50;

      if (!existingStats) {
        await supabase.from("planner_stats").insert({
          phone_number: phone,
          start_date: today,
          target_year: parseInt(targetYear),
          crash_mode: isCrash,
          current_phase: isCrash ? "Mock Phase" : "Foundation Phase",
          last_generated_index: 0,
        });
      }

      const startDate = existingStats?.start_date || today;

      localStorage.setItem("planner_phone", phone);
      localStorage.setItem("planner_name", name);
      localStorage.setItem("planner_year", targetYear);
      localStorage.setItem("planner_prep_level", prepLevel);
      localStorage.setItem("planner_start_date", startDate);

      onComplete({ phone, name, targetYear: parseInt(targetYear), prepLevel, startDate });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-[85vh] flex items-center justify-center py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.04),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.03),transparent_50%)]" />
      <motion.div {...fadeUp} className="w-full max-w-xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 font-semibold text-xs tracking-wider uppercase px-4 py-1.5">
            Free Tool · No Login Required
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
            CAT Daily Study Planner
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
            Get a structured daily preparation roadmap based on the Percentilers master curriculum.
          </p>
        </div>
        <Card className="rounded-2xl shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-12 bg-secondary/50 border-border/60 focus:bg-background transition-colors" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone Number</Label>
              <Input id="phone" placeholder="10-digit phone number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className="rounded-xl h-12 bg-secondary/50 border-border/60 focus:bg-background transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">Target Year</Label>
                <Select value={targetYear} onValueChange={setTargetYear}>
                  <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border/60"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">Status</Label>
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border/60"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="College Student">College Student</SelectItem>
                    <SelectItem value="Working Professional">Working Professional</SelectItem>
                    <SelectItem value="Drop Year">Drop Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">Prep Level</Label>
                <Select value={prepLevel} onValueChange={setPrepLevel}>
                  <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border/60"><SelectValue placeholder="Level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Concepts Done">Concepts Done</SelectItem>
                    <SelectItem value="Sectionals">Sectionals</SelectItem>
                    <SelectItem value="Mocks">Mocks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-destructive font-medium">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <Button className="w-full h-13 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Generating...</> : <>Generate My Daily Plan <ArrowRight className="ml-2 h-5 w-5" /></>}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">No login required · Your plan is saved automatically</p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

// ─── Day Label Map ───

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SUBJECT_ICON: Record<string, React.ReactNode> = {
  QA: <Calculator className="h-4 w-4 text-primary" />,
  VARC: <FileText className="h-4 w-4 text-primary" />,
  LRDI: <PuzzleIcon className="h-4 w-4 text-primary" />,
};

const SUBJECT_EMOJI: Record<string, string> = {
  QA: "📘",
  VARC: "📖",
  LRDI: "🧠",
};

// ─── Completion Button ───

function CompletionButton({
  completed,
  loading,
  onComplete,
}: {
  completed: boolean;
  loading: boolean;
  onComplete: () => void;
}) {
  if (completed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm font-semibold">Completed ✓</span>
      </div>
    );
  }

  return (
    <Button
      onClick={onComplete}
      disabled={loading}
      className="w-full rounded-xl h-11 font-semibold gap-2"
      variant="outline"
    >
      {loading ? (
        <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</>
      ) : (
        <><CheckCircle2 className="h-4 w-4" /> Mark as Completed</>
      )}
    </Button>
  );
}

// ─── Mock Day Card ───

function MockDayCard({ task, completed, loading, onComplete }: { task: DailyTask; completed: boolean; loading: boolean; onComplete: () => void }) {
  return (
    <Card className="rounded-2xl border-2 border-emerald-500/30 shadow-md bg-emerald-500/5">
      <CardContent className="p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            {task.dayIndex + 1}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Day {task.dayIndex + 1} — Mock Day</p>
            <p className="text-xs text-muted-foreground">{task.weekLabel} · {DAY_NAMES[task.dayOfWeek]}</p>
          </div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
          <Target className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-foreground text-lg">Full Mock CAT</p>
          <p className="text-sm text-muted-foreground mt-1">Complete mock test + detailed analysis</p>
          <p className="text-xs text-muted-foreground mt-2">Nothing else scheduled today — focus entirely on the mock.</p>
        </div>
        <CompletionButton completed={completed} loading={loading} onComplete={onComplete} />
      </CardContent>
    </Card>
  );
}

// ─── Sunday Card ───

function SundayCard({ task, completed, loading, onComplete }: { task: DailyTask; completed: boolean; loading: boolean; onComplete: () => void }) {
  return (
    <Card className="rounded-2xl border border-border shadow-md">
      <CardContent className="p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {task.dayIndex + 1}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Day {task.dayIndex + 1} — Sunday</p>
            <p className="text-xs text-muted-foreground">{task.weekLabel}</p>
          </div>
        </div>
        {task.weekly_test && (
          <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20 text-center">
            <Target className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="font-bold text-foreground">30-Min Weekly Test</p>
            <p className="text-xs text-muted-foreground mt-1">Covers this week's topics across QA, LRDI & VARC</p>
          </div>
        )}
        {task.revision && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">🔁 Revision</span>
            </div>
            <div className="pl-6 text-sm text-foreground">
              <p className="text-muted-foreground">Review error log &amp; revisit weak areas from the week</p>
            </div>
          </div>
        )}
        {!task.weekly_test && !task.revision && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Rest day — light revision only</p>
          </div>
        )}
        <CompletionButton completed={completed} loading={loading} onComplete={onComplete} />
      </CardContent>
    </Card>
  );
}

// ─── Subject Day Card ───

function TaskCard({ task, completed, loading, onComplete }: { task: DailyTask; completed: boolean; loading: boolean; onComplete: () => void }) {
  if (task.is_mock_day) return <MockDayCard task={task} completed={completed} loading={loading} onComplete={onComplete} />;
  if (task.subjectFocus === "WEEKLY_TEST") return <SundayCard task={task} completed={completed} loading={loading} onComplete={onComplete} />;

  const subject = task.subjectFocus;
  const icon = SUBJECT_ICON[subject];
  const emoji = SUBJECT_EMOJI[subject];

  return (
    <Card className="rounded-2xl border border-border shadow-md">
      <CardContent className="p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {task.dayIndex + 1}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Day {task.dayIndex + 1} — {DAY_NAMES[task.dayOfWeek]}</p>
            <p className="text-xs text-muted-foreground">{task.weekLabel}</p>
          </div>
          <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs font-semibold">{subject} Day</Badge>
        </div>
        {task.showVideo && task.videoHours > 0 && (
          <div className={`rounded-xl p-4 border ${task.videoOptional ? "bg-secondary/40 border-border/60" : "bg-primary/5 border-primary/20"}`}>
            <div className="flex items-center gap-2 mb-1">
              <MonitorPlay className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                📺 Concept Video {task.videoOptional && <span className="text-muted-foreground font-normal">(Optional)</span>}
              </span>
            </div>
            <p className="text-sm text-foreground pl-6">Watch concept video (~{task.videoHours} hrs) before practice</p>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{emoji} {subject}</span>
          </div>
          <div className="pl-6 text-sm text-foreground space-y-1">
            <p className="font-medium">{task.topic}</p>
            {task.questionCount > 0 && <p className="text-muted-foreground">{task.questionCount} {task.questionLabel}</p>}
          </div>
        </div>
        <CompletionButton completed={completed} loading={loading} onComplete={onComplete} />
      </CardContent>
    </Card>
  );
}

// ─── Sales Signal Banners ───

function SalesSignalBanner({ heatData }: { heatData: HeatScoreData | null }) {
  if (!heatData) return null;

  if (heatData.lead_category === "Very Hot") {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-5 w-5 text-amber-500" />
          <p className="font-bold text-foreground text-sm">Based on your consistency, you just unlocked a Special Discount on our Courses</p>
        </div>
        <Button size="sm" className="rounded-xl gap-2 font-semibold" asChild>
          <a href="/mentorship">
            <Play className="h-3.5 w-3.5" /> Book Free Counseling Call
          </a>
        </Button>
      </motion.div>
    );
  }

  if (heatData.lead_category === "Hot") {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <p className="font-bold text-foreground text-sm">You're preparing seriously. Want structured mentorship?</p>
        </div>
        <Button size="sm" variant="outline" className="rounded-xl gap-2 font-semibold" asChild>
          <a href="/mentorship">
            <Phone className="h-3.5 w-3.5" /> Book Your 1st Nudge Call for Free
          </a>
        </Button>
      </motion.div>
    );
  }

  return null;
}

function InactivityBanner({ inactiveDays }: { inactiveDays: number }) {
  if (inactiveDays < 3) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <p className="font-bold text-foreground text-sm">Consistency broken. Want help getting back on track?</p>
      </div>
      <Button size="sm" variant="outline" className="rounded-xl gap-2 font-semibold" asChild>
        <a href="/masterclass">
          <Play className="h-3.5 w-3.5" /> Watch Masterclass
        </a>
      </Button>
    </motion.div>
  );
}

// ─── Planner Dashboard ───

function PlannerDashboard({ leadData, onReset }: { leadData: LeadData; onReset: () => void }) {
  const daysLeft = getDaysUntilCAT(leadData.targetYear);
  const isCrashMode = daysLeft <= 50;

  const planConfig: PlanConfig = useMemo(() => ({
    targetYear: leadData.targetYear,
    startDate: new Date(leadData.startDate),
    prepLevel: leadData.prepLevel as "Beginner" | "Concepts Done" | "Sectionals" | "Mocks",
  }), [leadData]);

  const fullPlan = useMemo(() => generateFullPlan(planConfig), [planConfig]);

  const currentDayIndex = useMemo(() => {
    const start = new Date(leadData.startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [leadData.startDate]);

  const [viewingDay, setViewingDay] = useState(Math.min(currentDayIndex, fullPlan.length - 1));
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [completionLoading, setCompletionLoading] = useState(false);
  const [heatData, setHeatData] = useState<HeatScoreData | null>(null);
  const [inactiveDays, setInactiveDays] = useState(0);

  useEffect(() => {
    setViewingDay(Math.min(currentDayIndex, fullPlan.length - 1));
  }, [currentDayIndex, fullPlan.length]);

  // Load existing completion data + heat score on mount
  useEffect(() => {
    const loadData = async () => {
      const phone = leadData.phone;

      // Fetch all completed activities
      const { data: activities } = await supabase
        .from("planner_activity")
        .select("date, subject")
        .eq("phone_number", phone);

      if (activities) {
        const keys = new Set(activities.map((a) => `${a.date}|${a.subject}`));
        setCompletedDays(keys);
      }

      // Fetch heat score
      const heat = await fetchHeatScore(phone);
      setHeatData(heat);

      // Check inactivity
      const inactive = await getInactiveDays(phone);
      setInactiveDays(inactive);
    };
    loadData();
  }, [leadData.phone]);

  const currentTask = fullPlan[viewingDay] ?? null;
  const currentPhase = currentTask?.phase || "Foundation Phase";

  // Get the date for a given day index
  const getDateForDay = useCallback((dayIndex: number): string => {
    const start = new Date(leadData.startDate);
    start.setHours(0, 0, 0, 0);
    const date = new Date(start);
    date.setDate(date.getDate() + dayIndex);
    return date.toISOString().split("T")[0];
  }, [leadData.startDate]);

  // Get subject key for completion tracking
  const getSubjectKey = (task: DailyTask): string => {
    if (task.is_mock_day) return "MOCK";
    if (task.subjectFocus === "WEEKLY_TEST") return "TEST";
    return task.subjectFocus;
  };

  const isCurrentDayCompleted = currentTask
    ? completedDays.has(`${getDateForDay(currentTask.dayIndex)}|${getSubjectKey(currentTask)}`)
    : false;

  const handleComplete = async () => {
    if (!currentTask) return;
    setCompletionLoading(true);

    const date = getDateForDay(currentTask.dayIndex);
    const subject = getSubjectKey(currentTask);

    try {
      await logActivity(leadData.phone, date, subject);

      // Update local state
      setCompletedDays(prev => new Set(prev).add(`${date}|${subject}`));

      // Recalculate heat score
      const newHeat = await recalculateHeatScore(leadData.phone, isCrashMode, daysLeft);
      setHeatData(newHeat);
      setInactiveDays(0);
    } catch (err) {
      console.error("Failed to log activity:", err);
    } finally {
      setCompletionLoading(false);
    }
  };

  // Mini day navigator
  const navDays = useMemo(() => {
    const start = Math.max(0, viewingDay - 3);
    const end = Math.min(fullPlan.length - 1, start + 6);
    return fullPlan.slice(start, end + 1);
  }, [viewingDay, fullPlan]);

  if (fullPlan.length === 0) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">CAT {leadData.targetYear} has already passed.</p>
        <Button variant="outline" className="mt-4" onClick={onReset}>Start Over</Button>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <motion.div {...fadeUp} className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Welcome, {leadData.name}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Your Daily Plan</h1>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl shrink-0 text-xs font-semibold gap-2" onClick={onReset}>
              <RefreshCw className="h-3.5 w-3.5" /> Start Over
            </Button>
          </div>

          {/* Crash mode banner */}
          {isCrashMode && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs font-semibold text-destructive">CRASH MODE — Only Tier 1 topics. Direct mock preparation.</p>
            </div>
          )}

          {/* Inactivity banner */}
          <InactivityBanner inactiveDays={inactiveDays} />

          {/* Sales signal banner */}
          <SalesSignalBanner heatData={heatData} />

          {/* Countdown + Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="rounded-xl border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{daysLeft}</p>
                  <p className="text-xs text-muted-foreground font-medium">Days Left for CAT {leadData.targetYear}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <Badge className={`${PHASE_COLORS[currentPhase] || "bg-secondary text-foreground border-border"} text-xs font-semibold border px-3 py-1`}>
                    {currentPhase}
                  </Badge>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Current Phase</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today indicator */}
          {viewingDay !== currentDayIndex && currentDayIndex < fullPlan.length && (
            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setViewingDay(currentDayIndex)}>
              <AlertTriangle className="h-3 w-3 mr-1" /> Jump to Today (Day {currentDayIndex + 1})
            </Button>
          )}
        </div>

        {/* Day Navigator */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" disabled={viewingDay <= 0} onClick={() => setViewingDay(Math.max(0, viewingDay - 1))}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <span className="text-sm font-semibold text-foreground">
            Day {viewingDay + 1} of {fullPlan.length}
            {viewingDay === currentDayIndex && <span className="text-primary ml-1">(Today)</span>}
          </span>
          <Button variant="ghost" size="sm" disabled={viewingDay >= fullPlan.length - 1} onClick={() => setViewingDay(Math.min(fullPlan.length - 1, viewingDay + 1))}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Mini day selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {navDays.map((d) => {
            const dayDate = getDateForDay(d.dayIndex);
            const subjectKey = getSubjectKey(d);
            const isDone = completedDays.has(`${dayDate}|${subjectKey}`);
            return (
              <button
                key={d.dayIndex}
                onClick={() => setViewingDay(d.dayIndex)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  d.dayIndex === viewingDay
                    ? "bg-primary text-primary-foreground shadow-md"
                    : d.dayIndex === currentDayIndex
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : isDone
                    ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {d.dayIndex + 1}
                {d.is_mock_day && " 🎯"}
                {isDone && " ✓"}
              </button>
            );
          })}
        </div>

        {/* Current Day Task Card */}
        {currentTask && (
          <TaskCard
            task={currentTask}
            completed={isCurrentDayCompleted}
            loading={completionLoading}
            onComplete={handleComplete}
          />
        )}

        {/* Plan info */}
        <Card className="rounded-xl border-border/40 bg-secondary/30">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Plan Info</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg px-3 py-2 border border-border/40">
                <span className="font-semibold text-foreground">Total Days</span>
                <span className="text-muted-foreground ml-1">{fullPlan.length}</span>
              </div>
              <div className="rounded-lg px-3 py-2 border border-border/40">
                <span className="font-semibold text-foreground">Mock Days</span>
                <span className="text-muted-foreground ml-1">{fullPlan.filter(d => d.is_mock_day).length}</span>
              </div>
              <div className="rounded-lg px-3 py-2 border border-border/40">
                <span className="font-semibold text-foreground">Prep Level</span>
                <span className="text-muted-foreground ml-1">{leadData.prepLevel}</span>
              </div>
              <div className="rounded-lg px-3 py-2 border border-border/40">
                <span className="font-semibold text-foreground">Mode</span>
                <span className="text-muted-foreground ml-1">{isCrashMode ? "Crash" : "Standard"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

// ─── Main Page ───

export default function CATDailyStudyPlanner() {
  const [view, setView] = useState<"lead" | "dashboard">(() => {
    return localStorage.getItem("planner_phone") ? "dashboard" : "lead";
  });

  const [leadData, setLeadData] = useState<LeadData>(() => ({
    phone: localStorage.getItem("planner_phone") || "",
    name: localStorage.getItem("planner_name") || "Aspirant",
    targetYear: (() => {
      const s = localStorage.getItem("planner_year");
      if (s) {
        const p = parseInt(s.replace(/\D/g, ""));
        return p && p >= 2025 && p <= 2030 ? p : new Date().getFullYear() + 1;
      }
      return new Date().getFullYear() + 1;
    })(),
    prepLevel: localStorage.getItem("planner_prep_level") || "Beginner",
    startDate: localStorage.getItem("planner_start_date") || new Date().toISOString().split("T")[0],
  }));

  const handleLeadComplete = (data: LeadData) => {
    setLeadData(data);
    setView("dashboard");
  };

  const handleReset = () => {
    localStorage.removeItem("planner_phone");
    localStorage.removeItem("planner_name");
    localStorage.removeItem("planner_year");
    localStorage.removeItem("planner_prep_level");
    localStorage.removeItem("planner_start_date");
    setView("lead");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {view === "lead" && <LeadCapture onComplete={handleLeadComplete} />}
      {view === "dashboard" && <PlannerDashboard leadData={leadData} onReset={handleReset} />}
      <Footer />
    </div>
  );
}
