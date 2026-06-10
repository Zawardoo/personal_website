// ============================================================
// parallax.js — Hero element parallax on scroll
// ============================================================

export function initParallax() {
  const page = document.body.dataset.page;
  if (page === 'splash') return;  // no parallax on splash

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const sy = window.scrollY;

      const pill  = document.querySelector('.hero-pill');
      const title = document.querySelector('.hero-title');
      const sub   = document.querySelector('.hero-sub');
      const cta   = document.querySelector('.hero-cta-row');
      const tags  = document.querySelector('.sphere-tags');

      if (pill)  pill.style.transform  = 'translateY(' + (sy * -0.08) + 'px)';
      if (title) title.style.transform = 'translateY(' + (sy * -0.13) + 'px)';
      if (sub)   sub.style.transform   = 'translateY(' + (sy * -0.09) + 'px)';
      if (cta)   cta.style.transform   = 'translateY(' + (sy * -0.06) + 'px)';
      if (tags)  tags.style.transform  = 'translateY(' + (sy * -0.05) + 'px)';

      ticking = false;
    });
  }, { passive: true });
}
