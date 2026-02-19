import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { questions, type Section } from "@/data/readinessQuestions";
import { computeScore, generateInsight, type AssessmentResult } from "@/lib/readinessScoring";
import { useAuth } from "@/hooks/useAuth";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock, CheckCircle2, ArrowLeft, ArrowRight, Target,
  BarChart3, Zap, Brain, ChevronRight, Shield, Users,
  TrendingUp, BookOpen, Calculator, PuzzleIcon, FileText,
  Shuffle, Award, Timer, ClipboardList, Trophy, Phone, GraduationCap, Lock } from
"lucide-react";

type Phase = "hero" | "test" | "results";
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
  if (filter === "mix") {
    const sections: Section[] = ["quant", "lrdi", "varc"];
    const picked: typeof questions = [];
    for (const sec of sections) {
      const pool = questions.filter((q) => q.section === sec);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      picked.push(...shuffled.slice(0, picked.length === 0 ? 4 : 3));
    }
    return picked;
  }
  return questions.filter((q) => q.section === filter);
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// ─── NAVBAR ─────────────────────────────────────────────
const Navbar = () =>
<nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
    <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
      <a href="/" className="text-lg md:text-xl font-bold text-foreground tracking-tight">
        Percentilers
      </a>
      <div className="flex items-center gap-2 md:gap-3">
        <Badge variant="secondary" className="text-xs font-medium hidden sm:inline-flex">
          100% Free
        </Badge>
        <Button size="sm" className="rounded-xl font-semibold text-xs md:text-sm px-3 md:px-4" asChild>
          <a href="#start-assessment">Take Assessment</a>
        </Button>
      </div>
    </div>
  </nav>;


// ─── HERO ───────────────────────────────────────────────
const HeroSection = ({ onStart }: {onStart: () => void;}) =>
<section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.04),transparent_50%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.03),transparent_50%)]" />

    <div className="relative max-w-5xl mx-auto px-4 pt-12 md:pt-20 pb-10 md:pb-16 text-center">
      <motion.div {...fadeUp}>
        <div className="inline-flex items-center gap-1.5 md:gap-2 bg-primary/5 border border-primary/10 rounded-full px-3 md:px-5 py-1.5 md:py-2 mb-6 md:mb-8">
          <Award className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
          <span className="text-xs md:text-sm font-semibold text-foreground">Trusted by 10,000+ CAT Aspirants</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.15] max-w-4xl mx-auto">
          Know Exactly Where You Stand for{" "}
          <span className="text-primary">CAT 2026</span>
        </h1>

        <p className="mt-4 md:mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Get a structured, AI-scored performance report in just 15 minutes.
          Identify your strengths, weaknesses, and the exact gaps between you and your target percentile.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 md:gap-4 mt-8 md:mt-10">
          <Button size="lg"
        className="text-base px-8 md:px-10 py-5 md:py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
        onClick={onStart}>
            Start Free Assessment <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>Takes only 15 minutes</span>
          </div>
        </div>
      </motion.div>

      <motion.div
      {...fadeUp}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mt-10 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
        {[
      { value: "10K+", label: "Assessments Taken" },
      { value: "4.8★", label: "User Rating" },
      { value: "15 min", label: "Quick & Precise" },
      { value: "Free", label: "No Card Required" }].
      map((m) =>
      <div key={m.label} className="text-center py-3 md:py-4">
            <p className="text-xl md:text-3xl font-bold text-foreground">{m.value}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{m.label}</p>
          </div>
      )}
      </motion.div>
    </div>
  </section>;


// ─── SECTION SELECTOR ───────────────────────────────────
const sectionOptions: {key: SectionFilter;label: string;icon: typeof Calculator;desc: string;}[] = [
{ key: "quant", label: "Quantitative Aptitude", icon: Calculator, desc: "Arithmetic, Algebra, Geometry & Number Systems" },
{ key: "lrdi", label: "LRDI", icon: PuzzleIcon, desc: "Logical Reasoning & Data Interpretation" },
{ key: "varc", label: "VARC", icon: BookOpen, desc: "Verbal Ability & Reading Comprehension" },
{ key: "mix", label: "Mixed (All Sections)", icon: Shuffle, desc: "A balanced mix of all three sections" }];


