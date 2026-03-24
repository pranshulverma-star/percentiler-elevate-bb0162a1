

## Plan: Speakable Schema + Quick Answer Box for Blog Posts

### Overview
Two additions to every blog post page: (1) a Speakable JSON-LD schema marking the most quotable content for voice assistants, and (2) a visible "Quick Answer" box at the top of the article body that gives AI engines a concise, citation-worthy summary.

### Changes

**1. BlogJsonLd.tsx — Add Speakable schema**
- Add a `speakable` property to the existing `BlogPosting` JSON-LD schema
- Use CSS selectors targeting the Quick Answer box and the article's H1: `cssSelector: [".quick-answer", "h1"]`
- This tells Google Assistant and AI crawlers which sections are most quotable

**2. BlogPost.tsx — Add Quick Answer box UI**
- Render a styled box between the featured image and the article body
- Content: the post's `meta_description` (already a 1-2 sentence summary of each post — perfect for this purpose)
- Only render if `meta_description` exists
- Box gets the class `quick-answer` so the Speakable schema can reference it
- Styling: light background, left orange border, subtle icon (Lightbulb or Zap), "Quick Answer" label, concise text

**3. index.css — Quick Answer box styling**
- `.quick-answer` styles: background `#fff8f5`, border-left `4px solid #FF6B35`, border-radius `0 8px 8px 0`, padding, margin-bottom
- Label: uppercase, small, bold, orange
- Text: `font-size: 1.05rem`, `line-height: 1.7`, dark color

### File Changes

| File | What |
|------|------|
| `src/components/blog/BlogJsonLd.tsx` | Add `speakable` property with cssSelector to BlogPosting schema |
| `src/pages/BlogPost.tsx` | Add Quick Answer box between featured image and article body |
| `src/index.css` | Add `.quick-answer` styles |

### Quick Answer Box Design

```text
┌─────────────────────────────────────┐
│ ⚡ QUICK ANSWER                     │
│                                     │
│ [meta_description text here — the   │
│  2-3 sentence summary of the post]  │
└─────────────────────────────────────┘
```

- Orange left border, light warm background
- Appears right before the main content
- Semantically marked up with the `quick-answer` class for Speakable targeting

