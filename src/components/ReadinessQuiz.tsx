import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const questions = [
  {
    question: "Have you attempted CAT before?",
    options: ["Yes", "No"],
    key: "attempted_before",
  },
  {
    question: "Current mock percentile?",
    options: ["Below 70", "70–85", "85–95", "95+"],
    key: "mock_percentile",
  },
  {
    question: "Hours studied per day?",
    options: ["Less than 2", "2–4", "4–6", "6+"],
    key: "hours_per_day",
  },
  {
    question: "Target percentile?",
    options: ["85+", "95+", "99+"],
    key: "target_percentile",
  },
];

function getRecommendation(answers: Record<string, string>) {
  const mock = answers.mock_percentile;
  const target = answers.target_percentile;
  if (mock === "Below 70" || mock === "70–85") {
    return {
      message: "You have a strong foundation to build on. A structured program with mock-based feedback will accelerate your growth significantly.",
      step: "Start with the Free Masterclass to understand the framework top scorers use.",
    };
  }
  if (mock === "85–95" && (target === "95+" || target === "99+")) {
    return {
      message: "You're close to a breakthrough. Focused strategy refinement and advanced mock analysis can push you into the top percentiles.",
      step: "Watch the Free Masterclass to learn the exact strategy used by 99%ilers.",
    };
  }
  return {
    message: "You're already performing well. Fine-tuning your weak areas and exam-day strategy will make the final difference.",
    step: "The Free Masterclass covers advanced techniques for peak performance.",
  };
}

const ReadinessQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const totalSteps = questions.length + 1; // +1 for phone step
  const progress = ((step + 1) / totalSteps) * 100;

  const handleOptionSelect = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step < questions.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 200);
    } else {
      setTimeout(() => setStep(questions.length), 200);
    }
  };

  const handleSubmit = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setPhoneError("");
    setLoading(true);

    const rec = getRecommendation(answers);

    try {
      await supabase.from("readiness_quiz" as any).insert({
        phone: cleaned,
        attempted_before: answers.attempted_before,
        mock_percentile: answers.mock_percentile,
        hours_per_day: answers.hours_per_day,
        target_percentile: answers.target_percentile,
        recommendation: rec.message,
      } as any);
    } catch (e) {
      // silently fail — don't block UX
    }

    setSubmitted(true);
    setLoading(false);
  };

  const recommendation = getRecommendation(answers);

  if (submitted) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-xl">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-5">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Your Personalized Recommendation</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">{recommendation.message}</p>
            <p className="text-sm font-medium text-foreground mb-6">{recommendation.step}</p>
            <Button size="lg" asChild>
              <a href="#masterclass">
                Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Where Do You Stand in CAT Preparation?
          </h2>
          <p className="text-muted-foreground text-lg">
            Answer 4 quick questions and get a personalized recommendation.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          {step < questions.length ? (
            <>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Question {step + 1} of {questions.length}
              </p>
              <h3 className="text-lg font-bold text-foreground mb-6">
                {questions[step].question}
              </h3>
              <div className="grid gap-3">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionSelect(questions[step].key, opt)}
                    className={`w-full text-left px-5 py-3.5 rounded-lg border text-sm font-medium transition-all duration-150 ${
                      answers[questions[step].key] === opt
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="mt-5 text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Last step
              </p>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Enter your phone number to see your result
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                We'll also send you a personalized study plan.
              </p>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                className="mb-2"
              />
              {phoneError && (
                <p className="text-sm text-destructive mb-3">{phoneError}</p>
              )}
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-3"
                size="lg"
              >
                {loading ? "Submitting..." : "See My Recommendation"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <button
                onClick={() => setStep((s) => s - 1)}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReadinessQuiz;
