import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp,
  BookOpen, Brain, Target, Clock, Video, Star,
  Calculator, Shapes, PenTool, FileText, Sigma, GraduationCap, TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

const workshops = [
  {
    id: "lrdi",
    name: "LRDI Booster Course for CAT",
    tagline: "Master Logical Reasoning & Data Interpretation",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 2599,
    salePrice: 1499,
    rating: null,
    ratingCount: null,
    icon: Brain,
    tag: "LRDI",
    accent: "from-amber-500/15 to-amber-500/5",
    borderAccent: "hover:border-amber-400/40",
    iconBg: "bg-amber-500/10",
    link: "https://online.percentilers.in/courses/LRDI-BOOSTER-COURSE-FOR-CAT-61406e420cf25c0a56daf457",
    highlights: [
      { icon: Brain, text: "Complete LRDI strategy for CAT-level sets" },
      { icon: Target, text: "Arrangement, Grouping, Games & more" },
      { icon: Video, text: "Recorded video lessons with practice sets" },
      { icon: Clock, text: "Time management techniques for LRDI" },
    ],
    bestFor: "Aspirants who struggle with DI/LR sets and want a dedicated booster to crack LRDI.",
  },
  {
    id: "arithmetic",
    name: "Arithmetic Workshop for CAT",
    tagline: "Build rock-solid fundamentals in Arithmetic",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 2000,
    salePrice: 999,
    rating: 5.0,
    ratingCount: 8,
    icon: Calculator,
    tag: "QA",
    accent: "from-emerald-500/15 to-emerald-500/5",
    borderAccent: "hover:border-emerald-400/40",
    iconBg: "bg-emerald-500/10",
    link: "https://online.percentilers.in/courses/Arithmetic-Workshop-610272d40cf2ba896eaf2e57",
    highlights: [
      { icon: Calculator, text: "Percentages, Profit & Loss, SI/CI, Ratios" },
      { icon: Target, text: "Time, Speed & Distance / Work problems" },
      { icon: BookOpen, text: "CAT-level practice questions included" },
      { icon: Star, text: "Shortcut techniques for quick solving" },
    ],
    bestFor: "Students who want to nail Arithmetic — the highest-weightage QA topic in CAT.",
  },
  {
    id: "geometry",
    name: "Geometry Workshop",
    tagline: "Conquer Geometry with visual problem solving",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 1699,
    salePrice: 799,
    rating: 5.0,
    ratingCount: 9,
    icon: Shapes,
    tag: "QA",
    accent: "from-blue-500/15 to-blue-500/5",
    borderAccent: "hover:border-blue-400/40",
    iconBg: "bg-blue-500/10",
    link: "https://online.percentilers.in/courses/Geometryworkshop-60e55a660cf24f6d1fed932d",
    highlights: [
      { icon: Shapes, text: "Triangles, Circles, Quadrilaterals & Polygons" },
      { icon: Target, text: "Coordinate Geometry essentials" },
      { icon: BookOpen, text: "Concept + CAT-level problem sets" },
      { icon: PenTool, text: "Visual techniques for tricky questions" },
    ],
    bestFor: "Aspirants who find Geometry intimidating and want structured concept-to-problem mastery.",
  },
  {
    id: "algebra",
    name: "Algebra Workshop for CAT",
    tagline: "From basics to CAT-level Algebra mastery",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 2499,
    salePrice: 899,
    rating: 5.0,
    ratingCount: 9,
    icon: Sigma,
    tag: "QA",
    accent: "from-violet-500/15 to-violet-500/5",
    borderAccent: "hover:border-violet-400/40",
    iconBg: "bg-violet-500/10",
    link: "https://online.percentilers.in/courses/Algebra-Workshop-5f4e9b880cf244357e6515cc",
    highlights: [
      { icon: Sigma, text: "Equations, Inequalities, Functions & Logs" },
      { icon: Target, text: "Progressions & Series for CAT" },
      { icon: BookOpen, text: "Practice sets with detailed solutions" },
      { icon: Star, text: "Approach-building for abstract problems" },
    ],
    bestFor: "Students looking to strengthen their Algebra game — a must-crack area for 95+%ile.",
  },
  {
    id: "rcCr",
    name: "RC & Critical Reasoning Workshop",
    tagline: "Elevate your reading speed & comprehension accuracy",
    instructor: "Kanika Goyal",
    originalPrice: 2899,
    salePrice: 999,
    rating: 5.0,
    ratingCount: 8,
    icon: FileText,
    tag: "VARC",
    accent: "from-rose-500/15 to-rose-500/5",
    borderAccent: "hover:border-rose-400/40",
    iconBg: "bg-rose-500/10",
    link: "https://online.percentilers.in/courses/Reading-Comprehension--Critical-Reasoning-Workshop-5f5f9d1a0cf20a7044de3af9",
    highlights: [
      { icon: FileText, text: "RC strategies for all passage types" },
      { icon: Brain, text: "Critical Reasoning & Para Jumbles" },
      { icon: Target, text: "Inference vs. fact-based question drilling" },
      { icon: Clock, text: "Speed-reading & elimination techniques" },
    ],
    bestFor: "Anyone who wants to boost VARC accuracy — the most scoring yet tricky CAT section.",
  },
  {
    id: "modernMaths",
    name: "Modern Maths Workshop",
    tagline: "P&C, Probability, Functions & more",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 1553,
    salePrice: 699,
    rating: null,
    ratingCount: null,
    icon: PenTool,
    tag: "QA",
    accent: "from-teal-500/15 to-teal-500/5",
    borderAccent: "hover:border-teal-400/40",
    iconBg: "bg-teal-500/10",
    link: "https://online.percentilers.in/courses/Modern-Maths-Workshop-CAT-613e3e330cf2f7bcf9666501",
    highlights: [
      { icon: PenTool, text: "Permutations & Combinations from scratch" },
      { icon: Target, text: "Probability, Set Theory & Functions" },
      { icon: BookOpen, text: "CAT-level practice with walkthroughs" },
      { icon: Star, text: "Common traps & how to avoid them" },
    ],
    bestFor: "Students who want to turn Modern Maths from a weakness into a scoring area.",
  },
  {
    id: "booster",
    name: "OMET Booster – MH-CET | SNAP | NMAT | IIFT | TISSMAT | CMAT",
    tagline: "One course to cover all OMETs",
    instructor: "Pranshul Verma, Mayank Raj Singh & Kanika Goyal",
    originalPrice: 6599,
    salePrice: 1899,
    rating: null,
    ratingCount: null,
    icon: GraduationCap,
    tag: "OMET",
    accent: "from-purple-500/15 to-purple-500/5",
    borderAccent: "hover:border-purple-400/40",
    iconBg: "bg-purple-500/10",
    link: "https://online.percentilers.in/courses/BOOSTER-COURSE--SNAP--NMAT--IIFT--TISS-MAT--CMAT-5fb8ba110cf291a16ac22abd",
    highlights: [
      { icon: GraduationCap, text: "Covers MH-CET, SNAP, NMAT, IIFT, TISSMAT, CMAT" },
      { icon: Video, text: "Exam-specific strategy & mock analysis" },
      { icon: BookOpen, text: "Dedicated practice papers per exam" },
      { icon: Target, text: "Exam pattern walkthroughs & tips" },
    ],
    bestFor: "CAT aspirants who also want to maximize OMET calls as backup options.",
  },
];

