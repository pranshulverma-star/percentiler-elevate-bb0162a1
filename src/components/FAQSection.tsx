import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { q: "How to prepare for CAT 2026?", a: "Start with a structured day-wise study plan covering VARC, LRDI, and QA. Combine conceptual learning with mock analysis. Percentilers provides a complete preparation framework — watch our Free Masterclass to understand the exact approach." },
  { q: "What percentile is required for IIM?", a: "For IIM A, B, C you typically need 99+ percentile. For IIM Lucknow, Kozhikode, and Indore, 97-99 percentile is competitive. For newer IIMs, 90-95 percentile can secure calls. Your profile (academics, work experience) also plays a significant role." },
  { q: "Is CAT tough for working professionals?", a: "CAT is challenging but absolutely crackable for working professionals with the right structure. We specialize in 2-3 hour daily plans, weekend mock optimization, and smart repetition cycles designed for time-constrained aspirants." },
  { q: "How many mock tests should I attempt for CAT?", a: "Aim for 25-30 full-length mocks and 50+ sectional tests. But quantity alone doesn't help — structured mock analysis is what converts practice into percentile improvement. Our mock analysis framework helps you extract maximum learning from every test." },
  { q: "What is the CAT syllabus and exam pattern?", a: "CAT tests three sections: VARC (Verbal Ability & Reading Comprehension), LRDI (Logical Reasoning & Data Interpretation), and QA (Quantitative Ability). The exam is 2 hours with ~66 questions. Our structured syllabus roadmap ensures complete coverage with strategic prioritization." },
];

const FAQSection = () => (
  <section className="py-14 md:py-28 bg-background relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] rounded-full bg-primary/[0.02] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
      <motion.div
        className="text-center mb-14 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">FAQ</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          FAQs — CAT Preparation & <span className="text-primary">MBA Entrance Exam</span>
        </h2>
      </motion.div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <AccordionItem value={`faq-${i}`} className="border-b border-border/50">
              <AccordionTrigger className="text-left text-foreground hover:text-primary transition-colors py-5">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{f.a}</AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
