import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import { formatDistanceToNow, isToday, isThisWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean | null;
  action_url: string | null;
  created_at: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  info: "#3B82F6",
  success: "#22C55E",
  warning: "#F59E0B",
  alert: "#EF4444",
  welcome: "#FF6600",
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x));
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    if (n.action_url && n.action_url.startsWith("/")) {
      navigate(n.action_url);
    } else if (n.action_url && n.action_url.startsWith("http")) {
      window.open(n.action_url, "_blank");
    }
  };

  const grouped = (() => {
    const today: Notification[] = [];
    const week: Notification[] = [];
    const earlier: Notification[] = [];
    for (const n of notifications) {
      const d = n.created_at ? new Date(n.created_at) : new Date(0);
      if (isToday(d)) today.push(n);
      else if (isThisWeek(d, { weekStartsOn: 1 })) week.push(n);
      else earlier.push(n);
    }
    return [
      { label: "Today", items: today },
      { label: "This week", items: week },
      { label: "Earlier", items: earlier },
    ].filter((g) => g.items.length > 0);
  })();

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b" style={{ background: "#FFFFFF", borderColor: "#F0EBE6" }}>
        <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))} className="p-1.5 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5" style={{ color: "#141414" }} />
        </button>
        <span className="text-base font-bold" style={{ color: "#141414" }}>Notifications</span>
      </div>

      <div className="max-w-[480px] mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: "#FF6600", borderTopColor: "transparent" }} />
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Bell className="w-10 h-10" style={{ color: "#BFB3A8" }} />
            <span className="text-sm font-medium" style={{ color: "#BFB3A8" }}>You're all caught up!</span>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#BFB3A8" }}>{group.label}</p>
              <div className="flex flex-col gap-2">
                {group.items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-white border"
                    style={{
                      borderColor: "#F0EBE6",
                      background: n.is_read ? "#FFFFFF" : "rgba(255,102,0,0.04)",
                      cursor: n.action_url ? "pointer" : "default",
                    }}
                  >
                    <span
                      className="mt-1.5 flex-shrink-0 rounded-full"
                      style={{
                        width: "8px",
                        height: "8px",
                        background: n.is_read ? "#D1D5DB" : (TYPE_COLORS[n.type] ?? "#6B7280"),
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "#141414" }}>{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{n.body}</p>
                      {n.created_at && (
                        <p className="text-[10px] mt-1" style={{ color: "#BFB3A8" }}>
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
