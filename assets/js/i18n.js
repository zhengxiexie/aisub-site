/* ==========================================================================
   AISub 官网 — i18n 引擎
   与 App 的 L10n 思路一致: DOM 上标 data-i18n / data-i18n-attr,
   切换语言时统一回填。
   ========================================================================== */

window.I18N = (function () {
  'use strict';

  var STORE_KEY = 'aisub.site.lang';
  var DEFAULT = 'en';

  // 语言注册表: code → { name, file, htmlLang }
  var LANGS = {
    en:      { name: 'English',    file: 'en.js',      htmlLang: 'en' },
    'zh-Hans': { name: '简体中文',   file: 'zh-Hans.js', htmlLang: 'zh-Hans' },
    'zh-Hant': { name: '繁體中文',   file: 'zh-Hant.js', htmlLang: 'zh-Hant' },
    ja:      { name: '日本語',     file: 'ja.js',      htmlLang: 'ja' },
    ko:      { name: '한국어',     file: 'ko.js',      htmlLang: 'ko' },
    fr:      { name: 'Français',   file: 'fr.js',      htmlLang: 'fr' },
    de:      { name: 'Deutsch',    file: 'de.js',      htmlLang: 'de' },
    es:      { name: 'Español',    file: 'es.js',      htmlLang: 'es' }
  };

  var dict = {};     // 当前语言字典
  var current = DEFAULT;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('load fail: ' + src)); };
      document.head.appendChild(s);
    });
  }

  /** 读取已注册的字典 (各语言文件会调用 window.I18N.define) */
  function define(code, table) {
    if (code === current || !table) { dict = table || dict; }
    REGISTRY[code] = table;
  }

  var REGISTRY = {};

  function t(key, vars) {
    var s = dict[key];
    if (s == null) return key;          // 缺 key 时回退成 key, 便于发现
    if (vars) {
      s = s.replace(/%(\w+%)/g, function (m, k) {
        var n = k.slice(0, -1);
        return vars[n] != null ? vars[n] : m;
      });
    }
    return s;
  }

  /** 把字典刷到 DOM */
  function apply() {
    // 文本节点
    $$('[data-i18n]').forEach(function (n) {
      var v = t(n.getAttribute('data-i18n'));
      if (v !== n.innerHTML) n.innerHTML = v;
    });
    // 属性: data-i18n-attr="placeholder:key,title:key2"
    $$('[data-i18n-attr]').forEach(function (n) {
      n.getAttribute('data-i18n-attr').split(',').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length === 2) {
          var v = t(bits[1].trim());
          if (v) n.setAttribute(bits[0].trim(), v);
        }
      });
    });
    // <html lang>
    var meta = LANGS[current];
    if (meta) document.documentElement.setAttribute('lang', meta.htmlLang);
    // 标题与描述
    if (dict['meta.title']) document.title = dict['meta.title'];
    var md = document.querySelector('meta[name="description"]');
    if (md && dict['meta.desc']) md.setAttribute('content', dict['meta.desc']);
    // 派发事件, 供依赖文案的模块(如 Issues 摘要)重新渲染
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: current } }));
  }

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /** 切换语言(按需加载字典) */
  function setLang(code, opts) {
    opts = opts || {};
    if (!LANGS[code]) code = DEFAULT;
    var applyNow = function () {
      current = code;
      dict = REGISTRY[code] || {};
      try { localStorage.setItem(STORE_KEY, code); } catch (e) {}
      apply();
      if (!opts.silent) syncSwitcherUI();
    };
    if (REGISTRY[code]) return Promise.resolve(applyNow());
    return loadScript('assets/js/locales/' + LANGS[code].file)
      .then(applyNow)
      .catch(function () { applyNow(); });
  }

  /** 同步导航栏语言菜单的选中态 */
  function syncSwitcherUI() {
    var btn = $('.lang-btn .cur');
    if (btn && LANGS[current]) btn.textContent = LANGS[current].name;
    $$('.lang-menu a').forEach(function (a) {
      var on = a.getAttribute('data-lang') === current;
      a.classList.toggle('active', on);
      var tick = a.querySelector('.tick');
      if (tick) tick.textContent = on ? '✓' : '';
    });
  }

  /** 初始语言: URL ?lang= > localStorage > 浏览器 > 默认 */
  function detect() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && LANGS[q]) return q;
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved && LANGS[saved]) return saved;
    } catch (e) {}
    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf('zh') === 0) {
      return /hant|tw|hk|mo/.test(nav) ? 'zh-Hant' : 'zh-Hans';
    }
    var base = nav.split('-')[0];
    if (LANGS[base]) return base;
    return DEFAULT;
  }

  function init() {
    return setLang(detect(), { silent: true }).then(function () {
      syncSwitcherUI();
      return current;
    });
  }

  return {
    LANGS: LANGS,
    define: define,
    setLang: setLang,
    init: init,
    t: t,
    get lang() { return current; }
  };
})();