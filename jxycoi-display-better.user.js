// ==UserScript==
// @name         JXYCOI Display Better
// @namespace    https://www.jxycoi.cn/
// @version      1.1.0
// @description  育才信奥界面美化脚本：支持洛谷主题导入/导出、自制主题、背景模糊与卡片透明度、图片设置、去除首页图片、卡片化、彩蛋主题
// @author       zhanjinghan
// @icon         https://cdn.jxycoi.cn/dist/favicon.ico
// @match        https://www.jxycoi.cn/*
// @match        http://www.jxycoi.cn/*
// @match        https://jxycoi.cn/*
// @match        http://jxycoi.cn/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  /* ============================================================
   * 默认配置
   * ============================================================ */
  const DEFAULT_CONFIG = {
    enabled: true,             // 总开关
    themeName: '洛谷经典蓝',   // 当前主题名

    // ---- 洛谷主题原始数据（导入时完整保留，可加字段不可少字段）----
    luoguTheme: null,          // 原始洛谷主题 JSON（lNavi/lBody/dNavi/dBody...）
    luoguExtra: {},            // 扩展字段（name/author/css 等）

    // ---- 颜色 ----
    dark: false,               // 暗色模式
    primary: '#3498db',        // 主色
    primaryHover: '#2980b9',   // 主色 hover
    bgColor: '#f0f2f5',        // 页面背景色
    naviBack: '#ffffff',       // 导航背景
    naviFore: '#333333',       // 导航前景
    navbarColor: '#ffffff',    // 导航背景（旧格式兼容别名）
    textColor: '#1f2733',      // 正文颜色
    secondaryColor: '#6b7280', // 次要文字颜色
    cardColor: '#ffffff',      // 卡片底色

    // ---- 背景图片设置（以洛谷 midOpts 为标准）----
    bgImage: '',               // 背景图片 URL（留空则纯色）
    bgPosX: 50,                // 图片位置 X（0-100 %）
    bgPosY: 0,                 // 图片位置 Y（0-100 %）
    bgSize: 'cover',           // 图片尺寸：auto 自动 / cover 填充 / contain 适应 / custom 自定义
    bgSizeCustom: '',          // 自定义尺寸，如 "100% 100%" 或 "800px 600px"
    bgRepeat: 'no-repeat',     // 图片重复：no-repeat 不重复 / repeat 全部 / repeat-x 横向 / repeat-y 纵向
    bgBrightness: 0,           // 亮度（-100 ~ 100）
    bgDegree: 0,               // 旋转角度（0 ~ 360）

    // ---- 效果 ----
    blur: 12,                  // 背景模糊度 px (0-40)
    opacity: 0.86,             // 卡片透明度 0-1（0=完全透明，1=不透明）
    radius: 10,                // 卡片圆角 px
    shadow: true,              // 卡片阴影

    // ---- 功能开关 ----
    hideHomeImages: false,     // 去除首页图片（轮播/公告大图）
    cardMode: true,            // 卡片化（做题页面自动豁免）

    customCSS: ''              // 用户自定义 CSS
  };

  /* ============================================================
   * 预设主题库（洛谷风格）
   * ============================================================ */
  const PRESET_THEMES = {
    '洛谷经典蓝': {
      primary: '#3498db', primaryHover: '#2980b9',
      bgColor: '#f0f2f5', bgImage: '', blur: 12, opacity: 0.86,
      radius: 10, textColor: '#1f2733', secondaryColor: '#6b7280',
      cardColor: '#ffffff', naviBack: '#ffffff', naviFore: '#333333',
      navbarColor: '#ffffff', dark: false, shadow: true,
      bgSize: 'cover', bgRepeat: 'no-repeat', bgPosX: 50, bgPosY: 0
    },
    '洛谷翠绿': {
      primary: '#27ae60', primaryHover: '#1e8449',
      bgColor: '#f0f4f2', bgImage: '', blur: 14, opacity: 0.87,
      radius: 12, textColor: '#1f2733', secondaryColor: '#5f7a6e',
      cardColor: '#ffffff', naviBack: '#ffffff', naviFore: '#2c3e2f',
      navbarColor: '#ffffff', dark: false, shadow: true,
      bgSize: 'cover', bgRepeat: 'no-repeat', bgPosX: 50, bgPosY: 0
    },
    '洛谷暮紫': {
      primary: '#8e44ad', primaryHover: '#732d91',
      bgColor: '#f3eff6', bgImage: '', blur: 16, opacity: 0.85,
      radius: 14, textColor: '#2c2433', secondaryColor: '#7a6b8a',
      cardColor: '#ffffff', naviBack: '#ffffff', naviFore: '#3a2f40',
      navbarColor: '#ffffff', dark: false, shadow: true,
      bgSize: 'cover', bgRepeat: 'no-repeat', bgPosX: 50, bgPosY: 0
    },
    '洛谷暗夜': {
      primary: '#61afef', primaryHover: '#4a9be0',
      bgColor: '#1a1f2b', bgImage: '', blur: 10, opacity: 0.92,
      radius: 10, textColor: '#d8dee9', secondaryColor: '#9aa5b8',
      cardColor: '#232a38', naviBack: '#1e2530', naviFore: '#d8dee9',
      navbarColor: '#1e2530', dark: true, shadow: false,
      bgSize: 'cover', bgRepeat: 'no-repeat', bgPosX: 50, bgPosY: 0
    },
    '毛玻璃亚克力': {
      primary: '#5b8def', primaryHover: '#4a76d6',
      bgColor: '#eef2fb', bgImage: '', blur: 22, opacity: 0.55,
      radius: 16, textColor: '#1f2733', secondaryColor: '#6b7280',
      cardColor: '#ffffff', naviBack: '#ffffff', naviFore: '#333333',
      navbarColor: '#ffffff', dark: false, shadow: false,
      bgSize: 'cover', bgRepeat: 'no-repeat', bgPosX: 50, bgPosY: 0
    }
  };

  /* ============================================================
   * 彩蛋主题（艾莲·乔）
   * ============================================================ */
  const EASTER_EGG_TRIGGERS = ['艾莲', '艾莲乔', '艾莲·乔', '默认'];
  const EASTER_EGG_THEME = {
    name: '艾莲·乔',
    enabled: true,
    dark: false,
    primary: '#3498db',
    primaryHover: '#2980b9',
    bgColor: '#f0f2f5',
    bgImage: 'https://cdn.luogu.com.cn/upload/image_hosting/h54trnl1.webp',
    blur: 0,
    opacity: 0,
    radius: 10,
    textColor: '#1f2733',
    secondaryColor: '#6b7280',
    cardColor: '#ffffff',
    navbarColor: '#ffffff',
    shadow: true,
    customCSS: `/* ===== 1. 默认给所有文字加白色描边 ===== */
html body * {
    text-shadow:
        0.5px 0.5px 0 #fff,
        -0.5px 0.5px 0 #fff,
        0.5px -0.5px 0 #fff,
        -0.5px -0.5px 0 #fff,
        0 0 4px rgba(255, 255, 255, 0.9) !important;
}

/* ===== 2. 排除所有本身就是白色文字的区域 ===== */
/* 代码块、表单控件 */
html body pre,
html body pre *,
html body code,
html body code *,
html body kbd,
html body kbd *,
html body samp,
html body samp *,
html body button,
html body button *,
html body input,
html body input *,
html body textarea,
html body textarea *,
html body select,
html body select *,

/* Element UI 标签（难度「简单/中等/困难」等，彩底白字） */
html body .el-tag,
html body .el-tag *,
html body [class*="el-tag--"],
html body [class*="el-tag--"] *,

/* 下拉导航（你网站里 .subNav 内是白字） */
html body .subNav,
html body .subNav *,
html body .subNav a,

/* 顶栏 / 导航 / 页脚 —— 通常是深色背景白字 */
html body .navbar,
html body .navbar *,
html body .top-navbar,
html body .top-navbar *,
html body header,
html body header *,
html body nav,
html body nav *,
html body .footer,
html body .footer *,

/* 按钮、标签、徽章、主色元素 */
html body .btn,
html body .btn *,
html body .tag,
html body .tag *,
html body .badge,
html body .badge *,
html body .label,
html body .label *,
html body [class*="primary"],
html body [class*="primary"] *,
html body [class*="button"],
html body [class*="button"] *,

/* 难度标签（洛谷风格：彩色底 + 白字） */
html body .difficulty,
html body .difficulty *,
html body .problem-difficulty,
html body .problem-difficulty *,
html body [class*="difficulty"],
html body [class*="difficulty"] *,
html body [class*="Difficulty"],
html body [class*="Difficulty"] *,
html body .lg-fg-red,
html body .lg-fg-orange,
html body .lg-fg-yellow,
html body .lg-fg-green,
html body .lg-fg-blue,
html body .lg-fg-purple,
html body .lg-fg-black,
html body .lg-fg-gray,
html body [class*="lg-fg-"],
html body [class*="lg-fg-"] *,

/* 状态标签（AC/WA/TLE 等） */
html body .status,
html body .status *,
html body [class*="status"],
html body [class*="status"] *,
html body .result,
html body .result *,
html body [class*="result"],
html body [class*="result"] *,
html body .verdict,
html body .verdict *,

/* 弹窗、下拉菜单、提示框 */
html body .modal,
html body .modal *,
html body .dropdown,
html body .dropdown *,
html body .menu,
html body .menu *,
html body .toast,
html body .toast *,
html body .alert,
html body .alert *,
html body .notification,
html body .notification *,

/* 分页、选项卡 */
html body .pagination,
html body .pagination *,
html body .tab,
html body .tab *,

/* 暗色/黑色背景容器 */
html body [class*="dark"],
html body [class*="dark"] *,
html body [class*="black"],
html body [class*="black"] *,
html body [class*="white-text"],
html body [class*="white-text"] * {
    text-shadow: none !important;
}

/* ===== 3. 选中文字时不要白边 ===== */
html body *::selection {
    text-shadow: none !important;
}
html body *::-moz-selection {
    text-shadow: none !important;
}`
  };

  /* ============================================================
   * 存储封装（优先 GM，回退 localStorage）
   * ============================================================ */
  const STORE_KEY = 'jxycoi_display_better_config';
  function loadConfig() {
    let raw = null;
    try { raw = GM_getValue(STORE_KEY, null); } catch (e) { /* ignore */ }
    if (raw == null) {
      try { raw = localStorage.getItem(STORE_KEY); } catch (e) { /* ignore */ }
    }
    if (!raw) return Object.assign({}, DEFAULT_CONFIG);
    try {
      const parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_CONFIG, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULT_CONFIG);
    }
  }
  function saveConfig(cfg) {
    const raw = JSON.stringify(cfg);
    try { GM_setValue(STORE_KEY, raw); } catch (e) { /* ignore */ }
    try { localStorage.setItem(STORE_KEY, raw); } catch (e) { /* ignore */ }
  }

  let config = loadConfig();

  /* ============================================================
   * 颜色工具
   * ============================================================ */
  function hexToRgb(hex) {
    let h = String(hex || '').trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6) return { r: 255, g: 255, b: 255 };
    const n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgba(hex, alpha) {
    const c = hexToRgb(hex);
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
  }
  function darken(hex, amt) {
    const c = hexToRgb(hex);
    const f = v => Math.max(0, Math.round(v * (1 - amt)));
    return `rgb(${f(c.r)}, ${f(c.g)}, ${f(c.b)})`;
  }
  function clampNum(v, min, max, def) {
    const n = Number(v);
    if (Number.isNaN(n)) return def;
    return Math.min(max, Math.max(min, n));
  }

  /* ============================================================
   * 样式生成
   * ============================================================ */
  // 卡片化选择器：几乎所有区域视为卡片（导航、班级内导航/课程/训练/排名、训练/排名/题单、团队内部）
  const CARD_SELECTORS = [
    '.card-container', '.card', '.panel', '.module-card',
    '[class*="card"]', '[class*="Card"]',
    '.top-navbar', 'header', 'nav', '.navbar',
    '[class*="nav"]', '[class*="Nav"]',
    'table', '.table', '[class*="table"]', '[class*="Table"]',
    'main > div', '[class*="content"]', '[class*="main"]'
  ].join(',\n');

  // 做题页面（纯白，不做卡片化）——按 URL 判断
  function isSolvingPage() {
    const p = location.pathname;
    return /\/problem\//.test(p) || /\/p\/\d+/.test(p) || /\/contest\/.*\/problem/.test(p) || /\/exam\//.test(p);
  }

  function buildCSS(cfg) {
    const cardBg = rgba(cfg.cardColor, cfg.opacity);
    const navbarBg = rgba(cfg.naviBack || cfg.navbarColor, cfg.opacity);
    const textColor = cfg.textColor;
    const secColor = cfg.secondaryColor;
    const primary = cfg.primary;
    const primaryHover = cfg.primaryHover;
    const radius = cfg.radius + 'px';
    const blurPx = cfg.blur + 'px';
    const shadow = cfg.shadow
      ? '0 1px 3px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.08)'
      : 'none';

    // 图片设置（以洛谷 midOpts 为标准）
    const sizeMap = { auto: 'auto', cover: 'cover', contain: 'contain' };
    const size = sizeMap[cfg.bgSize] || (cfg.bgSizeCustom || 'cover');
    const repeatMap = { 'no-repeat': 'no-repeat', repeat: 'repeat', 'repeat-x': 'repeat-x', 'repeat-y': 'repeat-y' };
    const repeat = repeatMap[cfg.bgRepeat] || 'no-repeat';
    const pos = `${cfg.bgPosX || 50}% ${cfg.bgPosY || 0}%`;
    const brightness = cfg.bgBrightness ? ` brightness(${100 + cfg.bgBrightness}%)` : '';
    const rotate = cfg.bgDegree ? ` rotate(${cfg.bgDegree}deg)` : '';

    return `
/* ===== JXYCOI Display Better ===== */
html {
  background: ${cfg.bgColor} !important;
}
body {
  background: transparent !important;
  color: ${textColor} !important;
}
body::before {
  content: '' !important;
  position: fixed !important;
  inset: 0 !important;
  z-index: -1 !important;
  background: url('${cfg.bgImage || ''}') ${repeat} ${pos} / ${size} !important;
  filter: blur(${cfg.blur > 0 ? blurPx : '0px'})${brightness} !important;
  transform: scale(1.06) ${rotate} !important;
  pointer-events: none !important;
  display: ${cfg.bgImage ? 'block' : 'none'} !important;
}
/* 顶栏 */
.top-navbar, header, nav, .navbar {
  background: ${navbarBg} !important;
  backdrop-filter: blur(${blurPx}) saturate(140%) !important;
  -webkit-backdrop-filter: blur(${blurPx}) saturate(140%) !important;
  border-bottom: 1px solid ${rgba(cfg.cardColor, 0.15)} !important;
  box-shadow: 0 1px 4px rgba(0,0,0,.06) !important;
}
.top-navbar a, header a, nav a, .navbar a {
  color: ${cfg.dark ? textColor : primary} !important;
}
.top-navbar a:hover, header a:hover, nav a:hover, .navbar a:hover {
  color: ${primaryHover} !important;
}
/* 卡片容器（几乎所有区域视为卡片） */
${CARD_SELECTORS} {
  background: ${cardBg} !important;
  backdrop-filter: blur(${blurPx}) !important;
  -webkit-backdrop-filter: blur(${blurPx}) !important;
  border-radius: ${radius} !important;
  border: 1px solid ${rgba(cfg.cardColor, 0.12)} !important;
  box-shadow: ${shadow} !important;
  color: ${textColor} !important;
}
/* 表格 */
table, .table {
  background: transparent !important;
  color: ${textColor} !important;
}
th {
  color: ${secColor} !important;
  background: ${rgba(cfg.primary, 0.06)} !important;
}
tr:nth-child(even) td {
  background: ${rgba(cfg.cardColor, 0.35)} !important;
}
/* 输入框 */
input, textarea, select {
  background: ${rgba(cfg.cardColor, 0.85)} !important;
  color: ${textColor} !important;
  border: 1px solid ${rgba(primary, 0.3)} !important;
  border-radius: 6px !important;
}
input:focus, textarea:focus, select:focus {
  border-color: ${primary} !important;
  outline: none !important;
  box-shadow: 0 0 0 3px ${rgba(primary, 0.15)} !important;
}
/* 按钮 */
button, .btn, [class*="button"], [class*="Button"] {
  color: ${cfg.dark ? textColor : primary} !important;
}
button.primary, .btn-primary, [class*="primary"] {
  background: ${primary} !important;
  border-color: ${primary} !important;
  color: #fff !important;
  border-radius: 6px !important;
}
button.primary:hover, .btn-primary:hover, [class*="primary"]:hover {
  background: ${primaryHover} !important;
  border-color: ${primaryHover} !important;
}
/* 链接 */
a {
  color: ${primary} !important;
}
a:hover {
  color: ${primaryHover} !important;
}
/* 登录弹窗 */
.modal-login, .modal, [class*="modal"] {
  background: ${rgba(cfg.dark ? cfg.cardColor : '#ffffff', Math.max(cfg.opacity, 0.92))} !important;
  backdrop-filter: blur(${blurPx}) !important;
  -webkit-backdrop-filter: blur(${blurPx}) !important;
  border-radius: ${radius} !important;
  box-shadow: 0 8px 32px rgba(0,0,0,.18) !important;
}
/* 状态标签 */
[class*="tag"], [class*="label"], [class*="badge"] {
  border-radius: 4px !important;
}
/* 滚动条 */
::-webkit-scrollbar { width: 10px !important; height: 10px !important; }
::-webkit-scrollbar-thumb {
  background: ${rgba(primary, 0.35)} !important;
  border-radius: 5px !important;
}
::-webkit-scrollbar-thumb:hover {
  background: ${rgba(primary, 0.55)} !important;
}
::-webkit-scrollbar-track { background: transparent !important; }
/* 暗色补充 */
${cfg.dark ? `
${CARD_SELECTORS} {
  border-color: rgba(255,255,255,.08) !important;
}
th { background: rgba(255,255,255,.05) !important; }
` : ''}
/* 自定义 CSS */
${cfg.customCSS || ''}
`;
  }

  let styleEl = null;
  function applyStyle() {
    if (!config.enabled) {
      if (styleEl) styleEl.textContent = '';
      return;
    }
    // 做题页面：保持纯白，不应用美化
    if (config.cardMode && isSolvingPage()) {
      if (styleEl) styleEl.textContent = '';
      return;
    }
    const css = buildCSS(config);
    if (styleEl) styleEl.textContent = css;
    else styleEl = GM_addStyle(css);
  }

  /* ============================================================
   * 洛谷主题格式 ↔ 配置 转换
   * ============================================================ */
  // 洛谷 blur 编码：1000 + 模糊强度 px（1010 = 10px，1000 = 0px）
  function luoguBlurToPx(v) {
    return Math.max(0, Math.min(40, Number(v) - 1000));
  }
  function pxToLuoguBlur(px) {
    return 1000 + Math.max(0, Math.min(40, Math.round(Number(px) || 0)));
  }
  // 洛谷 midOpts.size → 我们的 bgSize（'custom' 时保存原始值）
  function luoguSizeToOurs(size) {
    if (!size) return 'cover';
    const s = String(size).toLowerCase();
    if (s === 'cover') return 'cover';
    if (s === 'contain') return 'contain';
    if (s === 'auto') return 'auto';
    return 'custom';
  }
  function convertLuoguToConfig(luoguTheme) {
    const cfg = {};
    const lNavi = luoguTheme.lNavi || {};
    const lBody = luoguTheme.lBody || {};
    const mo = lBody.midOpts || {};
    if (lNavi.back) cfg.naviBack = lNavi.back;
    if (lNavi.fore) cfg.naviFore = lNavi.fore;
    if (lBody.back) cfg.bgColor = lBody.back;
    if (typeof lBody.blur === 'number') cfg.blur = luoguBlurToPx(lBody.blur);
    if (lBody.image) cfg.bgImage = lBody.image;
    if (mo.notEmpty === false) cfg.bgImage = '';
    if (mo.size) {
      const s = String(mo.size).toLowerCase();
      cfg.bgSize = luoguSizeToOurs(s);
      if (cfg.bgSize === 'custom') cfg.bgSizeCustom = String(mo.size);
    }
    if (Array.isArray(mo.position) && mo.position.length >= 2) {
      cfg.bgPosX = clampNum(mo.position[0], 0, 100, 50);
      cfg.bgPosY = clampNum(mo.position[1], 0, 100, 0);
    }
    if (typeof mo.brightness === 'number') cfg.bgBrightness = clampNum(mo.brightness, -100, 100, 0);
    if (typeof mo.degree === 'number') cfg.bgDegree = clampNum(mo.degree, 0, 360, 0);
    return cfg;
  }
  function configToLuogu(cfg) {
    // 以原始洛谷主题为基础，保留未知字段（可加字段不能少）
    const base = cfg.luoguTheme && typeof cfg.luoguTheme === 'object' ? JSON.parse(JSON.stringify(cfg.luoguTheme)) : {};
    if (!base.lNavi) base.lNavi = {};
    if (!base.lBody) base.lBody = {};
    if (!base.dNavi) base.dNavi = { back: '#ffffff', fore: '#262626' };
    if (!base.dBody) base.dBody = { back: '#ffffff', blur: 1000, fade: 1000 };
    const lBody = base.lBody;
    if (!lBody.midOpts) lBody.midOpts = {};
    const lNavi = base.lNavi;
    lNavi.back = cfg.naviBack || cfg.navbarColor || '#ffffff';
    lNavi.fore = cfg.naviFore || '#333333';
    lBody.back = cfg.bgColor || '#efefef';
    lBody.blur = pxToLuoguBlur(cfg.blur);
    if (cfg.bgImage) lBody.image = cfg.bgImage;
    lBody.midOpts.size = cfg.bgSize === 'custom' ? (cfg.bgSizeCustom || 'cover') : (cfg.bgSize || 'cover');
    lBody.midOpts.degree = cfg.bgDegree || 0;
    lBody.midOpts.notEmpty = !!cfg.bgImage;
    lBody.midOpts.position = [cfg.bgPosX || 50, cfg.bgPosY || 0];
    lBody.midOpts.brightness = cfg.bgBrightness || 0;
    base.name = cfg.themeName || '';
    return base;
  }
  // 判断是否为洛谷主题格式（含 lBody / lNavi 等字段）
  function isLuoguTheme(obj) {
    return !!(obj && (obj.lBody || obj.lNavi || obj.dBody || obj.dNavi));
  }

  /* ============================================================
   * 主题导入 / 导出
   * ============================================================ */
  function normalizeTheme(obj) {
    const t = obj || {};
    return {
      name: t.name || '',
      primary: t.primary || t.mainColor || t.accent || DEFAULT_CONFIG.primary,
      primaryHover: t.primaryHover || DEFAULT_CONFIG.primaryHover,
      bgColor: t.bgColor || t.background || t.backgroundColor || DEFAULT_CONFIG.bgColor,
      bgImage: t.bgImage || t.backgroundImage || '',
      bgPosX: clampNum(t.bgPosX, 0, 100, DEFAULT_CONFIG.bgPosX),
      bgPosY: clampNum(t.bgPosY, 0, 100, DEFAULT_CONFIG.bgPosY),
      bgSize: t.bgSize || DEFAULT_CONFIG.bgSize,
      bgSizeCustom: t.bgSizeCustom || DEFAULT_CONFIG.bgSizeCustom,
      bgRepeat: t.bgRepeat || DEFAULT_CONFIG.bgRepeat,
      bgBrightness: clampNum(t.bgBrightness, -100, 100, DEFAULT_CONFIG.bgBrightness),
      bgDegree: clampNum(t.bgDegree, 0, 360, DEFAULT_CONFIG.bgDegree),
      blur: clampNum(t.blur, 0, 40, DEFAULT_CONFIG.blur),
      opacity: clampNum(t.opacity, 0, 1, DEFAULT_CONFIG.opacity),
      radius: clampNum(t.radius, 0, 30, DEFAULT_CONFIG.radius),
      textColor: t.textColor || DEFAULT_CONFIG.textColor,
      secondaryColor: t.secondaryColor || DEFAULT_CONFIG.secondaryColor,
      cardColor: t.cardColor || DEFAULT_CONFIG.cardColor,
      navbarColor: t.navbarColor || DEFAULT_CONFIG.navbarColor,
      naviBack: t.naviBack || t.navbarColor || DEFAULT_CONFIG.naviBack,
      naviFore: t.naviFore || DEFAULT_CONFIG.naviFore,
      dark: !!t.dark,
      shadow: t.shadow !== false,
      customCSS: t.customCSS || ''
    };
  }
  function parseTheme(text) {
    let obj = null;
    try { obj = JSON.parse(text); } catch (e) { /* not json */ }
    if (!obj) {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { try { obj = JSON.parse(m[0]); } catch (e2) { /* ignore */ } }
    }
    if (!obj) throw new Error('无法解析主题：请输入 JSON 格式的主题配置');
    return obj;
  }
  // 导入入口：支持 洛谷格式 / 旧格式 / 彩蛋
  function importTheme(text) {
    const trimmed = String(text || '').trim();

    // 彩蛋：输入触发词并导入
    if (EASTER_EGG_TRIGGERS.includes(trimmed)) {
      const egg = Object.assign({}, DEFAULT_CONFIG, normalizeTheme(EASTER_EGG_THEME), {
        themeName: '艾莲·乔',
        luoguTheme: configToLuogu(Object.assign({}, DEFAULT_CONFIG, normalizeTheme(EASTER_EGG_THEME)))
      });
      return { cfg: egg, isEgg: true };
    }

    const obj = parseTheme(trimmed);

    if (isLuoguTheme(obj)) {
      // 洛谷主题格式：保留原始完整对象，映射到配置
      const mapped = convertLuoguToConfig(obj);
      // 只有暗色部分（无 lNavi/lBody）时视为暗色主题
      const isDarkLuogu = !obj.lNavi && !obj.lBody && (obj.dNavi || obj.dBody);
      const merged = Object.assign({}, config, mapped, {
        dark: isDarkLuogu || !!config.dark,
        themeName: obj.name || obj.author || '导入的洛谷主题',
        luoguTheme: obj,
        luoguExtra: { name: obj.name, author: obj.author, css: obj.css }
      });
      return { cfg: merged, isEgg: false };
    }

    // 旧格式：脚本自身的配置 JSON
    const theme = normalizeTheme(obj);
    return {
      cfg: Object.assign({}, config, theme, { themeName: theme.name || config.themeName }),
      isEgg: false
    };
  }
  function exportTheme() {
    return JSON.stringify(configToLuogu(config), null, 2);
  }
  function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
      }
    } catch (e) { /* ignore */ }
    return fallbackCopy(text);
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    return Promise.resolve(ok);
  }

  /* ============================================================
   * 去除首页图片（/api/public/img/xxx.png 等大图）
   * ============================================================ */
  let hideImgObserver = null;
  function applyHideHomeImages() {
    if (!config.hideHomeImages) return;
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
      const src = img.getAttribute('src') || img.currentSrc || '';
      // 只看 /api/public/img/ 下的图；小尺寸头像（宽高<80px）不隐藏
      if (src.indexOf('/api/public/img/') !== -1) {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (w >= 80 && h >= 80) img.style.display = 'none';
      }
    });
    if (!hideImgObserver) {
      hideImgObserver = new MutationObserver(() => applyHideHomeImages());
      hideImgObserver.observe(document.body, { childList: true, subtree: true });
    }
  }
  function clearHideHomeImages() {
    if (hideImgObserver) { hideImgObserver.disconnect(); hideImgObserver = null; }
    document.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || img.currentSrc || '';
      if (src.indexOf('/api/public/img/') !== -1) img.style.display = '';
    });
  }

  /* ============================================================
   * 设置面板 UI
   * ============================================================ */
  let panelEl = null, btnEl = null;

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(k => {
        if (k === 'style') node.style.cssText = attrs[k];
        else if (k === 'class') node.className = attrs[k];
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), attrs[k]);
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(c => {
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  function buildPanel() {
    if (panelEl) return panelEl;
    const P = panelEl = el('div', { style: `
      position: fixed; right: 24px; top: 80px; z-index: 2147483647;
      width: 330px; max-height: 80vh; overflow-y: auto;
      background: rgba(255,255,255,.94); backdrop-filter: blur(20px);
      border: 1px solid rgba(0,0,0,.1); border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0,0,0,.2);
      font-family: -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: 13px; color: #1f2733; padding: 16px;
      display: none;
    ` });

    const title = el('div', { style: `
      display:flex; justify-content:space-between; align-items:center;
      font-weight:600; font-size:15px; margin-bottom:12px;
    ` }, [
      el('span', null, ['JXYCOI Display Better']),
      el('button', { style: btnStyle(false), onclick: () => { P.style.display = 'none'; } }, ['✕'])
    ]);
    P.appendChild(title);

    // 开关
    P.appendChild(switchRow('enabled', '启用美化', e => {
      config.enabled = e.target.checked;
      refreshAll();
    }));

    // 主题选择
    P.appendChild(sectionTitle('主题'));
    const themeRow = el('div', { style: 'display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;' });
    Object.keys(PRESET_THEMES).forEach(name => {
      themeRow.appendChild(el('button', {
        style: btnStyle(name === config.themeName),
        'data-theme': name,
        onclick: () => {
          config = Object.assign({}, config, PRESET_THEMES[name], { themeName: name });
          refreshAll();
        }
      }, [name]));
    });
    P.appendChild(themeRow);

    P.appendChild(sectionTitle('颜色'));
    P.appendChild(colorRow('primary', '主题色', () => {
      config.primary = valueOf('cfg-primary');
      config.primaryHover = darken(config.primary, 0.12);
      refreshAll();
    }));
    P.appendChild(colorRow('bgColor', '背景色', () => {
      config.bgColor = valueOf('cfg-bgColor');
      refreshAll();
    }));
    P.appendChild(colorRow('naviBack', '导航背景', () => {
      config.naviBack = valueOf('cfg-naviBack');
      refreshAll();
    }));

    P.appendChild(sectionTitle('背景图片'));
    const bgImgWrap = el('div', { style: rowStyle() }, [
      el('label', { style: 'flex:1;' }, ['图片 URL']),
      el('input', { type: 'text', id: 'cfg-bgImage', value: config.bgImage, placeholder: '留空为纯色', style: inputStyle(), onchange: e => {
        config.bgImage = e.target.value.trim();
        refreshAll();
      } })
    ]);
    P.appendChild(bgImgWrap);
    P.appendChild(sliderRow('bgPosX', '图片位置 X', 0, 100, '%', () => {
      config.bgPosX = Number(valueOf('cfg-bgPosX'));
      refreshAll();
    }));
    P.appendChild(sliderRow('bgPosY', '图片位置 Y', 0, 100, '%', () => {
      config.bgPosY = Number(valueOf('cfg-bgPosY'));
      refreshAll();
    }));
    // 图片尺寸下拉
    const sizeWrap = el('div', { style: rowStyle() }, [
      el('label', { style: 'flex:1;' }, ['图片尺寸']),
      el('select', { id: 'cfg-bgSize', style: inputStyle(), onchange: e => {
        config.bgSize = e.target.value;
        refreshAll();
      } }, [
        el('option', { value: 'auto' }, ['自动']),
        el('option', { value: 'cover' }, ['填充']),
        el('option', { value: 'contain' }, ['适应']),
        el('option', { value: 'custom' }, ['自定义'])
      ])
    ]);
    P.appendChild(sizeWrap);
    const sizeCustomWrap = el('div', { style: rowStyle() }, [
      el('label', { style: 'flex:1;' }, ['自定义尺寸']),
      el('input', { type: 'text', id: 'cfg-bgSizeCustom', value: config.bgSizeCustom, placeholder: '如 100% 100% / 800px 600px', style: inputStyle(), onchange: e => {
        config.bgSizeCustom = e.target.value.trim();
        refreshAll();
      } })
    ]);
    P.appendChild(sizeCustomWrap);
    // 图片重复下拉
    const repeatWrap = el('div', { style: rowStyle() }, [
      el('label', { style: 'flex:1;' }, ['图片重复']),
      el('select', { id: 'cfg-bgRepeat', style: inputStyle(), onchange: e => {
        config.bgRepeat = e.target.value;
        refreshAll();
      } }, [
        el('option', { value: 'no-repeat' }, ['不重复']),
        el('option', { value: 'repeat' }, ['全部重复']),
        el('option', { value: 'repeat-x' }, ['横向重复']),
        el('option', { value: 'repeat-y' }, ['纵向重复'])
      ])
    ]);
    P.appendChild(repeatWrap);
    P.appendChild(sliderRow('bgBrightness', '图片亮度', -100, 100, '', () => {
      config.bgBrightness = Number(valueOf('cfg-bgBrightness'));
      refreshAll();
    }));
    P.appendChild(sliderRow('bgDegree', '图片旋转', 0, 360, '°', () => {
      config.bgDegree = Number(valueOf('cfg-bgDegree'));
      refreshAll();
    }));

    P.appendChild(sectionTitle('效果'));
    P.appendChild(sliderRow('blur', '背景模糊', 0, 40, 'px', () => {
      config.blur = Number(valueOf('cfg-blur'));
      refreshAll();
    }));
    P.appendChild(sliderRow('opacity', '卡片透明度', 0, 100, '%', () => {
      config.opacity = Number(valueOf('cfg-opacity')) / 100;
      refreshAll();
    }));
    P.appendChild(sliderRow('radius', '卡片圆角', 0, 30, 'px', () => {
      config.radius = Number(valueOf('cfg-radius'));
      refreshAll();
    }));

    P.appendChild(sectionTitle('功能'));
    P.appendChild(switchRow('hideHomeImages', '去除首页图片', e => {
      config.hideHomeImages = e.target.checked;
      if (config.hideHomeImages) applyHideHomeImages();
      else clearHideHomeImages();
      refreshAll();
    }));
    P.appendChild(switchRow('cardMode', '卡片化（做题页自动豁免）', e => {
      config.cardMode = e.target.checked;
      refreshAll();
    }));

    P.appendChild(sectionTitle('导入 / 导出'));
    const importWrap = el('div', { style: 'margin-bottom:8px;' }, [
      el('textarea', { id: 'cfg-import', placeholder: '粘贴洛谷主题 JSON / 本脚本导出 JSON / 彩蛋口令（艾莲）', style: 'width:100%; height:56px; box-sizing:border-box; font-size:12px; border:1px solid #d0d7de; border-radius:6px; padding:6px;' }),
      el('div', { style: 'display:flex; gap:6px; margin-top:6px;' }, [
        el('button', { style: btnStyle(false), onclick: () => {
          try {
            const r = importTheme(valueOf('cfg-import'));
            config = r.cfg;
            refreshAll();
            toast(r.isEgg ? '彩蛋主题已应用 ✨' : '主题导入成功');
          } catch (e) {
            toast('导入失败：' + e.message, true);
          }
        } }, ['导入主题']),
        el('button', { style: btnStyle(false), onclick: () => {
          copyText(exportTheme()).then(ok => toast(ok ? '主题已复制到剪贴板（洛谷格式）' : '复制失败，请手动选择文本复制', !ok));
        } }, ['导出主题'])
      ])
    ]);
    P.appendChild(importWrap);

    // 自定义 CSS
    P.appendChild(sectionTitle('自定义 CSS（可选）'));
    P.appendChild(el('textarea', { id: 'cfg-customCSS', placeholder: '额外 CSS，直接写入 <style>', style: 'width:100%; height:60px; box-sizing:border-box; font-size:12px; border:1px solid #d0d7de; border-radius:6px; padding:6px;', onchange: e => {
      config.customCSS = e.target.value;
      refreshAll();
    } }, []));

    // 恢复默认
    P.appendChild(el('div', { style: 'display:flex; gap:6px; margin-top:10px;' }, [
      el('button', { style: btnStyle(false), onclick: () => {
        config = Object.assign({}, DEFAULT_CONFIG);
        refreshAll();
        toast('已恢复默认配置');
      } }, ['恢复默认'])
    ]));

    document.body.appendChild(P);
    return P;
  }

  function sectionTitle(text) {
    return el('div', { style: `
      margin: 12px 0 8px; padding-bottom: 4px;
      font-weight: 600; font-size: 12px; color: #57606a;
      border-bottom: 1px solid #eaeef2;
    ` }, [text]);
  }
  function rowStyle() {
    return 'display:flex; align-items:center; gap:8px; margin-bottom:8px;';
  }
  function inputStyle() {
    return 'flex:1; min-width:0; font-size:12px; border:1px solid #d0d7de; border-radius:6px; padding:4px 6px; background:#fff; color:#1f2733;';
  }
  function btnStyle(active) {
    return `
      background: ${active ? '#3498db' : '#f6f8fa'};
      color: ${active ? '#fff' : '#24292f'};
      border: 1px solid ${active ? '#3498db' : '#d0d7de'};
      border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer;
    `;
  }
  function colorRow(id, label, onChange) {
    return el('div', { style: rowStyle() }, [
      el('label', { style: 'flex:1;' }, [label]),
      el('input', { type: 'color', id: 'cfg-' + id, value: config[id], style: 'width:40px;height:26px;border:none;padding:0;background:none;cursor:pointer;', onchange })
    ]);
  }
  function sliderRow(id, label, min, max, unit, onChange) {
    const val = id === 'opacity' ? Math.round(config[id] * 100) : config[id];
    const out = el('span', { style: 'width:52px;text-align:right;font-size:12px;color:#57606a;' }, [val + unit]);
    const input = el('input', {
      type: 'range', id: 'cfg-' + id, min: String(min), max: String(max), value: String(val),
      style: 'flex:1;', oninput: e => {
        out.textContent = e.target.value + unit;
        onChange();
      }
    });
    return el('div', { style: rowStyle() }, [
      el('label', { style: 'flex:1;' }, [label]),
      input, out
    ]);
  }
  function switchRow(id, label, onChange) {
    return el('div', { style: rowStyle() }, [
      el('label', { style: 'flex:1;' }, [label]),
      el('input', { type: 'checkbox', id: 'cfg-' + id, checked: config[id], style: 'width:16px;height:16px;', onchange: onChange })
    ]);
  }
  function valueOf(id) {
    const n = document.getElementById(id);
    return n ? n.value : '';
  }

  function refreshAll() {
    saveConfig(config);
    syncPanelValues();
    applyStyle();
    syncThemeButtons();
    if (config.hideHomeImages) applyHideHomeImages();
    else clearHideHomeImages();
  }
  function syncPanelValues() {
    if (!panelEl) return;
    const set = (id, v) => { const n = document.getElementById(id); if (n) n.value = v; };
    set('cfg-enabled', config.enabled);
    set('cfg-primary', config.primary);
    set('cfg-bgColor', config.bgColor);
    set('cfg-naviBack', config.naviBack);
    set('cfg-bgImage', config.bgImage);
    set('cfg-bgPosX', String(config.bgPosX));
    set('cfg-bgPosY', String(config.bgPosY));
    set('cfg-bgSize', config.bgSize);
    set('cfg-bgSizeCustom', config.bgSizeCustom);
    set('cfg-bgRepeat', config.bgRepeat);
    set('cfg-bgBrightness', String(config.bgBrightness));
    set('cfg-bgDegree', String(config.bgDegree));
    set('cfg-blur', String(config.blur));
    set('cfg-opacity', String(Math.round(config.opacity * 100)));
    set('cfg-radius', String(config.radius));
    set('cfg-hideHomeImages', config.hideHomeImages);
    set('cfg-cardMode', config.cardMode);
    set('cfg-customCSS', config.customCSS);
  }
  function syncThemeButtons() {
    if (!panelEl) return;
    panelEl.querySelectorAll('[data-theme]').forEach(b => {
      b.style.cssText = btnStyle(b.getAttribute('data-theme') === config.themeName);
    });
  }

  let toastEl = null;
  function toast(msg, isError) {
    if (!toastEl) {
      toastEl = el('div', { style: `
        position: fixed; left: 50%; bottom: 48px; transform: translateX(-50%);
        z-index: 2147483647; padding: 8px 16px; border-radius: 8px;
        background: rgba(0,0,0,.78); color: #fff; font-size: 13px;
        font-family: -apple-system, 'PingFang SC', sans-serif;
        opacity: 0; transition: opacity .25s; pointer-events: none;
      ` });
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.style.background = isError ? 'rgba(180,60,60,.92)' : 'rgba(0,0,0,.78)';
    toastEl.style.opacity = '1';
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => { toastEl.style.opacity = '0'; }, 2200);
  }

  function buildButton() {
    if (btnEl) return btnEl;
    btnEl = el('div', { style: `
      position: fixed; right: 20px; top: 76px; z-index: 2147483646;
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #3498db, #5b8def);
      color: #fff; display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 16px rgba(52,152,219,.4);
      font-size: 20px; user-select: none; transition: transform .15s;
    `, onclick: e => {
      e.stopPropagation();
      const P = buildPanel();
      P.style.display = P.style.display === 'none' ? 'block' : 'none';
      syncPanelValues();
      syncThemeButtons();
    } }, ['🎨']);
    btnEl.title = 'JXYCOI Display Better 设置';
    document.body.appendChild(btnEl);
    return btnEl;
  }

  /* ============================================================
   * SPA 适配：MutationObserver 补样式/入口/图片隐藏
   * ============================================================ */
  let moTimer = null;
  function onDomChange() {
    clearTimeout(moTimer);
    moTimer = setTimeout(() => {
      applyStyle();
      if (config.hideHomeImages) applyHideHomeImages();
      if (btnEl && !btnEl.isConnected) document.body.appendChild(btnEl);
      if (panelEl && !panelEl.isConnected) document.body.appendChild(panelEl);
    }, 300);
  }

  /* ============================================================
   * 初始化
   * ============================================================ */
  function init() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    applyStyle();
    if (config.hideHomeImages) applyHideHomeImages();
    buildButton();
    new MutationObserver(onDomChange).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
