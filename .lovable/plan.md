

## Plan: Replace "2025" → "2026" in Blog Posts

### What
Update all blog posts that mention "2025" in their title or content, replacing it with "2026". This is a data-only change — no code modifications needed.

### How
Use the database insert tool to run a single `UPDATE` statement replacing "2025" with "2026" across four columns: `title`, `content_html`, `content_markdown`, and `meta_description`.

```sql
UPDATE blog_posts
SET
  title = REPLACE(title, '2025', '2026'),
  content_html = REPLACE(content_html, '2025', '2026'),
  content_markdown = REPLACE(content_markdown, '2025', '2026'),
  meta_description = REPLACE(meta_description, '2025', '2026')
WHERE
  title ILIKE '%2025%'
  OR content_html ILIKE '%2025%'
  OR content_markdown ILIKE '%2025%'
  OR meta_description ILIKE '%2025%';
```

### Affected Posts (titles containing "2025")
- CAT Syllabus 2025
- CAT Cutoff 2025
- CAT Registrations 2025 (×2)
- Eligibility For CAT Exam 2025
- CAT Application Form 2025
- Cast Reservation In CAT exam 2025
- 7 Common Mistakes to Avoid on CAT Exam Day 2025
- OMET Exams 2025

Plus ~42 posts with "2025" in their body content.

### File Changes
None — this is a database data update only.

