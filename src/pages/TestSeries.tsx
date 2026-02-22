import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  Target, Brain, BookOpen, Trophy, Flame, Zap,
  ArrowRight, Star, CheckCircle2, BarChart3,
  Sparkles, TrendingUp, Award, Lock,
  ChevronDown, ChevronUp,
} from "lucide-react";

const testPacks = [
  {
    id: "lrdi",
    name: "LRDI Topic Wise Tests",
    category: "Sectional",
    price: 0,
    tag: "Free",
    tagColor: "bg-green-500 text-primary-foreground",
    icon: Brain,
    gradient: "from-violet-500/15 to-violet-500/5",
    borderColor: "border-violet-200 hover:border-violet-400",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    url: "https://online.percentilers.in/courses/LRDI-Topic-Wise-Tests-66a35f39fe87b530cc885813",
    tests: 25,
    difficulty: "Beginner → Advanced",
    topics: ["Sets & Arrangements", "Data Interpretation", "Logical Reasoning", "Puzzles", "Games & Tournaments"],
    xpReward: 500,
    badge: "Logic Master",
  },
  {
    id: "varc",
    name: "VARC Topic Wise Tests",
    category: "Sectional",
    price: 0,
    tag: "Free",
    tagColor: "bg-green-500 text-primary-foreground",
    icon: BookOpen,
    gradient: "from-sky-500/15 to-sky-500/5",
    borderColor: "border-sky-200 hover:border-sky-400",
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100",
    url: "https://online.percentilers.in/courses/VARC-Topic-Wise-Tests-66a357f6dba1723eb7538cd6",
    tests: 20,
    difficulty: "Beginner → Advanced",
    topics: ["Reading Comprehension", "Para Jumbles", "Sentence Completion", "Critical Reasoning", "Odd One Out"],
    xpReward: 500,
    badge: "Vocab Wizard",
  },
  {
    id: "quant",
    name: "QA Topic Wise Tests",
    category: "Sectional",
    price: 0,
    tag: "Free",
    tagColor: "bg-green-500 text-primary-foreground",
    icon: TrendingUp,
    gradient: "from-amber-500/15 to-amber-500/5",
    borderColor: "border-amber-200 hover:border-amber-400",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
    url: "https://online.percentilers.in/courses/Quantitative-Aptitude-Topic-Wise-Tests-66a346c39d101b6570cafb6d",
    tests: 30,
    difficulty: "Beginner → Advanced",
    topics: ["Arithmetic", "Algebra", "Number System", "Geometry & Mensuration", "Modern Math"],
    xpReward: 600,
    badge: "Quant King",
  },
  {
    id: "cat-mocks",
    name: "Mock Tests For CAT",
    category: "Full-Length",
    price: 899,
    originalPrice: 1499,
    tag: "Best Seller",
    tagColor: "bg-primary text-primary-foreground",
    icon: Target,
    gradient: "from-primary/15 to-primary/5",
    borderColor: "border-primary/20 hover:border-primary/50",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    url: "https://online.percentilers.in/courses/Mock-Tests-For-CAT-6683e426fa05c84743c5544b",
    tests: 30,
    difficulty: "CAT Level",
    topics: ["Full-Length Mocks", "Sectional Analysis", "Percentile Predictor", "Video Solutions", "Comparison Reports"],
    xpReward: 1500,
    badge: "CAT Warrior",
    featured: true,
  },
  {
    id: "omet-mocks",
    name: "OMET Mock Tests",
    subtitle: "NMAT, SNAP, XAT, CUET-PG",
    category: "Full-Length",
    price: 499,
    originalPrice: 999,
    tag: "Multi-Exam",
    tagColor: "bg-accent-foreground text-background",
    icon: Award,
    gradient: "from-emerald-500/15 to-emerald-500/5",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    url: "https://online.percentilers.in/courses/Mock-Tests-For-NMAT-SNAP-XAT-CUET-PG--66d6eac39cceae2c8f4e8f09",
    tests: 20,
    difficulty: "Exam-Level",
    topics: ["NMAT Mocks", "SNAP Mocks", "XAT Mocks", "CUET-PG Mocks", "Detailed Solutions"],
    xpReward: 1000,
    badge: "Multi-Exam Pro",
  },
];

const stats = [
  { icon: BarChart3, value: "125+", label: "Total Tests" },
  { icon: Trophy, value: "10K+", label: "Students" },
  { icon: Star, value: "4.8", label: "Avg. Rating" },
  { icon: Flame, value: "98%", label: "Recommend" },
];

const leaderboard = [
  { rank: 1, name: "Ananya R.", xp: 4200, badge: "🏆" },
  { rank: 2, name: "Karan M.", xp: 3850, badge: "🥈" },
  { rank: 3, name: "Sneha P.", xp: 3600, badge: "🥉" },
  { rank: 4, name: "Arjun D.", xp: 3200, badge: "" },
  { rank: 5, name: "Priya S.", xp: 2900, badge: "" },
];

