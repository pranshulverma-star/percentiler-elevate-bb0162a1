import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BookOpen, Brain, Calculator, FileText, Sparkles, Clock, Monitor, Users } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const courses = [
  {
    icon: Play,
    name: "Course Introduction & Demo Videos",
    subtitle: "Preview all CAT sections with live-style demo classes",
    url: "https://online.percentilers.in/courses/Course-Introduction--Demo-Videos",
    tag: "Start Here",
    lessons: 13,
    duration: "19+ hrs",
  },
  {
    icon: BookOpen,
    name: "Foundation Building Course",
    subtitle: "Build a rock-solid base in QA, VARC & LRDI",
    url: "https://online.percentilers.in/courses/Foundation-Building-Course",
    tag: "Most Popular",
    lessons: 68,
    duration: "8+ hrs",
  },
  {
    icon: Brain,
    name: "100 LRDI Challenge Series",
    subtitle: "CAT/XAT-level sets with detailed video solutions",
    url: "https://online.percentilers.in/courses/LRDI-For-CAT",
    tag: "5★ Rated",
    lessons: 100,
    duration: "50+ sets",
  },
  {
    icon: Calculator,
    name: "Basics of Arithmetic for CAT",
    subtitle: "Vedic maths shortcuts & logic-driven QA mastery",
    url: "https://online.percentilers.in/courses/Basics-Arithmetic",
    tag: "Fundamentals",
    lessons: 40,
    duration: "15+ hrs",
  },
  {
    icon: FileText,
    name: "Past CAT QA Solutions",
    subtitle: "Expert walkthroughs of previous years' QA questions",
    url: "https://online.percentilers.in/courses/Past-CAT-QA-Solutions",
    tag: "PYQs",
    lessons: 35,
    duration: "5+ hrs",
  },
];

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
    return () => { document.title = "Percentilers"; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Compact Hero */}
        <section className="pt-4 pb-6 md:pt-8 md:pb-10">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center max-w-2xl mx-auto space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[11px] font-semibold tracking-wide uppercase text-primary">
                  100% Free — No Credit Card
                </span>
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                Free CAT 2026{" "}
                <span className="text-primary">Courses</span>
              </h1>

              <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
                200+ video lectures by 99%ile mentors. Start preparing today.
              </p>

              {/* Inline stats */}
              <div className="flex justify-center gap-4 md:gap-6 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5 text-primary/60" /> 200+ Lectures</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary/60" /> 45+ Hours</span>
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary/60" /> 10K+ Students</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Course Cards — always visible CTA, no accordion */}
        <section className="pb-10 md:pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col gap-3 max-w-3xl mx-auto">
              {courses.map((course, i) => (
                <motion.a
                  key={course.name}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="block group"
                >
                  <Card className="p-0 overflow-hidden border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <div className="flex items-center gap-3 p-3 md:p-4">
                      {/* Icon */}
                      <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <course.icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-sm md:text-base text-foreground truncate">{course.name}</h3>
                          <span className="hidden md:inline-block shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {course.tag}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{course.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground/70">
                          <span>{course.lessons} lessons</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                          <span>{course.duration}</span>
                        </div>
                      </div>

                      {/* CTA — always visible */}
                      <div className="shrink-0">
                        <Button size="sm" variant="ghost" className="text-primary font-semibold text-xs md:text-sm group-hover:bg-primary/10 transition-colors px-2 md:px-3">
                          Enroll <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.a>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              className="text-center mt-10"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <p className="text-sm text-muted-foreground mb-3">
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
