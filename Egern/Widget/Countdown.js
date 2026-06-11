/**
 * ==========================================
 * 📌 时光倒数 (Countdown) 小组件
 *
 * ✨ 主要功能：
 * • 尺寸适配：支持 Small、Medium、Large 三种组件尺寸，区分紧凑列表与定宽多行列表排版。
 * • 节日计算：内置农历算法数组，支持计算法定节假日、民俗节日、国际节日的倒计时。
 * • 时区基准：采用 UTC+8 固定时区进行绝对时间计算。
 * • 排序与显示：支持按倒数天数及分类优先级进行排序，支持指定节日跨分类置顶。
 * • 状态响应：根据工作日、周末、节假日当天状态切换背景渐变色；当天节日提示于中大号标题栏显示，小号于分类行内显示。
 *
 * 🔗 引用链接: https://raw.githubusercontent.com/jnlaoshu/MySelf/master/Egern/Widget/Countdown.js
 * ⏱️ 更新时间: 2026.04.01 01:40
 * ==========================================
 */

// ── 静态常量（顶级声明，只初始化一次） ─────────────────────────────────
const Lunar = {
  info: [0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x16c96,0x0b544,0x0d4a8,0x0c740,0x0cba5,0x09b4f,0x0c8a6,0x0d760,0x0d5a6,0x1b5a4,0x0ada8,0x06d5d,0x06958,0x0a6ff,0x0adab,0x05d4e,0x04d4a,0x0a4d0,0x0d044,0x8152b,0x08aa0,0x15ac9,0x08a60,0x04aea,0x0a6d0,0x05ae0,0x0a4e6,0x0a4e4,0x1d5a2,0x0d150,0x08d7f,0x0b2c6,0x0ae6e,0x07ad9,0x069d0,0x16bed,0x0aaec,0x0054d,0x04ba0,0x1a559,0x054b8,0x09bae,0x056a0,0x0b5a3,0x06904,0x06e19,0x0a573,0x06e47,0x0d5a6,0x055d4,0x05d25,0x049b0,0x159aa,0x06aa0,0x0a6d0,0x14dad,0x05b63,0x095bf,0x07c97,0x0d4c2,0x0d559,0x05b45,0x06d63,0x0aaf8,0x06985,0x5d69a,0x0b57c,0x06c60,0x0d954,0x49b0f,0x0a4ad,0x0a4ae,0x1d0a6,0x0d25d,0x14957,0x052b0,0x0a6e6,0x0ad0e,0x159e2,0x06aa0,0x0d5d4,0x0ad83,0x049ba,0x159aa,0x05b25,0x0ba32,0x0b6a1,0x16e93,0x06c96,0x092e0,0x0c940,0x13d8a,0x08acc,0x0caad,0x055d0,0x05ba3,0x0a5b0,0x15665,0x069d0,0x0d4bb,0x4adba,0x04b63,0x095b8,0x07ad9,0x06aa7,0x06ed0,0x15cd5,0x40ada,0x04d4a,0x08d65,0x08650,0x5aa58,0x0b55b,0x056c0,0x15d98,0x069d0,0x0aacf,0x06c60,0x0d400,0x0c86e,0x09e95,0x055c0,0x0ab50,0x0aae8,0x1b6a8,0x069b0,0x0a6c6,0x09ad0,0x14ae6,0x04ae0,0x0a4e6,0x0d260,0x0ea65,0x056a0,0x05ae9,0x056d4,0x05d04,0x06c48,0x7aaa8,0x0ab60,0x0abc7,0x092e0,0x0cab5,0x0a950,0x06b20,0x0ad56,0x055c0,0x0baa8,0x0b5a0,0x15ac9,0x0abae,0x0a5c0,0x05da9,0x0d5b0,0x05b55,0x056a0,0x0a6d0,0x091e3,0x06c65,0x0aa50,0x06b58,0x069c0,0x0d4a3,0x0d4a8,0x1d5a5,0x0a5c0,0x14a10,0x06d8c,0x0ab60,0x0aae4,0x0a4d0,0x0d150,0x08d7f,0x0b2c6,0x0ad50,0x055d9,0x069d0,0x0a4d0,0x14d4a,0x0a4d0,0x0c935,0x12caa,0x0aab0,0x06aa0,0x16aa6,0x0aea6,0x07ad0,0x08d62,0x0d9b5,0x0cab5,0x06a50,0x06d40,0x6ada0,0x0a6d0,0x0dda0,0x16aa9,0x0adad,0x0055c,0x04ba0,0x0a5b0,0x15ac9,0x0acb0,0x069d0,0x0aaed,0x06c60,0x0aea6,0x0ab63,0x069c0,0x15d97,0x092e0,0x0d4a3,0x0d4a8,0x1d5a2,0x0d5c0,0x16cab,0x0adab,0x055d0,0x05ba8,0x06aa0,0x15ad5,0x04b63,0x0a573,0x069d0,0x0d159],
  term(y, n) {
    return new Date((31556925974.7 * (y - 1900)) + [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483469,504711,525927,547037,568036,588913,609506,630020,650916,671626,692596,713359,734008,754553,774997,795467,815833,836837,857671,878372,899197,920057,940829,961314,981913,1002632,1023159,1043788][n] * 60000);
  },
  lDays(y) {
    let s = 348;
    for (let i = 0x8000; i > 0x8; i >>= 1) s += (this.info[y - 1900] & i) ? 1 : 0;
    return s + ((this.info[y - 1900] & 0xf) ? ((this.info[y - 1900] & 0x10000) ? 30 : 29) : 0);
  },
  mDays(y, m) { return (this.info[y - 1900] & (0x10000 >> m)) ? 30 : 29; }
};

