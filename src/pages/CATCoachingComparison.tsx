import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CheckCircle, XCircle, ArrowRight, Star, Phone, BookOpen, Users, TrendingUp,
  ChevronDown, GraduationCap, MessageCircle, Zap, Target, Brain, Award,
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

/* ─── Single cinematic stage ─── */
function JourneyStage({ stage, index }: { stage: typeof journeyStages[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.85, 1], [0, 1, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [80, 0, 0, -40]);
  const imgScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.8, 1, 1, 0.9]);
  const imgX = useTransform(scrollYProgress, [0, 0.3], [index % 2 === 0 ? -60 : 60, 0]);
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="min-h-[80vh] md:min-h-screen flex items-center relative">
      {/* Progress line dot */}
      <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
        <motion.div
          className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${stage.dotColor} ring-4 ring-background shadow-lg`}
          style={{ scale: imgScale }}
        />
      </div>

      <motion.div
        className={`w-full max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${isEven ? "" : "md:[direction:rtl]"}`}
        style={{ opacity, y }}
      >
        {/* Image side */}
        <motion.div className={`flex justify-center md:justify-end ${isEven ? "" : "md:[direction:ltr]"}`} style={{ scale: imgScale, x: imgX }}>
          <div className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-3xl bg-gradient-to-br ${stage.accent} p-4 md:p-6 flex items-center justify-center`}>
            <img src={stage.image} alt={stage.title} className="w-full h-full object-contain drop-shadow-xl" loading="lazy" />
            {/* Floating number */}
            <span className="absolute -top-4 -right-4 text-6xl md:text-8xl font-black text-primary/10 select-none leading-none">{stage.number}</span>
          </div>
        </motion.div>

        {/* Text side */}
        <div className={`space-y-4 ${isEven ? "" : "md:[direction:ltr]"}`}>
          <span className="inline-block text-[11px] font-bold tracking-[0.3em] uppercase px-3 py-1.5 rounded-full bg-primary/10 text-primary">{stage.badge}</span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight">{stage.title}</h3>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">{stage.desc}</p>
          <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full bg-secondary text-muted-foreground">{stage.tag}</span>
        </div>
      </motion.div>
    </div>
  );
}

