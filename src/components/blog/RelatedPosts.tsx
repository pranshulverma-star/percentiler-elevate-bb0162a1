import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

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
      <h2 className="text-xl font-bold text-foreground mb-5">Related Articles</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={`/${post.slug}`}
            className="group flex flex-col rounded-xl bg-card overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-200"
          >
            {post.featured_image && (
              <div className="aspect-video overflow-hidden bg-muted">
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
              <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                {post.title}
              </h3>
              {post.meta_description && (
                <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">
                  {post.meta_description}
                </p>
              )}
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200 mt-auto">
                Read more <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;
