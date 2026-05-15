// ---------- DUAL LIQUID GLASS SPHERES (WebGL) ----------
// Renders two interactive metaball spheres on a single fullscreen canvas.
// Exposes window.sphereCtrl for view-state transitions.
//
// Sphere 1 (purple) = Testing/QA
// Sphere 2 (sky blue) = Web Dev

(function initSphere() {
  const canvas = document.getElementById('sphereCanvas');
  if (!canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true })
          || canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: true });
  if (!gl) return;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // ---- Shaders ----
  const VS = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FS = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;

    // Sphere 1 (purple)
    uniform vec2  u_s1_pos;
    uniform float u_s1_opacity;
    uniform vec2  u_rot1;
    uniform vec2  u_cpos1;
    uniform float u_cforce1;
    uniform vec2  u_drag1;

    // Sphere 2 (blue)
    uniform vec2  u_s2_pos;
    uniform float u_s2_opacity;
    uniform vec2  u_rot2;
    uniform vec2  u_cpos2;
    uniform float u_cforce2;
    uniform vec2  u_drag2;

    /* ---- hash / noise ---- */
    float h1(float n){ return fract(sin(n)*753.5453); }
    float h2(vec2 p){
      p  = fract(p*vec2(443.897,441.423));
      p += dot(p, p.yx+19.19);
      return fract((p.x+p.y)*p.x);
    }
    float n3(vec3 p){
      vec3 i=floor(p), f=fract(p);
      vec3 u=f*f*f*(f*(f*6.-15.)+10.);
      float z0=h1(i.z)*17., z1=h1(i.z+1.)*17.;
      return mix(
        mix(mix(h2(i.xy+z0),          h2(i.xy+vec2(1,0)+z0),u.x),
            mix(h2(i.xy+vec2(0,1)+z0),h2(i.xy+vec2(1,1)+z0),u.x),u.y),
        mix(mix(h2(i.xy+z1),          h2(i.xy+vec2(1,0)+z1),u.x),
            mix(h2(i.xy+vec2(0,1)+z1),h2(i.xy+vec2(1,1)+z1),u.x),u.y),
        u.z);
    }

    float fbm(vec3 p){
      float v=0.,a=.5;
      for(int i=0;i<3;i++){ v+=a*n3(p); p=p*2.07+vec3(1.7,9.2,5.1); a*=.5; }
      return v;
    }

    float slime(vec3 p, float t){
      vec3 q = vec3(
        fbm(p + vec3(0.0, 0.0, t*.11)),
        fbm(p + vec3(5.2, 1.3, t*.09)),
        fbm(p + vec3(1.7, 9.2, t*.10))
      );
      return fbm(p + 2.4*q + vec3(t*.18));
    }

    mat3 Ry(float a){ return mat3(cos(a),0,sin(a), 0,1,0,-sin(a),0,cos(a)); }
    mat3 Rx(float a){ return mat3(1,0,0, 0,cos(a),-sin(a), 0,sin(a),cos(a)); }

    float smax(float a, float b, float k){
      float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
      return mix(b, a, h) + k*h*(1.0-h);
    }

    float liquidField(vec2 p, float t, vec2 drag){
      float R = 0.34;
      float f = R - length(p);

      float dMag = length(drag);
      if(dMag > 0.0008){
        vec2  dDir  = drag / dMag;
        float dist  = R * 0.72 + min(dMag * 2.4, 0.32);
        float blobR = 0.07 + min(dMag * 1.6, 0.20);
        f = smax(f, blobR - length(p - dDir*dist), 0.13);
      }

      for(int i=0; i<3; i++){
        float fi    = float(i);
        float phase = fi * 1.25663706;
        float osc   = 0.28 + fi * 0.13;
        float orbitR = mix(0.32, 0.54, 0.5 + 0.5*sin(t*osc + phase));
        float angle  = phase + t*(0.10 + fi*0.022);
        vec2  center = orbitR * vec2(cos(angle), sin(angle));
        float dropR  = 0.058 + 0.015*sin(t*1.08 + fi*2.31);
        f = smax(f, dropR - length(p - center), 0.13);
      }

      return f;
    }

    void main(){
      vec2 baseUV = (gl_FragCoord.xy - u_res*.5) / min(u_res.x, u_res.y);
      float T = u_time;

      // UV relative to each sphere center
      vec2 uv1 = baseUV - u_s1_pos;
      vec2 uv2 = baseUV - u_s2_pos;

      // Quick distance cull (R + max satellite orbit + drop radius)
      float maxR = 0.82;
      float d1 = length(uv1);
      float d2 = length(uv2);
      bool near1 = d1 < maxR && u_s1_opacity > 0.01;
      bool near2 = d2 < maxR && u_s2_opacity > 0.01;
      if(!near1 && !near2){ gl_FragColor = vec4(0.0); return; }

      // Cursor dent per sphere
      vec2 uv1d = uv1;
      if(near1){
        vec2 tC = uv1d - u_cpos1;
        float tD = length(tC);
        float cP = u_cforce1 * smoothstep(0.20, 0.01, tD) * 0.065;
        if(tD > 0.001) uv1d += (tC / tD) * cP;
      }
      vec2 uv2d = uv2;
      if(near2){
        vec2 tC = uv2d - u_cpos2;
        float tD = length(tC);
        float cP = u_cforce2 * smoothstep(0.20, 0.01, tD) * 0.065;
        if(tD > 0.001) uv2d += (tC / tD) * cP;
      }

      // Evaluate field for each sphere
      float f1 = near1 ? liquidField(uv1d, T, u_drag1) : -1.0;
      float f2 = near2 ? liquidField(uv2d, T, u_drag2) : -1.0;
      if(f1 < -0.014 && f2 < -0.014){ gl_FragColor = vec4(0.0); return; }

      // Pick dominant sphere (sel: 0.0=sphere1, 1.0=sphere2)
      float sel = step(f1, f2);
      vec2  uv       = mix(uv1d, uv2d, sel);
      float f0       = mix(f1, f2, sel);
      float sOpacity = mix(u_s1_opacity, u_s2_opacity, sel);
      vec2  drag     = mix(u_drag1, u_drag2, sel);
      vec2  rotVal   = mix(u_rot1, u_rot2, sel);

      if(f0 < -0.014){ gl_FragColor = vec4(0.0); return; }

      float dMag = length(drag);
      float R    = 0.34;

      // Normal reconstruction via central differences
      float e2  = 0.015;
      float gfx = liquidField(uv+vec2(e2,0.), T, drag) - liquidField(uv-vec2(e2,0.), T, drag);
      float gfy = liquidField(uv+vec2(0.,e2), T, drag) - liquidField(uv-vec2(0.,e2), T, drag);
      vec2  nGrad = vec2(gfx, gfy);
      float nGLen = length(nGrad);
      vec2  nxy   = (nGLen > 0.001) ? nGrad/nGLen : vec2(0.0);

      float dsurf = clamp(R - f0, 0.0, R);
      float zsurf = sqrt(max(0.0, R*R - dsurf*dsurf));
      vec3  N     = normalize(vec3(dsurf * nxy, zsurf));
      float depth = zsurf / R;

      float ry = -u_mouse.x*.90 + rotVal.x;
      float rx =  u_mouse.y*.55 + rotVal.y;
      vec3  tN = Rx(rx)*Ry(ry)*N;

      vec3  tp = tN * 0.85;
      float f  = slime(tp, T);

      float e  = .012;
      float bx = slime(tp+vec3(e,0,0),T) - f;
      float by = slime(tp+vec3(0,e,0),T) - f;
      float bz = slime(tp+vec3(0,0,e),T) - f;
      vec3 bump = Ry(-ry)*Rx(-rx)*vec3(bx,by,bz);
      float bumpAmp = (0.82 + min(dMag * 4.5, 0.85)) * clamp(depth * 3.0, 0.05, 1.0) * smoothstep(0.0, 0.04, f0);
      vec3 pN = normalize(N + bumpAmp * bump);

      vec3 L = normalize(vec3(u_mouse.x*1.6-.3, -u_mouse.y*1.4+.6, 1.5));
      vec3 V = vec3(0,0,1);
      vec3 H = normalize(L+V);

      float NdotV = abs(dot(N,V));
      float diff  = max(dot(pN,L), 0.);
      float spec1 = pow(max(dot(pN,H),0.), 48.);
      float spec2 = pow(max(dot(pN,H),0.), 380.);
      float fres  = pow(1.-NdotV, 4.2);
      float ridgeMask = smoothstep(.35, .72, f);

      vec3  refDir  = reflect(vec3(0,0,-1), pN);
      float caustic = slime(tN*1.8 + refDir*.3 + vec3(T*.22), T*.6);
      caustic = pow(max(caustic,0.), 4.0);

      // Color: purple (sel=0) vs sky blue (sel=1)
      vec3 cValley = mix(vec3(.02,.005,.09),   vec3(.005,.05,.12),  sel);
      vec3 cMid    = mix(vec3(.16,.05,.42),    vec3(.06,.22,.50),   sel);
      vec3 cRidge  = mix(vec3(.48,.18,.86),    vec3(.24,.58,.96),   sel);

      vec3 base = mix(cValley, cMid,   smoothstep(.0,.45,f));
      base      = mix(base,    cRidge, smoothstep(.45,.85,f));
      base *= (.12 + .88*ridgeMask) * (.16 + .84*depth);

      vec3 col = base * (.06 + .94*diff);

      vec3 causticA = mix(vec3(.55,.18,.95), vec3(.18,.60,.95), sel);
      vec3 causticB = mix(vec3(.90,.75,1.0), vec3(.75,.92,1.0), sel);
      vec3 specCol  = mix(vec3(.88,.82,1.0), vec3(.82,.92,1.0), sel);
      vec3 fresCol  = mix(vec3(.58,.22,.98), vec3(.22,.62,.98), sel);
      vec3 rimCol   = mix(vec3(.42,.08,.80), vec3(.08,.46,.82), sel);

      col += causticA * caustic * .7;
      col += causticB * pow(caustic,2.0) * 1.4;
      col += specCol  * spec1 * 2.8;
      col += vec3(1.00,.97,1.00) * spec2 * 9.0;
      col += fresCol * fres * 1.3;
      col += rimCol * pow(max(dot(N,L)*.5+.5,0.),4.) * .30;

      float alpha = smoothstep(-0.014, 0.010, f0) * sOpacity;
      gl_FragColor = vec4(col*alpha, alpha);
    }
  `;

  // ---- Compile & link ----
  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      gl.deleteShader(s); return null;
    }
    return s;
  }
  const vs = mkShader(gl.VERTEX_SHADER, VS);
  const fs = mkShader(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(prog)); return;
  }
  gl.useProgram(prog);

  // Fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Uniforms
  const uRes   = gl.getUniformLocation(prog, 'u_res');
  const uTime  = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  const uS1Pos     = gl.getUniformLocation(prog, 'u_s1_pos');
  const uS1Opacity = gl.getUniformLocation(prog, 'u_s1_opacity');
  const uRot1      = gl.getUniformLocation(prog, 'u_rot1');
  const uCPos1     = gl.getUniformLocation(prog, 'u_cpos1');
  const uCForce1   = gl.getUniformLocation(prog, 'u_cforce1');
  const uDrag1     = gl.getUniformLocation(prog, 'u_drag1');

  const uS2Pos     = gl.getUniformLocation(prog, 'u_s2_pos');
  const uS2Opacity = gl.getUniformLocation(prog, 'u_s2_opacity');
  const uRot2      = gl.getUniformLocation(prog, 'u_rot2');
  const uCPos2     = gl.getUniformLocation(prog, 'u_cpos2');
  const uCForce2   = gl.getUniformLocation(prog, 'u_cforce2');
  const uDrag2     = gl.getUniformLocation(prog, 'u_drag2');

  // ---- Resize ----
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width  = Math.round(window.innerWidth  * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // ---- Constants ----
  const SPHERE_R = 0.34;

  // Sphere positions for each view state
  const VIEWS = {
    splash:  { s1: { x: -0.46, y: 0.08 }, s2: { x: 0.46, y: 0.08 }, s1o: 0, s2o: 0 },
    testing: { s1: { x: 0.20, y: 0 },  s2: { x: 0.90, y: 0 }, s1o: 1, s2o: 0 },
    webdev:  { s1: { x:-0.90, y: 0 },  s2: { x: 0.20, y: 0 }, s1o: 0, s2o: 1 },
  };

  // ---- Per-sphere state ----
  function makeSphere(startX, startY) {
    return {
      pos:    { x: startX, y: startY, tx: startX, ty: startY },
      opacity:{ v: 0, t: 0 },
      rot:    { x: 0, y: 0, vx: 0, vy: 0 },
      csr:    { x: 0, y: 0, tx: 0, ty: 0, force: 0, fvel: 0, fTarget: 0 },
      dragUV: { x: 0, y: 0, vx: 0, vy: 0 },
    };
  }
  const s1 = makeSphere(-0.46, 0.08);
  const s2 = makeSphere(0.46, 0.08);

  // Global state
  const mouse    = { x: 0, y: 0, tx: 0, ty: 0 };
  let dragging   = false, dX = 0, dY = 0;
  let currentView = 'splash';
  let activeSphere = null; // reference to s1 or s2

  // ---- View transitions ----
  function setState(view) {
    currentView = view;
    const v = VIEWS[view];
    s1.pos.tx = v.s1.x;  s1.pos.ty = v.s1.y;  s1.opacity.t = v.s1o;
    s2.pos.tx = v.s2.x;  s2.pos.ty = v.s2.y;  s2.opacity.t = v.s2o;

    // In splash mode, canvas is clickable
    canvas.style.pointerEvents = view === 'splash' ? 'auto' : 'none';
    canvas.style.cursor = view === 'splash' ? 'pointer' : 'default';
  }

  // ---- Hit testing ----
  function getHitSphere(clientX, clientY) {
    const minDim = Math.min(innerWidth, innerHeight);
    const uvX = (clientX - innerWidth * 0.5) / minDim;
    const uvY = -(clientY - innerHeight * 0.5) / minDim;

    const d1 = Math.sqrt((uvX - s1.pos.x) ** 2 + (uvY - s1.pos.y) ** 2);
    const d2 = Math.sqrt((uvX - s2.pos.x) ** 2 + (uvY - s2.pos.y) ** 2);
    const hitR = SPHERE_R + 0.12;

    if (d1 < hitR && (d1 < d2 || s2.opacity.t < 0.1)) return 'testing';
    if (d2 < hitR) return 'webdev';
    return null;
  }

  // ---- Cursor helpers ----
  function updateCursorFor(s, clientX, clientY) {
    const minDim = Math.min(innerWidth, innerHeight);
    s.csr.tx = (clientX - innerWidth * 0.5) / minDim - s.pos.x;
    s.csr.ty = -(clientY - innerHeight * 0.5) / minDim - s.pos.y;
    const dist = Math.sqrt(s.csr.tx * s.csr.tx + s.csr.ty * s.csr.ty);
    s.csr.fTarget = Math.max(0, 1 - dist / SPHERE_R);
  }

  function accDrag(s, dx, dy) {
    const minDim = Math.min(innerWidth, innerHeight);
    s.dragUV.vx +=  dx / minDim;
    s.dragUV.vy += -dy / minDim;
    s.rot.vx -= dx * 0.00018;
    s.rot.vy -= dy * 0.00018;
  }

  function pickActive(clientX, clientY) {
    const minDim = Math.min(innerWidth, innerHeight);
    const uvX = (clientX - innerWidth * 0.5) / minDim;
    const uvY = -(clientY - innerHeight * 0.5) / minDim;
    const d1 = Math.sqrt((uvX - s1.pos.x) ** 2 + (uvY - s1.pos.y) ** 2);
    const d2 = Math.sqrt((uvX - s2.pos.x) ** 2 + (uvY - s2.pos.y) ** 2);

    const can1 = s1.opacity.t > 0.1;
    const can2 = s2.opacity.t > 0.1;
    if (can1 && (!can2 || d1 <= d2)) return s1;
    if (can2) return s2;
    return null;
  }

  // ---- Input ----
  document.addEventListener('mousemove', e => {
    mouse.tx = (e.clientX / innerWidth  - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;

    activeSphere = pickActive(e.clientX, e.clientY);
    if (activeSphere) {
      updateCursorFor(activeSphere, e.clientX, e.clientY);
    }
    if (dragging && activeSphere) {
      accDrag(activeSphere, e.clientX - dX, e.clientY - dY);
    }
    dX = e.clientX; dY = e.clientY;
  });

  document.addEventListener('mousedown', e => {
    dragging = true; dX = e.clientX; dY = e.clientY;
    if (currentView !== 'splash') document.body.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup', () => {
    dragging = false; document.body.style.cursor = '';
  });

  // Click on canvas → navigate
  canvas.addEventListener('click', e => {
    if (currentView !== 'splash') return;
    const hit = getHitSphere(e.clientX, e.clientY);
    if (hit) {
      setState(hit);
      document.dispatchEvent(new CustomEvent('sphereNav', { detail: { view: hit } }));
    }
  });

  // Touch
  window.addEventListener('touchstart', e => {
    const t = e.touches[0]; if (!t) return;
    dragging = true; dX = t.clientX; dY = t.clientY;
    activeSphere = pickActive(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0]; if (!t) return;
    mouse.tx = (t.clientX / innerWidth  - 0.5) * 2;
    mouse.ty = (t.clientY / innerHeight - 0.5) * 2;
    activeSphere = pickActive(t.clientX, t.clientY);
    if (activeSphere) {
      updateCursorFor(activeSphere, t.clientX, t.clientY);
      accDrag(activeSphere, t.clientX - dX, t.clientY - dY);
    }
    dX = t.clientX; dY = t.clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; }, { passive: true });

  // ---- Render loop ----
  const t0 = performance.now();

  function lerpSphere(s) {
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

  function draw() {
    requestAnimationFrame(draw);

    mouse.x += (mouse.tx - mouse.x) * 0.055;
    mouse.y += (mouse.ty - mouse.y) * 0.055;

    // Decay cursor force for non-active spheres
    if (activeSphere !== s1) s1.csr.fTarget = 0;
    if (activeSphere !== s2) s2.csr.fTarget = 0;

    lerpSphere(s1);
    lerpSphere(s2);

    // Skip GPU work entirely when both spheres are invisible (splash mode)
    if (s1.opacity.v < 0.01 && s2.opacity.v < 0.01) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return;
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform2f(uRes,   canvas.width, canvas.height);
    gl.uniform1f(uTime,  (performance.now() - t0) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);

    gl.uniform2f(uS1Pos,      s1.pos.x, s1.pos.y);
    gl.uniform1f(uS1Opacity,  s1.opacity.v);
    gl.uniform2f(uRot1,       s1.rot.x, s1.rot.y);
    gl.uniform2f(uCPos1,      s1.csr.x, s1.csr.y);
    gl.uniform1f(uCForce1,    s1.csr.force);
    gl.uniform2f(uDrag1,      s1.dragUV.x, s1.dragUV.y);

    gl.uniform2f(uS2Pos,      s2.pos.x, s2.pos.y);
    gl.uniform1f(uS2Opacity,  s2.opacity.v);
    gl.uniform2f(uRot2,       s2.rot.x, s2.rot.y);
    gl.uniform2f(uCPos2,      s2.csr.x, s2.csr.y);
    gl.uniform1f(uCForce2,    s2.csr.force);
    gl.uniform2f(uDrag2,      s2.dragUV.x, s2.dragUV.y);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  draw();

  // ---- Expose API ----
  window.sphereCtrl = { setState, getHitSphere };
})();
