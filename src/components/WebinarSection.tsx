import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

const bullets = [
  "Study structure framework used by 99%ilers",
  "Mock analysis system to identify weak areas fast",
  "Strategy blueprint for 95+ percentile",
  "Common mistakes that cost 10+ marks",
];

const WebinarSection = () => (
  <section id="masterclass" className="py-20 bg-secondary">
    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
          <Play className="h-7 w-7 ml-0.5" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
          Confused About CAT? Watch This Free Masterclass.
        </h2>
      </motion.div>
      <ul className="space-y-4 text-left inline-block mb-10">
        {bullets.map((b, i) => (
          <motion.li
            key={b}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-foreground">{b}</span>
          </motion.li>
        ))}
      </ul>
      <div>
        <Button size="lg" className="animate-pulse-glow" asChild>
          <a href="/masterclass">
            Watch Free Masterclass <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  </section>
);

export default WebinarSection;
