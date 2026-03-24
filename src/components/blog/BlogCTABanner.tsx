import { Link } from "react-router-dom";

const BlogCTABanner = () => (
  <div className="my-10 rounded-xl bg-primary p-6 sm:p-8 text-center">
    <p className="text-lg sm:text-xl font-bold text-primary-foreground mb-2">
      Ready to crack CAT? 🎯
    </p>
    <p className="text-sm text-primary-foreground/80 mb-5">
      Get expert guidance from 7x 100%iler Pranshul Verma and top IIM faculty.
    </p>
    <Link
      to="/courses/cat-omet"
      className="inline-block bg-card text-primary font-semibold text-sm px-6 py-3 rounded-xl hover:bg-card/90 transition-colors duration-200"
    >
      Explore Courses →
    </Link>
  </div>
);

export default BlogCTABanner;
