import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const Contact = () => (
  <>
    <SEO title="Contact Percentilers – CAT Coaching Support" description="Get in touch with Percentilers for queries about CAT coaching, mentorship programs, test series, or any other support. Email, phone, and office details." canonical="https://percentilers.in/contact" />
    <Navbar />
    <main className="container mx-auto px-4 md:px-6 pt-6 pb-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-8">Have questions about our courses, mentorship, or anything else? We'd love to hear from you.</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
          <Mail className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Email</h3>
            <a href="mailto:pranshul@percentilers.in" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              pranshul@percentilers.in
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
          <Phone className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Phone</h3>
            <a href="tel:+919911928071" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              +91-9911928071
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
          <MapPin className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Registered Address</h3>
            <p className="text-sm text-muted-foreground">New Delhi, India</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
          <Clock className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Support Hours</h3>
            <p className="text-sm text-muted-foreground">Mon – Sat, 10:00 AM – 7:00 PM IST</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold text-foreground mb-2">Grievance Officer</h3>
        <p className="text-sm text-muted-foreground">In accordance with the Information Technology Act, 2000 and the Consumer Protection Act, 2019, the Grievance Officer can be contacted at:</p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
          <li>Name: Pranshul</li>
          <li>Email: <a href="mailto:pranshul@percentilers.in" className="text-primary hover:underline">pranshul@percentilers.in</a></li>
          <li>Phone: <a href="tel:+919911928071" className="text-primary hover:underline">+91-9911928071</a></li>
        </ul>
      </div>
    </main>
    <Footer />
  </>
);

export default Contact;
