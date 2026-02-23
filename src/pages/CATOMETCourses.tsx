import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { useLeadModal } from "@/components/LeadModalProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import mentorImg from "@/assets/founder-pranshul.webp";
import studentAarav from "@/assets/student-aarav.jpg";
import studentPriya from "@/assets/student-priya.jpg";
import studentRohan from "@/assets/student-rohan.jpg";
import {
  Shield, Video, BookOpen, Users, Clock, Target,
  CheckCircle2, XCircle, Star, ArrowRight, Sparkles,
  GraduationCap, Brain, Trophy, Flame, ChevronDown, ChevronUp,
} from "lucide-react";

const courses = [
  {
    id: "guarantee",
    name: "95%ile Guarantee Course",
    tagline: "95 Percentile or Your Money Back!",
    price: 27999,
    originalPrice: 40000,
    badge: "Most Popular",
    badgeColor: "bg-primary text-primary-foreground",
    accent: "from-primary/20 to-primary/5",
    borderAccent: "hover:border-primary/40",
    iconBg: "bg-primary/10",
    icon: Shield,
    language: "Bilingual",
    url: "https://online.percentilers.in/courses/CAT-2026-Guarantee-Program",
    highlights: [
      { icon: Shield, text: "95%ile Money-Back Guarantee" },
      { icon: Video, text: "Live Classes Mon–Fri, 9–11 PM" },
      { icon: Users, text: "Batch Size: 30 Students" },
      { icon: BookOpen, text: "35 CAT-Level Mock Tests + Live Analysis" },
      { icon: Brain, text: "26 Advanced Workshops" },
      { icon: Target, text: "1-on-1 Weekend Doubt Clearing" },
      { icon: GraduationCap, text: "Profile Building + GD/PI Prep" },
      { icon: Flame, text: "Weekly Performance Counseling" },
      { icon: Trophy, text: "Psychological Sessions for Peak Performance" },
      { icon: BookOpen, text: "Hard Copy Books Included" },
      { icon: Star, text: "Full OMET Prep: SNAP, XAT, NMAT, IIFT" },
    ],
    bestFor: "Serious aspirants who want end-to-end guaranteed preparation with full OMET coverage.",
  },
  {
    id: "live",
    name: "Live Class Course",
    tagline: "A Perfect Start to Your CAT Journey!",
    price: 24999,
    originalPrice: 27000,
    badge: "Best Value",
    badgeColor: "bg-accent-foreground text-background",
    accent: "from-blue-500/15 to-blue-500/5",
    borderAccent: "hover:border-blue-400/40",
    iconBg: "bg-blue-500/10",
    icon: Video,
    language: "Hinglish",
    url: "https://online.percentilers.in/courses/CAT-2026-Live-Class-Course--A-Perfect-Start-to-Your-CAT-Journey",
    highlights: [
      { icon: Video, text: "Live Classes Mon–Fri, 9–11 PM" },
      { icon: Users, text: "Batch Size: 30 Students" },
      { icon: BookOpen, text: "32 CAT-Level Mock Tests + Live Analysis" },
      { icon: Brain, text: "24 Advanced Workshops" },
      { icon: Target, text: "1-on-1 Weekend Doubt Clearing" },
      { icon: Flame, text: "Weekly Performance Counseling" },
      { icon: Trophy, text: "Psychological Sessions Included" },
      { icon: BookOpen, text: "Digital Study Material" },
    ],
    bestFor: "Budget-conscious aspirants focused primarily on CAT who want quality live teaching.",
  },
  {
    id: "recorded",
    name: "Guided Recorded Course",
    tagline: "Learn at Your Own Pace",
    price: 10000,
    originalPrice: 14999,
    badge: "Most Flexible",
    badgeColor: "bg-green-600 text-primary-foreground",
    accent: "from-green-500/15 to-green-500/5",
    borderAccent: "hover:border-green-400/40",
    iconBg: "bg-green-500/10",
    icon: Clock,
    language: "English + Hindi",
    url: "https://online.percentilers.in/courses/CAT-2025-Guided-Recorded-Course",
    highlights: [
      { icon: Clock, text: "Pre-Recorded Lectures – Learn Anytime" },
      { icon: Video, text: "2 Live Mentorship Sessions / Month" },
      { icon: BookOpen, text: "32 CAT-Level Mock Tests" },
      { icon: Target, text: "Daily Mini Assignments" },
      { icon: Flame, text: "Monthly Performance Counseling" },
      { icon: Brain, text: "Guided Self-Study Plans" },
      { icon: Trophy, text: "Psychological Sessions (Recorded)" },
      { icon: Star, text: "Unlimited Access Until Exam" },
    ],
    bestFor: "Working professionals & self-disciplined learners who need flexible schedules.",
  },
];

