import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Check if the current authenticated user has a phone number in the leads table.
 * Returns { hasPhone, phone, loading, refetch }.
 */
export function useLeadPhone() {
  const { user, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      // Check localStorage as fallback
      const stored = localStorage.getItem("percentilers_phone");
      setPhone(stored && /^\d{10}$/.test(stored) ? stored : null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data } = await (supabase.from("leads") as any)
      .select("phone_number")
      .eq("user_id", user.id)
      .maybeSingle();

    const dbPhone = data?.phone_number || null;
    const storedPhone = localStorage.getItem("percentilers_phone");
    const resolved = (dbPhone && /^\d{10}$/.test(dbPhone)) ? dbPhone : (storedPhone && /^\d{10}$/.test(storedPhone) ? storedPhone : null);
    
    setPhone(resolved);
    if (resolved) localStorage.setItem("percentilers_phone", resolved);
    setLoading(false);
  }, [isAuthenticated, user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { hasPhone: !!phone, phone, loading, refetch: fetch };
}
