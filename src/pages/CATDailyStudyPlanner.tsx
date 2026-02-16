import { useState, useMemo } from "react";
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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Helpers ───

function getLastSundayOfNovember(year: number): Date {
  // Start from Nov 30 and walk back to find Sunday (day 0)
  const d = new Date(year, 10, 30); // Nov 30
  while (d.getDay() !== 0) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

function getDaysLeft(targetYear: number): number {
  const catDate = getLastSundayOfNovember(targetYear);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  catDate.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((catDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

type PhaseName = "Foundation" | "Strength & Sectional" | "Mock Phase" | "Final Revision";

function getPhase(daysLeft: number): PhaseName {
  if (daysLeft > 210) return "Foundation";
  if (daysLeft >= 120) return "Strength & Sectional";
  if (daysLeft >= 45) return "Mock Phase";
  return "Final Revision";
}

const PHASE_COLORS: Record<PhaseName, string> = {
  "Foundation": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Strength & Sectional": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "Mock Phase": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "Final Revision": "bg-red-500/10 text-red-600 border-red-500/20",
};

// ─── Syllabus Banks ───

const QA_TOPICS = [
  { chapter: "Number Systems", concepts: ["Divisibility", "HCF & LCM", "Remainders", "Factorials", "Last Digits"] },
  { chapter: "Arithmetic", concepts: ["Percentages", "Profit & Loss", "SI & CI", "Ratios", "Averages", "Mixtures"] },
  { chapter: "Algebra", concepts: ["Linear Equations", "Quadratic Equations", "Inequalities", "Functions", "Logs"] },
  { chapter: "Geometry", concepts: ["Triangles", "Circles", "Coordinate Geometry", "Mensuration", "Polygons"] },
  { chapter: "Modern Maths", concepts: ["P & C", "Probability", "Set Theory", "Progressions", "Binomial"] },
  { chapter: "Time & Work", concepts: ["Pipes & Cisterns", "Work Efficiency", "Alternate Days", "Chain Rule"] },
  { chapter: "Time Speed Distance", concepts: ["Relative Speed", "Boats & Streams", "Trains", "Races", "Circular Motion"] },
];

const LRDI_TOPICS = [
  { chapter: "Arrangements", types: ["Linear", "Circular", "Matrix"] },
  { chapter: "Grouping & Selection", types: ["Team Formation", "Distribution", "Conditional"] },
  { chapter: "Schedules", types: ["Sequencing", "Slot Allocation", "Timetable"] },
  { chapter: "Data Interpretation", types: ["Bar Graphs", "Pie Charts", "Tables", "Caselets"] },
  { chapter: "Puzzles", types: ["Blood Relations", "Coding", "Direction", "Syllogisms"] },
  { chapter: "Networks", types: ["Shortest Path", "Connectivity", "Flow"] },
];

const VARC_RC_TOPICS = ["Social Science", "Philosophy", "Economics", "Science & Tech", "Abstract", "History", "Psychology"];
const VARC_VA_TOPICS = ["Para Jumbles", "Para Summary", "Odd Sentence", "Sentence Completion", "Critical Reasoning"];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

interface DailyTasks {
  dayNumber: number;
  quant: { chapter: string; concept: string };
  lrdi: { chapter: string; type1: string; type2: string };
  varc: { rcTopic: string; vaTopic: string };
}

function generateDayTasks(dayNumber: number, _phase: PhaseName): DailyTasks {
  const seed = dayNumber * 31 + 7;
  const qaChapter = pick(QA_TOPICS, seed);
  const qaConcept = pick(qaChapter.concepts, seed + 13);

  const lrdiChapter = pick(LRDI_TOPICS, seed + 5);
  const lrdiType1 = pick(lrdiChapter.types, seed + 11);
  const lrdiType2 = pick(lrdiChapter.types, seed + 17);

  const rcTopic = pick(VARC_RC_TOPICS, seed + 23);
  const vaTopic = pick(VARC_VA_TOPICS, seed + 29);

  return {
    dayNumber,
    quant: { chapter: qaChapter.chapter, concept: qaConcept },
    lrdi: { chapter: lrdiChapter.chapter, type1: lrdiType1, type2: lrdiType2 },
    varc: { rcTopic, vaTopic },
  };
}

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

// ─── Lead Capture ───

function LeadCapture({ onComplete }: { onComplete: (phone: string, year: number) => void }) {
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

      localStorage.setItem("planner_phone", phone);
      localStorage.setItem("planner_name", name);
      localStorage.setItem("planner_year", targetYear);

      onComplete(phone, parseInt(targetYear));
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
            Get a dynamic daily preparation roadmap tailored to your CAT exam date.
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

            <Button
              className="w-full h-13 rounded-xl text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
              ) : (
                <>Generate My Daily Plan <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              No login required · Your plan is saved automatically
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

// ─── Task Card ───

function TaskCard({ tasks }: { tasks: DailyTasks; phase: PhaseName }) {
  return (
    <Card className="rounded-2xl border border-border shadow-md">
      <CardContent className="p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {tasks.dayNumber}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Day {tasks.dayNumber}</p>
            <p className="text-xs text-muted-foreground">Today's Tasks</p>
          </div>
        </div>

        {/* Quant */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📘 Quant</span>
          </div>
          <div className="pl-6 text-sm text-foreground space-y-1">
            <p><span className="font-medium">{tasks.quant.chapter}</span> — {tasks.quant.concept}</p>
            <p className="text-muted-foreground">30 practice questions</p>
          </div>
        </div>

        {/* LRDI */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PuzzleIcon className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">🧠 LRDI</span>
          </div>
          <div className="pl-6 text-sm text-foreground space-y-1">
            <p><span className="font-medium">{tasks.lrdi.chapter}</span></p>
            <p className="text-muted-foreground">2 sets — {tasks.lrdi.type1}, {tasks.lrdi.type2}</p>
          </div>
        </div>

        {/* VARC */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📖 VARC</span>
          </div>
          <div className="pl-6 text-sm text-foreground space-y-1">
            <p>1 RC — <span className="font-medium">{tasks.varc.rcTopic}</span></p>
            <p className="text-muted-foreground">8 VA — {tasks.varc.vaTopic}</p>
          </div>
        </div>

        {/* Revision */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">🔁 Revision</span>
          </div>
          <div className="pl-6 text-sm text-foreground">
            <p className="text-muted-foreground">20 min error log review</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Planner Dashboard ───

function PlannerDashboard({ targetYear, onReset }: { targetYear: number; onReset: () => void }) {
  const daysLeft = getDaysLeft(targetYear);
  const phase = getPhase(daysLeft);
  const userName = localStorage.getItem("planner_name") || "Aspirant";

  // Day navigation: user can browse days 1..daysLeft
  const totalDays = Math.min(daysLeft, 365);
  const [currentDay, setCurrentDay] = useState(1);

  const tasks = useMemo(() => generateDayTasks(currentDay, phase), [currentDay, phase]);

  // Generate a few days around current for a mini-week view
  const weekDays = useMemo(() => {
    const start = Math.max(1, currentDay - 2);
    const end = Math.min(totalDays, start + 6);
    const days: DailyTasks[] = [];
    for (let d = start; d <= end; d++) {
      days.push(generateDayTasks(d, phase));
    }
    return days;
  }, [currentDay, phase, totalDays]);

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <motion.div {...fadeUp} className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Welcome, {userName}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Your Daily Plan</h1>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl shrink-0 text-xs font-semibold gap-2" onClick={onReset}>
              <RefreshCw className="h-3.5 w-3.5" /> Start Over
            </Button>
          </div>

          {/* Countdown + Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="rounded-xl border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{daysLeft}</p>
                  <p className="text-xs text-muted-foreground font-medium">Days Left for CAT {targetYear}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <Badge className={`${PHASE_COLORS[phase]} text-xs font-semibold border px-3 py-1`}>{phase}</Badge>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Current Phase</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Day Navigator */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" disabled={currentDay <= 1} onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev Day
          </Button>
          <span className="text-sm font-semibold text-foreground">Day {currentDay} of {totalDays}</span>
          <Button variant="ghost" size="sm" disabled={currentDay >= totalDays} onClick={() => setCurrentDay(Math.min(totalDays, currentDay + 1))}>
            Next Day <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Mini day selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {weekDays.map((d) => (
            <button
              key={d.dayNumber}
              onClick={() => setCurrentDay(d.dayNumber)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                d.dayNumber === currentDay
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
        </div>

        {/* Current Day Task Card */}
        <TaskCard tasks={tasks} phase={phase} />

        {/* Phase guide */}
        <Card className="rounded-xl border-border/40 bg-secondary/30">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Phase Guide</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {([
                ["Foundation", "> 210 days"],
                ["Strength & Sectional", "120–210 days"],
                ["Mock Phase", "45–120 days"],
                ["Final Revision", "< 45 days"],
              ] as const).map(([p, range]) => (
                <div key={p} className={`rounded-lg px-3 py-2 border ${phase === p ? "border-primary/30 bg-primary/5" : "border-border/40"}`}>
                  <span className="font-semibold text-foreground">{p}</span>
                  <span className="text-muted-foreground ml-1">({range})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

// ─── Main Page ───

export default function CATDailyStudyPlanner() {
  const [phase, setPhase] = useState<"lead" | "dashboard">(() => {
    return localStorage.getItem("planner_phone") ? "dashboard" : "lead";
  });
  const [targetYear, setTargetYear] = useState<number>(() => {
    const stored = localStorage.getItem("planner_year");
    if (stored) {
      const parsed = parseInt(stored.replace(/\D/g, ""));
      return parsed && parsed >= 2025 && parsed <= 2030 ? parsed : new Date().getFullYear() + 1;
    }
    return new Date().getFullYear() + 1;
  });

  const handleLeadComplete = (phone: string, year: number) => {
    setTargetYear(year);
    setPhase("dashboard");
  };

  const handleReset = () => {
    localStorage.removeItem("planner_phone");
    localStorage.removeItem("planner_name");
    localStorage.removeItem("planner_year");
    setPhase("lead");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {phase === "lead" && <LeadCapture onComplete={handleLeadComplete} />}
      {phase === "dashboard" && <PlannerDashboard targetYear={targetYear} onReset={handleReset} />}
      <Footer />
    </div>
  );
}
