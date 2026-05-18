// ============================================================
// spotlight.js — Card mouse-follow radial glow (reflow-safe)
// ============================================================

export function initSpotlight() {
  const cards = document.querySelectorAll('.feature, .skill-card');
  if (!cards.length) return;

  // Cache bounding rects — update on resize only (not scroll, to avoid reflow)
  const rects = new WeakMap();
  let rectsStale = true;

  function markStale() { rectsStale = true; }

  function refreshRects() {
    cards.forEach(card => { rects.set(card, card.getBoundingClientRect()); });
    rectsStale = false;
  }

  // Only invalidate on resize; refresh lazily on next mousemove
  window.addEventListener('resize', markStale);
  window.addEventListener('scroll', markStale, { passive: true });

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      // Refresh all rects once when stale (batched, not per-card)
      if (rectsStale) refreshRects();
      const r = rects.get(card);
      if (!r) return;
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width)  * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)  / r.height) * 100 + '%');
    });
  });
}
