

## Plan: Support Grouped Questions (RC Passages, LR Sets)

### Problem
Currently, `pickRandom()` shuffles individual questions. For RC passages (1 passage + 4 questions) or LR sets (1 set + 4 questions), the group must stay together.

### Approach

**1. Add `group_id` to the data model**
- Add optional `group_id?: string` and `group_context?: string` (the passage/set description or image) fields to `PracticeQuestion` interface
- Questions sharing a `group_id` always appear together, with `group_context` displayed once above them

**2. Update `pickRandom()` in PracticeLab.tsx**
- Group questions by `group_id` (ungrouped questions = group of 1)
- Shuffle **groups**, not individual questions
- Pick groups until we hit ~10 questions (may slightly exceed 10 to keep a set intact)
- Within a group, preserve original order (Q1-Q4 stay sequential)

**3. Update Quiz UI in PracticeLab.tsx**
- When rendering a question with `group_context`, show the passage/image above the question
- For consecutive questions in the same group, show the context only once (sticky or collapsible)

**4. Data format when you upload the PDF**
- I'll parse it and assign matching `group_id` values to questions that belong together
- The passage text or set description goes into `group_context`
- Images (if any) go into the existing `image` field

### Example data structure
```json
{
  "id": 118,
  "group_id": "rc-set-1",
  "group_context": "Read the following passage and answer questions 118-121...",
  "question": "What is the main idea of the passage?",
  "options": {"1": "Option A", "2": "Option B", "3": "Option C", "4": "Option D"},
  "correct_answer": "2",
  "topic": "Reading Comprehension",
  "subtopic": "Main Idea"
}
```

### Files to change
- `src/data/practiceLabQuestions.ts` — add `group_id`, `group_context` to interface; pass through from JSON
- `src/pages/PracticeLab.tsx` — rewrite `pickRandom` to shuffle groups; update quiz UI to render group context
- `src/pages/BattleRoom.tsx` — same group-aware shuffle
- `src/data/questions_full.json` — new grouped questions added after PDF parsing

