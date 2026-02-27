import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Download, FileText, BookOpen, BarChart3, PenTool, Gift, Loader2, Lock, Phone, PartyPopper, Play, RefreshCw, Flame, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackInitiateCheckout } from "@/lib/tracking";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

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

  // DB-based phone check
  const [hasPhone, setHasPhone] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(true);
  const [identifier, setIdentifier] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.id) {
      setPhoneLoading(false);
      return;
    }

    const checkPhone = async () => {
      const { data } = await (supabase.from("leads") as any)
        .select("phone_number")
        .eq("user_id", user.id)
        .maybeSingle();

      const phone = data?.phone_number;
      if (phone && /^\d{10}$/.test(phone)) {
        setHasPhone(true);
        setIdentifier(phone);
      }
      setPhoneLoading(false);
    };
    checkPhone();
  }, [authLoading, isAuthenticated, user?.id]);

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
  const [videoReady, setVideoReady] = useState(false);
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

  // Redirect guard: requires auth + phone in DB
  // Grace period allows Supabase session to initialize after OAuth redirect
  const [guardReady, setGuardReady] = useState(false);
  useEffect(() => {
    if (authLoading || phoneLoading) return;
    // Minimal grace period — auth state is already resolved at this point
    const t = setTimeout(() => setGuardReady(true), 100);
    return () => clearTimeout(t);
  }, [authLoading, phoneLoading]);

  useEffect(() => {
    if (!guardReady) return;
    if (!isAuthenticated || !hasPhone) {
      navigate("/masterclass", { replace: true });
    }
  }, [guardReady, isAuthenticated, hasPhone, navigate]);

  // Sign-out listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/masterclass", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Check existing engagement on load
  useEffect(() => {
    if (!identifier) return;
    const checkEngagement = async () => {
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
  }, [identifier]);

  const updateEngagement = useCallback(async (pct: number, isCompleted = false) => {
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
  }, [identifier]);

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

  const handleCanPlayThrough = useCallback(() => {
    setVideoLoading(false);
    setVideoReady(true);
  }, []);

  const videoClassName = `w-full h-full object-contain rounded-2xl${isFirstWatch ? " [&::-webkit-media-controls-timeline]:hidden" : ""}`;

  const handleApply = useCallback(async () => {
    trackInitiateCheckout("masterclass_apply_95");
    setApplyLoading(true);
    try {
      await supabase.functions.invoke("mark-lead-hot", {
        body: { phone_number: identifier, source: "masterclass_apply_95", name: user?.user_metadata?.full_name || null, email: user?.email || null },
      });
    } catch { /* silent */ }
    finally { setApplyLoading(false); setShowApplyConfirm(true); }
  }, [user, identifier]);

  if (authLoading || phoneLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  );
  if (!isAuthenticated || !hasPhone) return null;

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
            {showTapToPlay && !videoError && videoReady && (
              <button className="absolute inset-0 flex items-center justify-center z-[15] bg-black/40 cursor-pointer" onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                if (v.currentTime === 0 && resumePct <= 0) v.currentTime = 0.001;
                v.play().then(() => setShowTapToPlay(false)).catch(() => {
                  v.muted = true;
                  v.play().then(() => { setShowTapToPlay(false); v.muted = false; }).catch(() => {});
                });
              }} aria-label="Tap to play video">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                  <Play className="h-7 w-7 text-primary-foreground ml-1" />
                </div>
              </button>
            )}
            <video
              id="masterclassVideo"
              ref={videoRef}
              className={videoClassName}
              controls
              playsInline
              webkit-playsinline=""
              x-webkit-airplay="allow"
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onLoadedMetadata={() => { setVideoLoading(false); handleLoadedMetadata(); }}
              onCanPlay={() => setVideoLoading(false)}
              onCanPlayThrough={handleCanPlayThrough}
              onPlay={() => setShowTapToPlay(false)}
              onWaiting={() => setVideoLoading(true)}
              onPlaying={() => setVideoLoading(false)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={VIDEO_URL} type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"' onError={() => { setVideoError(true); setVideoLoading(false); }} />
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

          {/* Resource Kit */}
          {(() => {
            const unlocked = resources.filter(r => maxWatchPct >= r.unlockAt);
            const locked = resources.filter(r => maxWatchPct < r.unlockAt);
            const visible = [...unlocked, ...locked.slice(0, 2)];
            const hiddenCount = resources.length - visible.length;
            return (
              <section id="resource-kit-section" className="mb-6">
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] to-background p-4 md:p-5 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <Gift className="h-4 w-4 text-primary" />
                    <h2 className="text-sm md:text-base font-bold text-foreground">Free Resource Kit</h2>
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Flame className="h-2.5 w-2.5" />
                      {unlocked.length}/{resources.length}
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 relative z-10 scrollbar-hide">
                    {visible.map((r, i) => {
                      const isUnlocked = maxWatchPct >= r.unlockAt;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.06, duration: 0.3 }}
                          className={`relative flex-shrink-0 w-28 md:w-32 rounded-lg border p-2.5 text-center transition-all duration-200 ${
                            isUnlocked
                              ? "border-primary/30 bg-background shadow-sm hover:shadow-md cursor-pointer"
                              : "border-border/40 bg-muted/20 opacity-70"
                          }`}
                        >
                          {isUnlocked && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Sparkles className="h-2.5 w-2.5 text-primary-foreground" />
                            </div>
                          )}
                          <div className={`mx-auto w-7 h-7 rounded-md flex items-center justify-center mb-1.5 ${
                            isUnlocked ? "bg-primary/10" : "bg-muted"
                          }`}>
                            {isUnlocked ? <r.icon className="h-3.5 w-3.5 text-primary" /> : <Lock className="h-3 w-3 text-muted-foreground/50" />}
                          </div>
                          <p className={`text-[10px] font-medium leading-tight ${isUnlocked ? "text-foreground" : "text-muted-foreground/50"}`}>
                            {r.label}
                          </p>
                          {!isUnlocked && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground/40 font-medium mt-1">
                              <Lock className="h-2 w-2" /> {r.unlockAt}%
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                    {hiddenCount > 0 && (
                      <div className="flex-shrink-0 w-20 rounded-lg border border-dashed border-border/30 flex items-center justify-center text-[10px] text-muted-foreground/40 font-medium">
                        +{hiddenCount} more
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })()}

          <div className="text-center mb-10">
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
