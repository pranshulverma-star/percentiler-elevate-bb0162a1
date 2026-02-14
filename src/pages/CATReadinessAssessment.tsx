import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { questions, type Section } from "@/data/readinessQuestions";
import { computeScore, generateInsight, type AssessmentResult } from "@/lib/readinessScoring";
import {
  Clock, CheckCircle2, ArrowLeft, ArrowRight, Target,
  BarChart3, Zap, Brain, ChevronRight, Shield, Users,
  TrendingUp, BookOpen, Calculator, PuzzleIcon, FileText,
  Shuffle, Award, Timer, ClipboardList,
} from "lucide-react";

type Phase = "hero" | "lead" | "test" | "results";
type SectionFilter = Section | "mix";

const STORAGE_KEY = "cat_readiness_assessment";
const TOTAL_TIME = 900;

interface StoredData {
  name: string;
  phone: string;
  target_percentile: string;
  assessment_started_at: string;
  section_filter?: SectionFilter;
  answers?: Record<number, number>;
  timeTaken?: number;
  completed?: boolean;
}

function getStored(): StoredData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStored(data: Partial<StoredData>) {
  const existing = getStored() || {};
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
}

function getFilteredQuestions(filter: SectionFilter) {
  if (filter === "mix") return questions;
  return questions.filter((q) => q.section === filter);
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

// ─── NAVBAR ─────────────────────────────────────────────
const Navbar = () => (
  <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
    <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <a href="/" className="text-xl font-bold text-foreground tracking-tight">
        Percentilers
      </a>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-xs font-medium hidden sm:inline-flex">
          100% Free
        </Badge>
        <Button size="sm" className="rounded-xl font-semibold" asChild>
          <a href="#start-assessment">Take Assessment</a>
        </Button>
      </div>
    </div>
  </nav>
);

// ─── HERO ───────────────────────────────────────────────
const HeroSection = ({ onStart }: { onStart: () => void }) => (
  <section className="relative overflow-hidden">
    {/* Subtle background pattern */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.04),transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.03),transparent_50%)]" />

    <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
      <motion.div {...fadeUp}>
        <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full px-5 py-2 mb-8">
          <Award className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Trusted by 10,000+ CAT Aspirants</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.15] max-w-4xl mx-auto">
          Know Exactly Where You Stand for{" "}
          <span className="text-primary">CAT 2025</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Get a structured, AI-scored performance report in just 15 minutes.
          Identify your strengths, weaknesses, and the exact gaps between you and your target percentile.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button
            size="lg"
            className="text-base px-10 py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            onClick={onStart}
          >
            Start Free Assessment <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>Takes only 15 minutes</span>
          </div>
        </div>
      </motion.div>

      {/* Trust metrics */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
      >
        {[
          { value: "10K+", label: "Assessments Taken" },
          { value: "4.8★", label: "User Rating" },
          { value: "15 min", label: "Quick & Precise" },
          { value: "Free", label: "No Card Required" },
        ].map((m) => (
          <div key={m.label} className="text-center py-4">
            <p className="text-2xl md:text-3xl font-bold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── SECTION SELECTOR ───────────────────────────────────
const sectionOptions: { key: SectionFilter; label: string; icon: typeof Calculator; desc: string }[] = [
  { key: "quant", label: "Quantitative Aptitude", icon: Calculator, desc: "Arithmetic, Algebra, Geometry & Number Systems" },
  { key: "lrdi", label: "LRDI", icon: PuzzleIcon, desc: "Logical Reasoning & Data Interpretation" },
  { key: "varc", label: "VARC", icon: BookOpen, desc: "Verbal Ability & Reading Comprehension" },
  { key: "mix", label: "Mixed (All Sections)", icon: Shuffle, desc: "A balanced mix of all three sections" },
];

const SectionSelector = ({
  selected,
  onSelect,
  onStartAssessment,
}: {
  selected: SectionFilter;
  onSelect: (s: SectionFilter) => void;
  onStartAssessment: () => void;
}) => (
  <section className="py-20" id="start-assessment">
    <div className="max-w-4xl mx-auto px-4">
      <motion.div {...fadeUp} className="text-center mb-12">
        <Badge variant="secondary" className="mb-4 text-xs font-medium uppercase tracking-wider px-4 py-1.5">
          Choose Your Focus
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          What would you like to test yourself on?
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          Pick a section to deep-dive or go mixed for a full diagnostic.
        </p>
      </motion.div>

      <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-4">
        {sectionOptions.map((opt) => {
          const isActive = selected === opt.key;
          return (
            <motion.div key={opt.key} variants={fadeUp}>
              <button
                onClick={() => onSelect(opt.key)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 group ${
                  isActive
                    ? "border-primary bg-primary/[0.03] shadow-md shadow-primary/5"
                    : "border-border bg-background hover:border-primary/20 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                    <opt.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-base">{opt.label}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
                    <p className="text-xs text-muted-foreground mt-2">10 Questions · 15 min</p>
                  </div>
                  <div className={`shrink-0 mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive ? "border-primary bg-primary" : "border-muted-foreground/30"
                  }`}>
                    {isActive && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Take Assessment CTA */}
      <motion.div {...fadeUp} className="text-center mt-10">
        <Button
          size="lg"
          className="rounded-2xl px-12 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
          onClick={onStartAssessment}
        >
          Take Assessment <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          {sectionOptions.find((o) => o.key === selected)?.label} · 10 Questions · Completely Free
        </p>
      </motion.div>
    </div>
  </section>
);

// ─── HOW IT WORKS ───────────────────────────────────────
const HowItWorks = () => (
  <section className="py-16">
    <div className="max-w-4xl mx-auto px-4">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">How It Works</h2>
        <p className="text-muted-foreground mt-3">Three simple steps to your personalized readiness report.</p>
      </motion.div>

      <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
        {[
          { step: "01", icon: ClipboardList, title: "Enter Your Details", desc: "Tell us your name, phone, and target percentile so we can personalize your report." },
          { step: "02", icon: FileText, title: "Answer 10 Questions", desc: "Carefully crafted questions across difficulty levels — complete in 15 minutes." },
          { step: "03", icon: TrendingUp, title: "Get Your Report", desc: "Receive your CAT Readiness Index with section-wise breakdown and actionable insights." },
        ].map((s) => (
          <motion.div key={s.step} variants={fadeUp}>
            <Card className="rounded-2xl border-0 shadow-sm h-full">
              <CardContent className="pt-6 pb-6 text-center">
                <span className="text-xs font-bold text-primary tracking-widest">STEP {s.step}</span>
                <div className="mx-auto mt-3 mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── TRUST SECTION ──────────────────────────────────────
const TrustSection = () => (
  <section className="py-12 bg-secondary/30">
    <div className="max-w-4xl mx-auto px-4">
      <div className="grid sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: Shield, title: "100% Free", desc: "No payment, no card, no hidden charges. Ever." },
          { icon: Brain, title: "Smart Scoring", desc: "Weighted scoring across difficulty, speed, and accuracy." },
          { icon: Users, title: "Built by 99%ilers", desc: "Designed by mentors who scored 99+ percentile in CAT." },
        ].map((t) => (
          <div key={t.title} className="flex flex-col items-center gap-3 py-4">
            <div className="p-3 rounded-xl bg-primary/5">
              <t.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-sm">{t.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── LEAD CAPTURE ───────────────────────────────────────
const LeadCapture = ({
  sectionFilter,
  onSubmit,
}: {
  sectionFilter: SectionFilter;
  onSubmit: () => void;
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [target, setTarget] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (name.trim().length > 100) e.name = "Name must be under 100 characters";
    if (!/^\d{10}$/.test(phone)) e.phone = "Enter a valid 10-digit phone number";
    if (!target) e.target = "Select your target percentile";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStored({
      name: name.trim(),
      phone,
      target_percentile: target,
      section_filter: sectionFilter,
      assessment_started_at: new Date().toISOString(),
      answers: {},
      completed: false,
    });
    onSubmit();
  };

  const sectionLabel = sectionOptions.find((o) => o.key === sectionFilter)?.label || "Mixed";

  return (
    <section className="py-16 px-4">
      <motion.div {...fadeUp} className="max-w-lg mx-auto">
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader className="text-center pb-2 pt-8">
            <Badge variant="secondary" className="mx-auto mb-3 text-xs">
              Section: {sectionLabel}
            </Badge>
            <CardTitle className="text-2xl font-bold text-foreground">
              Get Your Personalized Report
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Fill in your details to begin the 15-minute assessment.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-12"
                  maxLength={100}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="rounded-xl h-12"
                  maxLength={10}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Target Percentile</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90+">90+</SelectItem>
                    <SelectItem value="95+">95+</SelectItem>
                    <SelectItem value="98+">98+</SelectItem>
                    <SelectItem value="99+">99+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.target && <p className="text-sm text-destructive">{errors.target}</p>}
              </div>
              <Button type="submit" className="w-full rounded-2xl py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                Begin 15-Minute Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Your data stays private. No spam, we promise.
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

// ─── TEST INTERFACE ─────────────────────────────────────
const TestInterface = ({
  sectionFilter,
  onComplete,
}: {
  sectionFilter: SectionFilter;
  onComplete: (answers: Record<number, number>, timeTaken: number) => void;
}) => {
  const filtered = getFilteredQuestions(sectionFilter);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      const elapsed = Math.round((Date.now() - startRef.current) / 1000);
      onComplete(answers, elapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const selectAnswer = (optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [filtered[current].id]: optIdx }));
  };

  const submit = () => {
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    onComplete(answers, elapsed);
  };

  const q = filtered[current];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((current + 1) / filtered.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Header bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {current + 1} of {filtered.length}
          </span>
          <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1 rounded-lg ${
            timeLeft <= 60 ? "text-destructive bg-destructive/5" : "text-foreground bg-muted"
          }`}>
            <Clock className="h-4 w-4" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </div>

        <Progress value={progress} className="mb-6 h-2 rounded-full" />

        {/* Answered count */}
        <p className="text-xs text-muted-foreground mb-4">
          {answeredCount} of {filtered.length} answered
        </p>

        {/* Question card */}
        <Card className="rounded-2xl shadow-md border-0 mb-6">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs capitalize">{q.section}</Badge>
              <Badge variant="secondary" className="text-xs capitalize">{q.difficulty}</Badge>
            </div>
            <p className="text-lg font-semibold text-foreground mb-6 leading-relaxed">{q.question}</p>
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                    answers[q.id] === idx
                      ? "border-primary bg-primary/5 text-foreground shadow-sm"
                      : "border-border hover:border-primary/30 text-foreground/80 hover:bg-muted/30"
                  }`}
                >
                  <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold mr-3 shrink-0 ${
                    answers[q.id] === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          {current < filtered.length - 1 ? (
            <Button onClick={() => setCurrent((p) => p + 1)} className="rounded-xl">
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} className="rounded-xl font-semibold px-6">
              Submit Test <CheckCircle2 className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
};

// ─── RESULTS ────────────────────────────────────────────
const bandConfig: Record<string, { color: string; bg: string }> = {
  Foundational: { color: "text-destructive", bg: "bg-destructive/5" },
  Developing: { color: "text-orange-600", bg: "bg-orange-50" },
  Competitive: { color: "text-yellow-600", bg: "bg-yellow-50" },
  Advanced: { color: "text-green-600", bg: "bg-green-50" },
};

const ResultsSection = ({ result, onRetake }: { result: AssessmentResult; onRetake: () => void }) => {
  const navigate = useNavigate();
  const insight = generateInsight(result);
  const stored = getStored();
  const bc = bandConfig[result.band] || { color: "text-foreground", bg: "bg-muted" };

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <motion.div {...fadeUp} className="space-y-6">
        {/* Score hero */}
        <Card className="rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 via-background to-primary/3 pt-10 pb-10 text-center">
            {stored?.name && (
              <p className="text-sm text-muted-foreground mb-2">Great effort, <span className="font-semibold text-foreground">{stored.name}</span>!</p>
            )}
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-3">Your CAT Readiness Index</p>

            <div className="relative inline-flex items-center justify-center w-36 h-36 rounded-full border-4 border-primary/20">
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground leading-none">{result.readinessIndex}</p>
                <p className="text-sm text-muted-foreground">/100</p>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 mt-5 px-5 py-2 rounded-full ${bc.bg}`}>
              <Award className={`h-4 w-4 ${bc.color}`} />
              <span className={`text-sm font-bold ${bc.color}`}>{result.band}</span>
            </div>
          </div>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Target, label: "Accuracy", value: `${result.accuracyPercent}%`, sub: `${result.correctCount}/${result.totalQuestions} correct` },
            { icon: Clock, label: "Avg Time/Q", value: `${result.avgTimePerQuestion}s`, sub: `${result.timeTaken}s total` },
            { icon: Zap, label: "Time Efficiency", value: `${result.timeScore}/20`, sub: "Speed score" },
            { icon: BarChart3, label: "Difficulty Score", value: `${result.difficultyScore}/30`, sub: "Weighted score" },
          ].map((s) => (
            <Card key={s.label} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="pt-5 pb-5 text-center">
                <s.icon className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section breakdown */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> Section-wise Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["quant", "lrdi", "varc"] as const).map((sec) => {
              const d = result.sectionBreakdown[sec];
              const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
              return (
                <div key={sec}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold uppercase text-foreground">{sec}</span>
                    <span className="text-sm font-bold text-foreground">{d.correct}/{d.total} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <Progress value={pct} className="h-2.5 rounded-full" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Difficulty breakdown */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Difficulty-wise Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["easy", "medium", "hard"] as const).map((diff) => {
              const d = result.difficultyBreakdown[diff];
              const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
              return (
                <div key={diff}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold capitalize text-foreground">{diff}</span>
                    <span className="text-sm font-bold text-foreground">{d.correct}/{d.total} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <Progress value={pct} className="h-2.5 rounded-full" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Insight */}
        <Card className="rounded-2xl border-0 shadow-sm border-l-4 border-l-primary">
          <CardContent className="pt-6 pb-6">
            <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Personalized Insight
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="rounded-2xl border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 pt-10 pb-10 text-center px-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Ready to Bridge the Gap?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Get structured mentoring from 99+ percentilers and turn your readiness into results.
            </p>
            <Button
              size="lg"
              className="rounded-2xl px-10 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/masterclass")}
            >
              Book Free CAT Strategy Call <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Retake */}
        <div className="text-center pt-2 pb-8">
          <Button variant="outline" className="rounded-xl" onClick={onRetake}>
            Retake Assessment
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

// ─── FOOTER ─────────────────────────────────────────────
const MiniFooter = () => (
  <footer className="border-t py-8 text-center">
    <p className="text-xs text-muted-foreground">
      © {new Date().getFullYear()} Percentilers. Built by 7x 100 percentilers. All rights reserved.
    </p>
  </footer>
);

// ─── MAIN PAGE ──────────────────────────────────────────
const CATReadinessAssessment = () => {
  const [phase, setPhase] = useState<Phase>("hero");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("mix");

  // Restore completed assessment on mount
  useEffect(() => {
    const stored = getStored();
    if (stored?.completed && stored.answers && stored.timeTaken !== undefined) {
      if (stored.section_filter) setSectionFilter(stored.section_filter);
      const filtered = getFilteredQuestions(stored.section_filter || "mix");
      const r = computeScore(filtered, stored.answers, stored.timeTaken, stored.target_percentile);
      setResult(r);
      setPhase("results");
    }
  }, []);

  const handleTestComplete = useCallback(
    (answers: Record<number, number>, timeTaken: number) => {
      const stored = getStored();
      const target = stored?.target_percentile || "90+";
      setStored({ answers, timeTaken, completed: true });
      const filtered = getFilteredQuestions(sectionFilter);
      const r = computeScore(filtered, answers, timeTaken, target);
      setResult(r);
      setPhase("results");
    },
    [sectionFilter]
  );

  const handleRetake = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResult(null);
    setSectionFilter("mix");
    setPhase("hero");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLanding = phase === "hero";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Landing page sections — only show on hero phase */}
      {isLanding && (
        <>
          <HeroSection onStart={() => {
            document.getElementById("start-assessment")?.scrollIntoView({ behavior: "smooth" });
          }} />
          <SectionSelector selected={sectionFilter} onSelect={setSectionFilter} onStartAssessment={() => setPhase("lead")} />
          <HowItWorks />
          <TrustSection />

          {/* Final CTA */}
          <section className="py-16 text-center px-4">
            <motion.div {...fadeUp}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to find out where you stand?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Start your free 15-minute assessment now and get your personalized CAT Readiness Index.
              </p>
              <Button
                size="lg"
                className="rounded-2xl px-10 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                onClick={() => setPhase("lead")}
              >
                Start Assessment Now <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </motion.div>
          </section>
        </>
      )}

      {phase === "lead" && <LeadCapture sectionFilter={sectionFilter} onSubmit={() => setPhase("test")} />}
      {phase === "test" && <TestInterface sectionFilter={sectionFilter} onComplete={handleTestComplete} />}
      {phase === "results" && result && <ResultsSection result={result} onRetake={handleRetake} />}

      <MiniFooter />
    </main>
  );
};

export default CATReadinessAssessment;