const comparisonFeatures = [
  { feature: "Live Classes", guarantee: "Mon–Fri Daily", live: "Mon–Fri Daily", recorded: "2x/Month Mentorship" },
  { feature: "95%ile Guarantee", guarantee: true, live: false, recorded: false },
  { feature: "CAT Mock Tests", guarantee: "35", live: "32", recorded: "32" },
  { feature: "Advanced Workshops", guarantee: "26", live: "24", recorded: "—" },
  { feature: "1-on-1 Doubt Clearing", guarantee: true, live: true, recorded: "Limited" },
  { feature: "Performance Counseling", guarantee: "Weekly", live: "Weekly", recorded: "Monthly" },
  { feature: "OMET Preparation", guarantee: true, live: "Add-on", recorded: "Add-on" },
  { feature: "Profile Building + GD/PI", guarantee: true, live: false, recorded: false },
  { feature: "Hard Copy Books", guarantee: true, live: "Add-on", recorded: "Add-on" },
  { feature: "Psychological Sessions", guarantee: true, live: true, recorded: "Recorded" },
  { feature: "Batch Size", guarantee: "30", live: "30", recorded: "Self-Paced" },
  { feature: "Un-mute in Classes", guarantee: true, live: true, recorded: false },
];

const renderCell = (val: boolean | string) => {
  if (val === true) return <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />;
  if (val === false) return <XCircle className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm font-medium text-foreground">{val}</span>;
};

