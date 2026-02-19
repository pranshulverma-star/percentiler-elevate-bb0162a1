import { motion } from "framer-motion";
import logoHT from "@/assets/logo-hindustan-times.png";
import logoZee from "@/assets/logo-zee-news.png";
import logoDH from "@/assets/logo-deccan-herald.png";
import logoTOI from "@/assets/logo-times-of-india.png";
import logoDailyhunt from "@/assets/logo-dailyhunt.png";

const logos = [
  { name: "Hindustan Times", src: logoHT },
  { name: "Zee News", src: logoZee },
  { name: "Deccan Herald", src: logoDH },
  { name: "Times of India", src: logoTOI },
  { name: "Dailyhunt", src: logoDailyhunt },
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

    <div className="relative w-full overflow-hidden group">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-secondary/30 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-secondary/30 to-transparent" />

      <div className="flex animate-scroll-x items-center gap-14 md:gap-20 w-max group-hover:[animation-play-state:paused]">
        {[...logos, ...logos].map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex items-center gap-2.5 shrink-0 select-none opacity-60 grayscale transition-all duration-300 group-hover:opacity-80 group-hover:grayscale-0"
          >
            <img
              src={logo.src}
              alt={logo.name}
              width={36}
              height={36}
              className="h-7 w-7 md:h-9 md:w-9 object-contain rounded-sm"
            />
            <span className="text-sm md:text-base font-semibold tracking-wide text-muted-foreground whitespace-nowrap">
              {logo.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedStrip;
