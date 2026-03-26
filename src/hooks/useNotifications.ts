import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "alert";
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const { data, error } = await (supabase.from("notifications") as any)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) {
      setNotifications(data as Notification[]);
    }
    setIsLoading(false);
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const incoming = payload.new as Notification;
          setNotifications((prev) => [incoming, ...prev].slice(0, 20));

          // Fire Sonner toast for new notification
          const toastFn =
            incoming.type === "success"
              ? toast.success
              : incoming.type === "warning" || incoming.type === "alert"
              ? toast.error
              : toast;
          toastFn(incoming.title, {
            description: incoming.body,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      await (supabase.from("notifications") as any)
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);
    },
    [userId]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await (supabase.from("notifications") as any)
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  }, [userId]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, isLoading };
}
