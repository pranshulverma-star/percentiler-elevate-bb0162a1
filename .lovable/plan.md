

## Fix: Subpages Opening at Bottom of Page

### Problem

When navigating to subpages (e.g., `/masterclass`, `/courses/cat-omet`), the page opens at the current scroll position instead of the top. This happens because `ScrollToHash` in `App.tsx` only watches the `hash` value. When navigating between routes that both have no hash, the `useEffect` doesn't re-trigger since its dependency (`hash`) hasn't changed.

### Fix

**File: `src/App.tsx`** -- Update `ScrollToHash` to also depend on `pathname`:

```typescript
function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);
  return null;
}
```

Adding `pathname` to the dependency array ensures `window.scrollTo(0, 0)` fires on every route change, not just hash changes. Single-line change, no side effects.
