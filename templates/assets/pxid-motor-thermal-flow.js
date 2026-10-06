(() => {
  'use strict';
  const section = document.getElementById('thermal');
  const control = section?.querySelector('[data-thermal-flow]');
  const svg = control?.querySelector('.mr-airflow');
  if (!svg) return;

  const ns = 'http://www.w3.org/2000/svg';
  // Foreground schematic: heat originates within the housing, cooling follows its surface.
  const overlay = document.createElementNS(ns, 'svg');
  overlay.setAttribute('class', 'mr-airflow mt-flow-overlay');
  overlay.setAttribute('viewBox', '0 0 500 440');
  overlay.setAttribute('aria-hidden', 'true');
  const pulses = document.createElementNS(ns, 'g');
  pulses.setAttribute('class', 'mt-flow-pulses');
  const routes = {
    cool: [
      'M0 126C50 166 66 131 102 111C151 85 218 80 299 109',
      'M0 174C40 193 58 177 72 151C85 128 110 111 145 109',
      'M0 210C30 212 51 201 63 180C72 166 81 151 102 145',
      'M0 258C30 250 49 246 65 267C74 284 81 300 107 314',
      'M0 305C45 274 60 300 82 324C124 357 181 368 240 367',
      'M0 348C50 308 67 341 104 361C165 391 230 389 292 374'
    ],
    heat: [
      'M238 222C291 193 330 151 372 137C424 120 455 112 484 91',
      'M238 222C296 204 334 192 375 185C433 176 460 160 493 142',
      'M238 222C292 226 330 235 376 243C431 251 460 242 491 231',
      'M238 222C290 244 328 280 369 301C419 326 457 332 494 334',
      'M238 222C286 269 322 313 367 342C411 369 451 372 478 377'
    ]
  };
  for (const [kind, paths] of Object.entries(routes)) {
    paths.forEach((route, index) => {
      const track = document.createElementNS(ns, 'path');
      track.setAttribute('class', `mt-flow-track mt-flow-${kind}`);
      track.setAttribute('d', route);
      pulses.appendChild(track);
      const pulse = document.createElementNS(ns, 'path');
      pulse.setAttribute('class', `mt-flow-pulse mt-flow-${kind}`);
      pulse.setAttribute('d', route);
      pulse.setAttribute('pathLength', '100');
      pulse.style.setProperty('--flow-delay', `${index * -.37}s`);
      pulses.appendChild(pulse);
    });
  }
  const source = document.createElementNS(ns, 'circle');
  source.setAttribute('class', 'mt-heat-source');
  source.setAttribute('cx', '238'); source.setAttribute('cy', '222'); source.setAttribute('r', '8');
  pulses.appendChild(source);
  overlay.appendChild(pulses);
  control.appendChild(overlay);

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
