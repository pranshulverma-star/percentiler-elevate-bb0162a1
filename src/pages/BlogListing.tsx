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
  category: string | null;
}

function estimateReadTime(content: string | null): number {
  if (!content) return 3;
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 220));
}

const BlogListing = () => {
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug, title, meta_description, featured_image, published_at, content_markdown, category")
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

  const heroPost = filtered[0];
  const gridPosts = filtered.slice(1);

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
        <div className="pt-24 pb-8 sm:pb-10">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-primary font-semibold text-sm tracking-widest uppercase mb-3">Insights & Strategy</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1]">
              The Percentilers Blog
            </h1>
            <p className="text-muted-foreground mt-3 text-lg max-w-xl">
              Real talk on CAT prep, MBA admissions, and everything in between — no fluff, just gyaan.
            </p>
          </div>
        </div>

        {/* Category filter chips */}
        {categories.length > 1 && (
          <div className="max-w-5xl mx-auto px-4 pb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                  !activeCategory
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                All Posts
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
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
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">No blog posts in this category.</p>
        ) : (
          <div className="max-w-5xl mx-auto px-4 pb-16">
            {/* Hero card */}
            {heroPost && (
              <Link
                to={`/${heroPost.slug}`}
                className="group relative block rounded-2xl overflow-hidden mb-10 border border-border bg-card hover:shadow-xl transition-shadow"
              >
                <div className="sm:flex">
                  {heroPost.featured_image && (
                    <div className="sm:w-1/2 h-56 sm:h-auto overflow-hidden">
                      <img
                        src={heroPost.featured_image}
                        alt={heroPost.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className={`p-6 sm:p-8 flex flex-col justify-center ${heroPost.featured_image ? 'sm:w-1/2' : ''}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        Latest
                      </span>
                      {heroPost.category && (
                        <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          {heroPost.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight mb-3">
                      {heroPost.title}
                    </h2>
                    {heroPost.meta_description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                        {heroPost.meta_description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                      {heroPost.published_at && (
                        <time>
                          {new Date(heroPost.published_at).toLocaleDateString("en-IN", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </time>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {estimateReadTime(heroPost.content_markdown)} min
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            {gridPosts.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <Link
                    key={post.slug}
                    to={`/${post.slug}`}
                    className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {post.featured_image && (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-4 flex flex-col flex-1">
                      {post.category && (
                        <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit mb-2">
                          {post.category}
                        </span>
                      )}
                      <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
                        {post.title}
                      </h2>
                      {post.meta_description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed flex-1">
                          {post.meta_description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto pt-3 border-t border-border/60">
                        {post.published_at && (
                          <time>
                            {new Date(post.published_at).toLocaleDateString("en-IN", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </time>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {estimateReadTime(post.content_markdown)} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default BlogListing;
