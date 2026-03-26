import NotFoundRedirect from "@/components/NotFoundRedirect";
import { useEffect, lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LeadModalProvider } from "@/components/LeadModalProvider";
import { HelmetProvider } from "react-helmet-async";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      // Retry scrolling until the target element is rendered (handles lazy-loaded sections)
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          clearInterval(interval);
        } else if (++attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 150);
      return () => clearInterval(interval);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);
  return null;
}

// Eagerly load homepage
import Index from "./pages/Index";

const CATCoachingComparison = lazy(() => import("./pages/CATCoachingComparison"));

// Lazy load all other routes
const Masterclass = lazy(() => import("./pages/Masterclass"));
const MentorshipPage = lazy(() => import("./pages/Mentorship"));
const MasterclassWatch = lazy(() => import("./pages/MasterclassWatch"));
const CATReadinessAssessment = lazy(() => import("./pages/CATReadinessAssessment"));
const CATDailyStudyPlanner = lazy(() => import("./pages/CATDailyStudyPlanner"));
const CATOMETCourses = lazy(() => import("./pages/CATOMETCourses"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const FreeCourses = lazy(() => import("./pages/FreeCourses"));
const TestSeries = lazy(() => import("./pages/TestSeries"));
const Workshops = lazy(() => import("./pages/Workshops"));
const PracticeLab = lazy(() => import("./pages/PracticeLab"));
const BattleRoom = lazy(() => import("./pages/BattleRoom"));
const StudyBuddy = lazy(() => import("./pages/StudyBuddy"));
const DailySprint = lazy(() => import("./pages/DailySprint"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const AuthError = lazy(() => import("./pages/AuthError"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogListing = lazy(() => import("./pages/BlogListing"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // cache results for 60s — reduces redundant refetches
      retry: 1,          // one retry on failure (Supabase flakiness), not three
    },
  },
});

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
          <Sonner />
          <LeadModalProvider>
            <BrowserRouter>
              <ScrollToHash />
              <Suspense fallback={<PageLoader />}>
              <Routes>
                  <Route path="/~oauth" element={<PageLoader />} />
                  <Route path="/~oauth/*" element={<PageLoader />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/masterclass" element={<Masterclass />} />
                  <Route path="/mentorship" element={<MentorshipPage />} />
                  <Route
                    path="/masterclass/watch"
                    element={
                      <ProtectedRoute requirePhone source="masterclass">
                        <MasterclassWatch />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute source="dashboard">
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/free-cat-readiness-assessment" element={<CATReadinessAssessment />} />
                  <Route path="/cat-daily-study-planner" element={<CATDailyStudyPlanner />} />
                  <Route path="/courses/cat-omet" element={<CATOMETCourses />} />
                  <Route path="/free-courses" element={<FreeCourses />} />
                  <Route path="/test-series" element={<TestSeries />} />
                  <Route path="/workshops" element={<Workshops />} />
                  <Route path="/practice-lab" element={<PracticeLab />} />
                  <Route path="/practice-lab/battle/:code" element={<BattleRoom />} />
                  <Route path="/study-buddy" element={<StudyBuddy />} />
                  <Route path="/daily-sprint" element={<DailySprint />} />
                  <Route path="/flashcards" element={<Flashcards />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cat-coaching-comparison" element={<CATCoachingComparison />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute source="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/auth/error" element={<AuthError />} />
                  <Route path="/blog" element={<BlogListing />} />
                  <Route path="/blogs" element={<BlogListing />} />
                  <Route path="/:slug" element={<BlogPost />} />
                  <Route path="*" element={<NotFoundRedirect />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <PWAInstallPrompt />
          </LeadModalProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </HelmetProvider>
);

export default App;
