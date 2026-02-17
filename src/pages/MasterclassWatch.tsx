import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Download, FileText, BookOpen, BarChart3, PenTool, Gift, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const learningBullets = [
  "Ideal prep start timeline",
  "ROI-focused college targeting",
  "Profile improvement roadmap",
  "CAT solving framework",
  "Coaching selection checklist",
];

const resources = [
  { icon: FileText, label: "Ebook — Top Secrets to Crack CAT", action: "download" },
  { icon: BookOpen, label: "Coaching Shortlist Checklist", action: "download" },
  { icon: BarChart3, label: "Daily Study Planner", action: "planner" },
  { icon: PenTool, label: "College ROI List", action: "download" },
  { icon: Download, label: "Handwritten Notes", action: "download" },
];

const VIDEO_URL = "https://d7l58vt9hijvq.cloudfront.net/Webinar_compressed.mp4";

const MasterclassWatch = () => {
  const navigate = useNavigate();
  const phone = localStorage.getItem("percentilers_phone");
  const [watchPct, setWatchPct] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const engagementCreated = useRef(false);
  const lastMilestone = useRef(0);

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
        if (data.completed) setCompleted(true);
        if (data.watch_percentage) setWatchPct(data.watch_percentage);
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

    const milestones = [25, 50, 75, 90, 100];
    for (const m of milestones) {
      if (pct >= m && lastMilestone.current < m) {
        lastMilestone.current = m;
        if (m === 90) setShowUnlockBanner(true);
        if (m === 100) {
          setCompleted(true);
          updateEngagement(100, true);
        } else {
          updateEngagement(m, false);
        }
      }
    }
  }, [completed, updateEngagement]);

  const handleVideoEnded = useCallback(() => {
    if (!completed) {
      setWatchPct(100);
      setCompleted(true);
      updateEngagement(100, true);
    }
  }, [completed, updateEngagement]);

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
              className="w-full h-full object-contain rounded-2xl"
              controls
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onLoadedData={() => setVideoLoading(false)}
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
            <Button size="lg" asChild>
              <a href="#">
                Apply for 95%ile Guarantee Batch <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Limited seats. Mentor interaction included.
            </p>
          </div>

          {/* Resource Kit Section — only shown if completed */}
          {completed && (
            <section id="resource-kit-section" className="mb-16">
              <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Gift className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      CAT Success Resource Kit (Unlocked)
                    </h2>
                  </div>
                  <p className="text-muted-foreground">
                    You stayed till the end. That already puts you ahead of most aspirants.
                  </p>
                </div>

                <div className="space-y-4 mb-10">
                  {resources.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <r.icon className="h-5 w-5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{r.label}</span>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={r.action === "planner" ? "/#tools" : "#"}>
                          {r.action === "planner" ? "Open Planner" : "Download"}
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-8 text-center">
                  <Button size="lg" asChild>
                    <a href="#">
                      Apply for 95%ile Guarantee Batch <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Structured roadmap + daily mentoring + accountability included.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default MasterclassWatch;
