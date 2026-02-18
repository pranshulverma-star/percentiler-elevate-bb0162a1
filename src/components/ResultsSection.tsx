import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Quote } from "lucide-react";

import studentBhavy from "@/assets/student-bhavy.png";
import studentAditya from "@/assets/student-aditya.png";
import studentRahul from "@/assets/student-rahul.jpeg";
import studentRounak from "@/assets/student-rounak.png";
import studentShruti from "@/assets/student-shruti.jpeg";
import studentRitik from "@/assets/student-ritik.jpeg";
import studentAdit from "@/assets/student-adit.jpeg";
import studentBhagyashree from "@/assets/student-bhagyashree-2.jpeg";

const results = [
  { name: "Bhavy Jain", percentile: "99.5", college: "FMS Delhi", initials: "BJ", photo: studentBhavy, quote: "The structured strategy made all the difference in my preparation." },
  { name: "Rounak", percentile: "99.2", college: "IIM Bangalore", initials: "RK", photo: studentRounak, quote: "Mock analysis sessions helped me identify and fix weak areas fast." },
  { name: "Golla Rahul", percentile: "98.9", college: "IIT Bombay", initials: "GR", photo: studentRahul, quote: "Went from 90 to 98+ percentile in just 3 months of focused prep." },
  { name: "Aditya Kumar", percentile: "98.6", college: "XLRI Jamshedpur", initials: "AK", photo: studentAditya, quote: "The daily planner kept me disciplined throughout my journey." },
  { name: "Shruti Manghani", percentile: "98.3", college: "SP Jain", initials: "SM", photo: studentShruti, quote: "Personalized mentorship gave me clarity when I needed it most." },
  { name: "Ritik Kumar", percentile: "98.1", college: "IIM Udaipur", initials: "RK", photo: studentRitik, quote: "Strategy over hours — that mindset shift changed everything for me." },
  { name: "Adit Koul", percentile: "98.0", college: "SP Jain", initials: "AK", photo: studentAdit, quote: "The right guidance at the right time made my CAT journey smooth." },
  { name: "Bhagyashree Pathak", percentile: "98.2", college: "IIM Vizag", initials: "BP", photo: studentBhagyashree, quote: "Consistent practice with expert feedback was the key to my success." },
];

const ResultsSection = () => (
  <section id="results" className="py-14 md:py-28 bg-secondary/30 relative overflow-hidden">
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
        <p className="text-muted-foreground max-w-lg mx-auto">Consistent percentile growth through structured CAT preparation, smart mock analysis, and disciplined execution.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all bg-muted overflow-hidden">
                  <AvatarImage src={r.photo} alt={r.name} className="object-cover object-top scale-[1.3] translate-y-[5%]" />
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
