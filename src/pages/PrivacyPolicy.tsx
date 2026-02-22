import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => (
  <>
    <Navbar />
    <main className="container mx-auto px-4 md:px-6 pt-6 pb-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: February 17, 2026</p>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Who We Are</h2>
          <p>Percentilers ("we", "our", "us") operates percentilers.in, an online educational platform for CAT &amp; OMET preparation. This Privacy Policy explains how we collect, use, and protect your personal data.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
          <p><strong>Information you provide:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name, phone number, email address</li>
            <li>Academic details (scores, stream, work experience) when using our tools</li>
            <li>Payment information (processed securely via third-party gateways — we do not store card details)</li>
          </ul>
          <p className="mt-2"><strong>Information collected automatically:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Device information (browser type, operating system, screen resolution)</li>
            <li>IP address and approximate location</li>
            <li>Pages visited, time spent, and interaction data</li>
            <li>Cookies and similar tracking technologies (see Section 6)</li>
          </ul>
          <p className="mt-2"><strong>Information from third-party advertising platforms:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Google Ads conversion tracking and remarketing data</li>
            <li>Meta (Facebook/Instagram) Pixel data for ad performance measurement</li>
            <li>Analytics data from Google Analytics</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide, personalise, and improve our educational services</li>
            <li>To generate personalised study plans and recommendations</li>
            <li>To process payments and manage your enrolment</li>
            <li>To communicate with you about courses, offers, and updates (you can opt out anytime)</li>
            <li>To measure and improve the effectiveness of our advertising campaigns</li>
            <li>To show you relevant ads on Google, Meta, and other platforms (remarketing)</li>
            <li>To analyse usage patterns and improve our platform</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Data Sharing</h2>
          <p>We do <strong>not sell</strong> your personal information. We may share data with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Service providers:</strong> Payment gateways, hosting providers, and communication tools (under strict confidentiality agreements)</li>
            <li><strong>Advertising partners:</strong> Google Ads and Meta Platforms for conversion tracking and remarketing (anonymised/pseudonymised data)</li>
            <li><strong>Analytics providers:</strong> Google Analytics for platform usage analysis</li>
            <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Data Retention</h2>
          <p>We retain your personal data for as long as necessary to provide our services, comply with legal obligations, and resolve disputes. You may request deletion at any time (see Section 7).</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. Cookies &amp; Tracking Technologies</h2>
          <p>We use cookies and similar technologies for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
            <li><strong>Analytics cookies:</strong> Google Analytics to understand how visitors use our site</li>
            <li><strong>Advertising cookies:</strong> Google Ads and Meta Pixel for conversion tracking, remarketing, and ad optimisation</li>
          </ul>
          <p className="mt-2">You can manage cookie preferences through your browser settings or our cookie consent banner. Disabling certain cookies may affect your experience on our platform.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
          <p>Under applicable Indian law (including the Digital Personal Data Protection Act, 2023), you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for marketing communications</li>
            <li>Opt out of remarketing/targeted advertising</li>
          </ul>
          <p className="mt-2">To exercise these rights, email us at <a href="mailto:pranshul@percentilers.in" className="text-primary hover:underline">pranshul@percentilers.in</a>.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Data Security</h2>
          <p>We implement appropriate technical and organisational measures to protect your personal data, including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">9. Children's Privacy</h2>
          <p>Our services are not intended for children under 18 without parental consent. We do not knowingly collect data from children under 18.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. Material changes will be communicated via email or a notice on our website.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">11. Grievance Officer</h2>
          <p>In accordance with Indian regulations, you may contact our Grievance Officer for any privacy-related concerns:</p>
          <ul className="list-none space-y-1">
            <li>Name: Pranshul</li>
            <li>Email: <a href="mailto:pranshul@percentilers.in" className="text-primary hover:underline">pranshul@percentilers.in</a></li>
            <li>Phone: <a href="tel:+919911928071" className="text-primary hover:underline">+91-9911928071</a></li>
          </ul>
        </section>
      </div>
    </main>
    <Footer />
  </>
);

export default PrivacyPolicy;
