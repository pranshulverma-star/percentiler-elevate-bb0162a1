import { useState } from "react";
import { Bookmark, BookmarkX, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Bookmark as BookmarkType } from "@/hooks/useBookmarks";

const sectionNames: Record<string, string> = { qa: "QA", lrdi: "LRDI", varc: "VARC" };
const sectionColors: Record<string, { bg: string; text: string }> = {
  qa: { bg: "rgba(255,102,0,0.1)", text: "#FF6600" },
  varc: { bg: "rgba(139,92,246,0.1)", text: "#8B5CF6" },
  lrdi: { bg: "rgba(16,185,129,0.1)", text: "#10B981" },
};

interface Props {
  bookmarks: BookmarkType[];
  loading: boolean;
  onRemove: (questionId: string) => void;
}

export default function DashboardBookmarks({ bookmarks, loading, onRemove }: Props) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const visibleBookmarks = expanded ? bookmarks : bookmarks.slice(0, 3);

  if (loading) {
    return (
      <div className="rounded-[20px] p-4" style={{ background: "#fff", border: "1px solid #F0EBE6" }}>
        <div className="flex items-center gap-2 mb-3">
          <Bookmark className="h-4 w-4" style={{ color: "#FF6600" }} />
          <span className="text-sm font-[800]" style={{ color: "#141414" }}>Bookmarks</span>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-14 bg-gray-100 rounded-xl" />
          <div className="h-14 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="rounded-[20px] p-5 text-center" style={{ background: "#fff", border: "1px solid #F0EBE6" }}>
        <Bookmark className="h-8 w-8 mx-auto mb-2" style={{ color: "#BFB3A8" }} />
        <p className="text-sm font-semibold" style={{ color: "#141414" }}>No bookmarks yet</p>
        <p className="text-[11px] mt-1" style={{ color: "#8C7A6B" }}>
          Tap the bookmark icon on any question to save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] p-4" style={{ background: "#fff", border: "1px solid #F0EBE6", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4" style={{ color: "#FF6600" }} />
          <span className="text-sm font-[800]" style={{ color: "#141414" }}>Bookmarks</span>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "#F5F0EB", color: "#8C7A6B" }}>
          {bookmarks.length} saved
        </span>
      </div>

      <div className="space-y-2">
        {visibleBookmarks.map((bm) => {
          const sc = sectionColors[bm.section_id] || sectionColors.qa;
          return (
            <div
              key={bm.id}
              className="rounded-[14px] p-3 flex items-start gap-2.5"
              style={{ background: "#FAFAFA", border: "1px solid #F0EBE6" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold leading-snug line-clamp-2" style={{ color: "#141414" }}>
                  {bm.question_text}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: sc.bg, color: sc.text }}
                  >
                    {sectionNames[bm.section_id] || bm.section_id.toUpperCase()}
                  </span>
                  <span className="text-[9px]" style={{ color: "#BFB3A8" }}>
                    {bm.chapter_slug.replace(/-/g, " ")}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => navigate(`/practice-lab`)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,102,0,0.1)" }}
                  title="Practice again"
                >
                  <RotateCcw className="h-3.5 w-3.5" style={{ color: "#FF6600" }} />
                </button>
                <button
                  onClick={() => onRemove(bm.question_id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: "rgba(239,68,68,0.1)" }}
                  title="Remove bookmark"
                >
                  <BookmarkX className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {bookmarks.length > 3 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full mt-2 flex items-center justify-center gap-1 text-[11px] font-bold py-2 rounded-xl transition-colors"
          style={{ color: "#FF6600", background: "rgba(255,102,0,0.05)" }}
        >
          {expanded ? <>Show less <ChevronUp className="h-3.5 w-3.5" /></> : <>Show all {bookmarks.length} <ChevronDown className="h-3.5 w-3.5" /></>}
        </button>
      )}
    </div>
  );
}
