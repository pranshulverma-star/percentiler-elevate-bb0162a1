import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CheckCircle, ArrowRight, Phone, BookOpen, Users, TrendingUp,
  ChevronDown, GraduationCap, MessageCircle, Target, Brain, Award,
  ChevronUp
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import studentBhavy from "@/assets/student-bhavy.webp";
import studentAditya from "@/assets/student-aditya.webp";
import studentRounak from "@/assets/student-rounak.webp";
import studentShruti from "@/assets/student-shruti.webp";
import studentRitik from "@/assets/student-ritik.webp";
import studentPrakhar from "@/assets/student-prakhar.webp";
import studentSaloni from "@/assets/student-saloni.webp";
import studentSattaki from "@/assets/student-sattaki.webp";
import studentRahul from "@/assets/student-rahul.webp";

import whatsapp1 from "@/assets/whatsapp-1.webp";
import whatsapp2 from "@/assets/whatsapp-2.webp";
import whatsapp3 from "@/assets/whatsapp-3.webp";
import whatsapp4 from "@/assets/whatsapp-4.webp";
import whatsapp5 from "@/assets/whatsapp-5.webp";
import whatsapp6 from "@/assets/whatsapp-6.webp";

/* ─── Competitor map ─── */
const COMPETITOR_MAP: Record<string, { name: string; headline: string }> = {
  unacademy: { name: "Unacademy", headline: "Tired of Unacademy's\nOne-Size-Fits-All Approach?" },
  byjus: { name: "BYJU's", headline: "Looking Beyond BYJU's\nfor CAT Preparation?" },
  career_launcher: { name: "Career Launcher", headline: "Considering Career Launcher?\nRead This First." },
  ims: { name: "IMS", headline: "Is IMS Really the Best Choice\nfor Your CAT Prep?" },
  time: { name: "T.I.M.E.", headline: "Is T.I.M.E. Really Worth It\nfor CAT Coaching?" },
  cracku: { name: "Cracku", headline: "Comparing Cracku for CAT?\nHere's What You're Missing." },
  "2iim": { name: "2IIM", headline: "Is 2IIM Enough for\nYour CAT Ambitions?" },
  testbook: { name: "Testbook", headline: "Exploring Testbook for CAT?\nHere's What You're Missing." },
  oliveboard: { name: "Oliveboard", headline: "Comparing Oliveboard for CAT?\nRead This First." },
};

const DEFAULT_HEADLINE = "Still Searching for\nthe Right CAT Coaching?";

/* ─── Animated counter ─── */
function AnimatedStat({ value, suffix = "", prefix = "", label, delay = 0 }: { value: number; suffix?: string; prefix?: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const timeout = setTimeout(() => {
      const duration = 1800;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(eased * value));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [isInView, value, delay]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-foreground leading-none">
        {prefix}{isInView ? count : 0}{suffix}
      </div>
      <p className="mt-3 text-sm sm:text-base text-muted-foreground tracking-widest uppercase font-medium">{label}</p>
    </div>
  );
}

/* ─── Chapter heading ─── */
function ChapterHeading({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      className="mb-12 md:mb-16"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="text-[11px] tracking-[0.4em] uppercase text-primary/70 font-semibold block mb-4">{number}</span>
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-[1.05] tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">{subtitle}</p>}
    </motion.div>
  );
}

/* ─── Lead Form (light themed) ─── */
function LeadForm({ ctaType, competitor, label }: { ctaType: "masterclass" | "call"; competitor: string; label: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const source = `competitor_ads${competitor ? `_${competitor}` : ""}`;
      const { error } = await (supabase.from("leads") as any).upsert(
        { phone_number: phone, name: name.trim(), source, current_status: ctaType, ...(targetYear ? { target_year: targetYear } : {}) },
        { onConflict: "phone_number" }
      );
      if (error) throw error;
      localStorage.setItem("percentilers_phone", phone);
      localStorage.setItem("percentilers_name", name.trim());
      supabase.functions.invoke("sync-lead-to-sheet", { body: { phone_number: phone, source, name: name.trim() } }).catch(() => {});
      setSubmitted(true);
      toast({ title: "You're in! 🎉", description: ctaType === "masterclass" ? "Redirecting to masterclass..." : "Our team will call you shortly." });
      if (ctaType === "masterclass") setTimeout(() => { window.location.href = "/masterclass"; }, 1500);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div className="text-center py-8" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <CheckCircle className="w-14 h-14 text-primary mx-auto mb-4" />
        <p className="text-xl font-bold text-foreground">{ctaType === "masterclass" ? "Redirecting to your free masterclass..." : "Our counselor will reach out within 2 hours!"}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-md mx-auto">
      <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="h-13 text-base" />
      <Input placeholder="Phone Number (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required pattern="[6-9]\d{9}" className="h-13 text-base" />
      <Select value={targetYear} onValueChange={setTargetYear}>
        <SelectTrigger className="h-13 text-base"><SelectValue placeholder="Target Year" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="2025">CAT 2025</SelectItem>
          <SelectItem value="2026">CAT 2026</SelectItem>
          <SelectItem value="2027">CAT 2027</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" size="lg" className="w-full h-13 text-base font-black tracking-wide" disabled={submitting}>
        {submitting ? "Submitting..." : label}
      </Button>
    </form>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border-b border-border"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-6 text-left group">
        <span className="font-semibold text-foreground pr-4 text-lg group-hover:text-primary transition-colors">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-primary shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="pb-6 text-muted-foreground leading-relaxed -mt-2">{a}</div>}
    </motion.div>
  );
}