const SectionSelector = ({
  selected,
  onSelect,
  onStartAssessment
}: {selected: SectionFilter;onSelect: (s: SectionFilter) => void;onStartAssessment: () => void;}) =>
<section className="py-12 md:py-20" id="start-assessment">
    <div className="max-w-4xl mx-auto px-4">
      <motion.div {...fadeUp} className="text-center mb-8 md:mb-12">
        <Badge variant="secondary" className="mb-3 md:mb-4 text-xs font-medium uppercase tracking-wider px-3 md:px-4 py-1.5">
          Choose Your Focus
        </Badge>
        <h2 className="text-xl md:text-3xl font-bold text-foreground">
          What would you like to test yourself on?
        </h2>
        <p className="text-muted-foreground mt-2 md:mt-3 max-w-lg mx-auto text-sm md:text-base">
          Pick a section to deep-dive or go mixed for a full diagnostic.
        </p>
      </motion.div>

      <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {sectionOptions.map((opt) => {
        const isActive = selected === opt.key;
        return (
          <motion.div key={opt.key} variants={fadeUp}>
              <button
              onClick={() => onSelect(opt.key)}
              className={`w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 group ${
              isActive ?
              "border-primary bg-primary/[0.03] shadow-md shadow-primary/5" :
              "border-border bg-background hover:border-primary/20 hover:shadow-sm"}`
              }>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-colors shrink-0 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                    <opt.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm md:text-base">{opt.label}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 leading-relaxed">{opt.desc}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground mt-1.5 md:mt-2">10 Questions · 15 min</p>
                  </div>
                  <div className={`shrink-0 mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isActive ? "border-primary bg-primary" : "border-muted-foreground/30"}`
                }>
                    {isActive && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                  </div>
                </div>
              </button>
            </motion.div>);
      })}
      </motion.div>

      <motion.div {...fadeUp} className="text-center mt-8 md:mt-10">
        <Button
        size="lg"
        className="rounded-2xl px-8 md:px-12 py-5 md:py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
        onClick={onStartAssessment}>
          Take Assessment <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          {sectionOptions.find((o) => o.key === selected)?.label} · 10 Questions · Completely Free
        </p>
      </motion.div>
    </div>
  </section>;


// ─── HOW IT WORKS ───────────────────────────────────────
const HowItWorks = () =>
<section className="py-12 md:py-16">
    <div className="max-w-4xl mx-auto px-4">
      <motion.div {...fadeUp} className="text-center mb-8 md:mb-12">
        <h2 className="text-xl md:text-3xl font-bold text-foreground">How It Works</h2>
        <p className="text-muted-foreground mt-2 md:mt-3 text-sm md:text-base">Three simple steps to your personalized readiness report.</p>
      </motion.div>

      <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[
      { step: "01", icon: ClipboardList, title: "Choose a Section", desc: "Pick your focus area or take a balanced mixed assessment." },
      { step: "02", icon: FileText, title: "Answer 10 Questions", desc: "Carefully crafted questions across difficulty levels — complete in 15 minutes." },
      { step: "03", icon: TrendingUp, title: "Get Your Report", desc: "Receive your CAT Readiness Index with score, rank, and personalized insight." }].
      map((s) =>
      <motion.div key={s.step} variants={fadeUp}>
            <Card className="rounded-2xl border-0 shadow-sm h-full">
              <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6 text-center">
                <span className="text-xs font-bold text-primary tracking-widest">STEP {s.step}</span>
                <div className="mx-auto mt-2.5 md:mt-3 mb-3 md:mb-4 inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/5">
                  <s.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1.5 md:mb-2 text-sm md:text-base">{s.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
      )}
      </motion.div>
    </div>
  </section>;


