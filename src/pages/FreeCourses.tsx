import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BookOpen, Brain, Calculator, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const courses = [
  {
    icon: Play,
    name: "Course Intro & Demo Videos",
    description: "Get a quick overview of our teaching methodology and preview key lessons before diving in.",
    url: "https://online.percentilers.in/courses/Course-Introduction--Demo-Videos",
    tag: "Start Here",
  },
  {
    icon: BookOpen,
    name: "Foundation Building Course",
    description: "Build strong fundamentals in QA, VARC, and LRDI with structured concept-building sessions.",
    url: "https://online.percentilers.in/courses/Foundation-Building-Course",
    tag: "Most Popular",
  },
  {
    icon: Brain,
    name: "100 LRDI Challenge Series",
    description: "Sharpen your Logical Reasoning & Data Interpretation skills with 100 curated practice sets.",
    url: "https://online.percentilers.in/courses/LRDI-For-CAT",
    tag: "Practice",
  },
  {
    icon: Calculator,
    name: "Basics of Arithmetic",
    description: "Master the foundational arithmetic concepts essential for cracking CAT Quantitative Ability.",
    url: "https://online.percentilers.in/courses/Basics-Arithmetic",
    tag: "Fundamentals",
  },
  {
    icon: FileText,
    name: "Quants PYQ Solutions",
    description: "Watch detailed video solutions of past CAT Quantitative Ability questions to understand patterns.",
    url: "https://online.percentilers.in/courses/Past-CAT-QA-Solutions",
    tag: "PYQs",
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
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Decorative background elements */}
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
                  100% Free — No Sign-up Required
                </span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Free Courses for{" "}
                <span className="text-primary relative">
                  CAT Aspirants
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
                Kickstart your preparation with curated courses crafted by 99%ile mentors. No hidden charges, just pure learning.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="pb-20 md:pb-32">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
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
                    <Card className="p-0 h-full flex flex-col justify-between hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden border-border/60 hover:border-primary/30 cursor-pointer">
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Tag */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                          {course.tag}
                        </span>
                      </div>

                      <div className="p-6 pb-0 relative z-10">
                        <motion.div
                          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-400 group-hover:shadow-lg group-hover:shadow-primary/20"
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.4 }}
                        >
                          <course.icon className="h-6 w-6" />
                        </motion.div>

                        <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {course.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      <div className="p-6 pt-5 relative z-10">
                        <div className="flex items-center text-sm font-semibold text-primary opacity-70 group-hover:opacity-100 transition-all duration-300">
                          Start Learning
                          <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
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
                Want a structured preparation plan?
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
