import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface RelatedPost {
  slug: string;
  title: string;
  meta_description: string | null;
  featured_image: string | null;
  published_at: string | null;
}

interface RelatedPostsProps {
  currentSlug: string;
}

const RelatedPosts = ({ currentSlug }: RelatedPostsProps) => {
  const [posts, setPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("slug, title, meta_description, featured_image, published_at")
        .neq("slug", currentSlug)
        .not("title", "like", "%Page not found%")
        .order("published_at", { ascending: false })
        .limit(3);
      setPosts(data || []);
    };
    fetch();
  }, [currentSlug]);

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