// ── 累计天数预计算缓存 ───────────────────────────────────────────────────
let lunarCumulativeCache = null;
function ensureLunarCumulative(maxYear) {
  if (lunarCumulativeCache && lunarCumulativeCache.maxYear >= maxYear) return;
  lunarCumulativeCache = { maxYear, off: new Map() };
  let off = 0;
  for (let i = 1900; i <= maxYear; i++) {
    lunarCumulativeCache.off.set(i, off);
    off += Lunar.lDays(i);
  }
}

export default async function (ctx) {
  const env = ctx.env ?? {};

  // ── 环境变量解析 ────────────────────────────────────────────────────────
  const getBool = (key, defaultVal = true) => {
    const v = env[key];
    if (v === undefined || v === null || String(v).trim() === "") return defaultVal;
    return String(v).trim().toLowerCase() !== "false";
  };
  const getStr = (key, defaultVal = "") => String(env[key] ?? defaultVal).trim();

  const showFinanceDates      = getBool("SHOW_FINANCE_DATES", true);
  const enablePrioritySort    = getBool("ENABLE_PRIORITY_SORT", true);
  const enableWeekendTheme    = getBool("ENABLE_WEEKEND_THEME", true);

  const qingmingDateStr = getStr("QINGMING_DATE", "4/4");

  // ── 尺寸与色彩系统 ───────────────────────────────────────────────────────
  const family  = (ctx.widgetFamily || "systemMedium").toLowerCase();
  const isSmall = family.includes("small");
  const isLarge = family.includes("large");

  const C = {
    bgWorkday:   [{ light: '#FFFFFF', dark: '#1C1C1E' }, { light: '#F2F2F7', dark: '#0C0C0E' }],
    bgWeekend:   [{ light: '#F4F8FF', dark: '#111827' }, { light: '#E6F2FF', dark: '#0B0F19' }],
    bgFest:      [{ light: '#FFF8EC', dark: '#2A1F0E' }, { light: '#FFEFD5', dark: '#1A1208' }],
    main:        { light: '#1C1C1E', dark: '#FFFFFF'  },
    sub:         { light: '#48484A', dark: '#D1D1D6'  },
    muted:       { light: '#8E8E93', dark: '#8E8E93'  },
    gold:        { light: '#B58A28', dark: '#D6A53A'  },
    red:         { light: '#CA3B32', dark: '#FF453A'  },
    blue:        { light: '#3A5F85', dark: '#5E8EB8'  },
    teal:        { light: '#628C7B', dark: '#73A491'  },
    transparent: '#00000000'
  };

  // ── UI 构建器 ──────────────────────────────────────────────────────────
  const mkText   = (text, size, weight, color, opts = {}) => ({ type: "text", text: String(text ?? ""), font: { size, weight }, textColor: color, ...opts });
  const mkRow    = (children, gap = 4, opts = {}) => ({ type: "stack", direction: "row", alignItems: "center", gap, children, ...opts });
  const mkIcon   = (src, color, size = 13) => ({ type: "image", src: `sf-symbol:${src}`, color, width: size, height: size });
  const mkSpacer = (length) => length != null ? { type: "spacer", length } : { type: "spacer" };

  // ── 绝对时区计算 (UTC+8) ─────────────────────────────────────────────────
  const bjDate = new Date(Date.now() + 8 * 3600000);
  const Y = bjDate.getUTCFullYear();
  const M = bjDate.getUTCMonth() + 1;
  const D = bjDate.getUTCDate();
  const currentHour = bjDate.getUTCHours();
  const currentDay  = bjDate.getUTCDay();
  const todayMs = Date.UTC(Y, M - 1, D);

  const YMD = (y, m, d) => `${y}/${m < 10 ? "0" + m : m}/${d < 10 ? "0" + d : d}`;

  const formatItemStr = (name, diff) => diff <= 0 ? `今日 ${name}` : `${name} ${diff}天`;

  // ── 核心日期推演算法 ─────────────────────────────────────────────────────
  const getFinanceDate = (y, monthIndex, nth, targetDow) => {
    const firstDow = new Date(Date.UTC(y, monthIndex, 1)).getUTCDay();
    let diff = targetDow - firstDow;
    if (diff < 0) diff += 7;
    return Date.UTC(y, monthIndex, 1 + diff + (nth - 1) * 7);
  };

  const nextFinanceDate = (nth, dow) => {
    let d = getFinanceDate(Y, M - 1, nth, dow);
    if (todayMs > d) {
      const nextMonthIdx = M === 12 ? 0 : M;
      const nextYear     = M === 12 ? Y + 1 : Y;
      d = getFinanceDate(nextYear, nextMonthIdx, nth, dow);
    }
    return d;
  };

  const getCustomDate = (y, dateStr, fallbackFn) => {
    if (!dateStr || typeof dateStr !== 'string') return fallbackFn ? fallbackFn() : null;
    const parts = dateStr.split("/");
    if (parts.length !== 2) return fallbackFn ? fallbackFn() : null;
    const m = Number(parts[0]), d = Number(parts[1]);
    if (!m || !d || m > 12 || d > 31) return fallbackFn ? fallbackFn() : null;
    return YMD(y, m, d);
  };

  const l2s = (y, m, d) => {
    ensureLunarCumulative(y + 1);
    let off = (lunarCumulativeCache.off.get(y) ?? 0);
    const lp = Lunar.info[y - 1900] & 0xf;
    for (let i = 1; i < m; i++) {
      off += Lunar.mDays(y, i);
      if (lp > 0 && i === lp) off += (Lunar.info[y - 1900] & 0x10000) ? 30 : 29;
    }
    const date = new Date(Date.UTC(1900, 0, 31) + (off + d - 1) * 86400000);
    return YMD(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  };

  const getFests = (y) => {
    const term = n => {
      const t = Lunar.term(y, n);
      const bjT = new Date(t.getTime() + 8 * 3600000);
      return YMD(bjT.getUTCFullYear(), bjT.getUTCMonth() + 1, bjT.getUTCDate());
    };
    const wDay = (m, n, w) => {
      const f = new Date(Date.UTC(y, m - 1, 1));
      const x = w - f.getUTCDay();
      return YMD(y, m, 1 + (x < 0 ? x + 7 : x) + (n - 1) * 7);
    };

    const qmDateStr = getCustomDate(y, qingmingDateStr, () => term(7));

    const legal = [
      ["元旦",   YMD(y, 1, 1),  1], ["春节",   l2s(y, 1, 1),  3],
      ["清明节", qmDateStr,     1],
      ["劳动节", YMD(y, 5, 1),  1], ["端午节", l2s(y, 5, 5),  1],
      ["中秋节", l2s(y, 8, 15), 1], ["国庆节", YMD(y, 10, 1), 3]
    ];

    return {
      legal,
      folk: [
        ["元宵节", l2s(y, 1, 15), 1], ["龙抬头", l2s(y, 2, 2),  1], ["七夕节", l2s(y, 7, 7),  1],
        ["中元节", l2s(y, 7, 15), 1], ["重阳节", l2s(y, 9, 9),  1], ["寒衣节", l2s(y, 10, 1), 1],
        ["腊八节", l2s(y, 12, 8), 1], ["小年",   l2s(y, 12, 23), 1], ["除夕",   l2s(y, 12, Lunar.mDays(y, 12)), 1]
      ],
      intl: [
        ["情人节", YMD(y, 2, 14), 1], ["妇女节", YMD(y, 3, 8),  1], ["母亲节", wDay(5, 2, 0), 1],
        ["儿童节", YMD(y, 6, 1),  1], ["父亲节", wDay(6, 3, 0), 1], ["万圣节", YMD(y, 10, 31),1],
        ["感恩节", wDay(11, 4, 4),1], ["平安夜", YMD(y, 12, 24),1], ["圣诞节", YMD(y, 12, 25),1]
      ],
    };
  };

  const festCache = new Map();
  const getFestsCached = (y) => {
    if (!festCache.has(y)) festCache.set(y, getFests(y));
    return festCache.get(y);
  };

  // ── 优先级运算系统 ───────────────────────────────────────────────────────
  const basePriority    = { legal: 3, folk: 2, intl: 1, exclusive: 2 };
  const specialPriority = { 春节: 10, 国庆节: 9, 元旦: 7, 清明节: 7, 端午节: 7, 中秋节: 7, 春假: 6, 秋假: 6, 除夕: 6 };

  const getPriority = (name, cat, sourceKind) => {
    if (!enablePrioritySort) return 1;
    return specialPriority[name] !== undefined ? specialPriority[name] : (basePriority[cat] ?? 1);
  };

  // ── 初始化数据集合 ──────────────────────────────────────────────────────
  const todayFests = new Set();      // 今日节日集合
  const todayFinance = new Set();    // 今日金融日期（预留）
  const stickyParts = [];            // 置顶显示的节日
  const pinnedNames = new Set(["春节", "国庆节"]); // 需要置顶的节日名称

  // ── 核心数据运算 ────────────────────────────────────────────────────────
  const result = { legal: new Map(), folk: new Map(), intl: new Map(), exclusive: new Map() };

  for (const y of [Y, Y + 1]) {
    const f = getFestsCached(y);
    for (const cat of Object.keys(result)) {
      const catMap = result[cat];
      if (!f[cat]) continue;
      for (const item of f[cat]) {
        const [name, dateStr, duration = 1, sourceKind = ""] = item;
        if (!dateStr) continue;
        const [yy, mm, dd] = dateStr.split("/").map(Number);
        const diff = Math.floor((Date.UTC(yy, mm - 1, dd) - todayMs) / 86400000);

        if (diff <= 0) {
          if (diff > -duration) {
            todayFests.add(name);
            if (isSmall && !catMap.has(name)) {
              catMap.set(name, { name, diff, priority: getPriority(name, cat, sourceKind) + 100, cat });
            }
          }
          continue;
        }

        if (!catMap.has(name)) {
          catMap.set(name, { name, diff, priority: getPriority(name, cat, sourceKind), cat });
        }
      }
    }
  }

  // ── 数据处理与排序 ──────────────────────────────────────────────────────
  const allFests = [];
  for (const cat of Object.keys(result)) {
    for (const item of result[cat].values()) {
      allFests.push(item);
    }
  }

  // 按优先级高低排序，优先级相同按天数从少到多排序
  allFests.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.diff - b.diff;
  });

  // 提取置顶节日（优先级 >= 100 的当天节日，且在置顶列表中）
  for (const item of allFests) {
    if (item.priority >= 100 && pinnedNames.has(item.name)) {
      stickyParts.push(item.name);
    }
  }

  // ── 标题栏通告逻辑（中大号） ───────────────────────────────────────────────
  const todayNoticeParts = [];
  if (todayFests.size > 0) todayNoticeParts.push(`今日 ${Array.from(todayFests).join("·")}`);
  const todayNoticeText = todayNoticeParts.join(" ｜ ");

  const stickyText  = stickyParts.length > 0 ? `🔝 ${stickyParts.join("·")}` : "";

  const themeKey = (todayFests.size > 0 || todayFinance.size > 0) ? "fest"
    : (enableWeekendTheme && (currentDay === 0 || currentDay === 6)) ? "weekend" : "workday";
  const backgroundGradient = {
    type: "linear",
    colors: themeKey === "fest" ? C.bgFest : themeKey === "weekend" ? C.bgWeekend : C.bgWorkday,
    startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 }
  };

  // ── UI 渲染引擎 ─────────────────────────────────────────────────────────
  const CATEGORY_CONFIG = [
    { key: "legal",     label: "法定", icon: "building.columns.fill", color: C.red  },
    { key: "folk",      label: "民俗", icon: "moon.stars.fill",       color: C.gold },
    { key: "intl",      label: "国际", icon: "globe.americas.fill",   color: C.blue },
  ];

  const splitTextToLines = (str, maxW) => {
    if (!str) return [];
    let lines = [], line = "", w = 0;
    for (const token of (str.match(/[\d\/a-zA-Z.\-]+|./gu) || [])) {
      const tw = [...token].reduce((s, c) => s + (c.charCodeAt(0) > 255 ? 2 : 1.1), 0);
      if (w + tw > maxW) {
        lines.push(line.replace(/^[，\s]+|[，\s]+$/g, ""));
        line = token; w = tw;
      } else { line += token; w += tw; }
    }
    if (line) lines.push(line.replace(/^[，\s]+|[，\s]+$/g, ""));
    return lines;
  };

  const createRowFactory = (config) => (iconName, color, label, rawText, isAlert) => {
    if (!rawText) return [];
    const lines = splitTextToLines(rawText, config.maxW);
    return lines.map((lineStr, idx) => ({
      type: "stack", direction: "row", alignItems: "start", gap: config.rowGap,
      children: [
        { type: "stack", direction: "row", alignItems: "center", gap: 2, width: config.lw, children: [
          mkIcon(idx === 0 ? iconName : "circle.fill", idx === 0 ? color : C.transparent, config.icz),
          mkText(idx === 0 ? label : " ", config.fz, "heavy", idx === 0 ? color : C.transparent)
        ]},
        { type: "text", text: lineStr, font: { size: config.fz, weight: "medium" }, textColor: C.main, flex: 1 }
      ]
    }));
  };

  // ── Small 尺寸渲染 ───────────────────────────────────────────────────────
  if (isSmall) {
    const smallRows = CATEGORY_CONFIG.map(cfg => {
      const fests = Array.from(result[cfg.key].values())
        .filter(i => !pinnedNames.has(i.name) || i.priority < 100)
        .sort((a, b) => b.priority - a.priority || a.diff - b.diff)
        .slice(0, 2);
      if (fests.length === 0) return null;
      return mkRow([
        mkIcon(cfg.icon, cfg.color, 13),
        mkText(fests.map(i => formatItemStr(i.name, i.diff)).join("，"), 12, "medium", cfg.color, { flex: 1, maxLines: 1 })
      ], 6);
    }).filter(Boolean);

    return {
      type: "widget", padding: 14, backgroundGradient,
      children: [
        mkRow([
          mkIcon("hourglass.circle.fill", C.main, 16),
          mkText("时光\n倒数", 14, "heavy", C.main, { maxLines: 2 }),
          mkSpacer(),
          ...(stickyParts.length > 0 ? [mkText(`🔝 ${stickyParts[0]}`, 11, "bold", C.red, { maxLines: 1 })] : [])
        ], 6),
        mkSpacer(10),
        { type: "stack", direction: "column", gap: 8, flex: 1, children: smallRows }
      ]
    };
  }

  // ── Medium & Large 尺寸渲染 ─────────────────────────────────────────────
  const layoutConfig = {
    fz: isLarge ? 14 : 12, icz: isLarge ? 15 : 13, lw: isLarge ? 60 : 52, maxW: isLarge ? 36 : 45,
    rowGap: isLarge ? 6 : 4, titleFz: isLarge ? 17 : 15, titleIcz: isLarge ? 18 : 16, topFz: isLarge ? 12 : 11.5
  };

  const buildRows = createRowFactory(layoutConfig);
  let gridRows = [];

  // 为每个分类构建行数据
  for (const cfg of CATEGORY_CONFIG) {
    const fests = Array.from(result[cfg.key].values())
      .filter(i => !pinnedNames.has(i.name) || i.priority < 100)  // 排除置顶项
      .sort((a, b) => b.priority - a.priority || a.diff - b.diff)
      .slice(0, isLarge ? 7 : 3);

    if (fests.length === 0) continue;

    for (const fest of fests) {
      const text = formatItemStr(fest.name, fest.diff);
      const rows = buildRows(cfg.icon, cfg.color, cfg.label, text, false);
      gridRows.push(...rows);
    }
  }

  // ── 构建标题栏右侧元素 (保留 sparkles 图标) ──────────────────────────────
  const rightHeaderElements = [];
  if (todayNoticeText) {
    rightHeaderElements.push(mkIcon("sparkles", C.red, layoutConfig.topFz));
    rightHeaderElements.push(mkText(todayNoticeText, layoutConfig.topFz, "bold", C.red));
  }
  if (stickyText) {
    if (todayNoticeText) rightHeaderElements.push(mkText(" ｜ ", layoutConfig.topFz, "bold", C.red));
    rightHeaderElements.push(mkText(stickyText, layoutConfig.topFz, "bold", C.red));
  }

  return {
    type: "widget", padding: isLarge ? 16 : 12, backgroundGradient,
    children: [
      mkRow([
        mkIcon("hourglass.circle.fill", C.main, layoutConfig.titleIcz),
        mkText("时光倒数", layoutConfig.titleFz, "heavy", C.main),
        mkSpacer(),
        ...(rightHeaderElements.length > 0 ? [mkRow(rightHeaderElements, 4)] : [])
      ], 6),
      mkSpacer(gridRows.length <= 4 ? 12 : 10),
      ...(gridRows.length > 0
        ? [{ type: "stack", direction: "column", alignItems: "start", gap: gridRows.length <= 4 ? (isLarge ? 14 : 11) : (isLarge ? 10 : 8), children: gridRows }]
        : [mkText("近期暂无倒计时", layoutConfig.fz, "medium", C.muted)]),
      mkSpacer()
    ]
  };
}
