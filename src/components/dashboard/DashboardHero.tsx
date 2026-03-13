import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Flame, TrendingUp, Pencil, Check, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  firstName: string;
  lead: { name: string | null; email: string | null; phone_number: string | null } | null;
  loadingLead: boolean;
  streakData: { currentStreak: number; recentTrend: "up" | "down" | "stable" } | null;
  onSignOut: () => void;
  onPhoneUpdated: () => void;
}

export default function DashboardHero({ firstName, lead, loadingLead, streakData, onSignOut, onPhoneUpdated }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const email = lead?.email || user?.email || "";
  const currentPhone = lead?.phone_number || "";
  const initials = firstName.charAt(0).toUpperCase();

  const handleSavePhone = async () => {
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    if (cleaned.length !== 10) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: existing } = await (supabase.from("leads") as any)
        .select("user_id")
        .eq("phone_number", cleaned)
        .neq("user_id", user!.id)
        .maybeSingle();
      if (existing) {
        toast({ title: "This phone number is already registered", variant: "destructive" });
        setSaving(false);
        return;
      }
      await (supabase.from("leads") as any)
        .update({ phone_number: cleaned })
        .eq("user_id", user!.id);
      localStorage.setItem("percentilers_phone", cleaned);
      toast({ title: "Phone number updated!" });
      setEditingPhone(false);
      onPhoneUpdated();
    } catch {
      toast({ title: "Failed to update phone", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-5 md:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30">
            <span className="text-lg font-bold text-primary">{initials}</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Hey {firstName} 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your CAT prep journey</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streakData && streakData.currentStreak > 0 && (
            <Badge variant="outline" className="gap-1 border-primary/20 text-primary">
              <Flame className="h-3 w-3" /> {streakData.currentStreak}
            </Badge>
          )}
          {streakData?.recentTrend === "up" && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
              <TrendingUp className="h-3 w-3" />
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={onSignOut} className="h-8 w-8 text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Inline profile info */}
      {loadingLead ? (
        <div className="mt-3 space-y-1.5">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{email}</span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {editingPhone ? (
              <span className="inline-flex items-center gap-1.5">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  className="h-6 text-xs w-28 px-2"
                  maxLength={10}
                />
                <button onClick={handleSavePhone} disabled={saving} className="text-primary hover:text-primary/80">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                {currentPhone ? `+91 ${currentPhone.slice(0, 5)} ${currentPhone.slice(5)}` : <span className="italic">Add phone</span>}
                <button onClick={() => { setPhone(currentPhone); setEditingPhone(true); }} className="text-primary hover:text-primary/80">
                  <Pencil className="h-3 w-3" />
                </button>
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
