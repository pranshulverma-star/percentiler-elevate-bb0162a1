import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BlogBreadcrumb from "@/components/blog/BlogBreadcrumb";
import BlogJsonLd from "@/components/blog/BlogJsonLd";
import RelatedPosts from "@/components/blog/RelatedPosts";
import BlogCTABanner from "@/components/blog/BlogCTABanner";
import BlogFAQAccordion from "@/components/blog/BlogFAQAccordion";
import { ArrowLeft, Clock, User } from "lucide-react";

interface BlogPostData {
  slug: string;
  title: string;
  content_html: string | null;
  content_markdown: string | null;
  meta_description: string | null;
  featured_image: string | null;
  published_at: string | null;
  category: string | null;
}

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

/** Extract FAQ section HTML and return [mainContent, faqHtml] */
function extractFaqFromHtml(html: string): [string, string | null] {
  // Try to find a .faq-section or #faq div
  const faqRegex = /<div[^>]*class="[^"]*faq-section[^"]*"[^>]*>([\s\S]*?)<\/div>\s*$/i;
  const match = html.match(faqRegex);
  if (match) {
    return [html.slice(0, match.index), match[1]];
  }
  // Also try matching by heading pattern: h2/h3 with "FAQ" followed by structured content
  const faqHeadingRegex = /(<h[23][^>]*>.*?(?:FAQ|Frequently Asked).*?<\/h[23]>[\s\S]*)$/i;
  const headingMatch = html.match(faqHeadingRegex);
  if (headingMatch && headingMatch.index && headingMatch.index > html.length * 0.6) {
    return [html.slice(0, headingMatch.index), headingMatch[1]];
  }
  return [html, null];
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
        .select("slug, title, content_html, content_markdown, meta_description, featured_image, published_at, category")
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

  const readTime = useMemo(() => {
    if (!post) return 0;
    return estimateReadTime(post.content_markdown || post.content_html || "");
  }, [post]);

  const contentData = useMemo(() => {
    if (!post) return null;
    // Prefer HTML
    if (post.content_html) {
      const [mainHtml, faqHtml] = extractFaqFromHtml(post.content_html);
      return { type: "html" as const, main: mainHtml, faq: faqHtml };
    }
    if (post.content_markdown) {
      return { type: "markdown" as const, main: post.content_markdown, faq: null };
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
      <main className="min-h-screen bg-background">
        <article className="max-w-[740px] mx-auto px-4 sm:px-8 pt-24 pb-16">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> All Articles
          </Link>

          {/* Category pill */}
          {post.category && (
            <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-[2.25rem] font-extrabold text-foreground leading-[1.3] tracking-tight mb-5">
            {post.title}
          </h1>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Pranshul Verma
            </span>
            {post.published_at && (
              <time dateTime={post.published_at} className="inline-flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                {new Date(post.published_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {readTime} min read
            </span>
          </div>

          {/* Featured image */}
          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full rounded-xl mb-8 shadow-sm"
            />
          )}

          {/* Article body */}
          {contentData?.type === "html" ? (
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: contentData.main }}
            />
          ) : contentData?.type === "markdown" ? (
            <div className="blog-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentData.main}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground">No content available.</p>
          )}

          {/* CTA Banner */}
          <BlogCTABanner />

          {/* FAQ Accordion */}
          {contentData?.faq && <BlogFAQAccordion faqHtml={contentData.faq} />}

          {/* Related Posts */}
          <RelatedPosts currentSlug={post.slug} currentCategory={post.category} />

          <div className="h-12" />
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
