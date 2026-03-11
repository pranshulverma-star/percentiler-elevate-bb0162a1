

## Plan: Split LRDI into Subtopic-Based Chapters

### Problem
Currently, `buildChaptersFromRaw()` groups questions by `topic`, resulting in only 2 broad chapters for LRDI: "Logical Reasoning" and "Data Interpretation". The user wants granular chapters like "Elections & Campaigns", "Tournament Scheduling", "Candlestick Charts", etc.

### Solution
Use `subtopic` instead of `topic` as the chapter key for LRDI questions. The `subtopic` field already contains the right values (e.g., "Elections & Campaigns", "Tournament Scheduling", "Candlestick Charts", "Web Surfers & Bloggers", "Countries Visited").

### Changes

**`src/data/practiceLabQuestions.ts`** — one change:
- Modify `buildChaptersFromRaw` to accept an optional `useSubtopic` flag, or create a separate approach: pass a `chapterKey` parameter (`"topic"` or `"subtopic"`)
- When building LRDI chapters, use `subtopic` as the grouping key
- This gives us 5 distinct LRDI chapters from the existing data

No other files need changes — the chapter list, quiz selection, and shuffling all work off the `Chapter[]` array already.

