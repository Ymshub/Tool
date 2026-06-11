/**
 * ==========================================
 * 📌 时光倒数 (Countdown) 小组件
 *
 * ✨ 主要功能：
 * • 尺寸适配：支持 Small、Medium、Large 三种组件尺寸，区分紧凑列表与定宽多行列表排版。
 * • 节日计算：内置农历算法数组，支持计算法定节假日、民俗节日、国际节日的倒计时。
 * • 时区基准：采用 UTC+8 固定时区进行绝对时间计算。
 * • 排序与显示：支持按倒数天数及分类优先级进行排序，支持指定节日跨分类置顶。
 * • 状态响应：根据工作日、周末、节假日当天状态切换背景渐变色；当天节日提示于中大号标题栏显示。
 *
 * 🔗 引用链接: https://raw.githubusercontent.com/jnlaoshu/MySelf/master/Egern/Widget/Countdown.js
 * ⏱️ 更新时间: 2026.04.01 01:40
 * ==========================================
 */

// ── 静态常量（顶级声明，只初始化一次） ─────────────────────────────────
const Lunar = {
  info: [0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09370,0x092f0,0x0c956,0x15eaa,0x0d4a0,0x0da50,0x30abb,0x16b95,0x069d0,0x037d8,0x00dd0,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x16a95,0x06aa0,0x1a2d0,0x1b2d0,0x0aa50,0x02b60,0x0ad70,0x0bbe0,0x16ae0,0x06c40,0x0ada8,0x0b150,0x0d740,0x12f95,0x0b660,0x0b4d0,0x0d550,0x15aa0,0x046d0,0x055d4,0x12b90,0x039a0,0x0b090,0x226e0,0x0d210,0x0ab50,0x073a6,0x0ada0,0x1d2b0,0x0b540,0x0d6a0,0x0aca0,0x1d0a0,0x0d5d0,0x0d520,0x0dd50,0x156a0,0x0aea0,0x066d0,0x055b0,0x04ae8,0x0a5d0,0x045d0,0x0d2d0,0x0d150,0x16aa0,0x086e0,0x037c0,0x09970,0x009e0,0x0b4d0,0x0a4e0,0x0d4a0,0x0da50,0x05aa0,0x135a6,0x08ae0,0x08ad0,0x08170,0x07ad0,0x0a5b0,0x0a4b0,0x0aa50,0x1b12d,0x0ad50,0x0b5a0,0x06ae0,0x0ab60,0x0aae0,0x0bae0,0x0ca5d,0x0a6d0,0x0a4e0,0x0d260,0x0ea65,0x0d530,0x05aa0,0x076a3,0x096d0,0x049b0,0x04ad8,0x04970,0x064b0,0x074a6,0x0ea50,0x08a60,0x0aadf,0x02ac0,0x0ab60,0x0ade0,0x16ae0,0x01d0d,0x0d250,0x0d520,0x0dd20,0x0dd08,0x6201bd],
  term(y, n) {
    return new Date((31556925974.7 * (y - 1900)) + [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483469,504711,525927,547037,568036,588884,609393,629965,650429,670236,690151,709781,728385,746802,765189,783562,801899,819931,837546,854889,871903,888726,904917,920837,936433,951872,966674,981010][n]);
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

  const enablePrioritySort    = getBool("ENABLE_PRIORITY_SORT", true);
  const enableWeekendTheme    = getBool("ENABLE_WEEKEND_THEME", true);
  const pinnedHolidays = getStr("PINNED_HOLIDAY", "春节").split(",").map(s => s.trim()).filter(Boolean);

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
  const currentDay  = bjDate.getUTCDay();
  const todayMs = Date.UTC(Y, M - 1, D);

  const YMD = (y, m, d) => `${y}/${m < 10 ? "0" + m : m}/${d < 10 ? "0" + d : d}`;

  const formatItemStr = (name, diff) => diff <= 0 ? `今日 ${name}` : `${name} ${diff}天`;

  // ── 核心日期推演算法 ─────────────────────────────────────────────────────
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
    const wDay = (m, n, w) => {
      const f = new Date(Date.UTC(y, m - 1, 1));
      const x = w - f.getUTCDay();
      return YMD(y, m, 1 + (x < 0 ? x + 7 : x) + (n - 1) * 7);
    };

    const legal = [
      ["元旦",   YMD(y, 1, 1),  1],
      ["春节",   l2s(y, 1, 1),  3],
      ["劳动节", YMD(y, 5, 1),  1],
      ["端午节", l2s(y, 5, 5),  1],
      ["中秋节", l2s(y, 8, 15), 1],
      ["国庆节", YMD(y, 10, 1), 3]
    ];

    return {
      legal,
      folk: [
        ["元宵节", l2s(y, 1, 15), 1],
        ["龙抬头", l2s(y, 2, 2),  1],
        ["七夕节", l2s(y, 7, 7),  1],
        ["中元节", l2s(y, 7, 15), 1],
        ["重阳节", l2s(y, 9, 9),  1],
        ["寒衣节", l2s(y, 10, 1), 1],
        ["腊八节", l2s(y, 12, 8), 1],
        ["小年",   l2s(y, 12, 23), 1],
        ["除夕",   l2s(y, 12, Lunar.mDays(y, 12)), 1]
      ],
      intl: [
        ["情人节", YMD(y, 2, 14), 1],
        ["妇女节", YMD(y, 3, 8),  1],
        ["母亲节", wDay(5, 2, 0), 1],
        ["儿童节", YMD(y, 6, 1),  1],
        ["父亲节", wDay(6, 3, 0), 1],
        ["万圣节", YMD(y, 10, 31), 1],
        ["感恩节", wDay(11, 4, 4), 1],
        ["平安夜", YMD(y, 12, 24), 1],
        ["圣诞节", YMD(y, 12, 25), 1]
      ]
    };
  };

  const festCache = new Map();
  const getFestsCached = (y) => {
    if (!festCache.has(y)) festCache.set(y, getFests(y));
    return festCache.get(y);
  };

  // ── 优先级运算系统 ───────────────────────────────────────────────────────
  const basePriority    = { legal: 3, folk: 2, intl: 1 };
  const specialPriority = { 春节: 10, 国庆节: 9, 元旦: 7, 端午节: 7, 中秋节: 7, 除夕: 6 };

  const getPriority = (name, cat) => {
    if (!enablePrioritySort) return 1;
    return specialPriority[name] !== undefined ? specialPriority[name] : (basePriority[cat] ?? 1);
  };

  // ── 核心数据运算 ────────────────────────────────────────────────────────
  const result = { legal: new Map(), folk: new Map(), intl: new Map() };
  const todayFests = new Set(), pinnedMap = new Map();

  for (const y of [Y, Y + 1]) {
    const f = getFestsCached(y);
    for (const cat of Object.keys(result)) {
      const catMap = result[cat];
      for (const item of f[cat]) {
        const [name, dateStr, duration = 1] = item;
        if (!dateStr) continue;
        const [yy, mm, dd] = dateStr.split("/").map(Number);
        const diff = Math.floor((Date.UTC(yy, mm - 1, dd) - todayMs) / 86400000);

        if (diff <= 0) {
          if (diff > -duration) {
            todayFests.add(name);
            if (isSmall && !catMap.has(name)) {
              catMap.set(name, { name, diff, priority: getPriority(name, cat) + 100, cat });
            }
          }
          continue;
        }

        if (pinnedHolidays.includes(name) && diff <= 200) {
          if (!pinnedMap.has(name) || diff < pinnedMap.get(name)) pinnedMap.set(name, diff);
        }

        if (!catMap.has(name)) {
          catMap.set(name, { name, diff, priority: getPriority(name, cat), cat });
        }
      }
    }
  }

  Object.keys(result).forEach(cat => {
    result[cat] = Array.from(result[cat].values())
      .filter(i => !pinnedMap.has(i.name))
      .sort((a, b) => {
        if (a.diff !== b.diff) return a.diff - b.diff;
        return enablePrioritySort ? b.priority - a.priority : 0;
      });
  });

  const formatStr = (cat, limit) => result[cat].slice(0, limit).map(i => formatItemStr(i.name, i.diff)).join("，");

  // ── 标题���通告逻辑（中大号） ───────────────────────────────────────────────
  const todayNoticeText = todayFests.size > 0 
    ? `今日 ${Array.from(todayFests).slice(0, 2).join("·")}${todayFests.size > 2 ? "…" : ""}`
    : "";

  const stickyParts = pinnedHolidays.filter(n => pinnedMap.has(n)).map(n => `${n} ${pinnedMap.get(n)}天`);
  const stickyText  = stickyParts.length > 0 ? `🔝 ${stickyParts.join("·")}` : "";

  const themeKey = todayFests.size > 0 ? "fest"
    : (enableWeekendTheme && (currentDay === 0 || currentDay === 6)) ? "weekend" : "workday";
  const backgroundGradient = {
    type: "linear",
    colors: themeKey === "fest" ? C.bgFest : themeKey === "weekend" ? C.bgWeekend : C.bgWorkday,
    startPoint: { x: 0, y: 0 }, endPoint: { x: 1, y: 1 }
  };

  // ── UI 渲染引擎 ─────────────────────────────────────────────────────────
  const CATEGORY_CONFIG = [
    { key: "legal", label: "法定", icon: "building.columns.fill", color: C.red  },
    { key: "folk",  label: "民俗", icon: "moon.stars.fill",       color: C.gold },
    { key: "intl",  label: "国际", icon: "globe.americas.fill",   color: C.blue }
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

  const createRowFactory = (config) => (iconName, color, label, rawText) => {
    if (!rawText) return [];
    const lines = splitTextToLines(rawText, config.maxW);
    return lines.map((lineStr, idx) => ({
      type: "stack", direction: "row", alignItems: "start", gap: config.rowGap,
      children: [
        { type: "stack", direction: "row", alignItems: "center", gap: 2, width: config.lw, children: [
          mkIcon(idx === 0 ? iconName : "circle.fill", idx === 0 ? color : C.transparent, config.icz),
          mkText(idx === 0 ? label : " ", config.fz, "heavy", idx === 0 ? color : C.transparent)
        ]},
        mkText(lineStr, config.fz, "medium", C.sub, { flex: 1, maxLines: 1 })
      ]
    }));
  };

  // ── Small 尺寸渲染 ───────────────────────────────────────────────────────
  if (isSmall) {
    const pinnedNames = pinnedHolidays.filter(n => pinnedMap.has(n));
    const smallRows = CATEGORY_CONFIG.map(cfg => {
      const fests = result[cfg.key].filter(i => !pinnedNames.includes(i.name)).slice(0, 2);
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

  for (const cfg of CATEGORY_CONFIG) {
    const limit   = isLarge ? 7 : 3;
    const rawText = formatStr(cfg.key, limit);
    if (!rawText) continue;
    gridRows.push(...buildRows(cfg.icon, cfg.color, cfg.label, rawText));
  }

  // ── 构建标题栏右侧元素 ────────────────────────────────────────────────────
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
