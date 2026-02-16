import { motion } from "framer-motion";
import mentorImg from "@/assets/founder-pranshul.webp";

const FounderSection = () => (
  <section className="py-20 md:py-28 bg-secondary/50 relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <motion.div
        className="text-center mb-4"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60 mb-2">Meet Your Mentor</span>
      </motion.div>

      <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-center max-w-5xl mx-auto">
        {/* Image */}
        <motion.div
          className="md:col-span-2 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative group">
            <div className="absolute -inset-3 rounded-2xl bg-primary/10 blur-xl group-hover:bg-primary/15 transition-colors duration-500" />
            <img
              src={mentorImg}
              alt="Pranshul Verma - 7x CAT 100%iler"
              className="relative w-56 h-56 md:w-64 md:h-64 object-cover rounded-2xl shadow-xl grayscale hover:grayscale-0 transition-all duration-700 ring-4 ring-background"
            />
            <motion.div
              className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              7x 100%iler
            </motion.div>
          </div>
        </motion.div>

        {/* Story */}
        <motion.div
          className="md:col-span-3 space-y-5"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            The Vision Behind <span className="text-primary">Percentilers</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            Founded by <strong className="text-foreground">Pranshul Verma</strong>, a 7-time CAT 100 percentiler, Percentilers was born from a single belief: every serious CAT aspirant deserves a clear, structured path to a top percentile.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            After coaching 5,000+ students over 8 years, Pranshul saw that most students didn't lack talent — they lacked direction. That's why we built a system combining expert mentorship, data-driven mock analysis, and disciplined study planning.
          </p>
          <div className="flex gap-8 pt-2">
            {[
              { num: "5000+", label: "Students Mentored" },
              { num: "200+", label: "95+ Percentilers" },
              { num: "8+", label: "Years Teaching" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-primary">{s.num}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default FounderSection;
