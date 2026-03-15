import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Target, TrendingUp, Award, Lock, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";
import ReactMarkdown from "react-markdown";

type Step = "form" | "result";

interface FormData {
  tenth_score: string;
  twelfth_score: string;
  grad_score: string;
  grad_stream: string;
  gender: string;
  workex_months: string;
  gap_years: string;
  internships: string;
  certifications: string;
}

interface Results {
  profile_score: number;
  target_top10: number;
  target_top20: number;
  target_top30: number;
  strength: string;
}

const initialForm: FormData = {
  tenth_score: "",
  twelfth_score: "",
  grad_score: "",
  grad_stream: "Engineer",
  gender: "Male",
  workex_months: "0",
  gap_years: "0",
  internships: "0",
  certifications: "0",
};

function calculateScores(data: FormData): Results | "not_eligible" {
  const tenth = Math.round(Math.min(Number(data.tenth_score) || 0, 100));
  const twelfth = Math.round(Math.min(Number(data.twelfth_score) || 0, 100));
  const grad = Math.round(Math.min(Number(data.grad_score) || 0, 100));

  if (tenth < 45 || twelfth < 45 || grad < 45) {
    return "not_eligible";
  }

  const workex = Number(data.workex_months) || 0;
  const gaps = Number(data.gap_years) || 0;
  const internships = Number(data.internships) || 0;
  const certs = Number(data.certifications) || 0;

  const academicScore = (tenth / 100) * 10 + (twelfth / 100) * 15 + (grad / 100) * 15;

  let workScore = 0;
  if (workex >= 1 && workex <= 12) workScore = 5;
  else if (workex <= 24) workScore = 8;
  else if (workex <= 36) workScore = 10;
  else if (workex > 36) workScore = 8;

  let boostScore = Math.min(internships * 2, 8) + Math.min(certs * 1.5, 6);
  boostScore = Math.max(boostScore - gaps * 3, 0);
  boostScore = Math.min(boostScore, 20);

  const genderScore = data.gender === "Female" ? 5 : 0;

  const profileScore = Math.min(academicScore + workScore + boostScore + genderScore, 100);

  let top10 = 98;
  let top20 = 95;
  let top30 = 92;

  if (data.grad_stream === "Engineer") {
    top10 += 1; top20 += 0.8; top30 += 0.5;
  } else {
    top10 -= 0.8; top20 -= 0.5; top30 -= 0.3;
  }

  const profileFactor = (profileScore - 50) / 100;
  top10 = Math.min(Math.max(top10 - profileFactor * 2, 95), 99.9);
  top20 = Math.min(Math.max(top20 - profileFactor * 2, 90), 98);
  top30 = Math.min(Math.max(top30 - profileFactor * 2, 85), 96);

  let strength = "Moderate";
  if (profileScore >= 70) strength = "Strong";
  else if (profileScore >= 55) strength = "Competitive";

  return {
    profile_score: Math.round(profileScore * 10) / 10,
    target_top10: Math.round(top10 * 10) / 10,
    target_top20: Math.round(top20 * 10) / 10,
    target_top30: Math.round(top30 * 10) / 10,
    strength,
  };
}

