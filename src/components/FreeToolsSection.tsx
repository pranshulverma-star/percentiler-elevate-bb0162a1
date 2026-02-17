import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, GraduationCap, ClipboardCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLeadModal } from "@/components/LeadModalProvider";

const tools = [
  { icon: CalendarDays, name: "CAT Daily Study Planner", benefit: "Build consistency week-by-week with a day-wise structured CAT preparation roadmap.", href: "/cat-daily-study-planner", isLink: true },
  { icon: GraduationCap, name: "CAT Percentile Predictor", benefit: "Know where you stand instantly and plan your target percentile.", href: "https://percentilers.in/cat-percentile-predictor/", isLink: true },
  { icon: ClipboardCheck, name: "Mock Analysis Framework", benefit: "Convert mock tests into percentile jumps with structured performance analysis.", href: "/free-cat-readiness-assessment", isLink: true },
];

const FreeToolsSection = () => {
  const { openModal } = useLeadModal();

  return (
    <section id="tools" className="py-14 md:py-24 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-14 space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Free CAT Tools</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Free Tools to Strengthen Your <span className="text-primary">CAT Preparation</span>
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">These tools are designed to support — not replace — your structured learning.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
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
                {t.isLink && (
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors duration-300" asChild>
                    <a href={t.href} target={t.href.startsWith("http") ? "_blank" : undefined} rel={t.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                      Try Free Tool <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FreeToolsSection;
