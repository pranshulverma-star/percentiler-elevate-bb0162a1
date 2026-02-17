import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <>
    <Navbar />
    <main className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

      <div className="prose prose-sm md:prose-base text-muted-foreground space-y-6">
        <p><strong>Effective Date:</strong> February 17, 2026</p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect personal information you provide voluntarily, including your name, phone number, email address, and academic details when you register, fill out forms, or interact with our tools.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and improve our educational services</li>
            <li>To personalise your learning experience and study plans</li>
            <li>To communicate with you about courses, offers, and updates</li>
            <li>To analyse usage patterns and improve our platform</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with trusted service providers who assist in operating our platform, subject to confidentiality obligations.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
          <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Cookies</h2>
          <p>Our website may use cookies and similar technologies to enhance your browsing experience. You can manage cookie preferences through your browser settings.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">6. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data by contacting us. We will respond to your request within a reasonable timeframe.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
          <p>For privacy-related inquiries, reach us at <a href="mailto:pranshul@percentilers.in" className="text-primary hover:underline">pranshul@percentilers.in</a> or call <a href="tel:+919911928071" className="text-primary hover:underline">+91-9911928071</a>.</p>
        </section>
      </div>
    </main>
    <Footer />
  </>
);

export default PrivacyPolicy;
