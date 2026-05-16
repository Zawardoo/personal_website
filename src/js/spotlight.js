// ============================================================
// spotlight.js — Card mouse-follow radial glow
// ============================================================

export function initSpotlight() {
  document.querySelectorAll('.feature, .skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width)  * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - r.top)  / r.height) * 100 + '%');
    });
  });
}
