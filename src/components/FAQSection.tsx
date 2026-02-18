import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { q: "How should I start CAT 2026 preparation?", a: "Start with a clear understanding of the CAT syllabus, create a structured study plan, focus on conceptual clarity in Quant, VARC, and LRDI, and begin sectional practice before full-length mock tests." },
  { q: "What percentile is required for top IIMs?", a: "Top IIMs typically require 99+ percentile overall, along with strong sectional scores. Cut-offs vary by category, profile, and work experience." },
  { q: "Is CAT coaching necessary to crack the exam?", a: "While self-study is possible, structured CAT coaching helps with syllabus sequencing, mock analysis, strategy refinement, and accountability — which significantly improves percentile outcomes." },
  { q: "How many mock tests should I attempt for CAT?", a: "Serious aspirants usually attempt 30–40 full-length CAT mocks along with sectional tests. The key is detailed mock analysis, not just attempting tests." },
  { q: "Can working professionals prepare for CAT successfully?", a: "Yes. With a structured 2–3 hour daily schedule and weekend mock strategy, working professionals consistently achieve 95+ percentile." },
  { q: "What is included in the CAT syllabus?", a: "The CAT syllabus covers Quantitative Aptitude, Logical Reasoning & Data Interpretation, and Verbal Ability & Reading Comprehension, including arithmetic, algebra, geometry, puzzles, seating arrangements, and RC passages." },
  { q: "Does Percentilers provide online CAT coaching?", a: "Yes. All programs are delivered online with structured video lessons, live mentorship, mock tests, and performance tracking tools." },
];

const FAQSection = () => (
  <section className="py-10 md:py-16 bg-background relative overflow-hidden">
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
          Frequently Asked <span className="text-primary">Questions</span>
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
