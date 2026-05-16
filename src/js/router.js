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

  // Initial state from URL hash
  const initHash = location.hash.replace('#', '');
  if (initHash === 'testing' || initHash === 'webdev') {
    showView(initHash);
  } else {
    showView('splash');
  }
}
