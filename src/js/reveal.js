// ============================================================
// reveal.js — Scroll-triggered fade-in via IntersectionObserver
// ============================================================

let observer = null;

export function initReveal() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}