function JourneyTimeline() {
  return (
    <section className="relative py-16 md:py-0 overflow-hidden">
      {/* Curvy road SVG path */}
      <svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none hidden md:block"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M50 0 C 20 8, 80 18, 50 25 S 20 33, 50 40 S 80 48, 50 55 S 20 63, 50 70 S 80 78, 50 85 S 20 93, 50 100"
          stroke="hsl(var(--border))"
          strokeWidth="0.4"
          strokeDasharray="1.2 0.8"
          fill="none"
        />
      </svg>
      {/* Mobile: left-side curvy line */}
      <svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none md:hidden"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M6 0 C 15 8, 2 18, 6 25 S 15 33, 6 40 S 2 48, 6 55 S 15 63, 6 70 S 2 78, 6 85 S 15 93, 6 100"
          stroke="hsl(var(--border))"
          strokeWidth="0.6"
          strokeDasharray="1.5 1"
          fill="none"
        />
      </svg>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-8 relative z-20">
        <span className="text-[11px] tracking-[0.4em] uppercase text-primary/70 font-semibold block mb-3">Your Journey</span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-[1.05]">From Zero to IIM</h2>
        <p className="mt-3 text-muted-foreground text-lg">Scroll down to see the transformation</p>
      </div>

      {/* Stages */}
      {journeyStages.map((stage, i) => (
        <JourneyStage key={stage.number} stage={stage} index={i} />
      ))}
    </section>
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

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const comparisonRows = [
    { feature: "Batch Size", them: "500–2000+", us: "≤30 students", icon: Users },
    { feature: "Mentorship", them: "Generic doubt-clearing", us: "1-on-1 IIM Alumni", icon: Target },
    { feature: "Study Plan", them: "One-size-fits-all", us: "AI-Personalized Daily", icon: Brain },
    { feature: "Mock Analysis", them: "Score only", us: "Deep section-wise analytics", icon: TrendingUp },
    { feature: "Doubt Resolution", them: "24–48 hr wait", us: "Same-day WhatsApp", icon: Zap },
    { feature: "Faculty", them: "Mixed experience", us: "99%ile+ IIM Alumni only", icon: Award },
    { feature: "Cost", them: "₹30K–₹1.2L", us: "Starts ₹4,999", icon: Star },
    { feature: "Results", them: "Undisclosed", us: "300+ IIM converts", icon: CheckCircle },
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

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/[0.06] rounded-full blur-[120px]" />

        <motion.div className="relative z-10 max-w-4xl mx-auto px-6 text-center" style={{ opacity: heroOpacity, y: heroY }}>
          {competitor && (
            <motion.span
              className="inline-block mb-6 px-5 py-2 rounded-full text-xs tracking-[0.2em] uppercase font-bold border border-primary/30 text-primary bg-primary/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              vs {competitorName}
            </motion.span>
          )}

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.08] tracking-tight whitespace-pre-line"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {headline}
          </motion.h1>

          <motion.p
            className="mt-6 md:mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            300+ students switched to Percentilers and scored <span className="text-primary font-semibold">99%ile+</span>. See the difference an IIM-alumni mentor makes.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              className="h-14 px-10 text-base font-black tracking-wide rounded-full shadow-lg shadow-primary/20"
              onClick={() => scrollTo("masterclass-section")}
            >
              Watch Free Masterclass <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 text-base font-bold tracking-wide rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              asChild
            >
              <a href="tel:+919911928071">
                <Phone className="mr-2 w-4 h-4" /> Book Free Strategy Call
              </a>
            </Button>
          </motion.div>

          <motion.div className="mt-16" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ChevronDown className="w-6 h-6 text-muted-foreground/40 mx-auto" />
          </motion.div>
        </motion.div>
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

      {/* ═══ CHAPTER 3: THE COMPARISON ═══ */}
      <section className="py-20 md:py-28 bg-[hsl(25,100%,97%)] relative">
        <div className="max-w-4xl mx-auto px-6">
          <ChapterHeading number="Chapter 03" title={`${competitorName} vs\nPercentilers`} subtitle="An honest, side-by-side look at what you actually get." />

          <div className="space-y-3">
            {comparisonRows.map((row, i) => (
              <motion.div
                key={row.feature}
                className="grid grid-cols-[1fr_1fr_1fr] md:grid-cols-[1.5fr_1fr_1fr] items-center gap-2 py-5 px-4 md:px-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-all"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <row.icon className="w-4 h-4 text-primary/60 hidden sm:block shrink-0" />
                  <span className="font-semibold text-foreground text-sm md:text-base">{row.feature}</span>
                </div>
                <div className="text-center">
                  <span className="text-muted-foreground text-xs md:text-sm flex items-center justify-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-destructive/60 shrink-0" />
                    {row.them}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-primary text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    {row.us}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div className="mt-12 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Button
              size="lg"
              className="h-14 px-10 text-base font-black tracking-wide rounded-full shadow-lg shadow-primary/20"
              onClick={() => scrollTo("masterclass-section")}
            >
              See the Percentilers Difference <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

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

          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-8">
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

      {/* ═══ CTA: MASTERCLASS ═══ */}
      <section id="masterclass-section" className="py-20 md:py-28 bg-[hsl(25,100%,97%)] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[11px] tracking-[0.4em] uppercase text-primary/70 font-semibold block mb-4">Free Access</span>
            <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-4">Watch the CAT Strategy Masterclass</h2>
            <p className="text-muted-foreground mb-10 text-lg">90-minute session by IIM alumni. The exact strategy used by 99%ile scorers. No pitch.</p>
            <LeadForm ctaType="masterclass" competitor={competitorKey} label="Watch Free Masterclass →" />
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
