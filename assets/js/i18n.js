/* ============================================================================
 * i18n.js — 文案表 + 切换
 * ========================================================================== */
window.I18N = {
  zh: {
    'nav.back': '返回',
    'nav.home': '首页',
    'nav.play': '每日挑战',
    'nav.library': '热词典藏',
    'nav.archive': '往期档案',
    'nav.rank': '星榜',

    'home.streak': '连续天数',
    'home.best': '最长记录',
    'home.words': '已解锁热词',
    'home.cta': 'ENTER THE QUEST',
    'home.ctaPlayed': '今日已完成 · 查看战绩',
    'home.hint': '一次机会 · 每天 00:00 重置',
  'home.hintStreak': '连续 {n} 天',
    'home.hintPlayed': '今天已完成 · 明天再来',

    'play.title': '今日试炼',
    'play.lead': '5 道热词题。每题 25 秒。选错不扣分，但连击会断。每天只有一次机会。',
    'play.rule1k': '读释义 · 选热词',
    'play.rule1': '每题给出一个热词的释义，从四个选项中选出正确的那个词。',
    'play.rule2k': '快答有加成',
    'play.rule2': '答对得 100 分，剩余时间越多加成越高，连击再加成。',
    'play.rule3k': '可分享的战绩',
    'play.rule3': '结束后生成 Wordle 式战绩图，一键复制发到群里。',
    'play.practice': '练习模式（不计入战绩）',
    'play.next': '下一题',
    'play.kbd': '按 1–4 选择 · 空格继续',
    'play.again': '再来一局练习',
    'play.review': '查看本题回顾',
    'play.start': '开始 · BEGIN',
    'play.correct': '答对',
    'play.wrong': '答错了',
    'play.timeout': '超时',
    'play.done': '今日已完成',
    'play.notYet': '今天还没玩 · 5 题约 2 分钟',
    'play.progress': 'ROUND {n} / {total}',

    'lib.title': '热词典藏',
    'lib.lead': '站内收录的全部热词。点开看释义、例句和出处日期；也可以直接拿它开一局练习。',
    'lib.search': '搜索热词、拼音或标签',
    'lib.all': '全部',
    'lib.empty': '没有匹配的热词。',

    'arch.title': '往期档案',
    'arch.lead': '每天一套题，题面由日期确定性生成，全世界看到的是同一套。点开往期可以回看那天的五个词。',
    'arch.close': '收起',
    'arch.today': '今天',
    'arch.played': '已挑战',
    'arch.unplayed': '未挑战',

    'rank.title': '星榜',
    'rank.lead': '本机战绩榜。接后端后这里就是全服榜（见 README 的排行榜接口）。',
    'rank.today': '今日',
    'rank.all': '总榜',
    'rank.name': '昵称',
    'rank.save': '保存',
    'rank.me': '我',
    'rank.empty': '还没有成绩，先玩一局。',
    'rank.anon': '无名旅人',

    'modal.practice': '用这个词开一局',
    'modal.source': '收录于',

    'grade.1': 'INITIATE',
    'grade.2': 'SEEKER',
    'grade.3': 'SCHOLAR',
    'grade.4': 'LOREKEEPER',
    'grade.5': 'ARCHIVIST',
    'grade.0': 'WANDERER',

    'toast.copied': '战绩已复制，去群里发一张',
    'toast.copyFail': '复制失败，请手动选中',
    'toast.saved': '已保存',
    'toast.reset': '练习结束，今日正式成绩不受影响',
  },

  en: {
    'nav.back': 'Back',
    'nav.home': 'Home',
    'nav.play': 'Daily Challenge',
    'nav.library': 'Word Library',
    'nav.archive': 'Archive',
    'nav.rank': 'Rankings',

    'home.streak': 'Streak',
    'home.best': 'Best',
    'home.words': 'Words found',
    'home.cta': 'ENTER THE QUEST',
    'home.ctaPlayed': 'Completed · View Result',
    'home.hint': 'One attempt a day · resets at 00:00',
  'home.hintStreak': '{n}-day streak',
    'home.hintPlayed': 'Done for today · come back tomorrow',

    'play.title': "Today's Trial",
    'play.lead': 'Five buzzwords. Twenty-five seconds each. Wrong answers cost no points, but they break your streak. One attempt a day.',
    'play.rule1k': 'Read · Choose',
    'play.rule1': 'Each round gives you a definition. Pick the word it describes from four options.',
    'play.rule2k': 'Speed pays',
    'play.rule2': 'A correct answer is worth 100 points, plus a time bonus and a streak bonus.',
    'play.rule3k': 'A score worth sharing',
    'play.rule3': 'A Wordle-style card is generated at the end — copy it and post it.',
    'play.practice': 'Practice mode (not recorded)',
    'play.next': 'Next round',
    'play.kbd': 'Press 1–4 to choose · Space to continue',
    'play.again': 'Play another practice run',
    'play.review': 'Review this run',
    'play.start': 'BEGIN',
    'play.correct': 'Correct',
    'play.wrong': 'Not quite',
    'play.timeout': "Time's up",
    'play.done': 'Completed today',
    'play.notYet': 'Not played yet · 5 rounds, about 2 minutes',
    'play.progress': 'ROUND {n} / {total}',

    'lib.title': 'Word Library',
    'lib.lead': 'Every word on the site. Open a card for its meaning, an example, and the date it entered the archive.',
    'lib.search': 'Search a word, pinyin or tag',
    'lib.all': 'All',
    'lib.empty': 'No words match that search.',

    'arch.title': 'Archive',
    'arch.lead': 'One set per day, generated deterministically from the date — everyone sees the same five. Open a past day to revisit its words.',
    'arch.close': 'Close',
    'arch.today': 'Today',
    'arch.played': 'Completed',
    'arch.unplayed': 'Not played',

    'rank.title': 'Rankings',
    'rank.lead': 'Local board, stored in your browser. Point it at a backend to make it global (see the leaderboard API in the README).',
    'rank.today': 'Today',
    'rank.all': 'All time',
    'rank.name': 'Name',
    'rank.save': 'Save',
    'rank.me': 'You',
    'rank.empty': 'No scores yet. Play a round first.',
    'rank.anon': 'Anonymous wanderer',

    'modal.practice': 'Practice with this word',
    'modal.source': 'Collected',

    'grade.1': 'INITIATE',
    'grade.2': 'SEEKER',
    'grade.3': 'SCHOLAR',
    'grade.4': 'LOREKEEPER',
    'grade.5': 'ARCHIVIST',
    'grade.0': 'WANDERER',

    'toast.copied': 'Score copied — go post it',
    'toast.copyFail': 'Copy failed, select it manually',
    'toast.saved': 'Saved',
    'toast.reset': 'Practice finished — your daily score is untouched',
  },
};

