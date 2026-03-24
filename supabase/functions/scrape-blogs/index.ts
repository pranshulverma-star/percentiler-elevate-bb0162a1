import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "urls array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const results: any[] = [];
    const errors: any[] = [];

    for (const url of urls) {
      try {
        console.log(`Scraping: ${url}`);

        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown", "html"],
            onlyMainContent: true,
          }),
        });

        const scrapeData = await scrapeRes.json();

        if (!scrapeRes.ok) {
          errors.push({ url, error: scrapeData.error || `HTTP ${scrapeRes.status}` });
          continue;
        }

        const data = scrapeData.data || scrapeData;
        const metadata = data.metadata || {};

        // Extract slug from URL
        const urlObj = new URL(url);
        const slug = urlObj.pathname.replace(/^\//, "").replace(/\/$/, "");

        if (!slug) {
          errors.push({ url, error: "Could not extract slug" });
          continue;
        }

        const title = metadata.title || metadata.ogTitle || slug.replace(/-/g, " ");
        const metaDescription = metadata.description || metadata.ogDescription || null;
        const featuredImage = metadata.ogImage || null;

        const { error: insertError } = await supabase.from("blog_posts").upsert(
          {
            slug,
            title,
            content_html: data.html || null,
            content_markdown: data.markdown || null,
            meta_description: metaDescription,
            featured_image: featuredImage,
            published_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        );

        if (insertError) {
          errors.push({ url, slug, error: insertError.message });
        } else {
          results.push({ url, slug, title });
        }

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        errors.push({ url, error: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    return new Response(
      JSON.stringify({ success: true, scraped: results.length, failed: errors.length, results, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
