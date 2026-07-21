---
name: Per-blog custom themes
description: How to add a full-page custom theme to a specific blog (pysy-exe pattern, extended to putzermann-core henry.codes style).
---

# Per-blog custom themes

Each blog page can have a completely custom look without affecting the rest of the app.

## Pattern

1. **Hook** — `artifacts/mzt/src/lib/use-<name>-theme.ts`
   - Uses `useLocation()` from wouter; returns `true` when pathname === `/blogs/<handle>`.

2. **CSS** — `artifacts/mzt/src/index.css`
   - Add a `:root.<name>-theme, .dark.<name>-theme` block to override CSS variables (colors, fonts).
   - Add utility classes prefixed with the theme name (e.g. `.henry-window`, `.henry-button`, `.henry-text`, `.henry-sunken`).

3. **ThemeEffect in App.tsx** — Toggle the root class:
   ```tsx
   if (isPutzermannHenry) {
     document.documentElement.classList.add('putzermann-henry-theme');
   } else {
     document.documentElement.classList.remove('putzermann-henry-theme');
   }
   ```

4. **BlogLayout** — Import the hook; apply theme classes to the wrapper div and header.

5. **AppSidebar** — Import the hook; branch on `isPutzermannHenry` everywhere `isPysyTheme` is branched.

6. **Blog page** (`[username].tsx`) — Import via `const isPutzermann = blog?.handle === 'putzermann-core'` already exists; replace inline dark styles (`bg-[#151515]`, `text-white/40`, etc.) with named CSS utility classes from the theme.

## Existing themes

- `pysy-exe` → `pysy-theme` CSS class, `win95-*` utilities (Win95/teal palette).
- `putzermann-core` → `putzermann-henry-theme` CSS class, `henry-*` utilities (pixel/bitmap monochrome, VT323 font, black/white, dot-grid background).

**Why:** Inline styles scattered across a 1400-line component are hard to maintain. Named CSS utility classes keep theme-specific styling centralised and consistent.

**How to apply:** Any new blog theme follows the same 5-step pattern above. Keep all theme-specific CSS in `index.css` under the root class selector block, and create thin `use-*-theme.ts` hooks.
