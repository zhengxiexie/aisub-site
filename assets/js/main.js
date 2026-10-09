/* ==========================================================================
   AISub 官网 — 交互脚本
   职责:
     1. 从 GitHub API 拉取最新 release(下载区版本号/文件大小)
     2. 用 GitHub Issues 充当 CMS(标题带 `post:` 标签的 issue 即为一篇文章)
     3. 导航/滚动/灯箱/渐入动画
   无构建步骤、无依赖, 可直接跑在 GitHub Pages 上。
   ========================================================================== */

(function () {
  'use strict';

  var REPO = 'zhengxiexie/aisub';
  var API = 'https://api.github.com/repos/' + REPO;

  /* ------------------------------ 工具 ------------------------------ */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /** GitHub API 需要 User-Agent 头, fetch 会自动带 Origin, 这里手动补一个兜底。 */
  function gh(path) {
    return fetch(API + path, {
      headers: { Accept: 'application/vnd.github+json' }
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function bytes(n) {
    if (!n && n !== 0) return '—';
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** "v2.1.0" → "2.1.0" */
  function bare(tag) {
    return String(tag || '').replace(/^v/, '');
  }

  /* =========================== 1. Release 信息 =========================== */

  function loadRelease() {
    var verEl = $('#dlVersion');
    var noteEl = $('#dlNote');
    if (!verEl) return;

    gh('/releases/latest')
      .then(function (rel) {
        var v = bare(rel.tag_name);
        verEl.innerHTML = '当前版本 <b>v' + esc(v) + '</b>';

        // 渲染附件列表
        var table = $('#dlAssets');
        if (table && rel.assets && rel.assets.length) {
          table.innerHTML = '';
          rel.assets.forEach(function (a) {
            var tr = el('tr');
            tr.innerHTML =
              '<td>' + esc(a.name) + '</td>' +
              '<td>' + bytes(a.size) + '</td>' +
              '<td><a href="' + esc(a.browser_download_url) + '">下载</a></td>';
            table.appendChild(tr);
          });
        }

        // 渲染 release notes(仅首版时展示, 避免页面过长)
        if (noteEl && rel.body) {
          var first = String(rel.body).split('\n').slice(1).join('\n').trim();
          if (first) {
            noteEl.innerHTML = '<b>' + esc(rel.name || ('v' + v)) + ' 更新内容</b><br>' + esc(first.slice(0, 400));
          }
        }

        // 页脚也用一下版本号
        var fv = $('#footVersion');
        if (fv) fv.textContent = 'v' + v;
      })
      .catch(function () {
        // 网络不可达时不报错, 保留静态占位
        verEl.innerHTML = '当前版本 <b>2.1.0</b>';
      });
  }

  /* =================== 2. GitHub Issues 当 CMS =================== */

  /**
   * 约定: 仓库里带 `post` 标签的 Issue 即为文章。
   *   - 标题  : 文章标题
   *   - 正文  : 首段作为摘要; 以 `<!-- more -->` 可手动分段
   *   - 标签  : `post` 必需; 其余标签作为分类(排除 post/公告类)
   *   - 置顶  : 在标题前加 `[置顶]` 或 `pinned:` 可置顶
   */
  function loadPosts() {
    var box = $('#posts');
    if (!box) return;

    gh('/issues?state=all&per_page=30&labels=post')
      .then(function (items) {
        if (!items.length) { box.innerHTML = '<p class="dim">暂无文章。在本仓库新建一个带 <code>post</code> 标签的 Issue 即可发布。</p>'; return; }

        var posts = items
          .filter(function (i) { return !i.pull_request; })   // 排除 PR
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
              number: i.number,
              labels: labels,
              pinned: pinned,
              excerpt: excerpt.length > 180 ? excerpt.slice(0, 180) + '…' : excerpt
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

          var a = el('a', 'post');
          a.href = p.href;
          a.target = '_blank';
          a.rel = 'noopener';
          a.innerHTML =
            '<div class="post-meta">' +
              (p.pinned ? '<span class="post-tag">置顶</span>' : '') +
              '<span>' + esc(dateStr) + '</span>' + tags +
            '</div>' +
            '<h4>' + esc(p.title) + '</h4>' +
            (p.excerpt ? '<p class="post-excerpt">' + esc(p.excerpt) + '</p>' : '');
          box.appendChild(a);
        });
      })
      .catch(function () {
        box.innerHTML =
          '<p class="dim">文章列表加载失败(可能是 API 限流)。' +
          '你也可以直接到 <a href="' + API + '/issues" target="_blank" rel="noopener">GitHub Issues</a> 查看。</p>';
      });
  }

  /* =========================== 3. 导航交互 =========================== */

  function initNav() {
    var nav = $('.nav');
    var toggle = $('.nav-toggle');
    var links = $('.nav-links');

    if (nav) {
      var onScroll = function () {
        nav.classList.toggle('scrolled', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (toggle && links) {
      toggle.addEventListener('click', function () {
        links.classList.toggle('open');
      });
      // 点链接后自动收起
      $$('a', links).forEach(function (a) {
        a.addEventListener('click', function () { links.classList.remove('open'); });
      });
    }
  }

  /* =========================== 4. 灯箱 =========================== */

  function initLightbox() {
    var lb = $('#lightbox');
    var lbImg = $('#lightboxImg');
    if (!lb || !lbImg) return;

    document.addEventListener('click', function (e) {
      var img = e.target;
      if (img && img.matches && img.matches('[data-zoom]')) {
        lbImg.src = img.getAttribute('src');
        lbImg.alt = img.getAttribute('alt') || '';
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });

    lb.addEventListener('click', function () {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) {
        lb.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* =========================== 5. 滚动渐入 =========================== */

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
          // 轻微错开, 做出依次浮现的效果
          var n = en.target;
          var delay = Number(n.getAttribute('data-reveal-delay') || 0);
          setTimeout(function () { n.classList.add('in'); }, delay);
          io.unobserve(n);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (n) { io.observe(n); });
  }

  /* =========================== 6. 启动 =========================== */

  function init() {
    initNav();
    initLightbox();
    initReveal();
    loadRelease();
    loadPosts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();