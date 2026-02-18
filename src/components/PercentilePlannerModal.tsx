import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Target, TrendingUp, Award, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Step = "form" | "result";

interface FormData {
  tenth_score: string;
  twelfth_score: string;
  grad_score: string;
  grad_stream: string;
  workex_months: string;
  gap_years: string;
  internships: string;
  certifications: string;
  competition_level: string;
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
  workex_months: "0",
  gap_years: "0",
  internships: "0",
  certifications: "0",
  competition_level: "Top 20",
};

function calculateScores(data: FormData): Results {
  const tenth = Math.min(Number(data.tenth_score) || 0, 100);
  const twelfth = Math.min(Number(data.twelfth_score) || 0, 100);
  const grad = Math.min(Number(data.grad_score) || 0, 100);
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

  let compScore = 15;
  if (data.competition_level === "Top 10") compScore = 20;
  else if (data.competition_level === "Top 30") compScore = 10;

  const profileScore = Math.min(academicScore + workScore + boostScore + compScore, 100);

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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PercentilePlannerModal({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>(initialForm);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showLeadPopup, setShowLeadPopup] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const { toast } = useToast();

  const progress = step === "form" ? 50 : 100;

  const handleSubmit = () => {
    setLoading(true);
    const scores = calculateScores(form);
    setResults(scores);
    setLoading(false);
    setStep("result");

    // Check if already registered
    const storedPhone = localStorage.getItem("percentilers_phone") || localStorage.getItem("planner_phone") || "";
    const storedName = localStorage.getItem("percentilers_name") || localStorage.getItem("planner_name") || "";
    if (/^\d{10}$/.test(storedPhone) && storedName) {
      setUnlocked(true);
      // Save in background
      saveResults(storedPhone, storedName, scores);
    } else {
      setUnlocked(false);
      setShowLeadPopup(true);
    }
  };

  const saveResults = async (phone: string, name: string, scores: Results) => {
    await supabase.from("profile_percentile_planner").insert({
      phone_number: phone,
      tenth_score: Number(form.tenth_score) || null,
      twelfth_score: Number(form.twelfth_score) || null,
      grad_score: Number(form.grad_score) || null,
      grad_stream: form.grad_stream,
      workex_months: Number(form.workex_months) || null,
      gap_years: Number(form.gap_years) || null,
      internships: Number(form.internships) || null,
      certifications: Number(form.certifications) || null,
      competition_level: form.competition_level,
      profile_score: scores.profile_score,
      target_top10: scores.target_top10,
      target_top20: scores.target_top20,
      target_top30: scores.target_top30,
    });
    await supabase.from("leads").upsert(
      { phone_number: phone, name, source: "profile_planner" },
      { onConflict: "phone_number" }
    );
  };

  const sanitizeName = (val: string) => val.replace(/[^a-zA-Z\s.'-]/g, "").slice(0, 100);

  const handleLeadSubmit = async () => {
    const trimmedName = leadName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      toast({ title: "Invalid name", description: "Please enter at least 2 characters.", variant: "destructive" });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(leadPhone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }
    setLeadSubmitting(true);
    try {
      localStorage.setItem("percentilers_phone", leadPhone);
      localStorage.setItem("percentilers_name", trimmedName);
      if (results) await saveResults(leadPhone, trimmedName, results);
      setUnlocked(true);
      setShowLeadPopup(false);
      toast({ title: "Results unlocked!", description: "Here are your target percentiles." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("form");
      setForm(initialForm);
      setResults(null);
      setUnlocked(false);
      setShowLeadPopup(false);
      setLeadName("");
      setLeadPhone("");
    }, 300);
  };

  const update = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            CAT Target Percentile Planner
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Fill in your academic profile to find your target CAT percentile.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1.5 mb-4 [&>div]:bg-primary" />

        {/* Form Step */}
        {step === "form" && (
          <div className="space-y-5">
            {/* Academics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Academic Scores (%)</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">10th</label>
                  <Input type="number" placeholder="85" value={form.tenth_score} onChange={(e) => update("tenth_score", e.target.value)} min={0} max={100} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">12th</label>
                  <Input type="number" placeholder="82" value={form.twelfth_score} onChange={(e) => update("twelfth_score", e.target.value)} min={0} max={100} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Graduation</label>
                  <Input type="number" placeholder="75" value={form.grad_score} onChange={(e) => update("grad_score", e.target.value)} min={0} max={100} />
                </div>
              </div>
            </div>

            {/* Stream */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Graduation Stream</h3>
              <div className="flex gap-2">
                <SelectOption label="Engineer" value="Engineer" selected={form.grad_stream === "Engineer"} onClick={(v) => update("grad_stream", v)} />
                <SelectOption label="Non-Engineer" value="Non-Engineer" selected={form.grad_stream === "Non-Engineer"} onClick={(v) => update("grad_stream", v)} />
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Work Experience (months)</h3>
              <Input type="number" placeholder="0" value={form.workex_months} onChange={(e) => update("workex_months", e.target.value)} min={0} />
            </div>

            {/* Other fields */}
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

            {/* Competition */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Competition Level</h3>
              <div className="flex gap-2 flex-wrap">
                {["Top 10", "Top 20", "Top 30"].map((v) => (
                  <SelectOption key={v} label={v} value={v} selected={form.competition_level === v} onClick={(val) => update("competition_level", val)} />
                ))}
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Calculating..." : "Get My Target Percentile"}
            </Button>
          </div>
        )}

        {/* Result Step */}
        {step === "result" && results && (
          <div className="space-y-5 relative">
            {/* Blurred results overlay */}
            {!unlocked && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 text-center space-y-4 border border-border shadow-lg max-w-xs mx-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">Unlock Your Results</h3>
                    <p className="text-xs text-muted-foreground mt-1">Share your details to see your target percentiles.</p>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Your Name"
                      value={leadName}
                      onChange={(e) => setLeadName(sanitizeName(e.target.value))}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Phone (10 digits)"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      type="tel"
                      className="text-sm"
                    />
                    <Button
                      onClick={handleLeadSubmit}
                      disabled={leadSubmitting}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {leadSubmitting ? "Unlocking..." : "Unlock Results"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className={!unlocked ? "blur-md select-none pointer-events-none" : ""}>
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

              <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-center space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  If you're aiming for {results.target_top10}+, our Free Masterclass shows you the structured preparation plan required to reach it.
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { window.location.href = "/masterclass/watch"; }}>
                  Watch Free Masterclass
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
