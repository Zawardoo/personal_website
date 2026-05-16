# Jozef Anyalai — Portfolio

Personal portfolio site. QA Automation + Web Development.

Vanilla HTML/CSS/JS, WebGL sphere, ES modules, obfuscated production build, Express backend with Resend email.

---

## Project Structure

```
moj_web/
├── index.html                ← HTML shell (references dist/ output)
├── server.js                 ← Express server (static files + contact API)
├── build.js                  ← Build script (bundle + obfuscate + minify)
├── package.json
│
├── src/                      ← SOURCE CODE (edit here)
│   ├── js/
│   │   ├── main.js           ← Entry point — imports all modules
│   │   ├── router.js         ← View state, hash routing, history
│   │   ├── nav.js            ← Navbar scroll, hamburger, link routing
│   │   ├── parallax.js       ← Hero parallax on scroll
│   │   ├── reveal.js         ← Scroll-triggered fade-in
│   │   ├── spotlight.js      ← Card mouse-follow glow
│   │   ├── forms.js          ← Contact form validation + POST
│   │   ├── i18n.js           ← EN/SK language toggle
│   │   └── sphere/
│   │       ├── index.js      ← WebGL renderer, input, render loop
│   │       ├── shaders.js    ← GLSL vertex + fragment shader
│   │       └── state.js      ← Sphere state, lerp, hit testing
│   └── css/
│       └── styles.css        ← All styles (edit here, build minifies)
│
├── dist/                     ← BUILD OUTPUT (auto-generated, gitignored)
│   ├── js/bundle.min.js      ← Single obfuscated JS bundle
│   └── css/styles.min.css    ← Minified CSS
│
├── js/                       ← Legacy source files (kept for reference)
├── css/                      ← Legacy CSS (kept for reference)
├── CLAUDE.md                 ← Technical architecture docs
└── .replit                   ← Replit config
```

---

## Quick Start (Local Dev)

```bash
# Install dependencies
npm install

# Build (bundle + obfuscate + minify)
npm run build

# Start server
npm start
# → http://localhost:3000
```

### Available Scripts

| Command | What it does |
|---|---|
| `npm run build` | Production build — esbuild + obfuscation + CSS minify |
| `npm run build:dev` | Fast build — minified only, no obfuscation |
| `npm start` | Start Express server on port 3000 |
| `npm run dev` | Static file server on port 8092 (no backend) |

---

## Build Pipeline

```
src/js/*.js  →  esbuild (bundle + minify)  →  javascript-obfuscator  →  dist/js/bundle.min.js
src/css/*.css  →  clean-css  →  dist/css/styles.min.css
```

- **esbuild** — bundles ES modules into one IIFE, tree-shakes, minifies (~28 KB)
- **javascript-obfuscator** — hex identifiers, string encoding, control flow flattening (~95 KB)
- **clean-css** — minifies CSS (~27 KB)

After editing any file in `src/`, run `npm run build` before testing.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes (for email) | API key from [resend.com](https://resend.com) |
| `CONTACT_EMAIL` | No | Where form emails land (default: `hello@anyalai.dev`) |
| `FROM_EMAIL` | No | Sender address (default: `onboarding@resend.dev`) |
| `PORT` | No | Server port (default: `3000`) |
| `CORS_ORIGIN` | No | Allowed origin (default: `*`) |

Without `RESEND_API_KEY`, the server still runs — form submissions log to console.

---

## Production Deployment Checklist

### 1. Domain + DNS

- [ ] Buy domain (Vercel, Namecheap, Cloudflare, etc.)
- [ ] Point DNS to your hosting provider
- [ ] Verify SSL/HTTPS is active

### 2. Resend (Email)

- [ ] Create account at [resend.com](https://resend.com)
- [ ] Get API key from dashboard
- [ ] Add your domain in Resend → Domains
- [ ] Add the DNS records Resend gives you (MX, TXT, DKIM) to your domain's DNS settings
- [ ] Wait for domain verification (usually 1–10 minutes)
- [ ] Set `FROM_EMAIL` to `Portfolio <noreply@yourdomain.dev>`

### 3. Email Receiving (Optional)

To receive emails at `hello@yourdomain.dev`:
- [ ] Set up [ImprovMX](https://improvmx.com) (free) or Cloudflare Email Routing
- [ ] Add their MX + TXT records to your DNS
- [ ] Configure forwarding to your personal email

### 4. Environment Variables

- [ ] Set `RESEND_API_KEY` in your hosting provider's env/secrets
- [ ] Set `CONTACT_EMAIL` to your email address
- [ ] Set `FROM_EMAIL` to your verified domain sender
- [ ] Set `NODE_ENV=production`

### 5. Build + Deploy

- [ ] Run `npm run build` (or let your hosting run it)
- [ ] Verify `dist/js/bundle.min.js` and `dist/css/styles.min.css` exist
- [ ] Test the site loads correctly
- [ ] Test the contact form sends an email
- [ ] Test the language toggle (EN/SK)
- [ ] Test on mobile (burger menu, responsive layout)

### 6. Post-Deploy

- [ ] Check DevTools → Sources — JS should be obfuscated
- [ ] Check DevTools → Network — no 404s
- [ ] Check DevTools → Console — no errors
- [ ] Test both contact forms (testing + webdev)
- [ ] Test rate limiting (6th submission in 15 min should fail)
- [ ] Update `hello@anyalai.dev` in `index.html` if using a different email

---

## Deploy on Vercel (with Serverless)

Vercel can't run Express directly. Two options:

**Option A: Static site + external form handler**
1. Deploy as static site (just the HTML + dist/ files)
2. Use Resend's API directly from the client, or use a form service like Formspree

**Option B: Use Vercel Serverless Functions**
1. Move the contact endpoint to `api/contact.js`:
```js
// api/contact.js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  // ... validation + resend.emails.send() ...
};
```
2. Set env vars in Vercel dashboard
3. Push to GitHub → Vercel auto-deploys

---

## Deploy on Railway / Render / Fly.io

These support Express natively:

```bash
# Railway
railway init
railway up

# Render
# Create a Web Service, set:
#   Build: npm install && npm run build
#   Start: npm start

# Fly.io
fly launch
fly deploy
```

Set env vars in the hosting dashboard.

---

## Common Edits

### Text content
All copy lives in `index.html`. Search by section comment.

### Colors / design tokens
CSS custom properties at the top of `src/css/styles.css`:
```css
--accent:   #8B5CF6;
--bg-0:     #07060d;
--text:     #ECE6F7;
```

### Sphere appearance
Edit files in `src/js/sphere/`:
- **Size**: `SPHERE_R` in `state.js` + `float R` in `shaders.js` (2 places)
- **Colors**: `cValley`, `cMid`, `cRidge` in `shaders.js`
- **Droplets**: `liquidField()` loop in `shaders.js`

### Add a new section
1. Add HTML in `index.html`
2. Add CSS at the bottom of `src/css/styles.css`
3. Add `.reveal` class for scroll animation
4. Run `npm run build`

### Slovak translations
Edit the `SK` object in `src/js/i18n.js`. Add `data-i18n="key"` to HTML elements.

---

## Architecture

See `CLAUDE.md` for deep technical docs on:
- WebGL/GLSL shader (SDF metaballs, normal reconstruction, lighting)
- CSS z-index stack and animation system
- JS input state machine (mouse, drag, touch)
- Critical constants that must stay in sync
