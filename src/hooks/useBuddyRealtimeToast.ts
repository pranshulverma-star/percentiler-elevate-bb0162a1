import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Subscribes to realtime updates on daily_sprint_goals for a buddy.
 * Shows a toast when the buddy completes a goal.
 */
export function useBuddyRealtimeToast(buddyId: string | null, buddyName: string) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!buddyId) return;

    const channel = supabase
      .channel(`buddy-goals-${buddyId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "daily_sprint_goals",
          filter: `user_id=eq.${buddyId}`,
        },
        (payload) => {
          const newRow = payload.new as { completed?: boolean; description?: string };
          const oldRow = payload.old as { completed?: boolean };
          // Only fire when goal transitions from incomplete → complete
          if (newRow.completed && !oldRow.completed) {
            toast.success(`${buddyName} just completed: "${newRow.description || "a goal"}" 🔥`, {
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buddyId, buddyName]);
}
