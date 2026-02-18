import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Download, FileText, BookOpen, BarChart3, PenTool, Gift, Loader2, Lock, Phone, PartyPopper, Play, RefreshCw, Flame, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useLeadModal } from "@/components/LeadModalProvider";

const learningBullets = [
  "Eligibility Criteria and When to Start",
  "How to make your Foundation Strong",
  "How to build your profile",
  "MBA exams apart from CAT",
  "Best B-Schools in India",
  "How to choose the Best Coaching for you",
];

const resources = [
  { icon: FileText, label: "Ebook — Top Secrets to Crack CAT", action: "download", unlockAt: 20 },
  { icon: BarChart3, label: "Daily Study Planner", action: "planner", unlockAt: 40 },
  { icon: PenTool, label: "College ROI List", action: "download", unlockAt: 60 },
  { icon: BookOpen, label: "Coaching Shortlist Checklist", action: "download", unlockAt: 80 },
  { icon: Download, label: "Handwritten Notes", action: "download", unlockAt: 90 },
];

const VIDEO_URL = "https://d7l58vt9hijvq.cloudfront.net/Webinar_compressed.mp4";

const MasterclassWatch = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { openPhoneModal } = useLeadModal();

  // Use email as identifier instead of phone
  const email = user?.email || null;

  const [watchPct, setWatchPct] = useState(0);
  const [maxWatchPct, setMaxWatchPct] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isFirstWatch, setIsFirstWatch] = useState(true);
  const [resumePct, setResumePct] = useState(0);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showTapToPlay, setShowTapToPlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const engagementCreated = useRef(false);
  const lastMilestone = useRef(0);
  const hasResumed = useRef(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": "CAT Demystified Masterclass",
      "description": "Recorded CAT preparation masterclass explaining strategy, syllabus breakdown and mock approach.",
      "thumbnailUrl": "https://percentilers.in/thumbnail.jpg",
      "uploadDate": "2025-01-01",
      "publisher": { "@type": "Organization", "name": "Percentilers" }
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/masterclass");
  }, [isAuthenticated, authLoading, navigate]);

  // Check existing engagement on load — use phone from localStorage for backward compat
  const phone = localStorage.getItem("percentilers_phone") || "";
  
  useEffect(() => {
    if (!phone && !email) return;
    const checkEngagement = async () => {
      // Try phone first for backward compat, then email
      const identifier = phone || email || "";
      if (!identifier) return;
      
      const { data } = await supabase
        .from("webinar_engagement")
        .select("watch_percentage, completed")
        .eq("phone_number", identifier)
        .maybeSingle();
      if (data) {
        engagementCreated.current = true;
        if (data.completed) {
          setCompleted(true);
          setIsFirstWatch(false);
          setMaxWatchPct(100);
        }
        if (data.watch_percentage) {
          setWatchPct(data.watch_percentage);
          setMaxWatchPct(data.watch_percentage);
          lastMilestone.current = data.watch_percentage;
          if (data.watch_percentage > 0 && !data.completed) setResumePct(data.watch_percentage);
          if (data.watch_percentage >= 100) setIsFirstWatch(false);
        }
      }
    };
    checkEngagement();
  }, [phone, email]);

  const updateEngagement = useCallback(async (pct: number, isCompleted = false) => {
    const identifier = phone || email || "";
    if (!identifier) return;

    if (!engagementCreated.current) {
      await supabase.from("webinar_engagement").insert({
        phone_number: identifier,
        watch_percentage: pct,
        completed: isCompleted,
      });
      engagementCreated.current = true;
    } else {
      await supabase
        .from("webinar_engagement")
        .update({ watch_percentage: pct, completed: isCompleted, updated_at: new Date().toISOString() })
        .eq("phone_number", identifier);
    }
  }, [phone, email]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration || completed) return;
    const pct = Math.round((video.currentTime / video.duration) * 100);
    setWatchPct(pct);
    setMaxWatchPct(prev => Math.max(prev, pct));
    if (isFirstWatch && video.currentTime > (video.duration * maxWatchPct / 100) + 2) {
      video.currentTime = video.duration * maxWatchPct / 100;
      return;
    }
    const milestones = [20, 40, 60, 80, 90, 100];
    for (const m of milestones) {
      if (pct >= m && lastMilestone.current < m) {
        lastMilestone.current = m;
        if (m === 90) setShowUnlockBanner(true);
        if (m === 100) { setCompleted(true); setIsFirstWatch(false); updateEngagement(100, true); }
        else updateEngagement(m, false);
      }
    }
  }, [completed, updateEngagement, isFirstWatch, maxWatchPct]);

  const handleVideoEnded = useCallback(() => {
    if (!completed) { setWatchPct(100); setMaxWatchPct(100); setCompleted(true); setIsFirstWatch(false); updateEngagement(100, true); }
  }, [completed, updateEngagement]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasResumed.current || resumePct <= 0) return;
    hasResumed.current = true;
    video.currentTime = (video.duration * resumePct) / 100;
  }, [resumePct]);

  const videoClassName = `w-full h-full object-contain rounded-2xl${isFirstWatch ? " [&::-webkit-media-controls-timeline]:hidden" : ""}`;

  const handleApply = useCallback(async () => {
    // Collect phone first, then mark hot
    openPhoneModal("masterclass_apply_95", async () => {
      setApplyLoading(true);
      try {
        const p = localStorage.getItem("percentilers_phone") || "";
        await supabase.functions.invoke("mark-lead-hot", {
          body: { phone_number: p, source: "masterclass_apply_95", name: user?.user_metadata?.full_name || null, email: user?.email || null },
        });
      } catch { /* silent */ }
      finally { setApplyLoading(false); setShowApplyConfirm(true); }
    });
  }, [openPhoneModal, user]);

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="/" className="text-xl font-bold tracking-tight text-foreground">Percentilers</a>
        </div>
      </header>

      <main className="py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-2">
            {videoLoading && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            )}
            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/90 gap-4">
                <p className="text-white text-sm">Video failed to load.</p>
                <Button variant="outline" size="sm" onClick={() => { setVideoError(false); setVideoLoading(true); videoRef.current?.load(); }}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Tap to Retry
                </Button>
              </div>
            )}
            {showTapToPlay && !videoError && !videoLoading && (
              <button className="absolute inset-0 flex items-center justify-center z-[15] bg-black/40 cursor-pointer" onClick={() => { videoRef.current?.play().catch(() => {}); setShowTapToPlay(false); }} aria-label="Tap to play video">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="h-7 w-7 text-primary-foreground ml-1" />
                </div>
              </button>
            )}
            <video id="masterclassVideo" ref={videoRef} className={videoClassName} controls playsInline webkit-playsinline="" x-webkit-airplay="allow" preload="auto" onTimeUpdate={handleTimeUpdate} onEnded={handleVideoEnded} onLoadedMetadata={() => { setVideoLoading(false); handleLoadedMetadata(); }} onCanPlay={() => setVideoLoading(false)} onPlay={() => setShowTapToPlay(false)} onContextMenu={(e) => e.preventDefault()}>
              <source src={VIDEO_URL} type="video/mp4" onError={() => { setVideoError(true); setVideoLoading(false); }} />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 mb-6">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${watchPct}%` }} />
          </div>

          {showUnlockBanner && !completed && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
              <p className="font-semibold text-foreground">🎉 You're about to unlock the free CAT Success Resource Kit.</p>
            </div>
          )}

          {/* Resource Kit — Above the fold */}
          <section id="resource-kit-section" className="mb-10">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-background p-5 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.06] rounded-bl-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/[0.04] rounded-tr-full blur-xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-1 relative z-10">
                <Gift className="h-5 w-5 text-primary" />
                <h2 className="text-lg md:text-xl font-bold text-foreground">Free Resource Kit</h2>
                <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <Flame className="h-3 w-3" />
                  {resources.filter(r => maxWatchPct >= r.unlockAt).length}/{resources.length} Unlocked
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4 relative z-10">Watch the masterclass to unlock resources worth ₹2,999 — <span className="font-semibold text-primary">FREE</span></p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 md:gap-3 relative z-10">
                {resources.map((r, i) => {
                  const isUnlocked = maxWatchPct >= r.unlockAt;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      className={`group relative rounded-xl border p-3 md:p-4 text-center transition-all duration-300 ${
                        isUnlocked
                          ? "border-primary/30 bg-background shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                          : "border-border/40 bg-muted/30"
                      }`}
                    >
                      {isUnlocked && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Sparkles className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className={`mx-auto w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                        isUnlocked ? "bg-primary/10" : "bg-muted"
                      }`}>
                        {isUnlocked ? (
                          <r.icon className="h-4 w-4 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <p className={`text-[11px] md:text-xs font-medium leading-tight mb-2 ${
                        isUnlocked ? "text-foreground" : "text-muted-foreground/60"
                      }`}>
                        {r.label}
                      </p>
                      {isUnlocked ? (
                        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2.5 w-full" asChild>
                          <a href={r.action === "planner" ? "/cat-daily-study-planner" : "#"}>
                            {r.action === "planner" ? "Open" : "Get"}
                          </a>
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/50 font-medium">
                          <Lock className="h-2.5 w-2.5" /> Watch {r.unlockAt}%
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">You'll Learn</h2>
            <ul className="space-y-3">
              {learningBullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="text-center mb-16">
            <Button size="lg" onClick={handleApply} disabled={applyLoading}>
              {applyLoading ? "Submitting..." : (<>Apply for 95%ile Guarantee Batch <ArrowRight className="ml-1 h-4 w-4" /></>)}
            </Button>
            <p className="text-sm text-muted-foreground mt-3">Limited seats. Mentor interaction included.</p>
          </div>

          <Dialog open={showApplyConfirm} onOpenChange={setShowApplyConfirm}>
            <DialogContent className="max-w-sm text-center">
              <DialogTitle className="sr-only">Application Confirmed</DialogTitle>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                  <PartyPopper className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">You're In! 🎉</h3>
                <p className="text-muted-foreground text-sm">Our counselor will connect with you shortly to discuss the 95%ile Guarantee Batch.</p>
                <div className="w-full space-y-3 pt-2">
                  <Button size="lg" className="w-full" asChild>
                    <a href="tel:+919911928071"><Phone className="mr-2 h-4 w-4" /> Call Now — +91 99119 28071</a>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowApplyConfirm(false)}>I'll wait for the call</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default MasterclassWatch;
