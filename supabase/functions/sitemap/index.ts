import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE = "https://percentilers.in";

const STATIC_URLS: { loc: string; changefreq: string; priority: string }[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/masterclass", changefreq: "weekly", priority: "0.9" },
  { loc: "/masterclass/watch", changefreq: "monthly", priority: "0.7" },
  { loc: "/mentorship", changefreq: "monthly", priority: "0.8" },
  { loc: "/courses/cat-omet", changefreq: "monthly", priority: "0.8" },
  { loc: "/free-courses", changefreq: "monthly", priority: "0.7" },
  { loc: "/test-series", changefreq: "monthly", priority: "0.7" },
  { loc: "/workshops", changefreq: "monthly", priority: "0.7" },
  { loc: "/flashcards", changefreq: "monthly", priority: "0.7" },
  { loc: "/practice-lab", changefreq: "weekly", priority: "0.7" },
  { loc: "/study-buddy", changefreq: "monthly", priority: "0.6" },
  { loc: "/daily-sprint", changefreq: "monthly", priority: "0.6" },
  { loc: "/free-cat-readiness-assessment", changefreq: "monthly", priority: "0.7" },
  { loc: "/cat-daily-study-planner", changefreq: "monthly", priority: "0.7" },
  { loc: "/cat-coaching-comparison", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog", changefreq: "weekly", priority: "0.8" },
  { loc: "/contact", changefreq: "yearly", priority: "0.4" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
  { loc: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { loc: "/refund-policy", changefreq: "yearly", priority: "0.3" },
];

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, published_at")
    .order("published_at", { ascending: false });

  const today = new Date().toISOString().slice(0, 10);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const u of STATIC_URLS) {
    xml += `  <url><loc>${BASE}${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>\n`;
  }

  if (posts) {
    for (const p of posts) {
      const lastmod = p.published_at ? p.published_at.slice(0, 10) : today;
      xml += `  <url><loc>${BASE}/${p.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
    }
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
});
