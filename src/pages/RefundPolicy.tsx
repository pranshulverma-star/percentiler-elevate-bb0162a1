import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => (
  <>
    <Navbar />
    <main className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Refund &amp; Cancellation Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: February 17, 2026</p>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Overview</h2>
          <p>At Percentilers, we strive to deliver high-quality educational content and services. This policy outlines the terms under which refunds and cancellations are handled in compliance with the Consumer Protection Act, 2019 and Indian e-commerce regulations.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Eligibility for Refund</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Refund requests must be raised within <strong>7 days</strong> of the date of purchase.</li>
            <li>No refund will be issued if more than <strong>25% of the course content</strong> (videos, materials, mock tests) has been accessed or downloaded.</li>
            <li>Refunds are not applicable for free resources, trial offerings, or promotional/discounted purchases unless explicitly stated.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. How to Request a Refund</h2>
          <p>To initiate a refund, email us at <a href="mailto:pranshul@percentilers.in" className="text-primary hover:underline">pranshul@percentilers.in</a> with the following details:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Your full name and registered phone number</li>
            <li>Course/service purchased</li>
            <li>Date of purchase and payment method</li>
            <li>Reason for refund request</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Refund Processing</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Once your request is reviewed and approved, the refund will be processed within <strong>7–14 business days</strong>.</li>
            <li>Refunds will be credited to the original payment method used at the time of purchase.</li>
            <li>Transaction fees or payment gateway charges (if any) may be deducted from the refund amount.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Cancellation of Services</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You may cancel your enrolment by contacting us before the course start date for a full refund.</li>
            <li>Cancellations after the course has started will be subject to the refund eligibility criteria above.</li>
            <li>Percentilers reserves the right to cancel or reschedule a batch/service with prior notice. In such cases, a full refund or batch transfer will be offered.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. Non-Refundable Items</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>One-on-one mentorship sessions already conducted</li>
            <li>Mock test series where tests have already been attempted</li>
            <li>Personalised study plans already generated and delivered</li>
            <li>Services accessed beyond the 25% threshold</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. Disputes</h2>
          <p>If you are not satisfied with the resolution, you may escalate your concern to our Grievance Officer. All disputes shall be subject to the exclusive jurisdiction of courts in New Delhi, India.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
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

export default RefundPolicy;
