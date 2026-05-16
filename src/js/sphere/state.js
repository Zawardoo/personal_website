// ============================================================
// state.js — Per-sphere state, transitions, hit testing, input
// ============================================================

export const SPHERE_R = 0.34;

export const VIEWS = {
  splash:  { s1: { x: -0.46, y: 0.08 }, s2: { x: 0.46, y: 0.08 }, s1o: 0, s2o: 0 },
  testing: { s1: { x:  0.20, y: 0    }, s2: { x: 0.90, y: 0    }, s1o: 1, s2o: 0 },
  webdev:  { s1: { x: -0.90, y: 0    }, s2: { x: 0.20, y: 0    }, s1o: 0, s2o: 1 },
};

export function makeSphere(startX, startY) {
  return {
    pos:     { x: startX, y: startY, tx: startX, ty: startY },
    opacity: { v: 0, t: 0 },
    rot:     { x: 0, y: 0, vx: 0, vy: 0 },
    csr:     { x: 0, y: 0, tx: 0, ty: 0, force: 0, fvel: 0, fTarget: 0 },
    dragUV:  { x: 0, y: 0, vx: 0, vy: 0 },
  };
}

export function lerpSphere(s, dragging) {
  s.pos.x += (s.pos.tx - s.pos.x) * 0.09;
  s.pos.y += (s.pos.ty - s.pos.y) * 0.09;
  s.opacity.v += (s.opacity.t - s.opacity.v) * 0.10;

  s.rot.x += s.rot.vx;  s.rot.y += s.rot.vy;
  s.rot.vx *= 0.97;     s.rot.vy *= 0.97;

  s.csr.x += (s.csr.tx - s.csr.x) * 0.10;
  s.csr.y += (s.csr.ty - s.csr.y) * 0.10;
  const springF = (s.csr.fTarget - s.csr.force) * 0.12;
  s.csr.fvel  = s.csr.fvel * 0.72 + springF;
  s.csr.force = Math.max(0, s.csr.force + s.csr.fvel);

  s.dragUV.x += (s.dragUV.vx - s.dragUV.x) * 0.18;
  s.dragUV.y += (s.dragUV.vy - s.dragUV.y) * 0.18;
  s.dragUV.vx *= 0.60;
  s.dragUV.vy *= 0.60;
  if (!dragging) {
    s.dragUV.x *= 0.88;
    s.dragUV.y *= 0.88;
  }
}

export function getHitSphere(s1, s2, clientX, clientY) {
  const minDim = Math.min(innerWidth, innerHeight);
  const uvX = (clientX - innerWidth  * 0.5) / minDim;
  const uvY = -(clientY - innerHeight * 0.5) / minDim;
  const d1 = Math.sqrt((uvX - s1.pos.x) ** 2 + (uvY - s1.pos.y) ** 2);
  const d2 = Math.sqrt((uvX - s2.pos.x) ** 2 + (uvY - s2.pos.y) ** 2);
  const hitR = SPHERE_R + 0.12;

  if (d1 < hitR && (d1 < d2 || s2.opacity.t < 0.1)) return 'testing';
  if (d2 < hitR) return 'webdev';
  return null;
}

export function pickActive(s1, s2, clientX, clientY) {
  const minDim = Math.min(innerWidth, innerHeight);
  const uvX = (clientX - innerWidth  * 0.5) / minDim;
  const uvY = -(clientY - innerHeight * 0.5) / minDim;
  const d1 = Math.sqrt((uvX - s1.pos.x) ** 2 + (uvY - s1.pos.y) ** 2);
  const d2 = Math.sqrt((uvX - s2.pos.x) ** 2 + (uvY - s2.pos.y) ** 2);

  const can1 = s1.opacity.t > 0.1;
  const can2 = s2.opacity.t > 0.1;
  if (can1 && (!can2 || d1 <= d2)) return s1;
  if (can2) return s2;
  return null;
}

export function updateCursorFor(s, clientX, clientY) {
  const minDim = Math.min(innerWidth, innerHeight);
  s.csr.tx = (clientX - innerWidth  * 0.5) / minDim - s.pos.x;
  s.csr.ty = -(clientY - innerHeight * 0.5) / minDim - s.pos.y;
  const dist = Math.sqrt(s.csr.tx * s.csr.tx + s.csr.ty * s.csr.ty);
  s.csr.fTarget = Math.max(0, 1 - dist / SPHERE_R);
}

export function accDrag(s, dx, dy) {
  const minDim = Math.min(innerWidth, innerHeight);
  s.dragUV.vx +=  dx / minDim;
  s.dragUV.vy += -dy / minDim;
  s.rot.vx -= dx * 0.00018;
  s.rot.vy -= dy * 0.00018;
}