/* ─── Journey stage images ─── */
import journeyStage1 from "@/assets/journey-stage-1.png";
import journeyStage2 from "@/assets/journey-stage-2.png";
import journeyStage3 from "@/assets/journey-stage-3.png";
import journeyStage4 from "@/assets/journey-stage-4.png";
import journeyStage5 from "@/assets/journey-stage-5.png";
import journeyStage6 from "@/assets/journey-stage-6.png";

const journeyStages = [
  {
    badge: "Day 0", number: "01",
    title: "Lost & Overwhelmed",
    desc: "3.3 lakh CAT aspirants. No clear plan. Picking coaching based on ads, not results.",
    tag: "Where most start",
    image: journeyStage1,
    accent: "from-muted to-muted/50",
    dotColor: "bg-muted-foreground",
  },
  {
    badge: "Week 1", number: "02",
    title: "Free Profile Evaluation",
    desc: "30-min strategy call. We map your strengths, target colleges & build your personal roadmap.",
    tag: "Percentilers begin here",
    image: journeyStage2,
    accent: "from-primary/20 to-primary/5",
    dotColor: "bg-primary",
  },
  {
    badge: "Week 2", number: "03",
    title: "AI Study Plan Activated",
    desc: "Personalised daily schedule. Section targets. Adjust weekly. Zero guesswork.",
    tag: "Smart prep starts",
    image: journeyStage3,
    accent: "from-primary/20 to-primary/5",
    dotColor: "bg-primary",
  },
  {
    badge: "Months 2–5", number: "04",
    title: "Live Classes + 32 Mocks",
    desc: "Expert IIM alumni faculty. Deep post-mock analytics. Weak area targeting.",
    tag: "Peak training zone",
    image: journeyStage4,
    accent: "from-primary/20 to-primary/5",
    dotColor: "bg-primary",
  },
  {
    badge: "Month 6", number: "05",
    title: "1-on-1 IIM Mentor",
    desc: "Weekly check-ins. WAT-PI prep. Strategy pivots. You are never alone in this.",
    tag: "Final push",
    image: journeyStage5,
    accent: "from-primary/20 to-primary/5",
    dotColor: "bg-primary",
  },
  {
    badge: "Result Day", number: "06",
    title: "IIM Offer Letter",
    desc: "300+ Percentilers students got IIM calls. Your name could be next.",
    tag: "Join 300+ IIM converts",
    image: journeyStage6,
    accent: "from-green-100 to-green-50",
    dotColor: "bg-green-500",
  },
];

