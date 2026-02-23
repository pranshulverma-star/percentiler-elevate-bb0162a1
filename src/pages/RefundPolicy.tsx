import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => (
  <>
    <Navbar />
    <main className="container mx-auto px-4 md:px-6 pt-6 pb-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Refund &amp; Cancellation Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: February 17, 2026</p>

      <div className="text-muted-foreground space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Refund Policy</h2>
          <p>We do not offer refunds once the course/service is purchased. Please do your due diligence before purchasing the course.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Disputes</h2>
          <p>If you have any concerns, you may reach out to our Grievance Officer. All disputes shall be subject to the exclusive jurisdiction of courts in New Delhi, India.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Contact</h2>
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
