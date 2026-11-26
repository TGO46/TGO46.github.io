'use strict';
/* TGO46 — render content, language, motion. Header behaviour lives in nav.js. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const LANG_KEY = 'tgo46-language';
  const EN = window.TGO_EN || {};
  const TYPE = window.TGO_TYPE || {};
  const MEMBERS = window.TGO_MEMBERS || [];
  const CHARTER = window.TGO_CHARTER || [];
  const EVENTS = [...(window.TGO_EVENTS || [])].sort((a, b) => b.date.localeCompare(a.date));
  const RECORDED = EVENTS.filter((ev) => !ev.scheduled);
  const PROJECTS = window.TGO_PROJECTS || [];
  const ZH_TITLE = document.title;
  const TITLE_EN = document.body.dataset.page === 'journey' ? 'Journey · TGO46' : 'TGO46 · In great company, we build the extraordinary';
  const ZH = {};
  $$('[data-i]').forEach((n) => { if (!(n.dataset.i in ZH)) ZH[n.dataset.i] = n.innerHTML; });

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable: preference not persisted */ } }
  };
  const isEn = () => root.lang === 'en';
  const pick = (zh, en) => (isEn() && en ? en : zh);
  const pad = (n) => String(n).padStart(2, '0');

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- reveal ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    : null;
  const observe = (nodes) => nodes.forEach((n) => (io ? io.observe(n) : n.classList.add('is-in')));
  if (io) root.classList.add('js-motion');

  /* ---------- 01 roster ---------- */
  function renderRoster() {
    const box = $('#roster');
    if (!box) return;
    const items = MEMBERS.map((m, i) => {
      const li = el('li', `member reveal${i === 0 ? ' is-lead' : ''}`);
      li.style.setProperty('--d', `${(i % 4) * 60}ms`);
      const seat = el('div', 'seat');
      seat.append(el('span', '', `46·${pad(i + 1)}`), el('span', '', i === 0 ? 'LEAD' : ''));
      const glyph = el('span', 'glyph', m.name.slice(-1));
      glyph.setAttribute('aria-hidden', 'true');
      if (m.avatar) {
        const base = `assets/avatars/${m.avatar}`;
        const pic = document.createElement('picture');
        const src = document.createElement('source');
        src.type = 'image/webp';
        src.srcset = `${base}-128.webp 1x, ${base}-256.webp 2x`;
        const img = document.createElement('img');
        img.src = `${base}-128.jpg`;
        img.srcset = `${base}-256.jpg 2x`;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 128; img.height = 128;
        /* broken file: keep the character fallback */
        img.addEventListener('error', () => { pic.remove(); glyph.classList.remove('has-photo'); });
        pic.append(src, img);
        glyph.classList.add('has-photo');
        glyph.append(pic);
      }
      const id = el('div');
      const name = el('p', 'name', pick(m.name, m.en));
      id.append(name, el('p', 'role', pick(m.role, m.roleEn)));
      if (m.org) id.append(el('p', 'org', pick(m.org, m.orgEn || m.org)));
      li.append(seat, glyph, id);
      return li;
    });
    box.replaceChildren(...items);
    observe(items);
  }

  /* ---------- 02 charter ---------- */
  function renderCharter() {
    const box = $('#charter-rows');
    if (!box) return;
    const rows = CHARTER.map((c, i) => {
      const r = el('div', 'spec-row');
      r.setAttribute('role', 'row');
      const cells = [el('span', 'art', pad(i + 1)), el('span', 'k', pick(c.k, c.kEn)), el('span', `v${c.mono ? ' is-mono' : ''}`, pick(c.v, c.vEn))];
      cells.forEach((cell) => { cell.setAttribute('role', 'cell'); r.append(cell); });
      return r;
    });
    box.replaceChildren(...rows);
  }

  /* ---------- 03 journey ---------- */
  let filter = 'all';
  const openSet = new Set(EVENTS.filter((e) => e.previewOpen).map((e) => e.date));

  function picture(p, i, list) {
    const b = el('button', 'ev-thumb');
    b.type = 'button';
    b.dataset.n = pad(i + 1);
    b.setAttribute('aria-label', `${pick('查看照片', 'View photo')} ${i + 1}: ${pick(p.alt, p.altEn)}`);
    const pic = document.createElement('picture');
    const src = document.createElement('source');
    src.type = 'image/webp';
    src.srcset = `${p.base}-1000.webp`;
    const img = el('img');
    img.src = `${p.base}-1000.jpg`;
    if (p.tone) img.style.filter = `url(#tone-${p.tone})`;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    pic.append(src, img);
    b.append(pic);
    b.addEventListener('click', () => window.TGO_TOOLS && window.TGO_TOOLS.lightbox(list, i));
    return b;
  }

  const filmStops = new WeakMap();
  function stopFilms(box) {
    $$('.ev-video', box).forEach((node) => filmStops.get(node)?.());
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopFilms(document); });

  function filmTile(film, place) {
    const tile = el('div', 'ev-video');
    const video = el('video');
    const title = pick(film.title, film.titleEn);
    Object.assign(video, { playsInline: true, preload: 'none' });
    video.setAttribute('aria-label', title);
    const cover = el('button', 'film-cover');
    cover.type = 'button';
    cover.setAttribute('aria-label', pick('播放：', 'Play: ') + title);
    const art = el('img', 'film-landscape');
    Object.assign(art, { src: film.poster, alt: '', loading: 'lazy', width: film.posterWidth, height: film.posterHeight });
    const imprint = el('span', 'film-imprint');
    imprint.innerHTML = '<svg viewBox="0 0 1816 333" aria-hidden="true"><use href="#wm"/></svg>';
    imprint.append(el('span', 'film-route', place));
    const headline = el('strong', 'film-headline', title);
    const play = el('span', 'film-play');
    play.setAttribute('aria-hidden', 'true');
    play.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M4.4 5.9a2.5 2.5 0 0 1 3.75-2.165L26.31 13.835a2.5 2.5 0 0 1 0 4.33L8.15 28.265A2.5 2.5 0 0 1 4.4 26.1Z"/></svg>';
    cover.append(art, imprint, headline, play);
    tile.append(video, cover);

    let active = false, attempt = 0;
    function reset() {
      if (!active) return;
      ++attempt;
      active = false;
      video.pause();
      if (video.readyState) video.currentTime = 0;
      video.controls = false;
      cover.hidden = false;
    }
    cover.addEventListener('click', () => {
      if (active) return;
      active = true;
      const id = ++attempt;
      if (!video.hasAttribute('src')) video.src = film.src;
      video.play().then(() => {
        if (id !== attempt) return;
        video.controls = true;
        cover.hidden = true;
        video.focus({ preventScroll: true });
      }).catch(() => { if (id === attempt) reset(); });
    });
    video.addEventListener('ended', reset);
    filmStops.set(tile, reset);
    return tile;
  }

  function eventItem(ev, idx) {
    const li = el('li', 'event');
    li.dataset.type = ev.type;
    const pid = `ev-${idx}`;
    const talks = ev.talks || [];
    const expandable = talks.length || ev.photos.length || ev.video || ev.poster;
    const head = el(expandable ? 'button' : 'div', 'ev-head');
    if (ev.scheduled) li.dataset.scheduled = 'true';
    const t = TYPE[ev.type] || ['', ''];
    const main = el('span', 'ev-main');
    const place = pick(ev.place, ev.placeEn);
    const participants = pick(ev.participants, ev.participantsEn);
    const title = pick(ev.title, ev.titleEn);
    const category = pick(t[0], t[1]);
    const meta = pick(ev.subtitle, ev.subtitleEn) || [ev.time || ev.label, place].filter(Boolean).join(' · ');
    const summary = pick(ev.summary, ev.summaryEn);
    main.append(el('span', 'ev-title', title));
    main.append(el('span', 'ev-meta', meta));
    const inner = el('div', 'ev-inner');
    if (participants) inner.append(el('p', 'ev-meta', pick('参与人：', 'Participants: ') + participants));
    if (ev.attendance) {
      const a = ev.attendance;
      const details = el('span', 'ev-meta ev-attendance');
      for (const [count, zh, en, names] of [
        [a.members, '小组成员', 'Members'], [a.onsite, '现场', 'In person'],
        [a.online, '线上', 'Online', a.onlineNames], [a.leave, '请假', 'On leave', a.leaveNames]
      ]) {
        if (count == null) continue;
        const who = (names || []).map(([cn, eng]) => pick(cn, eng)).join(pick('、', ', '));
        details.append(el('span', '', pick(`${zh} ${count} 人`, `${en}: ${count}`) + (who ? pick(`（${who}）`, ` (${who})`) : '')));
      }
      inner.append(details);
    }
    if (summary) inner.append(el('p', 'ev-summary', summary));
    const date = el('time', 'ev-date', ev.label);
    date.dateTime = ev.date;
    const dateCell = el('span');
    dateCell.append(date);
    if (ev.scheduled) dateCell.append(el('span', 'ev-planned', pick('预告', 'Upcoming')));
    head.append(dateCell, el('span', 'ev-type', category), main);
    li.append(head);
    if (!expandable) {
      if (inner.childElementCount) {
        li.classList.add('has-notes');
        li.append(inner);
      }
      return li;
    }
    head.type = 'button';
    head.setAttribute('aria-controls', pid);
    const icon = el('span', 'ev-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.append(el('i'));
    head.append(icon);

    const panel = el('div', 'ev-panel');
    panel.id = pid;
    const wrap = el('div');
    if (talks.length) {
      inner.append(el('p', 'ev-meta', pick('分享主题', 'Talk topics')));
      const list = el('ul', 'ev-talks');
      for (const talk of talks) {
        const item = el('li');
        const topic = pick(talk.title, talk.titleEn);
        item.append(el('span', 'ev-speaker', pick(talk.speaker, talk.speakerEn)),
          topic ? el('strong', 'ev-topic', pick(`《${topic}》`, `“${topic}”`)) : el('span', '', pick('主题待补充', 'Topic to be confirmed')));
        if (talk.summary) item.append(el('p', 'ev-meta', pick(talk.summary, talk.summaryEn)));
        list.append(item);
      }
      inner.append(list);
    }
    if (ev.poster) {
      const poster = el('figure', 'ev-poster');
      const link = el('a');
      link.href = ev.poster.src;
      link.target = '_blank';
      link.rel = 'noopener';
      const img = el('img');
      Object.assign(img, { src: ev.poster.src, alt: pick(ev.poster.alt, ev.poster.altEn), loading: 'lazy', width: 1024, height: 1536 });
      link.append(img);
      poster.append(link, el('figcaption', '', pick(ev.poster.caption, ev.poster.captionEn)));
      inner.append(poster);
    }
    if (ev.photos.length || ev.video) {
      const grid = el('div', 'ev-media');
      ev.photos.forEach((p, i) => grid.append(picture(p, i, ev.photos)));
      if (ev.video) grid.append(filmTile(ev.video, place));
      inner.append(grid);
    }
    wrap.append(inner);
    panel.append(wrap);

    const setOpen = (open) => {
      li.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
      panel.inert = !open;
      if (!open) stopFilms(panel);
      if (open) openSet.add(ev.date); else openSet.delete(ev.date);
    };
    setOpen(openSet.has(ev.date));
    head.addEventListener('click', () => setOpen(!li.classList.contains('is-open')));
    li.append(panel);
    return li;
  }

  /* data-recent-months="N" on #events limits the list to the last N months (homepage) */
  function inWindow(ev, months) {
    if (!months) return true;
    const [y, m, d] = ev.date.split('-').map(Number);
    const when = new Date(y, (m || 1) - 1, d || 1);
    const cut = new Date();
    cut.setMonth(cut.getMonth() - months);
    return when >= cut;
  }
  function renderEvents() {
    const box = $('#events');
    if (!box) return;
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
    const months = Number(box.dataset.recentMonths) || 0;
    const listed = EVENTS.filter((ev) => ev.scheduled ? ev.date >= today : inWindow(ev, months));
    const items = listed.map(eventItem);
    stopFilms(box);
    box.replaceChildren(...items);
    applyFilter();
  }
  function applyFilter() {
    let shown = 0;
    $$('#events .event').forEach((li) => {
      const hide = filter !== 'all' && li.dataset.type !== filter;
      if (hide) stopFilms(li);
      li.hidden = hide;
      if (!hide && !li.dataset.scheduled) shown += 1;
    });
    const count = $('#journey-count');
    if (count) {
      const total = RECORDED.length;
      count.textContent = document.body.dataset.page === 'journey'
        ? pick(`共 ${total} 条记录`, `${total} ${total === 1 ? 'entry' : 'entries'}`)
        : `${pad(shown)} / ${pad(total)} ${pick('条记录', 'ENTRIES')}`;
    }
  }
  $$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    $$('[data-filter]').forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    applyFilter();
  }));

  /* ---------- 04 co-creation ---------- */
  const TOOLS = [
    ['timer', 'A', '分享计时器', 'Talk timer', '为每位分享人守住时间', 'Keep time for every speaker'],
    ['draw', 'B', '抽签', 'Draw lots', '代理组长、发言顺序', 'Deputy, speaking order'],
    ['agenda', 'C', '议程生成', 'Agenda builder', '整理议题，下载 Markdown', 'Collect topics, export Markdown']
  ];
  function renderWorks() {
    const box = $('#works');
    if (!box) return;
    const nodes = PROJECTS.map((p, i) => {
      const card = el('article', 'work reveal');
      const top = el('div', 'work-top');
      top.append(el('span', '', `WORK ${pad(i + 1)} · ${pick(p.type, p.typeEn).toUpperCase()}`), el('span', 'status', p.status === 'demo' ? pick('样例 DEMO', 'DEMO') : p.status === 'live' ? pick('已上线', 'LIVE') : ''));
      card.append(top, el('h3', '', pick(p.title, p.titleEn)), el('p', '', pick(p.body, p.bodyEn)));
      if (p.id === 'toolkit') {
        const tools = el('div', 'work-tools');
        TOOLS.forEach(([key, no, zt, et, zd, ed]) => {
          const b = el('button', 'tool');
          b.type = 'button';
          b.dataset.tool = key;
          b.append(el('span', 'tool-no', `${no} · ${pick('打开', 'OPEN')} →`), el('span', 'tool-t', pick(zt, et)), el('span', 'tool-d', pick(zd, ed)));
          tools.append(b);
        });
        card.append(tools);
      }
      card.append(el('p', 'work-by', `BY · ${pick(p.by, p.byEn)}`));
      return card;
    });

    const submit = el('article', 'submit reveal');
    const top = el('div', 'work-top');
    top.append(el('span', '', `WORK ${pad(PROJECTS.length + 1)} · ${pick('待提交', 'OPEN SLOT')}`));
    const schema = el('pre', 'schema');
    const line = (k, v, c) => {
      const row = document.createDocumentFragment();
      row.append('  ', el('span', 'key', `"${k}"`), ': ', el('span', 'str', `"${v}"`), ',');
      if (c) row.append('  ', el('span', 'cmt', `// ${c}`));
      row.append('\n');
      return row;
    };
    schema.append('{\n',
      line('title', pick('作品名称', 'Project name')),
      line('type', pick('工具 | 技能 | 服务', 'tool | skill | service')),
      line('author', pick('组员姓名', 'Member name')),
      line('url', 'https://…', pick('可公开访问', 'publicly reachable')),
      line('summary', pick('一句话说明它解决什么问题', 'What problem it solves, in one line')),
      '}');
    const a = el('a', 'btn btn-dark');
    a.href = 'https://github.com/TGO46/members/issues/new';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.append(el('span', '', pick('在组员仓库提交', 'Submit in the members repo')));
    submit.append(top,
      el('h3', '', pick('作品完工后，如何提交？', 'How do I submit a finished project?')),
      el('p', '', pick('有两种提交方式：一种是直接命令你已连接组内仓库的AI操作，另一种是按下面的格式在组员仓库提交。', 'There are two ways to submit: instruct the AI assistant you’ve connected to the group repository to do it for you, or submit it yourself in the members’ repository using the format below.')),
      schema, a);
    box.replaceChildren(...nodes, submit);
    observe([...nodes, submit]);
  }

  /* ---------- language ---------- */
  function setLanguage(lang) {
    root.lang = lang === 'en' ? 'en' : 'zh-CN';
    $$('[data-i]').forEach((n) => { n.innerHTML = lang === 'en' ? (EN[n.dataset.i] ?? ZH[n.dataset.i]) : ZH[n.dataset.i]; });
    const btn = $('#lang-toggle');
    btn.textContent = lang === 'en' ? '中文' : 'EN';
    btn.setAttribute('aria-label', lang === 'en' ? '切换到中文' : 'Switch to English');
    document.title = lang === 'en' ? TITLE_EN : ZH_TITLE;
    store.set(LANG_KEY, lang);
    renderRoster();
    renderCharter();
    renderEvents();
    renderWorks();
  }
  $('#lang-toggle').addEventListener('click', () => {
    setLanguage(isEn() ? 'zh' : 'en');
    if (window.TGO_NAV) window.TGO_NAV.snap();
  });

  /* ---------- motion preference: follow the system "reduce motion" setting ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotion() {
    const paused = reduced.matches;
    root.classList.toggle('motion-paused', paused);
  }
  reduced.addEventListener('change', applyMotion);

  /* ---------- init ---------- */
  setLanguage(store.get(LANG_KEY) === 'en' ? 'en' : 'zh');
  applyMotion();
  observe($$('.reveal'));
  window.addEventListener('beforeprint', () => $$('.reveal').forEach((n) => n.classList.add('is-in')));
  const top = $('.hero') || $('.page-hero');
  requestAnimationFrame(() => requestAnimationFrame(() => top && top.classList.add('is-drawn')));
})();