const SelectOption = ({
  label, value, selected, onClick,
}: { label: string; value: string; selected: boolean; onClick: (v: string) => void }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
      selected
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-background text-foreground hover:border-primary/40"
    }`}
  >
    {label}
  </button>
);

function getInsight(results: Results): string {
  if (results.strength === "Strong") {
    return "Your academic profile is strong. Focus on maintaining CAT preparation consistency — a structured plan will help you convert your profile into IIM calls.";
  }
  if (results.strength === "Competitive") {
    return "Your profile is competitive but there's room to strengthen it. A higher CAT score can compensate — focus on targeted prep and mock analysis.";
  }
  return "Your profile needs a strong CAT score to compensate. Start early, focus on fundamentals, and take sectional tests regularly to build accuracy.";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PercentilePlannerModal({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>(initialForm);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [roadmapText, setRoadmapText] = useState("");
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user, signIn } = useAuth();
  const { hasPhone, refetch: refetchPhone } = useLeadPhone();
  const [signingIn, setSigningIn] = useState(false);

  const progress = step === "form" ? 50 : 100;
  const twelfthRef = useRef<HTMLInputElement>(null);
  const gradRef = useRef<HTMLInputElement>(null);
  const workexRef = useRef<HTMLInputElement>(null);

  const handleAcademicChange = (key: keyof FormData, val: string, nextRef?: React.RefObject<HTMLInputElement>) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 2);
    update(key, cleaned);
    if (cleaned.length === 2 && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const [notEligible, setNotEligible] = useState(false);

  // STEP 1 & 2: Allow fill WITHOUT sign-in, show FULL result
  const handleSubmit = () => {
    setLoading(true);
    const result = calculateScores(form);
    if (result === "not_eligible") {
      setNotEligible(true);
      setResults(null);
      setLoading(false);
      setStep("result");
      return;
    }
    setNotEligible(false);
    setResults(result);
    setLoading(false);
    setStep("result");
  };

  const saveResults = async (scores: Results) => {
    const phone = localStorage.getItem("percentilers_phone") || "";
    const name = user?.user_metadata?.full_name || "";
    if (!phone && !user?.id) return;
    
    await supabase.from("profile_percentile_planner").insert({
      phone_number: phone || user?.email || "unknown",
      tenth_score: Number(form.tenth_score) || null,
      twelfth_score: Number(form.twelfth_score) || null,
      grad_score: Number(form.grad_score) || null,
      grad_stream: form.grad_stream,
      workex_months: Number(form.workex_months) || null,
      gap_years: Number(form.gap_years) || null,
      internships: Number(form.internships) || null,
      certifications: Number(form.certifications) || null,
      competition_level: form.gender,
      profile_score: scores.profile_score,
      target_top10: scores.target_top10,
      target_top20: scores.target_top20,
      target_top30: scores.target_top30,
    });
  };

  // STEP 3: "Unlock My Personalized Plan" button handler
  const handleUnlockRoadmap = async () => {
    if (!isAuthenticated) {
      setSigningIn(true);
      sessionStorage.setItem("planner_pending", JSON.stringify({ form, results, notEligible }));
      await signIn();
      return;
    }
    // Authenticated — check phone
    if (!hasPhone) {
      setShowPhoneModal(true);
    } else {
      setShowRoadmap(true);
      if (results) {
        saveResults(results);
        streamRoadmap(results);
      }
    }
  };

  const streamRoadmap = async (scores: Results) => {
    setRoadmapLoading(true);
    setRoadmapText("");
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-roadmap`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            profile_score: scores.profile_score,
            strength: scores.strength,
            target_top10: scores.target_top10,
            target_top20: scores.target_top20,
            target_top30: scores.target_top30,
            tenth_score: Number(form.tenth_score) || 0,
            twelfth_score: Number(form.twelfth_score) || 0,
            grad_score: Number(form.grad_score) || 0,
            grad_stream: form.grad_stream,
            gender: form.gender,
            workex_months: Number(form.workex_months) || 0,
            gap_years: Number(form.gap_years) || 0,
            internships: Number(form.internships) || 0,
            certifications: Number(form.certifications) || 0,
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to generate roadmap");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setRoadmapText(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error("Roadmap generation error:", err);
      toast({ title: "Could not generate roadmap", description: "Please try again.", variant: "destructive" });
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handlePhoneSuccess = () => {
    refetchPhone();
    setShowRoadmap(true);
    if (results) {
      saveResults(results);
      streamRoadmap(results);
    }
  };

  // Restore state after OAuth redirect
  useEffect(() => {
    const pending = sessionStorage.getItem("planner_pending");
    if (pending && isAuthenticated) {
      try {
        const { form: savedForm, results: savedResults, notEligible: savedNotEligible } = JSON.parse(pending);
        sessionStorage.removeItem("planner_pending");
        setForm(savedForm);
        setResults(savedResults);
        setNotEligible(savedNotEligible);
        setStep("result");
        onOpenChange(true);
        // After sign-in, check if phone exists
        refetchPhone();
      } catch {
        sessionStorage.removeItem("planner_pending");
      }
    }
  }, [isAuthenticated]);

  // After auth redirect, if phone exists, auto-show roadmap
  useEffect(() => {
    if (isAuthenticated && step === "result" && results && !showRoadmap && !roadmapLoading) {
      if (hasPhone) {
        setShowRoadmap(true);
        saveResults(results);
        streamRoadmap(results);
      }
    }
  }, [isAuthenticated, hasPhone, step, results]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("form");
      setForm(initialForm);
      setResults(null);
      setShowRoadmap(false);
      setRoadmapText("");
      setRoadmapLoading(false);
      setNotEligible(false);
      setSigningIn(false);
    }, 300);
  };

  const update = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              CAT Target Percentile Planner
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in your academic profile to find your target CAT percentile.
            </DialogDescription>
          </DialogHeader>

          <Progress value={progress} className="h-1.5 mb-4 [&>div]:bg-primary" />

          {/* Form Step — NO sign-in required */}
          {step === "form" && (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Academic Scores (%)</h3>
                <p className="text-[11px] text-primary/70 italic">
                  (Enter percentages in integer. Conversion: Percentage = CGPA × 9)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">10th</label>
                    <Input type="number" placeholder="85%" value={form.tenth_score} onChange={(e) => handleAcademicChange("tenth_score", e.target.value, twelfthRef)} min={0} max={100} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">12th</label>
                    <Input ref={twelfthRef} type="number" placeholder="82%" value={form.twelfth_score} onChange={(e) => handleAcademicChange("twelfth_score", e.target.value, gradRef)} min={0} max={100} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Graduation</label>
                    <Input ref={gradRef} type="number" placeholder="75%" value={form.grad_score} onChange={(e) => handleAcademicChange("grad_score", e.target.value, workexRef)} min={0} max={100} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Graduation Stream</h3>
                <div className="flex gap-2">
                  <SelectOption label="Engineer" value="Engineer" selected={form.grad_stream === "Engineer"} onClick={(v) => update("grad_stream", v)} />
                  <SelectOption label="Non-Engineer" value="Non-Engineer" selected={form.grad_stream === "Non-Engineer"} onClick={(v) => update("grad_stream", v)} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Gender</h3>
                <div className="flex gap-2">
                  <SelectOption label="Male" value="Male" selected={form.gender === "Male"} onClick={(v) => update("gender", v)} />
                  <SelectOption label="Female" value="Female" selected={form.gender === "Female"} onClick={(v) => update("gender", v)} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Work Experience (months)</h3>
                <Input ref={workexRef} type="number" placeholder="0" value={form.workex_months} onChange={(e) => update("workex_months", e.target.value)} min={0} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Gap Years</label>
                  <Input type="number" value={form.gap_years} onChange={(e) => update("gap_years", e.target.value)} min={0} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Internships</label>
                  <Input type="number" value={form.internships} onChange={(e) => update("internships", e.target.value)} min={0} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Certifications</label>
                  <Input type="number" value={form.certifications} onChange={(e) => update("certifications", e.target.value)} min={0} />
                </div>
              </div>

              <Button onClick={handleSubmit} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? "Calculating..." : "Get My Target Percentile"}
              </Button>
            </div>
          )}

          {/* Not Eligible */}
          {step === "result" && notEligible && (
            <div className="text-center space-y-4 py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mx-auto">
                <Lock className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Not Eligible for CAT</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                A minimum of 45% in 10th, 12th, and Graduation is required to be eligible for CAT.
              </p>
              <Button variant="outline" onClick={handleClose}>Close</Button>
            </div>
          )}

          {/* Result Step — FULL result shown, NO gate */}
          {step === "result" && !notEligible && results && (
            <div className="space-y-5">
              {/* Profile Strength + Percentile bands — always visible */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                  <Award className="w-4 h-4" />
                  Your Profile Strength: {results.strength}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Profile Score: {results.profile_score}/100
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <p className="text-sm font-semibold text-foreground">
                  To realistically compete for:
                </p>
                <div className="space-y-2">
                  {[
                    { icon: Target, label: "Top 10 B-Schools", value: results.target_top10 },
                    { icon: TrendingUp, label: "Top 20 B-Schools", value: results.target_top20 },
                    { icon: Award, label: "Top 30 B-Schools", value: results.target_top30 },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between bg-secondary/50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">Aim for {value}+</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improve Profile CTA */}
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
                <a href="https://online.percentilers.in/courses/Foundation-Building-Course" target="_blank" rel="noopener noreferrer">
                  Improve Your Profile <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>

              {/* 1 Short Insight — always visible */}
              <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-1">
                <p className="text-xs font-semibold text-foreground">💡 Quick Insight</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{getInsight(results)}</p>
              </div>

              {/* UPGRADE BLOCK — Gate for deeper roadmap */}
              {!showRoadmap && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 text-center space-y-3">
                  <Sparkles className="w-6 h-6 text-primary mx-auto" />
                  <h3 className="text-base font-bold text-foreground">Want a Personalized CAT Execution Roadmap?</h3>
                  <p className="text-xs text-muted-foreground">Get a structured improvement plan based on your profile.</p>
                  <Button onClick={handleUnlockRoadmap} disabled={signingIn} className="w-full">
                    {signingIn ? "Signing in..." : "Unlock My Personalized Plan"} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Detailed Roadmap — only after sign-in + phone */}
              {showRoadmap && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 text-center space-y-2">
                    <Sparkles className="w-6 h-6 text-primary mx-auto" />
                    <h3 className="text-base font-bold text-foreground">Want a Personalized CAT Execution Roadmap?</h3>
                    <p className="text-xs text-muted-foreground">Get a structured improvement plan based on your profile.</p>
                  </div>

                  {roadmapLoading && !roadmapText && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Generating your personalized roadmap...
                    </div>
                  )}

                  {roadmapText && (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground [&_strong]:text-foreground [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:space-y-1 [&_ol]:space-y-1 [&_p]:leading-relaxed">
                      <ReactMarkdown>{roadmapText}</ReactMarkdown>
                    </div>
                  )}

                  {!roadmapLoading && roadmapText && (
                    <Button className="w-full" onClick={() => { handleClose(); setTimeout(() => navigate("/cat-daily-study-planner"), 300); }}>
                      Start My Daily Study Plan <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Phone capture modal */}
      <PhoneCaptureModal
        open={showPhoneModal}
        onOpenChange={setShowPhoneModal}
        source="profile_planner_roadmap"
        onSuccess={handlePhoneSuccess}
      />
    </>
  );
}
