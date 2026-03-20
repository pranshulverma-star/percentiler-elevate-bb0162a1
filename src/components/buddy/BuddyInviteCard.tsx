import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Share2, Loader2, UserPlus } from "lucide-react";
import { createInvite, getPendingInvite, getInviteByCode, acceptInvite, type BuddyInvite } from "@/lib/buddy-utils";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Props {
  userId: string;
  userName: string | null;
  pendingInvite: BuddyInvite | null;
  onPaired: () => void;
}

export default function BuddyInviteCard({ userId, userName, pendingInvite, onPaired }: Props) {
  const [invite, setInvite] = useState<BuddyInvite | null>(pendingInvite);
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Use a ref so the realtime callback always calls the latest onPaired
  const onPairedRef = useRef(onPaired);
  useEffect(() => { onPairedRef.current = onPaired; }, [onPaired]);

  // Realtime listener: auto-detect when buddy accepts the invite
  useEffect(() => {
    if (!invite?.invite_code) return;
    const channel = supabase
      .channel(`invite:${invite.invite_code}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "buddy_invites",
          filter: `invite_code=eq.${invite.invite_code}`,
        },
        (payload) => {
          const newRow = payload.new as { status?: string };
          if (newRow.status === "accepted") {
            toast.success("Your buddy joined! 🎉");
            stableOnPaired();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invite?.invite_code, stableOnPaired]);

  const handleGenerate = async () => {
    setCreating(true);
    try {
      // Check if there's already a pending invite
      const existing = await getPendingInvite(userId);
      if (existing) {
        setInvite(existing);
        setCreating(false);
        return;
      }
      const code = await createInvite(userId, userName);
      setInvite({ id: "", invite_code: code, inviter_id: userId, inviter_name: userName, status: "pending", expires_at: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create invite");
    } finally {
      setCreating(false);
    }
  };

  const inviteUrl = invite ? `${window.location.origin}/study-buddy?invite=${invite.invite_code}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Link copied!");
  };

  const handleWhatsApp = () => {
    const text = `Hey! Let's prepare for CAT together on Percentilers. Join as my study buddy: ${inviteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const inv = await getInviteByCode(joinCode.trim());
      if (!inv) {
        toast.error("Invalid invite code. Please check and try again.");
        return;
      }
      if (inv.status !== "pending") {
        toast.error("This invite has expired or was already used.");
        return;
      }
      if (new Date(inv.expires_at) < new Date()) {
        toast.error("This invite has expired. Ask your friend for a new link.");
        return;
      }
      await acceptInvite(inv, userId, userName);
      toast.success("You're now study buddies! 🎉");
      onPaired();
    } catch (err: any) {
      toast.error(err.message || "Failed to join");
    } finally {
      setJoining(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-primary/20 bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Invite a Study Buddy</h2>
            <p className="text-sm text-muted-foreground">Share the link with a friend to start tracking progress together.</p>
          </div>

          {!invite ? (
            <Button onClick={handleGenerate} disabled={creating} className="w-full" size="lg">
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Invite Link
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-3">
                <code className="flex-1 text-sm font-mono text-foreground truncate">{invite.invite_code}</code>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleCopy} className="gap-2">
                  <Copy className="h-4 w-4" /> Copy Link
                </Button>
                <Button onClick={handleWhatsApp} className="gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                  <Share2 className="h-4 w-4" /> WhatsApp
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">Waiting for your buddy to join…</p>
              <div className="flex justify-center">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-sm font-medium text-foreground text-center">Have an invite code?</p>
            <div className="flex gap-2">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                maxLength={8}
                className="font-mono tracking-wider text-center"
              />
              <Button onClick={handleJoin} disabled={joining || !joinCode.trim()}>
                {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
