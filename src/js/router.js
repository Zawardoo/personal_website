// ============================================================
// router.js — View state management & hash routing
// ============================================================

import { initReveal } from './reveal.js';

let currentView = 'splash';

export function getCurrentView() {
  return currentView;
}

export function showView(view) {
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

export function initRouter() {
  // Splash card clicks
  document.querySelectorAll('.splash-card[data-view]').forEach(card => {
    card.addEventListener('click', () => showView(card.dataset.view));
  });

  // Sphere canvas click (dispatched from sphere.js)
  document.addEventListener('sphereNav', e => showView(e.detail.view));

  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.addEventListener('click', () => showView('splash'));

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
  window.addEventListener('popstate', () => {
    const hash = location.hash.replace('#', '');
    if (hash === 'testing' || hash === 'webdev') {
      showView(hash);
    } else {
      showView('splash');
    }
  });

  // Intercept in-page anchor links (href="#section-id") — smooth scroll
  // instead of changing the hash (which would trigger popstate → splash)
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href').slice(1);
    // Let view-level hashes (testing/webdev) pass through to popstate
    if (!hash || hash === 'testing' || hash === 'webdev') return;
    const target = document.getElementById(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // CV dropdown toggle
  document.querySelectorAll('.cv-trigger').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = btn.closest('.cv-dropdown');
      // Close any other open dropdowns
      document.querySelectorAll('.cv-dropdown.open').forEach(d => {
        if (d !== dd) d.classList.remove('open');
      });
      dd.classList.toggle('open');
    });
  });
  // Close on outside click or after download
  document.addEventListener('click', () => {
    document.querySelectorAll('.cv-dropdown.open').forEach(d => d.classList.remove('open'));
  });

  // Initial state from URL hash
  const initHash = location.hash.replace('#', '');
  if (initHash === 'testing' || initHash === 'webdev') {
    showView(initHash);
  } else {
    showView('splash');
  }
}
