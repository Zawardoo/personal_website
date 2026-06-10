# CLAUDE.md — Technical Architecture

This file documents the codebase for Claude Code sessions. Read this before making changes.

---

## File Structure

```
moj_web/
├── index.html              ← Splash landing page (data-page="splash")
├── qa-automatizacia.html   ← QA testing service page (data-page="testing")
├── tvorba-webov.html       ← Web development service page (data-page="webdev")
├── src/
│   ├── css/
│   │   └── styles.css      ← All styles (~1300 lines)
│   └── js/
│       ├── main.js         ← Entry point: imports and inits all modules
│       ├── router.js       ← Page detection, smooth scroll, CV dropdown
│       ├── nav.js          ← Navbar scroll state, section mapping, hamburger
│       ├── parallax.js     ← Hero element parallax on scroll
│       ├── reveal.js       ← IntersectionObserver scroll reveal
│       ├── spotlight.js    ← Card cursor-tracking glow effect
│       ├── forms.js        ← Contact form validation & submission
│       ├── i18n.js         ← EN/SK language toggle
│       └── sphere/         ← [DEAD CODE] WebGL sphere (removed, not imported)
├── dist/
│   ├── css/styles.min.css  ← Built CSS
│   └── js/bundle.min.js    ← Built JS (~16 KB)
├── vercel.json             ← Vercel config with page-specific rewrites
├── sitemap.xml             ← SEO sitemap
├── robots.txt              ← Crawler rules
├── CLAUDE.md               ← This file
└── build.js                ← Build script (esbuild + terser + clean-css)
```

---

## Multi-Page Architecture

The site uses **real separate HTML pages** (not SPA routing) for SEO:

| URL | HTML file | `data-page` | Theme |
|-----|-----------|-------------|-------|
| `/` | `index.html` | `splash` | Purple (default) |
| `/qa-automatizacia` | `qa-automatizacia.html` | `testing` | Purple (default) |
| `/tvorba-webov` | `tvorba-webov.html` | `webdev` | Blue (CSS var overrides) |

Page detection: `document.body.dataset.page` — used by router.js, nav.js, parallax.js.

Vercel rewrites map clean URLs to `.html` files. Legacy hash redirects (`#testing` → `/qa-automatizacia`) in index.html.

---

## CSS Architecture

### Design Tokens

Purple theme (default):
```css
--accent: #8B5CF6; --accent-2: #A855F7; --accent-3: #C084FC;
--accent-glow: rgba(139, 92, 246, 0.45);
--border: rgba(139, 92, 246, 0.13); --border-strong: rgba(168, 85, 247, 0.28);
```

Blue theme (`body[data-page="webdev"]` overrides):
```css
--accent: #38BDF8; --accent-2: #0EA5E9; --accent-3: #7DD3FC;
--accent-glow: rgba(56, 189, 248, 0.45);
--border: rgba(56, 189, 248, 0.13); --border-strong: rgba(14, 165, 233, 0.28);
```

### Z-index Stack

| Layer | z-index | Element |
|-------|---------|---------|
| Background grid | 0 | `.bg-grid` |
| Page content | 1 | `.hero`, sections, footer |
| Hero glow | 1 | `.hero-glow` |
| Nav | 100 | `nav#navbar` |

### Glassmorphism Contact Form

The contact form uses a custom glass design:
- **Container** `.glass-form`: `backdrop-filter: blur(24px) saturate(130%)`, dark glass bg `rgba(15, 10, 30, 0.45)`, with `@supports` fallback
- **Fields** `.glass-field`: Floating labels via CSS `:placeholder-shown` + sibling selector. Labels sit inside inputs at rest, slide up to mono uppercase on focus/filled
- **Left accent bar**: `border-left: 2px solid var(--border-strong)` → `var(--accent)` on focus
- **Focus light**: `::before` pseudo-element with `var(--accent-glow)` radial gradient, `opacity: 0` → `0.15` on `:focus-within`
- **Error states**: Red accent bar, `fieldShake` animation, error text slides in with height/opacity transition
- **Label DOM order**: `<input>` then `<label>` (required for CSS `+` sibling selectors)
- **Placeholder trick**: `placeholder=" "` (space) enables `:placeholder-shown` detection

### Entrance Animations

`@keyframes rotoscopeIn` — slides up with blur dissolve. Staggered via `.d1`–`.d4` delay classes.

`.reveal` class + IntersectionObserver → adds `.visible` class for scroll-triggered entrance.

### Card Spotlight

`.feature` and `.skill-card` use `--mx`/`--my` CSS vars (set by spotlight.js on mousemove) for cursor-tracking radial gradient glow.

---

## JS Modules

| Module | Purpose |
|--------|---------|
| `router.js` | Reads `data-page`, smooth scroll for `#anchor` links, CV dropdown toggle |
| `nav.js` | Scroll class on nav, section ID mapping per page, hamburger menu |
| `parallax.js` | Hero element parallax (skipped on splash page) |
| `reveal.js` | IntersectionObserver scroll reveal |
| `spotlight.js` | Card cursor glow with lazy rect caching (WeakMap + stale flag) |
| `forms.js` | Contact form validation & fetch POST to `/api/contact` |
| `i18n.js` | EN/SK language toggle via `data-i18n` attributes |

### forms.js

`initForm(formId, fieldDefs, submitTextId, successId, formType)` — generic form handler.
- Adds `.invalid` class to input, `.show` class to `.err` div
- POSTs JSON to `/api/contact` with `{name, email, message, form}`
- Two instances: `contactForm` (QA page) and `contactFormWd` (webdev page)

---

## Common Edits

### Add a new section
1. Add HTML between existing sections in the relevant `.html` file
2. Add CSS to `src/css/styles.css`
3. Add `.reveal` class to animatable elements — scroll reveal is automatic
4. Run `npm run build`

### Update contact info
Search for `hello@jozefanyalai.com` across all HTML files.

### Change theme colors
Edit CSS variables in `:root` (purple) or `body[data-page="webdev"]` (blue) in `styles.css`.

### Modify contact form fields
1. Edit HTML in both `qa-automatizacia.html` and `tvorba-webov.html`
2. Keep label AFTER input for floating label CSS to work
3. Keep `placeholder=" "` on inputs
4. Update `forms.js` field definitions if IDs change
