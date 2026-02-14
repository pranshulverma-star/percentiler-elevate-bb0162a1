import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LeadModalProvider } from "@/components/LeadModalProvider";
import Index from "./pages/Index";
import Masterclass from "./pages/Masterclass";
import MasterclassWatch from "./pages/MasterclassWatch";
import CATReadinessAssessment from "./pages/CATReadinessAssessment";
import CATDailyStudyPlanner from "./pages/CATDailyStudyPlanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LeadModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/masterclass" element={<Masterclass />} />
            <Route path="/masterclass/watch" element={<MasterclassWatch />} />
            <Route path="/free-cat-readiness-assessment" element={<CATReadinessAssessment />} />
            <Route path="/cat-daily-study-planner" element={<CATDailyStudyPlanner />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LeadModalProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
