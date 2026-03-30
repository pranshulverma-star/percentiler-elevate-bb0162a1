/**
 * daily-blog-automation/index.ts
 *
 * Triggered daily via pg_cron at 7 AM and 7 PM IST.
 *
 * Steps:
 *   A  — Select today's keyword  (dayOfYear % keywords.length)
 *   B  — Scrape 15 B-school sites, detect content changes
 *   C  — Fetch Reddit insights for the keyword
 *   D  — Fetch recent published posts for cross-linking
 *   E  — Daily limit check (max 2 posts/day IST), then call Gemini
 *   F  — Parse + word-count quality gate
 *   G  — Generate hero image via Imagen 3, upload to Storage
 *   H  — Build FAQ HTML + Schema.org JSON-LD markup
 *   I  — Generate unique slug
 *   J  — Insert into blog_posts (published = true)
 *   K  — Insert global notification for news posts
 *   L  — Send Telegram summary
 *   M  — Repeat E–L for news post if any B-school changed
 *
 * Confirmed DB columns used:
 *   blog_posts        : id, slug, title, content_html, content_markdown,
 *                       meta_description, featured_image, published_at,
 *                       created_at, category, seo_title, excerpt,
 *                       focus_keyword, tags, pillar, post_type,
 *                       source_url, word_count, published
 *   bschool_snapshots : id, school_name, url, last_content_hash,
 *                       last_checked_at, last_changed_at
 *   notifications     : user_id, title, body, type, is_read,
 *                       action_url, post_id, is_global
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2";

// ─── CORS ─────────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Keywords & Pillar Map ────────────────────────────────────────────────────

const KEYWORDS: string[] = [
  "cat preparation", "cat exam", "cat 2026", "cat 2027",
  "online cat coaching", "cat coaching", "best online cat coaching",
  "top mba colleges in india", "top cat coaching", "how to prepare for cat",
  "how to prepare for quants", "how to prepare for lrdi",
  "how to prepare for varc", "how to tackle rc in cat",
  "how to master lrdi", "how to solve lrdi sets",
  "how much time is required to prepare for cat",
  "can i clear cat in 1st attempt",
  "do engineers have a disadvantage in cat",
  "do gap year matter in cat", "mba colleges without cat",
  "is it worth taking a gap for cat preparation",
  "cat percentile vs score", "cat mock test strategy",
  "iim call criteria 2026", "mba roi in india",
  "cat without coaching", "cat preparation while working",
  "best books for cat preparation", "cat score vs percentile",
  "snap exam preparation", "xat decision making preparation",
  "mba placements iim vs non iim", "profile building for mba admissions",
  "cat repeater strategy", "how to improve cat score in last 3 months",
];

const PILLAR_MAP: Record<string, string> = {
  "cat preparation":        "CAT 2026 Complete Preparation Guide",
  "cat exam":               "CAT 2026 Complete Preparation Guide",
  "cat 2026":               "CAT 2026 Complete Preparation Guide",
  "cat 2027":               "CAT 2026 Complete Preparation Guide",
  "online cat coaching":    "MBA Admissions in India",
  "cat coaching":           "MBA Admissions in India",
  "best online cat coaching": "MBA Admissions in India",
  "top mba colleges in india": "Top MBA Colleges in India",
  "top cat coaching":       "MBA Admissions in India",
  "how to prepare for cat": "CAT 2026 Complete Preparation Guide",
  "how to prepare for quants": "CAT Quant Preparation",
  "how to prepare for lrdi": "CAT DILR Preparation",
  "how to prepare for varc": "CAT VARC Preparation",
  "how to tackle rc in cat": "CAT VARC Preparation",
  "how to master lrdi":     "CAT DILR Preparation",
  "how to solve lrdi sets": "CAT DILR Preparation",
  "how much time is required to prepare for cat": "CAT 2026 Complete Preparation Guide",
  "can i clear cat in 1st attempt": "Myths and Hurdles in MBA Preparation",
  "do engineers have a disadvantage in cat": "Myths and Hurdles in MBA Preparation",
  "do gap year matter in cat": "Myths and Hurdles in MBA Preparation",
  "mba colleges without cat": "MBA Exams Beyond CAT",
  "is it worth taking a gap for cat preparation": "Myths and Hurdles in MBA Preparation",
  "cat percentile vs score": "CAT 2026 Complete Preparation Guide",
  "cat mock test strategy": "CAT 2026 Complete Preparation Guide",
  "iim call criteria 2026": "MBA Admissions in India",
  "mba roi in india":       "MBA After Engineering",
  "cat without coaching":   "Myths and Hurdles in MBA Preparation",
  "cat preparation while working": "CAT 2026 Complete Preparation Guide",
  "best books for cat preparation": "CAT 2026 Complete Preparation Guide",
  "cat score vs percentile": "CAT 2026 Complete Preparation Guide",
  "snap exam preparation":  "MBA Exams Beyond CAT",
  "xat decision making preparation": "MBA Exams Beyond CAT",
  "mba placements iim vs non iim": "Placements and Salary Trends Post-MBA",
  "profile building for mba admissions": "Profile Building and Certifications",
  "cat repeater strategy":  "Myths and Hurdles in MBA Preparation",
  "how to improve cat score in last 3 months": "CAT 2026 Complete Preparation Guide",
};

// ─── B-School URLs ────────────────────────────────────────────────────────────

const BSCHOOLS = [
  { name: "IIM Ahmedabad",    url: "https://www.iima.ac.in/programmes/post-graduate-programmes/pgp" },
  { name: "IIM Bangalore",    url: "https://www.iimb.ac.in/pgp" },
  { name: "IIM Calcutta",     url: "https://www.iimcal.ac.in/programs/pgdm" },
  { name: "IIM Lucknow",      url: "https://iiml.ac.in/pgp" },
  { name: "IIM Kozhikode",    url: "https://iimk.ac.in/academics/pgp/" },
  { name: "IIM Indore",       url: "https://www.iimidr.ac.in/academic-programmes/pgp/" },
  { name: "XLRI Jamshedpur",  url: "https://www.xlri.ac.in/pgdm/" },
  { name: "SPJIMR Mumbai",    url: "https://www.spjimr.org/programme/pgdm/" },
  { name: "MDI Gurgaon",      url: "https://www.mdi.ac.in/programme/pgpm" },
  { name: "FMS Delhi",        url: "http://www.fms.edu/programmes/mba.aspx" },
  { name: "IIFT Delhi",       url: "https://www.iift.ac.in/iift/index.cfm" },
  { name: "NMIMS Mumbai",     url: "https://www.nmims.edu/schools/school-of-business-management/programmes/mba/" },
  { name: "SIBM Pune",        url: "https://www.sibmpune.edu.in/mba-programme" },
  { name: "IMT Ghaziabad",    url: "https://www.imt.edu/pgdm/" },
  { name: "Great Lakes Chennai", url: "https://www.greatlakes.edu.in/pgpm/" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogArticle {
  title: string;
  seo_title: string;
  meta_description: string;
  excerpt: string;
  content: string;
  faq: Array<{ question: string; answer: string }>;
  tags: string[];
  focus_keyword: string;
}

interface BSchoolChange {
  name: string;
  url: string;
  changedSnippet: string;
}

interface PublishedPost {
  id: string;
  slug: string;
  title: string;
  wordCount: number;
  featuredImage: string | null;
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

function countWords(html: string): number {
  return stripHtml(html).split(/\s+/).filter((w) => w.length > 0).length;
}

/** Midnight IST expressed as a UTC ISO string — used for daily post count */
function todayISTStartUTC(): string {
  const IST_MS = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(Date.now() + IST_MS);
  const midnightIST = new Date(
    Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()) - IST_MS
  );
  return midnightIST.toISOString();
}

