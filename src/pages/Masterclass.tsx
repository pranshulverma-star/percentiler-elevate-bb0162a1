import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Award, Shield, Star, Play, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import mentorPhoto from "@/assets/founder-pranshul.webp";
import { useAuth } from "@/hooks/useAuth";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";
import studentAnanya from "@/assets/student-ananya.jpg";
import studentKarthik from "@/assets/student-karthik.jpg";
import studentDivya from "@/assets/student-divya.jpg";

const bullets = [
  "Eligibility Criteria and When to Start",
  "How to make your Foundation Strong",
  "How to build your profile",
  "MBA exams apart from CAT",
  "Best B-Schools in India",
  "How to choose the Best Coaching for you",
];

const socialProofStats = [
  { icon: Users, value: "10,000+", label: "Students Guided" },
  { icon: Award, value: "7x", label: "100%iler Mentor" },
  { icon: Shield, value: "95%ile", label: "Guarantee Batch" },
];

const featuredLogos = [
  "Hindustan Times",
  "Zee News",
  "Deccan Herald",
  "Times of India",
  "Dailyhunt",
];

const testimonialSnippets = [
  { name: "Ananya S.", text: "Jumped from 85 to 98 percentile in 4 months.", score: "99.4%ile", photo: studentAnanya },
  { name: "Karthik N.", text: "Got into IIM Bangalore. The mentoring was personal.", score: "98.7%ile", photo: studentKarthik },
  { name: "Divya S.", text: "Clear plan, weekly targets, honest feedback.", score: "97.9%ile", photo: studentDivya },
];

const GoogleSignInButton = ({ className }: { className?: string }) => {
  const { signIn, loading, isAuthenticated, user } = useAuth();

  const handleGoogleSignIn = async () => {
    sessionStorage.setItem("pending_gate_redirect", "/masterclass");
    sessionStorage.setItem("pending_gate_source", "masterclass");
    await signIn();
  };

  if (isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img src={user?.user_metadata?.avatar_url} alt="" className="w-7 h-7 rounded-full" />
        <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className={`gap-2 text-xs font-medium ${className}`}
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Sign in
    </Button>
  );
};

const RegistrationCard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signIn, user, loading: authLoading } = useAuth();
  const resumeTriggered = useRef(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCTA = useCallback(async () => {
    // Step 1: If not authenticated, trigger Google sign-in
    if (!isAuthenticated) {
      sessionStorage.setItem("pending_gate_redirect", "/masterclass");
      sessionStorage.setItem("pending_gate_source", "masterclass");
      await signIn();
      return;
    }

    // Step 2: Authenticated — check DB for phone with timeout
    if (!user?.id) return;
    setChecking(true);
    const timeout = setTimeout(() => {
      // Fallback: if DB check takes too long, show phone modal
      setChecking(false);
      setShowPhoneModal(true);
    }, 4000);

    try {
      const { data } = await (supabase.from("leads") as any)
        .select("phone_number")
        .eq("user_id", user.id)
        .maybeSingle();

      clearTimeout(timeout);

      if (data?.phone_number && /^\d{10}$/.test(data.phone_number)) {
        navigate("/masterclass/watch");
      } else {
        setShowPhoneModal(true);
      }
    } catch {
      clearTimeout(timeout);
      setShowPhoneModal(true);
    } finally {
      setChecking(false);
    }
  }, [isAuthenticated, signIn, user?.id, navigate]);

  // Auto-resume gate check after Google sign-in redirect
  useEffect(() => {
    const pending = sessionStorage.getItem("pending_gate_redirect");
    if (pending === "/masterclass" && isAuthenticated && user?.id && !authLoading && !checking && !resumeTriggered.current) {
      resumeTriggered.current = true;
      sessionStorage.removeItem("pending_gate_redirect");
      sessionStorage.removeItem("pending_gate_source");
      // Fire immediately — session is already ready at this point
      handleCTA();
    }
  }, [isAuthenticated, user?.id, authLoading, checking, handleCTA]);

  const handlePhoneSuccess = () => {
    setShowPhoneModal(false);
    navigate("/masterclass/watch");
  };

  const isLoading = authLoading || checking;

  return (
    <>
      <Card className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
            <Play className="h-5 w-5 ml-0.5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Watch Free Masterclass</h2>
          <p className="text-sm text-muted-foreground mt-1">Free · 45 min · Structured mentoring</p>
        </div>
        <Button
          size="lg"
          className="w-full h-12 text-base animate-pulse-glow"
          onClick={handleCTA}
          disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking…</>
          ) : (
            "Watch Masterclass →"
          )}
        </Button>
        <div className="mt-5 pt-4 border-t border-border space-y-2 text-center">
          <p className="text-xs text-muted-foreground">
            Next structured batch closes soon.
          </p>
          <p className="text-xs font-medium text-foreground/70">
            2,000+ CAT aspirants registered in last cycle
          </p>
        </div>
      </Card>
      <PhoneCaptureModal
        open={showPhoneModal}
        onOpenChange={setShowPhoneModal}
        source="masterclass"
        onSuccess={handlePhoneSuccess}
      />
    </>
  );
};

