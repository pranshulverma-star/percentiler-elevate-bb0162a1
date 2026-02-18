import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BookOpen, Brain, Calculator, FileText } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const courses = [
  {
    icon: Play,
    name: "Course Intro & Demo Videos",
    description: "Get a quick overview of our teaching methodology and preview key lessons before diving in.",
    url: "https://online.percentilers.in/courses/Course-Introduction--Demo-Videos",
  },
  {
    icon: BookOpen,
    name: "Foundation Building Course",
    description: "Build strong fundamentals in QA, VARC, and LRDI with structured concept-building sessions.",
    url: "https://online.percentilers.in/courses/Foundation-Building-Course",
  },
  {
    icon: Brain,
    name: "100 LRDI Challenge Series",
    description: "Sharpen your Logical Reasoning & Data Interpretation skills with 100 curated practice sets.",
    url: "https://online.percentilers.in/courses/LRDI-For-CAT",
  },
  {
    icon: Calculator,
    name: "Basics of Arithmetic",
    description: "Master the foundational arithmetic concepts essential for cracking CAT Quantitative Ability.",
    url: "https://online.percentilers.in/courses/Basics-Arithmetic",
  },
  {
    icon: FileText,
    name: "Quants PYQ Solutions",
    description: "Watch detailed video solutions of past CAT Quantitative Ability questions to understand patterns.",
    url: "https://online.percentilers.in/courses/Past-CAT-QA-Solutions",
  },
];

const FreeCourses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-14 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              className="text-center mb-14 space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">
                100% Free
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground">
                Free Courses for <span className="text-primary">CAT Aspirants</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Start your preparation journey with these completely free courses. No hidden charges, no credit card required.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {courses.map((course, i) => (
                <motion.div
                  key={course.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <Card className="p-6 h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div>
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <course.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-foreground mb-2">{course.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{course.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300"
                      asChild
                    >
                      <a href={course.url} target="_blank" rel="noopener noreferrer">
                        Start Learning <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FreeCourses;
