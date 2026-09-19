/* S6 地图段：辐射线「跟随滚动进度描出」（Anime.js 滚动同步）
   父页通过 postMessage 广播 section 在视口内的进度 p（0→1），这里用 timeline.seek 驱动。
   线的写法：源稿每条 path 都带 pathLength="1"、CSS 里 stroke-dasharray:1;stroke-dashoffset:1，
   所以把 strokeDashoffset 从 1 动到 0 就是「描线」—— 直接用属性动画，不依赖 createDrawable
   （IIFE 版把 SVG 工具挂在 anime.svg 下，且与已有 pathLength 的交互实测不动）。 */
(function () {
  function go() {
    var A = window.anime;
    if (!A) return;                                  /* anime 未加载 → 保持原静态样式 */
    var root = document.querySelector('section') || document.body.firstElementChild;
    if (!root) return;
    var paths = root.querySelectorAll('.rt path');
    if (!paths.length) return;                       /* N3（canvas 地球）没线，自动空转 */
    var dots = root.querySelectorAll('.rt circle'), i;
    for (i = 0; i < paths.length; i++) paths[i].style.animation = 'none';   /* 关掉 CSS 的一次性描线 */
    for (i = 0; i < dots.length; i++) dots[i].style.animation = 'none';

    var tl = A.createTimeline({ autoplay: false });
    tl.add(paths, { strokeDashoffset: [1, 0], delay: A.stagger(50), duration: 760, ease: 'inOut(2)' });
    if (dots.length) tl.add(dots, { opacity: [0, 1], scale: [0.3, 1], duration: 280, ease: 'out(2)' }, '-=300');

    var DUR = tl.duration || 1, got = false;
    window.addEventListener('message', function (e) {
      var d = e.data || {};
      if (d.type !== 'pxid-s6-progress') return;
      got = true;
      tl.seek(d.p * DUR);
    });
    /* 兜底：父页没广播（例如单独打开这个页面）时，3 秒后整条画出来 */
    setTimeout(function () { if (!got) tl.seek(DUR); }, 3000);
    try { parent.postMessage({ type: 'pxid-s6-need-progress' }, '*'); } catch (err) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
