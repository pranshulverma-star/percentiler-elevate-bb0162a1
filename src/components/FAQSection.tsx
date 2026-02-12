import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Who is this coaching best suited for?", a: "Our programs are designed for serious CAT aspirants — whether you're a first-time taker or a re-taker looking for a structured, result-oriented approach." },
  { q: "How is Percentilers different from other coaching?", a: "We combine strategic study planning, personalized mock analysis, and expert mentorship. We focus on improving your percentile — not just covering the syllabus." },
  { q: "Do you offer online classes?", a: "Yes. All our programs are available online with live sessions, recorded lectures, and interactive doubt-clearing sessions." },
  { q: "What kind of results have your students achieved?", a: "Over 200 students have scored 95+ percentile. Our alumni have converted calls from IIM A, B, C, FMS, XLRI, and other top B-schools." },
  { q: "Is there a free trial or demo?", a: "Absolutely. Start with our Free Masterclass to experience our teaching methodology and strategy framework before enrolling." },
  { q: "How do I get started?", a: "Watch the Free Masterclass, explore our programs, and book a strategy call with our team. We'll help you pick the right plan." },
];

const FAQSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 md:px-6 max-w-3xl">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
