import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";

interface BlogPostData {
  slug: string;
  title: string;
  content_html: string | null;
  content_markdown: string | null;
  meta_description: string | null;
  featured_image: string | null;
  published_at: string | null;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, content_html, content_markdown, meta_description, featured_image, published_at")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        // Redirect to old site for unknown slugs
        window.location.replace(`https://old.percentilers.in/${slug}${window.location.search}`);
        return;
      }

      setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (loading && !notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) return null;

  return (
    <>
      <SEO
        title={`${post.title} | Percentilers`}
        description={post.meta_description || post.title}
        canonical={`https://percentilers.in/${post.slug}`}
        ogImage={post.featured_image || undefined}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full rounded-xl mb-8 object-cover max-h-96"
            />
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          {post.published_at && (
            <p className="text-muted-foreground text-sm mb-8">
              {new Date(post.published_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary">
            {post.content_markdown ? (
              <ReactMarkdown>{post.content_markdown}</ReactMarkdown>
            ) : post.content_html ? (
              <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
            ) : (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
