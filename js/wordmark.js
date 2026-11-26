/*
Derived from React Bits TechText (Vector preset), Copyright (c) 2026 David Haz.
Source: https://github.com/DavidHDev/react-bits/blob/37f53df7efb61238b0fea9ea8be74e3cce62b959/src/content/TextAnimations/TechText/TechText.jsx
Adaptation: native canvas lifecycle and the original TGO46 SVG path sprites.

MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

The same restriction covers the React Bits tools (Background Studio, Texture Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the sounds in the sound library. **You may not sell, sublicense, or redistribute the tools or the sounds themselves, or offer the tools or a substantially similar copy of them as a hosted service-whether alone, in a bundle, or as a ported version.**

What you make with the tools is yours to use. You can use exported code, images, videos, and audio files in any personal or commercial application, website, or product, including paid ones. **You may not sell or redistribute the exports on their own, either individually or as the product itself, such as a sound, texture, background, or template pack.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
'use strict';
window.TGO_GLYPHS = [['T', 0, 334], ['G', 364, 714], ['O', 744, 1094], ['4', 1124, 1456], ['6', 1486, 1816]];

(() => {
  const art = document.querySelector('.foot-art');
  if (!art) return;
  const stage = art.parentElement;
  const scene = stage.querySelector('.foot-tech');
  const settingsRef = { current: { text: 'TGO46', color: 'currentColor', accentColor: 'var(--gold)',
    reveal: 'letter', reach: 200, softness: .7, lineStyle: 'dashed', dashLength: 4, dashGap: 2,
    strokeWidth: 1.5, specks: 15, speed: 1, bounce: .4, selection: true, labels: true,
    draggable: true, clickKick: true, sweep: true } };
  const wakeRef = { current: () => {} };
  let keyboard = -1, touchActive = false, touchTimer;
const LABEL_FONT = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const FALLOFF_STEPS = 8;
const SPRING = 320;
const INHERIT = /^(currentcolor|inherit)$/i;
const INTRO_DELAY = 0.15;
const KICK_DECAY = 0.62;

const approach = (current, target, dt, seconds) => current + (target - current) * (1 - Math.exp(-dt / seconds));

const clamp01 = value => Math.min(1, Math.max(0, Number(value) || 0));

const smoothstep = (edge0, edge1, value) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const noise = (...values) => {
  let h = 2166136261;
  for (const value of values) {
    h = Math.imul(h ^ (value | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
};

const signed = value => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0');

    const container = scene;
    const canvas = scene.querySelector("canvas");
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = false;
    let alive = true;
    let layoutKey = '';
    let sizeDirty = true;
    let word = null;
    let glyphs = [];
    let clock = 0;
    let pulse = 0;
    let placed = false;
    let dragging = -1;
    let dragPointerId = null;
    const kicks = [];
    const press = { x: 0, y: 0, time: 0, index: -1, pointerId: null };
    const pointer = { x: 0, y: 0, inside: false, kind: null };
    const grab = { x: 0, y: 0 };
    const lens = { x: 0, y: 0 };
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const invalidateLayout = () => {
      layoutKey = '';
      wakeRef.current();
    };

    const palette = s => {
      const current = getComputedStyle(container).color || '#000000';
      const pick = value => (!value || INHERIT.test(String(value).trim()) ? current : value);
      return { ink: pick(s.color), accent: getComputedStyle(container).getPropertyValue('--gold').trim() || '#d7b375' };
    };

    const profile = new Path2D(art.querySelector('#foot-profile').getAttribute('d'));
    const sprite = (s, view, glyph, stroke, ink) => {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = glyph.box.x1 - pad, top = glyph.box.y1 - pad;
      const image = document.createElement('canvas');
      image.width = Math.max(1, Math.ceil((glyph.box.x2 - glyph.box.x1 + pad * 2) * dpr));
      image.height = Math.max(1, Math.ceil((glyph.box.y2 - glyph.box.y1 + pad * 2) * dpr));
      const c = image.getContext('2d');
      c.setTransform(dpr * view.scale, 0, 0, dpr * view.scale,
        (view.left - left) * dpr, (view.top - top) * dpr);
      if (stroke) {
        c.lineJoin = 'round';
        c.lineWidth = s.strokeWidth * 2 / view.scale;
        c.lineCap = 'butt';
        c.strokeStyle = ink;
        c.setLineDash([s.dashLength / view.scale, s.dashGap / view.scale]);
        c.stroke(profile);
        c.setLineDash([]);
        c.globalCompositeOperation = 'destination-out';
        c.fill(profile, 'evenodd');
      } else {
        c.fillStyle = ink;
        c.fill(profile, 'evenodd');
      }
      return { image, left, top };
    };
    const ensureLayout = (s, ink, accent) => {
      const key = [width, height, dpr, ink, accent].join('|');
      if (key === layoutKey && word) return word;
      layoutKey = key;
      const left = parseFloat(scene.style.getPropertyValue('--pad-x'));
      const top = parseFloat(scene.style.getPropertyValue('--pad-y'));
      const scale = (width - left * 2) / 1816;
      const next = { scale, left, right: width - left, top, bottom: top + 333 * scale,
        size: Math.min(150, 333 * scale) };
      const previous = glyphs;
      word = next;
      glyphs = window.TGO_GLYPHS.map(([char, a, b], index) => {
        const base = { char, index, x: left + a * scale,
          box: { x1: left + a * scale, y1: top, x2: left + b * scale, y2: next.bottom } };
        return { ...base, offset: previous[index]?.offset || { x: 0, y: 0 },
          velocity: previous[index]?.velocity || { x: 0, y: 0 },
          outline: previous[index]?.outline || 0, shown: 1,
          fill: sprite(s, next, base, false, ink), dashes: sprite(s, next, base, true, accent) };
      });
      return next;
    };

    const glyphAt = (x, y) => {
      if (!word || y < word.top - 24 || y > word.bottom + 24) return -1;
      let best = -1;
      let bestDistance = Infinity;
      glyphs.forEach((glyph, i) => {
        const x1 = glyph.box.x1 + glyph.offset.x;
        const x2 = glyph.box.x2 + glyph.offset.x;
        const d = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < 28 ? best : -1;
    };

    const blit = (target, art, dx, dy, originX, originY) => {
      target.drawImage(
        art.image,
        Math.round((art.left + dx) * dpr - originX),
        Math.round((art.top + dy) * dpr - originY)
      );
    };

    const crisp = value => (Math.round(value * dpr) + 0.5) / dpr;

    const perimeterPoint = (distance, w, h) => {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    };

    const drawSpecks = (s, a, accent) => {
      const w = frame.x2 - frame.x1;
      const h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = frame.index + 1;
      const grid = 3;
      ctx.fillStyle = accent;
      ctx.strokeStyle = accent;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = frame.x1 + Math.round((px + nx * out - frame.x1) / grid) * grid;
        const y = frame.y1 + Math.round((py + ny * out - frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        ctx.globalAlpha = alpha;
        if (tone < 0.26 || (large && tone < 0.78)) {
          ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
        } else {
          ctx.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          ctx.globalAlpha = a * [0.95, 0.55, 0.32, 0.16][i];
          ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const drawFrame = (s, accent) => {
      const glyph = glyphs[frame.index];
      if (!glyph || frame.alpha < 0.01) return;
      const a = frame.alpha;
      const x1 = crisp(frame.x1);
      const y1 = crisp(frame.y1);
      const x2 = crisp(frame.x2);
      const y2 = crisp(frame.y2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = accent;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;

      const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (moved > 1) {
        const hx = (glyph.box.x1 + glyph.box.x2) / 2;
        const hy = (glyph.box.y1 + glyph.box.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        ctx.setLineDash([3, 4]);
        ctx.globalAlpha = 0.45 * a;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        ctx.globalAlpha = 0.7 * a;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.globalAlpha = 0.5 * a;
      ctx.stroke();

      ctx.beginPath();
      for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2]
      ]) {
        ctx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      ctx.globalAlpha = 0.95 * a;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (s.specks > 0 && !reducedMotion) drawSpecks(s, a, accent);

      if (!s.labels) return;
      ctx.font = LABEL_FONT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.62 * a;
      const label =
        moved > 1
          ? `${signed(Math.round(glyph.offset.x))}, ${signed(Math.round(-glyph.offset.y))}`
          : `${glyph.char}  ${Math.round(glyph.box.x2 - glyph.box.x1)} × ${Math.round(glyph.box.y2 - glyph.box.y1)}`;
      const labelX = Math.max(1, Math.min(Math.round(frame.x1), width - ctx.measureText(label).width - 1));
      ctx.fillText(label, labelX, Math.round(frame.y1) - 7);
      ctx.globalAlpha = 1;
    };

    // Preserve TGO's engraved material and pointer crosshair over the Vector reveal.
    const drawInspection = (view, glyph, accent) => {
      const alpha = glyph.outline;
      if (alpha < .003) return;
      const { x: dx, y: dy } = glyph.offset;
      const x1 = glyph.box.x1 + dx, y1 = glyph.box.y1 + dy;
      const x2 = glyph.box.x2 + dx, y2 = glyph.box.y2 + dy;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.clip();
      ctx.translate(view.left + dx, view.top + dy);
      ctx.scale(view.scale, view.scale);
      ctx.clip(profile, 'evenodd');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#151617';
      ctx.globalAlpha = alpha;
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeStyle = accent;
      ctx.lineWidth = .7;
      ctx.globalAlpha = alpha * .28;
      ctx.beginPath();
      const span = y2 - y1;
      for (let x = x1 - span; x < x2; x += 8) {
        ctx.moveTo(x, y2);
        ctx.lineTo(x + span, y1);
      }
      ctx.stroke();
      ctx.restore();
    };

    const drawCrosshair = (view, focus, accent) => {
      // Idle sweep and keyboard/touch selection retain the engraving, without a crosshair.
      const glyph = glyphs[focus];
      if (!glyph || !pointer.inside || !['mouse', 'pen'].includes(pointer.kind) || keyboard >= 0 || frame.alpha < .01) return;
      const { x: dx, y: dy } = glyph.offset;
      const x1 = glyph.box.x1 + dx, y1 = glyph.box.y1 + dy;
      const x2 = glyph.box.x2 + dx, y2 = glyph.box.y2 + dy;
      const px = crisp(Math.max(x1, Math.min(x2, lens.x)));
      const py = crisp(Math.max(y1, Math.min(y2, lens.y)));
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.clip();
      ctx.translate(view.left + dx, view.top + dy);
      ctx.scale(view.scale, view.scale);
      ctx.clip(profile, 'evenodd');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = frame.alpha * .72;
      ctx.strokeStyle = accent;
      ctx.lineWidth = .8;
      ctx.beginPath();
      ctx.moveTo(px, y1); ctx.lineTo(px, y2);
      ctx.moveTo(x1, py); ctx.lineTo(x2, py);
      ctx.stroke();
      ctx.restore();
    };

    const kick = index => {
      const strength = (word ? word.size : 120) * 11;
      kicks.push({ index, at: pulse, velocity: strength });
      for (let d = 1; d < glyphs.length; d++) {
        const velocity = strength * Math.pow(KICK_DECAY, d);
        if (velocity < 30) break;
        for (const j of [index - d, index + d]) {
          if (j >= 0 && j < glyphs.length) kicks.push({ index: j, at: pulse + d * 0.055, velocity });
        }
      }
      wakeRef.current();
    };

    const tick = now => {
      raf = 0;
      const s = settingsRef.current;
      reducedMotion = motionQuery.matches || !!art.closest('.motion-paused');
      if (sizeDirty) {
        sizeDirty = false;
        width = Math.max(1, container.getBoundingClientRect().width);
        height = Math.max(1, container.getBoundingClientRect().height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        const pixelWidth = Math.round(width * dpr);
        const pixelHeight = Math.round(height * dpr);
        if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
        if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const { ink, accent } = palette(s);
      const view = ensureLayout(s, ink, accent);
      const damping = 2 * Math.sqrt(SPRING) * (1 - clamp01(s.bounce) * 0.96);

      const sweeping = keyboard < 0 && !touchActive && s.sweep && !reducedMotion && !pointer.inside && dragging < 0;
      if (sweeping) clock += dt * s.speed;
      pulse += dt;
      let targetX = pointer.x;
      let targetY = pointer.y;
      if (sweeping) {
        targetX = view.left + (view.right - view.left) * (0.5 - 0.5 * Math.cos(clock * 0.45));
        targetY = view.top + (view.bottom - view.top) * (0.45 + 0.1 * Math.sin(clock * 0.8));
      }
      const active = pointer.inside || sweeping || dragging >= 0;
      if (active && (!placed || reducedMotion)) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        const lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;
      for (let k = kicks.length - 1; k >= 0; k--) {
        if (kicks[k].at > pulse) continue;
        const glyph = glyphs[kicks[k].index];
        if (glyph) glyph.velocity.y -= kicks[k].velocity;
        kicks.splice(k, 1);
      }

      let moving = false;
      glyphs.forEach((glyph, i) => {
        if (reducedMotion) { glyph.offset.x = 0; glyph.offset.y = 0; glyph.velocity.x = 0; glyph.velocity.y = 0; return; }
        if (i === dragging) {
          glyph.offset.x = approach(glyph.offset.x, pointer.x - grab.x, dt, 0.03);
          glyph.offset.y = approach(glyph.offset.y, pointer.y - grab.y, dt, 0.03);
          glyph.velocity.x = 0;
          glyph.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity } = glyph;
        if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = 0;
          offset.y = 0;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * offset.x - damping * velocity.x) * dt;
        velocity.y += (-SPRING * offset.y - damping * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      const focus = keyboard >= 0 ? keyboard : dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
      if (focus >= 0 && s.selection) {
        const glyph = glyphs[focus];
        const bx1 = glyph.box.x1 + glyph.offset.x - 6;
        const by1 = glyph.box.y1 + glyph.offset.y - 6;
        const bx2 = glyph.box.x2 + glyph.offset.x + 6;
        const by2 = glyph.box.y2 + glyph.offset.y + 6;
        if (reducedMotion || frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1;
          frame.y1 = by1;
          frame.x2 = bx2;
          frame.y2 = by2;
        }
        const glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = reducedMotion ? (focus >= 0 ? 1 : 0) : approach(frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, 0.1);

      glyphs.forEach((glyph, i) => {
        const target = i === focus && i !== dragging ? 1 : 0;
        glyph.outline = reducedMotion ? target : approach(glyph.outline, target, dt, 0.09);
        if (Math.abs(glyph.outline - target) > 0.002) moving = true;
        else glyph.outline = target;
      });

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved > 1) {
          ctx.globalAlpha = Math.min(1, moved / 24) * 0.55;
          blit(ctx, glyph.dashes, 0, 0, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
      glyphs.forEach(glyph => {
        if (glyph.shown < 0.001) return;
        if (glyph.outline < 0.999) {
          ctx.globalAlpha = (1 - glyph.outline) * glyph.shown;
          blit(ctx, glyph.fill, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        if (glyph.outline > 0.001) {
          ctx.globalAlpha = glyph.outline * glyph.shown;
          blit(ctx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        ctx.globalAlpha = 1;
      });
      glyphs.forEach(glyph => drawInspection(view, glyph, accent));
      drawCrosshair(view, focus, accent);
      drawFrame(s, accent);

      scene.dataset.active = focus >= 0 ? glyphs[focus].char : '';
      scene.dataset.dragging = dragging >= 0 ? glyphs[dragging].char : '';
      if (keyboard >= 0) art.setAttribute('aria-label', 'TGO46 · ' + glyphs[keyboard].char + ' 已选中，左右键切换，回车弹起，Escape 退出');
      const settling = moving || kicks.length > 0 || (frame.alpha > 0.01 && frame.alpha < 0.99);
      if (!reducedMotion && (active || settling) && visible && alive) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const resize = () => {
      const r = art.getBoundingClientRect();
      scene.style.setProperty('--pad-x', Math.min(32, r.width * .035) + 'px');
      scene.style.setProperty('--pad-y', '80px');
      sizeDirty = true;
      wake();
    };

    const locate = e => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const insideStage = e => {
      const r = stage.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };
    const releaseDrag = () => {
      const id = dragPointerId;
      // Clear ownership first: releasing capture can synchronously fire lostpointercapture.
      dragging = -1;
      dragPointerId = null;
      stage.classList.remove('is-dragging');
      if (id !== null && stage.hasPointerCapture?.(id)) stage.releasePointerCapture(id);
      wake();
    };
    const cancelInteraction = () => {
      press.index = -1;
      press.pointerId = null;
      pointer.inside = false;
      clearTimeout(touchTimer);
      releaseDrag();
    };
    const onMove = e => {
      if (e.pointerType === 'touch' || (dragPointerId !== null && e.pointerId !== dragPointerId)) return;
      keyboard = -1; touchActive = false;
      locate(e);
      pointer.kind = e.pointerType || 'mouse';
      pointer.inside = insideStage(e);
      if (dragging >= 0 && e.pointerType === 'mouse' && !(e.buttons & 1)) {
        cancelInteraction();
      }
      wake();
    };
    const onLeave = e => {
      if (e.pointerType === 'touch') return;
      // Captured drags can leave the stage; release/cancel owns the spring return.
      pointer.inside = false;
      wake();
    };
    const onDown = e => {
      if ((e.pointerType === 'mouse' && e.button !== 0) || (dragPointerId !== null && e.pointerId !== dragPointerId)) return;
      keyboard = -1; touchActive = e.pointerType === 'touch';
      clearTimeout(touchTimer);
      art.classList.add('by-pointer');
      locate(e);
      pointer.kind = e.pointerType || 'mouse';
      pointer.inside = insideStage(e);
      const s = settingsRef.current;
      const index = pointer.inside ? glyphAt(pointer.x, pointer.y) : -1;
      press.x = pointer.x;
      press.y = pointer.y;
      press.time = performance.now();
      press.index = index;
      press.pointerId = e.pointerId;
      if (s?.draggable && index >= 0 && e.pointerType !== 'touch' && !reducedMotion) {
        dragging = index;
        dragPointerId = e.pointerId;
        stage.classList.add('is-dragging');
        grab.x = pointer.x - glyphs[index].offset.x;
        grab.y = pointer.y - glyphs[index].offset.y;
        stage.setPointerCapture?.(e.pointerId);
      }
      wake();
    };
    const onUp = e => {
      if (e.pointerId !== press.pointerId && e.pointerId !== dragPointerId) return;
      locate(e);
      pointer.inside = e.type === 'pointerup' && insideStage(e);
      releaseDrag();
      if (
        e.type === 'pointerup' && pointer.inside &&
        press.index >= 0 && settingsRef.current?.clickKick && !reducedMotion &&
        performance.now() - press.time < 450 &&
        Math.hypot(pointer.x - press.x, pointer.y - press.y) < 6
      ) kick(press.index);
      press.index = -1;
      press.pointerId = null;
      if (e.pointerType === 'touch') {
        touchTimer = setTimeout(() => { pointer.inside = false; wake(); }, 1600);
      }
      wake();
    };
    const onLostCapture = e => {
      if (e.pointerId === dragPointerId) cancelInteraction();
    };

    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerenter', onMove, { passive: true });
    stage.addEventListener('pointerdown', onDown, { passive: true });
    stage.addEventListener('pointerleave', onLeave, { passive: true });
    stage.addEventListener('lostpointercapture', onLostCapture);
    // Releases may land outside the stage after browser/OS capture interruptions.
    window.addEventListener('pointerup', onUp, { passive: true, capture: true });
    window.addEventListener('pointercancel', onUp, { passive: true, capture: true });
    window.addEventListener('blur', cancelInteraction);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelInteraction(); else wake(); });
    canvas.addEventListener('contextrestored', invalidateLayout);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(art);
    window.addEventListener('resize', resize, { passive: true });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) { cancelInteraction(); cancelAnimationFrame(raf); raf = 0; }
      else wake();
    });
    intersectionObserver.observe(art);
    const themeObserver = new MutationObserver(wake);
    for (const node of [document.documentElement, document.body]) {
      if (node) themeObserver.observe(node, { attributes: true, attributeFilter: ['class', 'style', 'data-theme'] });
    }
    const schemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    schemeQuery?.addEventListener?.('change', wake);



    function selectKeyboard(index) {
      if (!glyphs.length) { wake(); return; }
      keyboard = (index + glyphs.length) % glyphs.length;
      touchActive = false;
      pointer.kind = 'keyboard';
      const g = glyphs[keyboard];
      pointer.x = (g.box.x1 + g.box.x2) / 2;
      pointer.y = (g.box.y1 + g.box.y2) / 2;
      pointer.inside = true;
      wake();
    }
    art.setAttribute('tabindex', '0');
    art.addEventListener('focus', () => { if (!art.classList.contains('by-pointer') && art.matches(':focus-visible')) selectKeyboard(0); });
    art.addEventListener('blur', () => { keyboard = -1; pointer.inside = false; art.classList.remove('by-pointer'); art.setAttribute('aria-label', 'TGO46'); wake(); });
    art.addEventListener('keydown', e => {
      art.classList.remove('by-pointer');
      if (e.key === 'Escape') { keyboard = -1; touchActive = true; pointer.inside = false; art.setAttribute('aria-label', 'TGO46'); wake(); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        selectKeyboard(keyboard < 0 ? (e.key === 'ArrowRight' ? 0 : glyphs.length - 1) : keyboard + (e.key === 'ArrowRight' ? 1 : -1));
      } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (keyboard < 0) selectKeyboard(0); if (!reducedMotion) kick(keyboard); }
    });
    motionQuery.addEventListener('change', () => { kicks.length = 0; wake(); });

    resize();
    stage.classList.add('is-ready');


})();
