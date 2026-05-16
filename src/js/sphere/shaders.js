// ============================================================
// shaders.js — GLSL vertex & fragment shader source
// ============================================================

export const VS = `
  attribute vec2 a_pos;
  void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export const FS = `
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

    // Quick distance cull
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

    // Pick dominant sphere
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
