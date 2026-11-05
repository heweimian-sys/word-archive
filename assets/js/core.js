/* ============================================================================
 * core.js — 纯函数：日期、种子随机、每日题目生成、存储
 * 不依赖 DOM，方便单测和后续移植到 Worker。
 * ========================================================================== */
(function (global) {
  'use strict';

  const CFG = global.SITE_CONFIG;

  /* ------------------------------ 日期 ------------------------------ */

  // 以本地时区的「今天」为准，返回 YYYY-MM-DD
  function todayKey(d) {
    const x = d || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
  }

  // 在某个日期上加天数，返回 YYYY-MM-DD
  function shiftDay(key, delta) {
    const [y, m, d] = key.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + delta);
    return todayKey(dt);
  }

  // 从 today 往回推 n 天，返回数组（最新在前）
  function recentDays(n, fromKey) {
    const out = [];
    let cur = fromKey || todayKey();
    for (let i = 0; i < n; i++) { out.push(cur); cur = shiftDay(cur, -1); }
    return out;
  }

  const WEEKDAY = {
    zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    en: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  };

  function weekdayLabel(key) {
    const [y, m, d] = key.split('-').map(Number);
    const idx = new Date(y, m - 1, d).getDay();
    const lang = global.STATE ? global.STATE.lang : 'zh';
    return WEEKDAY[lang][idx];
  }

  // 当年的第几天，用于期号
  function dayOfYear(key) {
    const [y, m, d] = key.split('-').map(Number);
    const start = new Date(y, 0, 1);
    const cur = new Date(y, m - 1, d);
    return Math.floor((cur - start) / 86400000) + 1;
  }

  function issueNo(key) {
    return String(dayOfYear(key)).padStart(3, '0');
  }

  /* --------------------------- 确定性随机 --------------------------- */

  // FNV-1a 32bit
  function hashStr(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // mulberry32：同一 seed 永远产出同一序列
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* --------------------------- 每日题目 --------------------------- */

  /**
   * 用日期做种子，从词库里确定性抽题。
   * 同一天，全世界拿到的是同一套题和同一个选项顺序。
   */
  function buildDailySet(dateKey, words, opts) {
    const o = opts || {};
    const total = o.rounds || CFG.game.roundsPerDay;
    const version = CFG.game.seedVersion;
    const rand = rng(hashStr(`${version}|${dateKey}`));

    // 先打乱全量，再取前 total 个，保证不重复
    const pool = shuffle(words, rand);
    const picked = pool.slice(0, Math.min(total, pool.length));

    return picked.map(function (word, idx) {
      // 每题单独一个种子，选项顺序也固定
      const r2 = rng(hashStr(`${version}|${dateKey}|q${idx}|${word.id}`));

      // 干扰项：优先同分类，保证有难度又不风马牛不相及
      const sameCat = words.filter((w) => w.category === word.category && w.id !== word.id);
      const otherCat = words.filter((w) => w.category !== word.category);
      const distractors = shuffle(sameCat, r2).slice(0, 3);
      if (distractors.length < 3) {
        const extra = shuffle(otherCat, r2);
        while (distractors.length < 3 && extra.length) {
          const cand = extra.pop();
          if (!distractors.some((d) => d.id === cand.id)) distractors.push(cand);
        }
      }

      const options = shuffle([word].concat(distractors), r2);
      return {
        wordId: word.id,
        optionIds: options.map((w) => w.id),
        answerIndex: options.findIndex((w) => w.id === word.id),
      };
    });
  }

  /* ------------------------------ 存储 ------------------------------ */

  const KEY = 'wordarchive.v1';

  function loadState() {
    let raw = null;
    try { raw = global.localStorage.getItem(KEY); } catch (_) { /* 隐私模式 */ }
    let s = null;
    try { s = raw ? JSON.parse(raw) : null; } catch (_) { s = null; }
    if (!s || typeof s !== 'object') s = {};
    return {
      lang: s.lang || null,
      name: s.name || '',
      daily: s.daily || {},       // { 'YYYY-MM-DD': {score, hits, round, at, cells} }
      streak: s.streak || 0,
      best: s.best || 0,
      lastPlayed: s.lastPlayed || '',
      seen: s.seen || {},         // { wordId: true } 解锁过的词
      board: s.board || [],       // [{date, score, hits, round, at}]
    };
  }

  function saveState(s) {
    try { global.localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) { /* 忽略配额 */ }
  }

  // 根据 daily 记录重算 streak：从今天（或昨天）往前连续有记录的天数
  function computeStreak(daily) {
    const today = todayKey();
    let anchor = today;
    if (!daily[anchor]) {
      anchor = shiftDay(today, -1);
      if (!daily[anchor]) return 0;
    }
    let n = 0;
    let cur = anchor;
    while (daily[cur]) { n++; cur = shiftDay(cur, -1); }
    return n;
  }

  /* ------------------------------ 计分 ------------------------------ */

  function scoreAnswer(remainRatio, streak) {
    const g = CFG.game;
    const base = g.baseScore;
    const timeBonus = Math.round(g.timeBonusMax * Math.max(0, Math.min(1, remainRatio)));
    const streakBonus = Math.min(g.streakBonusMax, streak * g.streakBonusStep);
    return { base, timeBonus, streakBonus, total: base + timeBonus + streakBonus };
  }

  function gradeKey(hits, total) {
    if (hits >= total) return 'grade.5';
    if (hits === total - 1) return 'grade.4';
    if (hits === total - 2) return 'grade.3';
    if (hits === total - 3) return 'grade.2';
    if (hits >= 1) return 'grade.1';
    return 'grade.0';
  }

  /* ------------------------------ 导出 ------------------------------ */

  global.Core = {
    todayKey, shiftDay, recentDays, weekdayLabel, dayOfYear, issueNo,
    hashStr, rng, shuffle,
    buildDailySet,
    loadState, saveState, computeStreak,
    scoreAnswer, gradeKey,
    STORAGE_KEY: KEY,
  };
})(window);
