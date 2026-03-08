import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LeadModalProvider } from "@/components/LeadModalProvider";
import { HelmetProvider } from "react-helmet-async";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";

function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);
  return null;
}

// Eagerly load homepage
import Index from "./pages/Index";

// Eagerly load high-traffic landing pages to prevent flash
import CATCoachingComparison from "./pages/CATCoachingComparison";

// Lazy load all other routes
const Masterclass = lazy(() => import("./pages/Masterclass"));
const MentorshipPage = lazy(() => import("./pages/Mentorship"));
const MasterclassWatch = lazy(() => import("./pages/MasterclassWatch"));
const CATReadinessAssessment = lazy(() => import("./pages/CATReadinessAssessment"));
const CATDailyStudyPlanner = lazy(() => import("./pages/CATDailyStudyPlanner"));
const CATOMETCourses = lazy(() => import("./pages/CATOMETCourses"));
const FreeCourses = lazy(() => import("./pages/FreeCourses"));
const TestSeries = lazy(() => import("./pages/TestSeries"));
const PracticeLab = lazy(() => import("./pages/PracticeLab"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LeadModalProvider>
            <BrowserRouter>
              <ScrollToHash />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/masterclass" element={<Masterclass />} />
                  <Route path="/mentorship" element={<MentorshipPage />} />
                  <Route path="/masterclass/watch" element={<ProtectedRoute requirePhone source="masterclass"><MasterclassWatch /></ProtectedRoute>} />
                  <Route path="/free-cat-readiness-assessment" element={<CATReadinessAssessment />} />
                  <Route path="/cat-daily-study-planner" element={<CATDailyStudyPlanner />} />
                  <Route path="/courses/cat-omet" element={<CATOMETCourses />} />
                  <Route path="/free-courses" element={<FreeCourses />} />
                  <Route path="/test-series" element={<TestSeries />} />
                  <Route path="/practice-lab" element={<ProtectedRoute requirePhone source="practice-lab"><PracticeLab /></ProtectedRoute>} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cat-coaching-comparison" element={<CATCoachingComparison />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </LeadModalProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </HelmetProvider>
);

export default App;
