import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import mentorImg from "@/assets/mentor-pranshul.jpg";
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
  const [expandedCourse, setExpandedCourse] = useState<string | null>("guarantee");

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Hero – compact */}
        <section className="relative py-10 md:py-14 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-3xl" />
          </div>
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3 max-w-3xl mx-auto"
            >
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/70">
                CAT + OMET Programs
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Choose Your Path to{" "}
                <span className="text-primary relative">
                  IIM
                  <Sparkles className="absolute -top-3 -right-6 h-5 w-5 text-primary animate-pulse" />
                </span>
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Three programs tailored to your schedule, budget, and ambition.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Founder trust strip */}
        <section className="py-6 bg-secondary/40 border-y border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-primary/20 blur-sm" />
                <img
                  src={mentorImg}
                  alt="Pranshul Agrawal – 7x CAT 100%iler"
                  className="relative w-16 h-16 rounded-full object-cover ring-2 ring-primary/30"
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-foreground">
                  Designed by Pranshul Agrawal{" "}
                  <Badge className="bg-primary/10 text-primary text-[9px] ml-1 align-middle">7x CAT 100%iler</Badge>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">IIM-A Alumni · 10,000+ students mentored · Featured in Times of India</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mini testimonials strip */}
        <section className="py-8 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { name: "Aarav S.", percentile: "99.2%ile", college: "IIM Ahmedabad", quote: "The guarantee course changed my life." },
                { name: "Priya M.", percentile: "98.5%ile", college: "IIM Bangalore", quote: "Live classes kept me accountable every day." },
                { name: "Rohan K.", percentile: "96.1%ile", college: "IIM Lucknow", quote: "Recorded course fit perfectly around my job." },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-4 h-full border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.college}</p>
                      </div>
                      <Badge variant="secondary" className="ml-auto text-[10px] font-bold">{t.percentile}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"{t.quote}"</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Course Cards */}
        <section className="py-12 md:py-20 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col gap-6 max-w-6xl mx-auto">
              {courses.map((course, i) => {
                const isExpanded = expandedCourse === course.id;
                const displayedHighlights = isExpanded ? course.highlights : course.highlights.slice(0, 5);
                const CourseIcon = course.icon;

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                  >
                    <Card className={`relative border-2 border-border ${course.borderAccent} transition-all duration-300 overflow-hidden group`}>
                      <div className={`h-1.5 w-full bg-gradient-to-r ${course.accent}`} />

                      <div className="flex flex-col md:flex-row">
                        {/* Left: Icon + Price panel */}
                        <div className={`flex flex-col items-center justify-center gap-4 p-8 md:w-[260px] shrink-0 bg-gradient-to-br ${course.accent} border-b md:border-b-0 md:border-r border-border`}>
                          <div className={`w-20 h-20 rounded-2xl ${course.iconBg} flex items-center justify-center`}>
                            <CourseIcon className="h-10 w-10 text-primary" />
                          </div>
                          <div className="text-center">
                            <Badge className={`${course.badgeColor} text-[10px] tracking-wider uppercase mb-2`}>
                              {course.badge}
                            </Badge>
                            <h3 className="text-lg font-bold text-foreground">{course.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{course.tagline}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-3xl font-bold text-foreground">₹{course.price.toLocaleString("en-IN")}</span>
                            <div className="flex items-center gap-2 justify-center mt-1">
                              <span className="text-xs text-muted-foreground line-through">₹{course.originalPrice.toLocaleString("en-IN")}</span>
                              <Badge variant="secondary" className="text-[10px]">
                                {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                              </Badge>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground tracking-wide uppercase">{course.language}</span>
                          <Button className="w-full mt-2 group/btn" asChild>
                            <a href={course.url} target="_blank" rel="noopener noreferrer">
                              Enroll Now <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                            </a>
                          </Button>
                        </div>

                        {/* Right: Features */}
                        <div className="p-6 flex-1 flex flex-col">
                          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-4 flex-1">
                            {displayedHighlights.map((h, idx) => {
                              const Icon = h.icon;
                              return (
                                <motion.li
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  whileInView={{ opacity: 1, x: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: idx * 0.04 }}
                                  className="flex items-start gap-2.5 text-sm text-foreground"
                                >
                                  <Icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                  <span>{h.text}</span>
                                </motion.li>
                              );
                            })}
                          </ul>

                          {course.highlights.length > 5 && (
                            <button
                              onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                              className="flex items-center gap-1 text-xs text-primary font-medium mb-4 hover:underline"
                            >
                              {isExpanded ? "Show less" : `+${course.highlights.length - 5} more features`}
                              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                          )}

                          <div className="bg-secondary/60 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">Best for:</span> {course.bestFor}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-12 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">
                Side-by-Side
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Compare <span className="text-primary">All Programs</span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <Card className="overflow-hidden border">
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
                      {/* Price row */}
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
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 max-w-3xl mx-auto">
              {courses.map((c) => (
                <Button
                  key={c.id}
                  variant={c.id === "guarantee" ? "default" : "outline"}
                  className="flex-1"
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
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold text-foreground">Not sure which course is right for you?</h3>
              <p className="text-muted-foreground">
                Our academic counselors can help you pick the perfect program based on your goals, schedule, and budget.
              </p>
              <Button size="lg" asChild>
                <a
                  href="https://api.whatsapp.com/send?phone=%2B919310729425&text=Hi%2C%20I%20need%20help%20choosing%20a%20course"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Talk to a Counselor
                </a>
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
