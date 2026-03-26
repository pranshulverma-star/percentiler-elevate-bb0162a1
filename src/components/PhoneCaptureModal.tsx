import { useState } from "react";
import { trackLead, trackFormSubmitConversion } from "@/lib/tracking";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PhoneCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
  onSuccess: (() => void) | null;
  title?: string;
  description?: string;
  showNameField?: boolean;
}

export default function PhoneCaptureModal({ open, onOpenChange, source, onSuccess, title, description, showNameField }: PhoneCaptureModalProps) {
  const [phone, setPhone] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const userName = user?.user_metadata?.full_name || localStorage.getItem("percentilers_name") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Invalid phone number", { description: "Please enter a valid 10-digit Indian mobile number." });
      return;
    }
    setSubmitting(true);
    try {
      const userId = user?.id || null;
      const email = user?.email || null;
      const name = nameInput || user?.user_metadata?.full_name || localStorage.getItem("percentilers_name") || null;

      if (nameInput) localStorage.setItem("percentilers_name", nameInput);

      let upsertError: any = null;
      if (userId) {
        // Update-first strategy to avoid race with the fire-and-forget
        // lead upsert in useAuth's onAuthStateChange handler.
        const updatePayload = {
          email,
          name,
          phone_number: phone,
          source,
          ...(targetYear ? { target_year: targetYear } : {}),
        };
        const { data: updated, error: updateErr } = await supabase.from("leads")
          .update(updatePayload)
          .eq("user_id", userId)
          .select("id");

        if (updateErr) {
          upsertError = updateErr;
        } else if (!updated || updated.length === 0) {
          // No existing row yet — insert
          const res = await supabase.from("leads").insert({
            user_id: userId,
            ...updatePayload,
          });
          upsertError = res.error;
        }
      } else {
        // Anonymous: try update first, then insert
        const { data: existing } = await supabase.from("leads")
          .select("id")
          .eq("phone_number", phone)
          .maybeSingle();

        if (existing) {
          const res = await supabase.from("leads")
            .update({ name, source, ...(targetYear ? { target_year: targetYear } : {}) })
            .eq("id", existing.id);
          upsertError = res.error;
        } else {
          const res = await supabase.from("leads").insert({
            phone_number: phone,
            name,
            source,
            ...(targetYear ? { target_year: targetYear } : {}),
          });
          upsertError = res.error;
        }
      }

      if (upsertError) {
        console.error("Lead upsert failed:", JSON.stringify(upsertError));
        toast.error("Something went wrong", { description: "Could not save phone number. Please try again." });
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
      trackFormSubmitConversion();
      toast.success("Phone number saved!", { description: "You're all set." });
      onOpenChange(false);
      setPhone("");
      setTargetYear("");
      setNameInput("");
      onSuccess?.();
    } catch {
      toast.error("Something went wrong", { description: "Please try again later." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle>{title || "One Last Step"}</DialogTitle>
          <DialogDescription>{description || "Share your phone number so we can personalize your experience."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2" data-track-conversion>
          {userName && (
            <div className="text-sm text-muted-foreground">
              Hi <span className="font-semibold text-foreground">{userName}</span> 👋
            </div>
          )}
          {showNameField && !userName && (
            <Input
              placeholder="Your Name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              required
              autoFocus
            />
          )}
          <Input
            placeholder="Phone Number (10 digits)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            required
            pattern="[6-9]\d{9}"
            title="Enter a valid 10-digit Indian mobile number"
            autoFocus={!showNameField || !!userName}
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
