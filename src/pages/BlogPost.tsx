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
import BlogCTABanner, { MidArticleCTA } from "@/components/blog/BlogCTABanner";
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

function splitMarkdown(md: string): [string, string] {
  const lines = md.split("\n");
  const mid = Math.floor(lines.length / 2);
  let splitAt = mid;
  for (let i = mid; i < Math.min(mid + 10, lines.length); i++) {
    if (lines[i].trim() === "") { splitAt = i; break; }
  }
  return [lines.slice(0, splitAt).join("\n"), lines.slice(splitAt).join("\n")];
}

function splitHtml(html: string): [string, string] {
  const mid = Math.floor(html.length / 2);
  const tagEnd = html.indexOf(">", mid);
  if (tagEnd === -1) return [html, ""];
  const splitAt = tagEnd + 1;
  return [html.slice(0, splitAt), html.slice(splitAt)];
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
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

  const readTime = useMemo(() => {
    if (!post) return 0;
    const text = post.content_markdown || post.content_html || "";
    return estimateReadTime(text);
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
        {/* Hero section with featured image */}
        {post.featured_image && (
          <div className="relative w-full h-[280px] sm:h-[400px] overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
        )}

        <article className={`max-w-3xl mx-auto px-4 ${post.featured_image ? '-mt-20 relative z-10' : 'pt-24'}`}>
          {/* Breadcrumb + back link */}
          <div className="flex items-center gap-3 mb-5">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 hover:border-primary/40 shrink-0"
            >
              <ArrowLeft className="h-3 w-3" /> All Posts
            </Link>
            <BlogBreadcrumb postTitle={post.title} />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-foreground leading-[1.15] tracking-tight mb-5">
            {post.title}
          </h1>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
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

          {/* Article body */}
          <div className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-foreground/85 prose-p:leading-[1.8]
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-strong:font-bold
            prose-li:text-foreground/85
            prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4
            prose-img:rounded-xl prose-img:shadow-md
            prose-table:text-sm
          ">
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
          <RelatedPosts currentSlug={post.slug} currentCategory={post.category} />

          {/* Bottom spacing */}
          <div className="h-16" />
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
