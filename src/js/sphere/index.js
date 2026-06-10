// ============================================================
// sphere/index.js — WebGL renderer, input handling, render loop
// ============================================================

import { VS, makeFS } from './shaders.js';
import {
  VIEWS, makeSphere, lerpSphere,
  getHitSphere, pickActive, updateCursorFor, accDrag,
  updateViewport,
} from './state.js';

// ---- Quality tier detection ----
function detectQuality(gl) {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 2;
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL).toLowerCase() : '';
  const weakGPU = /mali-4|mali-t[67]|adreno\s?[23]\d\d|powervr\s?sgx|intel\s?hd\s?(3|4[05])\d\d|gma/i.test(renderer);

  if (weakGPU || (isMobile && cores <= 4)) return 0;
  if (isMobile || cores <= 4) return 1;
  return 2;
}

function getDPR(quality) {
  const raw = window.devicePixelRatio || 1;
  if (quality === 0) return Math.min(raw, 0.75);
  if (quality === 1) return Math.min(raw, 1.0);
  return Math.min(raw, 1.5);
}

export function initSphere() {
  const canvas = document.getElementById('sphereCanvas');
  if (!canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true })
          || canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: true });
  if (!gl) return;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // ---- Detect quality & compile appropriate shader ----
  let quality = detectQuality(gl);
  let dprCap  = getDPR(quality);

  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function buildProgram(q) {
    const vs = mkShader(gl.VERTEX_SHADER, VS);
    const fs = mkShader(gl.FRAGMENT_SHADER, makeFS(q));
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  let prog = buildProgram(quality);
  if (!prog) {
    if (quality > 0) { quality = 0; dprCap = getDPR(0); prog = buildProgram(0); }
    if (!prog) return;
  }
  gl.useProgram(prog);

  // ---- Fullscreen quad ----
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // ---- Uniform locations ----
  const u = {};
  ['u_res','u_time','u_mouse',
   'u_s1_pos','u_s1_opacity','u_rot1','u_cpos1','u_cforce1','u_drag1',
   'u_s2_pos','u_s2_opacity','u_rot2','u_cpos2','u_cforce2','u_drag2',
  ].forEach(name => { u[name] = gl.getUniformLocation(prog, name); });

  // ---- Cached viewport ----
  let cachedW = window.innerWidth;
  let cachedH = window.innerHeight;

  function resize() {
    cachedW = window.innerWidth;
    cachedH = window.innerHeight;
    updateViewport();
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    canvas.width  = Math.round(cachedW * dpr);
    canvas.height = Math.round(cachedH * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Page-aware sphere init ----
  const page = document.body.dataset.page || 'splash';
  const v = VIEWS[page] || VIEWS.splash;

  const s1 = makeSphere(v.s1.x, v.s1.y);
  s1.pos.tx = v.s1.x;
  s1.opacity.v = v.s1o;
  s1.opacity.t = v.s1o;

  const s2 = makeSphere(v.s2.x, v.s2.y);
  s2.pos.tx = v.s2.x;
  s2.opacity.v = v.s2o;
  s2.opacity.t = v.s2o;

  const mouse    = { x: 0, y: 0, tx: 0, ty: 0 };
  let dragging   = false;
  let dX = 0, dY = 0;
  let activeSphere = null;

  // Canvas pointer events (only clickable on splash)
  canvas.style.pointerEvents = page === 'splash' ? 'auto' : 'none';
  canvas.style.cursor = page === 'splash' ? 'pointer' : 'default';

  // ---- Input: Mouse ----
  document.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / cachedW - 0.5) * 2;
    mouse.ty = (e.clientY / cachedH - 0.5) * 2;
    activeSphere = pickActive(s1, s2, e.clientX, e.clientY);
    if (activeSphere) updateCursorFor(activeSphere, e.clientX, e.clientY);
    if (dragging && activeSphere) accDrag(activeSphere, e.clientX - dX, e.clientY - dY);
    dX = e.clientX;
    dY = e.clientY;
  });

  document.addEventListener('mousedown', e => {
    dragging = true; dX = e.clientX; dY = e.clientY;
    if (page !== 'splash') document.body.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.cursor = '';
  });

  // ---- Input: Canvas click → navigate (splash only) ----
  canvas.addEventListener('click', e => {
    if (page !== 'splash') return;
    const hit = getHitSphere(s1, s2, e.clientX, e.clientY);
    if (hit === 'testing') window.location.href = '/qa-automatizacia';
    if (hit === 'webdev')  window.location.href = '/tvorba-webov';
  });

  // ---- Input: Touch ----
  window.addEventListener('touchstart', e => {
    const t = e.touches[0]; if (!t) return;
    dragging = true; dX = t.clientX; dY = t.clientY;
    activeSphere = pickActive(s1, s2, t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    const t = e.touches[0]; if (!t) return;
    mouse.tx = (t.clientX / cachedW - 0.5) * 2;
    mouse.ty = (t.clientY / cachedH - 0.5) * 2;
    activeSphere = pickActive(s1, s2, t.clientX, t.clientY);
    if (activeSphere) {
      updateCursorFor(activeSphere, t.clientX, t.clientY);
      accDrag(activeSphere, t.clientX - dX, t.clientY - dY);
    }
    dX = t.clientX;
    dY = t.clientY;
  }, { passive: true });

  window.addEventListener('touchend', () => { dragging = false; }, { passive: true });

  // ---- Adaptive frame rate ----
  let frameTimes = [];
  let adaptChecked = false;

  function checkAdaptive(now) {
    if (adaptChecked || quality === 0) return;
    frameTimes.push(now);
    if (frameTimes.length < 90) return;
    const recent = frameTimes.slice(-60);
    let totalDelta = 0;
    for (let i = 1; i < recent.length; i++) totalDelta += recent[i] - recent[i - 1];
    const avgMs = totalDelta / (recent.length - 1);
    adaptChecked = true;
    frameTimes = [];
    if (avgMs > 28 && quality > 0) {
      quality -= 1;
      dprCap = getDPR(quality);
      const newProg = buildProgram(quality);
      if (newProg) {
        gl.useProgram(newProg);
        const newAPos = gl.getAttribLocation(newProg, 'a_pos');
        gl.enableVertexAttribArray(newAPos);
        gl.vertexAttribPointer(newAPos, 2, gl.FLOAT, false, 0, 0);
        ['u_res','u_time','u_mouse',
         'u_s1_pos','u_s1_opacity','u_rot1','u_cpos1','u_cforce1','u_drag1',
         'u_s2_pos','u_s2_opacity','u_rot2','u_cpos2','u_cforce2','u_drag2',
        ].forEach(name => { u[name] = gl.getUniformLocation(newProg, name); });
        resize();
        adaptChecked = false;
      }
    }
  }

  // ---- Render loop (pauses when hidden/idle) ----
  const t0 = performance.now();
  let loopId = 0;
  let loopRunning = false;
  let idleFrames = 0;
  const IDLE_STOP = 30;

  function startLoop() {
    if (loopRunning) return;
    loopRunning = true;
    idleFrames = 0;
    loopId = requestAnimationFrame(draw);
  }

  function stopLoop() {
    if (!loopRunning) return;
    loopRunning = false;
    cancelAnimationFrame(loopId);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop(); else startLoop();
  });

  function draw(now) {
    if (!loopRunning) return;
    loopId = requestAnimationFrame(draw);

    checkAdaptive(now);

    mouse.x += (mouse.tx - mouse.x) * 0.055;
    mouse.y += (mouse.ty - mouse.y) * 0.055;

    if (activeSphere !== s1) s1.csr.fTarget = 0;
    if (activeSphere !== s2) s2.csr.fTarget = 0;

    lerpSphere(s1, dragging);
    lerpSphere(s2, dragging);

    if (s1.opacity.v < 0.01 && s2.opacity.v < 0.01) {
      idleFrames++;
      if (idleFrames > IDLE_STOP) { stopLoop(); return; }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }
    idleFrames = 0;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(u.u_res,   canvas.width, canvas.height);
    gl.uniform1f(u.u_time,  (performance.now() - t0) / 1000);
    gl.uniform2f(u.u_mouse, mouse.x, mouse.y);

    gl.uniform2f(u.u_s1_pos,      s1.pos.x, s1.pos.y);
    gl.uniform1f(u.u_s1_opacity,  s1.opacity.v);
    gl.uniform2f(u.u_rot1,        s1.rot.x, s1.rot.y);
    gl.uniform2f(u.u_cpos1,       s1.csr.x, s1.csr.y);
    gl.uniform1f(u.u_cforce1,     s1.csr.force);
    gl.uniform2f(u.u_drag1,       s1.dragUV.x, s1.dragUV.y);

    gl.uniform2f(u.u_s2_pos,      s2.pos.x, s2.pos.y);
    gl.uniform1f(u.u_s2_opacity,  s2.opacity.v);
    gl.uniform2f(u.u_rot2,        s2.rot.x, s2.rot.y);
    gl.uniform2f(u.u_cpos2,       s2.csr.x, s2.csr.y);
    gl.uniform1f(u.u_cforce2,     s2.csr.force);
    gl.uniform2f(u.u_drag2,       s2.dragUV.x, s2.dragUV.y);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  startLoop();
}
