import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedStrip from "@/components/FeaturedStrip";
import TrustStrip from "@/components/TrustStrip";
import ResultsSection from "@/components/ResultsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FounderSection from "@/components/FounderSection";
import FacultySection from "@/components/FacultySection";
import PreparationPathSection from "@/components/PreparationPathSection";
import WebinarSection from "@/components/WebinarSection";
import CoursesSection from "@/components/CoursesSection";
import PercentilePlannerSection from "@/components/PercentilePlannerSection";
import FreeToolsSection from "@/components/FreeToolsSection";
import FAQSection from "@/components/FAQSection";
import FinalCTASection from "@/components/FinalCTASection";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollCTAPanel from "@/components/ScrollCTAPanel";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Footer from "@/components/Footer";

const Index = () => (
  <>
    <Navbar />
    <ScrollProgressBar />
    <main>
      {/* Act 1: Hook & Trust */}
      <HeroSection />
      <FeaturedStrip />
      <TrustStrip />

      {/* Act 2: Proof */}
      <ResultsSection />
      <TestimonialsSection />

      {/* Act 3: The Guide */}
      <FounderSection />
      <FacultySection />

      {/* Act 4: Your Path */}
      <PreparationPathSection />
      <WebinarSection />
      <CoursesSection />
      <PercentilePlannerSection />
      <FreeToolsSection />

      {/* Act 5: Close */}
      <FAQSection />
      <FinalCTASection />
    </main>
    <Footer />
    <WhatsAppButton />
    <ScrollCTAPanel />
  </>
);

export default Index;
