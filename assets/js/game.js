/* ============================================================================
 * game.js — 每日挑战 / 练习模式的状态机
 * ========================================================================== */
(function (global) {
  'use strict';

  const CFG = global.SITE_CONFIG;
  const G = CFG.game;

  const Game = {
    data: null,        // words.json
    set: null,         // 当前这套题
    dateKey: '',
    mode: 'daily',     // daily | practice
    idx: 0,
    score: 0,
    streak: 0,
    hits: 0,
    cells: [],         // 'hit' | 'miss' | 'skip'
    review: [],        // [{word, ok, chosen}]
    locked: false,
    timer: null,
    remain: 0,
    onTick: null,
    onEnd: null,
    onRound: null,
  };

  Game.load = async function () {
    const res = await fetch('data/words.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('words.json ' + res.status);
    Game.data = await res.json();
    return Game.data;
  };

  Game.wordById = function (id) {
    return Game.data.words.find((w) => w.id === id);
  };

  Game.start = function (mode, opts) {
    const o = opts || {};
    Game.mode = mode || 'daily';
    Game.dateKey = o.dateKey || Core.todayKey();
    Game.set = o.set || Core.buildDailySet(Game.dateKey, Game.data.words, { rounds: G.roundsPerDay });
    Game.idx = 0;
    Game.score = 0;
    Game.streak = 0;
    Game.hits = 0;
    Game.cells = [];
    Game.review = [];
    Game.locked = false;
  };

  Game.current = function () {
    const q = Game.set[Game.idx];
    if (!q) return null;
    const word = Game.wordById(q.wordId);
    const options = q.optionIds.map((id) => Game.wordById(id));
    return { q, word, options };
  };

  Game.startTimer = function () {
    Game.stopTimer();
    Game.remain = G.seconds;
    if (Game.onTick) Game.onTick(Game.remain, 1);
    Game.timer = setInterval(function () {
      Game.remain -= 1;
      const ratio = Math.max(0, Game.remain / G.seconds);
      if (Game.onTick) Game.onTick(Game.remain, ratio);
      if (Game.remain <= 0) {
        Game.stopTimer();
        if (!Game.locked) Game.answer(-1);
      }
    }, 1000);
  };

  Game.stopTimer = function () {
    if (Game.timer) { clearInterval(Game.timer); Game.timer = null; }
  };

  /**
   * 作答。choiceIndex = -1 表示超时。
   * 返回 { ok, word, gain, timeout }
   */
  Game.answer = function (choiceIndex) {
    if (Game.locked) return null;
    Game.locked = true;
    Game.stopTimer();

    const { q, word } = Game.current();
    const timeout = choiceIndex < 0;
    const ok = !timeout && choiceIndex === q.answerIndex;
    const remainRatio = Math.max(0, Game.remain / G.seconds);

    let gain = { base: 0, timeBonus: 0, streakBonus: 0, total: 0 };

    if (ok) {
      gain = Core.scoreAnswer(remainRatio, Game.streak);
      Game.score += gain.total;
      Game.hits += 1;
      Game.streak += 1;
      Game.cells.push('hit');
    } else {
      Game.streak = 0;
      Game.cells.push(timeout ? 'skip' : 'miss');
    }

    Game.review.push({
      word,
      ok,
      timeout,
      chosen: timeout ? null : Game.wordById(q.optionIds[choiceIndex]),
    });

    return { ok, word, gain, timeout, answerIndex: q.answerIndex, choiceIndex };
  };

  Game.next = function () {
    Game.idx += 1;
    Game.locked = false;
    if (Game.idx >= Game.set.length) {
      Game.stopTimer();
      return { done: true };
    }
    return { done: false, index: Game.idx };
  };

  Game.progress = function () {
    return { round: Math.min(Game.idx + 1, Game.set.length), total: Game.set.length };
  };

  /* --------------------- 结算：写本地记录 + 榜单 --------------------- */

  Game.finish = function () {
    Game.stopTimer();
    const state = Core.loadState();
    const total = Game.set.length;

    if (Game.mode === 'daily') {
      state.daily[Game.dateKey] = {
        score: Game.score,
        hits: Game.hits,
        round: total,
        at: Date.now(),
        cells: Game.cells.join(','),
      };
      state.lastPlayed = Game.dateKey;
      Game.review.forEach(function (r) { if (r.word) state.seen[r.word.id] = 1; });
      state.streak = Core.computeStreak(state.daily);
      state.best = Math.max(state.best || 0, state.streak);
      state.board = (state.board || []).concat([{
        date: Game.dateKey, score: Game.score, hits: Game.hits, round: total, at: Date.now(),
      }]).slice(-200);
      Core.saveState(state);
      Game.pushLeaderboard(state);
    }

    return {
      score: Game.score, hits: Game.hits, total, cells: Game.cells,
      date: Game.dateKey, mode: Game.mode, review: Game.review, state,
    };
  };

  // 有后端才发；没配置就静默跳过
  Game.pushLeaderboard = function (state) {
    if (!CFG.leaderboardUrl) return;
    try {
      fetch(CFG.leaderboardUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name || t('rank.anon'),
          score: Game.score,
          round: Game.set.length,
          date: Game.dateKey,
          scope: 'today',
        }),
        keepalive: true,
      }).catch(function () { /* 离线不影响主流程 */ });
    } catch (_) { /* 忽略 */ }
  };

  Game.buildShareText = function (result) {
    const lang = global.STATE ? global.STATE.lang : 'zh';
    const cells = result.cells.map(function (c) {
      return c === 'hit' ? '🟩' : c === 'miss' ? '🟥' : '⬜';
    }).join('');
    const url = CFG.share.url || (CFG.origin.replace(/\/$/, '') + '/');
    return CFG.share.template[lang]({
      date: result.date,
      cells,
      hits: result.hits,
      total: result.total,
      score: result.score,
      url,
    });
  };

  global.Game = Game;
})(window);
