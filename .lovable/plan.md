

## Plan: Resize Auth Buttons — Taller & Narrower

### Changes

**`src/components/AuthButtons.tsx`**
- Increase button height from `h-11` (44px) to `h-14` (56px) for both Google and Apple buttons
- Constrain horizontal width with `max-w-[280px] mx-auto` on the wrapper so buttons don't stretch full-width
- Remove `flex-1` from buttons (no longer needed since wrapper constrains width)
- Buttons become `w-full` within the narrower container

