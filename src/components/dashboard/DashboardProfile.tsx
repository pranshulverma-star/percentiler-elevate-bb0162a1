import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, Pencil, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  lead: { name: string | null; email: string | null; phone_number: string | null } | null;
  loading: boolean;
  onPhoneUpdated: () => void;
}

export default function DashboardProfile({ lead, loading, onPhoneUpdated }: Props) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const name = lead?.name || user?.user_metadata?.full_name || "Student";
  const email = lead?.email || user?.email || "";
  const currentPhone = lead?.phone_number || "";

  const handleSavePhone = async () => {
    const cleaned = phone.replace(/\D/g, "").slice(-10);
    if (cleaned.length !== 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setSaving(true);
    try {
      // Check if phone belongs to another user
      const { data: existing } = await supabase.from("leads")
        .select("user_id")
        .eq("phone_number", cleaned)
        .neq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        toast.error("This phone number is already registered", { description: "Please use a different number or log in with the linked Gmail." });
        setSaving(false);
        return;
      }

      await supabase.from("leads")
        .update({ phone_number: cleaned })
        .eq("user_id", user!.id);

      localStorage.setItem("percentilers_phone", cleaned);
      toast.success("Phone number updated!");
      setEditing(false);
      onPhoneUpdated();
    } catch {
      toast.error("Failed to update phone");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" /> Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {editing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                className="h-8 text-sm"
                maxLength={10}
              />
              <Button size="sm" onClick={handleSavePhone} disabled={saving} className="h-8 px-2">
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className={currentPhone ? "text-foreground" : "text-muted-foreground italic"}>
                {currentPhone ? `+91 ${currentPhone.slice(0, 5)} ${currentPhone.slice(5)}` : "Not added yet"}
              </span>
              <button onClick={() => { setPhone(currentPhone); setEditing(true); }} className="text-primary hover:text-primary/80">
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
