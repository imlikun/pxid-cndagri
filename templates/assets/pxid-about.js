/* Only chapter state and measured header clearance; content works without JS. */
(function () {
  document.querySelectorAll('.pxid-about-nav-panel a,.pxid-about-mobile-links a').forEach(function (link) {
    var target=new URL(link.href,location.href);
    if (target.pathname===location.pathname && target.hash) link.setAttribute('href',target.hash);
  });
  var header=document.querySelector('#app > header');
  var chapters=document.querySelector('.about-chapters');
  if (!header) return;
  function measureHeader() {
    document.body.style.setProperty('--about-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');
  }
  measureHeader();
  if ('ResizeObserver' in window) new ResizeObserver(measureHeader).observe(header);
  else window.addEventListener('resize',measureHeader,{passive:true});
  if (!chapters) return;
  var links=Array.from(chapters.querySelectorAll('a[href^="#"]'));
  var sections=links.map(function (link) { return document.querySelector(link.getAttribute('href')); });
  var pending=false;
  function update() {
    pending=false;
    var offset=header.getBoundingClientRect().height+chapters.getBoundingClientRect().height+100;
    var active=sections[0];
    sections.forEach(function (section) { if (section && section.getBoundingClientRect().top<=offset) active=section; });
    links.forEach(function (link) {
      if (active && link.hash==='#'+active.id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll',function () { if (!pending) {pending=true; requestAnimationFrame(update);} },{passive:true});
  window.addEventListener('resize',update,{passive:true});
  update();
})();
