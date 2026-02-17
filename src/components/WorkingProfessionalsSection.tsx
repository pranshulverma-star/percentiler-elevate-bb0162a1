import { motion } from "framer-motion";
import { Clock, Calendar, RefreshCw, Zap, CheckCircle } from "lucide-react";

const features = [
  { icon: Clock, text: "2–3 hour daily structured plans" },
  { icon: Calendar, text: "Weekend mock optimization" },
  { icon: RefreshCw, text: "Smart repetition cycles" },
  { icon: Zap, text: "Time-efficient CAT preparation" },
];

const WorkingProfessionalsSection = () => (
  <section className="py-14 md:py-24 bg-background relative overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.02] blur-3xl" />
    </div>

    <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center relative z-10">
      <motion.div
        className="space-y-3 mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-primary/60">For Busy Aspirants</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Designed for Working Professionals & <span className="text-primary">College Students</span>
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Think you don't have enough time? We specialize in making CAT preparation work around your schedule.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.text}
              className="flex items-center gap-3 text-left"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">{f.text}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="text-muted-foreground text-sm max-w-md mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        If you already tried another coaching and didn't improve — you likely lacked structured execution. <strong className="text-foreground">This time will be different.</strong>
      </motion.p>
    </div>
  </section>
);

export default WorkingProfessionalsSection;
