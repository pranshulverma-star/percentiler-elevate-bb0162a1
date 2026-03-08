import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Quote, Star, MessageCircle } from "lucide-react";

import whatsapp1 from "@/assets/whatsapp-1.webp";
import whatsapp2 from "@/assets/whatsapp-2.webp";
import whatsapp3 from "@/assets/whatsapp-3.webp";
import whatsapp4 from "@/assets/whatsapp-4.webp";
import whatsapp5 from "@/assets/whatsapp-5.webp";
import whatsapp6 from "@/assets/whatsapp-6.webp";

const testimonials = [
  {
    name: "Meera T.",
    highlight: "The structured approach changed everything for me.",
    text: "I was struggling with time management until I joined Percentilers. Their study planner and mock analysis helped me jump from 85 to 98 percentile in 4 months.",
    rating: 5,
  },
  {
    name: "Karthik N.",
    highlight: "Best investment I made for my CAT prep.",
    text: "The faculty didn't just teach — they mentored. Every doubt session felt personal. I got into IIM Bangalore, and I owe a lot to the Percentilers team.",
    rating: 5,
  },
  {
    name: "Divya S.",
    highlight: "Finally, coaching that focuses on strategy, not just content.",
    text: "Most coaching centers overload you with material. Percentilers gave me a clear plan, weekly targets, and honest feedback. That's what made the difference.",
    rating: 5,
  },
];

const whatsappScreenshots = [whatsapp1, whatsapp2, whatsapp3, whatsapp4, whatsapp5, whatsapp6];

const TestimonialsSection = () => (
  <section className="py-10 md:py-16 bg-background relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/[0.02] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <motion.div
        className="text-center mb-14 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Testimonials</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          What Our Students <span className="text-primary">Say</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Real experiences from aspirants who improved their CAT percentile with structured strategy and mentorship.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            whileHover={{ y: -4 }}
          >
            <Card className="p-6 flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/10 group-hover:text-primary/20 transition-colors" />
              <div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-bold text-foreground text-lg mb-3">"{t.highlight}"</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
              </div>
              <p className="mt-4 text-sm font-semibold text-primary">— {t.name}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mb-8 space-y-2"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-full text-sm font-semibold">
          <MessageCircle className="h-4 w-4" />
          Real Student Messages
        </div>
      </motion.div>

      <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-border/30 max-w-5xl mx-auto">
      <div className="columns-2 md:columns-3 gap-4">
        {whatsappScreenshots.map((src, i) => (
          <motion.div
            key={i}
            className="break-inside-avoid mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div className="rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card">
              <img
                src={src}
                alt={`WhatsApp testimonial from a CAT student sharing their experience with Percentilers coaching – screenshot ${i + 1}`}
                width={400}
                height={600}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
