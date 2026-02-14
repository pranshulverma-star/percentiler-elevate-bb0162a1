import { motion } from "framer-motion";

const logos = [
  { name: "Hindustan Times", style: "font-serif font-bold tracking-tight" },
  { name: "Zee News", style: "font-sans font-black uppercase tracking-widest" },
  { name: "Deccan Herald", style: "font-serif font-semibold italic tracking-wide" },
  { name: "Dailyhunt", style: "font-sans font-extrabold tracking-tight" },
  { name: "Times of India", style: "font-serif font-bold tracking-normal" },
];

const FeaturedStrip = () => (
  <section className="py-8 md:py-10 bg-secondary/30 border-y border-border overflow-hidden">
    <motion.p
      className="text-center text-[10px] font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-6"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      As Featured In
    </motion.p>

    {/* Auto-scrolling strip */}
    <div className="relative w-full overflow-hidden group">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-secondary/30 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-secondary/30 to-transparent" />

      <div className="flex animate-scroll-x gap-14 md:gap-20 w-max group-hover:[animation-play-state:paused]">
        {[...logos, ...logos].map((logo, i) => (
          <span
            key={`${logo.name}-${i}`}
            className={`text-base md:text-lg text-muted-foreground/50 shrink-0 select-none whitespace-nowrap transition-colors duration-300 group-hover:text-muted-foreground/70 ${logo.style}`}
          >
            {logo.name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedStrip;