window.t = function (key, vars) {
  const lang = window.STATE ? window.STATE.lang : 'zh';
  const table = window.I18N[lang] || window.I18N.zh;
  let s = table[key];
  if (s == null) s = (window.I18N.zh[key] != null ? window.I18N.zh[key] : key);
  if (vars) {
    for (const k in vars) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
  }
  return s;
};

/* 取双语字段：{zh, en} -> 当前语言 */
window.pick = function (obj) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  const lang = window.STATE ? window.STATE.lang : 'zh';
  return obj[lang] != null && obj[lang] !== '' ? obj[lang] : (obj.zh || obj.en || '');
};

/* ============================================================================
 * 严格单语补充词条
 * 原则：中文界面里不出现英文，英文界面里不出现中文。
 * ========================================================================== */
Object.assign(window.I18N.zh, {
  'brand.name': '词林秘典',
  'brand.issue': '第 {n} 期',
  'title.kicker': '每日热词挑战',
  'title.main': '词林秘典',
  'title.sub': '五个热词，一次机会',

  'cta.enter': '踏入试炼',
  'cta.played': '今日已完成 · 查看战绩',

  'menu.sub.play': '5 题 · 约 2 分钟',
  'menu.sub.library': '全部热词',
  'menu.sub.archive': '历史题目',
  'menu.sub.rank': '本机战绩',

  'state.done': '已完成',
  'state.todo': '未开始',

  'count.words': '{n} 个热词',
  'count.played': '已挑战 {n}',
  'count.best': '最佳 {n}',

  'quiz.progress': '第 {n} / {total} 题',
  'quiz.score': '{n} 分',
  'unit.pts': '分',
  'word.lv': '难度 {n}',
  'rank.local': '本机榜',

  'play.begin': '开 始',
  'play.lastNext': '查看战绩',
  'play.answerCorrect': '答对',
  'play.answerWrong': '答错',
  'play.answerTimeout': '超时',

  'grade.0': '迷途者',
  'grade.1': '见习者',
  'grade.2': '求索者',
  'grade.3': '博闻者',
  'grade.4': '典守者',
  'grade.5': '大典藏官',

  'result.allPerfect': '全对。今天的词你都记住了。',
  'result.tomorrow': '明天 00:00 换新题。',
  'result.practiceNote': '练习结束，今日正式成绩不受影响。',
});

Object.assign(window.I18N.en, {
  'brand.name': 'The Word Archive',
  'brand.issue': 'NO. {n}',
  'title.kicker': 'DAILY BUZZWORD QUEST',
  'title.main': 'Word Archive',
  'title.sub': 'Five words. One attempt.',

  'cta.enter': 'ENTER THE QUEST',
  'cta.played': 'COMPLETED · VIEW RESULT',

  'menu.sub.play': '5 rounds · about 2 min',
  'menu.sub.library': 'Every word',
  'menu.sub.archive': 'Past sets',
  'menu.sub.rank': 'Local board',

  'state.done': 'DONE',
  'state.todo': 'NOT PLAYED',

  'count.words': '{n} words',
  'count.played': '{n} played',
  'count.best': '{n} best',

  'quiz.progress': 'Round {n} / {total}',
  'quiz.score': '{n} pts',
  'unit.pts': 'pts',
  'word.lv': 'LV {n}',
  'rank.local': 'LOCAL',

  'play.begin': 'BEGIN',
  'play.lastNext': 'SEE RESULT',
  'play.answerCorrect': 'Correct',
  'play.answerWrong': 'Not quite',
  'play.answerTimeout': "Time's up",

  'grade.0': 'WANDERER',
  'grade.1': 'INITIATE',
  'grade.2': 'SEEKER',
  'grade.3': 'SCHOLAR',
  'grade.4': 'LOREKEEPER',
  'grade.5': 'ARCHIVIST',

  'result.allPerfect': 'Perfect. Every word stuck today.',
  'result.tomorrow': 'New set at 00:00 tomorrow.',
  'result.practiceNote': 'Practice finished — your daily score is untouched.',
});
