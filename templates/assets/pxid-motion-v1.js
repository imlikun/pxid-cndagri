/* ============================================================
   PXID 中文站 · 动效 v1（2026-09-16）  pxid-motion-v1.js
   只做两件事，不碰站内任何既有脚本与共享样式：

   ① 变体态入场：版式变体跑在隔离 iframe 里，站点动效引擎（pxid-motion.js /
      pxid-home-motion.js）进不去 → 本脚本把一套 token + 入场规则注入 iframe，
      并在「段进入视口 / 切换完成」时驱动内容自下而上 16px 淡入，阶梯 80ms，同组最多 6 项。

   ② 切换交接：点击切换卡片时
      · 新内容整块淡入（220ms）—— 把"瞬切"变成"柔和替换"
      · 视口锚定：切换前记住切换器的视口位置，切换后把页面滚回同一位置，
        段高变化（S7 / news）也不会让下游内容"哐当"跳走。

   ⚠️ 刻意不做的事：
   · 不做高度过渡（过渡期间下方内容持续滑动，观感比"瞬变 + 锚定"差）。
   · 不改原样态的 .alan 体系（站点原生引擎在用，改它要动共享文件）。
   · 移动端（≤900px）与 prefers-reduced-motion 一律不启用，保持现状。
   · 隐藏态都由 JS 加类后才生效（html.pxid-mo-ready）→ 脚本没跑也绝不白屏。
   ============================================================ */
