import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Clock } from "lucide-react";

interface BlogListItem {
  slug: string;
  title: string;
  meta_description: string | null;
  featured_image: string | null;
  published_at: string | null;
  content_markdown: string | null;
  content_html: string | null;
  category: string | null;
}

function estimateReadTime(md: string | null, html: string | null): number {
  const text = md || html || "";
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
}

const BlogListing = () => {
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug, title, meta_description, featured_image, published_at, content_markdown, content_html, category")
        .not("title", "like", "%Page not found%")
        .order("published_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => { if (p.category) cats.add(p.category); });
    return Array.from(cats).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  return (
    <>
      <SEO
        title="Blog | Percentilers – CAT Prep Insights"
        description="Expert articles on CAT exam preparation, MBA admissions, and career guidance from Percentilers."
        canonical="https://percentilers.in/blog"
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <div className="pt-28 pb-10 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1]">
              CAT Prep Insights 🎯
            </h1>
            <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-primary" />
            <p className="text-muted-foreground mt-4 text-lg">
              Real talk, real strategies, from people who've been there.
            </p>
          </div>
        </div>

        {/* Category filter chips */}
        {categories.length > 1 && (
          <div className="max-w-[1200px] mx-auto px-4 pb-8">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                  !activeCategory
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                All Posts
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No blog posts in this category.</p>
        ) : (
          <div className="max-w-[1200px] mx-auto px-4 pb-20">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post) => (
                <Link
                  key={post.slug}
                  to={`/${post.slug}`}
                  className="group flex flex-col rounded-xl bg-card overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Image */}
                  <div className="aspect-video overflow-hidden bg-muted">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl">📝</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {post.category && (
                      <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit mb-3">
                        {post.category}
                      </span>
                    )}
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                      {post.title}
                    </h2>
                    {post.meta_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1 mb-4">
                        {post.meta_description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        {post.published_at && (
                          <time>
                            {new Date(post.published_at).toLocaleDateString("en-IN", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </time>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {estimateReadTime(post.content_markdown, post.content_html)} min
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all duration-200">
                        Read more <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default BlogListing;
