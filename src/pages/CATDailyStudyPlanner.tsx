import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { generateStudyPlan, type TaskItem } from "@/lib/studyPlanGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays, ArrowRight, CheckCircle2, Lock, BookOpen,
  Calculator, PuzzleIcon, FileText, BarChart3, ChevronRight,
  RefreshCw, Target, Clock, Layers,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

// ─── Types ───

interface StoredDay {
  id: string;
  day_number: number;
  qa_tasks_json: TaskItem[];
  lrdi_tasks_json: TaskItem[];
  varc_tasks_json: TaskItem[];
  is_completed: boolean;
  completed_at: string | null;
}

type Phase = "lead" | "loading" | "dashboard";

// ─── Lead Capture ───

function LeadCapture({ onComplete }: { onComplete: (phone: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [prepLevel, setPrepLevel] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return setError("Name is required");
    if (!/^\d{10}$/.test(phone)) return setError("Enter a valid 10-digit phone number");
    if (!targetYear) return setError("Select your target CAT year");
    if (!status) return setError("Select your current status");
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
          name, phone_number: phone, source: "planner",
          target_year: targetYear, prep_level: prepLevel,
        });
      }

      localStorage.setItem("planner_phone", phone);
      localStorage.setItem("planner_name", name);
      localStorage.setItem("planner_year", targetYear);
      localStorage.setItem("planner_level", prepLevel);

      onComplete(phone);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: Target, label: "180-Day Structured Roadmap" },
    { icon: Clock, label: "2–2.5 Hrs Daily Workload" },
    { icon: Layers, label: "QA · LRDI · VARC Coverage" },
  ];

  return (
    <section className="min-h-[85vh] flex items-center justify-center py-16 relative overflow-hidden">
      {/* Subtle bg pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.04),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.03),transparent_50%)]" />

      <motion.div {...fadeUp} className="w-full max-w-xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Badge className="mb-5 bg-primary/10 text-primary border-primary/20 font-semibold text-xs tracking-wider uppercase px-4 py-1.5">
              Free Tool · No Login Required
            </Badge>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
            CAT Daily Study Planner
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
            Get a day-wise structured preparation roadmap tailored to your target CAT year.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2"
              >
                <f.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground">{f.label}</span>
              </motion.div>
            ))}
          </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">Target CAT Year</Label>
                <Select value={targetYear} onValueChange={setTargetYear}>
                  <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border/60"><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAT 2026">CAT 2026</SelectItem>
                    <SelectItem value="CAT 2027">CAT 2027</SelectItem>
                    <SelectItem value="CAT 2028">CAT 2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-foreground">Current Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border/60"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="College Student">College Student</SelectItem>
                    <SelectItem value="Working Professional">Working Professional</SelectItem>
                    <SelectItem value="Drop Year">Drop Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Current Prep Level</Label>
              <Select value={prepLevel} onValueChange={setPrepLevel}>
                <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border/60"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Basic Concepts Done">Basic Concepts Done</SelectItem>
                  <SelectItem value="Attempting Sectionals">Attempting Sectionals</SelectItem>
                  <SelectItem value="Already Giving Mocks">Already Giving Mocks</SelectItem>
                </SelectContent>
              </Select>
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
                <>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  Generate My Study Plan <ArrowRight className="ml-2 h-5 w-5" />
                </>
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

// ─── Loading Screen ───

function LoadingScreen() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
      <motion.div {...fadeUp} className="text-center space-y-6">
        <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Building Your Study Plan</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">Generating 180+ days of structured preparation roadmap...</p>
        <Progress value={65} className="max-w-xs mx-auto h-2.5 rounded-full" />
      </motion.div>
    </section>
  );
}

// ─── Day Card ───

function DayCard({ day, isCurrent, isLocked, onComplete }: {
  day: StoredDay; isCurrent: boolean; isLocked: boolean; onComplete: (id: string) => void;
}) {
  const sectionIcon = (section: string) => {
    if (section === "qa") return <Calculator className="h-4 w-4 text-primary" />;
    if (section === "lrdi") return <PuzzleIcon className="h-4 w-4 text-primary" />;
    return <FileText className="h-4 w-4 text-primary" />;
  };

  const renderTasks = (tasks: TaskItem[], label: string, section: string) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {sectionIcon(section)}
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      {tasks.map((t, i) => (
        <div key={i} className="pl-6 text-sm text-foreground flex items-start gap-1 flex-wrap">
          <span className="font-medium">{t.chapter}</span>
          <span className="text-muted-foreground">— {t.concept}</span>
          <span className="text-muted-foreground">· {t.questionCount} {section === "lrdi" ? "sets" : "Qs"}</span>
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize shrink-0">{t.difficulty}</Badge>
        </div>
      ))}
    </div>
  );

  if (isLocked) {
    return (
      <motion.div {...stagger}>
        <Card className="rounded-2xl border border-border/40 opacity-40 bg-muted/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Day {day.day_number}</p>
                <p className="text-xs text-muted-foreground">Unlocks next week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div {...stagger}>
      <Card className={`rounded-2xl border transition-all duration-200 ${
        day.is_completed
          ? "border-primary/20 bg-primary/[0.02]"
          : isCurrent
            ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/10"
            : "border-border hover:border-border/80 hover:shadow-md"
      }`}>
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                day.is_completed
                  ? "bg-primary/10 text-primary"
                  : isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
              }`}>
                {day.is_completed ? <CheckCircle2 className="h-5 w-5" /> : day.day_number}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Day {day.day_number}</p>
                {day.is_completed && <p className="text-xs text-primary font-medium">✓ Completed</p>}
              </div>
            </div>
            {isCurrent && !day.is_completed && (
              <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 animate-pulse">Today</Badge>
            )}
          </div>

          <div className="space-y-3 pt-1">
            {renderTasks(day.qa_tasks_json || [], "Quant", "qa")}
            {renderTasks(day.lrdi_tasks_json || [], "LRDI", "lrdi")}
            {renderTasks(day.varc_tasks_json || [], "VARC", "varc")}
          </div>

          {!day.is_completed && (
            <Button className="w-full rounded-xl h-11 font-semibold shadow-sm" onClick={() => onComplete(day.id)}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Dashboard ───

function PlannerDashboard({ phone, onRedesign }: { phone: string; onRedesign: () => void }) {
  const [days, setDays] = useState<StoredDay[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDays = useCallback(async () => {
    const { data } = await supabase
      .from("study_plan_days")
      .select("*")
      .eq("phone_number", phone)
      .order("day_number", { ascending: true });

    if (data) setDays(data as unknown as StoredDay[]);
    setLoading(false);
  }, [phone]);

  useEffect(() => { fetchDays(); }, [fetchDays]);

  const completedCount = days.filter((d) => d.is_completed).length;
  const totalDays = days.length;
  const progressPct = totalDays ? Math.round((completedCount / totalDays) * 100) : 0;

  const firstIncomplete = days.find((d) => !d.is_completed);
  const currentDayNumber = firstIncomplete?.day_number || 1;

  const weekStart = Math.floor((currentDayNumber - 1) / 7) * 7 + 1;
  const weekEnd = weekStart + 6;
  const visibleDays = days.filter((d) => d.day_number >= weekStart && d.day_number <= weekEnd);
  const lockedDays = days.filter((d) => d.day_number > weekEnd).slice(0, 3);

  const handleComplete = async (id: string) => {
    await supabase
      .from("study_plan_days")
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq("id", id);
    fetchDays();
  };

  if (loading) return <LoadingScreen />;

  const userName = localStorage.getItem("planner_name") || "Aspirant";

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <motion.div {...fadeUp} className="space-y-8">
        {/* Header */}
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">Welcome back, {userName}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Your Study Plan</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl shrink-0 text-xs font-semibold gap-2"
              onClick={onRedesign}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Redesign Plan
            </Button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="rounded-xl border-border/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{progressPct}%</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Completed</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Days Done</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalDays - completedCount}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Remaining</p>
              </CardContent>
            </Card>
          </div>

          <Progress value={progressPct} className="h-3 rounded-full" />
        </div>

        {/* Week label */}
        <div className="flex items-center gap-2 pt-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            Week {Math.ceil(weekStart / 7)}
          </h2>
          <span className="text-sm text-muted-foreground">
            · Days {weekStart}–{Math.min(weekEnd, totalDays)}
          </span>
        </div>

        {/* Day cards */}
        <div className="space-y-4">
          {visibleDays.map((day, i) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <DayCard
                day={day}
                isCurrent={day.day_number === currentDayNumber}
                isLocked={false}
                onComplete={handleComplete}
              />
            </motion.div>
          ))}
          {lockedDays.map((day) => (
            <DayCard key={day.id} day={day} isCurrent={false} isLocked onComplete={() => {}} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="border-t border-border pt-8 mt-8">
          <Card className="rounded-2xl bg-secondary/50 border-0">
            <CardContent className="p-6 md:p-8 text-center space-y-4">
              <h3 className="text-lg font-bold text-foreground">
                Want structured mentorship & mock analysis?
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-primary/20" asChild>
                  <a href="/masterclass">
                    <BookOpen className="mr-2 h-5 w-5" /> Watch Free Masterclass
                  </a>
                </Button>
                <Button variant="outline" className="rounded-xl px-6 h-12 text-base font-medium" asChild>
                  <a href="/free-cat-readiness-assessment">
                    <BarChart3 className="mr-2 h-5 w-5" /> CAT Readiness Assessment
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Main Page ───

export default function CATDailyStudyPlanner() {
  const [phase, setPhase] = useState<Phase>("lead");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const savedPhone = localStorage.getItem("planner_phone");
    if (savedPhone) {
      setPhone(savedPhone);
      setPhase("dashboard");
    }
  }, []);

  const handleLeadComplete = async (phoneNum: string) => {
    setPhone(phoneNum);
    setPhase("loading");

    const { data: existingDays } = await supabase
      .from("study_plan_days")
      .select("id")
      .eq("phone_number", phoneNum)
      .limit(1);

    if (existingDays && existingDays.length > 0) {
      setPhase("dashboard");
      return;
    }

    const year = localStorage.getItem("planner_year") || "CAT 2026";
    const level = localStorage.getItem("planner_level") || "Beginner";
    const plan = generateStudyPlan(year, level);

    for (let i = 0; i < plan.length; i += 50) {
      const batch = plan.slice(i, i + 50).map((d) => ({
        phone_number: phoneNum,
        day_number: d.day_number,
        qa_tasks_json: JSON.parse(JSON.stringify(d.qa_tasks_json)),
        lrdi_tasks_json: JSON.parse(JSON.stringify(d.lrdi_tasks_json)),
        varc_tasks_json: JSON.parse(JSON.stringify(d.varc_tasks_json)),
        is_completed: false,
      }));
      await supabase.from("study_plan_days").insert(batch);
    }

    setPhase("dashboard");
  };

  const handleRedesign = async () => {
    // Delete existing plan and go back to lead capture
    if (phone) {
      await supabase.from("study_plan_days").delete().eq("phone_number", phone);
    }
    localStorage.removeItem("planner_phone");
    localStorage.removeItem("planner_name");
    localStorage.removeItem("planner_year");
    localStorage.removeItem("planner_level");
    setPhone("");
    setPhase("lead");
  };

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        <AnimatePresence mode="wait">
          {phase === "lead" && <LeadCapture key="lead" onComplete={handleLeadComplete} />}
          {phase === "loading" && <LoadingScreen key="loading" />}
          {phase === "dashboard" && <PlannerDashboard key="dashboard" phone={phone} onRedesign={handleRedesign} />}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
