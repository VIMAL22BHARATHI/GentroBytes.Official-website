/* Gentrobyte AI Labs: loader, page transitions, brief, explorer, showcase switches, contact. */
(function () {
  'use strict';
  var CONFIG = { endpoint: '', whatsapp: '919159247730' };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loader (logo only) ---------- */
  var loader = $('#loader'), loaded = false;
  function finishLoad() {
    if (loaded) return; loaded = true; html.classList.remove('loading');
    if (loader) { loader.classList.add('done'); setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, reduce ? 80 : 900); }
    startReveal(); var hh = $('.hero'); if (hh) hh.classList.add('go-in');
  }
  (function () {
    if (!loader) { finishLoad(); return; }
    var t0 = performance.now(), minT = reduce ? 150 : 900;
    var win = document.readyState === 'complete', fonts = false;
    if (!win) window.addEventListener('load', function () { win = true; });
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { fonts = true; }, function () { fonts = true; });
    (function tick() {
      if (win && fonts && performance.now() - t0 >= minT) { finishLoad(); return; }
      requestAnimationFrame(tick);
    })();
    setTimeout(finishLoad, 7000);
  })();

  /* ---------- page transition ---------- */
  var curtain = $('#curtain'), cvLabel = $('#cvLabel'), busy = false;
  function labelFor(t) { var h = t.querySelector('h2,h1'); return h ? h.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function veil(label, go) {
    if (reduce || busy) { go(); return; }
    busy = true; cvLabel.textContent = label;
    curtain.classList.remove('out'); curtain.classList.add('on');
    setTimeout(function () { go(); curtain.classList.add('out'); }, 700);
    setTimeout(function () { curtain.classList.remove('on', 'out'); busy = false; }, 1500);
  }
  function pageTo(sel, cb) {
    var t = sel === '#top' ? document.body : $(sel); if (!t) return;
    var go = function () {
      hideDetail();
      html.style.scrollBehavior = 'auto';
      if (sel === '#top') window.scrollTo(0, 0); else t.scrollIntoView();
      html.style.scrollBehavior = '';
      if (cb) cb();
    };
    veil(sel === '#top' ? 'Gentrobyte AI Labs' : labelFor(t), go);
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a || ev.metaKey || ev.ctrlKey) return;
    var h = a.getAttribute('href'); if (h.length < 2 || h.charAt(1) === '/') return;
    ev.preventDefault(); closeMenu();
    if (inDetail) history.pushState(null, '', location.pathname + location.search + h);
    pageTo(h);
  });

  /* ---------- nav ---------- */
  var nav = $('#top'), menuBtn = $('#menuBtn'), mnav = $('#mnav');
  function closeMenu() { if (!mnav || mnav.hidden) return; mnav.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); html.style.overflow = ''; }
  menuBtn.addEventListener('click', function () {
    var open = mnav.hidden; mnav.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); html.style.overflow = open ? 'hidden' : '';
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  var spyMap = { about: 'about', services: 'services', responsive: 'responsive', mobile: 'responsive', marketing: 'marketing', partners: 'partners' };
  var links = $$('#navList a');
  var scrollQ = false, lastSpy = '', lastScrolled = null;
  function onScroll() { if (scrollQ) return; scrollQ = true; requestAnimationFrame(doScroll); }
  function doScroll() {
    scrollQ = false;
    var sc = window.scrollY > 24;
    if (sc !== lastScrolled) { lastScrolled = sc; nav.classList.toggle('scrolled', sc); }
    var y = window.innerHeight * 0.35, cur = '';
    Object.keys(spyMap).forEach(function (id) { var el = document.getElementById(id); if (el) { var r = el.getBoundingClientRect(); if (r.top < y && r.bottom > y) cur = spyMap[id]; } });
    if (inDetail) cur = 'services';
    if (cur === lastSpy) return; lastSpy = cur;
    links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- reveal + counters + map ---------- */
  function countUp(el) {
    var to = +el.getAttribute('data-count'); if (!to || reduce) { el.textContent = to; return; }
    var t0 = performance.now(), d = 1400;
    (function f(t) { var p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  var io;
  function startReveal() {
    if (!('IntersectionObserver' in window)) { $$('[data-r]').forEach(function (e) { e.classList.add('in'); }); return; }
    io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
        $$('[data-count]', en.target).forEach(countUp);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-r]').forEach(function (e) { io.observe(e); });
    $$('.hero-stats [data-count]').forEach(countUp);
  }

  /* ---------- hero tilt ---------- */
  var art = $('#heroArt');
  if (false) {
    art.parentNode.addEventListener('pointermove', function (e) {
      var r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      art.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg'); art.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
      var c = art.querySelector('.logo-card'); c.style.setProperty('--rx', (-y * 12).toFixed(2) + 'deg'); c.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
    });
    art.parentNode.addEventListener('pointerleave', function () { var c = art.querySelector('.logo-card'); c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); });
  }

  /* ---------- about explorer ---------- */
  var DATA = { about: [], svc: [] }; try { DATA = JSON.parse($('#data').textContent); } catch (e) { }
  var ABOUT = DATA.about;
  var abItems = $$('.ab-item'), abBox = $('#abDetail');
  function setAb(i, focus) {
    if (!ABOUT[i]) return;
    abItems.forEach(function (b, k) { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    $('#abIc').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ABOUT[i].i + '</svg>';
    $('#abN').textContent = ABOUT[i].n; $('#abD').textContent = ABOUT[i].d;
    $('#abK').textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ABOUT.length;
    abBox.classList.remove('swap'); void abBox.offsetWidth; abBox.classList.add('swap');
    if (focus) abItems[i].focus();
    abRestart();
  }
  abItems.forEach(function (b, i) {
    b.addEventListener('click', function () { setAb(i); });
    b.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) setAb(i); });
    b.addEventListener('keydown', function (e) {
      var n = abItems.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setAb((i + 1) % n, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); setAb((i + n - 1) % n, true); }
    });
  });
  setAb(0);

  /* ---------- services brief ---------- */
  var brief = [], files = [];
  var addBtns = $$('[data-add]'), dockCount = $('#dockCount'), briefBox = $('#briefBox'), briefChips = $('#briefChips');
  function syncBrief() {
    addBtns.forEach(function (b) {
      var on = brief.indexOf(b.getAttribute('data-add')) > -1;
      b.setAttribute('aria-pressed', String(on)); b.lastElementChild.textContent = on ? 'Added' : 'Add to brief';
    });
    dockCount.hidden = !(brief.length || files.length);
    var bits = []; if (brief.length) bits.push(brief.length + (brief.length === 1 ? ' service' : ' services')); if (files.length) bits.push(files.length + (files.length === 1 ? ' file' : ' files'));
    dockCount.textContent = bits.join(' + ');
    briefBox.hidden = !brief.length;
    briefChips.innerHTML = '';
    brief.forEach(function (n) {
      var li = document.createElement('li'); li.appendChild(document.createTextNode(n));
      var x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Remove ' + n); x.textContent = '×';
      x.addEventListener('click', function () { brief.splice(brief.indexOf(n), 1); syncBrief(); });
      li.appendChild(x); briefChips.appendChild(li);
    });
  }
  addBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var n = b.getAttribute('data-add'), i = brief.indexOf(n);
      if (i > -1) brief.splice(i, 1); else brief.push(n);
      syncBrief();
    });
  });
  $$('.svc').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* ---------- showcase switches ---------- */
  function seg(id, stage) {
    var box = $(id), st = $(stage); if (!box || !st) return;
    $$('button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        st.setAttribute('data-view', b.getAttribute('data-v'));
      });
    });
  }
  seg('#devSeg', '#devStage'); seg('#appSeg', '#appStage');

  /* ---------- dock ---------- */
  var dock = $('#dock'), dockReq = $('#dockReq'), fMsg = $('#fMsg'), dockFile = $('#dockFile');
  $('#heroReq').addEventListener('click', function () { dockReq.focus(); dock.animate && dock.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 500 }); });
  dockFile.addEventListener('change', function () { files = Array.prototype.map.call(dockFile.files, function (f) { return f.name; }); syncBrief(); });
  dock.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = dockReq.value.trim();
    if (v) fMsg.value = v;
    pageTo('#contact', function () { setTimeout(function () { (v ? $('#fName') : fMsg).focus({ preventScroll: true }); }, 100); });
  });
  var away = [];
  var dio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { var i = away.indexOf(en.target); if (en.isIntersecting && i < 0) away.push(en.target); if (!en.isIntersecting && i > -1) away.splice(i, 1); });
    dock.classList.toggle('away', away.length > 0);
  }, { threshold: 0.25 }) : null;
  if (dio) { dio.observe($('#contact')); dio.observe($('.foot')); }

  /* ---------- contact form ---------- */
  var form = $('#form'), err = $('#formErr'), sent = $('#sent');
  function compose() {
    var d = form.elements, t = 'Name: ' + d.name.value.trim() + '\nEmail: ' + d.email.value.trim() + '\nMobile: ' + d.mobile.value.trim() + '\n\n' + d.message.value.trim();
    if (brief.length) t += '\n\nServices: ' + brief.join(', ');
    if (files.length) t += '\n\nFiles to send separately: ' + files.join(', ');
    return t;
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); sent.hidden = true; err.hidden = true;
    var d = form.elements, bad = [];
    [['name', 'name'], ['email', 'email'], ['mobile', 'mobile number'], ['message', 'message']].forEach(function (p) {
      var el = d[p[0]], v = el.value.trim(), ok = !!v;
      if (p[0] === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (p[0] === 'mobile') ok = v.replace(/\D/g, '').length >= 7;
      el.setAttribute('aria-invalid', String(!ok)); if (!ok) bad.push(p[1]);
    });
    if (bad.length) { err.textContent = 'Check your ' + bad.join(', ') + '.'; err.hidden = false; form.querySelector('[aria-invalid="true"]').focus(); return; }
    var text = compose();
    if (CONFIG.endpoint) {
      fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name.value, email: d.email.value, mobile: d.mobile.value, message: d.message.value, services: brief }) })
        .then(function (r) { if (!r.ok) throw 0; sent.querySelector('h4').textContent = 'Message sent'; sent.querySelector('p').textContent = 'Thank you. We will get back to you.'; sent.hidden = false; })
        .catch(function () { err.textContent = 'Could not send. Use WhatsApp instead.'; err.hidden = false; });
      return;
    }
    $('#sentText').value = text; $('#waLink').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text);
    sent.hidden = false; sent.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  });
  form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) e.target.removeAttribute('aria-invalid'); });
  $('#copyBtn').addEventListener('click', function () {
    var b = this, ta = $('#sentText');
    function ok() { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy message'; }, 1600); }
    function fb() { ta.focus(); ta.select(); try { document.execCommand('copy'); ok(); } catch (x) { } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(ok, fb); else fb();
  });


  /* ================= interactive layer ================= */
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* headline line reveal */
  $$('.h2,.hero h1').forEach(function (h) {
    var parts = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = parts.map(function (p) { return '<span class="ln"><span>' + p + '</span></span>'; }).join('');
  });

  /* scroll progress + marquee speed */
  var prog = $('#prog'), marq = $('.marq-in'), mx0 = 0, lastY = window.scrollY, vel = 0, maxScroll = 0, marqW = 0, lastP = -1, marqOn = false;
  function measure() { maxScroll = document.documentElement.scrollHeight - innerHeight; if (marq) marqW = marq.scrollWidth / 2; }
  measure(); window.addEventListener('resize', measure); window.addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.documentElement);
  if ('IntersectionObserver' in window && $('#marq')) new IntersectionObserver(function (es) { marqOn = es[0].isIntersecting; }).observe($('#marq')); else marqOn = true;
  (function raf() {
    var y = window.scrollY, p = maxScroll > 0 ? +(y / maxScroll).toFixed(4) : 0;
    if (p !== lastP) { lastP = p; prog.style.setProperty('--p', p); }
    vel += ((y - lastY) - vel) * .12; lastY = y;
    if (marq && !reduce && marqOn) { mx0 -= 0.7 + Math.min(14, Math.abs(vel) * .5); if (-mx0 >= marqW) mx0 += marqW; marq.style.transform = 'translateX(' + mx0.toFixed(1) + 'px)'; }
    requestAnimationFrame(raf);
  })();

  /* custom cursor + magnetic buttons */
  if (fine && !reduce) {
    var cur = $('#cur'), cx = -100, cy = -100, tx = -100, ty = -100;
    var curRun = false;
    function curTick() {
      cx += (tx - cx) * .22; cy += (ty - cy) * .22; cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      if (Math.abs(tx - cx) < .2 && Math.abs(ty - cy) < .2) { curRun = false; return; }
      requestAnimationFrame(curTick);
    }
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; if (!curRun) { curRun = true; requestAnimationFrame(curTick); } cur.classList.add('on'); var t = e.target;
      cur.classList.toggle('hot', !!(t.closest && t.closest('a,button,[role="tab"],[role="slider"],.tilt,label,.tiles i,.bars i')));
      cur.classList.toggle('txt', !!(t.closest && t.closest('input,textarea'))); }, { passive: true });
    window.addEventListener('pointerdown', function () { cur.classList.add('down'); }); window.addEventListener('pointerup', function () { cur.classList.remove('down'); });
    document.addEventListener('pointerleave', function () { cur.classList.remove('on'); });
    $$('.btn,.d-send,.kbtn,.menu-btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.translate = ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px'; });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  }

  /* 3D tilt cards */
  function tilt(el, max) {
    el.classList.add('tilt');
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.classList.add('live'); el.style.setProperty('--ry', (x * max).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * max).toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', function () { el.classList.remove('live'); el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
  }
  if (!reduce) { $$('.svc,.acct,.ad').forEach(function (c) { tilt(c, 9); }); $$('.stage .dev,.stage .app').forEach(function (c) { tilt(c, 8); }); }

  /* about autoplay with progress */
  var abTimer, abHold = false, abIdle = 0;
  function abRestart() {
    clearTimeout(abTimer);
    abItems.forEach(function (b) { b.classList.remove('auto'); });
    var cur = abItems.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0];
    if (!cur || reduce) return;
    void cur.offsetWidth; cur.style.setProperty('--dur', '5s'); cur.classList.add('auto');
    abTimer = setTimeout(function () {
      if (abHold || !abVisible) { abRestart(); return; }
      var i = abItems.indexOf(cur); setAbAuto((i + 1) % abItems.length);
    }, 5000);
  }
  function setAbAuto(i) { setAb(i); }
  var abVisible = false;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { abVisible = es[0].isIntersecting; }, { threshold: 0.3 }).observe($('.explorer'));
  var ex = $('.explorer');
  ex.addEventListener('pointerenter', function () { abHold = true; }); ex.addEventListener('pointerleave', function () { abHold = false; });
  ex.addEventListener('focusin', function () { abHold = true; }); ex.addEventListener('focusout', function () { abHold = false; });
  abBox.insertAdjacentHTML('afterbegin', '<span class="glow" id="abGlow"></span>');
  abBox.addEventListener('pointermove', function (e) { var r = abBox.getBoundingClientRect(); var g = $('#abGlow'); g.style.setProperty('--gx', ((e.clientX - r.left) * .15 - 40) + 'px'); g.style.setProperty('--gy', ((e.clientY - r.top) * .15 - 20) + 'px'); });
  abRestart();

  /* hero depth + chips */
  var heroSec = $('.hero');
  if (heroSec && !reduce) heroSec.addEventListener('pointermove', function (e) {
    var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    $$('.chip', art).forEach(function (c, i) { var d = 14 + i * 6; c.style.translate = (-x * d).toFixed(1) + 'px ' + (-y * d).toFixed(1) + 'px'; });
    var rg = $('.rings', art); if (rg) rg.style.transform = 'translate(' + (x * 18).toFixed(1) + 'px,' + (y * 18).toFixed(1) + 'px)';
  });
  $$('.chip', art).forEach(function (c, i) { c.setAttribute('role', 'button'); c.tabIndex = 0; var go = function () { var idx = [0, 1, 2, 4][i]; pageTo('#about', function () { setAb(idx); }); }; c.addEventListener('click', go); c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
  art.removeAttribute('aria-hidden');

  /* services: search + added only (FLIP) */
  var cards = $$('.svc'), svcQ = $('#svcQ'), svcAdded = $('#svcAdded'), svcN = $('#svcN'), svcEmpty = $('#svcEmpty');
  function filterSvc() {
    var q = svcQ.value.trim().toLowerCase(), only = svcAdded.getAttribute('aria-pressed') === 'true', first = cards.map(function (c) { return c.getBoundingClientRect(); }), shown = 0;
    cards.forEach(function (c) {
      var n = c.getAttribute('data-n'), t = c.querySelector('p').textContent, ok = (!q || (n + ' ' + t).toLowerCase().indexOf(q) > -1) && (!only || brief.indexOf(n) > -1);
      c.classList.toggle('off', !ok); if (ok) shown++;
    });
    svcN.textContent = shown + ' of ' + cards.length; svcEmpty.hidden = shown > 0;
    if (!reduce) cards.forEach(function (c, i) {
      if (c.classList.contains('off')) return; var l = c.getBoundingClientRect(), f = first[i];
      if (f.width && (f.left !== l.left || f.top !== l.top)) c.animate([{ transform: 'translate(' + (f.left - l.left) + 'px,' + (f.top - l.top) + 'px)' }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
      else if (!f.width) c.animate([{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 350 });
    });
  }
  svcQ.addEventListener('input', filterSvc);
  svcAdded.addEventListener('click', function () { svcAdded.setAttribute('aria-pressed', String(svcAdded.getAttribute('aria-pressed') !== 'true')); filterSvc(); });
  var baseSync = syncBrief; syncBrief = function () { baseSync(); renderSugg(); if (svcAdded.getAttribute('aria-pressed') === 'true') filterSvc(); };
  addBtns.forEach(function (b) { b.addEventListener('click', function () { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }); });

  /* responsive resizer */
  var rzF = $('#rzFrame'), rzT = $('#rzTrack'), rzH = $('#rzHandle'), rzL = $('#rzLabel'), rzW = $('#rzW'), rzV = $('#rzView');
  function rzMax() { return Math.max(320, rzT.clientWidth - 26); }
  function rzSet(w, anim) {
    w = Math.max(320, Math.min(rzMax(), Math.round(w)));
    rzF.classList.toggle('drag', !anim); rzF.style.setProperty('--w', w + 'px');
    var vw = Math.round(w / rzMax() * 1200), name = w >= rzMax() * .86 ? 'Desktop View' : w >= rzMax() * .66 ? 'Laptop View' : w >= rzMax() * .42 ? 'Tablet View' : 'Mobile View';
    rzL.textContent = 'E-Commerce: ' + name; rzW.textContent = vw + 'px'; if (rzV) rzV.textContent = name;
    rzH.setAttribute('aria-valuenow', String(vw)); rzH.setAttribute('aria-valuetext', name + ', ' + vw + ' pixels wide');
  }
  var dragging = false;
  rzH.addEventListener('pointerdown', function (e) { dragging = true; rzH.setPointerCapture(e.pointerId); e.preventDefault(); });
  rzH.addEventListener('pointermove', function (e) { if (!dragging) return; var r = rzT.getBoundingClientRect(); rzSet(e.clientX - r.left); });
  rzH.addEventListener('pointerup', function () { dragging = false; });
  rzH.addEventListener('keydown', function (e) { var w = rzF.getBoundingClientRect().width, st = e.shiftKey ? 80 : 30; if (e.key === 'ArrowLeft') { e.preventDefault(); rzSet(w - st, true); } if (e.key === 'ArrowRight') { e.preventDefault(); rzSet(w + st, true); } });
  window.addEventListener('resize', function () { rzSet(rzF.getBoundingClientRect().width); });
  var presets = { all: 1, desktop: 1, laptop: .76, tablet: .52, mobile: .3 };
  $$('#devSeg button').forEach(function (b) { b.addEventListener('click', function () { rzSet(rzMax() * presets[b.getAttribute('data-v')], true); }); });
  rzSet(rzMax());
  var cartN = $('#cartN'), cartEl = $('.cart'), cnt = 0;
  $$('.padd').forEach(function (b) { b.addEventListener('click', function () { cnt++; cartN.textContent = cnt; cartEl.classList.remove('bump'); void cartEl.offsetWidth; cartEl.classList.add('bump'); b.classList.add('ok'); b.textContent = 'Added'; setTimeout(function () { b.classList.remove('ok'); b.textContent = 'Add'; }, 1100); }); });

  /* mobile app screens */
  $$('.ph').forEach(function (ph) {
    $$('.feat', ph).forEach(function (f) { f.addEventListener('click', function () { $('.detail .big em', ph).textContent = f.getAttribute('data-f'); ph.classList.add('open'); $('.detail', ph).setAttribute('aria-hidden', 'false'); $('.back', ph).focus({ preventScroll: true }); }); });
    $('.back', ph).addEventListener('click', function () { ph.classList.remove('open'); $('.detail', ph).setAttribute('aria-hidden', 'true'); });
  });

  /* marketing: like tiles, follower counters */
  $$('.tiles i').forEach(function (t) { t.addEventListener('click', function () { t.classList.toggle('liked'); }); });
  $$('.acct-h p').forEach(function (p) { var m = p.textContent.match(/^(\d+)K/); if (!m) return; var n = +m[1]; p.innerHTML = '<span data-cnt="' + n + '">' + n + '</span>K followers'; });
  var cio = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting) return; cio.unobserve(en.target); $$('[data-cnt]', en.target).forEach(function (s) { var to = +s.getAttribute('data-cnt'), t0 = performance.now(); (function f(t) { var p = Math.min(1, (t - t0) / 1300); s.textContent = reduce ? to : Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0); }); }); }, { threshold: .3 }) : null;
  if (cio) $$('.acct').forEach(function (a) { cio.observe(a); });

  /* map: parallax + replay */
  var mapbox = $('#mapbox'), mapEl = $('.map');
  if (fine && !reduce) { mapbox.addEventListener('pointermove', function (e) { var r = mapbox.getBoundingClientRect(); mapEl.style.transform = 'translate(' + (((e.clientX - r.left) / r.width - .5) * -14).toFixed(1) + 'px,' + (((e.clientY - r.top) / r.height - .5) * -10).toFixed(1) + 'px) scale(1.02)'; }); mapbox.addEventListener('pointerleave', function () { mapEl.style.transform = ''; }); }
  $('#replay').addEventListener('click', function () { mapbox.classList.remove('in'); void mapbox.offsetWidth; requestAnimationFrame(function () { mapbox.classList.add('in'); }); });

  /* dock: suggestions + typing placeholder */
  var sugg = $('#sugg'), suggList = $('#suggList'), SV = DATA.svc.map(function (s) { s.rx = new RegExp(s.re, 'i'); return s; });
  function renderSugg() {
    if (document.activeElement !== dockReq && !sugg.matches(':hover')) { sugg.hidden = true; return; }
    var q = dockReq.value.trim(), list = q ? SV.filter(function (s) { return s.rx.test(q) || s.n.toLowerCase().indexOf(q.toLowerCase()) > -1; }) : SV.slice(0, 6);
    if (!list.length) { sugg.hidden = true; return; }
    suggList.innerHTML = '';
    list.slice(0, 6).forEach(function (s) {
      var li = document.createElement('li'), b = document.createElement('button'), on = brief.indexOf(s.n) > -1;
      b.type = 'button'; b.setAttribute('aria-pressed', String(on)); b.textContent = (on ? '✓ ' : '+ ') + s.n;
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { var i = brief.indexOf(s.n); if (i > -1) brief.splice(i, 1); else brief.push(s.n); syncBrief(); });
      li.appendChild(b); suggList.appendChild(li);
    });
    sugg.hidden = false;
  }
  dockReq.addEventListener('focus', renderSugg); dockReq.addEventListener('input', renderSugg);
  dockReq.addEventListener('blur', function () { setTimeout(function () { if (document.activeElement !== dockReq) sugg.hidden = true; }, 160); });
  dockReq.addEventListener('keydown', function (e) { if (e.key === 'Escape') { sugg.hidden = true; dockReq.blur(); } });
  (function typer() {
    if (reduce) return; var base = 'Give your requirement...', i = 0, ph = 0, del = false;
    var words = SV.map(function (s) { return s.n; });
    function step() {
      if (document.activeElement === dockReq || dockReq.value) { dockReq.placeholder = base; setTimeout(step, 1500); return; }
      if (ph === 0) { dockReq.placeholder = base; ph = 1; i = 0; setTimeout(step, 2600); return; }
      var w = 'e.g. ' + words[(ph - 1) % words.length];
      if (!del) { i++; dockReq.placeholder = w.slice(0, i) + '|'; if (i >= w.length) { del = true; setTimeout(step, 1500); return; } setTimeout(step, 45); }
      else { i -= 2; if (i <= 5) { del = false; ph++; if (ph > 4) ph = 0; setTimeout(step, 200); return; } dockReq.placeholder = w.slice(0, i) + '|'; setTimeout(step, 22); }
    }
    setTimeout(step, 3500);
  })();

  /* quick search palette (Ctrl/Cmd K) */
  var pal = $('#pal'), palQ = $('#palQ'), palList = $('#palList'), palSel = 0, palItems = [], lastFocus;
  var SECT = [['About Us', '#about'], ['Our Services', '#services'], ['Responsive Design Showcase', '#responsive'], ['Mobile App Showcase', '#mobile'], ['Digital Marketing & Campaigns', '#marketing'], ['Global Partnerships', '#partners'], ['Contact Us', '#contact']];
  function palBuild() {
    var q = palQ.value.trim().toLowerCase(); palItems = [];
    SECT.forEach(function (s) { if (!q || s[0].toLowerCase().indexOf(q) > -1) palItems.push({ k: 'Go to', t: s[0], run: function () { pageTo(s[1]); } }); });
    SV.forEach(function (s) { if (!q || (s.n + ' ' + s.t).toLowerCase().indexOf(q) > -1 || s.rx.test(q)) { var on = brief.indexOf(s.n) > -1; palItems.push({ k: on ? 'Remove' : 'Add', t: s.n, keep: true, run: function () { var i = brief.indexOf(s.n); if (i > -1) brief.splice(i, 1); else brief.push(s.n); syncBrief(); } }); } });
    palSel = Math.min(palSel, Math.max(0, palItems.length - 1)); palRender();
  }
  function palRender() {
    palList.innerHTML = '';
    palItems.forEach(function (it, i) { var li = document.createElement('li'); li.setAttribute('role', 'option'); li.setAttribute('aria-selected', String(i === palSel)); li.innerHTML = '<span class="k"></span><span class="t"></span>'; li.firstChild.textContent = it.k; li.lastChild.textContent = it.t; li.addEventListener('click', function () { palSel = i; palRun(); }); li.addEventListener('pointermove', function () { if (palSel !== i) { palSel = i; $$('#palList li').forEach(function (x, k) { x.setAttribute('aria-selected', String(k === i)); }); } }); palList.appendChild(li); });
    var s = $('#palList [aria-selected="true"]'); if (s && s.scrollIntoView) s.scrollIntoView({ block: 'nearest' });
  }
  function palRun() { var it = palItems[palSel]; if (!it) return; if (!it.keep) palClose(); it.run(); if (it.keep) palBuild(); }
  function palOpen() { lastFocus = document.activeElement; pal.hidden = false; palQ.value = ''; palSel = 0; palBuild(); palQ.focus(); html.style.overflow = 'hidden'; }
  function palClose() { pal.hidden = true; html.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
  $('#kOpen').addEventListener('click', palOpen);
  pal.addEventListener('click', function (e) { if (e.target === pal) palClose(); });
  palQ.addEventListener('input', function () { palSel = 0; palBuild(); });
  palQ.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); palSel = (palSel + 1) % Math.max(1, palItems.length); palRender(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); palSel = (palSel + palItems.length - 1) % Math.max(1, palItems.length); palRender(); }
    if (e.key === 'Enter') { e.preventDefault(); palRun(); }
    if (e.key === 'Escape') palClose();
  });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? palOpen() : palClose(); }
    else if (e.key === '/' && !/input|textarea/i.test((document.activeElement || {}).tagName || '') && pal.hidden) { e.preventDefault(); palOpen(); }
  });

  /* ---------- service detail pages: #/services/<slug> ---------- */
  var svcPage = $('#svcPage'), GBS = window.GBServiceDetail, inDetail = false, mainY = 0, baseTitle = document.title;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function routeSlug() { var m = location.hash.match(/^#\/services\/([a-z0-9-]+)\/?$/); return m && GBS && GBS.has(m[1]) ? m[1] : null; }
  function revealNew(root) {
    $$('[data-r]:not(.in)', root).forEach(function (e) {
      if (io) io.observe(e); else if (loaded || !('IntersectionObserver' in window)) e.classList.add('in');
    });
  }
  function viewChanged() { document.dispatchEvent(new CustomEvent('gb:view', { detail: { service: inDetail } })); }
  function showDetail(slug) {
    if (!inDetail) mainY = window.scrollY;
    svcPage.innerHTML = GBS.render(slug); svcPage.setAttribute('data-slug', slug); svcPage.hidden = false;
    html.classList.add('sv'); inDetail = true; viewChanged();
    document.title = GBS.title(slug) + ' | Gentrobyte AI Labs';
    html.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); html.style.scrollBehavior = '';
    revealNew(svcPage); onScroll();
    var h = $('#sdTitle', svcPage); if (h && loaded) h.focus({ preventScroll: true });
  }
  function hideDetail() {
    if (!inDetail) return;
    inDetail = false; svcPage.hidden = true; svcPage.innerHTML = ''; svcPage.removeAttribute('data-slug');
    html.classList.remove('sv'); document.title = baseTitle; viewChanged(); onScroll();
  }
  function route(animate) {
    var slug = routeSlug();
    if (slug) {
      if (inDetail && svcPage.getAttribute('data-slug') === slug) return;
      if (animate) veil(GBS.title(slug), function () { showDetail(slug); }); else showDetail(slug);
      return;
    }
    if (!inDetail) {
      if (/^#\/services\//.test(location.hash)) { history.replaceState(null, '', location.pathname + location.search + '#services'); pageTo('#services'); }
      return;
    }
    /* history moved from a detail page to a normal hash: show the site again at that place */
    var id = decodeURIComponent(location.hash.slice(1)), t = id && document.getElementById(id), y = mainY;
    hideDetail(); html.style.scrollBehavior = 'auto';
    if (t) t.scrollIntoView(); else window.scrollTo(0, y);
    html.style.scrollBehavior = '';
  }
  window.addEventListener('hashchange', function () { route(true); });

  /* "Start Your Project": add the service to the brief, then go to the contact form */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-start]'); if (!b) return;
    var name = GBS && GBS.title(b.getAttribute('data-start'));
    if (name && brief.indexOf(name) < 0) { brief.push(name); syncBrief(); }
    if (inDetail) history.pushState(null, '', location.pathname + location.search + '#contact');
    pageTo('#contact', function () { setTimeout(function () { $('#fName').focus({ preventScroll: true }); }, 100); });
  });
  route(false); viewChanged();

  /* ---------- background network (2D, light) ---------- */
  (function () {
    var cv = $('#net'); if (!cv || reduce) return;
    var ctx = cv.getContext('2d'), W, H, dpr, pts = [], mx = -999, my = -999, run = true;
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 700 ? 34 : 64; pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22, h: i % 9 === 0 });
    }
    size(); window.addEventListener('resize', size);
    window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    var pulses = []; window.addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('a,button,input,textarea,label,.glass,.dock,.pal')) return; pulses.push({ x: e.clientX, y: e.clientY, r: 0 }); });
    document.addEventListener('visibilitychange', function () { run = !document.hidden; if (run) loop(); });
    function loop() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      var D = W < 700 ? 110 : 150, sv = (typeof vel === 'number') ? vel * .02 : 0;
      for (var k = pulses.length - 1; k >= 0; k--) { var pu = pulses[k]; pu.r += 9; ctx.strokeStyle = 'rgba(90,167,255,' + Math.max(0, .5 - pu.r / 600).toFixed(3) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.r, 0, 6.283); ctx.stroke(); if (pu.r > 320) pulses.splice(k, 1); }
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i]; p.x += p.vx; p.y += p.vy + sv; if (p.y > H) p.y = 0; if (p.y < 0) p.y = H;
        for (var k2 = 0; k2 < pulses.length; k2++) { var pp = pulses[k2], ddx = p.x - pp.x, ddy = p.y - pp.y, dd = Math.sqrt(ddx * ddx + ddy * ddy); if (Math.abs(dd - pp.r) < 14 && dd > 1) { p.x += ddx / dd * 3; p.y += ddy / dd * 3; } } if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < D) { ctx.strokeStyle = 'rgba(120,150,255,' + (0.22 * (1 - d / D)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        var dm = Math.hypot(p.x - mx, p.y - my);
        if (dm < 160) { ctx.strokeStyle = 'rgba(90,167,255,' + (0.4 * (1 - dm / 160)).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mx, my); ctx.stroke(); }
        ctx.fillStyle = p.h ? 'rgba(90,167,255,.9)' : 'rgba(191,227,255,.55)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.h ? 2.2 : 1.4, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  })();
})();
