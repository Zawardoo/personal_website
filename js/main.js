// ============================================================
// main.js — View state management, nav, parallax, reveal, forms
// ============================================================

// ---------- VIEW STATE ----------
let currentView = 'splash';

function showView(view) {
  currentView = view;
  document.body.className = 'view-' + view;
  window.scrollTo(0, 0);
  // Close mobile menu on view switch
  const md = document.getElementById('navDrawer');
  const mb = document.getElementById('burgerBtn');
  if (md) md.classList.remove('open');
  if (mb) mb.classList.remove('open');

  // Tell the sphere renderer
  if (window.sphereCtrl) window.sphereCtrl.setState(view);

  // Update hash (without triggering popstate)
  const hash = view === 'splash' ? '' : view;
  if (location.hash.replace('#', '') !== hash) {
    history.pushState({ view }, '', hash ? '#' + hash : location.pathname);
  }

  // Re-run scroll reveal for the newly visible content
  setTimeout(initReveal, 60);
}

// Splash card clicks
document.querySelectorAll('.splash-card[data-view]').forEach(card => {
  card.addEventListener('click', () => {
    showView(card.dataset.view);
  });
});

// Sphere canvas click (dispatched from sphere.js)
document.addEventListener('sphereNav', e => {
  showView(e.detail.view);
});

// Back button
const backBtn = document.getElementById('backBtn');
if (backBtn) {
  backBtn.addEventListener('click', () => showView('splash'));
}

// Logo click → splash
const logoLink = document.querySelector('nav .logo');
if (logoLink) {
  logoLink.addEventListener('click', e => {
    e.preventDefault();
    showView('splash');
  });
}

// Footer home link
const footHome = document.getElementById('footHome');
if (footHome) {
  footHome.addEventListener('click', e => {
    e.preventDefault();
    showView('splash');
  });
}

// Browser back/forward
window.addEventListener('popstate', e => {
  const hash = location.hash.replace('#', '');
  if (hash === 'testing' || hash === 'webdev') {
    showView(hash);
  } else {
    showView('splash');
  }
});

// ---------- NAV ----------
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
});

// View-aware nav links: map generic targets → correct section IDs per view
const sectionMap = {
  testing: { about: 'about', skills: 'skills', contact: 'contact' },
  webdev:  { about: 'services-wd', skills: 'stack-wd', contact: 'contact-wd' },
};

document.querySelectorAll('[data-nav]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.nav;
    const map = sectionMap[currentView];
    const id = map ? map[target] : target;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Close mobile menu if open
    closeMobileMenu();
  });
});

// ---------- HAMBURGER MENU ----------
const burgerBtn  = document.getElementById('burgerBtn');
const navDrawer  = document.getElementById('navDrawer');

function closeMobileMenu() {
  if (navDrawer)  navDrawer.classList.remove('open');
  if (burgerBtn)  burgerBtn.classList.remove('open');
}

if (burgerBtn && navDrawer) {
  burgerBtn.addEventListener('click', () => {
    navDrawer.classList.toggle('open');
    burgerBtn.classList.toggle('open');
  });
  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) closeMobileMenu();
  });
}

// ---------- HERO PARALLAX ----------
(function heroParallax() {
  let ticking = false;
  function onScroll() {
    if (currentView === 'splash') return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      // Find elements in the *active* view
      const view = document.getElementById('view-' + currentView);
      if (!view) { ticking = false; return; }

      const pill  = view.querySelector('.hero-pill');
      const title = view.querySelector('.hero-title');
      const sub   = view.querySelector('.hero-sub');
      const cta   = view.querySelector('.hero-cta-row');
      const tags  = view.querySelector('.sphere-tags');

      if (pill)  pill.style.transform  = 'translateY(' + (sy * -0.08) + 'px)';
      if (title) title.style.transform = 'translateY(' + (sy * -0.13) + 'px)';
      if (sub)   sub.style.transform   = 'translateY(' + (sy * -0.09) + 'px)';
      if (cta)   cta.style.transform   = 'translateY(' + (sy * -0.06) + 'px)';
      if (tags)  tags.style.transform  = 'translateY(' + (sy * -0.05) + 'px)';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ---------- SCROLL REVEAL ----------
let observer = null;
function initReveal() {
  // Observe all .reveal elements that aren't already visible
  if (observer) observer.disconnect();
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}
initReveal();

// ---------- CARD MOUSE SPOTLIGHT ----------
function initSpotlight() {
  document.querySelectorAll('.feature, .skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width)  * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)  / r.height) * 100 + '%');
    });
  });
}
initSpotlight();

// ---------- CONTACT FORMS ----------
function initForm(formId, fieldDefs, submitTextId, successId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const fields = {};
  Object.entries(fieldDefs).forEach(([key, def]) => {
    const el  = document.getElementById(def.id);
    const err = document.getElementById(def.errId);
    if (!el || !err) return;
    fields[key] = { el, err, validate: def.validate };
  });

  Object.values(fields).forEach(f => {
    f.el.addEventListener('input', () => {
      if (f.el.classList.contains('invalid') && f.validate(f.el.value) === true) {
        f.el.classList.remove('invalid');
        f.err.classList.remove('show');
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    Object.values(fields).forEach(f => {
      const r = f.validate(f.el.value);
      if (r !== true) {
        f.el.classList.add('invalid');
        f.err.textContent = r;
        f.err.classList.add('show');
        ok = false;
      } else {
        f.el.classList.remove('invalid');
        f.err.classList.remove('show');
      }
    });
    if (!ok) return;

    const t = document.getElementById(submitTextId);
    const s = document.getElementById(successId);
    if (t) t.textContent = 'Sending…';
    setTimeout(() => {
      if (t) t.textContent = 'Send message';
      if (s) s.classList.add('show');
      form.reset();
      setTimeout(() => { if (s) s.classList.remove('show'); }, 4000);
    }, 900);
  });
}

// Testing form
initForm('contactForm', {
  name:    { id: 'name',    errId: 'err-name',    validate: v => v.trim().length >= 2 || 'Please enter your name' },
  email:   { id: 'email',   errId: 'err-email',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email' },
  message: { id: 'message', errId: 'err-message',  validate: v => v.trim().length >= 5 || "Message can't be empty" },
}, 'submitText', 'formSuccess');

// Web dev form
initForm('contactFormWd', {
  name:    { id: 'name-wd',    errId: 'err-name-wd',    validate: v => v.trim().length >= 2 || 'Please enter your name' },
  email:   { id: 'email-wd',   errId: 'err-email-wd',   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email' },
  message: { id: 'message-wd', errId: 'err-message-wd', validate: v => v.trim().length >= 5 || 'Please describe your project' },
}, 'submitTextWd', 'formSuccessWd');

// ---------- INITIAL STATE ----------
const initHash = location.hash.replace('#', '');
if (initHash === 'testing' || initHash === 'webdev') {
  showView(initHash);
} else {
  showView('splash');
}
