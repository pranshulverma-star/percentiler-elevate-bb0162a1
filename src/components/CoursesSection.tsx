import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Zap, Clock, BarChart3 } from "lucide-react";

const courses = [
  {
    name: "CAT + OMET Complete Course",
    icon: Zap,
    highlights: ["Full syllabus coverage for CAT, XAT, SNAP & more", "200+ hours of structured video lessons", "Weekly mock tests with detailed analysis"],
  },
  {
    name: "Test Series",
    icon: BarChart3,
    highlights: ["30 full-length mocks (latest pattern)", "Sectional tests for targeted practice", "Percentile predictor + analytics dashboard"],
  },
  {
    name: "Mentorship Program",
    icon: Clock,
    highlights: ["1-on-1 mentor sessions with 99%ilers", "Personalized study plan & strategy", "Weekly progress reviews & accountability"],
  },
];

const CoursesSection = () => (
  <section id="courses" className="py-20 bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Our Programs
      </motion.h2>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <Card className="p-6 flex flex-col justify-between h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{c.name}</h3>
                  <ul className="space-y-2 mb-6">
                    {c.highlights.map((h) => (
                      <li key={h} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold">•</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300" asChild>
                  <a href="#">Explore Program</a>
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
