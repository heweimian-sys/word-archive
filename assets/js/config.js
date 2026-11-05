/* ============================================================================
 * config.js — 站点级配置
 * 换站时主要改这一个文件：站点名、域名、lang、榜单接口、广告位。
 * ========================================================================== */
window.SITE_CONFIG = {
  // 品牌
  brand: {
    en: 'The Word Archive',
    zh: '词林秘典',
    tagline: {
      en: 'Daily Buzzword Quest',
      zh: '每日热词挑战',
    },
  },

  // 上线后改成真实域名（影响 canonical / share / OG）
  // 上线前必须替换为你已购买并绑定的真实 HTTPS 域名
  origin: 'https://heweimian-sys.github.io/word-archive/',

  // 默认语言：zh | en
  defaultLang: 'zh',

  // 每日题目：一天几题、每题多少秒
  game: {
    roundsPerDay: 5,
    seconds: 25,
    baseScore: 100,
    timeBonusMax: 50,
    streakBonusStep: 15,
    streakBonusMax: 60,
    seedVersion: 'v1', // 改题目池结构时加一，历史成绩不受影响
  },

  // 榜单：留空 = 只用 localStorage 本机榜；填了就走 HTTP
  // 期望接口：
  //   GET  {leaderboardUrl}?scope=today|all  -> { items: [{name, score, round, at}] }
  //   POST {leaderboardUrl}  body {name, score, round, date, scope} -> { ok: true, rank?: number }
  leaderboardUrl: '',
  archiveManifestUrl: '', // 可选：预生成的往期索引 { items: [{date, words:[id...]}] }

  // 广告位：AdSense / Adsterra / Monetag 的 script 或 iframe
  // 填了 slotScript 就会替换占位块；留空则是静态占位，不影响体验
  ads: {
    enabled: false,
    slots: {
      result:  { placeholder: 'AD · RESULT PAGE', script: '' },
      library: { placeholder: 'AD · WORD LIBRARY', script: '' },
    },
  },

  // 分享文案模板
  share: {
    url: '', // 留空 = 当前页面
    template: {
      zh: (r) => `词林秘典 · ${r.date}\n${r.cells}\n${r.hits}/${r.total} · ${r.score} 分\n${r.url}`,
      en: (r) => `The Word Archive · ${r.date}\n${r.cells}\n${r.hits}/${r.total} · ${r.score} pts\n${r.url}`,
    },
  },
};
