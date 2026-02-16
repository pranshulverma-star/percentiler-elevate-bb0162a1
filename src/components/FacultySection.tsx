import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const faculty = [
  {
    name: "Mahajan Sir",
    role: "Verbal Ability (VARC) Faculty",
    credential: "SRCC & IIM Calcutta Alumnus\n6+ Years of CAT Mentoring Experience",
    description: "A regular CAT taker with an exceptional track record — 100%ile in VARC 4 times. Specialises in building reading depth, accuracy, and exam temperament for high percentile outcomes.",
    initials: "MS",
  },
  {
    name: "Gaurav Sharma Sir",
    role: "QA & LRDI Faculty",
    credential: "18 Years of Teaching Experience\nConsistent 99+%ile Scorer in CAT (Every Year)",
    description: "A seasoned Quant & LRDI mentor with unmatched exam consistency. Also runs the popular YouTube channel Genius Tutorials, simplifying complex concepts for thousands of aspirants.",
    initials: "GS",
  },
  {
    name: "Puru Jain Sir",
    role: "QA & LRDI Faculty",
    credential: "99.5+%ile Scorer in CAT (QA & LRDI)\nCurrently at IIT",
    description: "Focuses on strong conceptual foundations, advanced problem solving, and structured preparation. Leads foundation batches, doubt sessions, and GDPI preparation at Percentilers.",
    initials: "PJ",
  },
];

const FacultySection = () => (
  <section className="py-20 md:py-24 bg-background relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.02] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <motion.div
        className="text-center mb-14 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">Our Team</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Learn From Experts Who've <span className="text-primary">Been There</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {faculty.map((f, i) => (
          <motion.div
            key={f.name}
            className="text-center space-y-4 group bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="relative mx-auto w-fit">
              <Avatar className="h-24 w-24 ring-4 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                <AvatarFallback className="text-xl font-bold bg-secondary text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                  {f.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-lg">{f.name}</h3>
              <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">{f.role}</span>
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed font-medium">{f.credential}</p>
              <p className="text-sm text-muted-foreground leading-relaxed pt-1">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FacultySection;
