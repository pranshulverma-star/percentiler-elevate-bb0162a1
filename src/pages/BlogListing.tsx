import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface BlogListItem {
  slug: string;
  title: string;
  meta_description: string | null;
  featured_image: string | null;
  published_at: string | null;
}

const BlogListing = () => {
  const [posts, setPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug, title, meta_description, featured_image, published_at")
        .order("published_at", { ascending: false });

      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <>
      <SEO
        title="Blog | Percentilers – CAT Prep Insights"
        description="Expert articles on CAT exam preparation, MBA admissions, and career guidance from Percentilers."
        canonical="https://percentilers.in/blog"
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Blog</h1>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground">No blog posts yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  to={`/${post.slug}`}
                  className="group block rounded-xl border border-border bg-card p-4 hover:shadow-lg transition-shadow"
                >
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                      loading="lazy"
                    />
                  )}
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.meta_description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {post.meta_description}
                    </p>
                  )}
                  {post.published_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(post.published_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogListing;
