import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const phoneCacheByUser = new Map<string, string | null>();
const inflightByUser = new Map<string, Promise<string | null>>();

function getStoredPhone(): string | null {
  const stored = localStorage.getItem("percentilers_phone");
  return stored && /^\d{10}$/.test(stored) ? stored : null;
}

/**
 * Check if the current authenticated user has a phone number in the leads table.
 * Returns { hasPhone, phone, loading, refetch }.
 */
export function useLeadPhone() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const userId = user?.id;
  // Resolve from cache synchronously to avoid flash
  const cachedPhone = userId ? (phoneCacheByUser.get(userId) ?? null) : getStoredPhone();
  const [phone, setPhone] = useState<string | null>(cachedPhone);
  const [loading, setLoading] = useState(!cachedPhone && (authLoading || (isAuthenticated && !!userId && !phoneCacheByUser.has(userId))));

  const fetchPhone = useCallback(async (force = false) => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated || !user?.id) {
      const stored = getStoredPhone();
      setPhone(stored);
      setLoading(false);
      return;
    }

    const userId = user.id;

    if (!force && phoneCacheByUser.has(userId)) {
      const cached = phoneCacheByUser.get(userId) ?? null;
      setPhone(cached);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let request = inflightByUser.get(userId);

      if (!request || force) {
        request = (async () => {
          const { data } = await supabase.from("leads")
            .select("phone_number")
            .eq("user_id", userId)
            .maybeSingle();

          const dbPhone = data?.phone_number || null;
          const storedPhone = getStoredPhone();
          const resolved = (dbPhone && /^\d{10}$/.test(dbPhone))
            ? dbPhone
            : storedPhone;

          // Sync localStorage phone to DB if DB record is missing it
          if (!dbPhone && storedPhone && userId) {
            supabase.from("leads").upsert(
              { user_id: userId, phone_number: storedPhone },
              { onConflict: "user_id" }
            ).catch(() => {});
          }

          phoneCacheByUser.set(userId, resolved);
          if (resolved) localStorage.setItem("percentilers_phone", resolved);
          return resolved;
        })();

        inflightByUser.set(userId, request);
      }

      const resolved = await request;
      setPhone(resolved);
    } catch {
      setPhone(getStoredPhone());
    } finally {
      inflightByUser.delete(userId);
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    fetchPhone();
  }, [fetchPhone]);

  return {
    hasPhone: !!phone,
    phone,
    loading,
    refetch: () => fetchPhone(true),
  };
}
