import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";

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

  // Handle post-auth lead upsert (no redirect — ProtectedRoute handles that)
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
      // Do NOT handle pending_gate_redirect here — ProtectedRoute does it
    }
  }, [isAuthenticated, user]);

  // Phone modal: delegates to PhoneCaptureModal
  const openPhoneModal = (src: string, onSuccess?: () => void) => {
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
    setPhoneOpen(true);
  };

  // Backward compat — defaults to content gate behavior
  const openModal = openContentGate;

  return (
    <LeadModalContext.Provider value={{ openContentGate, openPhoneModal, openModal }}>
      {children}
      <PhoneCaptureModal
        open={phoneOpen}
        onOpenChange={setPhoneOpen}
        source={source}
        onSuccess={onSuccessCb}
        showNameField
        title="One Last Step"
        description="Share your phone number so our team can connect with you."
      />
    </LeadModalContext.Provider>
  );
};

// Helper to extract destination URL from onSuccess callback
function extractDestination(fn: () => void): string | null {
  const str = fn.toString();
  const match = str.match(/location\.href\s*=\s*["']([^"']+)["']/);
  return match?.[1] || null;
}
