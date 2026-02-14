import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const faculty = [
  { name: "Prof. Anil Sharma", credential: "IIM Ahmedabad alumnus\n15+ years teaching Quant & DI", initials: "AS" },
  { name: "Prof. Rekha Iyer", credential: "IIM Calcutta alumna\nVerbal Ability & RC specialist", initials: "RI" },
  { name: "Prof. Siddharth Jain", credential: "XLRI alumnus\n10+ years in Logical Reasoning coaching", initials: "SJ" },
  { name: "Prof. Kavita Nair", credential: "FMS Delhi alumna\nData Interpretation & mock strategy expert", initials: "KN" },
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {faculty.map((f, i) => (
          <motion.div
            key={f.name}
            className="text-center space-y-4 group"
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
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] text-primary-foreground font-bold">✓</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">{f.name}</h3>
              <p className="text-xs text-muted-foreground whitespace-pre-line mt-1 leading-relaxed">{f.credential}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FacultySection;
