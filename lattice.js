/* The Lattice: one persistent WebGL scene behind the whole page.
   A field of instanced architectural columns in the Gentrobyte blue palette, lit from above,
   with a cleared core where the official logo (an untouched <img>) is projected into the scene. */
(function () {
  'use strict';
  var root = document.documentElement, cv = document.getElementById('gl');
  if (!cv || !window.THREE) { root.classList.add('no-gl'); return; }
  var T = window.THREE;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = Math.min(innerWidth, innerHeight) < 700;
  var N = mobile ? 40 : 72, SP = mobile ? 1.0 : .86;

  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: !mobile, alpha: false, powerPreference: 'high-performance' }); }
  catch (err) { root.classList.add('no-gl'); return; }
  var pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x040817, 1);

  var scene = new T.Scene();
  var cam = new T.PerspectiveCamera(32, 1, .5, 200);
  var core = new T.Vector3(0, 1.8, 0);

  /* ---- columns ---- */
  var box = new T.BoxGeometry(1, 1, 1); box.translate(0, .5, 0);
  var g = new T.InstancedBufferGeometry();
  g.index = box.index;
  g.setAttribute('position', box.attributes.position);
  g.setAttribute('normal', box.attributes.normal);
  g.setAttribute('uv', box.attributes.uv);
  var off = new Float32Array(N * N * 3), k = 0;
  for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
    off[k++] = (i - N / 2 + .5) * SP; off[k++] = (j - N * .78 + .5) * SP; off[k++] = Math.random();
  }
  g.setAttribute('aOff', new T.InstancedBufferAttribute(off, 3));
  g.instanceCount = N * N;

  var U = {
    uTime: { value: 0 }, uMouse: { value: new T.Vector2(99, 99) }, uScroll: { value: 0 }, uCore: { value: 1 }
  };

  var vert = [
    'attribute vec3 aOff;',
    'uniform float uTime; uniform vec2 uMouse; uniform float uScroll;',
    'varying vec3 vN; varying vec2 vUv; varying float vH; varying float vY; varying float vDist; varying float vE; varying float vTop;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'void main(){',
    '  vec2 p=aOff.xy; float d=length(p); float t=uTime;',
    '  float a=sin(p.x*.38+t*.30)*.5+sin(p.y*.33-t*.24)*.5;',
    '  float b=sin((p.x+p.y)*.19+t*.16)*.5+.5;',
    '  float h=.3+(a*.5+.5)*1.1+b*1.0;',
    '  float bowl=smoothstep(5.,26.,d)*7.5;',
    '  float clear=smoothstep(2.6,5.4,d);',
    '  h=(h+bowl)*clear+.12;',
    '  h*=.55+aOff.z*.9;',
    '  float ring=exp(-pow((d-mod(t*2.4,34.))*.55,2.));',
    '  float cur=exp(-length(p-uMouse)*.6);',
    '  h+=ring*1.1+cur*2.0;',
    '  vE=ring*.55+cur*.9;',
    '  vec3 pos=position; pos.xz*=.64; pos.y*=h;',
    '  vec3 w=vec3(aOff.x+pos.x,pos.y,aOff.y+pos.z);',
    '  vN=normal; vUv=uv; vH=h; vY=pos.y; vTop=step(.5,normal.y);',
    '  vec4 mv=viewMatrix*vec4(w,1.); vDist=length(mv.xyz);',
    '  gl_Position=projectionMatrix*mv;',
    '}'
  ].join('\n');

  var frag = [
    'precision highp float;',
    'varying vec3 vN; varying vec2 vUv; varying float vH; varying float vY; varying float vDist; varying float vE; varying float vTop;',
    'void main(){',
    '  vec3 n=normalize(vN);',
    '  vec3 deep=vec3(.012,.030,.095), cobalt=vec3(.07,.20,.72), elec=vec3(.18,.42,1.), ice=vec3(.72,.88,1.);',
    '  float g=clamp(vY/max(vH,.001),0.,1.);',
    '  vec3 col=mix(deep,cobalt*.40,pow(g,1.9));',
    '  float l=clamp(dot(n,normalize(vec3(-.45,.85,.55))),0.,1.);',
    '  col+=elec*.14*l*(.25+g);',
    '  col=mix(col,mix(elec,ice,.55)*.62,vTop*.9);',
    '  vec2 e=min(vUv,1.-vUv);',
    '  float edge=1.-smoothstep(0.,.07,vTop>.5?min(e.x,e.y):e.x);',
    '  col+=ice*edge*.30*(.35+g);',
    '  col+=ice*vE*(.55*g+vTop*.7);',
    '  float f=smoothstep(22.,70.,vDist); col=mix(col,vec3(.016,.034,.10),f);',
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  var mat = new T.ShaderMaterial({ uniforms: U, vertexShader: vert, fragmentShader: frag });
  var mesh = new T.Mesh(g, mat); mesh.frustumCulled = false; scene.add(mesh);

  /* ---- floor grid ---- */
  var floor = new T.Mesh(new T.PlaneGeometry(130, 130), new T.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uTime: U.uTime },
    vertexShader: 'varying vec2 vP; void main(){vP=position.xy; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: [
      'precision highp float; varying vec2 vP; uniform float uTime;',
      'void main(){ vec2 g=abs(fract(vP*.5)-.5)/fwidth(vP*.5); float l=1.-min(min(g.x,g.y),1.);',
      ' float d=length(vP); float fade=smoothstep(60.,6.,d);',
      ' float ring=smoothstep(.04,0.,abs(d-3.6))*.9 + smoothstep(.03,0.,abs(d-5.4))*.35;',
      ' vec3 c=vec3(.18,.42,1.)*(l*.16*fade)+vec3(.72,.88,1.)*ring*.5;',
      ' gl_FragColor=vec4(c,max(l*.16*fade,ring*.6)); }'
    ].join('\n'), extensions: { derivatives: true }
  }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = .005; scene.add(floor);

  /* ---- light shaft above the core ---- */
  var shaft = new T.Mesh(new T.CylinderGeometry(1.1, 2.2, 16, 40, 1, true), new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide, uniforms: { uTime: U.uTime },
    vertexShader: 'varying float vY; void main(){vY=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'precision highp float; varying float vY; void main(){ float a=smoothstep(8.,-8.,vY); a=a*a*.16; gl_FragColor=vec4(vec3(.22,.46,1.)*a*2.,a);}'
  }));
  shaft.position.set(core.x, 8, core.z); scene.add(shaft);

  /* ---- sizing, view offset so the core sits right of the headline ---- */
  var W = 1, H = 1;
  function size() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    cam.aspect = W / H;
    if (W > 900) cam.setViewOffset(W, H, -W * .2, 0, W, H);
    else cam.setViewOffset(W, H, 0, H * .17, W, H);
    cam.updateProjectionMatrix();
  }
  size();
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 120); });

  /* ---- input ---- */
  var mx = 0, my = 0, tx = 0, ty = 0, ray = new T.Raycaster(), plane = new T.Plane(new T.Vector3(0, 1, 0), 0), hit = new T.Vector3(), ndc = new T.Vector2();
  var pend = false, pcx = 0, pcy = 0;
  addEventListener('pointermove', function (e) { tx = e.clientX / W - .5; ty = e.clientY / H - .5; pcx = e.clientX; pcy = e.clientY; pend = true; kick(); }, { passive: true });
  function pick() {
    pend = false; ndc.set(pcx / W * 2 - 1, -(pcy / H) * 2 + 1); ray.setFromCamera(ndc, cam);
    if (ray.ray.intersectPlane(plane, hit)) { U.uMouse.value.set(hit.x, hit.z); hud(hit.x, hit.z); }
  }
  var hudEl = document.getElementById('hudXY'), hudT = 0;
  function pad(v) { var s = Math.abs(v).toFixed(1); return (v < 0 ? '-' : '+') + (s.length < 4 ? '0' + s : s); }
  function hud(x, z) { var n = performance.now(); if (!hudEl || n - hudT < 80) return; hudT = n; hudEl.innerHTML = 'X ' + pad(x) + ' &nbsp; Z ' + pad(z); }

  /* ---- core logo: the real <img>, projected from world space ---- */
  var coreEl = document.getElementById('core'), v3 = new T.Vector3(), coreHidden = false;
  function placeCore(sc) {
    if (!coreEl) return;
    v3.copy(core).project(cam);
    var x = (v3.x * .5 + .5) * W, y = (-v3.y * .5 + .5) * H;
    if (W <= 900) { x = W * .5; y = Math.max(150, H * .2); }
    var s = Math.max(.55, Math.min(1.3, 27 / camDist));
    var fade = Math.max(0, 1 - sc * 1.15);
    if (fade === 0 && coreHidden) return;
    coreHidden = fade === 0;
    coreEl.style.opacity = fade.toFixed(3);
    coreEl.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) translate(-50%,-50%) scale(' + s.toFixed(3) + ') rotateY(' + (tx * 14).toFixed(2) + 'deg) rotateX(' + (-ty * 10).toFixed(2) + 'deg)';
  }

  /* ---- loop ----
     One rAF chain, started by kick(). It stops while the tab is hidden or a service page is open
     (the canvas is hidden there), and restarts on demand. No layout reads inside the frame. */
  var dim = mobile ? .8 : .64, camDist = 28, clock = 0, last = performance.now(), frame = 0;
  var hiddenTab = document.hidden, paused = false, queued = false, lastSy = -1, lastOp = '', slow = 0, fastN = 0;
  function kick() { if (queued || hiddenTab || paused) return; queued = true; last = performance.now(); requestAnimationFrame(render); }
  function render(now) {
    queued = false;
    if (hiddenTab || paused) return;
    requestAnimationFrame(render); queued = true;
    var raw = (now - last) / 1000, dt = Math.min(.05, raw); last = now;
    var sy = window.scrollY, sc = Math.min(1, sy / (H * .95));
    var far = sy > H * 1.6;
    frame++; if (far && frame % 3) return;
    /* reduced motion: only redraw when the view actually changes */
    if (reduce && !pend && sy === lastSy && Math.abs(tx - mx) < .001 && Math.abs(ty - my) < .001) return;
    lastSy = sy;
    /* adaptive quality: if frames stay slow, step the pixel ratio down (never back up, never below 1) */
    if (!far && raw > 0) {
      slow = slow * .94 + raw * .06;
      if (++fastN > 90 && slow > .027 && pr > 1) { pr = Math.max(1, pr - .25); renderer.setPixelRatio(pr); renderer.setSize(W, H, false); fastN = 0; slow = .016; }
    }
    if (!reduce) clock += dt * (far ? 3 : 1);
    U.uTime.value = clock + 6;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    var p = Math.min(1, sy / (H * 3.2));
    var px = mx * 3.2 + p * 6, py = 8.6 + (-my) * 1.6 + p * 9, pz = 28 - p * 12;
    cam.position.set(px, py, pz);
    cam.lookAt(core.x + p * 1.5, core.y + .6 - p * 1.5, core.z);
    camDist = cam.position.distanceTo(core);
    if (pend) pick();
    placeCore(sc);
    var op = (1 - Math.min(dim, Math.max(0, (sy - H * .35) / (H * .65)) * dim)).toFixed(3);
    if (op !== lastOp) { lastOp = op; cv.style.opacity = op; }
    renderer.render(scene, cam);
  }
  document.addEventListener('visibilitychange', function () { hiddenTab = document.hidden; if (!hiddenTab) kick(); });
  /* app.js tells us when a service detail page (static blue background) is showing */
  document.addEventListener('gb:view', function (e) { paused = !!(e.detail && e.detail.service); if (!paused) kick(); });
  kick();
  root.classList.add('gl-on');
})();
