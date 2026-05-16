// ============================================================
// parallax.js — Hero element parallax on scroll
// ============================================================

import { getCurrentView } from './router.js';

export function initParallax() {
  let ticking = false;

  function onScroll() {
    if (getCurrentView() === 'splash') return;
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const sy = window.scrollY;
      const view = document.getElementById('view-' + getCurrentView());
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
}
