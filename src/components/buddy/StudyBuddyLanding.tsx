import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users2,
  Eye,
  Flame,
  Bell,
  Link2,
  UserPlus,
  BarChart3,
  Target,
  ArrowRight,
  Zap,
} from "lucide-react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const features = [
  { icon: Eye, title: "Shared Progress", desc: "See your buddy's planner completion and quiz scores — updated in real-time." },
  { icon: Flame, title: "2× Streak Bonus", desc: "Both active today? You each earn double points. Consistency = rewards." },
  { icon: Target, title: "Daily Sprint Visibility", desc: "View your buddy's sprint goals and completed tasks every single day." },
  { icon: Bell, title: "Gentle Nudges", desc: "One tap to remind your buddy it's time to study. No guilt, just care." },
];

const steps = [
  { icon: Link2, title: "Share Your Link", desc: "Generate a unique invite code and send it to your prep partner." },
  { icon: UserPlus, title: "Buddy Joins", desc: "They click, sign in, and you're instantly paired — takes 10 seconds." },
  { icon: BarChart3, title: "Track Together", desc: "See each other's daily streaks, sprint goals, and quiz activity." },
];

const stats = [
  { value: "500+", label: "Buddy pairs formed" },
  { value: "2×", label: "More consistent with a partner" },
  { value: "87%", label: "Complete daily goals" },
];

const faqs = [
  { q: "Is Study Buddy free?", a: "Yes, completely free. No hidden charges, no premium tier — just pure accountability." },
  { q: "Can I change my buddy later?", a: "Absolutely. You can dissolve a partnership anytime and invite someone new. Your streak history is preserved." },
  { q: "What can my buddy see?", a: "Your buddy sees your daily planner completion status, quiz attempts, streak count, and sprint goals. No personal data or phone numbers are shared." },
  { q: "Do I need to share my phone number?", a: "No. Study Buddy works entirely through your Google sign-in. No phone numbers are exchanged between partners." },
  { q: "What happens if my buddy stops studying?", a: "Send them a nudge! If they're consistently inactive, you can dissolve and find a new accountability partner." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

interface StudyBuddyLandingProps {
  onSignIn: () => void;
  ctaLabel?: string;
  children?: React.ReactNode;
}

export default function StudyBuddyLanding({ onSignIn, ctaLabel, children }: StudyBuddyLandingProps) {
  const heroCta = ctaLabel || "Get Your Study Buddy — Free";
  const finalCta = ctaLabel || "Get Started — It's Free";

  const handleCtaClick = () => {
    if (children) {
      document.getElementById("invite-section")?.scrollIntoView({ behavior: "smooth" });
    } else {
      onSignIn();
    }
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* ── Hero ── */}
      <section className="snap-section relative py-10 md:py-24 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
          <motion.div {...fade(0)}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] md:text-xs font-bold uppercase tracking-wider">
              <Zap className="h-3 w-3 md:h-3.5 md:w-3.5" /> Free Feature
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.08)}
            className="text-3xl md:text-6xl font-black tracking-[-0.02em] text-foreground leading-[1.1]"
          >
            Your CAT Prep<br />
            <span className="text-primary">Partner in Crime</span>
          </motion.h1>

          <motion.p
            {...fade(0.15)}
            className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Pair up with a friend. Track each other's daily progress. Stay accountable — and actually finish what you start.
          </motion.p>

          {/* Animated buddy illustration */}
          <motion.div {...fade(0.2)} className="flex items-center justify-center gap-3 md:gap-4 py-4 md:py-6">
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
              <Users2 className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary border-2 border-background" />
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
              <Users2 className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary border-2 border-background" />
            </div>
          </motion.div>

          <motion.div {...fade(0.25)}>
            <Button size="lg" onClick={handleCtaClick} className="gap-2 text-sm md:text-base px-6 md:px-8 h-11 md:h-12">
              {heroCta} <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-[11px] md:text-xs text-muted-foreground mt-2 md:mt-3">
              Already have an invite link? It will auto-pair you after sign-in.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="snap-section py-10 md:py-20">
        <motion.h2 {...fade()} className="text-xl md:text-3xl font-bold text-center text-foreground mb-6 md:mb-10">
          How It Works
        </motion.h2>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-4">
          {steps.map((s, i) => (
            <motion.div key={s.title} {...fade(i * 0.1)} className="relative text-center space-y-2 md:space-y-3">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px bg-border" />
              )}
              <div className="relative inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground font-bold text-base md:text-lg mx-auto">
                {i + 1}
              </div>
              <h3 className="font-bold text-sm md:text-base text-foreground">{s.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground max-w-[220px] mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature Showcase ── */}
      <section className="snap-section py-10 md:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <motion.h2 {...fade()} className="relative text-xl md:text-3xl font-bold text-center text-foreground mb-6 md:mb-10">
          Everything You Get
        </motion.h2>
        <div className="relative max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fade(i * 0.08)}
              className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-lg p-4 md:p-5 space-y-2 md:space-y-3 hover:border-primary/30 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10">
                <f.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <h3 className="font-bold text-sm md:text-base text-foreground">{f.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="snap-section py-8 md:py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2 md:gap-4 text-center">
          {stats.map((s, i) => (
            <motion.div key={s.label} {...fade(i * 0.1)} className="space-y-0.5 md:space-y-1">
              <p className="text-2xl md:text-4xl font-black text-primary">{s.value}</p>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-tight">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="snap-section py-10 md:py-20 max-w-2xl mx-auto">
        <motion.h2 {...fade()} className="text-xl md:text-3xl font-bold text-center text-foreground mb-5 md:mb-8">
          Frequently Asked Questions
        </motion.h2>
        <motion.div {...fade(0.1)}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm md:text-base text-foreground">{f.q}</AccordionTrigger>
                <AccordionContent className="text-xs md:text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className="snap-section py-10 md:py-20 text-center space-y-4 md:space-y-5">
        <motion.h2 {...fade()} className="text-xl md:text-3xl font-bold text-foreground">
          Your future self will thank you.
        </motion.h2>
        <motion.p {...fade(0.08)} className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          CAT prep is a marathon. Don't run it alone.
        </motion.p>
        <motion.div {...fade(0.15)}>
           <Button size="lg" onClick={handleCtaClick} className="gap-2 text-sm md:text-base px-6 md:px-8 h-11 md:h-12">
             {finalCta} <ArrowRight className="h-4 w-4" />
           </Button>
        </motion.div>
       </section>

      {/* ── Invite Section (for authenticated users) ── */}
       {children && (
        <section id="invite-section" className="snap-section py-10 md:py-20 max-w-md mx-auto">
          {children}
        </section>
      )}
    </>
  );
}
