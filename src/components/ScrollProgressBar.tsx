import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const scaleX = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(pct);
      scaleX.set(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scaleX]);

  return (
    <motion.div
      className="fixed top-16 left-0 right-0 h-[3px] bg-primary origin-left z-50"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgressBar;
