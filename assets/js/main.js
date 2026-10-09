/* ==========================================================================
   AISub 官网 — 交互脚本
   依赖 I18N (i18n.js) 先加载。
   ========================================================================== */

(function () {
  'use strict';

  var REPO = 'zhengxiexie/aisub';
  var API = 'https://api.github.com/repos/' + REPO;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function gh(path) {
    return fetch(API + path, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  function bytes(n) {
    if (!n && n !== 0) return '—';
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  var T = function (k) { return window.I18N.t(k); };

  /* ============================ 1. Release ============================ */

  var releaseVer = '';   // 形如 "2.1.0"(不带 v)

  /** 回填版本号文案。releaseVer 为空时整行隐藏, 不把 %v% 占位符露给用户。 */
  function renderVersion() {
    var verEl = $('#dlVersion');
    if (!verEl) return;
    if (!releaseVer) { verEl.hidden = true; return; }
    verEl.hidden = false;
    var tpl = T('hero.version');
    verEl.innerHTML = tpl && tpl.indexOf('%v%') >= 0
      ? tpl.replace('%v%', releaseVer)
      : tpl;
    var fv = $('#footVersion');
    if (fv) fv.textContent = 'v' + releaseVer;
  }

  function loadRelease() {
    var verEl = $('#dlVersion');
    if (!verEl) return;

    return gh('/releases/latest').then(function (rel) {
      var v = String(rel.tag_name || '').replace(/^v/, '');
      if (!v) return;
      releaseVer = v;
      renderVersion();

      // 直接指向具体版本的安装包
      var dmg = rel.assets && rel.assets.filter(function (a) { return /\.dmg$/i.test(a.name); })[0];
      var zip = rel.assets && rel.assets.filter(function (a) { return /\.zip$/i.test(a.name); })[0];
      if (dmg) $('#dlDmg').href = dmg.browser_download_url;
      if (zip) $('#dlZip').href = zip.browser_download_url;

      // 附件表格
      var table = $('#dlAssets');
      if (table && rel.assets && rel.assets.length) {
        var tb = table.querySelector('tbody');
        tb.innerHTML = '';
        rel.assets.forEach(function (a) {
          var tr = document.createElement('tr');
          var td1 = document.createElement('td'); td1.textContent = a.name;
          var td2 = document.createElement('td'); td2.textContent = bytes(a.size);
          var td3 = document.createElement('td');
          var link = document.createElement('a');
          link.href = a.browser_download_url;
          link.textContent = '↓';
          link.setAttribute('aria-label', a.name);
          td3.appendChild(link);
          tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
          tb.appendChild(tr);
        });
        table.hidden = false;
      }
    }).catch(function () {
      // 网络不可达时保留静态占位, 不报错
    });
  }

  /* =================== 2. Issues 当 CMS =================== */

  var postsCache = null;
  var postsFailed = false;   // 记录是否加载失败, 以便切语言时重绘错误文案

  function renderPosts(items) {
    var box = $('#posts');
    if (!box) return;

    if (postsFailed) {
      box.innerHTML = '<p class="dim">' + T('posts.error') + '</p>';
      return;
    }

    if (!items || !items.length) {
      box.innerHTML = '<p class="dim">' + T('posts.empty') + '</p>';
      return;
    }

    var posts = items
      .filter(function (i) { return !i.pull_request; })
      .map(function (i) {
        var labels = (i.labels || [])
          .map(function (l) { return l.name; })
          .filter(function (n) { return n !== 'post' && n !== '公告' && n !== 'announcement'; });
        var pinned = /^(\[置顶\]|pinned:)/i.test(i.title);
        var body = String(i.body || '').trim();
        var cut = body.split(/<!--\s*more\s*-->/i);
        var excerpt = (cut[0] || body)
          .replace(/^#+\s*/gm, '')
          .replace(/[*_`>]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        return {
          title: i.title.replace(/^\[置顶\]\s*|^pinned:\s*/i, ''),
          href: i.html_url,
          date: i.created_at,
          labels: labels,
          pinned: pinned,
          excerpt: excerpt.length > 200 ? excerpt.slice(0, 200) + '…' : excerpt
        };
      })
      .sort(function (a, b) {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.date) - new Date(a.date);
      });

    box.innerHTML = '';
    posts.forEach(function (p) {
      var d = new Date(p.date);
      var dateStr = d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0');

      var tags = p.labels.slice(0, 3).map(function (l) {
        return '<span class="post-tag">' + esc(l) + '</span>';
      }).join('');

      var a = document.createElement('a');
      a.className = 'post';
      a.href = p.href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML =
        '<div class="post-meta">' +
          (p.pinned ? '<span class="post-tag">' + esc(T('posts.pinned')) + '</span>' : '') +
          '<span>' + dateStr + '</span>' + tags +
        '</div>' +
        '<h4>' + esc(p.title) + '</h4>' +
        (p.excerpt ? '<p class="post-excerpt">' + esc(p.excerpt) + '</p>' : '');
      box.appendChild(a);
    });
  }

  function loadPosts() {
    var box = $('#posts');
    if (!box) return;
    if (postsCache) { renderPosts(postsCache); return; }

    return gh('/issues?state=all&per_page=30&labels=post')
      .then(function (items) { postsCache = items; postsFailed = false; renderPosts(items); })
      .catch(function () {
        postsFailed = true;
        box.innerHTML = '<p class="dim">' + T('posts.error') + '</p>';
      });
  }

  /* ============================ 3. 导航 ============================ */

  function initNav() {
    var nav = $('.nav');
    var toggle = $('#navToggle');
    var links = $('#navLinks');

    if (nav) {
      var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (toggle && links) {
      toggle.addEventListener('click', function () { links.classList.toggle('open'); });
      $$('a', links).forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); });
      });
    }
  }

  /* ============================ 4. 语言菜单 ============================ */

  function initLangSwitch() {
    var sw = $('#langSwitch');
    if (!sw) return;
    var btn = sw.querySelector('.lang-btn');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      sw.classList.toggle('open');
      btn.setAttribute('aria-expanded', sw.classList.contains('open') ? 'true' : 'false');
    });

    $$('.lang-menu a', sw).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var code = a.getAttribute('data-lang');
        sw.classList.remove('open');
        if (code) {
          window.I18N.setLang(code);
          // 同步 URL, 方便分享特定语言
          var u = new URL(location.href);
          u.searchParams.set('lang', code);
          history.replaceState(null, '', u);
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!sw.contains(e.target)) sw.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sw.classList.remove('open');
    });
  }

  /* ============================ 5. 主题切换 ============================ */

  var THEME_KEY = 'aisub.site.theme';

  function applyTheme(mode) {
    var html = document.documentElement;
    if (mode === 'auto') html.removeAttribute('data-theme');
    else html.setAttribute('data-theme', mode);

    var ico = $('#themeIco');
    if (ico) {
      var dark = mode === 'dark' ||
        (mode === 'auto' && !window.matchMedia('(prefers-color-scheme: light)').matches);
      ico.textContent = dark ? '☾' : '☀';
    }
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) {}
  }

  function initTheme() {
    var saved = 'auto';
    try { saved = localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) {}
    applyTheme(saved);

    var btn = $('#themeBtn');
    if (btn) {
      btn.addEventListener('click', function () {
        var cur = 'auto';
        try { cur = localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) {}
        var next = cur === 'auto' ? 'dark' : cur === 'dark' ? 'light' : 'auto';
        applyTheme(next);
      });
    }
  }

  /* ============================ 6. 灯箱 ============================ */

  function initLightbox() {
    var lb = $('#lightbox');
    var lbImg = $('#lightboxImg');
    if (!lb || !lbImg) return;

    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function (e) {
      var img = e.target;
      if (img && img.matches && img.matches('[data-zoom]')) {
        lbImg.src = img.getAttribute('src');
        lbImg.alt = img.getAttribute('alt') || '';
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });

    lb.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ============================ 7. 滚动渐入 ============================ */

  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var n = en.target;
          var delay = Number(n.getAttribute('data-reveal-delay') || 0);
          setTimeout(function () { n.classList.add('in'); }, delay);
          io.unobserve(n);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (n) { io.observe(n); });
  }

  /* ============================ 8. 启动 ============================ */

  function init() {
    initNav();
    initLangSwitch();
    initTheme();
    initLightbox();
    initReveal();
    renderVersion();   // 先隐藏 %v% 占位行, 拿到 release 再显示

    // 语言切换后: 需要重绘的动态内容
    document.addEventListener('i18n:changed', function () {
      // 版本号占位符重新填充
      renderVersion();
      // 日志列表(成功 / 失败两种状态都要跟着换语言)
      renderPosts(postsCache || []);
    });

    loadRelease();
    loadPosts();
  }

  // i18n 初始化完成后再启动其余模块
  if (window.I18N) {
    window.I18N.init().then(init).catch(init);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();