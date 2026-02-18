import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Download, FileText, BookOpen, BarChart3, PenTool, Gift, Loader2, Lock, Phone, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const phone = localStorage.getItem("percentilers_phone");
  const [watchPct, setWatchPct] = useState(0);
  const [maxWatchPct, setMaxWatchPct] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isFirstWatch, setIsFirstWatch] = useState(true);
  const [resumePct, setResumePct] = useState(0);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
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

  // Redirect if no phone
  useEffect(() => {
    if (!phone) navigate("/masterclass");
  }, [phone, navigate]);

  // Check existing engagement on load
  useEffect(() => {
    if (!phone) return;
    const checkEngagement = async () => {
      const { data } = await supabase
        .from("webinar_engagement")
        .select("watch_percentage, completed")
        .eq("phone_number", phone)
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
          if (data.watch_percentage > 0 && !data.completed) {
            setResumePct(data.watch_percentage);
          }
          if (data.watch_percentage >= 100) setIsFirstWatch(false);
        }
      }
    };
    checkEngagement();
  }, [phone]);

  const updateEngagement = useCallback(async (pct: number, isCompleted = false) => {
    if (!phone) return;

    if (!engagementCreated.current) {
      await supabase.from("webinar_engagement").insert({
        phone_number: phone,
        watch_percentage: pct,
        completed: isCompleted,
      });
      engagementCreated.current = true;
    } else {
      await supabase
        .from("webinar_engagement")
        .update({
          watch_percentage: pct,
          completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("phone_number", phone);
    }
  }, [phone]);

  // Real video progress tracking
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration || completed) return;

    const pct = Math.round((video.currentTime / video.duration) * 100);
    setWatchPct(pct);
    setMaxWatchPct(prev => Math.max(prev, pct));

    // On first watch, prevent seeking forward beyond max watched
    if (isFirstWatch && video.currentTime > (video.duration * maxWatchPct / 100) + 2) {
      video.currentTime = video.duration * maxWatchPct / 100;
      return;
    }

    const milestones = [20, 40, 60, 80, 90, 100];
    for (const m of milestones) {
      if (pct >= m && lastMilestone.current < m) {
        lastMilestone.current = m;
        if (m === 90) setShowUnlockBanner(true);
        if (m === 100) {
          setCompleted(true);
          setIsFirstWatch(false);
          updateEngagement(100, true);
        } else {
          updateEngagement(m, false);
        }
      }
    }
  }, [completed, updateEngagement, isFirstWatch, maxWatchPct]);

  const handleVideoEnded = useCallback(() => {
    if (!completed) {
      setWatchPct(100);
      setMaxWatchPct(100);
      setCompleted(true);
      setIsFirstWatch(false);
      updateEngagement(100, true);
    }
  }, [completed, updateEngagement]);

  // Resume from last position
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasResumed.current || resumePct <= 0) return;
    hasResumed.current = true;
    video.currentTime = (video.duration * resumePct) / 100;
  }, [resumePct]);

  // Prevent seeking on first watch via CSS
  const videoClassName = `w-full h-full object-contain rounded-2xl${isFirstWatch ? " [&::-webkit-media-controls-timeline]:hidden" : ""}`;

  const handleApply = useCallback(async () => {
    if (!phone) return;
    setApplyLoading(true);
    try {
      // Upsert lead as very hot source
      const { data: existing } = await supabase
        .from("leads")
        .select("phone_number")
        .eq("phone_number", phone)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("leads")
          .update({ source: "masterclass_apply_95", current_status: "very_hot" })
          .eq("phone_number", phone);
      } else {
        await supabase.from("leads").insert({
          phone_number: phone,
          name: localStorage.getItem("percentilers_name") || null,
          source: "masterclass_apply_95",
          current_status: "very_hot",
        });
      }
    } catch {
      // silent fail
    } finally {
      setApplyLoading(false);
      setShowApplyConfirm(true);
    }
  }, [phone]);

  if (!phone) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="/" className="text-xl font-bold tracking-tight text-foreground">
            Percentilers
          </a>
        </div>
      </header>

      <main className="py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Video Player Area */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-2">
            {videoLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            )}
            <video
              id="masterclassVideo"
              ref={videoRef}
              className={videoClassName}
              controls
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onLoadedData={() => setVideoLoading(false)}
              onLoadedMetadata={handleLoadedMetadata}
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={VIDEO_URL} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5 mb-8">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${watchPct}%` }}
            />
          </div>

          {/* Unlock Banner */}
          {showUnlockBanner && !completed && (
            <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
              <p className="font-semibold text-foreground">
                🎉 You're about to unlock the free CAT Success Resource Kit.
              </p>
            </div>
          )}

          {/* You'll Learn Section */}
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

          {/* CTA */}
          <div className="text-center mb-16">
            <Button size="lg" onClick={handleApply} disabled={applyLoading}>
              {applyLoading ? "Submitting..." : (<>Apply for 95%ile Guarantee Batch <ArrowRight className="ml-1 h-4 w-4" /></>)}
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Limited seats. Mentor interaction included.
            </p>
          </div>

          {/* Resource Kit Section — progressive unlock */}
          <section id="resource-kit-section" className="mb-16">
            <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Gift className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">
                    CAT Success Resource Kit
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Keep watching to unlock all 5 resources.
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {resources.map((r, i) => {
                  const unlocked = maxWatchPct >= r.unlockAt;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-xl border p-4 transition-shadow ${unlocked ? "border-border hover:shadow-sm" : "border-border/50 opacity-60"}`}
                    >
                      <div className="flex items-center gap-3">
                        <r.icon className={`h-5 w-5 shrink-0 ${unlocked ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`font-medium ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>{r.label}</span>
                      </div>
                      {unlocked ? (
                        <Button size="sm" variant="outline" asChild>
                          <a href={r.action === "planner" ? "/#tools" : "#"}>
                            {r.action === "planner" ? "Open Planner" : "Download"}
                          </a>
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="h-3.5 w-3.5" /> {r.unlockAt}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-8 text-center">
                <Button size="lg" onClick={handleApply} disabled={applyLoading}>
                  {applyLoading ? "Submitting..." : (<>Apply for 95%ile Guarantee Batch <ArrowRight className="ml-1 h-4 w-4" /></>)}
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Structured roadmap + daily mentoring + accountability included.
                </p>
              </div>
            </div>
          </section>

          {/* Apply Confirmation Dialog */}
          <Dialog open={showApplyConfirm} onOpenChange={setShowApplyConfirm}>
            <DialogContent className="max-w-sm text-center">
              <DialogTitle className="sr-only">Application Confirmed</DialogTitle>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                  <PartyPopper className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">You're In! 🎉</h3>
                <p className="text-muted-foreground text-sm">
                  Our counselor will connect with you shortly to discuss the 95%ile Guarantee Batch.
                </p>
                <div className="w-full space-y-3 pt-2">
                  <Button size="lg" className="w-full" asChild>
                    <a href="tel:+919911928071">
                      <Phone className="mr-2 h-4 w-4" /> Call Now — +91 99119 28071
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowApplyConfirm(false)}>
                    I'll wait for the call
                  </Button>
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
