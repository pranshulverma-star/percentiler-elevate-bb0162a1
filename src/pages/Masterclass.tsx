import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Users, Award, Shield, Star, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import mentorPhoto from "@/assets/mentor-pranshul.jpg";

const bullets = [
  "When to start CAT prep for maximum advantage",
  "Which colleges to target based on YOUR profile",
  "Best ROI MBA colleges (beyond IIM hype)",
  "Live CAT problem solving (see how simple it gets)",
  "How to improve your profile before interviews",
  "How to choose the right CAT coaching",
];

const socialProofStats = [
  { icon: Users, value: "10,000+", label: "Students Guided" },
  { icon: Award, value: "7x", label: "100%iler Mentor" },
  { icon: Shield, value: "95%ile", label: "Guarantee Batch" },
];

const featuredLogos = [
  { name: "Hindustan Times", style: "font-serif font-bold tracking-tight" },
  { name: "Zee News", style: "font-sans font-black uppercase tracking-widest" },
  { name: "Deccan Herald", style: "font-serif font-semibold italic tracking-wide" },
  { name: "Dailyhunt", style: "font-sans font-extrabold tracking-tight" },
  { name: "Times of India", style: "font-serif font-bold tracking-normal" },
];

const testimonialSnippets = [
  { name: "Ananya S.", text: "Jumped from 85 to 98 percentile in 4 months.", score: "99.4%ile" },
  { name: "Karthik N.", text: "Got into IIM Bangalore. The mentoring was personal.", score: "98.7%ile" },
  { name: "Divya S.", text: "Clear plan, weekly targets, honest feedback.", score: "97.9%ile" },
];

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: existing } = await supabase
        .from("leads")
        .select("phone_number")
        .eq("phone_number", phone.trim())
        .maybeSingle();

      if (!existing) {
        await supabase.from("leads").insert({
          phone_number: phone.trim(),
          name: name.trim(),
          source: "masterclass",
        });
      }

      localStorage.setItem("percentilers_phone", phone.trim());
      navigate("/masterclass/watch");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
          <Play className="h-5 w-5 ml-0.5" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Reserve Your Seat</h2>
        <p className="text-sm text-muted-foreground mt-1">Free · 45 min · Structured mentoring</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12"
        />
        <Input
          placeholder="Phone Number (10 digits)"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          type="tel"
          className="h-12"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" size="lg" className="w-full h-12 text-base animate-pulse-glow" disabled={loading}>
          {loading ? "Registering..." : (
            <>Register for Free Masterclass <ArrowRight className="ml-1 h-4 w-4" /></>
          )}
        </Button>
      </form>
      <div className="mt-5 pt-4 border-t border-border space-y-2 text-center">
        <p className="text-xs text-muted-foreground">
          Next structured batch closes soon.
        </p>
        <p className="text-xs font-medium text-foreground/70">
          2,000+ CAT aspirants registered in last cycle
        </p>
      </div>
    </Card>
  );
};

const Masterclass = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="/" className="text-xl font-bold tracking-tight text-foreground">
            Percentilers
          </a>
          <Button size="sm" variant="outline" asChild>
            <a href="#register">Register Now</a>
          </Button>
        </div>
      </header>

      {/* Social Proof Stats Strip */}
      <div className="border-b border-border py-4 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {socialProofStats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* As Featured In */}
      <div className="py-6 border-b border-border">
        <p className="text-center text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">
          As Featured In
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 px-4">
          {featuredLogos.map((logo) => (
            <span
              key={logo.name}
              className={`text-xs text-muted-foreground opacity-50 select-none ${logo.style}`}
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>

      {/* Hero — Mentor Section */}
      <main className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">

          {/* Top Hero: Headline + Photo + Form */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 md:gap-14 items-start mb-20">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Mentor intro with photo */}
              <div className="flex items-start gap-5">
                <img
                  src={mentorPhoto}
                  alt="Pranshul Verma — 7x CAT 100%iler"
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">Your Mentor</p>
                  <p className="text-lg font-bold text-foreground">Pranshul Verma</p>
                  <p className="text-sm text-muted-foreground">7x CAT 100%iler · 10,000+ students mentored</p>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground">
                Most CAT Aspirants Don't Fail Because They're Weak.{" "}
                <span className="text-primary">They Fail Because They Start Wrong.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                In this masterclass, I'll show you the structured roadmap that separates serious aspirants from average ones — the same framework behind 200+ students scoring 95+ percentile.
              </p>

              {/* Bullets */}
              <div className="space-y-5">
                <h2 className="text-base font-bold text-foreground">What You'll Learn</h2>
                <ul className="space-y-3">
                  {bullets.map((b, i) => (
                    <motion.li
                      key={b}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                    >
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground text-sm md:text-base">{b}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Registration Card */}
            <motion.div
              id="register"
              className="lg:sticky lg:top-24"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <RegistrationForm />
            </motion.div>
          </div>

          {/* Testimonials Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Students Who Took This Masterclass
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonialSnippets.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Card className="p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">"{t.text}"</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {t.score}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            className="text-center py-12 rounded-2xl bg-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">
              Don't Wait for Motivation. Start With a Plan.
            </h2>
            <p className="text-background/60 mb-6 text-sm">
              Join 2,000+ aspirants who already have a head start.
            </p>
            <Button size="lg" asChild>
              <a href="#register">
                Register Now — It's Free <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Masterclass;
