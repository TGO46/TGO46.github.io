'use strict';
/* TGO46 — the approved wordmark, built up as a technical drawing. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.querySelector('.plate-svg');
  if (!svg) return;
  const plate = svg.closest('.plate');
  const replay = plate.querySelector('.plate-replay');

  const GLYPHS = window.TGO_GLYPHS;
  const WIDTH = 1816;
  const CAP = 333;
  const DIM_Y = 410;
  const TOTAL_Y = -78;

  const make = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  };

  /* vertical construction lines at every glyph edge */
  const verts = svg.querySelector('#c-verts');
  GLYPHS.forEach(([, a, b]) => {
    [a, b].forEach((x) => {
      verts.append(make('line', { class: 'c-v', x1: x, y1: -40, x2: x, y2: DIM_Y + 20, pathLength: 1 }));
    });
  });

  /* dimension lines: one per glyph + overall width */
  const dims = svg.querySelector('#dims');
  function dimension(x1, x2, y, label, cls) {
    const g = make('g', { class: cls });
    g.append(
      make('line', { x1, y1: y, x2, y2: y }),
      make('line', { x1, y1: y - 12, x2: x1, y2: y + 12 }),
      make('line', { x1: x2, y1: y - 12, x2, y2: y + 12 }),
      make('line', { x1: x1, y1: y, x2: x1 + 14, y2: y - 7 }),
      make('line', { x1: x1, y1: y, x2: x1 + 14, y2: y + 7 }),
      make('line', { x1: x2, y1: y, x2: x2 - 14, y2: y - 7 }),
      make('line', { x1: x2, y1: y, x2: x2 - 14, y2: y + 7 })
    );
    const t = make('text', { x: (x1 + x2) / 2, y: y + 40 });
    t.textContent = label;
    g.append(t);
    dims.append(g);
    return g;
  }
  const glyphDims = GLYPHS.map(([ch, a, b]) => dimension(a, b, DIM_Y, `${ch} · ${b - a}`, 'dim-g'));
  const total = dimension(0, WIDTH, TOTAL_Y, `${WIDTH} × ${CAP}`, 'dim-total');
  total.querySelector('text').setAttribute('y', TOTAL_Y - 16);

  /* probe: crosshair + coordinate readout following the pointer */
  const probe = svg.querySelector('#probe');
  const px = svg.querySelector('#probe-x');
  const py = svg.querySelector('#probe-y');
  const pt = svg.querySelector('#probe-t');
  let active = -1;

  function highlight(i) {
    if (i === active) return;
    active = i;
    glyphDims.forEach((g, k) => g.classList.toggle('is-on', k === i));
  }

  function toLocal(e) {
    const m = svg.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  function onMove(e) {
    if (e.pointerType === 'touch' || plate.hasAttribute('data-drawing')) return;
    const p = toLocal(e);
    if (!p) return;
    const x = Math.round(p.x);
    const y = Math.round(p.y);
    px.setAttribute('x1', x); px.setAttribute('x2', x);
    py.setAttribute('y1', y); py.setAttribute('y2', y);
    const flip = x > WIDTH - 260;
    pt.setAttribute('x', flip ? x - 16 : x + 16);
    pt.setAttribute('y', y - 14);
    pt.setAttribute('text-anchor', flip ? 'end' : 'start');
    pt.textContent = `X ${String(x).padStart(4, '0')}  Y ${String(CAP - y).padStart(4, '0')}`;
    probe.classList.add('is-on');
    highlight(GLYPHS.findIndex(([, a, b]) => x >= a && x <= b));
  }
  function onLeave() { probe.classList.remove('is-on'); highlight(-1); }

  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerleave', onLeave);

  const work = svg.querySelector('.draft-work');
  const caption = plate.querySelector('.draft-caption');
  const contours = document.querySelector('#wm path').getAttribute('d').match(/M[^M]+/g);
  if (!work || !contours?.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phases = [
    [0, '辅助线', 'Datums'], [1550, '标尺', 'Rulers'], [3500, '辅助图形', 'Geometry'],
    [6100, '辅助角度', 'Angles'], [8200, '连线', 'Contours'], [11500, '填色', 'Ink']
  ];
  const end = 14100;
  const clamp = n => Math.min(1, Math.max(0, n));
  const mix = (t, a, b) => clamp((t - a) / (b - a));
  const ease = p => p * p * (3 - 2 * p);
  const layer = (tag, attrs, parent) => {
    const n = make(tag, attrs);
    parent.append(n);
    return n;
  };
  const sheets = phases.map(() => layer('g', {}, work));
  const ops = [];
  function during(start, duration, update) {
    let last;
    ops.push(t => {
      const p = mix(t, start, start + duration);
      if (p !== last) update(p);
      last = p;
    });
  }
  function stroke(sheet, d, start, duration, cls = '') {
    const p = layer('path', { d, class: 'pen ' + cls, pathLength: 1, 'stroke-dasharray': '1 1' }, sheets[sheet]);
    during(start, duration, v => {
      p.style.visibility = v === 0 ? 'hidden' : 'visible';
      p.style.strokeDashoffset = 1 - ease(v);
    });
    return p;
  }
  function label(sheet, x, y, value, start, anchor = 'middle') {
    const el = layer('text', { x, y, class: 'reading', 'text-anchor': anchor }, sheets[sheet]);
    el.textContent = value;
    during(start, 180, p => { el.style.opacity = p; });
  }

  // Establish cap, baseline, center and the ten side bearings before measuring anything.
  stroke(0, 'M-110 0H1926', 0, 760);
  stroke(0, 'M1926 333H-110', 240, 760);
  stroke(0, 'M-110 166.5H1926', 580, 700, 'hair');
  GLYPHS.flatMap(([,a,b]) => [a,b]).forEach((x,i) => stroke(0, 'M'+x+' -40V430', 530+i*52, 465, 'hair'));
  label(0, -104, -10, 'CAP 333', 460, 'start');
  label(0, -104, 324, 'BASE 0', 850, 'start');

  // The scales travel across the same 1816 x 333 coordinate system as the paths.
  stroke(1, 'M0 -72H1816', 1550, 1020);
  for (let x=0; x<=1800; x+=25) {
    const size = x % 200 === 0 ? 24 : x % 100 === 0 ? 15 : 8;
    stroke(1, 'M'+x+' -72v'+size, 1570+x*.55, 140);
    if (x % 400 === 0) label(1, x, -86, String(x), 1630+x*.55);
  }
  label(1, WIDTH, -86, String(WIDTH), 2620);
  stroke(1, 'M-38 333V0', 1850, 710);
  for (let y=0;y<=325;y+=25) stroke(1, 'M-38 '+(333-y)+'h'+(y%100===0?18:9),1850+y*2,130);
  GLYPHS.forEach(([ch,a,b],i) => {
    stroke(1, `M${a} 398v24m0 -12H${b}m0 -12v24`, 2400+i*105, 410);
    label(1, (a+b)/2, 450, ch+' · '+(b-a), 2680+i*105);
  });

  // T's 74-unit stem and 66-unit crossbar; offset rectangles and tangent circles for the bowls.
  stroke(2, 'M0 0H334V66H0ZM130 66H204V333H130Z', 3500, 820);
  stroke(2, 'M364 66H714M364 267H714M438 0V333M640 0V333', 3650, 780, 'hair');
  stroke(2, 'M744 0H1094V333H744ZM818 66H1020V267H818Z', 3880, 1000);
  stroke(2, 'M1486 121H1816V333H1486ZM1560 187H1742V267H1560Z', 4270, 850, 'hair');
  label(2, 167, 388, '74', 4000);
  function compass(cx, cy, r, start, duration) {
    stroke(2, `M${cx-r} ${cy}a${r} ${r} 0 1 1 ${2*r} 0a${r} ${r} 0 1 1 ${-2*r} 0`, start, duration);
    stroke(2, `M${cx-9} ${cy}h18m-9 -9v18`, start, 120, 'hair');
    const arm = layer('line', {class:'tool',x1:cx,y1:cy,x2:cx-r,y2:cy}, sheets[2]);
    during(start, duration, v => {
      arm.style.opacity = v>0 && v<1 ? 1 : 0;
      arm.setAttribute('transform', `rotate(${360*ease(v)} ${cx} ${cy})`);
    });
  }
  compass(814,70,70,4170,1000);
  compass(838,86,20,4970,650);
  compass(434,263,70,4420,950);
  compass(1746,191,70,4670,960);
  stroke(2,'M814 70l-68 -68h-38',5060,400);
  label(2, 700, -5, 'R70', 5350, 'end');
  stroke(2,'M838 86l46 48h50',5360,320);
  label(2, 943, 142, 'R20', 5570, 'start');

  // Two parallel offsets set the 4; its angular witness shares the actual top vertex.
  stroke(3, 'M1064 250L1386 -72', 6100, 820);
  stroke(3, 'M1190 223L1375 38', 6340, 800, 'hair');
  stroke(3, 'M1124 190H1338V-25M1192 0H1314', 6450, 750, 'hair');
  stroke(3, 'M1224 0A90 90 0 0 0 1250.36 63.64', 6870, 620);
  label(3, 1176, 64, '45°', 7280);
  stroke(3,'M0 80V0H82M-20 46L48 -22M13 13L-28 -28H-90',6950,760);
  label(3, -88, -40, '26', 7540, 'start');

  // Trace the master artwork itself, counters included. The nib follows the active contour.
  const nib = layer('circle', {class:'nib',r:5}, work);
  const strokes = contours.map((d,i) => {
    const start = 8200 + i*300;
    const duration = 860;
    const path = stroke(4,d,start,duration,'trace');
    return {path,start,duration};
  });
  const defs = layer('defs', {}, svg);
  const clip = layer('clipPath', {id:'draft-fill',clipPathUnits:'userSpaceOnUse'}, defs);
  layer('use', {href:'#wm',width:WIDTH,height:CAP,'clip-path':'url(#draft-fill)',color:'var(--paper)'}, sheets[5]);
  GLYPHS.forEach(([,a,b], i) => {
    const rect = layer('rect', {x:a,y:CAP,width:b-a,height:0}, clip);
    during(11500+i*240, 1080, v => {
      const h = CAP * ease(v);
      rect.setAttribute('height', h);
      rect.setAttribute('y', CAP-h);
    });
  });

  const count = caption.querySelector('.draft-count');
  const name = caption.querySelector('.draft-name');
  let frame = 0, elapsed = 0, previous = null, phase = -1;
  let drawingWidth = svg.clientWidth;
  let running = false, inView = false, pending = !reduced.matches;
  function render(t) {
    const i = phases.findLastIndex(s => t >= s[0]);
    if (i !== phase) {
      phase = i;
      plate.dataset.step = String(i+1);
      count.textContent = '0'+(i+1)+' / 06';
    }
    const wording = phases[i][document.documentElement.lang === 'en' ? 2 : 1];
    if (name.textContent !== wording) name.textContent = wording;
    caption.style.setProperty('--progress', mix(t, phases[i][0], phases[i+1]?.[0] ?? end));
    ops.forEach(op => op(t));
    if (drawingWidth < 540) {
      // On a phone, inspect the O's tangencies, then follow the angle across to the 4.
      const focus = ease(mix(t,3500,4300)) * (1-ease(mix(t,7500,8200)));
      const scale = 1 + 1.15 * focus;
      const x = 860 + 395 * ease(mix(t,6000,6650));
      work.setAttribute('transform', `translate(${(908 - scale*x)*focus} ${166*(1-scale)}) scale(${scale})`);
    } else if (work.hasAttribute('transform')) work.removeAttribute('transform');
    sheets.slice(0,4).forEach((sheet,k) => {
      const next = phases[k+1][0];
      sheet.style.opacity = (1 - .66*mix(t,next,next+360)) * (1 - mix(t,11500,13100));
    });
    const nibStroke = strokes.findLast(s => t > s.start && t < s.start + s.duration);
    nib.style.opacity = nibStroke ? 1 : 0;
    if (nibStroke) {
      const {path,start,duration} = nibStroke;
      const p = path.getPointAtLength(path.getTotalLength()*ease(mix(t,start,start+duration)));
      nib.setAttribute('cx',p.x); nib.setAttribute('cy',p.y);
    }
    sheets[4].style.opacity = 1 - mix(t,12400,13600);
    plate.style.setProperty('--finished-lines', ease(mix(t,13000,14000)));
    plate.style.setProperty('--finished-ink', t>=13600 ? 1 : 0);
  }

  function syncControl() {
    const drawing = plate.hasAttribute('data-drawing');
    const en = document.documentElement.lang === 'en';
    const label = drawing ? (en ? 'Skip wordmark drawing' : '跳过字标绘制') : (en ? 'Replay wordmark construction' : '重播字标设计过程');
    replay.title = label;
    replay.setAttribute('aria-label', label);
    replay.hidden = false;
  }

  function finish() {
    cancelAnimationFrame(frame);
    running = pending = false;
    previous = null;
    plate.removeAttribute('data-drawing');
    plate.removeAttribute('data-step');
    caption.hidden = true;
    syncControl();
  }

  function tick(now) {
    frame = 0;
    if (!running || !inView || document.hidden) return;
    if (previous !== null) elapsed += now - previous;
    previous = now;
    if (elapsed >= end) { finish(); return; }
    render(elapsed);
    frame = requestAnimationFrame(tick);
  }
  function wake() {
    cancelAnimationFrame(frame);
    previous = null;
    if (pending && inView && !document.hidden) { play(); return; }
    if (running && inView && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function play() {
    pending = false;
    running = true;
    previous = null; elapsed = 0;
    onLeave();
    plate.setAttribute('data-drawing', '');
    caption.hidden = false;
    render(0);
    syncControl();
    wake();
  }
  replay.addEventListener('click', () => running ? finish() : play());
  reduced.addEventListener('change', () => { if (reduced.matches) finish(); });
  new MutationObserver(syncControl).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  const calibrate = () => {
    drawingWidth = svg.clientWidth || 864;
    svg.style.setProperty('--pen', 2036 / drawingWidth);
  };
  calibrate();
  if ('ResizeObserver' in window) new ResizeObserver(calibrate).observe(svg);
  document.addEventListener('visibilitychange', wake);
  syncControl();
  if (pending) plate.setAttribute('data-drawing', '');
  plate.classList.remove('draft-pending');
  if ('IntersectionObserver' in window) {
    const entrance = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= .25;
      wake();
    }, { threshold: .25 });
    entrance.observe(plate);
  } else {
    inView = true; wake();
  }
})();
