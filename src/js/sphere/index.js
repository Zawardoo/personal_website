// ============================================================
// sphere/index.js — WebGL renderer, input handling, render loop
// ============================================================

import { VS, FS } from './shaders.js';
import {
  VIEWS, makeSphere, lerpSphere,
  getHitSphere, pickActive, updateCursorFor, accDrag,
} from './state.js';

export function initSphere() {
  const canvas = document.getElementById('sphereCanvas');
  if (!canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true })
          || canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: true });
  if (!gl) return;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // ---- Compile shaders ----
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

  const vs = mkShader(gl.VERTEX_SHADER, VS);
  const fs = mkShader(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(prog));
    return;
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

  // ---- Resize ----
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width  = Math.round(window.innerWidth  * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Sphere instances ----
  const s1 = makeSphere(-0.46, 0.08);
  const s2 = makeSphere( 0.46, 0.08);

  const mouse    = { x: 0, y: 0, tx: 0, ty: 0 };
  let dragging   = false;
  let dX = 0, dY = 0;
  let currentView = 'splash';
  let activeSphere = null;

  // ---- View transitions ----
  function setState(view) {
    currentView = view;
    const v = VIEWS[view];
    s1.pos.tx = v.s1.x;  s1.pos.ty = v.s1.y;  s1.opacity.t = v.s1o;
    s2.pos.tx = v.s2.x;  s2.pos.ty = v.s2.y;  s2.opacity.t = v.s2o;
    canvas.style.pointerEvents = view === 'splash' ? 'auto' : 'none';
    canvas.style.cursor = view === 'splash' ? 'pointer' : 'default';
  }

  // ---- Input: Mouse ----
  document.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / innerWidth  - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
    activeSphere = pickActive(s1, s2, e.clientX, e.clientY);
    if (activeSphere) updateCursorFor(activeSphere, e.clientX, e.clientY);
    if (dragging && activeSphere) accDrag(activeSphere, e.clientX - dX, e.clientY - dY);
    dX = e.clientX;
    dY = e.clientY;
  });

  document.addEventListener('mousedown', e => {
    dragging = true; dX = e.clientX; dY = e.clientY;
    if (currentView !== 'splash') document.body.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.cursor = '';
  });

  // ---- Input: Canvas click → navigate ----
  canvas.addEventListener('click', e => {
    if (currentView !== 'splash') return;
    const hit = getHitSphere(s1, s2, e.clientX, e.clientY);
    if (hit) {
      setState(hit);
      document.dispatchEvent(new CustomEvent('sphereNav', { detail: { view: hit } }));
    }
  });

  // ---- Input: Touch ----
  window.addEventListener('touchstart', e => {
    const t = e.touches[0]; if (!t) return;
    dragging = true; dX = t.clientX; dY = t.clientY;
    activeSphere = pickActive(s1, s2, t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    const t = e.touches[0]; if (!t) return;
    mouse.tx = (t.clientX / innerWidth  - 0.5) * 2;
    mouse.ty = (t.clientY / innerHeight - 0.5) * 2;
    activeSphere = pickActive(s1, s2, t.clientX, t.clientY);
    if (activeSphere) {
      updateCursorFor(activeSphere, t.clientX, t.clientY);
      accDrag(activeSphere, t.clientX - dX, t.clientY - dY);
    }
    dX = t.clientX;
    dY = t.clientY;
  }, { passive: true });

  window.addEventListener('touchend', () => { dragging = false; }, { passive: true });

  // ---- Render loop ----
  const t0 = performance.now();

  function draw() {
    requestAnimationFrame(draw);

    mouse.x += (mouse.tx - mouse.x) * 0.055;
    mouse.y += (mouse.ty - mouse.y) * 0.055;

    if (activeSphere !== s1) s1.csr.fTarget = 0;
    if (activeSphere !== s2) s2.csr.fTarget = 0;

    lerpSphere(s1, dragging);
    lerpSphere(s2, dragging);

    // Skip GPU work when both invisible
    if (s1.opacity.v < 0.01 && s2.opacity.v < 0.01) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

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
  draw();

  // ---- Public API ----
  window.sphereCtrl = { setState, getHitSphere: (cx, cy) => getHitSphere(s1, s2, cx, cy) };
}
