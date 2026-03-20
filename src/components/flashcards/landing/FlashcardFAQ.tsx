import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useInView } from "@/hooks/useInView";

const faqs = [
  { q: "What are CAT flashcards and how do they help?", a: "Flashcards are a proven spaced-repetition learning tool. Our CAT flashcards cover Vocabulary, Idioms, Quantitative Formulas, and LRDI strategies — each with mnemonic memory tricks designed by 7-time CAT 100%iler faculty." },
  { q: "How many flashcards are available?", a: "Currently 557 flashcards: 150 Vocabulary words, 50 Idioms & Phrases, 302 Quantitative Aptitude formulas (with LaTeX math rendering), and 55 LRDI Tips & Strategies." },
  { q: "How does the daily practice limit work?", a: "You get 5 new flashcards per category per day. This micro-learning approach is based on spaced repetition science — small daily doses lead to better long-term retention than cramming." },
  { q: "What is the revision bank?", a: "Any card you mark as \"Didn't Know\" is automatically saved to your revision bank. You can revisit these cards anytime with no daily limit, focusing your energy on concepts you haven't mastered yet." },
  { q: "How does the streak system work?", a: "Practicing flashcards counts toward your daily streak, just like quizzes and mock tests on Percentilers. Maintain your streak to build consistency — the #1 predictor of CAT success." },
  { q: "Are the Quant formulas properly formatted?", a: "Yes! All 302 Quant formula cards use KaTeX for beautiful mathematical rendering — fractions, square roots, summations, and Greek symbols display exactly like a textbook." },
  { q: "Is this free?", a: "Yes, flashcard practice is completely free for all registered Percentilers users." },
  { q: "Can I use flashcards on mobile?", a: "Absolutely. The flashcard interface is fully responsive with swipe gestures — swipe right for \"I knew it\", swipe left for \"Didn't know\"." },
];

export default function FlashcardFAQ() {
  const { ref, inView } = useInView<HTMLElement>();

  return (
    <section ref={ref} aria-label="Frequently asked questions" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <h2
          className="text-2xl md:text-3xl font-bold text-[hsl(0,0%,8%)] text-center mb-14 transition-all duration-700"
          style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)" }}
        >
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-b border-[hsl(0,0%,92%)] data-[state=open]:border-l-[3px] data-[state=open]:border-l-[hsl(24,100%,50%)] data-[state=open]:pl-4 transition-all"
            >
              <AccordionTrigger className="text-left text-[hsl(0,0%,8%)] hover:text-[hsl(24,100%,50%)] transition-colors py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[hsl(0,0%,40%)] leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
