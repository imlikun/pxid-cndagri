/* Integrate the supplied IoT body; preserve the website navigation and footer. */
(() => {
  'use strict';
  const host = document.getElementById('main-content');
  const template = document.getElementById('pxid-iot-template');
  if (!host || !template || host.shadowRoot) return;
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.appendChild(template.content.cloneNode(true));
  template.remove();
  const root = shadow.getElementById('pxiot');
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollToSection = (id, focus) => {
    const section = root.querySelector('[id="' + CSS.escape(id) + '"]');
    if (!section) return;
    section.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' });
    if (focus) {
      const heading = section.querySelector('h1,h2');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    }
  };
  root.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const localLink = target.closest('a[data-iot-scroll]');
    if (localLink && root.contains(localLink)) {
      event.preventDefault();
      const id = localLink.getAttribute('href').slice(1);
      history.replaceState(null, '', '#' + id);
      scrollToSection(id, true);
    }
    const scenario = target.closest('[data-iot-scenario]');
    if (scenario && root.contains(scenario)) {
      const destination = new URL('contact.html', location.href);
      destination.searchParams.set('topic', 'iot');
      destination.searchParams.set('scenario', scenario.dataset.iotScenario);
      location.assign(destination.href);
    }
  });
  const restoreHash = () => { if (location.hash) scrollToSection(decodeURIComponent(location.hash.slice(1)), false); };
  window.addEventListener('hashchange', restoreHash);
  const stylesheet = shadow.querySelector('link[rel="stylesheet"]');
  stylesheet.addEventListener('load', restoreHash, { once: true });
  root.dataset.iotInitialized = 'true';
})();
