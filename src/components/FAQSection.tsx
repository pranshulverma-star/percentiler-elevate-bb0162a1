import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { q: "Who is this coaching best suited for?", a: "Our programs are designed for serious CAT aspirants — whether you're a first-time taker or a re-taker looking for a structured, result-oriented approach." },
  { q: "How is Percentilers different from other coaching?", a: "We combine strategic study planning, personalized mock analysis, and expert mentorship. We focus on improving your percentile — not just covering the syllabus." },
  { q: "Do you offer online classes?", a: "Yes. All our programs are available online with live sessions, recorded lectures, and interactive doubt-clearing sessions." },
  { q: "What kind of results have your students achieved?", a: "Over 200 students have scored 95+ percentile. Our alumni have converted calls from IIM A, B, C, FMS, XLRI, and other top B-schools." },
  { q: "Is there a free trial or demo?", a: "Absolutely. Start with our Free Masterclass to experience our teaching methodology and strategy framework before enrolling." },
  { q: "How do I get started?", a: "Watch the Free Masterclass, explore our programs, and book a strategy call with our team. We'll help you pick the right plan." },
];

const FAQSection = () => (
  <section className="py-20 md:py-28 bg-background relative overflow-hidden">
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
