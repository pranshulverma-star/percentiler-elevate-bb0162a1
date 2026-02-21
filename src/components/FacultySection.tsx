import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

import facultyGaurav from "@/assets/faculty-gaurav.jpeg";
import facultyShweta from "@/assets/faculty-shweta.png";
import facultyPuru from "@/assets/faculty-puru.png";

const faculty = [
  {
    name: "Mayank Raj Singh Sir",
    role: "Academic Head",
    description: "7x CAT 100%iler since 2006. Two decades of strategy and mentoring expertise.",
    initials: "MR",
    photo: null as string | null,
  },
  {
    name: "Shweta Ma'am",
    role: "VARC Faculty",
    description: "SRCC & IIM Calcutta alumna. 4x 100%ile in VARC.",
    initials: "SM",
    photo: facultyShweta,
  },
  {
    name: "Gaurav Sharma Sir",
    role: "QA & LRDI Faculty",
    description: "18 years of teaching. Consistent 99+%ile scorer in CAT.",
    initials: "GS",
    photo: facultyGaurav,
  },
  {
    name: "Puru Jain Sir",
    role: "QA & LRDI Faculty",
    description: "99.5+%ile in CAT QA & LRDI. Currently at IIT.",
    initials: "PJ",
    photo: facultyPuru,
  },
];

const FacultySection = () => (
  <section className="py-10 md:py-16 bg-background relative overflow-hidden">
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto">
        {faculty.map((f, i) => (
          <motion.div
            key={f.name}
            className="text-center space-y-3 group bg-card rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="relative mx-auto w-fit">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-4 ring-transparent group-hover:ring-primary/50 transition-all duration-300">
                {f.photo ? (
                  <AvatarImage src={f.photo} alt={f.name} className="object-cover object-top scale-[1.2]" />
                ) : null}
                <AvatarFallback className="text-lg font-bold bg-secondary text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                  {f.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground text-sm">{f.name}</h3>
              <span className="inline-block text-[10px] font-semibold tracking-wide uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{f.role}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FacultySection;
