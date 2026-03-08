import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedStrip from "@/components/FeaturedStrip";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";

// Lazy load below-the-fold sections
const TrustStrip = lazy(() => import("@/components/TrustStrip"));
const ResultsSection = lazy(() => import("@/components/ResultsSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FounderSection = lazy(() => import("@/components/FounderSection"));
const FacultySection = lazy(() => import("@/components/FacultySection"));
const PreparationPathSection = lazy(() => import("@/components/PreparationPathSection"));
const WebinarSection = lazy(() => import("@/components/WebinarSection"));
const CoursesSection = lazy(() => import("@/components/CoursesSection"));
const PercentilePlannerSection = lazy(() => import("@/components/PercentilePlannerSection"));
const FreeToolsSection = lazy(() => import("@/components/FreeToolsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const WhyDifferentSection = lazy(() => import("@/components/WhyDifferentSection"));
const FinalCTASection = lazy(() => import("@/components/FinalCTASection"));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton"));
const ScrollCTAPanel = lazy(() => import("@/components/ScrollCTAPanel"));

const LazyFallback = () => <div className="min-h-[200px]" />;

const Index = () => (
  <>
    <SEO
      title="Best CAT Coaching for 95+ Percentile | Percentilers"
      description="Join Percentilers for structured CAT 2026 preparation with expert mentorship, mock analysis, and a proven 95+ percentile strategy. Start your free masterclass today."
      canonical="https://percentilers.in/"
    />
    <Navbar />
    <main>
      {/* Act 1: Hook & Trust — above the fold, eagerly loaded */}
      <HeroSection />
      <FeaturedStrip />

      {/* Everything below is lazy loaded + error-bounded */}
      <SectionErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <PreparationPathSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <TrustStrip />
          <ResultsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <FreeToolsSection />
          <PercentilePlannerSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <TestimonialsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <WebinarSection />
          <CoursesSection />
          <FacultySection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <FounderSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary>
        <Suspense fallback={<LazyFallback />}>
          <WhyDifferentSection />
          <FAQSection />
          <FinalCTASection />
        </Suspense>
      </SectionErrorBoundary>
    </main>
    <Footer />
    <Suspense fallback={null}>
      <WhatsAppButton />
      <ScrollCTAPanel />
    </Suspense>
  </>
);

export default Index;