async function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.warn("[telegram] Failed:", err);
  }
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

function buildRegularPrompt(
  keyword: string,
  pillar: string,
  redditInsights: string,
  existingPostsList: string
): string {
  return `You are a Gen Z content writer for Percentilers (percentilers.in), India's top online CAT exam coaching platform.

Write a blog article about: "${keyword}"
Pillar Category: ${pillar}

Real student discussions from Reddit about this topic:
${redditInsights}

EXISTING BLOG POSTS ON THE SITE (cross-link to 2-3 relevant ones naturally):
${existingPostsList || "No existing posts yet."}

SITE PAGES TO LINK (weave 3-5 naturally):
- https://percentilers.in — Homepage
- https://percentilers.in/courses/cat-omet — CAT + OMET full coaching
- https://percentilers.in/masterclass — Expert-led Masterclass
- https://percentilers.in/masterclass/watch — Watch Masterclass
- https://percentilers.in/mentorship — 1-on-1 Mentorship
- https://percentilers.in/free-cat-readiness-assessment — Free CAT Readiness Assessment
- https://percentilers.in/cat-daily-study-planner — CAT Daily Study Planner
- https://percentilers.in/free-courses — Free Courses

WRITING STYLE:
- Gen Z conversational tone like a brilliant senior sharing real gyaan after cracking CAT
- Mix short punchy sentences with detailed explanations
- Use phrases like real talk, ngl, lowkey, tbh sparingly and naturally
- Second person: you, your prep, your score, your strategy
- Include relatable scenarios and be opinionated
- Challenge common myths
- FORBIDDEN words: comprehensive, delve, crucial, it is worth noting, in conclusion, firstly, moreover, furthermore, utilize, tailored, embark, navigate, landscape
- No listicle abuse — real paragraphs with opinions

CONTENT STRUCTURE:
1. Introduction (150 words): Hook — never start with "In this article"
2. 4 to 6 H2 sections with H3 subheadings where helpful
3. 5 FAQ items: real questions students actually search for
4. Conclusion (100 words) with CTA to percentilers.in

Total word count: 1500 to 2000 words

CRITICAL JSON OUTPUT RULES:
1. Return ONLY raw JSON starting with { and ending with }
2. No markdown, no backticks, no code blocks, no preamble
3. In content HTML use ONLY single quotes for all attributes
4. Never use double quotes inside any JSON string value
5. No trailing commas, no literal newlines inside string values

Return exactly this JSON structure:
{"title":"...","seo_title":"max 60 chars","meta_description":"max 155 chars","excerpt":"2-3 sentences","content":"full HTML article","faq":[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}],"tags":["tag1","tag2","tag3","tag4","tag5"],"focus_keyword":"primary keyword"}`;
}

