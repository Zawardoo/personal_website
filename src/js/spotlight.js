// ============================================================
// spotlight.js — Card mouse-follow radial glow (reflow-safe)
// ============================================================

export function initSpotlight() {
  const cards = document.querySelectorAll('.feature, .skill-card');
  if (!cards.length) return;

  // Cache bounding rects — update on resize/scroll instead of every mousemove
  const rects = new WeakMap();

  function cacheRects() {
    cards.forEach(card => { rects.set(card, card.getBoundingClientRect()); });
  }

  cacheRects();
  window.addEventListener('resize', cacheRects);
  window.addEventListener('scroll', cacheRects, { passive: true });

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      let r = rects.get(card);
      // Fallback if rect not cached yet
      if (!r) { r = card.getBoundingClientRect(); rects.set(card, r); }
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width)  * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)  / r.height) * 100 + '%');
    });
  });
}
