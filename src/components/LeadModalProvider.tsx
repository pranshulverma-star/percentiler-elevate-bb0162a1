import { useState, useEffect, createContext, useContext } from "react";
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
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, signIn } = useAuth();

  // Content gate: just triggers Google sign-in if not authenticated
  const openContentGate = (src: string, onSuccess?: () => void) => {
    if (isAuthenticated) {
      if (user?.id) {
        (supabase.from("leads") as any).upsert(
          { user_id: user.id, email: user.email, name: user.user_metadata?.full_name || null, source: src },
          { onConflict: "user_id" }
        ).then(() => {}).catch(() => {});
      }
      onSuccess?.();
      return;
    }

    // Store callback info for after redirect
    sessionStorage.setItem("pending_gate_source", src);
    if (onSuccess) {
      const destination = extractDestination(onSuccess);
      if (destination) sessionStorage.setItem("pending_gate_redirect", destination);
    }

    signIn();
  };

  // Handle post-auth redirect for content gate
  useEffect(() => {
    if (!isAuthenticated) return;
    const pendingSource = sessionStorage.getItem("pending_gate_source");
    if (pendingSource) {
      sessionStorage.removeItem("pending_gate_source");
      if (user?.id) {
        (supabase.from("leads") as any).upsert(
          { user_id: user.id, email: user.email, name: user.user_metadata?.full_name || null, source: pendingSource },
          { onConflict: "user_id" }
        );
      }
      const redirect = sessionStorage.getItem("pending_gate_redirect");
      if (redirect) {
        sessionStorage.removeItem("pending_gate_redirect");
        window.location.href = redirect;
      }
    }
  }, [isAuthenticated, user]);

  // Phone modal: shows single-field phone form for call/apply CTAs
  const openPhoneModal = (src: string, onSuccess?: () => void) => {
    // Check if phone already stored
    const storedPhone = localStorage.getItem("percentilers_phone") || "";
    if (/^\d{10}$/.test(storedPhone)) {
      if (user?.id) {
        (supabase.from("leads") as any).upsert(
          { user_id: user.id, email: user.email, phone_number: storedPhone, source: src },
          { onConflict: "user_id" }
        ).then(() => {}).catch(() => {});
      }
      onSuccess?.();
      return;
    }

    setSource(src);
    setOnSuccessCb(() => onSuccess || null);
    setPhone("");
    setNameInput("");
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
      const name = nameInput || user?.user_metadata?.full_name || localStorage.getItem("percentilers_name") || null;
      if (nameInput) localStorage.setItem("percentilers_name", nameInput);

      if (user?.id) {
        await (supabase.from("leads") as any).upsert(
          { user_id: user.id, email: email, phone_number: phone, name, source },
          { onConflict: "user_id" }
        );
      } else {
        await supabase.from("leads").upsert(
          { phone_number: phone, name, source },
          { onConflict: "phone_number" }
        );
      }

      localStorage.setItem("percentilers_phone", phone);
      // Fire-and-forget: sync to Google Sheet
      supabase.functions.invoke("sync-lead-to-sheet", {
        body: { phone_number: phone, email, source },
      }).catch(() => {});
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
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl p-5 sm:p-6">
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
            {!userName && (
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
              autoFocus={!!userName}
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
