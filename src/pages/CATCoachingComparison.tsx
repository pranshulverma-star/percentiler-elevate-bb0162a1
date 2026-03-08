import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { CheckCircle, XCircle, ArrowRight, Star, Phone, BookOpen, Users, TrendingUp, ChevronDown, ChevronUp, GraduationCap, Quote, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import studentBhavy from "@/assets/student-bhavy.webp";
import studentAditya from "@/assets/student-aditya.webp";
import studentRounak from "@/assets/student-rounak.webp";
import studentShruti from "@/assets/student-shruti.webp";
import studentRitik from "@/assets/student-ritik.webp";
import studentPrakhar from "@/assets/student-prakhar.webp";
import studentSaloni from "@/assets/student-saloni.webp";
import studentSattaki from "@/assets/student-sattaki.webp";
import studentRahul from "@/assets/student-rahul.jpeg";

import whatsapp1 from "@/assets/whatsapp-1.jpg";
import whatsapp2 from "@/assets/whatsapp-2.jpg";
import whatsapp3 from "@/assets/whatsapp-3.jpg";
import whatsapp4 from "@/assets/whatsapp-4.jpg";
import whatsapp5 from "@/assets/whatsapp-5.jpg";
import whatsapp6 from "@/assets/whatsapp-6.jpg";

const COMPETITOR_MAP: Record<string, { name: string; headline: string }> = {
  unacademy: { name: "Unacademy", headline: "Tired of Unacademy's One-Size-Fits-All CAT Coaching?" },
  byjus: { name: "BYJU's", headline: "Looking Beyond BYJU's for CAT Preparation?" },
  career_launcher: { name: "Career Launcher", headline: "Considering Career Launcher for CAT? Read This First" },
  ims: { name: "IMS", headline: "Is IMS the Best Choice for Your CAT Prep?" },
  time: { name: "T.I.M.E.", headline: "Is T.I.M.E. Really Worth It for CAT Coaching?" },
  testbook: { name: "Testbook", headline: "Exploring Testbook for CAT? Here's What You're Missing" },
  oliveboard: { name: "Oliveboard", headline: "Comparing Oliveboard for CAT? Read This First" },
};

const DEFAULT_HEADLINE = "Still Searching for the Right CAT Coaching?";

// ─── Lead Form Component ───
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
      // Store in leads table — trigger auto-populates campaign_state
      const { error } = await (supabase.from("leads") as any).upsert(
        {
          phone_number: phone,
          name: name.trim(),
          source,
          current_status: ctaType,
          ...(targetYear ? { target_year: targetYear } : {}),
        },
        { onConflict: "phone_number" }
      );
      if (error) throw error;

      localStorage.setItem("percentilers_phone", phone);
      localStorage.setItem("percentilers_name", name.trim());

      // Sync to sheet (fire-and-forget)
      supabase.functions.invoke("sync-lead-to-sheet", {
        body: { phone_number: phone, source, name: name.trim() },
      }).catch(() => {});

      setSubmitted(true);
      toast({ title: "You're in! 🎉", description: ctaType === "masterclass" ? "Redirecting to masterclass..." : "Our team will call you shortly." });

      if (ctaType === "masterclass") {
        setTimeout(() => { window.location.href = "/masterclass"; }, 1500);
      }
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
        <p className="text-lg font-semibold text-foreground">
          {ctaType === "masterclass" ? "Redirecting to your free masterclass..." : "Our counselor will reach out within 2 hours!"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-md mx-auto">
      <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 text-base" />
      <Input placeholder="Phone Number (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required pattern="[6-9]\d{9}" className="h-12 text-base" />
      <Select value={targetYear} onValueChange={setTargetYear}>
        <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Target Year" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="2025">CAT 2025</SelectItem>
          <SelectItem value="2026">CAT 2026</SelectItem>
          <SelectItem value="2027">CAT 2027</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" size="lg" className="w-full h-12 text-base font-bold" disabled={submitting}>
        {submitting ? "Submitting..." : label}
      </Button>
    </form>
  );
}

