import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLeadModal } from "@/components/LeadModalProvider";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import WorkshopRecommendation, { getWeakSectionWorkshop } from "@/components/WorkshopRecommendation";

interface Props {
  campaign: { call_booked_at: string | null; converted_at: string | null; workflow_status: string | null } | null;
  loadingCampaign: boolean;
  practiceAttempts: any[];
}

export default function DashboardLevelUp({ campaign, loadingCampaign, practiceAttempts }: Props) {
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

  const booked = !!campaign?.call_booked_at;
  const converted = !!campaign?.converted_at;
  const weakWorkshop = getWeakSectionWorkshop(practiceAttempts);

  return (
    <div className="space-y-4">
      {/* Strategy Call Banner */}
      {loadingCampaign ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : converted ? (
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span className="text-sm text-emerald-600 font-medium">Enrolled in the 95%ile Guarantee Batch!</span>
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/15 p-4">
          {booked ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Counselor will reach out shortly</p>
              <Button asChild size="sm" className="h-7 text-xs shrink-0">
                <a href="tel:+919911928071"><Phone className="mr-1 h-3 w-3" /> Call Now</a>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Free Strategy Call</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">1-on-1 session for your CAT prep</p>
              </div>
              <Button onClick={handleBook} size="sm" className="h-8 text-xs shrink-0 shadow-sm shadow-primary/20">
                <Phone className="mr-1 h-3 w-3" /> Book Free
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Workshop recommendation */}
      {weakWorkshop && (
        <WorkshopRecommendation
          workshops={[weakWorkshop]}
          title="Improve Your Weak Area"
          subtitle="Based on your practice history:"
        />
      )}

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
    </div>
  );
}
