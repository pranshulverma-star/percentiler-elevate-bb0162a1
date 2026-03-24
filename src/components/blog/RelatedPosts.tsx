import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface RelatedPost {
  slug: string;
  title: string;
  meta_description: string | null;
  featured_image: string | null;
  published_at: string | null;
  category: string | null;
}

interface RelatedPostsProps {
  currentSlug: string;
  currentCategory: string | null;
}

const RelatedPosts = ({ currentSlug, currentCategory }: RelatedPostsProps) => {
  const [posts, setPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      let sameCategoryPosts: RelatedPost[] = [];

      // First try: same category
      if (currentCategory) {
        const { data } = await supabase
          .from("blog_posts")
          .select("slug, title, meta_description, featured_image, published_at, category")
          .neq("slug", currentSlug)
          .eq("category", currentCategory)
          .not("title", "like", "%Page not found%")
          .order("published_at", { ascending: false })
          .limit(3);
        sameCategoryPosts = data || [];
      }

      // If not enough same-category posts, fill with recent ones
      if (sameCategoryPosts.length < 3) {
        const existingSlugs = [currentSlug, ...sameCategoryPosts.map((p) => p.slug)];
        const { data } = await supabase
          .from("blog_posts")
          .select("slug, title, meta_description, featured_image, published_at, category")
          .not("slug", "in", `(${existingSlugs.join(",")})`)
          .not("title", "like", "%Page not found%")
          .order("published_at", { ascending: false })
          .limit(3 - sameCategoryPosts.length);
        sameCategoryPosts = [...sameCategoryPosts, ...(data || [])];
      }

      setPosts(sameCategoryPosts);
    };
    fetchRelated();
  }, [currentSlug, currentCategory]);

  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
      <div className="grid gap-5 sm:grid-cols-3">
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
                className="w-full h-32 object-cover rounded-lg mb-3"
                loading="lazy"
              />
            )}
            {post.category && (
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                {post.category}
              </span>
            )}
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.meta_description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                {post.meta_description}
              </p>
            )}
            {post.published_at && (
              <p className="text-xs text-muted-foreground mt-1.5">
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
    </section>
  );
};

export default RelatedPosts;
