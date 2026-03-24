import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

function parseFaqHtml(html: string): FAQItem[] {
  const items: FAQItem[] = [];
  // Match h3/h4/strong as question, followed by content until next heading or end
  const pattern = /<(?:h[34]|strong)[^>]*>(.*?)<\/(?:h[34]|strong)>\s*([\s\S]*?)(?=<(?:h[34]|strong)[^>]*>|$)/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    const question = match[1].replace(/<[^>]*>/g, "").trim();
    const answer = match[2].trim();
    if (question && answer) {
      items.push({ question, answer });
    }
  }
  return items;
}

interface BlogFAQAccordionProps {
  faqHtml: string;
}

const BlogFAQAccordion = ({ faqHtml }: BlogFAQAccordionProps) => {
  const items = useMemo(() => parseFaqHtml(faqHtml), [faqHtml]);

  if (items.length === 0) return null;

  return (
    <section className="mt-10 mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="space-y-3">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="border border-[hsl(25_100%_90%)] rounded-lg overflow-hidden data-[state=open]:bg-[hsl(25_100%_98%)]"
          >
            <AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold text-foreground hover:no-underline [&>svg]:text-primary">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div
                className="text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.answer }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default BlogFAQAccordion;
