import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import BlogBreadcrumb from "@/components/blog/BlogBreadcrumb";
import BlogJsonLd from "@/components/blog/BlogJsonLd";
import RelatedPosts from "@/components/blog/RelatedPosts";
import BlogCTABanner, { MidArticleCTA } from "@/components/blog/BlogCTABanner";

interface BlogPostData {
  slug: string;
  title: string;
  content_html: string | null;
  content_markdown: string | null;
  meta_description: string | null;
  featured_image: string | null;
  published_at: string | null;
}

/** Split markdown roughly in half to inject a mid-article CTA */
function splitMarkdown(md: string): [string, string] {
  const lines = md.split("\n");
  const mid = Math.floor(lines.length / 2);
  // Find nearest blank line to split cleanly
  let splitAt = mid;
  for (let i = mid; i < Math.min(mid + 10, lines.length); i++) {
    if (lines[i].trim() === "") { splitAt = i; break; }
  }
  return [lines.slice(0, splitAt).join("\n"), lines.slice(splitAt).join("\n")];
}

/** For HTML content, inject CTA div after ~50% of content */
function splitHtml(html: string): [string, string] {
  const mid = Math.floor(html.length / 2);
  // Find nearest closing tag to split cleanly
  const tagEnd = html.indexOf(">", mid);
  if (tagEnd === -1) return [html, ""];
  const splitAt = tagEnd + 1;
  return [html.slice(0, splitAt), html.slice(splitAt)];
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
        window.location.replace(`https://old.percentilers.in/${slug}${window.location.search}`);
        return;
      }

      setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const contentParts = useMemo(() => {
    if (!post) return null;
    if (post.content_markdown) {
      const [first, second] = splitMarkdown(post.content_markdown);
      return { type: "markdown" as const, first, second };
    }
    if (post.content_html) {
      const [first, second] = splitHtml(post.content_html);
      return { type: "html" as const, first, second };
    }
    return null;
  }, [post]);

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
      <BlogJsonLd
        title={post.title}
        description={post.meta_description || post.title}
        slug={post.slug}
        publishedAt={post.published_at}
        featuredImage={post.featured_image}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <BlogBreadcrumb postTitle={post.title} />

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

          {/* Blog content with mid-article CTA */}
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary">
            {contentParts?.type === "markdown" ? (
              <>
                <ReactMarkdown>{contentParts.first}</ReactMarkdown>
                <MidArticleCTA />
                <ReactMarkdown>{contentParts.second}</ReactMarkdown>
              </>
            ) : contentParts?.type === "html" ? (
              <>
                <div dangerouslySetInnerHTML={{ __html: contentParts.first }} />
                <MidArticleCTA />
                <div dangerouslySetInnerHTML={{ __html: contentParts.second }} />
              </>
            ) : (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </div>

          {/* Bottom CTAs */}
          <BlogCTABanner />

          {/* Related Posts */}
          <RelatedPosts currentSlug={post.slug} />
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
