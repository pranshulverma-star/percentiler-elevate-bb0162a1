import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export default function DashboardLevelUp() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/15 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Book Strategy Call</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">1-1 Session for your CAT Prep</p>
        </div>
        <Button onClick={() => navigate("/mentorship")} size="sm" className="h-8 text-xs shrink-0 shadow-sm shadow-primary/20">
          <Rocket className="mr-1 h-3 w-3" /> Book Now
        </Button>
      </div>
    </div>
  );
}
