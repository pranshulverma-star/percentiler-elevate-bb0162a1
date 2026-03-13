import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Star, ExternalLink, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const workshops = [
  {
    name: "LRDI Booster Course for CAT",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 2599,
    salePrice: 1499,
    rating: null,
    ratingCount: null,
    image: "https://d502jbuhuh9wk.cloudfront.net/courses/61406e420cf25c0a56daf457/61406e420cf25c0a56daf457_scaled_cover.jpg?v=3",
    link: "https://online.percentilers.in/courses/LRDI-BOOSTER-COURSE-FOR-CAT-61406e420cf25c0a56daf457",
    tag: "LRDI",
    color: "bg-amber-500",
  },
  {
    name: "Arithmetic Workshop for CAT",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 2000,
    salePrice: 999,
    rating: 5.0,
    ratingCount: 8,
    image: "https://d502jbuhuh9wk.cloudfront.net/courses/610272d40cf2ba896eaf2e57/610272d40cf2ba896eaf2e57_scaled_cover.jpg?v=2",
    link: "https://online.percentilers.in/courses/Arithmetic-Workshop-610272d40cf2ba896eaf2e57",
    tag: "QA",
    color: "bg-emerald-500",
  },
  {
    name: "Geometry Workshop",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 1699,
    salePrice: 799,
    rating: 5.0,
    ratingCount: 9,
    image: "https://d502jbuhuh9wk.cloudfront.net/courses/60e55a660cf24f6d1fed932d/60e55a660cf24f6d1fed932d_scaled_cover.jpg?v=2",
    link: "https://online.percentilers.in/courses/Geometryworkshop-60e55a660cf24f6d1fed932d",
    tag: "QA",
    color: "bg-emerald-500",
  },
  {
    name: "Algebra Workshop for CAT",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 2499,
    salePrice: 899,
    rating: 5.0,
    ratingCount: 9,
    image: "https://d502jbuhuh9wk.cloudfront.net/courses/5f4e9b880cf244357e6515cc/5f4e9b880cf244357e6515cc_scaled_cover.jpg?v=2",
    link: "https://online.percentilers.in/courses/Algebra-Workshop-5f4e9b880cf244357e6515cc",
    tag: "QA",
    color: "bg-emerald-500",
  },
  {
    name: "RC & Critical Reasoning Workshop",
    instructor: "Kanika Goyal",
    originalPrice: 2899,
    salePrice: 999,
    rating: 5.0,
    ratingCount: 8,
    image: "https://d502jbuhuh9wk.cloudfront.net/courses/5f5f9d1a0cf20a7044de3af9/5f5f9d1a0cf20a7044de3af9_scaled_cover.jpg?v=3",
    link: "https://online.percentilers.in/courses/Reading-Comprehension--Critical-Reasoning-Workshop-5f5f9d1a0cf20a7044de3af9",
    tag: "VARC",
    color: "bg-blue-500",
  },
  {
    name: "Modern Maths Workshop",
    instructor: "Pranshul Verma & Mayank Raj Singh",
    originalPrice: 1553,
    salePrice: 699,
    rating: null,
    ratingCount: null,
    image: "https://d502jbuhuh9wk.cloudfront.net/courses/613e3e330cf2f7bcf9666501/613e3e330cf2f7bcf9666501_scaled_cover.jpg?v=1",
    link: "https://online.percentilers.in/courses/Modern-Maths-Workshop-CAT-613e3e330cf2f7bcf9666501",
    tag: "QA",
    color: "bg-emerald-500",
  },
  {
    name: "Booster Course – MH-CET | SNAP | NMAT | IIFT | TISSMAT | CMAT",
    instructor: "Pranshul Verma, Mayank Raj Singh & Kanika Goyal",
    originalPrice: 6599,
    salePrice: 1899,
    rating: null,
    ratingCount: null,
    image: "https://d502jbuhuh9wk.cloudfront.net/courses/5fb8ba110cf291a16ac22abd/5fb8ba110cf291a16ac22abd_scaled_cover.jpg?v=1",
    link: "https://online.percentilers.in/courses/BOOSTER-COURSE--SNAP--NMAT--IIFT--TISS-MAT--CMAT-5fb8ba110cf291a16ac22abd",
    tag: "OMET",
    color: "bg-purple-500",
  },
];

function discount(original: number, sale: number) {
  return Math.round(((original - sale) / original) * 100);
}

const Workshops = () => (
  <>
    <SEO
      title="Topic-wise Advanced Workshops for CAT | Percentilers"
      description="Master every CAT topic with our advanced workshops — Arithmetic, Algebra, Geometry, LRDI, VARC & more. Expert-led, affordable, and built for serious aspirants."
      canonical="https://percentilers.in/workshops"
    />
    <Navbar />
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-20 pb-8 md:pt-28 md:pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <Link
            to="/#courses"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Programs
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <Badge variant="secondary" className="mb-3 text-xs font-bold tracking-wider uppercase">
              Advanced Workshops
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Topic-wise <span className="text-primary">Workshops</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Deep-dive into individual CAT topics with expert-led workshops. Master one topic at a time with focused, structured content.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Workshop Grid */}
      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {workshops.map((w, i) => (
              <motion.div
                key={w.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-shadow duration-300">
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={w.image}
                      alt={w.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge
                      className={`absolute top-3 left-3 ${w.color} text-white text-[10px] font-bold tracking-wider border-0`}
                    >
                      {w.tag}
                    </Badge>
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold border-0">
                      {discount(w.originalPrice, w.salePrice)}% OFF
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="text-base md:text-lg font-bold text-foreground mb-1.5 line-clamp-2 leading-snug">
                      {w.name}
                    </h2>

                    {w.rating && (
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star
                              key={s}
                              className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {w.rating} ({w.ratingCount} ratings)
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {w.instructor}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-primary">₹{w.salePrice}</span>
                        <span className="text-sm text-muted-foreground line-through">₹{w.originalPrice}</span>
                      </div>
                      <Button size="sm" asChild className="gap-1.5">
                        <a href={w.link} target="_blank" rel="noopener noreferrer">
                          Enroll <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-10 md:py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Want the complete package?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Get all topics covered with live classes, mocks & mentorship in our comprehensive CAT + OMET Course.
          </p>
          <Button size="lg" asChild>
            <Link to="/courses/cat-omet">Explore CAT + OMET Course</Link>
          </Button>
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default Workshops;
