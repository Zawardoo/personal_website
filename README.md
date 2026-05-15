# moj_web — Jozef Anyalai Portfolio

Personal portfolio site for Jozef Anyalai, QA Automation / Backend / DevOps engineer.

**Live stack:** vanilla HTML + CSS + JS, zero dependencies, WebGL sphere background.

---

## Quick start

Just open `index.html` in a browser — no build step, no server required.

For a local dev server with live reload:
```bash
npx serve .
# or
python -m http.server 8080
```

---

## Project structure

```
moj_web/
├── index.html          ← Lean HTML shell (no inline CSS or JS)
├── css/
│   └── styles.css      ← All styles
├── js/
│   ├── sphere.js       ← WebGL liquid glass sphere (self-contained IIFE)
│   └── main.js         ← Nav, parallax, scroll reveal, card spotlight, form
├── CLAUDE.md           ← Technical architecture (for AI-assisted editing)
└── README.md           ← This file
```

---

## Common edits

### Text content
All copy lives in `index.html`. Search for the relevant section by its comment (`<!-- HERO -->`, `<!-- ABOUT -->`, etc.).

### Colors / design tokens
CSS custom properties are at the top of `css/styles.css` inside `:root { ... }`.

```css
--accent:   #8B5CF6;   /* primary purple */
--accent-2: #A855F7;
--accent-3: #C084FC;
--bg-0:     #07060d;   /* darkest background */
--text:     #ECE6F7;   /* primary text */
```

### Sphere size
Change `float R = 0.34` in **two places** inside `js/sphere.js` (in `liquidField()` and in `main()`) and also `const SPHERE_R = 0.34` in the same file. All three must match.

### Sphere position (horizontal)
Change `uv.x -= 0.20` in the shader `main()` in `js/sphere.js` and `const SPHERE_OFF_X = 0.20` in the JS section of the same file.

### Sphere colors
Find `cValley`, `cMid`, `cRidge` in `js/sphere.js`. Values are `vec3(r, g, b)` in linear light (0.0–1.0).

### Add a new section
1. Add HTML in `index.html` between existing sections
2. Add CSS at the bottom of `css/styles.css`
3. Add `.reveal` class to any elements you want to animate in on scroll — handled automatically by `main.js`

### Contact info
Search `index.html` for `hello@anyalai.dev` and `jozefanyalai` to update email and social links.

---

## Architecture notes

See `CLAUDE.md` for a deep technical breakdown of:
- WebGL/GLSL shader architecture (SDF metaballs, normal reconstruction, lighting)
- CSS z-index stack and animation system
- JS input state machine (mouse, drag, touch)
- Critical constants that must stay in sync across files
