import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import BlogBreadcrumb from "@/components/blog/BlogBreadcrumb";
import BlogJsonLd from "@/components/blog/BlogJsonLd";
import NotFoundRedirect from "@/components/NotFoundRedirect";
import { ArrowUp, Zap } from "lucide-react";

const Footer = lazy(() => import("@/components/Footer"));
const RelatedPosts = lazy(() => import("@/components/blog/RelatedPosts"));
const BlogCTABanner = lazy(() => import("@/components/blog/BlogCTABanner"));
const BlogFAQAccordion = lazy(() => import("@/components/blog/BlogFAQAccordion"));
const BlogTableOfContents = lazy(() => import("@/components/blog/BlogTableOfContents"));

interface TocItem { id: string; text: string; level: number; }

function MarkdownRenderer({ content }: { content: string }) {
  const [Comp, setComp] = useState<any>(null);
  const [plugin, setPlugin] = useState<any>(null);
  useEffect(() => {
    Promise.all([
      import("react-markdown").then(m => m.default),
      import("remark-gfm").then(m => m.default),
    ]).then(([md, gfm]) => { setComp(() => md); setPlugin(() => gfm); });
  }, []);
  if (!Comp) return <div className="blog-content animate-pulse"><div className="h-4 bg-muted rounded w-3/4 mb-3" /><div className="h-4 bg-muted rounded w-full mb-3" /><div className="h-4 bg-muted rounded w-5/6" /></div>;
  return <div className="blog-content"><Comp remarkPlugins={[plugin]}>{content}</Comp></div>;
}

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

