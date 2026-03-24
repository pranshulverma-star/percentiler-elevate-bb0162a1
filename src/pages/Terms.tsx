import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const Terms = () => (
  <>
    <SEO title="Terms & Conditions | Percentilers" description="Read the terms and conditions for using Percentilers CAT coaching platform, including payment terms, refund policy, and user responsibilities." canonical="https://percentilers.in/terms" />
    <Navbar />
    <main className="container mx-auto px-4 md:px-6 pt-6 pb-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: February 17, 2026</p>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. About Us</h2>
          <p>Percentilers is an online educational platform offering CAT &amp; OMET coaching, mentorship programs, study materials, mock tests, and related services. Percentilers is operated from New Delhi, India.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Acceptance of Terms</h2>
          <p>By accessing or using percentilers.in (the "Website") and our services, you agree to be bound by these Terms &amp; Conditions and our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>. If you do not agree, please do not use our services.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Eligibility</h2>
          <p>You must be at least 18 years of age or have parental/guardian consent to use our services. By using our services, you represent that you meet this requirement.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Services</h2>
          <p>Percentilers provides online CAT coaching, mentorship, study plans, mock tests, webinars, and related educational content. We reserve the right to modify, suspend, or discontinue any service at any time with reasonable notice.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. User Accounts &amp; Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to provide accurate, current, and complete information.</li>
            <li>You shall not share your account access with others.</li>
            <li>You shall not use the platform for any unlawful purpose.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. Payment Terms</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All fees are listed on the respective course/service pages and are in Indian Rupees (INR) unless stated otherwise.</li>
            <li>Payment must be made in full before accessing paid services unless an instalment plan is explicitly offered.</li>
            <li>Percentilers reserves the right to change pricing with prior notice. Existing enrolments will not be affected.</li>
            <li>All payments are processed through secure third-party payment gateways.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. Refund &amp; Cancellation</h2>
          <p>Our detailed Refund &amp; Cancellation Policy is available at <Link to="/refund-policy" className="text-primary hover:underline">Refund &amp; Cancellation Policy</Link>. Key highlights:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Refund requests must be raised within 7 days of purchase.</li>
            <li>No refund will be provided if more than 25% of course content has been accessed.</li>
            <li>Processing time for approved refunds is 7–14 business days.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Intellectual Property</h2>
          <p>All content including study materials, videos, assessments, graphics, and branding is the intellectual property of Percentilers. Unauthorised reproduction, distribution, recording, or sharing is strictly prohibited and may result in legal action.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">9. Results Disclaimer</h2>
          <p className="font-medium text-foreground">Past results and student testimonials do not guarantee future performance.</p>
          <p>Individual results may vary based on effort, preparation duration, academic background, and other factors. Percentilers provides tools, mentorship, and structured guidance — the outcome depends on the student's dedication and consistency.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">10. Limitation of Liability</h2>
          <p>Percentilers shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid by you for the relevant service in the preceding 12 months.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">11. Indemnification</h2>
          <p>You agree to indemnify and hold harmless Percentilers, its founders, employees, and partners from any claims, damages, or expenses arising from your use of the services or violation of these terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">12. Governing Law &amp; Jurisdiction</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">13. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify users of material changes via email or a notice on our website. Continued use of the services constitutes acceptance of the revised terms.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">14. Contact</h2>
          <p>For any queries regarding these terms:</p>
          <ul className="list-none space-y-1">
            <li>Email: <a href="mailto:pranshul@percentilers.in" className="text-primary hover:underline">pranshul@percentilers.in</a></li>
            <li>Phone: <a href="tel:+919911928071" className="text-primary hover:underline">+91-9911928071</a></li>
            <li>Address: New Delhi, India</li>
          </ul>
        </section>
      </div>
    </main>
    <Footer />
  </>
);

export default Terms;
