import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardPlanner from "@/components/dashboard/DashboardPlanner";
import BuddyMiniWidget from "@/components/buddy/BuddyMiniWidget";
import SprintBuddyView from "@/components/sprint/SprintBuddyView";

interface Props {
  plannerData: any;
  loadingPlanner: boolean;
  userId: string;
}

export default function PlanTab({ plannerData, loadingPlanner, userId }: Props) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        {/* Study Planner */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-2">Study Planner</h2>
          <DashboardPlanner data={plannerData} loading={loadingPlanner} />
        </section>

        {/* Study Buddy */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-2">Study Buddy</h2>
          <BuddyMiniWidget />
          <div className="mt-3">
            <SprintBuddyView userId={userId} />
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