const CATOMETCourses = () => {
  const { openPhoneModal } = useLeadModal();
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "CAT + OMET Complete Preparation Course",
      "description": "Comprehensive CAT coaching with live classes, 30+ mock tests, OMET coverage (XAT, SNAP, NMAT, IIFT), mentorship and profile building.",
      "provider": { "@type": "Organization", "name": "Percentilers", "url": "https://percentilers.in" },
      "hasCourseInstance": { "@type": "CourseInstance", "courseMode": "Online", "inLanguage": ["English", "Hindi"] },
      "offers": { "@type": "Offer", "priceCurrency": "INR", "price": "27999", "availability": "https://schema.org/InStock" }
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <>
      <SEO
        title="Online CAT Coaching Programs | Best CAT Preparation Courses"
        description="Explore structured online CAT coaching programs designed for serious CAT exam aspirants aiming for 95+ percentile with proven preparation systems."
        canonical="https://percentilers.in/courses/cat-omet"
      />
      <Navbar />
      <main>
        {/* Hero – compact */}
        <section className="relative py-4 md:py-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-primary/[0.04] blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2.5 md:space-y-3 max-w-3xl mx-auto"
            >
              <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase text-primary/70">
                CAT + OMET Programs
              </span>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Choose Your Path to{" "}
                <span className="text-primary relative">
                  IIM
                  <Sparkles className="absolute -top-2 -right-5 md:-top-3 md:-right-6 h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
                </span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Three programs tailored to your schedule, budget, and ambition.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Founder trust strip */}
        <section className="py-4 md:py-6 bg-secondary/40 border-y border-border">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex items-center gap-3 md:gap-4 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-primary/20 blur-sm" />
              <img
                  src={mentorImg}
                  alt="Pranshul Verma – 7x CAT 100%iler"
                  className="relative w-12 h-12 md:w-16 md:h-16 rounded-full object-cover object-[center_15%] scale-[1.3] ring-2 ring-primary/30"
                />
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-foreground">
                  Designed by Pranshul Verma{" "}
                  <Badge className="bg-primary/10 text-primary text-[8px] md:text-[9px] ml-1 align-middle">7x CAT 100%iler</Badge>
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">TISS Mumbai Alumni · 10,000+ students mentored</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Course Cards */}
        <section className="py-8 md:py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 md:gap-6 max-w-6xl mx-auto">
              {courses.map((course, i) => {
                const isExpanded = expandedCourse === course.id;
                const CourseIcon = course.icon;

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card
                      className={`relative border-2 border-border ${course.borderAccent} transition-all duration-300 overflow-hidden group cursor-pointer`}
                      onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                    >
                      <div className={`h-1 md:h-1.5 w-full bg-gradient-to-r ${course.accent}`} />

                      {/* Header: always visible */}
                      <div className={`flex flex-row items-center justify-between gap-3 p-4 md:p-6 bg-gradient-to-br ${course.accent}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl ${course.iconBg} flex items-center justify-center shrink-0`}>
                            <CourseIcon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm md:text-lg font-bold text-foreground">{course.name}</h3>
                              <Badge className={`${course.badgeColor} text-[8px] md:text-[10px] tracking-wider uppercase`}>
                                {course.badge}
                              </Badge>
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{course.tagline}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-lg md:text-2xl font-bold text-foreground">₹{course.price.toLocaleString("en-IN")}</span>
                            <div className="flex items-center gap-1 justify-end">
                              <span className="text-[9px] md:text-xs text-muted-foreground line-through">₹{course.originalPrice.toLocaleString("en-IN")}</span>
                              <Badge variant="secondary" className="text-[7px] md:text-[10px]">
                                {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                              </Badge>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                          ) : (
                            <motion.div
                              animate={{ y: [0, 4, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                              className="md:hidden"
                            >
                              <ChevronDown className="h-4 w-4 text-primary" />
                            </motion.div>
                          )}
                          {!isExpanded && <ChevronDown className="hidden md:block h-5 w-5 text-muted-foreground" />}
                        </div>
                      </div>

                      {/* Expandable features */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-border"
                        >
                          <div className="p-4 md:p-6 flex flex-col">
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2 md:gap-y-2.5 mb-3 md:mb-4">
                              {course.highlights.map((h, idx) => {
                                const Icon = h.icon;
                                return (
                                  <motion.li
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="flex items-start gap-2 text-xs md:text-sm text-foreground"
                                  >
                                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary mt-0.5 shrink-0" />
                                    <span>{h.text}</span>
                                  </motion.li>
                                );
                              })}
                            </ul>

                            <div className="bg-secondary/60 rounded-lg p-2.5 md:p-3 mb-3">
                              <p className="text-[10px] md:text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Best for:</span> {course.bestFor}
                              </p>
                            </div>

                            <Button
                              className="w-full group/btn"
                              asChild
                              onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                              <a href={course.url} target="_blank" rel="noopener noreferrer">
                                Enroll Now <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                              </a>
                            </Button>
                            <p className="text-[10px] text-muted-foreground tracking-wide uppercase text-center mt-2">{course.language}</p>
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

        {/* Mini testimonials strip */}
        <section className="py-6 md:py-8 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-4xl mx-auto">
              {[
                { name: "Aarav S.", percentile: "99.2%ile", college: "IIM Ahmedabad", quote: "The guarantee course changed my life.", photo: studentAarav },
                { name: "Priya M.", percentile: "98.5%ile", college: "IIM Bangalore", quote: "Live classes kept me accountable every day.", photo: studentPriya },
                { name: "Rohan K.", percentile: "96.1%ile", college: "IIM Lucknow", quote: "Recorded course fit perfectly around my job.", photo: studentRohan },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-3 md:p-4 h-full border border-border">
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                      <img src={t.photo} alt={t.name} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover ring-1 ring-primary/20" />
                      <div>
                        <p className="text-[10px] md:text-xs font-semibold text-foreground">{t.name}</p>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground">{t.college}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-[9px] md:text-[10px] font-bold">{t.percentile}</Badge>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground italic">"{t.quote}"</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-10 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-8 md:mb-12 space-y-2 md:space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-[10px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.3em] uppercase text-primary/60">
                Side-by-Side
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground">
                Compare <span className="text-primary">All Programs</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              {/* Mobile: stacked comparison cards */}
              <div className="block md:hidden space-y-3">
                {comparisonFeatures.map((row, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-3">
                    <p className="text-xs font-semibold text-foreground mb-2">{row.feature}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[9px] text-muted-foreground mb-1">Guarantee</p>
                        <div className="text-xs font-medium">{renderCell(row.guarantee)}</div>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground mb-1">Live</p>
                        <div className="text-xs font-medium">{renderCell(row.live)}</div>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground mb-1">Recorded</p>
                        <div className="text-xs font-medium">{renderCell(row.recorded)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Price row mobile */}
                <div className="bg-primary/5 rounded-xl border border-primary/20 p-3">
                  <p className="text-xs font-bold text-foreground mb-2">Price</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Guarantee</p>
                      <p className="text-sm font-bold text-primary">₹27,999</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Live</p>
                      <p className="text-sm font-bold text-foreground">₹24,999</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground mb-1">Recorded</p>
                      <p className="text-sm font-bold text-foreground">₹10,000</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop: table */}
              <Card className="overflow-hidden border hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50">
                        <TableHead className="w-[200px] font-bold text-foreground">Feature</TableHead>
                        <TableHead className="text-center font-bold text-foreground">
                          <div className="space-y-1">
                            <Badge className="bg-primary text-primary-foreground text-[9px]">RECOMMENDED</Badge>
                            <div>95%ile Guarantee</div>
                          </div>
                        </TableHead>
                        <TableHead className="text-center font-bold text-foreground">Live Class</TableHead>
                        <TableHead className="text-center font-bold text-foreground">Guided Recorded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonFeatures.map((row, i) => (
                        <TableRow key={i} className={i % 2 === 0 ? "bg-secondary/20" : ""}>
                          <TableCell className="font-medium text-foreground">{row.feature}</TableCell>
                          <TableCell className="text-center">{renderCell(row.guarantee)}</TableCell>
                          <TableCell className="text-center">{renderCell(row.live)}</TableCell>
                          <TableCell className="text-center">{renderCell(row.recorded)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-primary/5 font-bold">
                        <TableCell className="font-bold text-foreground">Price</TableCell>
                        <TableCell className="text-center text-lg font-bold text-primary">₹27,999</TableCell>
                        <TableCell className="text-center text-lg font-bold text-foreground">₹24,999</TableCell>
                        <TableCell className="text-center text-lg font-bold text-foreground">₹10,000</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-8 md:mt-10 max-w-3xl mx-auto">
              {courses.map((c) => (
                <Button
                  key={c.id}
                  variant={c.id === "guarantee" ? "default" : "outline"}
                  className="flex-1 text-sm"
                  asChild
                >
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    {c.id === "guarantee" ? "Enroll in Guarantee Course" : `Choose ${c.name.split(" ")[0]}`}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Need Help */}
        <section className="py-10 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-3 md:space-y-4"
            >
              <h3 className="text-xl md:text-2xl font-bold text-foreground">Not sure which course is right for you?</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Our academic counselors can help you pick the perfect program based on your goals, schedule, and budget.
              </p>
              <Button size="lg" className="w-full sm:w-auto" onClick={() => openPhoneModal("courses_talk_to_counselor")}>
                Book Free Counseling Call
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default CATOMETCourses;
