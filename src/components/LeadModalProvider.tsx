import { useState, createContext, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LeadModalContextType {
  openContentGate: (source: string, onSuccess?: () => void) => void;
  openPhoneModal: (source: string, onSuccess?: () => void) => void;
  /** @deprecated Use openContentGate or openPhoneModal instead */
  openModal: (source: string, onSuccess?: () => void) => void;
}

const LeadModalContext = createContext<LeadModalContextType>({
  openContentGate: () => {},
  openPhoneModal: () => {},
  openModal: () => {},
});

export const useLeadModal = () => useContext(LeadModalContext);

export const LeadModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [source, setSource] = useState("");
  const [onSuccessCb, setOnSuccessCb] = useState<(() => void) | null>(null);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, signIn } = useAuth();

  // Content gate: just triggers Google sign-in if not authenticated
  const openContentGate = async (src: string, onSuccess?: () => void) => {
    if (isAuthenticated) {
      // Already signed in — update source and proceed
      if (user?.email) {
        (supabase.from("leads") as any).upsert(
          { email: user.email, name: user.user_metadata?.full_name || null, source: src },
          { onConflict: "email" }
        );
      }
      onSuccess?.();
      return;
    }

    // Store callback info for after redirect
    sessionStorage.setItem("pending_gate_source", src);
    if (onSuccess) {
      // Store the intended destination for post-auth redirect
      const destination = extractDestination(onSuccess);
      if (destination) sessionStorage.setItem("pending_gate_redirect", destination);
    }

    await signIn();
  };

  // Phone modal: shows single-field phone form for call/apply CTAs
  const openPhoneModal = (src: string, onSuccess?: () => void) => {
    // Check if phone already stored
    const storedPhone = localStorage.getItem("percentilers_phone") || "";
    if (/^\d{10}$/.test(storedPhone)) {
      // Phone already on file
      if (user?.email) {
        (supabase.from("leads") as any).upsert(
          { email: user.email, phone_number: storedPhone, source: src },
          { onConflict: "email" }
        );
      } else {
        supabase.from("leads").upsert(
          { phone_number: storedPhone, source: src },
          { onConflict: "phone_number" }
        );
      }
      onSuccess?.();
      return;
    }

    setSource(src);
    setOnSuccessCb(() => onSuccess || null);
    setPhone("");
    setPhoneOpen(true);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
      return;
    }
    if (!/^[6-9]/.test(phone)) {
      toast({ title: "Invalid phone number", description: "Indian mobile numbers start with 6-9.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const email = user?.email || null;
      const name = user?.user_metadata?.full_name || localStorage.getItem("percentilers_name") || null;

      if (email) {
        // Link phone to existing email-based lead
        await (supabase.from("leads") as any).upsert(
          { email, phone_number: phone, name, source },
          { onConflict: "email" }
        );
      } else {
        await supabase.from("leads").upsert(
          { phone_number: phone, name, source },
          { onConflict: "phone_number" }
        );
      }

      localStorage.setItem("percentilers_phone", phone);
      toast({ title: "Phone number saved!", description: "Our team will reach out to you shortly." });
      setPhoneOpen(false);
      setPhone("");
      onSuccessCb?.();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Backward compat — defaults to content gate behavior
  const openModal = openContentGate;

  const userName = user?.user_metadata?.full_name || localStorage.getItem("percentilers_name") || "";

  return (
    <LeadModalContext.Provider value={{ openContentGate, openPhoneModal, openModal }}>
      {children}
      <Dialog open={phoneOpen} onOpenChange={setPhoneOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>One Last Step</DialogTitle>
            <DialogDescription>Share your phone number so our team can connect with you.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePhoneSubmit} className="space-y-4 mt-2">
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
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </LeadModalContext.Provider>
  );
};

// Helper to extract destination URL from onSuccess callback
function extractDestination(fn: () => void): string | null {
  const str = fn.toString();
  const match = str.match(/location\.href\s*=\s*["']([^"']+)["']/);
  return match?.[1] || null;
}
