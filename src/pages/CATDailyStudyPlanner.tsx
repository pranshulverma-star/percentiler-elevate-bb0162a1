import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

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
      // Check if lead exists
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

      // Store in localStorage for session
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

  return (
    <section className="min-h-[80vh] flex items-center justify-center py-16">
      <motion.div {...fadeUp} className="w-full max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-semibold">Free Tool</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            CAT Daily Study Planner
          </h1>
          <p className="text-base text-muted-foreground mt-3 max-w-md mx-auto">
            Get a day-wise structured preparation roadmap tailored to your target CAT year.
          </p>
        </div>

        <Card className="rounded-2xl shadow-lg border-0">
          <CardContent className="p-6 md:p-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
              <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl h-12" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">Phone Number</Label>
              <Input id="phone" placeholder="10-digit phone number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className="rounded-xl h-12" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Target CAT Year</Label>
              <Select value={targetYear} onValueChange={setTargetYear}>
                <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAT 2026">CAT 2026</SelectItem>
                  <SelectItem value="CAT 2027">CAT 2027</SelectItem>
                  <SelectItem value="CAT 2028">CAT 2028</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Current Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="College Student">College Student</SelectItem>
                  <SelectItem value="Working Professional">Working Professional</SelectItem>
                  <SelectItem value="Drop Year">Drop Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Current Prep Level</Label>
              <Select value={prepLevel} onValueChange={setPrepLevel}>
                <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Basic Concepts Done">Basic Concepts Done</SelectItem>
                  <SelectItem value="Attempting Sectionals">Attempting Sectionals</SelectItem>
                  <SelectItem value="Already Giving Mocks">Already Giving Mocks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <Button
              className="w-full h-12 rounded-xl text-base font-semibold"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Generating..." : "Generate My Study Plan"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
        <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Building Your Study Plan</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">Generating 180+ days of structured preparation roadmap...</p>
        <Progress value={65} className="max-w-xs mx-auto h-2" />
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
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {sectionIcon(section)}
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      {tasks.map((t, i) => (
        <div key={i} className="pl-6 text-sm text-foreground">
          <span className="font-medium">{t.chapter}</span>
          <span className="text-muted-foreground"> — {t.concept}</span>
          <span className="text-muted-foreground"> · {t.questionCount} {section === "lrdi" ? "sets" : "Qs"}</span>
          <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 capitalize">{t.difficulty}</Badge>
        </div>
      ))}
    </div>
  );

  if (isLocked) {
    return (
      <Card className="rounded-2xl border border-border/50 opacity-50">
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
    );
  }

  return (
    <Card className={`rounded-2xl border transition-all ${day.is_completed ? "border-primary/20 bg-primary/[0.02]" : isCurrent ? "border-primary shadow-md" : "border-border"}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${day.is_completed ? "bg-primary/10" : "bg-secondary"}`}>
              {day.is_completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <span className="text-sm font-bold text-foreground">{day.day_number}</span>}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Day {day.day_number}</p>
              {day.is_completed && <p className="text-xs text-primary font-medium">Completed</p>}
            </div>
          </div>
          {isCurrent && !day.is_completed && <Badge className="bg-primary text-primary-foreground text-xs">Today</Badge>}
        </div>

        {renderTasks(day.qa_tasks_json || [], "Quant", "qa")}
        {renderTasks(day.lrdi_tasks_json || [], "LRDI", "lrdi")}
        {renderTasks(day.varc_tasks_json || [], "VARC", "varc")}

        {!day.is_completed && (
          <Button className="w-full rounded-xl" onClick={() => onComplete(day.id)}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ───

function PlannerDashboard({ phone }: { phone: string }) {
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

  // Find first incomplete day
  const firstIncomplete = days.find((d) => !d.is_completed);
  const currentDayNumber = firstIncomplete?.day_number || 1;

  // Determine current week bounds (7-day window around current day)
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

  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <motion.div {...fadeUp} className="space-y-8">
        {/* Progress header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your Study Plan</h1>
              <p className="text-sm text-muted-foreground mt-1">{completedCount} of {totalDays} days completed</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{progressPct}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progressPct} className="h-3 rounded-full" />
        </div>

        {/* Week label */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Week {Math.ceil(weekStart / 7)} — Days {weekStart}–{Math.min(weekEnd, totalDays)}
          </h2>
        </div>

        {/* Day cards */}
        <div className="space-y-4">
          {visibleDays.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              isCurrent={day.day_number === currentDayNumber}
              isLocked={false}
              onComplete={handleComplete}
            />
          ))}
          {lockedDays.map((day) => (
            <DayCard key={day.id} day={day} isCurrent={false} isLocked onComplete={() => {}} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="border-t border-border pt-8 mt-8 space-y-4">
          <h3 className="text-lg font-bold text-foreground text-center">
            Want structured mentorship & mock analysis?
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="rounded-xl px-8 h-12 text-base" asChild>
              <a href="/masterclass">
                <BookOpen className="mr-2 h-5 w-5" /> Watch Free Masterclass
              </a>
            </Button>
            <Button variant="outline" className="rounded-xl px-8 h-12 text-base" asChild>
              <a href="/free-cat-readiness-assessment">
                <BarChart3 className="mr-2 h-5 w-5" /> CAT Readiness Assessment
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Main Page ───

export default function CATDailyStudyPlanner() {
  const [phase, setPhase] = useState<Phase>("lead");
  const [phone, setPhone] = useState("");

  // Check for returning user on mount
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

    // Check if plan already exists
    const { data: existingDays } = await supabase
      .from("study_plan_days")
      .select("id")
      .eq("phone_number", phoneNum)
      .limit(1);

    if (existingDays && existingDays.length > 0) {
      setPhase("dashboard");
      return;
    }

    // Generate plan
    const year = localStorage.getItem("planner_year") || "CAT 2026";
    const level = localStorage.getItem("planner_level") || "Beginner";
    const plan = generateStudyPlan(year, level);

    // Insert in batches of 50
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

  return (
    <>
      <Navbar />
      <main className="bg-background min-h-screen">
        {phase === "lead" && <LeadCapture onComplete={handleLeadComplete} />}
        {phase === "loading" && <LoadingScreen />}
        {phase === "dashboard" && <PlannerDashboard phone={phone} />}
      </main>
      <Footer />
    </>
  );
}
