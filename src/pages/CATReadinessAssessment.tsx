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
import { questions } from "@/data/readinessQuestions";
import { computeScore, generateInsight, type AssessmentResult } from "@/lib/readinessScoring";
import { Clock, CheckCircle2, ArrowLeft, ArrowRight, Target, BarChart3, Zap, Brain, ChevronRight } from "lucide-react";

type Phase = "hero" | "lead" | "test" | "results";

const STORAGE_KEY = "cat_readiness_assessment";
const TOTAL_TIME = 900;

interface StoredData {
  name: string;
  phone: string;
  target_percentile: string;
  assessment_started_at: string;
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

// ─── HERO ───────────────────────────────────────────────
const HeroSection = ({ onStart }: { onStart: () => void }) => (
  <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Badge variant="secondary" className="mb-6 text-xs font-semibold tracking-wider uppercase px-4 py-1.5">
        Free Diagnostic Tool
      </Badge>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
        Free CAT Readiness Assessment
      </h1>
      <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Get a structured performance report in 15 minutes and understand exactly where you stand.
      </p>
      <Button
        size="lg"
        className="mt-8 text-base px-10 py-6 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
        onClick={onStart}
      >
        Start Assessment <ChevronRight className="ml-1 h-5 w-5" />
      </Button>
    </motion.div>
  </section>
);

// ─── LEAD CAPTURE ───────────────────────────────────────
const LeadCapture = ({ onSubmit }: { onSubmit: () => void }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [target, setTarget] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
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
      assessment_started_at: new Date().toISOString(),
      answers: {},
      completed: false,
    });
    onSubmit();
  };

  return (
    <section className="flex items-center justify-center px-4 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Get Your Personalized Performance Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
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
                  className="rounded-xl"
                  maxLength={10}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Target Percentile</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="rounded-xl">
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
              <Button type="submit" className="w-full rounded-2xl py-6 text-base font-semibold shadow-lg">
                Begin 15-Minute Assessment
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

// ─── TEST INTERFACE ─────────────────────────────────────
const TestInterface = ({ onComplete }: { onComplete: (answers: Record<number, number>, timeTaken: number) => void }) => {
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
  }, [timeLeft]);

  const selectAnswer = (optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questions[current].id]: optIdx }));
  };

  const submit = () => {
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    onComplete(answers, elapsed);
  };

  const q = questions[current];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <section className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Timer + progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Question {current + 1} of {questions.length}
          </span>
          <div className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${timeLeft <= 60 ? "text-destructive" : "text-foreground"}`}>
            <Clock className="h-4 w-4" />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </div>
        <Progress value={progress} className="mb-6 h-2 rounded-full" />

        {/* Question card */}
        <Card className="rounded-2xl shadow-md border-0 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-xs capitalize">{q.section}</Badge>
              <Badge variant="secondary" className="text-xs capitalize">{q.difficulty}</Badge>
            </div>
            <p className="text-lg font-semibold text-foreground mb-6">{q.question}</p>
            <div className="space-y-3">
              {q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                    answers[q.id] === idx
                      ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30 text-foreground/80 hover:bg-muted/50"
                  }`}
                >
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border text-xs mr-3 shrink-0">
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

          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((p) => p + 1)} className="rounded-xl">
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} className="rounded-xl font-semibold">
              Submit Test <CheckCircle2 className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
};

// ─── RESULTS ────────────────────────────────────────────
const bandColors: Record<string, string> = {
  Foundational: "text-destructive",
  Developing: "text-orange-500",
  Competitive: "text-yellow-600",
  Advanced: "text-green-600",
};

