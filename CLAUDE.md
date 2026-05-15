# CLAUDE.md — Technical Architecture

This file documents the codebase for Claude Code sessions. Read this before making changes.

---

## File Structure

```
moj_web/
├── index.html          ← Lean HTML shell, no inline CSS or JS
├── css/
│   └── styles.css      ← All styles (~400 lines)
├── js/
│   ├── sphere.js       ← WebGL liquid glass sphere (self-contained IIFE)
│   └── main.js         ← Nav, parallax, scroll reveal, card spotlight, form
├── CLAUDE.md           ← This file
└── README.md           ← Project overview and editing guide
```

---

## Critical Constants (must stay in sync)

Two constants are duplicated between the shader (GLSL) and JavaScript. If you change one, change the other:

| Value | Shader location | JS location |
|-------|----------------|-------------|
| `0.20` (sphere X offset) | `uv.x -= 0.20` in `main()` | `const SPHERE_OFF_X = 0.20` |
| `0.34` (sphere radius) | `float R = 0.34` in `liquidField()` and `main()` | `const SPHERE_R = 0.34` |

These control where `updateCursorUV()` maps cursor screen coordinates into shader UV space.

---

## WebGL Sphere (`js/sphere.js`)

### Architecture overview

A fullscreen quad (`TRIANGLE_STRIP`) with a fragment shader that ray-marches a 2D signed distance field and reconstructs a 3D normal for lighting.

### Canvas setup

- `position: fixed; inset: 0; z-index: 0; pointer-events: none` — fullscreen, behind all content
- DPR-aware sizing: `canvas.width = innerWidth * min(devicePixelRatio, 2)`
- `alpha: true, premultipliedAlpha: true` + `blendFunc(ONE, ONE_MINUS_SRC_ALPHA)` for correct transparency compositing

### Shader: SDF metaball system

**`smax(a, b, k)`** — smooth union of two inside-positive SDF fields:
```glsl
float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
return mix(b, a, h) + k*h*(1.0-h);
```
`k` is the blend radius. Larger = rounder joint. Current value for all joints: `0.11`.

**`liquidField(p, t, drag)`** — combined metaball field returning positive-inside values:
- Main sphere: `R - length(p)` where `R = 0.34`
- Drag pull-blob: emerges from sphere in drag direction — actual silhouette deformation
- 5 satellite droplets: orbit radii oscillate `0.32 → 0.54` via `sin()`, creating smooth merge/separate
- Early discard: `if(f0 < -0.012) discard` avoids unnecessary fragment computation

### Shader: Normal reconstruction