/** Strip WordPress/Divi wrapper and extract only the article body */
function extractArticleContent(html: string): string {
  let content = html;
  // If it looks like a full WordPress page, extract just the post content
  if (content.includes("et_pb_post_content") || content.includes("<!DOCTYPE")) {
    const postContentMatch = content.match(
      /<div[^>]*class="[^"]*et_pb_post_content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i
    );
    if (postContentMatch) {
      content = postContentMatch[1].trim();
    } else {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch) {
        let body = bodyMatch[1];
        body = body.replace(/<script[\s\S]*?<\/script>/gi, "");
        body = body.replace(/<style[\s\S]*?<\/style>/gi, "");
        const meaningful = body.match(/<(?:p|h[1-6]|ul|ol|blockquote|table|figure)[^>]*>[\s\S]*?<\/(?:p|h[1-6]|ul|ol|blockquote|table|figure)>/gi);
        if (meaningful && meaningful.length > 2) {
          content = meaningful.join("\n");
        }
      }
    }
  }
  // Remove the first <figure> containing the featured image to avoid duplication
  content = content.replace(/<figure[^>]*>[\s\S]*?<\/figure>/, "");
  // Remove tldr-box div (already shown as meta description)
  content = content.replace(/<div[^>]*class="[^"]*tldr-box[^"]*"[^>]*>[\s\S]*?<\/div>/, "");
  // Remove "You should also read" / "you may also like" sections (legacy scraped content)
  content = content.replace(/<(?:div|section|aside)[^>]*>[\s\S]*?(?:You should also read|you may also like|You May Also Like|Related Posts)[\s\S]*?<\/(?:div|section|aside)>/gi, "");
  // Remove any links pointing to old.percentilers or old.percentiles
  content = content.replace(/<a[^>]*href="[^"]*old\.percentile[^"]*"[^>]*>[\s\S]*?<\/a>/gi, "");
  // Add IDs to h2/h3 for TOC linking
  let headingCounter = 0;
  content = content.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attrs, inner) => {
    headingCounter++;
    const _text = inner.replace(/<[^>]+>/g, "").trim();
    const id = `heading-${headingCounter}`;
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
  return content;
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
  const [readProgress, setReadProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      setReadProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowBackToTop(scrollTop > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const fetchPost = async (retries = 2) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, content_html, content_markdown, meta_description, featured_image, published_at, category")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        if (retries > 0) {
          setTimeout(() => fetchPost(retries - 1), 800);
          return;
        }
      }
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setPost(data);
      setLoading(false);
    };
    fetchPost();
    return () => { cancelled = true; };
  }, [slug]);

  const readTime = useMemo(() => {
    if (!post) return 0;
    return estimateReadTime(post.content_markdown || post.content_html || "");
  }, [post]);

  const contentData = useMemo(() => {
    if (!post) return null;
    // Prefer HTML
    if (post.content_html) {
      const cleaned = extractArticleContent(post.content_html);
      const [mainHtml, faqHtml] = extractFaqFromHtml(cleaned);
      return { type: "html" as const, main: mainHtml, faq: faqHtml };
    }
    if (post.content_markdown) {
      return { type: "markdown" as const, main: post.content_markdown, faq: null };
    }
    return null;
  }, [post]);

  const tocItems = useMemo<TocItem[]>(() => {
    if (!contentData) return [];
    const html = contentData.main;
    const items: TocItem[] = [];
    const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const text = match[3].replace(/<[^>]+>/g, "").trim();
      if (text) {
        items.push({ id: match[2], text, level: parseInt(match[1]) });
      }
    }
    return items;
  }, [contentData]);

  if (loading && !notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return <NotFoundRedirect />;
  }

  return (
    <>
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-[3px] z-[9999] bg-primary transition-[width] duration-100"
        style={{ width: `${readProgress}%` }}
      />

      <SEO
        title={`${post.title} | Percentilers`}
        description={post.meta_description || post.title}
        canonical={`https://percentilers.in/${post.slug}`}
        ogImage={post.featured_image || undefined}
        ogType="article"
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
        <div className="max-w-[1060px] mx-auto px-5 pt-24 pb-16 flex gap-10 items-start">
        <article className="max-w-[680px] w-full mx-auto xl:mx-0">
          <BlogBreadcrumb postTitle={post.title} />

          {/* Title */}
          <h1 className="text-[2.25rem] font-extrabold text-foreground leading-[1.3] tracking-tight mb-5">
            {post.title}
          </h1>

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-3 text-[0.85rem] text-muted-foreground mb-4">
            {post.category && (
              <span className="inline-block text-[0.75rem] font-bold uppercase text-primary-foreground bg-primary px-3 py-[3px] rounded-[20px]">
                {post.category}
              </span>
            )}
            {post.published_at && (
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            <span>📖 {readTime} min read</span>
          </div>
          <div className="border-b border-border mb-8" />

          {/* Featured image with gradient overlay */}
          {post.featured_image && (
            <div className="relative mb-10">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full rounded-xl max-h-[420px] object-cover"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent via-transparent to-background" style={{ background: 'linear-gradient(to bottom, transparent 60%, hsl(var(--background)) 100%)' }} />
            </div>
          )}

          {/* Quick Answer box for GEO / Speakable */}
          {post.meta_description && (
            <div className="quick-answer">
              <div className="quick-answer-label">
                <Zap className="h-3.5 w-3.5" />
                Quick Answer
              </div>
              <p className="quick-answer-text">{post.meta_description}</p>
            </div>
          )}

          {/* Article body */}
          {contentData?.type === "html" ? (
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentData.main) }}
            />
          ) : contentData?.type === "markdown" ? (
            <MarkdownRenderer content={contentData.main} />
          ) : (
            <p className="text-muted-foreground">No content available.</p>
          )}

          {/* CTA Banner */}
          <Suspense fallback={null}><BlogCTABanner /></Suspense>

          {/* FAQ Accordion */}
          {contentData?.faq && <Suspense fallback={null}><BlogFAQAccordion faqHtml={contentData.faq} /></Suspense>}

          {/* Related Posts */}
          <Suspense fallback={null}><RelatedPosts currentSlug={post.slug} currentCategory={post.category} /></Suspense>

          <div className="h-12" />
        </article>
        <Suspense fallback={null}><BlogTableOfContents items={tocItems} /></Suspense>
        </div>
      </main>
      <Suspense fallback={<div className="min-h-[200px]" />}><Footer /></Suspense>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 sm:bottom-8 right-8 z-[999] w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
        style={{ bottom: undefined }}
        aria-label="Back to top"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
      <style>{`
        @media (max-width: 639px) {
          button[aria-label="Back to top"] {
            bottom: 5rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default BlogPost;
