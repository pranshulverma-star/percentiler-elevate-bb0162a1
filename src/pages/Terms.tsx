import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <>
    <Navbar />
    <main className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Terms &amp; Conditions</h1>

      <div className="prose prose-sm md:prose-base text-muted-foreground space-y-6">
        <p><strong>Effective Date:</strong> February 17, 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing and using the Percentilers website and services, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our services.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. Services</h2>
          <p>Percentilers provides online CAT coaching, mentorship programs, study materials, mock tests, and related educational services. We reserve the right to modify, suspend, or discontinue any service at any time.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during registration.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Payment &amp; Refunds</h2>
          <p>All fees are stated on the respective course pages. Refund policies, if applicable, will be communicated at the time of purchase. Percentilers reserves the right to change pricing at any time.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
          <p>All content, including study materials, videos, and assessments, is the intellectual property of Percentilers. Unauthorized reproduction, distribution, or sharing is strictly prohibited.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
          <p>Percentilers shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid by you for the relevant service.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">7. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
          <p>For any queries regarding these terms, contact us at <a href="mailto:pranshul@percentilers.in" className="text-primary hover:underline">pranshul@percentilers.in</a>.</p>
        </section>
      </div>
    </main>
    <Footer />
  </>
);

export default Terms;