function buildNewsPrompt(
  schoolName: string,
  sourceUrl: string,
  changedSnippet: string,
  redditInsights: string
): string {
  return `You are a breaking news writer for Percentilers (percentilers.in), India's top CAT coaching platform.

A B-school website has been updated. Write an urgent, informative news post for CAT/MBA aspirants.

School: ${schoolName}
Page URL: ${sourceUrl}
Detected change snippet: ${changedSnippet}
Reddit pulse: ${redditInsights}

RULES:
- Urgent but calm tone like a helpful senior alerting batchmates
- Lead with what changed and why it matters RIGHT NOW for aspirants
- Include any dates/deadlines visible in the snippet
- Link to the official page: ${sourceUrl}
- End with CTA to percentilers.in/free-cat-readiness-assessment
- 400 to 600 words only

CRITICAL JSON OUTPUT RULES:
1. Return ONLY raw JSON starting with { and ending with }
2. No markdown, no backticks, no code blocks, no preamble
3. In content HTML use ONLY single quotes for all attributes
4. Never use double quotes inside any JSON string value
5. No trailing commas, no literal newlines inside string values

Return exactly this JSON structure (faq array can be empty):
{"title":"...","seo_title":"max 60 chars","meta_description":"max 155 chars","excerpt":"2-3 sentences","content":"full HTML article","faq":[],"tags":["tag1","tag2","tag3","tag4","tag5"],"focus_keyword":"primary keyword"}`;
}

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(prompt: string, apiKey: string): Promise<BlogArticle> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 8192 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${await res.text()}`);

  const json = await res.json();
  let raw: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip markdown fences if Gemini wraps the output
  raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  const first = raw.indexOf("{");
  const last  = raw.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON object in Gemini response");

  return JSON.parse(raw.slice(first, last + 1)) as BlogArticle;
}

// ─── Imagen 3 — hero image ────────────────────────────────────────────────────

async function generateImage(
  keyword: string,
  slug: string,
  apiKey: string,
  supabase: SupabaseClient
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{
            prompt: `Professional educational illustration for a blog post about '${keyword}' for Indian MBA/CAT exam aspirants. Modern, clean, inspiring. Study books, IIM campus, students studying. Warm colors. No text in image.`,
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            safetyFilterLevel: "block_some",
            personGeneration: "allow_adult",
          },
        }),
      }
    );

    if (!res.ok) { console.warn(`[imagen] HTTP ${res.status}`); return null; }

    const json = await res.json();
    const b64: string | undefined = json?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) { console.warn("[imagen] No base64 payload"); return null; }

    // Decode → Uint8Array
    const binary = atob(b64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const path = `blog/${slug}/${slug}-hero.jpg`;
    const { error: uploadErr } = await supabase.storage
      .from("blog-images")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });

    if (uploadErr) { console.warn("[imagen] Upload failed:", uploadErr.message); return null; }

    const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
    return pub?.publicUrl ?? null;
  } catch (err) {
    console.warn("[imagen] Error:", err);
    return null;
  }
}

// ─── Schema.org markup ────────────────────────────────────────────────────────

function buildSchemaMarkup(
  article: BlogArticle,
  slug: string,
  featuredImage: string | null
): string {
  const today   = new Date().toISOString().slice(0, 10);
  const pageUrl = `https://percentilers.in/blog/${slug}`;

  const faqHtml = article.faq.length > 0
    ? `<div class='faq-section'><h2>Frequently Asked Questions</h2>${
        article.faq.map(f =>
          `<div class='faq-item'><h3>${f.question}</h3><p>${f.answer}</p></div>`
        ).join("")
      }</div>`
    : "";

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.meta_description,
    keywords: article.focus_keyword,
    image: featuredImage,
    author: { "@type": "Organization", name: "Percentilers", url: "https://percentilers.in" },
    publisher: {
      "@type": "Organization",
      name: "Percentilers",
      logo: { "@type": "ImageObject", url: "https://percentilers.in/favicon.ico" },
    },
    datePublished: today,
    dateModified: today,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
  };

  const blogSchema = `<script type='application/ld+json'>${JSON.stringify(blogPosting)}</script>`;

  let faqSchema = "";
  if (article.faq.length > 0) {
    faqSchema = `<script type='application/ld+json'>${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map(f => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    })}</script>`;
  }

  return faqHtml + blogSchema + faqSchema;
}

