import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => (
  <>
    <Navbar />
    <main className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Contact Us</h1>

      <div className="space-y-8">
        <p className="text-muted-foreground text-lg">
          Have questions about our courses, mentorship, or anything else? We'd love to hear from you.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
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
        </div>

        <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card">
          <MapPin className="h-6 w-6 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Office</h3>
            <p className="text-sm text-muted-foreground">New Delhi, India</p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default Contact;
