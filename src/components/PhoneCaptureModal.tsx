import { useState } from "react";
import { trackLead } from "@/lib/tracking";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PhoneCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export default function PhoneCaptureModal({ open, onOpenChange, source, onSuccess, title, description }: PhoneCaptureModalProps) {
  const [phone, setPhone] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const userId = user?.id || null;
      const email = user?.email || null;
      const name = user?.user_metadata?.full_name || null;

      // Try upsert by user_id first, fallback to update by phone if unique constraint conflicts
      let upsertError: any = null;
      if (userId) {
        const res = await (supabase.from("leads") as any).upsert(
          {
            user_id: userId,
            email,
            name,
            phone_number: phone,
            source,
            ...(targetYear ? { target_year: targetYear } : {}),
          },
          { onConflict: "user_id" }
        );
        upsertError = res.error;

        // If phone unique constraint fails, update the existing phone row instead
        if (upsertError?.code === "23505" && upsertError?.message?.includes("phone_number")) {
          const res2 = await (supabase.from("leads") as any)
            .update({ user_id: userId, email, name, source, ...(targetYear ? { target_year: targetYear } : {}) })
            .eq("phone_number", phone);
          upsertError = res2.error;
        }
      } else {
        const res = await (supabase.from("leads") as any).upsert(
          {
            phone_number: phone,
            name,
            source,
            ...(targetYear ? { target_year: targetYear } : {}),
          },
          { onConflict: "phone_number" }
        );
        upsertError = res.error;
      }

      if (upsertError) {
        console.error("Lead upsert failed:", upsertError);
        toast({ title: "Something went wrong", description: "Could not save phone number. Please try again.", variant: "destructive" });
        setSubmitting(false);
        return;
      }

      localStorage.setItem("percentilers_phone", phone);
      if (name) localStorage.setItem("percentilers_name", name);

      // Sync to Google Sheet (fire-and-forget)
      supabase.functions.invoke("sync-lead-to-sheet", {
        body: { phone_number: phone, email, source },
      }).catch(() => {});

      trackLead(source);
      toast({ title: "Phone number saved!", description: "You're all set." });
      onOpenChange(false);
      setPhone("");
      setTargetYear("");
      onSuccess();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const userName = user?.user_metadata?.full_name || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>{title || "One Last Step"}</DialogTitle>
          <DialogDescription>{description || "Share your phone number so we can personalize your experience."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