// ─── TRUST SECTION ──────────────────────────────────────
const TrustSection = () =>
<section className="py-10 md:py-12 bg-secondary/30">
    <div className="max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center">
        {[
      { icon: Shield, title: "100% Free", desc: "No payment, no card, no hidden charges. Ever." },
      { icon: Brain, title: "Smart Scoring", desc: "Weighted scoring across difficulty, speed, and accuracy." },
      { icon: Users, title: "Built by 99%ilers", desc: "Designed by mentors who scored 99+ percentile in CAT." }].
      map((t) =>
      <div key={t.title} className="flex flex-col items-center gap-2 md:gap-3 py-3 md:py-4">
            <div className="p-2.5 md:p-3 rounded-xl bg-primary/5">
              <t.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-sm">{t.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[220px]">{t.desc}</p>
          </div>
      )}
      </div>
    </div>
  </section>;


// ─── TEST INTERFACE ─────────────────────────────────────
const TestInterface = ({
  sectionFilter,
  onComplete
}: {sectionFilter: SectionFilter;onComplete: (answers: Record<number, number>, timeTaken: number) => void;}) => {
  const filtered = useMemo(() => getFilteredQuestions(sectionFilter), [sectionFilter]);
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
  const progress = (current + 1) / filtered.length * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <section className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-muted-foreground">
            Question {current + 1} of {filtered.length}
          </span>
          <div className={`flex items-center gap-1.5 font-mono text-xs md:text-sm font-bold px-2.5 md:px-3 py-1 rounded-lg ${
          timeLeft <= 60 ? "text-destructive bg-destructive/5" : "text-foreground bg-muted"}`
          }>
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </div>

        <Progress value={progress} className="mb-4 md:mb-6 h-2 rounded-full" />

        <p className="text-[10px] md:text-xs text-muted-foreground mb-3 md:mb-4">
          {answeredCount} of {filtered.length} answered
        </p>

        <Card className="rounded-2xl shadow-md border-0 mb-4 md:mb-6">
          <CardContent className="pt-4 pb-4 md:pt-6 md:pb-6 px-4 md:px-6">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Badge variant="outline" className="text-[10px] md:text-xs capitalize">{q.section}</Badge>
              <Badge variant="secondary" className="text-[10px] md:text-xs capitalize">{q.difficulty}</Badge>
            </div>
            <p className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6 leading-relaxed">{q.question}</p>
            <div className="space-y-2.5 md:space-y-3">
              {q.options.map((opt, idx) =>
              <button
                key={idx}
                onClick={() => selectAnswer(idx)}
                className={`w-full text-left px-4 md:px-5 py-3 md:py-4 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                answers[q.id] === idx ?
                "border-primary bg-primary/5 text-foreground shadow-sm" :
                "border-border hover:border-primary/30 text-foreground/80 hover:bg-muted/30"}`
                }>
                  <span className={`inline-flex items-center justify-center h-6 w-6 md:h-7 md:w-7 rounded-lg text-[10px] md:text-xs font-bold mr-2.5 md:mr-3 shrink-0 ${
                answers[q.id] === idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`
                }>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="rounded-xl text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Prev
          </Button>

          {current < filtered.length - 1 ?
          <Button onClick={() => setCurrent((p) => p + 1)} className="rounded-xl text-sm">
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button> :
          <Button onClick={submit} className="rounded-xl font-semibold px-4 md:px-6 text-sm">
              Submit <CheckCircle2 className="h-4 w-4 ml-1" />
            </Button>
          }
        </div>
      </motion.div>
    </section>);

};

// ─── RESULTS ────────────────────────────────────────────
const bandConfig: Record<string, {color: string;bg: string;}> = {
  Foundational: { color: "text-destructive", bg: "bg-destructive/5" },
  Developing: { color: "text-orange-600", bg: "bg-orange-50" },
  Competitive: { color: "text-yellow-600", bg: "bg-yellow-50" },
  Advanced: { color: "text-green-600", bg: "bg-green-50" }
};

const ResultsSection = ({ result, onRetake, onRecalculate }: {
  result: AssessmentResult;
  sectionFilter: SectionFilter;
  onRetake: () => void;
  onRecalculate: (target: string) => void;
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, signIn } = useAuth();
  const { hasPhone, refetch: refetchPhone } = useLeadPhone();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [detailsUnlocked, setDetailsUnlocked] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [target, setTarget] = useState("90+");

  // After auth redirect, check for pending unlock
  useEffect(() => {
    if (isAuthenticated) {
      const pendingTarget = sessionStorage.getItem("pending_readiness_target");
      if (pendingTarget) {
        sessionStorage.removeItem("pending_readiness_target");
        setTarget(pendingTarget);
        onRecalculate(pendingTarget);
      }
      // If has phone, auto-unlock details
      if (hasPhone) {
        setDetailsUnlocked(true);
      }
    }
  }, [isAuthenticated, hasPhone]);

  const insight = generateInsight(result);
  const stored = getStored();
  const bc = bandConfig[result.band] || { color: "text-foreground", bg: "bg-muted" };
  const userName = user?.user_metadata?.full_name || stored?.name || "";

  const seed = (user?.email || stored?.phone || "0").split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const baseRank = Math.max(1, Math.round(10000 * (1 - result.readinessIndex / 100)));
  const jitter = (seed * 7 + result.readinessIndex * 13) % 200 - 100;
  const rank = Math.max(1, Math.min(10000, baseRank + jitter));
  const topPercent = Math.max(0.1, Math.round(rank / 10000 * 1000) / 10);

  const handleUnlockDetails = async () => {
    if (!isAuthenticated) {
      setSigningIn(true);
      sessionStorage.setItem("pending_readiness_target", target);
      sessionStorage.setItem("pending_gate_source", "readiness_assessment");
      await signIn();
      return;
    }
    // Authenticated — check phone
    if (!hasPhone) {
      setShowPhoneModal(true);
    } else {
      setDetailsUnlocked(true);
    }
  };

  const handlePhoneSuccess = () => {
    refetchPhone();
    setDetailsUnlocked(true);
  };

  const markLeadHot = (phone: string) => {
    const name = localStorage.getItem("percentilers_name") || "";
    supabase.functions.invoke("mark-lead-hot", {
      body: { phone_number: phone, source: "readiness_strategy_call", name },
    }).catch(() => {});
  };

  const handleStrategyCall = () => {
    const phone = localStorage.getItem("percentilers_phone") || "";
    if (/^\d{10}$/.test(phone)) {
      markLeadHot(phone);
      setShowCallDialog(true);
    } else {
      setShowPhoneModal(true);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-8 md:py-12 relative">
      <motion.div {...fadeUp} className="space-y-4 md:space-y-6">
        {/* Score hero — ALWAYS visible */}
        <Card className="rounded-2xl shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 via-background to-primary/3 pt-8 pb-8 md:pt-10 md:pb-10 text-center px-4">
            {userName &&
            <p className="text-xs md:text-sm text-muted-foreground mb-2">Great effort, <span className="font-semibold text-foreground">{userName}</span>!</p>
            }
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-widest mb-3">Your CAT Readiness Index</p>

            <div className="relative inline-flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-primary/20">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-foreground leading-none">{result.readinessIndex}</p>
                <p className="text-xs md:text-sm text-muted-foreground">/100</p>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 mt-4 md:mt-5 px-4 md:px-5 py-1.5 md:py-2 rounded-full ${bc.bg}`}>
              <Award className={`h-3.5 w-3.5 md:h-4 md:w-4 ${bc.color}`} />
              <span className={`text-xs md:text-sm font-bold ${bc.color}`}>{result.band}</span>
            </div>
          </div>
        </Card>

        {/* Rank card — ALWAYS visible */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-stretch">
              <div className="bg-primary/5 flex items-center justify-center px-4 md:px-6 py-4 md:py-5">
                <Trophy className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <div className="flex-1 flex items-center justify-between px-4 md:px-6 py-4 md:py-5 gap-3 md:gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Your Overall Rank</p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground mt-0.5">#{rank.toLocaleString()} <span className="text-sm md:text-base font-normal text-muted-foreground">/ 10,000+</span></p>
                </div>
                <Badge className={`text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-0.5 md:py-1 ${topPercent <= 10 ? "bg-green-100 text-green-700 border-green-200" : topPercent <= 30 ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-muted text-muted-foreground"}`}>
                  Top {topPercent}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats — ALWAYS visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
          {[
          { icon: Target, label: "Accuracy", value: `${result.accuracyPercent}%`, sub: `${result.correctCount}/${result.totalQuestions} correct` },
          { icon: Clock, label: "Avg Time/Q", value: `${result.avgTimePerQuestion}s`, sub: `${result.timeTaken}s total` },
          { icon: Zap, label: "Time Efficiency", value: `${result.timeScore}/20`, sub: "Speed score" },
          { icon: BarChart3, label: "Difficulty Score", value: `${result.difficultyScore}/30`, sub: "Weighted score" }].
          map((s) =>
          <Card key={s.label} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="pt-4 pb-4 md:pt-5 md:pb-5 text-center px-2 md:px-4">
                <s.icon className="h-4 w-4 md:h-5 md:w-5 mx-auto text-primary mb-1.5 md:mb-2" />
                <p className="text-[10px] md:text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg md:text-xl font-bold text-foreground mt-0.5 md:mt-1">{s.value}</p>
                <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 1 short insight — ALWAYS visible */}
        <Card className="rounded-2xl border-0 shadow-sm border-l-4 border-l-primary">
          <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6 px-4 md:px-6">
            <p className="text-xs md:text-sm font-bold text-foreground mb-1.5 md:mb-2 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" /> Quick Insight
            </p>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{insight}</p>
          </CardContent>
        </Card>

        {/* UNLOCK BUTTON — above blurred sections */}
        {!detailsUnlocked && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs">Target Percentile</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90+">90+</SelectItem>
                    <SelectItem value="95+">95+</SelectItem>
                    <SelectItem value="98+">98+</SelectItem>
                    <SelectItem value="99+">99+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full rounded-2xl py-5 text-base font-semibold"
              onClick={handleUnlockDetails}
              disabled={signingIn}
            >
              {signingIn ? "Signing in..." : "Unlock Detailed Analysis"} <Lock className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Section breakdown — BLURRED unless unlocked */}
        <div className={`transition-all duration-500 ${!detailsUnlocked ? "blur-lg pointer-events-none select-none" : ""}`}>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2 px-4 md:px-6">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Section-wise Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
              {(["quant", "lrdi", "varc"] as const).map((sec) => {
                const d = result.sectionBreakdown[sec];
                const pct = d.total > 0 ? Math.round(d.correct / d.total * 100) : 0;
                return (
                  <div key={sec}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs md:text-sm font-semibold uppercase text-foreground">{sec}</span>
                      <span className="text-xs md:text-sm font-bold text-foreground">{d.correct}/{d.total} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                    </div>
                    <Progress value={pct} className="h-2 md:h-2.5 rounded-full" />
                  </div>);
              })}
            </CardContent>
          </Card>

          {/* Difficulty breakdown */}
          <Card className="rounded-2xl border-0 shadow-sm mt-4">
            <CardHeader className="pb-2 px-4 md:px-6">
              <CardTitle className="text-sm md:text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Difficulty-wise Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
              {(["easy", "medium", "hard"] as const).map((diff) => {
                const d = result.difficultyBreakdown[diff];
                const pct = d.total > 0 ? Math.round(d.correct / d.total * 100) : 0;
                return (
                  <div key={diff}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs md:text-sm font-semibold capitalize text-foreground">{diff}</span>
                      <span className="text-xs md:text-sm font-bold text-foreground">{d.correct}/{d.total} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                    </div>
                    <Progress value={pct} className="h-2 md:h-2.5 rounded-full" />
                  </div>);
              })}
            </CardContent>
          </Card>

          {/* Personalized Insight */}
          <Card className="rounded-2xl border-0 shadow-sm border-l-4 border-l-primary mt-4">
            <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6 px-4 md:px-6">
              <p className="text-xs md:text-sm font-bold text-foreground mb-1.5 md:mb-2 flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" /> Personalized Improvement Analysis
              </p>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{insight}</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="rounded-2xl border-0 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 pt-8 pb-8 md:pt-10 md:pb-10 text-center px-4 md:px-6">
            <h3 className="text-xl md:text-3xl font-bold text-foreground mb-2 md:mb-3">
              Ready to Bridge the Gap?
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto">
              Get structured mentoring from 99+ percentilers and turn your readiness into results.
            </p>
            <Button
              size="lg"
              className="rounded-2xl px-8 md:px-10 py-5 md:py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              onClick={handleStrategyCall}>
              Book Free CAT Strategy Call <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Retake */}
        <div className="text-center pt-2 pb-6 md:pb-8">
          <Button variant="outline" className="rounded-xl" onClick={onRetake}>
            Retake Assessment
          </Button>
        </div>
      </motion.div>

      {/* Phone capture modal */}
      <PhoneCaptureModal
        open={showPhoneModal}
        onOpenChange={setShowPhoneModal}
        source="readiness_assessment"
        onSuccess={handlePhoneSuccess}
      />

      {/* Call Confirmation Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-bold">You just unlocked your Free Nudge call</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Our mentors will help you create a winning strategy for CAT.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button className="w-full rounded-xl py-5 font-semibold" asChild>
              <a href="tel:+919911928071">
                <Phone className="mr-2 h-4 w-4" /> Call Now
              </a>
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl py-5 font-semibold"
              onClick={() => { setShowCallDialog(false); navigate("/mentorship"); }}>
              <GraduationCap className="mr-2 h-4 w-4" /> Mentorship Plans
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-xl text-muted-foreground"
              onClick={() => setShowCallDialog(false)}>
              I'll wait for the call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>);

};

// ─── FOOTER ─────────────────────────────────────────────
const MiniFooter = () =>
<footer className="border-t py-8 text-center">
    <p className="text-xs text-muted-foreground">
      © {new Date().getFullYear()} Percentilers. Built by 7x 100 percentilers. All rights reserved.
    </p>
  </footer>;


// ─── MAIN PAGE ──────────────────────────────────────────
const CATReadinessAssessment = () => {
  const [phase, setPhase] = useState<Phase>("hero");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("mix");

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "CAT Readiness Assessment",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      "description": "Free CAT diagnostic test to evaluate preparation level and identify weak sections.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
      "provider": { "@type": "Organization", "name": "Percentilers" }
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

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
      <SEO
        title="Free CAT Readiness Test | CAT Exam Self-Assessment Tool"
        description="Take the free CAT readiness test to evaluate your CAT exam preparation level. Get performance insights used inside our best CAT coaching program."
        canonical="https://percentilers.in/free-cat-readiness-assessment"
      />
      <Navbar />

      {isLanding &&
      <>
          <HeroSection onStart={() => {
          document.getElementById("start-assessment")?.scrollIntoView({ behavior: "smooth" });
        }} />
          <SectionSelector selected={sectionFilter} onSelect={setSectionFilter} onStartAssessment={() => {
            setStored({ section_filter: sectionFilter, assessment_started_at: new Date().toISOString(), answers: {}, completed: false });
            setPhase("test");
          }} />
          <HowItWorks />
          <TrustSection />

          <section className="py-10 md:py-16 text-center px-4">
            <motion.div {...fadeUp}>
              <h2 className="text-xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">
                Ready to find out where you stand?
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 max-w-lg mx-auto">
                Start your free 15-minute assessment now and get your personalized CAT Readiness Index.
              </p>
              <Button
              size="lg"
              className="rounded-2xl px-8 md:px-10 py-5 md:py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
              onClick={() => {
                setStored({ section_filter: sectionFilter, assessment_started_at: new Date().toISOString(), answers: {}, completed: false });
                setPhase("test");
              }}>
                Start Assessment Now <ChevronRight className="ml-1 h-5 w-5" />
              </Button>
            </motion.div>
          </section>
        </>
      }

      
      {phase === "test" && <TestInterface sectionFilter={sectionFilter} onComplete={handleTestComplete} />}
      {phase === "results" && result && <ResultsSection result={result} sectionFilter={sectionFilter} onRetake={handleRetake} onRecalculate={(target) => {
        const stored = getStored();
        if (stored?.answers && stored.timeTaken !== undefined) {
          const filtered = getFilteredQuestions(sectionFilter);
          const r = computeScore(filtered, stored.answers, stored.timeTaken, target);
          setResult(r);
        }
      }} />}

      <MiniFooter />
    </main>);

};

export default CATReadinessAssessment;