// ─── FAQ Item ───
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors">
        <span className="font-semibold text-foreground pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="px-5 pb-5 text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  );
}

// ─── Main Page ───
export default function CATCoachingComparison() {
  const [searchParams] = useSearchParams();
  const competitorKey = searchParams.get("competitor")?.toLowerCase() || "";
  const competitor = COMPETITOR_MAP[competitorKey];
  const headline = competitor?.headline || DEFAULT_HEADLINE;
  const competitorName = competitor?.name || "Other Coaching";

  // Scroll to section helper
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const comparisonRows = [
    { feature: "Batch Size", them: "500–2000+ students", us: "Small batches (≤30)", advantage: true },
    { feature: "Personal Mentorship", them: "No / Generic doubt-clearing", us: "1-on-1 IIM Alumni Mentors", advantage: true },
    { feature: "Study Plan", them: "One-size-fits-all", us: "AI-Personalized Daily Plan", advantage: true },
    { feature: "Mock Analysis", them: "Score only", us: "Deep section-wise analytics", advantage: true },
    { feature: "Doubt Resolution", them: "24–48 hour wait", us: "Same-day WhatsApp support", advantage: true },
    { feature: "Faculty", them: "Mix of experienced + new", us: "99%ile+ IIM Alumni only", advantage: true },
    { feature: "Cost", them: "₹30,000–₹1,20,000", us: "Starts at ₹4,999", advantage: true },
    { feature: "Results", them: "Undisclosed / vague", us: "300+ IIM converts, verified", advantage: true },
  ];

  const struggles = [
    { icon: Users, title: "Lost in the crowd", desc: "Large batch sizes mean your doubts go unanswered and you're just a number." },
    { icon: BookOpen, title: "Generic study material", desc: "Same plan for everyone — whether you're at 50%ile or 90%ile." },
    { icon: TrendingUp, title: "No accountability", desc: "Nobody tracks your progress or pushes you when motivation drops." },
    { icon: Phone, title: "Zero personal support", desc: "Automated replies and ticket systems instead of real human guidance." },
  ];

  const results = [
    { name: "Bhavy Jain", percentile: "99.5", college: "FMS Delhi", initials: "BJ", photo: studentBhavy, quote: "The structured strategy made all the difference in my preparation." },
    { name: "Rounak", percentile: "99.2", college: "IIM Bangalore", initials: "RK", photo: studentRounak, quote: "Mock analysis sessions helped me identify and fix weak areas fast." },
    { name: "Golla Rahul", percentile: "98.9", college: "IIT Bombay", initials: "GR", photo: studentRahul, quote: "Went from 90 to 98+ percentile in just 3 months of focused prep." },
    { name: "Aditya Kumar", percentile: "98.6", college: "XLRI Jamshedpur", initials: "AK", photo: studentAditya, quote: "The daily planner kept me disciplined throughout my journey." },
    { name: "Shruti Manghani", percentile: "98.3", college: "SP Jain", initials: "SM", photo: studentShruti, quote: "Personalized mentorship gave me clarity when I needed it most." },
    { name: "Ritik Kumar", percentile: "98.1", college: "IIM Udaipur", initials: "RK", photo: studentRitik, quote: "Strategy over hours — that mindset shift changed everything for me." },
    { name: "Prakhar Poddar", percentile: "98.0", college: "IIM Trichy", initials: "PP", photo: studentPrakhar, quote: "The right guidance at the right time made my CAT journey smooth." },
    { name: "Saloni Hindocha", percentile: "98.4", college: "IIT Mumbai", initials: "SH", photo: studentSaloni, quote: "Consistent practice with expert feedback was the key to my success." },
    { name: "Sattaki Basu", percentile: "98.2", college: "IIM Ranchi", initials: "SB", photo: studentSattaki, quote: "Structured mock analysis transformed my approach to the exam." },
  ];

  const testimonials = [
    { name: "Meera T.", highlight: "The structured approach changed everything for me.", text: "I was struggling with time management until I joined Percentilers. Their study planner and mock analysis helped me jump from 85 to 98 percentile in 4 months.", rating: 5 },
    { name: "Karthik N.", highlight: "Best investment I made for my CAT prep.", text: "The faculty didn't just teach — they mentored. Every doubt session felt personal. I got into IIM Bangalore, and I owe a lot to the Percentilers team.", rating: 5 },
    { name: "Divya S.", highlight: "Finally, coaching that focuses on strategy, not just content.", text: "Most coaching centers overload you with material. Percentilers gave me a clear plan, weekly targets, and honest feedback. That's what made the difference.", rating: 5 },
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
    <>
      <SEO
        title="CAT Coaching Comparison 2026 – Best Institute | Percentilers"
        description="Compare CAT coaching institutes side-by-side. See why 300+ students chose Percentilers' IIM-alumni mentorship over big coaching brands. Free masterclass inside."
        canonical="https://percentilers.in/cat-coaching-comparison"
      />
      {/* FAQ structured data for rich snippets */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      })}} />

      {/* ─── HERO ─── */}
      <section className="relative bg-foreground text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(25_100%_50%/0.15),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          {competitor && (
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
              Comparing {competitorName}?
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            {headline}
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10">
            300+ students switched to Percentilers and scored 99%ile+. See the difference an IIM-alumni mentor makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg font-bold" onClick={() => scrollTo("masterclass-section")}>
              Watch Free Masterclass <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => scrollTo("call-section")}>
              Book Free Counseling Call
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/60">
            <span>✓ 300+ IIM Converts</span>
            <span>✓ 99%ile Faculty</span>
            <span>✓ Starts ₹4,999</span>
            <span>✓ 1-on-1 Mentorship</span>
          </div>
        </div>
      </section>

      {/* ─── DECISION SECTION ─── */}
      <section className="py-14 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Making a ₹50,000+ Decision?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Choosing CAT coaching isn't just about content — it's about the system, mentorship, and accountability that actually gets you to your dream B-school.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "72%", label: "of CAT aspirants regret their coaching choice" },
              { num: "3x", label: "higher conversion rate with personalized mentorship" },
              { num: "89%", label: "of our students say mentorship was the #1 factor" },
            ].map((s) => (
              <div key={s.label} className="p-6 rounded-2xl bg-muted/50 border border-border">
                <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2">{s.num}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center mb-3">
            {competitorName} vs Percentilers
          </h2>
          <p className="text-muted-foreground text-center mb-10">An honest, side-by-side comparison</p>
          <div className="rounded-2xl border border-border overflow-hidden bg-card">
            <div className="grid grid-cols-3 bg-foreground text-primary-foreground text-sm font-bold">
              <div className="p-4">Feature</div>
              <div className="p-4 text-center">{competitorName}</div>
              <div className="p-4 text-center text-primary">Percentilers</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-card" : "bg-muted/30"} border-t border-border`}>
                <div className="p-4 font-medium text-foreground">{row.feature}</div>
                <div className="p-4 text-center text-muted-foreground flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4 text-destructive shrink-0 hidden sm:block" />
                  <span>{row.them}</span>
                </div>
                <div className="p-4 text-center text-foreground font-medium flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 hidden sm:block" />
                  <span>{row.us}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" className="h-12 px-8 font-bold" onClick={() => scrollTo("masterclass-section")}>
              See the Percentilers Difference <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── WHY STUDENTS STRUGGLE ─── */}
      <section className="py-14 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center mb-3">Why Most CAT Aspirants Struggle</h2>
          <p className="text-muted-foreground text-center mb-10">It's not about intelligence — it's about the system</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {struggles.map((s) => (
              <div key={s.title} className="flex gap-4 p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PERCENTILERS SYSTEM ─── */}
      <section className="py-14 md:py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">The Percentilers Preparation System</h2>
          <p className="text-primary-foreground/80 mb-10 max-w-2xl mx-auto">A battle-tested framework used by 300+ IIM converts</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { step: "01", title: "AI Study Plan", desc: "Personalized daily schedule based on your strengths, weaknesses, and available hours" },
              { step: "02", title: "IIM Mentor", desc: "Dedicated 99%ile+ IIM alumni mentor who tracks your progress weekly" },
              { step: "03", title: "Mock Mastery", desc: "Section-wise deep analysis with improvement strategies after every mock" },
              { step: "04", title: "Interview Prep", desc: "Full WAT-PI preparation with IIM panelist mock interviews" },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20">
                <div className="text-3xl font-extrabold text-primary-foreground/30 mb-2">{s.step}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-primary-foreground/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RESULTS ─── */}
      <section className="py-14 md:py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center mb-3">Real Results, Real Students</h2>
          <p className="text-muted-foreground text-center mb-10">Verified converts — not vague testimonials</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((r) => (
              <div key={r.name} className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/50 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all bg-muted overflow-hidden">
                    <AvatarImage src={r.photo} alt={`${r.name} – ${r.percentile}%ile CAT scorer`} className="object-cover object-top scale-[1.3] translate-y-[5%]" loading="lazy" decoding="async" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{r.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GraduationCap className="h-3 w-3" />
                      {r.college}
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-3xl font-extrabold text-primary">{r.percentile}</span>
                  <span className="text-sm font-medium text-muted-foreground">%ile</span>
                </div>
                <div className="flex gap-2 items-start">
                  <Quote className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground italic leading-relaxed">{r.quote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center mb-10">What Students Say</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-border bg-card relative overflow-hidden group">
                <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-bold text-foreground text-lg mb-3">"{t.highlight}"</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.text}</p>
                <p className="text-sm font-semibold text-primary">— {t.name}</p>
              </div>
            ))}
          </div>

          {/* WhatsApp Screenshots */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-full text-sm font-semibold">
              <MessageCircle className="h-4 w-4" />
              Real Student Messages
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-border/30 max-w-4xl mx-auto">
            <div className="columns-2 md:columns-3 gap-4">
              {whatsappScreenshots.map((src, i) => (
                <div key={i} className="break-inside-avoid mb-4">
                  <div className="rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card">
                    <img src={src} alt={`WhatsApp testimonial from a CAT student – screenshot ${i + 1}`} className="w-full h-auto object-contain" loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MASTERCLASS CTA ─── */}
      <section id="masterclass-section" className="py-14 md:py-20 bg-foreground text-primary-foreground">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">Watch the Free CAT Strategy Masterclass</h2>
          <p className="text-primary-foreground/70 mb-8">90-minute session by IIM alumni. Learn the exact strategy used by 99%ile scorers. No pitch, pure value.</p>
          <LeadForm ctaType="masterclass" competitor={competitorKey} label="Watch Free Masterclass →" />
        </div>
      </section>

      {/* ─── COUNSELING CALL CTA ─── */}
      <section id="call-section" className="py-14 md:py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3">Not Sure Which Path Is Right?</h2>
          <p className="text-muted-foreground mb-8">Book a free 15-minute counseling call with our IIM-alumni team. Get a personalized prep roadmap — zero pressure, zero sales pitch.</p>
          <LeadForm ctaType="call" competitor={competitorKey} label="Book Free Counseling Call →" />
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-14 md:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ─── FOOTER STRIP ─── */}
      <section className="py-8 bg-foreground text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Percentilers. All rights reserved. |{" "}
            <a href="/terms" className="underline hover:text-primary">Terms</a> |{" "}
            <a href="/privacy-policy" className="underline hover:text-primary">Privacy</a> |{" "}
            <a href="/refund-policy" className="underline hover:text-primary">Refund Policy</a>
          </p>
        </div>
      </section>

      {/* ─── STICKY MOBILE CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-sm border-t border-border p-3 flex gap-2">
        <Button className="flex-1 h-11 font-bold text-sm" onClick={() => scrollTo("masterclass-section")}>
          Free Masterclass
        </Button>
        <Button variant="secondary" className="flex-1 h-11 font-bold text-sm border border-primary text-primary" onClick={() => scrollTo("call-section")}>
          Free Call
        </Button>
      </div>

      {/* Bottom padding for sticky CTA on mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}