(function () {
  'use strict';
  if (window.__pxidMotionV1) return;
  window.__pxidMotionV1 = 1;

  var SEARCH = location.search || '';
  var REDUCE = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    || /[?&]motion=reduce/.test(SEARCH)
    || !!(navigator.connection && navigator.connection.saveData);
  var TOUCH = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  if (REDUCE || TOUCH) return;

  /* ---------------- 规则（父页 + 每个 iframe 注入同一份） ---------------- */
  var CSS = [
    ':root{--mo-ease:cubic-bezier(.38,0,0,1);--mo-ease-out:cubic-bezier(.22,1,.36,1);',
    '--mo-el:.6s;--mo-sec:.9s;--mo-step:80ms;--mo-shift:16px}',
    'html.pxid-mo-ready .pxid-reveal{opacity:0;transform:translate3d(0,var(--mo-shift),0);',
    'transition:opacity var(--mo-el) var(--mo-ease),transform var(--mo-sec) var(--mo-ease)}',
    'html.pxid-mo-ready .pxid-reveal[data-mo="1"]{transition-delay:0ms}',
    'html.pxid-mo-ready .pxid-reveal[data-mo="2"]{transition-delay:calc(var(--mo-step) * 1)}',
    'html.pxid-mo-ready .pxid-reveal[data-mo="3"]{transition-delay:calc(var(--mo-step) * 2)}',
    'html.pxid-mo-ready .pxid-reveal[data-mo="4"]{transition-delay:calc(var(--mo-step) * 3)}',
    'html.pxid-mo-ready .pxid-reveal[data-mo="5"]{transition-delay:calc(var(--mo-step) * 4)}',
    'html.pxid-mo-ready .pxid-reveal[data-mo="6"]{transition-delay:calc(var(--mo-step) * 5)}',
    'html.pxid-mo-ready .pxid-reveal.in{opacity:1;transform:none}',
    /* pane 自带 .rise 阶梯（库源稿里就有的设计：40px / .9s / d1~d3 阶梯延迟）——
       它的触发条件是 `section.in`，而 .in 是**静态写在 HTML 里**的，
       所以变体一进 iframe 就已经是终态、"直接到位"。
       这里在未播放时把它压回初态，播放时放开 —— 过渡、阶梯全部复用库自己的定义，
       不自造一套。 */
    'html.pxid-mo-ready .pxid-mo-pane:not(.pxid-play) .rise{',
    'opacity:0!important;transform:translateY(40px)!important}',
    '.pxid-mo-fade{transition:opacity .22s var(--mo-ease-out)}',
    '#pxidS1 [class*="switch"] button,#pxidS2 [class*="switch"] button,',
    '#pxidS4 [class*="switch"] button,#pxidS6 [class*="switch"] button,',
    '#pxidS7 [class*="switch"] button,#main .pxid-n1switch button{',
    'transition:background-color .18s var(--mo-ease),color .18s var(--mo-ease)}'
  ].join('\n');

  (function () {
    if (document.getElementById('pxid-mo-css')) return;
    var st = document.createElement('style');
    st.id = 'pxid-mo-css';
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  })();

  /* ---------------- 工具 ---------------- */
  function qf(parent, sel) { try { return parent.querySelector(sel); } catch (e) { return null; } }

  function docOf(f) {
    try {
      var d = f.contentDocument;
      if (!d || !d.head || !d.body) return null;
      /* srcdoc 刚设置时文档壳已存在但内容还没解析出来 → 这时注入会挑不到东西，
         等 load 事件再走一次（docOf 返回 null 时调用方会安全跳过）。 */
      if (!d.body.children.length) return null;
      return d;
    } catch (e) { return null; }
  }

  function visible(el, pad) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || document.documentElement.clientHeight;
    var p = (pad == null) ? 80 : pad;
    return r.bottom > p && r.top < h - p;
  }

  /* ---------------- pane 根 ---------------- */
  function paneRoot(d) {
    for (var i = 0; i < d.body.children.length; i++) {
      var t = d.body.children[i].tagName.toLowerCase();
      if (t !== 'style' && t !== 'script' && t !== 'link' && t !== 'template') return d.body.children[i];
    }
    return d.body;
  }

  /* 通用挑块（只给没自带 .rise 的 pane 用）
     ⚠️ 不能按 position 过滤：S2/S6 这类"舞台型"排版的主要内容**本身就是绝对定位的**
     （`.copy` / `.node.n1~n3` / `.n3col`），按定位过滤会把内容全滤掉、只剩包裹层 →
     整段一起淡入，阶梯就没了。改按面积占比过滤。 */
  function blockList(el, area) {
    var out = [];
    var list = el.children || [];
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      var tag = c.tagName ? c.tagName.toLowerCase() : '';
      if (tag === 'style' || tag === 'script' || tag === 'template' || tag === 'link' || tag === 'svg') continue;
      var r = c.getBoundingClientRect();
      /* 尺寸为 0 = 还没布局（iframe load 那一刻很常见，S6 的 3D 舞台尤其明显）
         → 保留；只在"已经有尺寸、但太小"时才判为装饰排除。 */
      if (r.width > 0 && r.width < 80) continue;
      if (r.height > 0 && r.height < 40) continue;
      if (area && r.width * r.height > 0 && r.width * r.height < area * 0.02) continue;
      var cs = getComputedStyle(c);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      out.push(c);
      if (out.length >= 6) break;
    }
    return out;
  }

  function pickKids(d, root) {
    var rr = root.getBoundingClientRect();
    var area = rr.width * rr.height;
    var wrap = qf(root, '.frame') || qf(root, 'section.r1pad') || qf(root, '.r1pad-in')
      || qf(root, '.maxSize') || qf(root, '.inner') || root;
    /* 只挑到 1 个块说明抓到的是整段包裹 → 往下钻，直到有一层是"多块"的 */
    function deepen(el, depth) {
      var kids = blockList(el, area);
      if (kids.length >= 2 || depth >= 3 || !kids.length) return kids;
      var deeper = deepen(kids[0], depth + 1);
      return deeper.length >= 2 ? deeper : kids;
    }
    var kids = deepen(wrap, 0);
    if (!kids.length) kids = [wrap];
    kids.forEach(function (el, i) {
      el.classList.add('pxid-reveal');
      el.setAttribute('data-mo', String(Math.min(i + 1, 6)));
    });
    return kids;
  }

  /* ---------------- 注入 iframe ---------------- */
  function inject(f) {
    var d = docOf(f);
    if (!d) return null;
    if (!d.__mo) {
      try {
        d.__mo = 1;
        var st = d.createElement('style');
        st.textContent = CSS;
        d.head.appendChild(st);
        d.documentElement.classList.add('pxid-mo-ready');
        d.__moRoot = paneRoot(d);
        /* pane 自带 .rise 阶梯 → 复用它（把 .in 从"静态生效"改成"播放生效"） */
        d.__moRise = !!d.__moRoot.querySelector('.rise');
        if (d.__moRise) d.__moRoot.classList.add('pxid-mo-pane');
        else d.__moKids = pickKids(d, d.__moRoot);
      } catch (e) { d.__mo = 2; return null; }
      /* 兜底：3s 内没人驱动就自己放（保证内容绝不留在隐藏态） */
      window.setTimeout(function () { if (!d.__moPlayed) reveal(d); }, 3000);
    }
    return d.__mo === 1 ? d : null;
  }

  /* ---------------- 播放（两条路：自带 .rise / 通用 reveal） ---------------- */
  function reveal(d) {
    if (!d || d.__moPlayed) return;
    if (d.__moRise) {
      if (!d.__moRoot) return;
      d.__moPlayed = 1;
      d.__moRoot.classList.remove('pxid-play');
      void d.__moRoot.offsetHeight;
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { d.__moRoot.classList.add('pxid-play'); });
      });
      return;
    }
    if (!d.__moKids || !d.__moKids.length) return;
    d.__moPlayed = 1;
    var kids = d.__moKids;
    kids.forEach(function (el) { el.classList.remove('in'); });
    void d.body.offsetHeight;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        kids.forEach(function (el) { el.classList.add('in'); });
      });
    });
  }

  /* 段可见才播（否则动画会在用户看不见的时候"跑掉"） */
  function revealIfVisible(sec, f) {
    if (!visible(sec, 120)) return;
    var d = inject(f);
    if (d && !d.__moPlayed) reveal(d);
  }

  /* ---------------- 挂上所有变体 iframe ----------------
     ⚠️ 选择器必须是 [class*="frame"] 而不是 [class*="-frame"]：
     iframe 的 class 是 pxid-s2frame / pxid-n1frame —— 横线在 pxid 后面，
     写成 "-frame" 会一个都匹配不到（踩过）。 */
  (function collect() {
    var list = document.querySelectorAll('iframe[class*="pxid-"][class*="frame"]');
    for (var i = 0; i < list.length; i++) {
      (function (f) {
        if (f.__moHooked) return;
        f.__moHooked = 1;
        var secOf = function () { return f.closest('section') || f.parentElement; };
        f.addEventListener('load', function () { revealIfVisible(secOf(), f); });
        if (window.IntersectionObserver) {
          new IntersectionObserver(function (ents) {
            ents.forEach(function (e) {
              if (!e.isIntersecting) return;
              revealIfVisible(secOf(), f);
            });
          }, { threshold: 0.12 }).observe(f);
        }
      })(list[i]);
    }
  })();

  /* ---------------- 切换交接 ---------------- */
  function anchorTo(sw, before) {
    var dy = sw.getBoundingClientRect().top - before;
    if (Math.abs(dy) < 1) return;
    try { window.scrollBy(0, dy); } catch (e) {}
    /* 再补一次：图片/字体晚到会让高度二次变化 */
    window.setTimeout(function () {
      var dy2 = sw.getBoundingClientRect().top - before;
      if (Math.abs(dy2) > 1) { try { window.scrollBy(0, dy2); } catch (e) {} }
    }, 420);
  }

  document.addEventListener('click', function (e) {
    var btn = (e.target && e.target.closest) ? e.target.closest('button[data-v]') : null;
    if (!btn) return;
    var sec = btn.closest('section');
    if (!sec) return;
    var box = btn.parentElement;
    while (box && box !== document.body && !/switch/.test(String(box.className || ''))) box = box.parentElement;
    if (!box || !/switch/.test(String(box.className || ''))) return;

    var f = sec.querySelector('iframe[class*="frame"]');
    var before = box.getBoundingClientRect().top;
    var wasVisible = visible(sec, 120);

    /* ① 新内容整块淡入：先把 iframe 压到透明（同一帧内完成，不会闪），
         等它 load 完（内容就绪）再恢复 → 观感是"柔和替换"不是"啪一下" */
    if (f) {
      f.classList.add('pxid-mo-fade');
      f.style.opacity = '0';
      var done = false;
      var back = function () {
        if (done) return;
        done = true;
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () { f.style.opacity = ''; });
        });
      };
      f.addEventListener('load', function () { window.setTimeout(back, 60); }, { once: true });
      window.setTimeout(back, 420);
      if (wasVisible) window.setTimeout(function () { reveal(inject(f)); }, 140);
    }

    /* ② 视口锚定：切换后把页面滚回切换器原来的位置 —— 段高变化也不跳 */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { anchorTo(box, before); });
    });
  }, true);

  /* 排查用 */
  window.__pxidMo = { reveal: reveal, inject: inject, css: CSS };
})();
