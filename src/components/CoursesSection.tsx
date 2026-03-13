import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, BarChart3, Users, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  {
    name: "CAT + OMET Complete Course",
    icon: Zap,
    tag: "Most Popular",
    highlights: ["Full CAT syllabus coverage with structured video lessons", "Sectional practice and weekly mock analysis", "Covers XAT, SNAP & other OMETs"],
  },
  {
    name: "Test Series",
    icon: BarChart3,
    tag: "Best for Practice",
    highlights: ["Full-length CAT mocks with detailed performance analytics", "Sectional tests for targeted practice", "Percentile predictor support"],
  },
  {
    name: "Mentorship Program",
    icon: Users,
    tag: "1-on-1",
    highlights: ["Personalized CAT strategy and accountability sessions", "One-on-one guidance for serious aspirants", "Weekly progress reviews"],
  },
];

const CoursesSection = () => (
  <section id="courses" className="py-10 md:py-16 bg-background relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.02] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <motion.div
        className="text-center mb-14 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Programs</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Our CAT Preparation <span className="text-primary">Programs</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
        {courses.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-6 flex flex-col justify-between h-full hover:shadow-xl transition-all duration-300 group relative overflow-hidden bg-card/80 backdrop-blur-sm">
                {i === 0 && (
                  <div className="absolute top-3 -right-8 bg-gradient-to-r from-primary to-amber-500 text-primary-foreground text-[9px] font-bold tracking-wider uppercase px-10 py-1 rotate-45 shadow-md z-10">
                    Most Popular
                  </div>
                )}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{c.name}</h3>
                  <ul className="space-y-2.5 mb-6">
                    {c.highlights.map((h) => (
                      <li key={h} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300" asChild>
                  <Link to={i === 0 ? "/courses/cat-omet" : i === 1 ? "/test-series" : "/mentorship"}>
                    Explore Program <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default CoursesSection;
