// ============================================================
// nav.js — Navbar scroll state, link routing, hamburger menu
// ============================================================

import { getCurrentView } from './router.js';

const SECTION_MAP = {
  testing: { about: 'about', skills: 'skills', contact: 'contact' },
  webdev:  { about: 'services', skills: 'stack', contact: 'contact' },
};

function closeMobileMenu() {
  const drawer = document.getElementById('navDrawer');
  const burger = document.getElementById('burgerBtn');
  if (drawer) drawer.classList.remove('open');
  if (burger) burger.classList.remove('open');
}

export function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;  // no nav on splash page

  // Scroll → add "scrolled" class (rAF-batched)
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 24);
      scrollTicking = false;
    });
  }, { passive: true });

  // View-aware nav links
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.dataset.nav;
      const map = SECTION_MAP[getCurrentView()];
      const id = map ? map[target] : target;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobileMenu();
    });
  });

  // Hamburger toggle
  const burgerBtn = document.getElementById('burgerBtn');
  const navDrawer = document.getElementById('navDrawer');

  if (burgerBtn && navDrawer) {
    burgerBtn.addEventListener('click', () => {
      navDrawer.classList.toggle('open');
      burgerBtn.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) closeMobileMenu();
    });
  }
}
