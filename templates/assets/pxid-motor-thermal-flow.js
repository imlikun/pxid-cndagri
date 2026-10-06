(() => {
  'use strict';
  const section = document.getElementById('thermal');
  const control = section?.querySelector('[data-thermal-flow]');
  const svg = control?.querySelector('.mr-airflow');
  if (!svg) return;

  const ns = 'http://www.w3.org/2000/svg';
  const pulses = document.createElementNS(ns, 'g');
  pulses.setAttribute('class', 'mt-flow-pulses');
  // Reuse the drawn routes. Each independent route has the same normalized travel length.
  for (const [source, kind] of [['mr-cooling', 'cool'], ['mr-heat', 'heat']]) {
    const group = svg.querySelector(`g[stroke="url(#${source})"]`);
    group?.querySelectorAll('path').forEach(path => {
      (path.getAttribute('d').match(/[Mm][^Mm]*/g) || []).forEach((route, index) => {
        const pulse = document.createElementNS(ns, 'path');
        pulse.setAttribute('class', `mt-flow-pulse mt-flow-${kind}`);
        pulse.setAttribute('d', route);
        pulse.setAttribute('pathLength', '100');
        pulse.style.setProperty('--flow-delay', `${index * -.37}s`);
        pulses.appendChild(pulse);
      });
    });
  }
  svg.appendChild(pulses);

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  let hovered = false;
  let selected = false;
  let stopped = false;
  let visible = false;
  const wanted = () => !stopped && (selected || (hovered && !reduceMotion.matches));
  function update() {
    const active = visible && !document.hidden && wanted();
    control.dataset.flowActive = String(active);
    control.setAttribute('aria-pressed', String(active));
    control.setAttribute('aria-label', active
      ? '暂停冷却气流与散热路径演示'
      : '演示冷却气流与散热路径');
  }
  function clear() {
    hovered = false;
    selected = false;
    stopped = false;
    update();
  }
  control.dataset.flowTouch = String(navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches);
  control.dataset.flowActive = 'false';
  control.dataset.flowReady = 'true';
  control.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !hoverPointer.matches) return;
    hovered = true;
    stopped = false;
    update();
  });
  control.addEventListener('pointerleave', () => {
    hovered = false;
    // A mouse hover preview ends on leaving; explicit touch/keyboard play stays selected.
    if (!selected) stopped = false;
    update();
  });
  control.addEventListener('click', () => {
    const wasActive = wanted();
    selected = !wasActive;
    stopped = wasActive;
    update();
  });
  control.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      selected = false;
      stopped = true;
      update();
    }
  });
  reduceMotion.addEventListener('change', update);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clear(); else update();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible) clear(); else update();
    }, { threshold: .08 }).observe(control);
  } else {
    visible = true;
    update();
  }
})();