const Masterclass = () => {
  const { isAuthenticated, user } = useAuth();

  // Upsert lead on auth (fire-and-forget, no blocking)
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    (supabase.from("leads") as any).upsert(
      { user_id: user.id, email: user.email, name: user.user_metadata?.full_name || null, source: "masterclass" },
      { onConflict: "user_id" }
    ).then(() => {});
  }, [isAuthenticated, user]);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "CAT Demystified Masterclass",
      "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": { "@type": "VirtualLocation", "url": "https://percentilers.in/masterclass" },
      "organizer": { "@type": "Organization", "name": "Percentilers" },
      "description": "Free CAT masterclass covering preparation strategy, profile building, exam roadmap and MBA entrance guidance."
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Free CAT Masterclass | CAT Preparation Strategy for 95+ Percentile"
        description="Watch the free CAT masterclass and learn a proven CAT exam strategy used in our best CAT coaching program. Discover how to structure your CAT preparation for 95+ percentile."
        canonical="https://percentilers.in/masterclass"
      />
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="/" className="text-xl font-bold tracking-tight text-foreground">
            Percentilers
          </a>
          <GoogleSignInButton />
        </div>
      </header>

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

      <div className="py-6 border-b border-border">
        <p className="text-center text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-4">
          As Featured In
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 px-4">
          {featuredLogos.map((name) => (
            <span key={name} className="text-xs font-semibold tracking-wide text-muted-foreground opacity-50 select-none">
              {name}
            </span>
          ))}
        </div>
      </div>

      <main className="py-8 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {/* Mobile: CTA card first, then content */}
          <div className="lg:hidden mb-8">
            <RegistrationCard />
          </div>
          <div className="grid lg:grid-cols-[1fr_380px] gap-10 md:gap-14 items-start mb-20">
            <motion.div className="space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-start gap-5">
                <img src={mentorPhoto} alt="Pranshul Verma — 7x CAT 100%iler" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">Your Mentor</p>
                  <p className="text-lg font-bold text-foreground">Pranshul Verma</p>
                  <p className="text-sm text-muted-foreground">7x CAT 100%iler · 10,000+ students mentored</p>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground">
                CAT Demystified:{" "}
                <span className="text-primary">Everything You Need to Know Before You Start.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                A complete walkthrough covering eligibility, foundation building, profile development, top B-Schools, and coaching selection — plus a giveaway at the end!
              </p>

              <div className="space-y-5">
                <h2 className="text-base font-bold text-foreground">What We'll Be Covering</h2>
                <ul className="space-y-3">
                  {bullets.map((b, i) => (
                    <motion.li key={b} className="flex items-start gap-3" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}>
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground text-sm md:text-base">{b}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div id="register" className="hidden lg:block lg:sticky lg:top-24" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <RegistrationCard />
            </motion.div>
          </div>

          <motion.div className="mb-20" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Students Who Took This Masterclass</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {testimonialSnippets.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                  <Card className="p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <span className="text-xs font-bold text-primary">{t.score}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">"{t.text}"</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div className="text-center py-12 rounded-2xl bg-foreground" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">
              Don't Wait for Motivation. Start With a Plan.
            </h2>
            <p className="text-background/60 mb-6 text-sm">
              Join 2,000+ aspirants who already have a head start.
            </p>
            <Button size="lg" asChild>
              <a href="#register">Register Now — It's Free <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Masterclass;
