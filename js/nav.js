'use strict';
/* TGO46 — header: sliding ink, dark/light tone, hide-on-scroll, mobile menu.
   Nav links are plain in-page anchors (smooth scroll comes from CSS).
   Exposes window.TGO_NAV = { refresh, snap }. Loaded after main.js. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const header = $('#header');
  const nav = $('#nav');
  const menuBtn = $('#menu-toggle');
  const TOP_FADE = 80;    /* px of scroll before the dark bar fully appears on the hero */
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const links = $$('.nav-link', nav);

  /* ---------- mobile menu ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  links.forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !nav.classList.contains('is-open')) return;
    setMenu(false);
    menuBtn.focus();
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- ink: one gold line that grows from the centre, glides between items,
     and on pointer exit shrinks toward the side the pointer left from ---------- */
  const ink = (() => {
    const BASE = 100; /* .nav-ink CSS width in px; scaleX = width / BASE */
    const line = document.createElement('span');
    line.className = 'nav-ink';
    line.setAttribute('aria-hidden', 'true');
    nav.append(line);
    let shownOn = null;
    let hovered = null;
    let current = null;
    const box = (a) => { const r = a.getBoundingClientRect(); return { x: r.left - nav.getBoundingClientRect().left, w: r.width }; };
    const put = (x, w) => { line.style.setProperty('--ink-x', `${x}px`); line.style.setProperty('--ink-s', (w / BASE).toFixed(4)); };
    const instant = (fn) => { line.classList.add('no-anim'); fn(); void line.offsetWidth; line.classList.remove('no-anim'); };
    function showOn(a) {
      const b = box(a);
      if (!shownOn) instant(() => put(b.x + b.w / 2, 0));
      put(b.x, b.w);
      shownOn = a;
    }
    function hideAt(x) { put(x, 0); shownOn = null; }
    function hideToCentre() { if (!shownOn) return; const b = box(shownOn); hideAt(b.x + b.w / 2); }
    links.forEach((a) => a.addEventListener('pointerenter', () => { hovered = a; showOn(a); }));
    nav.addEventListener('pointerleave', (e) => {
      const last = hovered;
      hovered = null;
      if (!last) return;
      if (current) { showOn(current); return; }
      const b = box(last);
      const exitX = e.clientX - nav.getBoundingClientRect().left;
      hideAt(Math.min(b.x + b.w, Math.max(b.x, exitX)));
    });
    return {
      setCurrent(a) {
        if (a === current) return;
        current = a;
        if (hovered) return;
        if (a) showOn(a); else hideToCentre();
      },
      snap() { if (shownOn) instant(() => { const b = box(shownOn); put(b.x, b.w); }); }
    };
  })();

  /* ---------- tone: dark gradient over dark zones, light gradient over light ones ---------- */
  const top = $('.hero') || $('.page-hero');
  const darkZones = [$('.hero'), $('.site-footer')].filter(Boolean);
  function darkSlice(h) {
    for (const zone of darkZones) {
      const r = zone.getBoundingClientRect();
      const t = Math.max(0, r.top);
      const b = Math.min(h, r.bottom);
      if (b > t) return [t, b];
    }
    return [0, 0];
  }
  function paint(y) {
    const h = header.offsetHeight;
    const [dTop, dBottom] = darkSlice(h);
    const none = dBottom <= dTop;
    const darkAtTop = dTop <= 0;
    const st = header.style;
    st.setProperty('--dark-top', `${dTop}px`);
    st.setProperty('--dark-bottom', `${dBottom}px`);
    st.setProperty('--light-top', `${none ? 0 : darkAtTop ? dBottom : 0}px`);
    st.setProperty('--light-bottom', `${none ? h : darkAtTop ? h : dTop}px`);
    st.setProperty('--dark-alpha', clamp01(y / TOP_FADE).toFixed(3));
    const mid = h / 2;
    header.classList.toggle('on-light', !(dTop <= mid && dBottom > mid));
    header.classList.toggle('is-solid', y > 2);
  }

  /* ---------- per-frame: tone, hide-on-scroll, current item ---------- */
  const sections = links.map((a) => document.getElementById(a.dataset.section)).filter(Boolean);
  let lastY = window.scrollY;
  let ticking = false;
  function frame() {
    ticking = false;
    const y = window.scrollY;
    const topH = top ? top.offsetHeight : 0;
    paint(y);
    const canHide = !nav.classList.contains('is-open') && !header.matches(':focus-within');
    if (canHide && y > topH && y > lastY + 4) header.classList.add('is-hidden');
    if (y < lastY - 4 || y <= topH) header.classList.remove('is-hidden');
    lastY = y;
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) current = links.find((a) => a.dataset.section === s.id); });
    links.forEach((a) => a.classList.toggle('is-current', a === current));
    ink.setCurrent(current);
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', () => { frame(); ink.snap(); });

  window.TGO_NAV = { refresh: frame, snap: () => requestAnimationFrame(() => ink.snap()) };
  frame();
})();