2D field gradient → 3D normal using spherical approximation:
```glsl
float e2  = 0.009;   // wide step to span smax blend region, avoids saddle-point kink
float gfx = liquidField(uv+vec2(e2,0.), T, u_drag) - liquidField(uv-vec2(e2,0.), T, u_drag);
float gfy = liquidField(uv+vec2(0.,e2), T, u_drag) - liquidField(uv-vec2(0.,e2), T, u_drag);

float dsurf = max(R - f0, 0.0);
float zsurf = sqrt(max(0.0, R*R - dsurf*dsurf));
vec3  N     = normalize(vec3(dsurf * nxy, zsurf));
float depth = zsurf / R;  // 1.0 at centre, 0.0 at silhouette edge
```
Exact for the main sphere; approximate but correct for satellite blobs (each blob's front face is (0,0,1) toward viewer).

### Shader: Seam artifact fix

Dark disk artifact at droplet-sphere junctions is fixed by three settings:
1. **Smooth blend radius** `k = 0.11` (was 0.075) — wider smax blend region
2. **Gradient step** `e2 = 0.009` (was 0.0045) — spans the blend region, no saddle-point kink
3. **Depth-weighted bump** `bumpAmp *= clamp(depth * 4.0, 0.10, 1.0)` — suppresses bump at grazing-angle seams where it would tilt normals backward into the surface

### Shader: Rotation convention

Cursor hover: moves `ry` and `rx` so surface tracks cursor naturally.
```glsl
float ry = -u_mouse.x*.90 + u_rot.x;  // negative = correct direction
float rx =  u_mouse.y*.55 + u_rot.y;  // positive = correct direction
```

Drag accumulation: negated deltas = correct direction.
```js
rot.vx -= deltaX * 0.00018;  // negative
rot.vy -= deltaY * 0.00018;  // negative
```

**Do not flip these signs** — they were deliberately corrected.

### Shader: Texture system

`slime(p, t)` — domain-warped fBm (2 warp levels) for the liquid surface texture. Runs in rotated normal-space so the texture appears fixed to the sphere surface.

`n3(p)` — value noise using hash + quintic interpolation. 4-octave fBm.

Bump mapping: central differences of `slime()` in normal-space → rotated back to view space → added to geometric normal as a small perturbation.

### JS: Input system

| State | Description |
|-------|-------------|
| `mouse.{x,y}` | Smoothed (lerp 0.055) normalized cursor position for lighting |
| `rot.{x,y}` | Accumulated rotation angle (spring-damped, decay 0.97) |
| `csr.{x,y,force}` | Cursor UV + spring-damped deformation force |
| `dragUV.{x,y}` | Smoothed drag vector for pull-blob deformation |

Drag sources: `document.mousedown/mousemove` + `window.touchstart/touchmove` — fires anywhere on the page.

---

## CSS (`css/styles.css`)

### Z-index stack

| Layer | z-index | Element |
|-------|---------|---------|
| WebGL canvas | 0 | `#sphereCanvas` |
| Background grid | 0 | `.bg-grid` |
| Page content | 1 | `.hero`, sections, footer |
| Hero glow | 1 | `.hero-glow` |
| Nav | 100 | `nav#navbar` |

### Entrance animations

`@keyframes rotoscopeIn` — slides content up from `translateY(32px)` with a fade-in. Applied to hero elements with staggered `animation-delay` (0.1s–0.5s) via `.d1`–`.d4` classes.

Hero elements also get scroll parallax in `main.js`.

### Card spotlight

`.feature` and `.skill-card` use CSS custom properties `--mx` and `--my` (updated on `mousemove` by `main.js`) to render a radial gradient glow following the cursor.

---

## JS: `main.js`

| Feature | Implementation |
|---------|---------------|
| Nav scroll state | `classList.toggle('scrolled', scrollY > 24)` |
| Hero parallax | Different `translateY` multipliers per element, all rAF-throttled |
| Scroll reveal | `IntersectionObserver` on `.reveal` elements, adds `.visible` class |
| Card spotlight | `mousemove` on `.feature`/`.skill-card` sets `--mx`/`--my` CSS vars |
| Contact form | Client-side validation + fake submit with 900ms delay |

---

## Common Edits

### Change sphere size
Edit `float R = 0.34` in **both** places in `js/sphere.js` (`liquidField` and `main`) **and** `const SPHERE_R = 0.34` in the same file.

### Change sphere horizontal position
Edit `uv.x -= 0.20` in `js/sphere.js` (shader `main()`) **and** `const SPHERE_OFF_X = 0.20` in the same file.

### Change sphere colors
In `js/sphere.js`, find `cValley`, `cMid`, `cRidge` in the fragment shader. These are `vec3(r, g, b)` in linear light (0–1 range, not 0–255).

### Change satellite droplet behaviour
In `liquidField()` in `js/sphere.js`:
- Orbit range: `mix(0.32, 0.54, ...)` — first value is minimum orbit (merged), second is maximum (separated)
- Droplet size: `float dropR = 0.058 + 0.015 * sin(...)` — base size + oscillation amplitude
- Number of droplets: change the `for(int i=0; i<5; i++)` limit (GLSL requires compile-time constant)

### Add a new section
1. Add HTML between existing sections in `index.html`
2. Add any new CSS to `css/styles.css` at the bottom
3. Add `.reveal` class to animatable elements — scroll reveal is automatic

### Update contact info
Edit `index.html` directly — search for `hello@anyalai.dev`, `jozefanyalai`.
