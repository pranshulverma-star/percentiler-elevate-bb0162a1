import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, GraduationCap, ClipboardCheck, ArrowRight, LayoutDashboard, Layers, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";


const tools = [
  { icon: CalendarDays, name: "Daily Study Planner", benefit: "Build a day-wise CAT preparation roadmap aligned with the latest syllabus and your target percentile.", href: "/cat-daily-study-planner", isLink: true },
  { icon: GraduationCap, name: "Free Courses", benefit: "Access free CAT preparation courses covering QA, VARC, LRDI, and more : completely free.", href: "/free-courses", isLink: true },
  { icon: ClipboardCheck, name: "CAT Readiness Assessment", benefit: "Evaluate your current performance level and identify gaps before your next mock test.", href: "/free-cat-readiness-assessment", isLink: true },
  { icon: Layers, name: "CAT Flashcards", benefit: "Master 557 concepts with mnemonic tricks — Vocab, Quant Formulas, Idioms & LRDI Tips. 5 cards a day.", href: "/flashcards", isLink: true },
  { icon: ClipboardCheck, name: "Practice Lab", benefit: "Solve topic-wise CAT questions with instant scoring and detailed performance analytics.", href: "/practice-lab", isLink: true },
  { icon: LayoutDashboard, name: "My Dashboard", benefit: "Track your streaks, quiz scores, and personalized study plan — all in one place.", href: "/dashboard", isLink: true, isDashboard: true },
];

const FreeToolsSection = () => {

  return (
    <section id="tools" className="py-10 md:py-16 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-14 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Free Resources</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Extra Support for <span className="text-primary">Serious CAT Aspirants</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
          {tools.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              whileHover={{ y: -6 }}
            >
              <Card className="p-6 text-center h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <t.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.benefit}</p>
                </div>
                <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300" asChild>
                    <a href={t.href}>
                      {t.name === "Free Courses" ? "Explore Free Courses" : t.name === "My Dashboard" ? "Go to Dashboard" : t.name === "CAT Flashcards" ? "Start Practicing" : "Use Free Tool"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreeToolsSection;
