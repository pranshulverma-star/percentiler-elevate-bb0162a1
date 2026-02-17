import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedStrip from "@/components/FeaturedStrip";
import TrustStrip from "@/components/TrustStrip";
import WhyAspirantsFailSection from "@/components/WhyAspirantsFailSection";
import PreparationPathSection from "@/components/PreparationPathSection";
import ProvenCoachingSection from "@/components/ProvenCoachingSection";
import ResultsSection from "@/components/ResultsSection";
import FreeToolsSection from "@/components/FreeToolsSection";
import PercentilePlannerSection from "@/components/PercentilePlannerSection";
import FrameworkSection from "@/components/FrameworkSection";
import WorkingProfessionalsSection from "@/components/WorkingProfessionalsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import GuaranteeTrackSection from "@/components/GuaranteeTrackSection";
import WebinarSection from "@/components/WebinarSection";
import CoursesSection from "@/components/CoursesSection";
import FacultySection from "@/components/FacultySection";
import FounderSection from "@/components/FounderSection";
import FAQSection from "@/components/FAQSection";
import FinalCTASection from "@/components/FinalCTASection";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollCTAPanel from "@/components/ScrollCTAPanel";
import Footer from "@/components/Footer";

const Index = () => (
  <>
    <Navbar />
    
    <main>
      {/* Act 1: Hook & Trust */}
      <HeroSection />
      <FeaturedStrip />
      <TrustStrip />

      {/* Act 2: Problem & Solution */}
      <WhyAspirantsFailSection />
      <PreparationPathSection />

      {/* Act 3: Proven Results */}
      <ProvenCoachingSection />
      <ResultsSection />

      {/* Act 4: Free Tools */}
      <FreeToolsSection />
      <PercentilePlannerSection />

      {/* Act 5: Framework & Audience */}
      <FrameworkSection />
      <WorkingProfessionalsSection />

      {/* Act 6: Social Proof */}
      <TestimonialsSection />

      {/* Act 7: Flagship & Courses */}
      <GuaranteeTrackSection />
      <WebinarSection />
      <CoursesSection />
      <FacultySection />

      {/* Act 8: Story */}
      <FounderSection />

      {/* Act 9: Close */}
      <FAQSection />
      <FinalCTASection />
    </main>
    <Footer />
    <WhatsAppButton />
    <ScrollCTAPanel />
  </>
);

export default Index;
