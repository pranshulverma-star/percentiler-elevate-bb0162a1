import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Quote } from "lucide-react";

const results = [
  { name: "Ananya S.", percentile: "99.4", college: "IIM Ahmedabad", initials: "AS", photo: "https://i.pravatar.cc/150?img=47", quote: "The structured approach changed everything for me." },
  { name: "Rohan M.", percentile: "98.7", college: "IIM Bangalore", initials: "RM", photo: "https://i.pravatar.cc/150?img=68", quote: "Mock analysis sessions were a game-changer." },
  { name: "Priya K.", percentile: "97.9", college: "IIM Calcutta", initials: "PK", photo: "https://i.pravatar.cc/150?img=45", quote: "I went from 85 to 97+ percentile in 4 months." },
  { name: "Vikram D.", percentile: "96.5", college: "FMS Delhi", initials: "VD", photo: "https://i.pravatar.cc/150?img=60", quote: "Best mentorship I could have asked for." },
  { name: "Sneha R.", percentile: "95.8", college: "IIM Lucknow", initials: "SR", photo: "https://i.pravatar.cc/150?img=44", quote: "The daily planner kept me accountable every single day." },
  { name: "Arjun P.", percentile: "95.2", college: "XLRI Jamshedpur", initials: "AP", photo: "https://i.pravatar.cc/150?img=53", quote: "Strategy over hours — that's what I learned here." },
];

const ResultsSection = () => (
  <section id="results" className="py-20 md:py-28 bg-secondary/30 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <motion.div
        className="text-center mb-16 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Student Results</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Our Students Don't Guess. They <span className="text-primary">Improve.</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Real results from real aspirants who followed the system.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -6, scale: 1.02 }}
          >
            <Card className="p-6 hover:shadow-xl transition-all duration-300 cursor-default group relative overflow-hidden h-full bg-card">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />

              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                  <AvatarImage src={r.photo} alt={r.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{r.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{r.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <GraduationCap className="h-3 w-3" />
                    {r.college}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-4xl font-bold text-primary group-hover:scale-105 transition-transform origin-left inline-block">
                  {r.percentile}
                </span>
                <span className="text-sm font-medium text-muted-foreground">%ile</span>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${parseFloat(r.percentile)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>

              <div className="flex gap-2 items-start">
                <Quote className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground italic leading-relaxed">{r.quote}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ResultsSection;
