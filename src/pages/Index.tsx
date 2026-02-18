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
import WhyDifferentSection from "@/components/WhyDifferentSection";
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

      {/* Act 2: Primary CTA */}
      <PreparationPathSection />

      {/* Act 3: Trust */}
      <TrustStrip />
      <ResultsSection />

      {/* Act 4: Tools */}
      <FreeToolsSection />
      <PercentilePlannerSection />

      {/* Act 5: Social Proof */}
      <TestimonialsSection />

      {/* Act 6: Your Path */}
      <WebinarSection />
      <CoursesSection />
      <FacultySection />

      {/* Act 7: Story */}
      <FounderSection />

      {/* Act 8: Close */}
      <WhyDifferentSection />
      <FAQSection />
      <FinalCTASection />
    </main>
    <Footer />
    <WhatsAppButton />
    <ScrollCTAPanel />
  </>
);

export default Index;
