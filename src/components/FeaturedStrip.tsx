const logos = [
  "Deccan Herald",
  "Hindustan Times",
  "Dailyhunt",
  "Zee News",
  "Impact Startup",
];

const FeaturedStrip = () => (
  <section className="py-8 md:py-10 bg-background border-b border-border overflow-hidden">
    <p className="text-center text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-6">
      As Featured In
    </p>

    {/* Auto-scrolling strip */}
    <div className="relative w-full overflow-hidden group">
      <div className="flex animate-scroll-x gap-12 md:gap-16 w-max group-hover:[animation-play-state:paused]">
        {/* Duplicate for seamless loop */}
        {[...logos, ...logos].map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="text-sm font-semibold tracking-wide text-muted-foreground opacity-60 shrink-0 select-none whitespace-nowrap"
          >
            {name}
          </span>
        ))}
      </div>
    </div>

    <p className="text-center text-xs text-muted-foreground mt-5 opacity-70">
      Recognized by leading national publications.
    </p>
  </section>
);

export default FeaturedStrip;