const TestSeries = () => {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "CAT Mock Test Series",
      "description": "Full-length CAT mock tests with sectional tests and detailed performance analysis dashboard.",
      "brand": { "@type": "Brand", "name": "Percentilers" },
      "offers": { "@type": "Offer", "priceCurrency": "INR", "price": "899", "availability": "https://schema.org/InStock" }
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const filters = ["All", "Free", "Sectional", "Full-Length"];
  const filtered = activeFilter === "All"
    ? testPacks
    : activeFilter === "Free"
      ? testPacks.filter(t => t.price === 0)
      : testPacks.filter(t => t.category === activeFilter);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative py-4 md:py-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-primary/[0.04] blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-violet-500/[0.03] blur-3xl" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto space-y-2 md:space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-1.5 md:gap-2 bg-primary/10 text-primary text-[10px] md:text-xs font-bold tracking-wider uppercase px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                <Zap className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Test Arena
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Level Up Your{" "}
                <span className="text-primary relative">
                  CAT Prep
                  <Sparkles className="absolute -top-2 -right-4 md:-top-4 md:-right-6 h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
                </span>
              </h1>
              <p className="text-xs md:text-base text-muted-foreground max-w-xl mx-auto">
                Practice with 125+ tests, earn XP, unlock badges, and climb the leaderboard.
              </p>
            </motion.div>

            {/* Trust stats – 4 in a row */}
            <motion.div
              className="mt-4 md:mt-10 grid grid-cols-4 gap-1.5 md:gap-3 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 md:flex-row md:gap-3 bg-card border border-border rounded-xl p-2 md:p-3 shadow-sm text-center md:text-left">
                    <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs md:text-lg font-bold text-foreground leading-none">{s.value}</p>
                      <p className="text-[7px] md:text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Filter tabs + Cards */}
        <section className="py-6 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            {/* Filter */}
            <motion.div
              className="flex justify-center gap-1.5 md:gap-2 mb-6 md:mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card text-muted-foreground border border-border hover:border-primary/30"
                  }`}
                >
                  {f}
                </button>
              ))}
            </motion.div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-6xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filtered.map((pack, i) => {
                  const Icon = pack.icon;
                  const isExpanded = expandedCard === pack.id;

                  return (
                    <motion.div
                      key={pack.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <Card
                        className={`relative overflow-hidden border-2 ${pack.borderColor} transition-all duration-300 group h-full flex flex-col ${pack.featured ? "ring-2 ring-primary/20" : ""} cursor-pointer`}
                        onClick={() => setExpandedCard(isExpanded ? null : pack.id)}
                      >
                        {/* Header – always visible */}
                        <div className={`bg-gradient-to-br ${pack.gradient} p-3 md:p-5 relative`}>
                          {pack.featured && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] md:text-[9px] font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-bl-lg tracking-wider uppercase">
                              ⭐ Featured
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${pack.iconBg} flex items-center justify-center shrink-0`}>
                                <Icon className={`h-4 w-4 md:h-6 md:w-6 ${pack.iconColor}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h3 className="text-xs md:text-lg font-bold text-foreground">{pack.name}</h3>
                                  <Badge className={`${pack.tagColor} text-[7px] md:text-[10px]`}>{pack.tag}</Badge>
                                </div>
                                {pack.subtitle && (
                                  <p className="text-[9px] md:text-xs text-muted-foreground">{pack.subtitle}</p>
                                )}
                                <p className="text-[9px] md:text-xs text-muted-foreground">{pack.tests} Tests · {pack.difficulty}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-right">
                                {pack.price === 0 ? (
                                  <span className="text-sm md:text-lg font-bold text-green-600">FREE</span>
                                ) : (
                                  <div>
                                    <span className="text-sm md:text-xl font-bold text-foreground">₹{pack.price}</span>
                                    {pack.originalPrice && (
                                      <span className="text-[8px] md:text-xs text-muted-foreground line-through ml-1">₹{pack.originalPrice}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                              {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </div>

                        {/* Expandable content */}
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-border"
                          >
                            {/* XP & Badge reward bar */}
                            <div className="mx-3 md:mx-4 mt-3 md:mt-4">
                              <div className="bg-card border border-border rounded-xl p-2 md:p-3 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-1.5 md:gap-2">
                                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Trophy className="h-3 w-3 md:h-4 md:w-4 text-amber-600" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] md:text-xs font-bold text-foreground">{pack.xpReward} XP</p>
                                    <p className="text-[8px] md:text-[9px] text-muted-foreground">Completion reward</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[8px] md:text-[9px] gap-0.5 md:gap-1">
                                  <Award className="h-2 w-2 md:h-2.5 md:w-2.5" /> {pack.badge}
                                </Badge>
                              </div>
                            </div>

                            <div className="p-3 md:p-5 pt-2 md:pt-4 flex flex-col">
                              {/* Progress bar */}
                              <div className="mb-3 md:mb-4">
                                <div className="flex justify-between text-[9px] md:text-[10px] text-muted-foreground mb-1">
                                  <span>{pack.tests} Tests</span>
                                  <span>{pack.difficulty}</span>
                                </div>
                                <Progress value={0} className="h-1.5 md:h-2" />
                                <p className="text-[8px] md:text-[9px] text-muted-foreground mt-1">Start practicing to track progress</p>
                              </div>

                              {/* Topics */}
                              <div className="space-y-1 md:space-y-1.5 mb-3 md:mb-5">
                                {pack.topics.map((topic, idx) => (
                                  <motion.div
                                    key={idx}
                                    className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-foreground"
                                    initial={{ x: -5, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.04 }}
                                  >
                                    <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-green-500 shrink-0" />
                                    <span>{topic}</span>
                                  </motion.div>
                                ))}
                              </div>

                              {/* CTA */}
                              <Button
                                className="w-full group/btn text-xs md:text-sm"
                                asChild
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              >
                                <a href={pack.url} target="_blank" rel="noopener noreferrer">
                                  {pack.price === 0 ? "Start Free" : "Enroll Now"}
                                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                                </a>
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Leaderboard + Badges Section */}
        <section className="py-8 md:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
              {/* Leaderboard */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="p-3 md:p-6 border-2 border-border h-full">
                  <div className="flex items-center gap-2 mb-3 md:mb-5">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Trophy className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-lg font-bold text-foreground">Leaderboard</h3>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Top performers this month</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    {leaderboard.map((entry, idx) => (
                      <motion.div
                        key={entry.rank}
                        className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl transition-colors ${
                          idx === 0 ? "bg-amber-50 border border-amber-200" :
                          idx === 1 ? "bg-slate-50 border border-slate-200" :
                          idx === 2 ? "bg-orange-50 border border-orange-200" :
                          "bg-secondary/40 border border-border"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08 }}
                      >
                        <span className="text-sm md:text-lg font-bold text-muted-foreground w-5 md:w-6 text-center">
                          {entry.badge || entry.rank}
                        </span>
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center text-[9px] md:text-xs font-bold text-primary">
                          {entry.name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs md:text-sm font-semibold text-foreground">{entry.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs md:text-sm font-bold text-primary">{entry.xp.toLocaleString()} XP</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-[8px] md:text-[10px] text-muted-foreground text-center mt-3 md:mt-4">
                    Complete tests to earn XP and appear on the leaderboard
                  </p>
                </Card>
              </motion.div>

              {/* Badges collection */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="p-3 md:p-6 border-2 border-border h-full">
                  <div className="flex items-center gap-2 mb-3 md:mb-5">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Award className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-lg font-bold text-foreground">Badge Collection</h3>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Complete packs to unlock</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {testPacks.map((pack, idx) => (
                      <motion.div
                        key={pack.id}
                        className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-xl bg-secondary/40 border border-border group cursor-default"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                      >
                        <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${pack.iconBg} flex items-center justify-center relative`}>
                          <pack.icon className={`h-4 w-4 md:h-6 md:w-6 ${pack.iconColor}`} />
                          <Lock className="absolute -bottom-1 -right-1 h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground bg-card rounded-full p-0.5" />
                        </div>
                        <p className="text-[8px] md:text-[10px] font-semibold text-foreground text-center leading-tight">{pack.badge}</p>
                        <p className="text-[7px] md:text-[8px] text-muted-foreground">{pack.xpReward} XP</p>
                      </motion.div>
                    ))}
                    {/* Placeholder locked badge */}
                    <motion.div
                      className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-3 rounded-xl bg-secondary/20 border border-dashed border-border opacity-50"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 0.5 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-muted flex items-center justify-center">
                        <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      </div>
                      <p className="text-[8px] md:text-[10px] font-semibold text-muted-foreground text-center">???</p>
                      <p className="text-[7px] md:text-[8px] text-muted-foreground">Hidden</p>
                    </motion.div>
                  </div>
                  <p className="text-[8px] md:text-[10px] text-muted-foreground text-center mt-3 md:mt-4">
                    Enroll & complete test packs to unlock badges
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-8 md:py-20 bg-gradient-to-b from-secondary/40 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="max-w-2xl mx-auto space-y-3 md:space-y-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                Start with <span className="text-primary">Free Tests</span> Today
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                3 out of 5 test packs are completely free. No sign-up required. Jump in and start practicing now.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a href="https://online.percentilers.in/s/store/courses/Tests" target="_blank" rel="noopener noreferrer">
                    Browse All Tests <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <a href="https://wa.me/919310729425?text=Hi%2C%20I%20want%20to%20know%20about%20test%20series" target="_blank" rel="noopener noreferrer">
                    Talk to a Mentor
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

export default TestSeries;
