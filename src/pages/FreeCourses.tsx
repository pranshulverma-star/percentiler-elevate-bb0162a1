import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BookOpen, Brain, Calculator, FileText, Sparkles, Clock, Monitor, Users, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const courses = [
  {
    icon: Play,
    name: "Course Introduction & Demo Videos",
    description: "Preview 13 demo sessions (19+ hours) covering all CAT sections. Watch faculty teach live-style classes across varied difficulty levels before enrolling in the full course.",
    url: "https://online.percentilers.in/courses/Course-Introduction--Demo-Videos",
    tag: "Start Here",
    stats: { modules: 2, sessions: 13, duration: "19+ hours" },
    instructor: "Pranshul Verma",
    language: "English",
    highlights: [
      "Guided Recorded Course overview",
      "95%ile Guarantee Course preview",
      "Demo videos across QA, VARC & LRDI",
    ],
  },
  {
    icon: BookOpen,
    name: "Foundation Building Course",
    description: "Build a rock-solid base in Quantitative Ability, Verbal Ability & Reading Comprehension, and Logical Reasoning & Data Interpretation with 68 structured sessions.",
    url: "https://online.percentilers.in/courses/Foundation-Building-Course",
    tag: "Most Popular",
    stats: { modules: 5, sessions: 68, duration: "8+ hours" },
    instructor: "Pranshul Verma",
    language: "English & Hindi",
    highlights: [
      "Solidify foundational concepts",
      "Hands-on practice with real exam questions",
      "Essential skill development for CAT & OMETs",
    ],
  },
  {
    icon: Brain,
    name: "100 LRDI Challenge Series",
    description: "Practice 100 CAT/XAT-level LRDI sets with detailed video solutions. Curated miscellaneous sets covering the most important patterns — your one-stop LRDI practice resource.",
    url: "https://online.percentilers.in/courses/LRDI-For-CAT",
    tag: "5★ Rated",
    stats: { modules: 50, sessions: 100, duration: "50+ sets" },
    instructor: "Mayank Raj Singh",
    language: "English",
    highlights: [
      "100 CAT/XAT-level LRDI sets",
      "Video solutions for every set",
      "Past year CAT replicas included",
    ],
  },
  {
    icon: Calculator,
    name: "Basics of Arithmetic for CAT",
    description: "Master Quantitative Aptitude with logic-driven teaching, Vedic maths shortcuts, and 3 difficulty levels. Covers Percentages, Profit & Loss, SI/CI, Time & Work, Ratios, and more.",
    url: "https://online.percentilers.in/courses/Basics-Arithmetic",
    tag: "Fundamentals",
    stats: { modules: 10, sessions: 40, duration: "15+ hours" },
    instructor: "Percentilers Faculty",
    language: "English & Hindi",
    highlights: [
      "Vedic maths & mental maths training",
      "Logic-driven approach over formulas",
      "3 levels: Beginner, Moderate & Advanced",
    ],
  },
  {
    icon: FileText,
    name: "Past CAT QA Solutions",
    description: "Detailed video walkthroughs of previous years' CAT Quantitative Ability questions. Learn problem-solving strategies, time management techniques, and expert approaches to crack QA.",
    url: "https://online.percentilers.in/courses/Past-CAT-QA-Solutions",
    tag: "PYQs",
    stats: { modules: 4, sessions: 35, duration: "5+ hours" },
    instructor: "Pranshul Verma",
    language: "English",
    highlights: [
      "Arithmetic, Algebra, Geometry & Modern Maths",
      "Expert problem-solving strategies",
      "Time management tips for CAT QA",
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const FreeCourses = () => {
  useEffect(() => {
    document.title = "Free CAT 2026 Courses | QA, VARC, LRDI | Percentilers";
    const metaDesc = document.querySelector('meta[name="description"]');
    const content = "Access 200+ free video lectures for CAT 2026 preparation. Covers Quantitative Ability, VARC, LRDI with 100 practice sets, arithmetic basics & PYQ solutions by 99%ile mentors.";
    if (metaDesc) {
      metaDesc.setAttribute("content", content);
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = content;
      document.head.appendChild(meta);
    }
    return () => {
      document.title = "Percentilers";
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-4 md:py-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold tracking-wide uppercase text-primary">
                  100% Free — No Credit Card Required
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Free CAT 2026{" "}
                <span className="text-primary relative">
                  Preparation Courses
                  <motion.span
                    className="absolute -bottom-1 left-0 h-1 bg-primary/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                  />
                </span>
              </h1>

              <motion.p
                className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Access 200+ video lectures, 100 LRDI sets, and complete QA foundations — crafted by 99%ile mentors. Start your CAT &amp; OMET journey today.
              </motion.p>

              {/* Quick stats */}
              <motion.div
                className="flex flex-wrap justify-center gap-6 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {[
                  { icon: Monitor, label: "200+ Video Lectures" },
                  { icon: Clock, label: "45+ Hours of Content" },
                  { icon: Users, label: "10,000+ Students" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <stat.icon className="h-4 w-4 text-primary/70" />
                    <span>{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="pb-20 md:pb-32">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {courses.map((course) => (
                <motion.div key={course.name} variants={cardVariants}>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    <Card className="p-0 h-full flex flex-col hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden border-border/60 hover:border-primary/30 cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Tag */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          {course.tag}
                        </span>
                      </div>

                      <div className="p-6 pb-3 relative z-10">
                        <motion.div
                          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-400 group-hover:shadow-lg group-hover:shadow-primary/20"
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.4 }}
                        >
                          <course.icon className="h-6 w-6" />
                        </motion.div>

                        <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300 pr-16">
                          {course.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          {course.description}
                        </p>

                        {/* Highlights */}
                        <ul className="space-y-1.5 mb-4">
                          {course.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 mt-0.5 shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Footer with stats */}
                      <div className="mt-auto border-t border-border/50 px-6 py-4 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>{course.stats.sessions} lessons</span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>{course.stats.duration}</span>
                          </div>
                          <div className="flex items-center text-sm font-semibold text-primary opacity-70 group-hover:opacity-100 transition-all duration-300">
                            Enroll Free
                            <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </a>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              className="text-center mt-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p className="text-muted-foreground mb-4">
                Want a personalised CAT preparation roadmap?
              </p>
              <Button size="lg" asChild>
                <a href="/cat-daily-study-planner">
                  Try Free Study Planner <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FreeCourses;
