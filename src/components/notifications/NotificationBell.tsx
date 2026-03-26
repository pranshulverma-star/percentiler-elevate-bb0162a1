import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

const TYPE_COLORS: Record<string, string> = {
  info: "#3B82F6",
  success: "#22C55E",
  warning: "#F59E0B",
  alert: "#EF4444",
  welcome: "#FF6600",
};

interface Props {
  userId: string | undefined;
}

export default function NotificationBell({ userId }: Props) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);
  const navigate = useNavigate();

  const handleClickNotification = (n: Notification) => {
    markAsRead(n.id);
    navigate(n.action_url ?? "/dashboard");
  };

  const preview = notifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-black/5"
          aria-label="Notifications"
          style={{ color: "#141414" }}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold"
              style={{
                background: "#FF6600",
                fontSize: "9px",
                minWidth: "16px",
                height: "16px",
                padding: "0 3px",
                lineHeight: "16px",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="p-0 rounded-xl shadow-xl border"
        style={{
          width: "380px",
          background: "#FFFFFF",
          borderColor: "#F0EBE6",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "#F0EBE6" }}
        >
          <span className="text-sm font-bold" style={{ color: "#141414" }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: "#FF6600" }}
            >
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
          {preview.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <span className="text-2xl">🎉</span>
              <span className="text-sm font-medium" style={{ color: "#BFB3A8" }}>
                You're all caught up!
              </span>
            </div>
          ) : (
            preview.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClickNotification(n)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary cursor-pointer border-b last:border-b-0"
                style={{
                  borderColor: "#F0EBE6",
                  background: n.is_read ? "transparent" : "rgba(255,102,0,0.04)",
                }}
              >
                {/* Colored dot */}
                <span
                  className="mt-1.5 flex-shrink-0 rounded-full"
                  style={{
                    width: "8px",
                    height: "8px",
                    background: TYPE_COLORS[n.type] ?? "#6B7280",
                    boxShadow: n.is_read ? "none" : `0 0 0 3px ${TYPE_COLORS[n.type] ?? "#6B7280"}22`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#141414" }}
                  >
                    {n.title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#6B7280" }}
                  >
                    {n.body}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "#BFB3A8" }}>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer — View all */}
        {notifications.length > 5 && (
          <div className="border-t px-4 py-2.5" style={{ borderColor: "#F0EBE6" }}>
            <button
              className="text-xs font-semibold w-full text-center transition-colors hover:opacity-80"
              style={{ color: "#FF6600" }}
              onClick={() => navigate("/dashboard")}
            >
              View all notifications
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
