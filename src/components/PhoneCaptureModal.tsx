import { useState } from "react";
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
}

export default function PhoneCaptureModal({ open, onOpenChange, source, onSuccess }: PhoneCaptureModalProps) {
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

      await (supabase.from("leads") as any).upsert(
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

      localStorage.setItem("percentilers_phone", phone);
      if (name) localStorage.setItem("percentilers_name", name);

      // Sync to Google Sheet (fire-and-forget)
      supabase.functions.invoke("sync-lead-to-sheet", {
        body: { phone_number: phone, email, source },
      }).catch(() => {});

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>One Last Step</DialogTitle>
          <DialogDescription>Share your phone number so we can personalize your experience.</DialogDescription>
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
