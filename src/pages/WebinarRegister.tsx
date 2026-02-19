import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const WebinarRegister = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If not authenticated, redirect to /masterclass
  if (!authLoading && !isAuthenticated) {
    navigate("/masterclass", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase.from("leads") as any).upsert(
        {
          user_id: user?.id,
          email: user?.email,
          name: user?.user_metadata?.full_name || null,
          phone_number: phone,
          source: "webinar_register",
          ...(targetYear ? { target_year: targetYear } : {}),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;

      localStorage.setItem("percentilers_phone", phone);

      // Sync to Google Sheet (fire-and-forget)
      supabase.functions.invoke("sync-lead-to-sheet", {
        body: { phone_number: phone, email: user?.email, source: "webinar_register" },
      }).catch(() => {});

      toast({ title: "You're all set!", description: "Enjoy the masterclass." });
      navigate("/masterclass/watch", { replace: true });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  const userName = user?.user_metadata?.full_name || "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="/" className="text-xl font-bold tracking-tight text-foreground">Percentilers</a>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[80vh] py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto px-4"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
              <Play className="h-6 w-6 ml-0.5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Almost There!</h1>
            <p className="text-sm text-muted-foreground mt-2">Share your phone number to access the masterclass.</p>
          </div>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {userName && (
                  <div className="text-sm text-muted-foreground">
                    Hi <span className="font-semibold text-foreground">{userName}</span> 👋
                  </div>
                )}
                <Input
                  placeholder="Phone Number (10 digits)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  pattern="[6-9]\d{9}"
                  title="Enter a valid 10-digit Indian mobile number"
                  autoFocus
                />
                <Select value={targetYear} onValueChange={setTargetYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Target Year (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Saving..." : "Watch Masterclass"} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default WebinarRegister;
