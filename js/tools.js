'use strict';
/* Meeting toolkit: timer, draw, agenda. Runs locally; nothing is uploaded. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const modal = $('#modal');
  const body = $('#modal-body');
  const MAX_MINUTES = 120;
  let timerId = null;

  const t = (zh, en) => (document.documentElement.lang === 'en' ? en : zh);

  function el(tag, attrs = {}, text = '') {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text) node.textContent = text;
    return node;
  }

  function stopTimer() { clearInterval(timerId); timerId = null; }

  function toast(msg) {
    const box = $('#toast');
    /* the modal dialog lives in the top layer; re-show the toast as a popover so it stacks above it */
    if (typeof box.showPopover === 'function') {
      if (box.matches(':popover-open')) box.hidePopover();
      box.showPopover();
    }
    box.textContent = msg;
    box.classList.add('is-on');
    clearTimeout(toast.h);
    clearTimeout(toast.h2);
    toast.h = setTimeout(() => {
      box.classList.remove('is-on');
      toast.h2 = setTimeout(() => { if (box.matches(':popover-open')) box.hidePopover(); }, 400);
    }, 2600);
  }

  function open(nodes, wide = false) {
    stopTimer();
    modal.classList.toggle('is-wide', wide);
    modal.onkeydown = null;
    body.replaceChildren(...nodes);
    if (!modal.open) modal.showModal();
  }
  function close() { stopTimer(); modal.close(); }

  function actions(...buttons) {
    const row = el('div', { class: 'modal-actions' });
    row.append(...buttons);
    return row;
  }

  function timerView() {
    let remaining = 300;
    const input = el('input', { id: 'minutes', type: 'number', min: '1', max: String(MAX_MINUTES), value: '5' });
    const clock = el('div', { class: 'clock', role: 'timer', 'aria-live': 'off' }, '05:00');
    const render = () => { clock.textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`; };
    const reset = () => {
      stopTimer();
      const minutes = Math.round(Math.max(1, Math.min(MAX_MINUTES, Number(input.value) || 5)));
      input.value = minutes;
      remaining = minutes * 60;
      render();
    };
    input.addEventListener('change', reset);
    const start = el('button', { class: 'primary', type: 'button' }, t('开始', 'Start'));
    const pause = el('button', { type: 'button' }, t('暂停', 'Pause'));
    const again = el('button', { type: 'button' }, t('重置', 'Reset'));
    start.onclick = () => {
      if (timerId || remaining <= 0) return;
      const deadline = Date.now() + remaining * 1000;
      timerId = setInterval(() => {
        remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        render();
        if (!remaining) {
          stopTimer();
          clock.textContent = t('时间到', 'Time');
          toast(t('分享时间到，请收尾。', 'Time is up. Please wrap up.'));
        }
      }, 200);
    };
    pause.onclick = stopTimer;
    again.onclick = reset;
    return [
      el('h2', { id: 'modal-title' }, t('分享计时器', 'Talk timer')),
      el('p', {}, t('为每一位分享人守住时间。', 'Keep time for every speaker.')),
      el('label', { for: 'minutes' }, t('时长（1–120 分钟）', 'Duration (1–120 min)')),
      input, clock, actions(start, pause, again)
    ];
  }

  function fairIndex(length) {
    const bound = Math.floor(4294967296 / length) * length;
    let n;
    do { n = crypto.getRandomValues(new Uint32Array(1))[0]; } while (n >= bound);
    return n % length;
  }

  function drawView() {
    const area = el('textarea', { id: 'candidates' });
    area.value = (window.TGO_MEMBERS || []).map((m) => m.name).join('\n');
    const result = el('div', { class: 'draw-result', 'aria-live': 'polite' }, '—');
    const go = el('button', { class: 'primary', type: 'button' }, t('抽一位', 'Draw'));
    go.onclick = () => {
      const names = [...new Set(area.value.split('\n').map((x) => x.trim()).filter(Boolean))];
      if (!names.length) { toast(t('请先填写名单', 'Add participants first')); return; }
      result.textContent = names[fairIndex(names.length)];
    };
    return [
      el('h2', { id: 'modal-title' }, t('抽签', 'Draw lots')),
      el('p', {}, t('每行一位，先移除请假的人。', 'One name per line. Remove anyone absent.')),
      el('label', { for: 'candidates' }, t('名单', 'Participants')),
      area, result, actions(go)
    ];
  }

  function agendaMarkdown(title, topics) {
    const head = `# ${title || 'TGO46'}\n\n> ${t('内部会议资料，请勿外传。', 'Internal meeting material. Do not share.')}\n\n`;
    return head + topics.map((v, i) => `## ${i + 1}. ${v}\n\n- ${t('主持 / 分享人', 'Host / speaker')}：\n- ${t('时长', 'Duration')}：\n- ${t('讨论与行动', 'Discussion & actions')}：\n`).join('\n');
  }

  function agendaView() {
    const title = el('input', { id: 'meeting-title' });
    title.value = t('TGO46 月度组会', 'TGO46 Monthly Group Meeting');
    const topics = el('textarea', { id: 'topics', placeholder: t('开场与近况\n月度回顾\n主题分享\n深度讨论\n行动与收尾', 'Check-in\nMonthly reviews\nTalk\nDiscussion\nActions') });
    const go = el('button', { class: 'primary', type: 'button' }, t('下载 Markdown', 'Download Markdown'));
    go.onclick = () => {
      const list = topics.value.split('\n').map((x) => x.trim()).filter(Boolean);
      if (!list.length) { toast(t('请至少填写一个议题', 'Add at least one topic')); return; }
      const url = URL.createObjectURL(new Blob([agendaMarkdown(title.value.trim(), list)], { type: 'text/markdown;charset=utf-8' }));
      const a = el('a', { href: url, download: 'TGO46-agenda.md' });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    return [
      el('h2', { id: 'modal-title' }, t('议程生成', 'Agenda builder')),
      el('p', {}, t('仅在本地生成，关闭即清空。', 'Generated locally; cleared on close.')),
      el('label', { for: 'meeting-title' }, t('会议名称', 'Title')), title,
      el('label', { for: 'topics' }, t('议题（每行一项）', 'Topics (one per line)')), topics,
      actions(go)
    ];
  }


  /* photo lightbox: list = [{ base, alt, altEn }], keyboard ← → to step */
  function lightbox(list, start) {
    let i = start;
    const img = el('img', { alt: '' });
    const cap = el('span');
    const count = el('span', { class: 'mono' });
    const prev = el('button', { type: 'button', 'aria-label': t('上一张', 'Previous') }, '←');
    const next = el('button', { type: 'button', 'aria-label': t('下一张', 'Next') }, '→');
    const show = () => {
      const p = list[i];
      img.src = `${p.base}-2000.jpg`;
      img.style.filter = p.tone ? `url(#tone-${p.tone})` : '';
      img.alt = t(p.alt, p.altEn);
      cap.textContent = t(p.alt, p.altEn);
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    };
    const go = (d) => { i = (i + d + list.length) % list.length; show(); };
    prev.onclick = () => go(-1);
    next.onclick = () => go(1);
    const nav = el('div', { class: 'nav' });
    nav.append(prev, next);
    const bar = el('div', { class: 'lightbox-bar' });
    if (list.length > 1) bar.append(count, cap, nav);
    else bar.append(cap);
    const wrap = el('div', { class: 'lightbox' });
    wrap.append(img, bar);
    const h = el('h2', { id: 'modal-title', class: 'visually-hidden' }, t('活动照片', 'Event photos'));
    h.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
    show();
    open([h, wrap], true);
    if (list.length > 1) {
      modal.onkeydown = (e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); };
      next.focus();
    } else $('#modal-close').focus();
  }

  const views = { timer: timerView, draw: drawView, agenda: agendaView };
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-tool]');
    if (trigger && views[trigger.dataset.tool]) open(views[trigger.dataset.tool]());
  });
  $('#modal-close').addEventListener('click', close);
  modal.addEventListener('close', () => { stopTimer(); modal.onkeydown = null; });
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  window.TGO_TOOLS = { close, toast, lightbox };
})();
