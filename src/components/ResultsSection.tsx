import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const results = [
  { name: "Ananya S.", percentile: "99.4", college: "IIM Ahmedabad" },
  { name: "Rohan M.", percentile: "98.7", college: "IIM Bangalore" },
  { name: "Priya K.", percentile: "97.9", college: "IIM Calcutta" },
  { name: "Vikram D.", percentile: "96.5", college: "FMS Delhi" },
  { name: "Sneha R.", percentile: "95.8", college: "IIM Lucknow" },
  { name: "Arjun P.", percentile: "95.2", college: "XLRI Jamshedpur" },
];

const ResultsSection = () => (
  <section id="results" className="py-20 bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Our Students Don't Guess. They Improve.
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="p-6 text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-default group">
              <p className="text-4xl font-bold text-primary group-hover:scale-110 transition-transform">{r.percentile}</p>
              <p className="text-xs text-muted-foreground mb-3">Percentile</p>
              <p className="font-semibold text-foreground">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.college}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ResultsSection;
