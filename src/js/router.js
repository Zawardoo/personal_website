// ============================================================
// router.js — Page detection, smooth scroll, CV dropdown
// ============================================================

const currentView = document.body.dataset.page || 'splash';

export function getCurrentView() {
  return currentView;
}

export function initRouter() {
  // Intercept in-page anchor links — smooth scroll
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href').slice(1);
    if (!hash) return;
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
      document.querySelectorAll('.cv-dropdown.open').forEach(d => {
        if (d !== dd) d.classList.remove('open');
      });
      dd.classList.toggle('open');
    });
  });
  // Close on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.cv-dropdown.open').forEach(d => d.classList.remove('open'));
  });
}