/* ─── Interactive "Build Your Ideal Coaching" Picker ─── */
const coachingChoices = [
  {
    question: "Batch size you vibe with?",
    emoji: "👥",
    xp: 15,
    options: [
      { label: "500–2000 students", isRight: false, detail: "Lost in the crowd fr", tag: "🚩 Red flag" },
      { label: "≤30 per batch", isRight: true, detail: "Percentilers keeps it tight", tag: "✅ We got you" },
    ],
  },
  {
    question: "Mentorship style?",
    emoji: "🎯",
    xp: 20,
    options: [
      { label: "Generic doubt-clearing", isRight: false, detail: "One of thousands tbh", tag: "🚩 Mid" },
      { label: "1-on-1 IIM Alumni mentor", isRight: true, detail: "Your personal IIM guide", tag: "✅ Locked in" },
    ],
  },
  {
    question: "Study plan approach?",
    emoji: "🧠",
    xp: 20,
    options: [
      { label: "Same plan for everyone", isRight: false, detail: "50%ile = 90%ile plan? Nah", tag: "🚩 Lazy" },
      { label: "AI-personalized daily", isRight: true, detail: "Adapts to YOUR level", tag: "✅ Smart" },
    ],
  },
  {
    question: "Doubt resolution speed?",
    emoji: "⚡",
    xp: 15,
    options: [
      { label: "24–48hr ticket system", isRight: false, detail: "Exam's tomorrow tho...", tag: "🚩 Slow" },
      { label: "Same-day WhatsApp", isRight: true, detail: "Direct mentor access", tag: "✅ Instant" },
    ],
  },
  {
    question: "Faculty caliber?",
    emoji: "🏆",
    xp: 15,
    options: [
      { label: "Mixed experience", isRight: false, detail: "Hit or miss teachers", tag: "🚩 Risky" },
      { label: "99%ile+ IIM Alumni only", isRight: true, detail: "Every. Single. Faculty.", tag: "✅ Elite" },
    ],
  },
  {
    question: "Mock test analysis?",
    emoji: "📊",
    xp: 15,
    options: [
      { label: "Just a score", isRight: false, detail: "Cool... now what?", tag: "🚩 Useless" },
      { label: "Deep section analytics", isRight: true, detail: "With strategy pivots", tag: "✅ Actionable" },
    ],
  },
];

const totalXP = coachingChoices.reduce((s, c) => s + c.xp, 0);

