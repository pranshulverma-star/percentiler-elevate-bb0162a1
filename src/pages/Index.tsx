import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PreparationPathSection from "@/components/PreparationPathSection";
import TrustStrip from "@/components/TrustStrip";
import ResultsSection from "@/components/ResultsSection";
import PercentilePlannerSection from "@/components/PercentilePlannerSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import WebinarSection from "@/components/WebinarSection";
import CoursesSection from "@/components/CoursesSection";
import FreeToolsSection from "@/components/FreeToolsSection";
import FacultySection from "@/components/FacultySection";
import FounderSection from "@/components/FounderSection";
import FAQSection from "@/components/FAQSection";
import FinalCTASection from "@/components/FinalCTASection";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";

const Index = () => (
  <>
    <Navbar />
    <main>
      <HeroSection />
      <PreparationPathSection />
      <TrustStrip />
      <ResultsSection />
      <PercentilePlannerSection />
      <TestimonialsSection />
      <WebinarSection />
      <CoursesSection />
      <FreeToolsSection />
      <FacultySection />
      <FounderSection />
      <FAQSection />
      <FinalCTASection />
    </main>
    <Footer />
    <WhatsAppButton />
  </>
);

export default Index;