function discount(original: number, sale: number) {
  return Math.round(((original - sale) / original) * 100);
}

const Workshops = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <SEO
        title="Topic-wise Advanced Workshops for CAT | Percentilers"
        description="Master every CAT topic with our advanced workshops — Arithmetic, Algebra, Geometry, LRDI, VARC & more. Expert-led, affordable, and built for serious aspirants."
        canonical="https://percentilers.in/workshops"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-20 pb-6 md:pt-28 md:pb-10 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <Link
              to="/#courses"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Programs
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <Badge variant="secondary" className="mb-3 text-xs font-bold tracking-wider uppercase">
                Advanced Workshops
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                Topic-wise <span className="text-primary">Workshops</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Deep-dive into individual CAT topics with expert-led workshops. Master one topic at a time.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Workshop Cards */}
        <section className="py-6 md:py-14">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-3 md:gap-5 max-w-4xl mx-auto">
              {workshops.map((w, i) => {
                const isExpanded = expanded === w.id;
                const WIcon = w.icon;

                return (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                  >
                    <Card
                      className={`relative border-2 border-border ${w.borderAccent} transition-all duration-300 overflow-hidden cursor-pointer group`}
                      onClick={() => setExpanded(isExpanded ? null : w.id)}
                    >
                      <div className={`h-1 w-full bg-gradient-to-r ${w.accent}`} />

                      {/* Header row */}
                      <div className={`flex items-center justify-between gap-3 p-3.5 md:p-5 bg-gradient-to-br ${w.accent}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${w.iconBg} flex items-center justify-center shrink-0`}>
                            <WIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-sm md:text-base font-bold text-foreground truncate">{w.name}</h2>
                              <Badge variant="secondary" className="text-[8px] md:text-[10px] tracking-wider uppercase shrink-0">
                                {w.tag}
                              </Badge>
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 truncate">{w.tagline}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <span className="text-base md:text-xl font-bold text-foreground">₹{w.salePrice}</span>
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-[9px] md:text-xs text-muted-foreground line-through">₹{w.originalPrice}</span>
                              <Badge variant="secondary" className="text-[7px] md:text-[9px]">
                                {discount(w.originalPrice, w.salePrice)}% OFF
                              </Badge>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                          ) : (
                            <>
                              <motion.div
                                animate={{ scale: [1, 1.1, 1], y: [0, -2, 0] }}
                                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                                className="md:hidden flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-full shadow-md"
                              >
                                <span className="text-[8px] font-bold uppercase tracking-wider">Details</span>
                                <ChevronDown className="h-3 w-3" />
                              </motion.div>
                              <ChevronDown className="hidden md:block h-5 w-5 text-muted-foreground" />
                            </>
                          )}
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
                          <div className="p-4 md:p-5 flex flex-col">
                            {w.rating && (
                              <div className="flex items-center gap-1.5 mb-3">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, s) => (
                                    <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {w.rating} ({w.ratingCount} ratings)
                                </span>
                              </div>
                            )}

                            <p className="text-xs text-muted-foreground mb-3">
                              <span className="font-semibold text-foreground">By:</span> {w.instructor}
                            </p>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              {w.highlights.map((h, idx) => {
                                const HIcon = h.icon;
                                return (
                                  <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-start gap-2 text-xs md:text-sm text-foreground"
                                  >
                                    <HIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary mt-0.5 shrink-0" />
                                    <span>{h.text}</span>
                                  </motion.li>
                                );
                              })}
                            </ul>

                            <div className="bg-secondary/60 rounded-lg p-2.5 mb-3">
                              <p className="text-[10px] md:text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Best for:</span> {w.bestFor}
                              </p>
                            </div>

                            <Button
                              className="w-full group/btn"
                              asChild
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                              <a href={w.link} target="_blank" rel="noopener noreferrer">
                                Enroll Now <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                              </a>
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-10 md:py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Want the complete package?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm md:text-base">
              Get all topics covered with live classes, mocks & mentorship in our comprehensive CAT + OMET Course.
            </p>
            <Button size="lg" asChild>
              <Link to="/courses/cat-omet">Explore CAT + OMET Course</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Workshops;
