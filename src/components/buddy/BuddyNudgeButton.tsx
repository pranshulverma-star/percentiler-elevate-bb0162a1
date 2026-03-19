import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";
import { sendNudge } from "@/lib/buddy-utils";

interface Props {
  pairId: string;
  userId: string;
  buddyName: string;
  buddyIsActive: boolean;
}

export default function BuddyNudgeButton({ pairId, userId, buddyName, buddyIsActive }: Props) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (buddyIsActive || sent) return null;

  const handleNudge = async () => {
    setSending(true);
    try {
      await sendNudge(pairId, userId);
      setSent(true);
      toast.success(`Nudge sent! ${buddyName} will see a reminder next time they open the app. 💪`);
    } catch {
      toast.error("Failed to send nudge. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleNudge} disabled={sending} className="gap-2">
      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
      Send a Nudge to {buddyName}
    </Button>
  );
}
