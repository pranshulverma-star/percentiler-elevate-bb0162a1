import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLeadModal } from "@/components/LeadModalProvider";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  campaign: { call_booked_at: string | null; converted_at: string | null; workflow_status: string | null } | null;
  loading: boolean;
}

export default function DashboardCallCTA({ campaign, loading }: Props) {
  const { openPhoneModal } = useLeadModal();
  const [showDialog, setShowDialog] = useState(false);

  const markHotAndShow = (phone: string) => {
    supabase.functions.invoke("mark-lead-hot", {
      body: { phone_number: phone, source: "dashboard_strategy_call", name: localStorage.getItem("percentilers_name") || null },
    }).catch(() => {});
    setShowDialog(true);
  };

  const handleBook = () => {
    const phone = localStorage.getItem("percentilers_phone") || "";
    if (phone) {
      markHotAndShow(phone);
    } else {
      openPhoneModal("dashboard_strategy_call", () => {
        const newPhone = localStorage.getItem("percentilers_phone") || "";
        if (newPhone) markHotAndShow(newPhone);
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-16 w-full" /></CardContent>
      </Card>
    );
  }

  const booked = !!campaign?.call_booked_at;
  const converted = !!campaign?.converted_at;

  return (
    <>
      <Card className={converted ? "border-green-500/30" : "border-primary/20"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> Strategy Call
            </span>
            {converted && <Badge className="bg-green-600 text-white">Enrolled ✅</Badge>}
            {booked && !converted && <Badge variant="outline" className="text-primary border-primary">Call Booked</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {converted ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>You're enrolled in the 95%ile Guarantee Batch!</span>
            </div>
          ) : booked ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Our counselor will reach out shortly. Want to call now?</p>
              <Button asChild size="sm" className="w-full">
                <a href="tel:+919911928071"><Phone className="mr-2 h-4 w-4" /> Call Now — +91 99119 28071</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Get a free 1-on-1 strategy session for your CAT prep.</p>
              <Button onClick={handleBook} className="w-full bg-gradient-to-r from-primary to-[hsl(35,100%,50%)] shadow-lg shadow-primary/20">
                <Phone className="mr-2 h-4 w-4" /> Book Free Strategy Call
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogTitle className="sr-only">Call Booked</DialogTitle>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
              <Phone className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">You're In! 🎉</h3>
            <p className="text-muted-foreground text-sm">Our counselor will connect with you shortly.</p>
            <Button size="lg" className="w-full" asChild>
              <a href="tel:+919911928071"><Phone className="mr-2 h-4 w-4" /> Call Now — +91 99119 28071</a>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowDialog(false)}>I'll wait for the call</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