const ResultsSection = ({ result, onRetake }: { result: AssessmentResult; onRetake: () => void }) => {
  const navigate = useNavigate();
  const insight = generateInsight(result);
  const stored = getStored();

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Top score */}
        <Card className="rounded-2xl shadow-lg border-0 text-center">
          <CardContent className="pt-8 pb-8">
            <p className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-wider">Your CAT Readiness Index</p>
            <p className="text-6xl font-bold text-foreground">{result.readinessIndex}<span className="text-2xl text-muted-foreground">/100</span></p>
            <p className={`mt-3 text-xl font-semibold ${bandColors[result.band] || "text-foreground"}`}>
              {result.band}
            </p>
            {stored?.name && (
              <p className="mt-2 text-sm text-muted-foreground">Well done, {stored.name}!</p>
            )}
          </CardContent>
        </Card>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Target, label: "Accuracy", value: `${result.accuracyPercent}%` },
            { icon: Clock, label: "Avg Time/Q", value: `${result.avgTimePerQuestion}s` },
            { icon: Zap, label: "Time Score", value: `${result.timeScore}/20` },
            { icon: BarChart3, label: "Difficulty Score", value: `${result.difficultyScore}/30` },
          ].map((s) => (
            <Card key={s.label} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="pt-5 pb-5 text-center">
                <s.icon className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
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
          <CardContent className="space-y-3">
            {(["quant", "lrdi", "varc"] as const).map((sec) => {
              const d = result.sectionBreakdown[sec];
              const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
              return (
                <div key={sec} className="flex items-center justify-between">
                  <span className="text-sm font-medium uppercase w-16">{sec}</span>
                  <div className="flex-1 mx-4">
                    <Progress value={pct} className="h-2 rounded-full" />
                  </div>
                  <span className="text-sm font-semibold w-20 text-right">{d.correct}/{d.total} ({pct}%)</span>
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
          <CardContent className="space-y-3">
            {(["easy", "medium", "hard"] as const).map((diff) => {
              const d = result.difficultyBreakdown[diff];
              const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
              return (
                <div key={diff} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize w-16">{diff}</span>
                  <div className="flex-1 mx-4">
                    <Progress value={pct} className="h-2 rounded-full" />
                  </div>
                  <span className="text-sm font-semibold w-20 text-right">{d.correct}/{d.total} ({pct}%)</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Insight */}
        <Card className="rounded-2xl border-0 shadow-sm bg-muted/30">
          <CardContent className="pt-6 pb-6">
            <p className="text-sm font-semibold text-foreground mb-2">📊 Personalized Insight</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="rounded-2xl border-0 shadow-lg bg-primary/5 text-center">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Bridge the Gap to {result.targetPercentile}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Bridge the gap between your current readiness and your target percentile with structured mentoring.
            </p>
            <Button
              size="lg"
              className="rounded-2xl px-10 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => navigate("/masterclass")}
            >
              Book Free CAT Strategy Call <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Retake */}
        <div className="text-center pt-2">
          <Button variant="outline" className="rounded-xl" onClick={onRetake}>
            Retake Assessment
          </Button>
        </div>
      </motion.div>
    </section>
  );
};

// ─── MAIN PAGE ──────────────────────────────────────────
const CATReadinessAssessment = () => {
  const [phase, setPhase] = useState<Phase>("hero");
  const [result, setResult] = useState<AssessmentResult | null>(null);

  // Restore completed assessment on mount
  useEffect(() => {
    const stored = getStored();
    if (stored?.completed && stored.answers && stored.timeTaken !== undefined) {
      const r = computeScore(questions, stored.answers, stored.timeTaken, stored.target_percentile);
      setResult(r);
      setPhase("results");
    }
  }, []);

  const handleTestComplete = useCallback((answers: Record<number, number>, timeTaken: number) => {
    const stored = getStored();
    const target = stored?.target_percentile || "90+";
    setStored({ answers, timeTaken, completed: true });
    const r = computeScore(questions, answers, timeTaken, target);
    setResult(r);
    setPhase("results");
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Minimal navbar */}
      <nav className="border-b py-4 px-6">
        <a href="/" className="text-lg font-bold text-foreground">
          Percentilers
        </a>
      </nav>

      {phase === "hero" && <HeroSection onStart={() => setPhase("lead")} />}
      {phase === "lead" && <LeadCapture onSubmit={() => setPhase("test")} />}
      {phase === "test" && <TestInterface onComplete={handleTestComplete} />}
      {phase === "results" && result && <ResultsSection result={result} onRetake={() => { localStorage.removeItem(STORAGE_KEY); setResult(null); setPhase("hero"); }} />}
    </main>
  );
};

export default CATReadinessAssessment;
