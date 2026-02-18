import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BookOpen, Brain, Calculator, FileText, Sparkles, Clock, Monitor, Users, Phone, Star } from "lucide-react";
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
        {/* Hero Section */}
        <section className="pt-6 pb-10 lg:pt-[80px] lg:pb-[70px] relative overflow-hidden">
          {/* Subtle grain texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

          <div className="max-w-[1100px] mx-auto px-4 lg:px-6 relative">
            <div className="lg:grid lg:gap-12 lg:items-center" style={{ gridTemplateColumns: '1fr 420px' }}>
              {/* Left Column */}
              <motion.div
                className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0 space-y-4 lg:space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Floating badge */}
                <motion.div
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background text-[11px] font-bold tracking-wide uppercase"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  🔥 10,000+ Students Trained
                </motion.div>

                <motion.div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 ml-0 lg:ml-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[11px] font-semibold tracking-wide uppercase text-primary">
                    100% Free — No Credit Card
                  </span>
                </motion.div>

                <h1 className="text-3xl md:text-5xl lg:text-[60px] lg:leading-[1.08] lg:max-w-[600px] font-extrabold text-foreground leading-tight tracking-tight">
                  Free CAT 2026{" "}
                  <span className="bg-gradient-to-r from-[#ff6a00] to-[#ff8c42] bg-clip-text text-transparent">Courses</span>
                </h1>

                <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
                  200+ structured lessons. Built by 99%ilers.
                </p>

                {/* Stats row */}
                <div className="flex justify-center lg:justify-start gap-4 lg:gap-5 pt-1 text-xs lg:text-sm text-muted-foreground lg:max-w-[500px]">
                  <span className="flex items-center gap-1.5"><Monitor className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary/60" /> 200+ Lectures</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary/60" /> 45+ Hours</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary/60" /> 10K+ Students</span>
                </div>

                {/* Social proof line */}
                <p className="flex items-center justify-center lg:justify-start gap-1 text-[11px] lg:text-xs text-muted-foreground/60 pt-1">
                  <Star className="h-3 w-3 fill-primary/40 text-primary/40" />
                  Rated 4.8/5 by 2,000+ CAT Aspirants
                </p>
              </motion.div>

              {/* Right Column — CTA Card (Desktop only) */}
              <motion.div
                className="hidden lg:block"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="rounded-[20px] bg-card/90 backdrop-blur-sm border border-border/40 p-8 lg:p-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] max-w-[420px]">
                  <h3 className="text-xl font-bold text-foreground mb-2">Not sure where to start?</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get a personalised strategy from our 99%ile mentors. Absolutely free.
                  </p>
                  <Button
                    size="lg"
                    className="w-full text-base h-12 rounded-xl font-semibold hover:shadow-[0_10px_25px_rgba(255,106,0,0.3)] transition-all duration-300"
                    asChild
                  >
                    <a href="/cat-daily-study-planner">
                      <Phone className="mr-2 h-4 w-4" />
                      Book Free Strategy Call
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">No spam. No fees. Just guidance.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Course Cards */}
        <section
          className="pb-10 pt-6 lg:pb-20 lg:pt-[70px] relative"
          style={{ background: 'linear-gradient(to bottom, hsl(var(--background)), #f7f7f9)' }}
        >
          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

          <div className="max-w-[1100px] mx-auto px-4 lg:px-6 relative">
            <div className="flex flex-col gap-3 max-w-3xl mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-[24px]">
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
                  <Card className="p-0 overflow-hidden border-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out rounded-[16px] lg:rounded-[20px] bg-card/90 backdrop-blur-sm hover:scale-[1.02] h-full">
                    <div className="flex items-center gap-3 p-3 md:p-4 lg:p-7">
                      {/* Icon */}
                      <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:rotate-3">
                        <course.icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-sm md:text-base lg:text-lg text-foreground truncate tracking-tight">{course.name}</h3>
                          <span className="hidden md:inline-block shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                            {course.tag}
                          </span>
                        </div>
                        <p className="text-xs lg:text-sm text-muted-foreground truncate">{course.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] lg:text-xs text-muted-foreground/70">
                          <span>{course.lessons} lessons</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                          <span>{course.duration}</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary font-semibold text-xs md:text-sm rounded-xl px-2 md:px-3 lg:px-4 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_10px_25px_rgba(255,106,0,0.3)]"
                        >
                          Enroll <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.a>
              ))}
            </div>

            {/* Bottom CTA */}
            <motion.div
              className="text-center mt-10 lg:mt-16"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <p className="text-sm lg:text-base text-muted-foreground mb-3">
                Want a personalised CAT preparation roadmap?
              </p>
              <Button
                size="lg"
                className="lg:h-12 lg:px-10 lg:text-base rounded-xl font-semibold hover:shadow-[0_10px_25px_rgba(255,106,0,0.3)] transition-all duration-300"
                asChild
              >
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