// ─── Unique slug ──────────────────────────────────────────────────────────────

async function generateSlug(title: string, supabase: SupabaseClient): Promise<string> {
  const base = title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  let slug = base;
  let suffix = 2;

  while (true) {
    const { data } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) break;
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

// ─── Publish post (steps F → K) ───────────────────────────────────────────────

async function publishPost(opts: {
  article:        BlogArticle;
  keyword:        string;
  pillar:         string;
  postType:       "blog" | "news";
  sourceUrl:      string | null;
  minWords:       number;
  geminiKey:      string;
  telegramToken:  string;
  telegramChatId: string;
  supabase:       SupabaseClient;
}): Promise<PublishedPost | null> {
  const { article, keyword, pillar, postType, sourceUrl,
          minWords, geminiKey, telegramToken, telegramChatId, supabase } = opts;

  // ── F: Quality gate ──────────────────────────────────────────────────────
  const wordCount = countWords(article.content);
  console.log(`[F] "${keyword}" → ${wordCount} words (min ${minWords})`);

  if (wordCount < minWords) {
    await sendTelegram(telegramToken, telegramChatId,
      `⚠️ Blog generation failed quality check.\nKeyword: ${keyword}\nWord count: ${wordCount} (minimum ${minWords})\nPost was NOT published.`
    );
    return null;
  }

  // ── I: Slug ──────────────────────────────────────────────────────────────
  const slug = await generateSlug(article.title, supabase);

  // ── G: Hero image ────────────────────────────────────────────────────────
  console.log(`[G] Generating image for "${keyword}"…`);
  const featuredImage = await generateImage(keyword, slug, geminiKey, supabase);
  console.log(`[G] Image: ${featuredImage ?? "not available"}`);

  // ── H: Schema markup ─────────────────────────────────────────────────────
  const fullContent = article.content + buildSchemaMarkup(article, slug, featuredImage);

  // ── J: Insert blog_posts ─────────────────────────────────────────────────
  const { data: inserted, error: insertErr } = await supabase
    .from("blog_posts")
    .insert({
      slug,
      title:            article.title,
      seo_title:        article.seo_title,
      content_html:     fullContent,
      content_markdown: "",
      meta_description: article.meta_description,
      excerpt:          article.excerpt,
      featured_image:   featuredImage,
      category:         pillar,
      focus_keyword:    article.focus_keyword,
      tags:             article.tags,
      pillar,
      post_type:        postType,
      source_url:       sourceUrl,
      word_count:       wordCount,
      published:        true,
      published_at:     new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertErr) throw new Error(`DB insert failed: ${insertErr.message}`);
  console.log(`[J] Inserted: /blog/${slug} (${inserted!.id})`);

  // ── K: Global notification for news posts ────────────────────────────────
  if (postType === "news") {
    try {
      await supabase.from("notifications").insert({
        user_id:    null,
        title:      "🚨 " + article.title,
        body:       article.excerpt,
        type:       "news_alert",
        action_url: "/blog/" + slug,
        post_id:    inserted!.id,
        is_global:  true,
        is_read:    false,
      });
      console.log("[K] News notification inserted");
    } catch (err) {
      console.warn("[K] Notification insert failed:", err);
    }
  }

  return { id: inserted!.id, slug, title: article.title, wordCount, featuredImage };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const summary = {
    started_at:   new Date().toISOString(),
    steps:        {} as Record<string, unknown>,
    errors:       [] as string[],
    completed_at: "",
  };

  const geminiKey      = Deno.env.get("GEMINI_API_KEY")            ?? "";
  const telegramToken  = Deno.env.get("TELEGRAM_BOT_TOKEN")        ?? "";
  const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID")          ?? "";
  const supabaseUrl    = Deno.env.get("SUPABASE_URL")!;
  const serviceKey     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ── A: Select keyword ─────────────────────────────────────────────────────
  const dayOfYear = getDayOfYear();
  const keyword   = KEYWORDS[dayOfYear % KEYWORDS.length];
  const pillar    = PILLAR_MAP[keyword] ?? "CAT 2026 Complete Preparation Guide";
  console.log(`[A] Day ${dayOfYear} → "${keyword}" | pillar: "${pillar}"`);
  summary.steps.a_keyword = keyword;

  // ── B: Scrape B-schools ───────────────────────────────────────────────────
  console.log("[B] Scraping B-school sites…");
  const changedSchools: BSchoolChange[] = [];
  const now = new Date().toISOString();

  await Promise.allSettled(
    BSCHOOLS.map(async (school) => {
      try {
        const ctrl = new AbortController();
        const tid  = setTimeout(() => ctrl.abort(), 10_000);

        let html = "";
        try {
          const res = await fetch(school.url, {
            signal: ctrl.signal,
            headers: { "User-Agent": "percentilers-bot/1.0" },
          });
          html = await res.text();
        } finally {
          clearTimeout(tid);
        }

        const text = stripHtml(html).slice(0, 3000);
        const hash = simpleHash(text);

        const { data: existing } = await supabase
          .from("bschool_snapshots")
          .select("id, last_content_hash")
          .eq("url", school.url)
          .maybeSingle();

        if (!existing) {
          await supabase.from("bschool_snapshots").insert({
            school_name:      school.name,
            url:              school.url,
            last_content_hash: hash,
            last_checked_at:  now,
          });
        } else if (existing.last_content_hash !== hash) {
          await supabase
            .from("bschool_snapshots")
            .update({
              last_content_hash: hash,
              last_checked_at:   now,
              last_changed_at:   now,
            })
            .eq("id", existing.id);

          changedSchools.push({
            name: school.name,
            url:  school.url,
            changedSnippet: text.slice(0, 800),
          });
          console.log(`[B] Change detected: ${school.name}`);
        } else {
          await supabase
            .from("bschool_snapshots")
            .update({ last_checked_at: now })
            .eq("id", existing.id);
        }
      } catch (err) {
        console.warn(`[B] Failed: ${school.name} — ${err}`);
      }
    })
  );

  console.log(`[B] Done. ${changedSchools.length} school(s) changed.`);
  summary.steps.b_changed = changedSchools.map((s) => s.name);

  // ── C: Reddit research ────────────────────────────────────────────────────
  console.log("[C] Fetching Reddit insights…");
  let redditInsights = "";

  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res = await fetch(
        `https://www.reddit.com/r/CATpreparation/search.json?q=${encodeURIComponent(keyword)}&sort=top&t=year&limit=5`,
        { signal: ctrl.signal, headers: { "User-Agent": "percentilers-bot/1.0" } }
      );
      const json = await res.json();
      const posts: Array<{ data: { title: string; selftext: string; score: number } }> =
        json?.data?.children ?? [];

      if (posts.length > 0) {
        redditInsights = posts
          .map((p) => `- "${p.data.title}": ${(p.data.selftext ?? "").slice(0, 200)} (${p.data.score} upvotes)`)
          .join("\n");
      }
    } finally {
      clearTimeout(tid);
    }
  } catch (err) {
    console.warn("[C] Reddit failed:", err);
  }

  if (!redditInsights) {
    redditInsights = `CAT aspirants commonly ask about ${keyword}. Real students struggle with where to start, how much time to spend, and whether they are doing enough. Honest experience-backed advice works best.`;
  }
  summary.steps.c_reddit = redditInsights.startsWith("CAT aspirants") ? "fallback" : "live";

  // ── D: Existing posts for cross-linking ───────────────────────────────────
  console.log("[D] Fetching existing posts…");
  let existingPostsList = "";

  try {
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("title, slug")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(20);

    if (posts?.length) {
      existingPostsList = posts
        .map((p: { title: string; slug: string }) =>
          `- ${p.title}: https://percentilers.in/blog/${p.slug}`
        )
        .join("\n");
    }
  } catch (err) {
    console.warn("[D] Failed:", err);
  }

  // ── E: Daily limit check ──────────────────────────────────────────────────
  console.log("[E] Checking daily post limit…");
  const todayStart = todayISTStartUTC();

  const checkLimit = async (): Promise<number> => {
    const { count } = await supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart);
    return count ?? 0;
  };

  if (await checkLimit() >= 2) {
    console.log("[E] Daily limit reached — aborting");
    await sendTelegram(telegramToken, telegramChatId, "⚠️ Daily limit reached. No new post generated.");
    summary.steps.e_limit = "reached";
    summary.completed_at = new Date().toISOString();
    return new Response(JSON.stringify({ ...summary, result: "daily_limit_reached" }, null, 2), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  // ── Generate regular blog post ────────────────────────────────────────────
  let regularPost: PublishedPost | null = null;

  try {
    console.log(`[E] Generating regular post for "${keyword}"…`);
    const article = await callGemini(
      buildRegularPrompt(keyword, pillar, redditInsights, existingPostsList),
      geminiKey
    );

    regularPost = await publishPost({
      article, keyword, pillar,
      postType: "blog", sourceUrl: null, minWords: 1000,
      geminiKey, telegramToken, telegramChatId, supabase,
    });

    if (regularPost) {
      summary.steps.regular_post = regularPost.slug;
      console.log(`[J] Regular post live: /blog/${regularPost.slug}`);
    }
  } catch (err) {
    const msg = String(err);
    console.error("[regular] Error:", msg);
    summary.errors.push(`regular_post: ${msg}`);
  }

  // ── M: News post if any B-school changed ──────────────────────────────────
  let newsPost: PublishedPost | null = null;

  if (changedSchools.length > 0 && await checkLimit() < 2) {
    const school = changedSchools[0];
    try {
      console.log(`[M] Generating news post for ${school.name}…`);
      const newsArticle = await callGemini(
        buildNewsPrompt(school.name, school.url, school.changedSnippet, redditInsights),
        geminiKey
      );

      newsPost = await publishPost({
        article: newsArticle,
        keyword: `${school.name} update`,
        pillar:  "MBA Admissions in India",
        postType: "news",
        sourceUrl: school.url,
        minWords: 400,
        geminiKey, telegramToken, telegramChatId, supabase,
      });

      if (newsPost) {
        summary.steps.news_post = newsPost.slug;
        console.log(`[M] News post live: /blog/${newsPost.slug}`);
      }
    } catch (err) {
      const msg = String(err);
      console.error("[news] Error:", msg);
      summary.errors.push(`news_post: ${msg}`);
    }
  }

  // ── L: Telegram summary ───────────────────────────────────────────────────
  console.log("[L] Sending Telegram summary…");

  if (regularPost) {
    const newsLine = newsPost
      ? `\n\n🚨 <b>News Post:</b> ${newsPost.title}\n🏫 <b>Source:</b> ${changedSchools[0]?.url ?? ""}`
      : "";

    await sendTelegram(telegramToken, telegramChatId,
      `✅ <b>New Blog Published!</b>\n\n` +
      `📌 <b>Keyword:</b> ${keyword}\n` +
      `📝 <b>Title:</b> ${regularPost.title}\n` +
      `🔗 <b>URL:</b> https://percentilers.in/blog/${regularPost.slug}\n` +
      `📊 <b>Words:</b> ${regularPost.wordCount}\n` +
      `🖼 <b>Image:</b> ${regularPost.featuredImage ? "generated" : "not available"}\n` +
      `📚 <b>Pillar:</b> ${pillar}` +
      newsLine
    );
  } else if (summary.errors.length > 0) {
    await sendTelegram(telegramToken, telegramChatId,
      `❌ <b>Blog automation failed</b>\n\n${summary.errors.join("\n")}`
    );
  }

  summary.completed_at = new Date().toISOString();
  summary.steps.l_telegram = "sent";

  return new Response(JSON.stringify(summary, null, 2), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
