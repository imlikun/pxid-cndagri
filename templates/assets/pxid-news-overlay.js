(function () {
  'use strict';
  const grid = document.querySelector('.insight-grid');
  if (!grid || !window.HTMLDialogElement) return;
  const listTitle = document.title;
  const listURL = new URL(location.href);
  listURL.searchParams.delete('article');
  const articleBase = new URL('news/', listURL);
  const known = new Set(Array.from(grid.querySelectorAll('a[href]'), a => new URL(a.href).pathname));
  const cache = new Map();
  const dialog = document.createElement('dialog');
  dialog.className = 'pxid-news-overlay';
  // Keep native modal scrolling outside the site's Lenis wheel/touch handler.
  dialog.setAttribute('data-lenis-prevent', '');
  dialog.setAttribute('aria-labelledby', 'pxid-overlay-title');
  dialog.innerHTML = '<div class="pxid-overlay-bar"><span>PXID · 新闻与资料</span><button type="button" class="pxid-overlay-close" aria-label="关闭详情，返回新闻列表" autofocus><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="pxid-overlay-scroll" tabindex="0"><div class="pxid-overlay-content"></div></div>';
  document.body.append(dialog);
  const content = dialog.querySelector('.pxid-overlay-content');
  const scroller = dialog.querySelector('.pxid-overlay-scroll');
  const closeButton = dialog.querySelector('.pxid-overlay-close');
  let saved, controller, revision = 0, closing = false;

  function articleURL(value) {
    if (!value || !/^[a-z0-9-]+$/.test(value)) return null;
    const url = new URL(value + '.html', articleBase);
    return known.has(url.pathname) ? url : null;
  }
  function fromLink(link) {
    const url = new URL(link.href, location.href);
    return url.origin === location.origin && known.has(url.pathname) ? url : null;
  }
  function slug(url) { return url.pathname.split('/').pop().replace(/\.html$/, ''); }
  function lock() {
    if (dialog.open) return;
    saved = { x: scrollX, y: scrollY, style: document.body.getAttribute('style'), focus: document.activeElement, restoration: history.scrollRestoration };
    history.scrollRestoration = 'manual';
    const gap = innerWidth - document.documentElement.clientWidth;
    const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    Object.assign(document.body.style, {position:'fixed', top:-saved.y + 'px', left:'0', right:'0', width:'auto', overflow:'hidden', paddingRight:padding + gap + 'px'});
    dialog.showModal();
    closeButton.focus({preventScroll:true});
  }
  function hide() {
    ++revision;
    if (controller) controller.abort();
    closing = false;
    if (!dialog.open) return;
    dialog.close();
    document.title = listTitle;
    if (saved.style === null) document.body.removeAttribute('style');
    else document.body.setAttribute('style', saved.style);
    window.scrollTo({left:saved.x, top:saved.y, behavior:'instant'});
    if (saved.focus && saved.focus.isConnected) saved.focus.focus({preventScroll:true});
    history.scrollRestoration = saved.restoration;
  }
  function close() {
    if (closing || !dialog.open) return;
    closing = true;
    if (history.state && history.state.pxidNewsOverlay) history.back();
    else { history.replaceState(history.state, '', listURL); hide(); }
  }
  function parse(html, url) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const title = doc.querySelector('#news-title, main h1');
    const body = doc.querySelector('.news-detail > .inner');
    if (!title || !body) throw new Error('Missing article');
    const section = document.createElement('article');
    const header = document.createElement('div');
    header.className = 'pxid-overlay-heading';
    const category = document.createElement('p');
    category.className = 'pxid-overlay-category';
    category.textContent = doc.querySelector('.news-category')?.textContent || '新闻与资料';
    const h1 = document.createElement('h1');
    h1.id = 'pxid-overlay-title';
    h1.textContent = title.textContent.trim();
    header.append(category, h1);
    section.append(header);
    const hero = doc.querySelector('.news-detail-hero picture');
    if (hero) { const figure = document.createElement('figure'); figure.className = 'pxid-overlay-hero'; figure.append(hero.cloneNode(true)); section.append(figure); }
    const copy = document.createElement('div');
    copy.className = 'pxid-overlay-copy';
    copy.append(...Array.from(body.childNodes, node => node.cloneNode(true)));
    copy.querySelectorAll('.article-back').forEach(node => node.remove());
    section.append(copy);
    section.querySelectorAll('script,style,iframe,object,embed,form,link,meta').forEach(node => node.remove());
    section.querySelectorAll('*').forEach(node => {
      Array.from(node.attributes).forEach(attr => { if (/^on/i.test(attr.name) || attr.name === 'style') node.removeAttribute(attr.name); });
      ['src','href','poster'].forEach(attr => {
        const value = node.getAttribute(attr);
        if (!value) return;
        const resolved = new URL(value, url);
        if (['http:','https:','mailto:','tel:'].includes(resolved.protocol)) node.setAttribute(attr, resolved.href);
        else node.removeAttribute(attr);
      });
      if (node.hasAttribute('srcset')) node.setAttribute('srcset', node.getAttribute('srcset').split(',').map(part => {
        const [path, ...size] = part.trim().split(/\s+/);
        return [new URL(path, url).href, ...size].join(' ');
      }).join(', '));
      if (node.tagName === 'A' && node.target === '_blank') node.rel = 'noopener noreferrer';
    });
    return {title:h1.textContent, html:section.outerHTML};
  }
  async function render(url) {
    lock();
    closing = false;
    const current = ++revision;
    if (controller) controller.abort();
    controller = new AbortController();
    const activeController = controller;
    content.setAttribute('aria-busy', 'true');
    content.innerHTML = '<div class="pxid-overlay-message"><h1 id="pxid-overlay-title">正在加载文章</h1><p role="status">请稍候…</p></div>';
    scroller.scrollTop = 0;
    const timeout = setTimeout(() => activeController.abort(), 20000);
    try {
      let article = cache.get(url.href);
      if (!article) {
        const response = await fetch(url.href, {signal:activeController.signal, credentials:'same-origin'});
        if (!response.ok) throw new Error('HTTP ' + response.status);
        article = parse(await response.text(), url);
        cache.set(url.href, article);
      }
      if (current !== revision || !dialog.open) return;
      content.innerHTML = article.html;
      document.title = article.title + '｜PXID 品向';
      scroller.scrollTop = 0;
    } catch (error) {
      if (current !== revision || !dialog.open) return;
      content.innerHTML = '<div class="pxid-overlay-message"><h1 id="pxid-overlay-title">文章暂时未能加载</h1><p role="alert">请重试，或关闭详情返回列表。</p><button type="button" class="pxid-overlay-retry">重新加载</button></div>';
      content.querySelector('button').onclick = () => render(url);
    } finally {
      clearTimeout(timeout);
      if (current === revision) content.removeAttribute('aria-busy');
    }
  }
  function open(url) {
    const address = new URL(listURL);
    address.searchParams.set('article', slug(url));
    const state = Object.assign({}, history.state, {pxidNewsOverlay:true});
    if (dialog.open) history.replaceState(state, '', address);
    else history.pushState(state, '', address);
    render(url);
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || !(grid.contains(link) || dialog.contains(link))) return;
    const url = fromLink(link);
    if (!url) return;
    event.preventDefault();
    open(url);
  });
  closeButton.addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  let backdropDown = false;
  dialog.addEventListener('pointerdown', event => { backdropDown = event.target === dialog && outside(event); });
  function outside(event) { const r = dialog.getBoundingClientRect(); return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom; }
  dialog.addEventListener('click', event => { if (backdropDown && event.target === dialog && outside(event)) close(); backdropDown = false; });
  window.addEventListener('popstate', () => {
    const url = articleURL(new URL(location.href).searchParams.get('article'));
    if (url) render(url); else hide();
  });
  const initial = articleURL(new URL(location.href).searchParams.get('article'));
  if (initial) { history.replaceState(Object.assign({}, history.state, {pxidNewsOverlay:false}), '', listURL); open(initial); }
})();
