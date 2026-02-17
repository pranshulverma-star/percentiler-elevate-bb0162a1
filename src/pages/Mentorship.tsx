import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import mentorImg from "@/assets/mentor-pranshul.jpg";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone, Video, FileText, Repeat, Calendar,
  ArrowRight, Sparkles, Star, CheckCircle2,
  Users, Trophy, Zap, MessageCircle,
  ChevronDown, ChevronUp, Target, Brain, Flame,
} from "lucide-react";

const PAYMENT_URL = "https://rzp.io/rzp/LtnGmikQ";

const mentorshipTiers = [
  {
    id: "nudge",
    name: "Nudge",
    duration: "15-min Call",
    price: 99,
    icon: Phone,
    gradient: "from-green-500/15 to-green-500/5",
    borderColor: "border-green-200 hover:border-green-400",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    tag: "Quick Fix",
    tagColor: "bg-green-500 text-primary-foreground",
    oneLiner: "Stuck? Get your next 7 days fixed—now.",
    bestFor: "Pre/post-mock jitters, quick decision, time-crunched.",
    features: [
      "Targeted action plan for next 7 days",
      "One key bottleneck identified & solved",
      "WhatsApp summary after call",
    ],
    xp: 100,
    badge: "First Step",
  },
  {
    id: "clarity",
    name: "Clarity",
    duration: "30-min GMeet",
    price: 399,
    icon: Video,
    gradient: "from-sky-500/15 to-sky-500/5",
    borderColor: "border-sky-200 hover:border-sky-400",
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100",
    tag: "Popular",
    tagColor: "bg-primary text-primary-foreground",
    oneLiner: "Get a complete strategy reset for your weakest area.",
    bestFor: "Mid-prep confusion, section-specific struggles.",
    features: [
      "Deep-dive into one weak section",
      "Customized 2-week action plan",
      "Resource recommendations",
      "WhatsApp follow-up for 3 days",
    ],
    xp: 250,
    badge: "Clear Mind",
  },
  {
    id: "deep-dive",
    name: "Deep Dive",
    duration: "60-min GMeet",
    price: 799,
    icon: Brain,
    gradient: "from-violet-500/15 to-violet-500/5",
    borderColor: "border-violet-200 hover:border-violet-400",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    tag: "Best Value",
    tagColor: "bg-violet-500 text-primary-foreground",
    oneLiner: "Full-spectrum strategy session covering all 3 sections.",
    bestFor: "Complete strategy overhaul, plateaued scores.",
    features: [
      "All 3 sections analyzed in depth",
      "Mock analysis & score breakdown",
      "4-week detailed study plan",
      "Time management strategy",
      "WhatsApp follow-up for 7 days",
    ],
    xp: 500,
    badge: "Strategist",
    featured: true,
  },
  {
    id: "deep-dive-docs",
    name: "Deep Dive + Docs",
    duration: "60-min GMeet + Templates",
    price: 1299,
    icon: FileText,
    gradient: "from-amber-500/15 to-amber-500/5",
    borderColor: "border-amber-200 hover:border-amber-400",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    tag: "Premium",
    tagColor: "bg-amber-500 text-primary-foreground",
    oneLiner: "Everything in Deep Dive + written roadmap & templates.",
    bestFor: "Structured learners who want a documented plan.",
    features: [
      "Everything in Deep Dive",
      "Written 4-week roadmap document",
      "Mock review template",
      "Daily tracker spreadsheet",
      "Resource links & reading lists",
      "WhatsApp follow-up for 7 days",
    ],
    xp: 750,
    badge: "Planner Pro",
  },
  {
    id: "deep-dive-followup",
    name: "Deep Dive + 3 Followups",
    duration: "60-min + 3×15-min Nudges",
    price: 1499,
    icon: Repeat,
    gradient: "from-rose-500/15 to-rose-500/5",
    borderColor: "border-rose-200 hover:border-rose-400",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
    tag: "High Impact",
    tagColor: "bg-rose-500 text-primary-foreground",
    oneLiner: "Deep Dive + accountability with 3 follow-up nudges.",
    bestFor: "Need ongoing accountability and course correction.",
    features: [
      "Everything in Deep Dive",
      "3 follow-up Nudge calls (15 min each)",
      "Spaced over 3 weeks for accountability",
      "Progress tracking & adjustments",
      "Priority WhatsApp support",
    ],
    xp: 1000,
    badge: "Committed",
  },
  {
    id: "cat-buddy",
    name: "CAT Buddy",
    duration: "Monthly Subscription",
    price: 2999,
    perMonth: true,
    icon: Calendar,
    gradient: "from-primary/15 to-primary/5",
    borderColor: "border-primary/20 hover:border-primary/50",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    tag: "Ultimate",
    tagColor: "bg-primary text-primary-foreground",
    oneLiner: "Your personal CAT mentor on speed dial—all month.",
    bestFor: "Serious aspirants wanting continuous 1-on-1 guidance.",
    features: [
      "2 Deep Dive sessions per month",
      "4 Nudge calls per month",
      "Unlimited WhatsApp support",
      "Weekly progress reviews",
      "Mock analysis after every test",
      "Profile building guidance",
      "Priority scheduling",
    ],
    xp: 2000,
    badge: "CAT Warrior",
    featured: true,
  },
];

