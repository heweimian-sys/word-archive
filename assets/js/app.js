/* ============================================================================
 * app.js — 视图路由与渲染
 * ========================================================================== */
(function (global) {
  'use strict';

  const CFG = global.SITE_CONFIG;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const STATE = {
    lang: CFG.defaultLang,
    view: 'home',
    libCat: 'all',
    libQuery: '',
    archOpen: null,
    rankTab: 'today',
    data: null,
    store: null,
    lastResult: null,
  };
  global.STATE = STATE;

  const VIEWS = ['home', 'play', 'library', 'archive', 'rank'];

  /* ============================== 语言 ============================== */

  function setLang(lang) {
    STATE.lang = lang === 'en' ? 'en' : 'zh';
    document.documentElement.lang = STATE.lang === 'zh' ? 'zh-CN' : 'en';
    const s = Core.loadState();
    s.lang = STATE.lang;
    Core.saveState(s);
    applyStaticText();
    renderAll();
  }

  function applyStaticText() {
    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    $$('[data-i18n-ph]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    $$('.lang-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === STATE.lang));
    });
    document.title = STATE.lang === 'zh'
      ? '词林秘典 · The Word Archive — 每日热词挑战'
      : 'The Word Archive · Daily Buzzword Quest';
  }

  /* ============================== 路由 ============================== */

  function go(view, opts) {
    const o = opts || {};
    if (VIEWS.indexOf(view) < 0) view = 'home';
    STATE.view = view;
    VIEWS.forEach(function (v) {
      const el = $('#view-' + v);
      if (el) el.hidden = v !== view;
    });
    $$('.rail-btn, .tab-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.go === view);
    });
    document.body.dataset.view = view;
    if (o.hash !== false) {
      try { history.replaceState(null, '', '#' + view); } catch (_) {}
    }
    if (view === 'library') { renderLibrary(); scrollTop(); }
    if (view === 'archive') { renderArchive(); scrollTop(); }
    if (view === 'rank') { renderRank(); scrollTop(); }
    if (view === 'play') { renderPlayEntry(); }
    if (view === 'home') { renderHome(); }
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ============================== 首页 ============================== */

  function renderHome() {
    const st = STATE.store;
    const today = Core.todayKey();
    const done = !!st.daily[today];

    $('#brand-name').textContent = t('brand.name');
    $('#issue-no').textContent = t('brand.issue', { n: Core.issueNo(today) });
    $('#today-date').textContent = today.replace(/-/g, ' / ');
    $('#today-weekday').textContent = Core.weekdayLabel(today);

    // 标题：中文模式只出现中文
    $('#title-kicker').textContent = t('title.kicker');
    $('#title-main').textContent = t('title.main');
    $('#title-sub').textContent = t('title.sub');

    // 大厅不再单独放战绩面板：连续天数合并进 CTA 提示行
    const streak = st.streak || 0;
    const wordsFound = Object.keys(st.seen || {}).length;
    for (const [id, val] of [['stat-streak', streak], ['stat-best', st.best || 0], ['stat-words', wordsFound]]) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    const playState = $('#menu-play-state');
    playState.textContent = done ? t('state.done') : t('state.todo');
    playState.classList.toggle('is-done', done);

    // 菜单副标题随语言切换，绝不混排
    const subs = {
      play: t('menu.sub.play'),
      library: t('menu.sub.library'),
      archive: t('menu.sub.archive'),
      rank: t('menu.sub.rank'),
    };
    Object.keys(subs).forEach(function (k) {
      const el = document.getElementById('menu-sub-' + k);
      if (el) el.textContent = subs[k];
    });

    $('#menu-lib-state').textContent = t('count.words', { n: STATE.data ? STATE.data.words.length : 0 });
    $('#menu-arch-state').textContent = t('count.played', { n: Object.keys(st.daily || {}).length });
    $('#menu-rank-state').textContent = t('count.best', { n: st.best || 0 });

    $('#cta-label').textContent = done ? t('cta.played') : t('cta.enter');
    $('#cta-hint').textContent = done
      ? t('home.hintPlayed')
      : (streak > 0
          ? t('home.hintStreak', { n: streak }) + ' · ' + t('home.hint')
          : t('home.hint'));

    renderTodayWord();
  }

  // 可选组件：热词牌（目前大厅不显示，留给词库/词条页复用）
  function renderTodayWord() {
    if (!STATE.data) return;
    if (!$('#today-word')) return;   // 页面没有这个组件就直接跳过
    const today = Core.todayKey();
    const set = Core.buildDailySet(today, STATE.data.words);
    const q = set[0];
    if (!q) return;
    const word = STATE.data.words.find((w) => w.id === q.wordId);
    if (!word) return;

    const cat = STATE.data.categories.find((c) => c.id === word.category);

    $('#today-word').textContent = pick(word.term);
    // 两种语言都显示拼音（不是英文），避免与主词重复
    $('#today-pinyin').textContent = word.pinyin || '';
    $('#today-def').textContent = pick(word.def);
    $('#today-usage').textContent = pick(word.usage);
    $('#today-cat').textContent = cat ? pick(cat) : '';
    $('#today-diff').textContent = t('word.lv', { n: word.difficulty });

    $('#orb-kicker').textContent = STATE.lang === 'zh' ? '今 日 热 词' : "TODAY'S WORD";
    $('#orb-caption').textContent = STATE.lang === 'zh'
      ? '今日 5 题中的第 1 题 · 点下方开始挑战'
      : 'Round 1 of 5 today · start below';
  }

  /* ============================== 挑战入口 ============================== */

  function renderPlayEntry() {
    const today = Core.todayKey();
    const rec = STATE.store.daily[today];
    const startBox = $('#quiz-start');
    const qBox = $('#quiz-question');
    const rBox = $('#quiz-result');

    startBox.hidden = false;
    qBox.hidden = true;
    rBox.hidden = true;

    const btn = $('#btn-start');
    btn.textContent = rec
      ? t('state.done') + ' · ' + t('quiz.score', { n: rec.score })
      : t('play.begin');
    btn.disabled = !!rec;
    if (rec) btn.style.opacity = '.55';

    const ds = $('#daily-state');
    if (rec) {
      ds.textContent = t('state.done') + ' · ' + rec.hits + '/' + rec.round + ' · ' + t('quiz.score', { n: rec.score });
    } else {
      ds.textContent = t('play.notYet');
    }
  }

  /* ============================== 答题 ============================== */

  // 计时环刷新：每日挑战与词条练习共用
  Game.onTick = function (remain, ratio) {
    const num = $('#timer-num');
    const ring = $('#ring-fg');
    const wrap = $('#quiz-timer');
    if (num) num.textContent = Math.max(0, remain);
    if (ring) ring.style.strokeDashoffset = String(119.4 * (1 - ratio));
    if (wrap) wrap.classList.toggle('is-low', remain <= 6);
  };

  function beginRun(mode) {
    $('#quiz-start').hidden = true;
    $('#quiz-result').hidden = true;
    $('#quiz-question').hidden = false;

    if (mode === 'daily') Game.start('daily', { dateKey: Core.todayKey() });
    else Game.start('practice', {});

    renderRound();
  }

  // 从词条弹层发起：只出一道题
  function practiceOneWord(word) {
    const optionIds = buildOptionsFor(word);
    Game.start('practice', {
      set: [{
        wordId: word.id,
        optionIds,
        answerIndex: optionIds.indexOf(word.id),
      }],
    });
    $('#quiz-start').hidden = true;
    $('#quiz-result').hidden = true;
    $('#quiz-question').hidden = false;
    renderRound();
  }

  function renderRound() {
    const cur = Game.current();
    if (!cur) return finishRun();
    const prog = Game.progress();
    const cat = STATE.data.categories.find((c) => c.id === cur.word.category);

    $('#quiz-progress').textContent = t('quiz.progress', { n: prog.round, total: prog.total });
    $('#quiz-score').textContent = t('quiz.score', { n: Game.score });
    $('#q-category').textContent = cat ? pick(cat) : '';
    $('#q-def').textContent = pick(cur.word.def);
    $('#q-feedback').textContent = '';
    $('#q-feedback').className = 'q-feedback';
    $('#btn-next').hidden = true;

    const box = $('#options');
    box.innerHTML = '';
    cur.options.forEach(function (w, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'option';
      b.dataset.index = String(i);
      b.innerHTML = '<span class="opt-key">' + (i + 1) + '</span><span>' + escapeHtml(pick(w.term)) + '</span>';
      b.addEventListener('click', function () { choose(i); });
      box.appendChild(b);
    });

    Game.startTimer();
  }

  function choose(i) {
    const res = Game.answer(i);
    if (!res) return;

    $$('#options .option').forEach(function (b, idx) {
      b.disabled = true;
      if (idx === res.answerIndex) b.classList.add('is-correct');
      else if (idx === i) b.classList.add('is-wrong');
      else b.classList.add('is-muted');
    });

    const fb = $('#q-feedback');
    const gain = res.gain;
    if (res.ok) {
      fb.className = 'q-feedback ok';
      fb.innerHTML = t('play.answerCorrect') + ' · +' + t('quiz.score', { n: gain.total })
        + '<span class="fb-sub">' + escapeHtml(pick(res.word.term)) + ' — ' + escapeHtml(pick(res.word.usage)) + '</span>';
    } else {
      fb.className = 'q-feedback bad';
      fb.innerHTML = (res.timeout ? t('play.answerTimeout') : t('play.answerWrong'))
        + ' · ' + escapeHtml(pick(res.word.term))
        + '<span class="fb-sub">' + escapeHtml(pick(res.word.def)) + '</span>';
    }
    $('#quiz-score').textContent = t('quiz.score', { n: Game.score });
    const nx = $('#btn-next');
    nx.hidden = false;
    // 最后一题不叫“下一题”，直接引导看战绩
    const isLast = Game.idx >= Game.set.length - 1;
    nx.textContent = isLast ? t('play.lastNext') : t('play.next');
  }

  function nextRound() {
    const r = Game.next();
    if (r.done) return finishRun();
    renderRound();
  }

  function finishRun() {
    const result = Game.finish();
    STATE.lastResult = result;
    $('#quiz-question').hidden = true;
    $('#quiz-start').hidden = true;
    $('#quiz-result').hidden = false;

    const grade = t(Core.gradeKey(result.hits, result.total));
    $('#result-grade').textContent = grade;
    $('#result-sub').textContent = result.hits + ' / ' + result.total + ' · ' + result.date;
    $('#result-score').textContent = result.score;
    const unitEl = $('#result-unit');
    if (unitEl) unitEl.textContent = t('unit.pts');

    const grid = $('#share-grid');
    grid.innerHTML = '';
    result.cells.forEach(function (c) {
      const d = document.createElement('div');
      d.className = 'share-cell ' + c;
      d.textContent = c === 'hit' ? '✓' : c === 'miss' ? '✕' : '·';
      grid.appendChild(d);
    });

    $('#result-line').textContent = result.mode === 'daily'
      ? (result.hits === result.total ? t('result.allPerfect') : t('result.tomorrow'))
      : t('result.practiceNote');

    renderReview(result);
    renderAdSlots();
    STATE.store = Core.loadState();
    renderHome();
  }

  function renderReview(result) {
    const list = $('#review-list');
    list.innerHTML = '';
    result.review.forEach(function (r, i) {
      const li = document.createElement('li');
      const mark = r.ok ? '✓' : '✕';
      li.innerHTML = '<span class="rv-mark ' + (r.ok ? 'hit' : 'miss') + '">' + mark + '</span>'
        + '<span><b>' + escapeHtml(pick(r.word.term)) + '</b> <em>' + escapeHtml(pick(r.word.term.en)) + '</em><br>'
        + escapeHtml(pick(r.word.def)) + '</span>';
      list.appendChild(li);
    });
  }

  function share() {
    const r = STATE.lastResult;
    if (!r) return;
    const text = Game.buildShareText(r);
    const done = function (ok) { toast(ok ? t('toast.copied') : text, 2600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    document.body.removeChild(ta);
    cb(ok);
  }

  /* ============================== 词库 ============================== */

  function renderLibrary() {
    if (!STATE.data) return;
    const cats = STATE.data.categories;

    $('#lib-count').textContent = t('count.words', { n: STATE.data.words.length });

    const box = $('#lib-cats');
    if (!box.dataset.built) {
      box.dataset.built = '1';
      box.innerHTML = '';
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'chip is-active';
      all.dataset.cat = 'all';
      all.textContent = t('lib.all');
      box.appendChild(all);
      cats.forEach(function (c) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.dataset.cat = c.id;
        b.textContent = pick(c);
        box.appendChild(b);
      });
      box.addEventListener('click', function (e) {
        const b = e.target.closest('.chip');
        if (!b) return;
        STATE.libCat = b.dataset.cat;
        $$('.chip', box).forEach((x) => x.classList.toggle('is-active', x === b));
        paintWords();
      });
    }

    const q = $('#lib-search');
    if (!q.dataset.bound) {
      q.dataset.bound = '1';
      q.addEventListener('input', function () {
        STATE.libQuery = q.value.trim().toLowerCase();
        paintWords();
      });
    }

    paintWords();
  }

  function paintWords() {
    const grid = $('#word-grid');
    const empty = $('#lib-empty');
    const all = STATE.data.words;
    const q = STATE.libQuery;
    const cat = STATE.libCat;

    const list = all.filter(function (w) {
      if (cat !== 'all' && w.category !== cat) return false;
      if (!q) return true;
      const hay = [w.term.zh, w.term.en, w.pinyin, (w.tags || []).join(' '), w.def.zh].join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    });

    grid.innerHTML = '';
    empty.hidden = list.length > 0;

    list.forEach(function (w) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'word-card';
      b.innerHTML = '<span class="wc-term">' + escapeHtml(w.term.zh) + '</span>'
        + '<span class="wc-en">' + escapeHtml(w.term.en) + '</span>'
        + '<span class="wc-def">' + escapeHtml(w.def.zh) + '</span>'
        + '<span class="wc-foot"><span>' + escapeHtml(w.firstSeen) + '</span>'
        + '<span class="diff-dots">' + diffDots(w.difficulty) + '</span></span>';
      b.addEventListener('click', function () { openWord(w); });
      grid.appendChild(b);
    });
  }

  function diffDots(n) {
    let s = '';
    for (let i = 1; i <= 3; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>';
    return s;
  }

  /* ============================== 词条弹层 ============================== */

  function openWord(w) {
    const cat = STATE.data.categories.find((c) => c.id === w.category);
    $('#modal-cat').textContent = cat ? pick(cat) : '';
    $('#modal-title').textContent = pick(w.term);
    $('#modal-pinyin').textContent = w.pinyin || '';
    $('#modal-def').textContent = pick(w.def);
    $('#modal-usage').textContent = pick(w.usage);
    $('#modal-date').textContent = t('modal.source') + ' ' + w.firstSeen;

    const tags = $('#modal-tags');
    tags.innerHTML = '';
    (w.tags || []).forEach(function (tg) {
      const s = document.createElement('span');
      s.textContent = tg;
      tags.appendChild(s);
    });

    const btn = $('#modal-practice');
    btn.onclick = function () {
      closeModal();
      go('play');
      practiceOneWord(w);
    };

    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function buildOptionsFor(w) {
    const rand = Core.rng(Core.hashStr(w.id + Date.now()));
    const same = STATE.data.words.filter((x) => x.category === w.category && x.id !== w.id);
    const others = STATE.data.words.filter((x) => x.category !== w.category);
    const pool = Core.shuffle(same, rand).slice(0, 3);
    while (pool.length < 3) pool.push(Core.shuffle(others, rand).pop());
    return Core.shuffle([w].concat(pool), rand).map((x) => x.id);
  }

  function closeModal() {
    $('#modal').hidden = true;
    document.body.style.overflow = '';
  }

  /* ============================== 往期 ============================== */

  function renderArchive() {
    const grid = $('#arch-grid');
    const days = Core.recentDays(30);
    $('#arch-range').textContent = days[days.length - 1] + ' → ' + days[0];

    grid.innerHTML = '';
    days.forEach(function (key) {
      const rec = STATE.store.daily[key];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'arch-cell' + (key === Core.todayKey() ? ' is-today' : '') + (rec ? ' is-played' : '');
      b.innerHTML = '<span class="ac-date">' + key.slice(5) + '</span>'
        + '<span class="ac-meta">' + (rec ? t('arch.played') + ' · ' + rec.score : t('arch.unplayed')) + '</span>';
      b.addEventListener('click', function () { showArchDay(key); });
      grid.appendChild(b);
    });

    if (STATE.archOpen) showArchDay(STATE.archOpen, true);
  }

  function showArchDay(key, silent) {
    STATE.archOpen = key;
    const detail = $('#arch-detail');
    const set = Core.buildDailySet(key, STATE.data.words);
    $('#arch-detail-title').textContent = key + ' · NO.' + Core.issueNo(key);

    const list = $('#arch-words');
    list.innerHTML = '';
    set.forEach(function (q, i) {
      const w = STATE.data.words.find((x) => x.id === q.wordId);
      if (!w) return;
      const li = document.createElement('li');
      li.innerHTML = '<span class="aw-idx">' + (i + 1) + '</span>'
        + '<span class="aw-term">' + escapeHtml(w.term.zh) + '</span>'
        + '<span class="aw-def">' + escapeHtml(w.def.zh) + '</span>';
      li.style.cursor = 'pointer';
      li.addEventListener('click', function () { openWord(w); });
      list.appendChild(li);
    });

    detail.hidden = false;
    if (!silent) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ============================== 榜单 ============================== */

  function renderRank() {
    const board = $('#board');
    const st = STATE.store;
    const rows = (st.board || []).slice();

    let list = rows;
    if (STATE.rankTab === 'today') {
      const today = Core.todayKey();
      list = rows.filter((r) => r.date === today);
    }
    list = list.slice().sort((a, b) => b.score - a.score).slice(0, 20);

    $('#rank-label').textContent = CFG.leaderboardUrl
      ? (STATE.lang === 'zh' ? '全服榜' : 'GLOBAL')
      : t('rank.local');
    board.innerHTML = '';

    if (!list.length) {
      const d = document.createElement('div');
      d.className = 'board-row is-empty';
      d.textContent = t('rank.empty');
      board.appendChild(d);
    } else {
      list.forEach(function (r, i) {
        const d = document.createElement('div');
        d.className = 'board-row';
        d.innerHTML = '<span class="board-rank">' + (i + 1) + '</span>'
          + '<span class="board-name">' + escapeHtml(st.name || t('rank.anon'))
          + ' <span class="badge">' + r.date.slice(5) + '</span></span>'
          + '<span class="board-score">' + r.score + '<small>' + t('unit.pts') + '</small></span>';
        board.appendChild(d);
      });
    }

    const nameInput = $('#player-name');
    if (document.activeElement !== nameInput) nameInput.value = st.name || '';

    $$('.tab').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.tab === STATE.rankTab);
    });
  }

  /* ============================== 广告位 ============================== */

  function renderAdSlots() {
    $$('.ad-slot').forEach(function (el) {
      const slot = el.dataset.slot;
      const conf = CFG.ads.slots[slot];
      if (!conf) return;
      if (!CFG.ads.enabled || !conf.script) {
        el.textContent = conf.placeholder || '';
        el.removeAttribute('data-filled');
        return;
      }
      el.setAttribute('data-filled', '1');
      el.innerHTML = conf.script;
    });
  }

  /* ============================== 工具 ============================== */

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  let toastTimer = null;
  function toast(msg, ms) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, ms || 2200);
  }

  /* ============================== 渲染入口 ============================== */

  function renderAll() {
    renderHome();
    if (STATE.view === 'library') renderLibrary();
    if (STATE.view === 'archive') renderArchive();
    if (STATE.view === 'rank') renderRank();
    if (STATE.view === 'play') renderPlayEntry();
  }

  /* ============================== 事件绑定 ============================== */

  function bind() {
    document.addEventListener('click', function (e) {
      const goEl = e.target.closest('[data-go]');
      if (goEl) { go(e.target.closest('[data-go]').dataset.go); return; }
      if (e.target.closest('[data-close]')) closeModal();
    });

    $$('.lang-switch button').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.dataset.lang); });
    });

    $('#btn-start').addEventListener('click', function () { beginRun('daily'); });
    $('#btn-practice').addEventListener('click', function () { beginRun('practice'); });
    $('#btn-next').addEventListener('click', nextRound);
    $('#btn-share').addEventListener('click', share);
    $('#btn-again').addEventListener('click', function () { beginRun('practice'); });
    $('#arch-close').addEventListener('click', function () {
      $('#arch-detail').hidden = true;
      STATE.archOpen = null;
    });

    $('#save-name').addEventListener('click', function () {
      const s = Core.loadState();
      s.name = $('#player-name').value.trim().slice(0, 16);
      Core.saveState(s);
      STATE.store = s;
      toast(t('toast.saved'));
      renderRank();
    });

    $$('.tab').forEach(function (b) {
      b.addEventListener('click', function () {
        STATE.rankTab = b.dataset.tab;
        renderRank();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (STATE.view !== 'play' || $('#quiz-question').hidden) return;
      if (e.key >= '1' && e.key <= '4') {
        const i = Number(e.key) - 1;
        const btn = $$('#options .option')[i];
        if (btn && !btn.disabled) { e.preventDefault(); choose(i); }
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (!$('#btn-next').hidden) { e.preventDefault(); nextRound(); }
      }
    });

    window.addEventListener('hashchange', function () {
      go((location.hash || '#home').slice(1));
    });
  }

  /* ============================== 启动 ============================== */

  async function boot() {
    STATE.store = Core.loadState();
    if (STATE.store.lang) STATE.lang = STATE.store.lang;
    applyStaticText();
    bind();

    try {
      STATE.data = await Game.load();
    } catch (err) {
      console.error(err);
      toast('词库加载失败：' + err.message, 4000);
      return;
    }

    const hash = (location.hash || '').slice(1);
    go(VIEWS.indexOf(hash) >= 0 ? hash : 'home', { hash: false });
    renderAdSlots();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