function IdealCoachingPicker({ scrollTo }: { scrollTo: (id: string) => void }) {
  const [selections, setSelections] = useState<Record<number, boolean | null>>({});
  const answered = Object.keys(selections).length;
  const allAnswered = answered === coachingChoices.length;
  const rightCount = Object.values(selections).filter((v) => v === true).length;
  const earnedXP = coachingChoices.reduce((s, c, i) => s + (selections[i] === true ? c.xp : 0), 0);

  const handleSelect = (qIndex: number, isRight: boolean) => {
    setSelections((prev) => ({ ...prev, [qIndex]: isRight }));
  };

  const rank = rightCount === 6 ? "🏆 IIM Ready" : rightCount >= 4 ? "🔥 On Track" : rightCount >= 2 ? "💡 Getting There" : "🌱 Exploring";

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-foreground">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-10 md:mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-[11px] font-black tracking-[0.3em] uppercase">
              🎮 Interactive
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/10 text-background/60 text-[11px] font-bold tracking-wider uppercase">
              Chapter 03
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-background leading-[1.05] tracking-tight">
            Build Your Dream<br />Coaching 🎯
          </h2>
          <p className="mt-4 text-base md:text-lg text-background/50 max-w-xl">
            Pick what you actually want. Earn XP for smart choices. See if your ideal coaching already exists.
          </p>
        </motion.div>

        {/* XP + Progress HUD */}
        <motion.div
          className="mb-8 rounded-2xl border border-background/10 bg-background/5 backdrop-blur-xl p-4 md:p-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-primary">{earnedXP}</span>
                <span className="text-xs font-bold text-background/40 uppercase tracking-wider">XP</span>
              </div>
              <div className="h-6 w-px bg-background/10" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-background/70">{rank}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-background/40">
              <span>{answered}/{coachingChoices.length}</span>
              <span className="text-background/20">•</span>
              <span>{earnedXP}/{totalXP} XP</span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-background/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 relative"
              initial={{ width: 0 }}
              animate={{ width: `${(answered / coachingChoices.length) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </motion.div>

        {/* Questions */}
        <div className="space-y-4">
          {coachingChoices.map((q, qIndex) => {
            const selected = selections[qIndex];
            const hasSelected = selected !== undefined && selected !== null;

            return (
              <motion.div
                key={qIndex}
                className={`rounded-2xl border backdrop-blur-xl p-5 md:p-6 transition-all duration-500 ${
                  hasSelected
                    ? selected
                      ? "border-primary/30 bg-primary/10"
                      : "border-destructive/20 bg-destructive/5"
                    : "border-background/10 bg-background/5 hover:bg-background/8"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: qIndex * 0.05, duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{q.emoji}</span>
                    <h3 className="font-bold text-background text-sm md:text-base">{q.question}</h3>
                  </div>
                  <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${
                    hasSelected && selected ? "bg-primary/20 text-primary" : "bg-background/10 text-background/30"
                  }`}>
                    +{q.xp} XP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, oIndex) => {
                    const isThisSelected = hasSelected && selected === opt.isRight;
                    const isWrong = hasSelected && !opt.isRight && isThisSelected;
                    const isRight = hasSelected && opt.isRight;

                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleSelect(qIndex, opt.isRight)}
                        disabled={hasSelected}
                        className={`group relative text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                          hasSelected
                            ? isRight
                              ? "border-primary bg-primary/15 shadow-lg shadow-primary/10"
                              : isWrong
                              ? "border-destructive/40 bg-destructive/10"
                              : "border-background/5 bg-background/3 opacity-40"
                            : "border-background/10 bg-background/5 hover:border-primary/40 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/5 cursor-pointer active:scale-[0.98]"
                        }`}
                      >
                        <span className={`font-bold text-sm block mb-1.5 ${
                          hasSelected && isRight ? "text-primary" : isWrong ? "text-destructive/80" : "text-background/90"
                        }`}>
                          {opt.label}
                        </span>
                        {hasSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <span className={`text-xs block mb-1 ${isRight ? "text-primary/70" : "text-background/40"}`}>
                              {opt.detail}
                            </span>
                            <span className={`text-[10px] font-black tracking-wider uppercase ${
                              isRight ? "text-primary" : "text-destructive/60"
                            }`}>
                              {opt.tag}
                            </span>
                          </motion.div>
                        )}
                        {!hasSelected && (
                          <span className="text-[10px] font-semibold text-background/30 uppercase tracking-wider">Tap to choose</span>
                        )}
                        {hasSelected && isRight && (
                          <motion.div
                            className="absolute top-3 right-3"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <CheckCircle className="w-5 h-5 text-primary" />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* XP earned animation */}
                {hasSelected && selected && (
                  <motion.div
                    className="mt-3 flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-xs font-black text-primary">+{q.xp} XP earned!</span>
                    <span className="text-background/30 text-xs">•</span>
                    <span className="text-xs text-background/40">Smart choice 🧠</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* CTA after all answered */}
        {allAnswered && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent p-8 md:p-12 text-center backdrop-blur-xl relative overflow-hidden">
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse pointer-events-none" />

              <motion.div
                className="relative z-10"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              >
                <div className="text-5xl mb-4">🏆</div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-black tracking-wider uppercase mb-4">
                  {earnedXP}/{totalXP} XP • {rank}
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-background mb-3 leading-tight">
                  {rightCount === coachingChoices.length
                    ? "You just described Percentilers."
                    : `${rightCount}/${coachingChoices.length} matched — we deliver all of them.`}
                </h3>
                <p className="text-background/50 mb-8 max-w-md mx-auto text-sm md:text-base">
                  Everything you chose as "ideal" is exactly what 300+ IIM converts experienced. No cap.
                </p>
                <Button
                  size="lg"
                  className="h-14 px-10 text-base font-black tracking-wide rounded-full shadow-xl shadow-primary/30 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => scrollTo("masterclass-section")}
                >
                  Claim Free Masterclass <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}


function JourneyTimeline() {
  return (
    <section className="relative py-20 md:py-28 bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-14 md:mb-20">
          <span className="text-[11px] tracking-[0.4em] uppercase text-primary/70 font-semibold block mb-3">Your Journey</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.05]">From Zero to IIM</h2>
          <p className="mt-4 text-muted-foreground text-base md:text-lg">A clear, structured path with premium mentorship at every stage.</p>
        </div>

        <div className="relative">
          {/* Desktop curvy road */}
          <svg
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 h-full w-28 pointer-events-none"
            viewBox="0 0 100 1000"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M50 0 C20 70,80 130,50 200 S20 330,50 400 S80 530,50 600 S20 730,50 800 S80 900,50 1000"
              stroke="hsl(var(--border))"
              strokeWidth="3"
              strokeDasharray="8 7"
              fill="none"
            />
          </svg>

          {/* Mobile curvy road */}
          <svg
            className="md:hidden absolute left-5 top-0 h-full w-10 pointer-events-none"
            viewBox="0 0 60 1000"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M20 0 C35 70,5 130,20 200 S35 330,20 400 S5 530,20 600 S35 730,20 800 S5 900,20 1000"
              stroke="hsl(var(--border))"
              strokeWidth="3"
              strokeDasharray="8 7"
              fill="none"
            />
          </svg>

          <div className="space-y-10 md:space-y-16">
            {journeyStages.map((stage, index) => (
              <JourneyStageCard key={stage.number} stage={stage} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyStageCard({
  stage,
  index,
}: {
  stage: typeof journeyStages[0];
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.article
      className={`relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center ${isEven ? "" : "md:[direction:rtl]"}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Road marker */}
      <div className="absolute left-5 md:left-1/2 md:-translate-x-1/2 top-8 md:top-1/2 md:-translate-y-1/2 z-20">
        <div className="h-4 w-4 md:h-5 md:w-5 rounded-full bg-primary ring-4 ring-background shadow-md" />
      </div>

      {/* Visual */}
      <div className={`pl-12 md:pl-0 flex ${isEven ? "md:justify-end" : "md:justify-start"} ${isEven ? "" : "md:[direction:ltr]"}`}>
        <div className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-br ${stage.accent} border border-border/60 p-5 md:p-6 shadow-xl backdrop-blur-xl`}>
          <img src={stage.image} alt={stage.title} className="w-full h-52 md:h-60 object-contain" loading="lazy" />
          <span className="absolute -top-5 right-4 text-6xl md:text-7xl font-black text-primary/10 leading-none select-none">{stage.number}</span>
        </div>
      </div>

      {/* Content */}
      <div className={`pl-12 md:pl-0 ${isEven ? "" : "md:[direction:ltr]"}`}>
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.28em] uppercase text-primary mb-4">
          {stage.badge}
        </div>
        <h3 className="text-2xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-3">{stage.title}</h3>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-md">{stage.desc}</p>
        <div className="mt-5 inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
          {stage.tag}
        </div>
      </div>
    </motion.article>
  );
}
/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function CATCoachingComparison() {
  const [searchParams] = useSearchParams();
  const competitorKey = searchParams.get("competitor")?.toLowerCase() || "";
  const competitor = COMPETITOR_MAP[competitorKey];
  const headline = competitor?.headline || DEFAULT_HEADLINE;
  const competitorName = competitor?.name || "Other Coaching";

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  /* ─── Social proof mini-strip for above-fold ─── */
  const topResults = [
    { name: "Bhavy", pct: "99.5", photo: studentBhavy },
    { name: "Rounak", pct: "99.2", photo: studentRounak },
    { name: "Rahul", pct: "98.9", photo: studentRahul },
    { name: "Shruti", pct: "98.3", photo: studentShruti },
  ];


  const results = [
    { name: "Bhavy Jain", percentile: "99.5", college: "FMS Delhi", initials: "BJ", photo: studentBhavy, quote: "The structured strategy made all the difference." },
    { name: "Rounak", percentile: "99.2", college: "IIM Bangalore", initials: "RK", photo: studentRounak, quote: "Mock analysis helped me fix weak areas fast." },
    { name: "Golla Rahul", percentile: "98.9", college: "IIT Bombay", initials: "GR", photo: studentRahul, quote: "90 → 98+ percentile in 3 months." },
    { name: "Aditya Kumar", percentile: "98.6", college: "XLRI", initials: "AK", photo: studentAditya, quote: "Daily planner kept me disciplined throughout." },
    { name: "Shruti Manghani", percentile: "98.3", college: "SP Jain", initials: "SM", photo: studentShruti, quote: "Mentorship gave me clarity when I needed it." },
    { name: "Ritik Kumar", percentile: "98.1", college: "IIM Udaipur", initials: "RK", photo: studentRitik, quote: "Strategy over hours changed everything." },
    { name: "Prakhar Poddar", percentile: "98.0", college: "IIM Trichy", initials: "PP", photo: studentPrakhar, quote: "Right guidance at the right time." },
    { name: "Saloni Hindocha", percentile: "98.4", college: "IIT Mumbai", initials: "SH", photo: studentSaloni, quote: "Expert feedback was key to my success." },
    { name: "Sattaki Basu", percentile: "98.2", college: "IIM Ranchi", initials: "SB", photo: studentSattaki, quote: "Mock analysis transformed my approach." },
  ];

  const whatsappScreenshots = [whatsapp1, whatsapp2, whatsapp3, whatsapp4, whatsapp5, whatsapp6];

  const faqs = [
    { q: "How is Percentilers different from big coaching institutes?", a: "We keep batch sizes under 30, assign IIM alumni mentors 1-on-1, and build AI-personalized study plans. Big institutes treat you as one of thousands — we treat you as the priority." },
    { q: "Can I join mid-preparation?", a: "Absolutely. Our AI study planner adapts to your current level and available time, creating a custom catch-up roadmap from day one." },
    { q: "What if I'm already enrolled in another coaching?", a: "Many of our toppers used Percentilers alongside or after switching from other platforms. Our mentorship and mock analysis add massive value on top of any content." },
    { q: "Is the free masterclass actually free?", a: "100% free, no credit card needed. It's a 90-minute strategy session by IIM alumni covering the exact approach used by 99%ile scorers." },
    { q: "How quickly can I expect results?", a: "Students typically see 10-15 percentile improvement within 60 days with consistent execution of our study plan and mock strategy." },
  ];

  return (
    <div className="bg-background min-h-screen">
      <SEO
        title="CAT Coaching Comparison 2026 – Best Institute | Percentilers"
        description="Compare CAT coaching institutes side-by-side. See why 300+ students chose Percentilers' IIM-alumni mentorship over big coaching brands. Free masterclass inside."
        canonical="https://percentilers.in/cat-coaching-comparison"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
      })}} />

      <Navbar />

      {/* ═══ HERO — Mobile-first, social proof + CTA above fold ═══ */}
      <section className="relative pt-6 pb-10 md:pt-12 md:pb-20 bg-background overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/[0.05] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6">
          {/* Competitor badge */}
          {competitor && (
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold border border-primary/30 text-primary bg-primary/10">
              vs {competitorName}
            </span>
          )}

          {/* Headline — no animation delay for fast LCP */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-foreground leading-[1.08] tracking-tight whitespace-pre-line">
            {headline}
          </h1>

          <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
            300+ students switched to Percentilers and scored <span className="text-primary font-semibold">99%ile+</span>. See the difference an IIM-alumni mentor makes.
          </p>

          {/* Social proof strip — visible above fold on mobile */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {topResults.map((s) => (
                <Avatar key={s.name} className="h-8 w-8 ring-2 ring-background overflow-hidden">
                  <AvatarImage src={s.photo} alt={s.name} className="object-cover object-top scale-[1.4] translate-y-[8%]" width={32} height={32} fetchPriority="high" />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{s.name[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">99%ile+ scorers</p>
              <p className="text-[10px] text-muted-foreground">300+ IIM converts from Percentilers</p>
            </div>
          </div>

          {/* Dual CTAs — immediately visible */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="h-12 md:h-14 px-6 md:px-10 text-sm md:text-base font-black tracking-wide rounded-xl shadow-lg shadow-primary/20"
              onClick={() => scrollTo("masterclass-section")}
            >
              Watch Free Masterclass <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 md:h-14 px-6 md:px-10 text-sm md:text-base font-bold tracking-wide rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              asChild
            >
              <a href="tel:+919911928071">
                <Phone className="mr-2 w-4 h-4" /> Book Free Strategy Call
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ JOURNEY TIMELINE ═══ */}
      <JourneyTimeline />

      {/* ═══ CHAPTER 1: THE NUMBERS ═══ */}
      <section className="py-20 md:py-28 bg-background relative">
        <div className="max-w-6xl mx-auto px-6">
          <ChapterHeading number="Chapter 01" title="The Numbers Don't Lie" subtitle="Data from 10,000+ students trained over 8 years." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <AnimatedStat value={300} suffix="+" label="IIM Converts" delay={0} />
            <AnimatedStat value={10000} suffix="+" label="Students Trained" delay={200} />
            <AnimatedStat value={99} suffix="%" label="Faculty Percentile" delay={400} />
            <AnimatedStat value={8} suffix=" yrs" label="Coaching Experience" delay={600} />
          </div>
        </div>
      </section>

      {/* ═══ CHAPTER 2: THE PROBLEM ═══ */}
      <section className="py-20 md:py-28 bg-[hsl(25,100%,97%)] relative">
        <div className="max-w-5xl mx-auto px-6">
          <ChapterHeading number="Chapter 02" title="Why Most CAT Aspirants Fail" subtitle="It's not about intelligence. It's about the system you choose." />

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Users, title: "Lost in the Crowd", desc: "Large batch sizes (500–2000) mean your doubts go unanswered. You're just a number.", stat: "72%", statLabel: "regret their coaching choice" },
              { icon: BookOpen, title: "Generic Study Material", desc: "Same plan whether you're at 50%ile or 90%ile. No personalization whatsoever.", stat: "85%", statLabel: "get wrong-level material" },
              { icon: TrendingUp, title: "Zero Accountability", desc: "Nobody tracks your progress. When motivation drops, you're on your own.", stat: "60%", statLabel: "drop out mid-prep" },
              { icon: Phone, title: "No Real Support", desc: "Automated ticket systems. 48-hour wait for doubt resolution. No human touch.", stat: "3x", statLabel: "slower doubt resolution" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="p-8 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md hover:border-destructive/30 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-destructive">{item.stat}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.statLabel}</div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DRAMATIC DIVIDER STAT ═══ */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden">
        <motion.div
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-foreground/[0.06] leading-none select-none">
            ₹50,000+
          </div>
          <p className="text-muted-foreground text-lg md:text-xl mt-4 max-w-lg mx-auto">
            That's what you'll spend on coaching. <span className="text-primary font-semibold">Choose wisely.</span>
          </p>
        </motion.div>
      </section>

      {/* ═══ CHAPTER 3: INTERACTIVE COMPARISON ═══ */}
      <IdealCoachingPicker scrollTo={scrollTo} />

      {/* ═══ CHAPTER 4: THE SYSTEM ═══ */}
      <section className="py-20 md:py-28 bg-background relative">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <ChapterHeading number="Chapter 04" title="The Percentilers System" subtitle="A battle-tested framework used by 300+ IIM converts." />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "AI Study Plan", desc: "Personalized daily schedule based on your strengths, weaknesses, and available hours.", icon: Brain },
              { step: "02", title: "IIM Mentor", desc: "Dedicated 99%ile+ IIM alumni mentor tracking your progress weekly.", icon: Target },
              { step: "03", title: "Mock Mastery", desc: "Section-wise deep analysis with improvement strategies after every mock.", icon: TrendingUp },
              { step: "04", title: "Interview Prep", desc: "Full WAT-PI preparation with IIM panelist mock interviews.", icon: Award },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="relative p-8 rounded-2xl border border-border bg-background shadow-sm group hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
              >
                <div className="text-[64px] font-black text-foreground/[0.04] absolute top-4 right-4 leading-none select-none">{s.step}</div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHAPTER 5: RESULTS ═══ */}
      <section className="py-20 md:py-28 bg-[hsl(25,100%,97%)] relative">
        <div className="max-w-6xl mx-auto px-6">
          <ChapterHeading number="Chapter 05" title="Real Results. Real Students." subtitle="Verified converts — not vague testimonials." />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((r, i) => (
              <motion.div
                key={r.name}
                className="p-6 rounded-2xl border border-border bg-background shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <Avatar className="h-11 w-11 ring-2 ring-border group-hover:ring-primary/30 transition-all overflow-hidden">
                    <AvatarImage src={r.photo} alt={`${r.name} – ${r.percentile}%ile`} className="object-cover object-top scale-[1.3] translate-y-[5%]" loading="lazy" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{r.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{r.name}</p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      {r.college}
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-4xl font-black text-primary">{r.percentile}</span>
                  <span className="text-sm font-medium text-muted-foreground">%ile</span>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">"{r.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHAPTER 6: SOCIAL PROOF ═══ */}
      <section className="py-20 md:py-28 bg-background relative">
        <div className="max-w-5xl mx-auto px-6">
          <ChapterHeading number="Chapter 06" title="Straight From WhatsApp" subtitle="Unedited messages from real students." />

          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-8">
            <MessageCircle className="h-3.5 w-3.5" />
            Actual Screenshots
          </div>

          <div className="columns-2 md:columns-3 gap-4">
            {whatsappScreenshots.map((src, i) => (
              <motion.div
                key={i}
                className="break-inside-avoid mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <img src={src} alt={`Student WhatsApp testimonial ${i + 1}`} className="w-full h-auto" loading="lazy" decoding="async" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA: MASTERCLASS + STRATEGY CALL ═══ */}
      <section id="masterclass-section" className="py-16 md:py-28 bg-secondary relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[11px] tracking-[0.4em] uppercase text-primary/70 font-semibold block mb-4">Free Access</span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-4">Watch the CAT Strategy Masterclass</h2>
            <p className="text-muted-foreground mb-8 text-base md:text-lg">90-minute session by IIM alumni. The exact strategy used by 99%ile scorers. No pitch.</p>
            <LeadForm ctaType="masterclass" competitor={competitorKey} label="Watch Free Masterclass →" />
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-xs text-muted-foreground">or</span>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="mt-3 h-12 md:h-14 px-8 text-sm md:text-base font-bold rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              asChild
            >
              <a href="tel:+919911928071">
                <Phone className="mr-2 w-4 h-4" /> Book Free Strategy Call
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA: COUNSELING CALL ═══ */}
      <section id="call-section" className="py-20 md:py-28 bg-background relative border-t border-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[11px] tracking-[0.4em] uppercase text-primary/70 font-semibold block mb-4">Personalized Guidance</span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-4">Not Sure Which Path Is Right?</h2>
            <p className="text-muted-foreground mb-10 text-lg">Free 15-minute counseling call with our IIM-alumni team. Personalized roadmap, zero pressure.</p>
            <LeadForm ctaType="call" competitor={competitorKey} label="Book Free Counseling Call →" />
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 md:py-28 bg-[hsl(25,100%,97%)] relative">
        <div className="max-w-3xl mx-auto px-6">
          <ChapterHeading number="FAQ" title="Questions & Answers" />
          <div>{faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}</div>
        </div>
      </section>

      <Footer />

      {/* ═══ STICKY MOBILE CTA ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border p-3 flex gap-2">
        <Button className="flex-1 h-11 font-black text-sm rounded-full shadow-lg shadow-primary/20" onClick={() => scrollTo("masterclass-section")}>
          Free Masterclass
        </Button>
        <Button variant="outline" className="flex-1 h-11 font-bold text-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full" asChild>
          <a href="tel:+919911928071">Strategy Call</a>
        </Button>
      </div>
      <div className="h-14 md:hidden" />
    </div>
  );
}