const stats = [
  { icon: Users, value: "500+", label: "Sessions Done" },
  { icon: Trophy, value: "92%", label: "Score Improved" },
  { icon: Star, value: "4.9", label: "Avg. Rating" },
  { icon: Target, value: "50+", label: "IIM Converts" },
];

const Mentorship = () => {
  const [expandedTier, setExpandedTier] = useState<string | null>("deep-dive");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-16 md:pt-20">
        {/* Hero */}
        <section className="relative py-8 md:py-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-primary/[0.04] blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-violet-500/[0.03] blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto space-y-2.5 md:space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-1.5 md:gap-2 bg-primary/10 text-primary text-[10px] md:text-xs font-bold tracking-wider uppercase px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
                1-on-1 Mentorship
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Your CAT Success Story{" "}
                <span className="text-primary relative">
                  Starts Here
                  <Sparkles className="absolute -top-2 -right-4 md:-top-4 md:-right-6 h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
                </span>
              </h1>
              <p className="text-xs md:text-base text-muted-foreground max-w-xl mx-auto">
                Coach-agnostic. Action-first. Limited seats each week. 
                Get personalized strategy from 7x CAT 100%ilers.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-6 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2 md:gap-3 bg-card border border-border rounded-xl p-2.5 md:p-3 shadow-sm">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm md:text-lg font-bold text-foreground leading-none">{s.value}</p>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Founder Strip */}
        <section className="py-4 md:py-8 bg-secondary/40 border-y border-border">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex items-center gap-3 md:gap-6 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <img
                src={mentorImg}
                alt="Pranshul Agrawal"
                className="w-12 h-12 md:w-20 md:h-20 rounded-full object-cover border-2 md:border-4 border-primary/20 shadow-lg shrink-0"
              />
              <div className="space-y-0.5 md:space-y-1">
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                  <h3 className="text-sm md:text-lg font-bold text-foreground">Pranshul Agrawal</h3>
                  <Badge className="bg-primary text-primary-foreground text-[8px] md:text-[10px]">7x CAT 100%iler</Badge>
                </div>
                <p className="text-[10px] md:text-sm text-muted-foreground">
                  IIM Ahmedabad alumnus · 10,000+ students mentored
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mentorship Tiers */}
        <section className="py-8 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-6 md:mb-12 space-y-2 md:space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase text-primary/60">Choose Your Level</span>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Pick the Mentorship That <span className="text-primary">Fits You</span>
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-lg mx-auto">
                From a quick 15-min nudge to a full monthly subscription — every tier is designed for results.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-6xl mx-auto">
              {mentorshipTiers.map((tier, i) => {
                const Icon = tier.icon;
                const isExpanded = expandedTier === tier.id;

                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onMouseEnter={() => setHoveredCard(tier.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <Card className={`relative overflow-hidden border-2 ${tier.borderColor} transition-all duration-300 group h-full flex flex-col ${tier.featured ? "ring-2 ring-primary/20" : ""}`}>
                      {/* Gradient header */}
                      <div className={`bg-gradient-to-br ${tier.gradient} p-3 md:p-5 pb-8 md:pb-10 relative`}>
                        {tier.featured && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] md:text-[9px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-bl-lg tracking-wider uppercase">
                            ⭐ Recommended
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${tier.iconBg} flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 md:h-7 md:w-7 ${tier.iconColor}`} />
                          </div>
                          <Badge className={`${tier.tagColor} text-[8px] md:text-[10px]`}>{tier.tag}</Badge>
                        </div>
                        <h3 className="text-sm md:text-lg font-bold text-foreground mt-2 md:mt-3">{tier.name}</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground">{tier.duration}</p>
                      </div>

                      {/* XP reward bar */}
                      <div className="relative -mt-4 md:-mt-5 mx-3 md:mx-4">
                        <div className="bg-card border border-border rounded-xl p-2 md:p-3 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-1.5 md:gap-2">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                              <Zap className="h-3 w-3 md:h-4 md:w-4 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-[10px] md:text-xs font-bold text-foreground">{tier.xp} XP</p>
                              <p className="text-[8px] md:text-[9px] text-muted-foreground">Reward</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[8px] md:text-[9px] gap-0.5 md:gap-1">
                            <Trophy className="h-2 w-2 md:h-2.5 md:w-2.5" /> {tier.badge}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 md:p-5 pt-2.5 md:pt-4 flex-1 flex flex-col">
                        <p className="text-xs md:text-sm font-medium text-foreground mb-1.5 md:mb-2">"{tier.oneLiner}"</p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mb-3 md:mb-4">
                          <span className="font-semibold text-foreground">Best for:</span> {tier.bestFor}
                        </p>

                        {/* Expandable features */}
                        <button
                          onClick={() => setExpandedTier(isExpanded ? null : tier.id)}
                          className="flex items-center gap-1 text-[10px] md:text-xs font-semibold text-primary mb-1.5 md:mb-2 hover:underline"
                        >
                          What you get {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 md:space-y-1.5 mb-3 md:mb-4">
                                {tier.features.map((f, idx) => (
                                  <motion.div
                                    key={idx}
                                    className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-foreground"
                                    initial={{ x: -5, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.04 }}
                                  >
                                    <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-green-500 shrink-0" />
                                    {f}
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Price + CTA */}
                        <div className="flex items-end justify-between mt-auto pt-2.5 md:pt-3 border-t border-border">
                          <div>
                            <span className="text-lg md:text-xl font-bold text-foreground">₹{tier.price.toLocaleString()}</span>
                            {tier.perMonth && <span className="text-[10px] md:text-xs text-muted-foreground">/month</span>}
                          </div>
                          <Button size="sm" className="group/btn text-xs md:text-sm h-8 md:h-9 px-3 md:px-4" asChild>
                            <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer">
                              Book Now
                              <ArrowRight className="ml-1 h-3 w-3 md:h-3.5 md:w-3.5 transition-transform group-hover/btn:translate-x-1" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-8 md:py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-6 md:mb-12 space-y-2 md:space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase text-primary/60">Success Stories</span>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground">
                What Students Who Trusted Us <span className="text-primary">Have to Say</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: "Naira Khurana",
                  college: "IIM C",
                  initials: "NK",
                  text: "In the first call, we cut the clutter and fixed a 7-day plan. Two follow-ups later, my accuracy climbed 63%→82% and I averaged 94 %ile across the last 4 mocks. Best part? I finally knew exactly what to do each week.",
                },
                {
                  name: "Aayushi Rana",
                  college: "XLRI",
                  initials: "AR",
                  text: "Pranshul's 60-min Deep Dive + Docs gave me a 4-week roadmap and a mock-review template. The weekly 10-min check-ins kept me honest.",
                },
                {
                  name: "Hardik Patel",
                  college: "SPJIMS",
                  initials: "HP",
                  text: "The 30-min Clarity session was all I needed. I got a simple plan, error-log sheet, and a 'how to review mocks' rubric. Went from 0 to 2 mocks/week, QA rose 42→63 marks in a month, and LRDI stopped feeling like roulette. Zero fluff—just direction.",
                },
                {
                  name: "Ankur Yadav",
                  college: "IIM B",
                  initials: "AY",
                  text: "Buddy plan kept me accountable. Small weekly wins resulted in big confidence. QA rose from 36 to 58 marks in a month with weekly error-log audits.",
                },
                {
                  name: "Vishvajeet",
                  college: "XLRI",
                  initials: "VS",
                  text: "One 30-min call cut my study clutter. I finally knew what to do this week and did it. Booked 2 mocks/week; VARC accuracy jumped 62% → 80% in 14 days.",
                },
                {
                  name: "Shivam",
                  college: "FMS",
                  initials: "SH",
                  text: "Deep Dive + Docs = instant clarity. My mock review went from random to routine. Averaged 93%ile across the last 3 mocks (up from ~82).",
                },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="p-3 md:p-5 h-full flex flex-col border border-border">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-primary/20">
                        <AvatarFallback className="text-[10px] md:text-xs font-bold bg-primary/10 text-primary">
                          {t.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-foreground">{t.name}</p>
                        <Badge variant="outline" className="text-[8px] md:text-[9px] px-1.5 py-0">{t.college}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mb-1.5 md:mb-2">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 md:h-3.5 md:w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-8 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-6 md:mb-12 space-y-2 md:space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase text-primary/60">Process</span>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground">
                How It <span className="text-primary">Works</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Choose Your Tier", desc: "Pick the mentorship level that fits your needs.", icon: Target },
                { step: "02", title: "Book & Pay", desc: "Secure your slot — limited seats each week.", icon: Calendar },
                { step: "03", title: "Get Mentored", desc: "Personalized 1-on-1 session with expert mentor.", icon: MessageCircle },
                { step: "04", title: "Execute & Win", desc: "Follow the plan, track progress, crack CAT.", icon: Flame },
              ].map((s, i) => {
                const StepIcon = s.icon;
                return (
                  <motion.div
                    key={i}
                    className="text-center space-y-1.5 md:space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-10 h-10 md:w-14 md:h-14 mx-auto rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center">
                      <StepIcon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                    </div>
                    <p className="text-[9px] md:text-xs font-bold text-primary tracking-wider">{s.step}</p>
                    <h3 className="text-xs md:text-sm font-bold text-foreground">{s.title}</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-8 md:py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="max-w-2xl mx-auto space-y-3 md:space-y-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground">
                Ready to <span className="text-primary">Level Up?</span>
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Limited slots available each week. Don't wait — your CAT journey deserves expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer">
                    Book Your Session <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="https://wa.me/919911928071?text=Hi%2C%20I%27m%20interested%20in%20mentorship" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Mentorship;
