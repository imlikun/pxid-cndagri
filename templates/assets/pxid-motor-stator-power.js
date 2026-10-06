(() => {
  'use strict';
  const button = document.querySelector('#structure [data-stator-power]');
  const photo = button?.querySelector('.ms-power-photo');
  const canvas = button?.querySelector('.ms-power-canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx || !photo) return;
  const size = canvas.width;
  const scale = size / 1254;
  const center = { x: 624.64 * scale, y: 601.14 * scale };
  const tilt = .18245;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let ready = false, visible = false, hovered = false, selected = false, stopped = false;
  let frame = 0, last = 0, phase = 0;
  let coilMask;

  const wanted = () => !stopped && (selected || (hovered && !reduced.matches));
  const active = () => ready && visible && !document.hidden && wanted();
  function point(angle) {
    const x = Math.cos(angle) * 169 * scale;
    const y = Math.sin(angle) * 246 * scale;
    return {
      x: center.x + x * Math.cos(tilt) - y * Math.sin(tilt),
      y: center.y + x * Math.sin(tilt) + y * Math.cos(tilt)
    };
  }
  function drawField(angle, rgb) {
    // Two opposing travelling guides explain field rotation inside the empty bore.
    for (let i = 0; i < 22; i++) {
      const a = angle + i * .047;
      const p = point(a), q = point(a + .05);
      ctx.strokeStyle = `rgba(${rgb},${.04 + .65 * i / 22})`;
      ctx.lineWidth = 3.2 * size / 768;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    }
    const tip = point(angle + 1.08), prev = point(angle + 1.04);
    const tangent = Math.atan2(tip.y - prev.y, tip.x - prev.x);
    ctx.save(); ctx.translate(tip.x, tip.y); ctx.rotate(tangent);
    ctx.fillStyle = `rgba(${rgb},.82)`;
    ctx.beginPath(); ctx.moveTo(3, 0); ctx.lineTo(-7, -4); ctx.lineTo(-7, 4); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function render() {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center.x, center.y); ctx.rotate(tilt); ctx.scale(.7, 1);
    const glow = ctx.createConicGradient(phase, 0, 0);
    for (const [stop, alpha] of [[0,.015],[.10,.28],[.21,.15],[.32,.015],[.5,.015],[.6,.28],[.71,.15],[.82,.015],[1,.015]]) {
      glow.addColorStop(stop, `rgba(255,219,166,${alpha})`);
    }
    ctx.fillStyle = glow; ctx.fillRect(-size, -size, size * 2, size * 2); ctx.restore();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(coilMask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    drawField(phase, '255,185,105');
    drawField(phase + Math.PI, '171,210,226');
    button.dataset.powerPhase = phase.toFixed(4);
  }
  function tick(now) {
    frame = 0;
    if (!active() || reduced.matches) return;
    if (!last || now - last >= 1000 / 30) {
      if (last) phase = (phase + Math.min(now - last, 100) * Math.PI * 2 / 5500) % (Math.PI * 2);
      last = now; render();
    }
    frame = requestAnimationFrame(tick);
  }
  function update() {
    const running = active();
    button.dataset.powerActive = String(running);
    button.setAttribute('aria-pressed', String(running));
    button.setAttribute('aria-label', running ? '暂停定子通电与旋转磁场示意' : '演示定子通电与旋转磁场');
    if (!running || reduced.matches) {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      if (running) render();
    } else if (!frame) {
      last = 0; frame = requestAnimationFrame(tick);
    }
  }
  function clear() { hovered = false; selected = false; stopped = false; update(); }
  button.dataset.powerTouch = String(navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches);
  button.dataset.powerActive = 'false';
  button.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || !fine.matches) return;
    hovered = true; stopped = false; update();
  });
  button.addEventListener('pointerleave', () => { hovered = false; if (!selected) stopped = false; update(); });
  button.addEventListener('click', () => { const wasActive = wanted(); selected = !wasActive; stopped = wasActive; update(); });
  button.addEventListener('keydown', event => { if (event.key === 'Escape') { selected = false; stopped = true; update(); } });
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); else update(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (!visible) clear(); else update(); }, {threshold: .08}).observe(button);
  } else visible = true;

  async function initialize() {
    try {
      await photo.decode();
      coilMask = document.createElement('canvas'); coilMask.width = size; coilMask.height = size;
      const maskContext = coilMask.getContext('2d', {willReadFrequently: true});
      maskContext.drawImage(photo, 0, 0, size, size);
      const pixels = maskContext.getImageData(0, 0, size, size);
      // The highlight follows real copper pixels; steel, casing and labels receive no glow.
      for (let i = 0; i < pixels.data.length; i += 4) {
        const r = pixels.data[i], g = pixels.data[i + 1], b = pixels.data[i + 2];
        const copper = r > 55 && r > g * 1.2 && g > b * 1.3;
        pixels.data[i + 3] = copper ? pixels.data[i + 3] : 0;
      }
      maskContext.putImageData(pixels, 0, 0);
      render(); ready = true; button.dataset.powerReady = 'true'; update();
    } catch (_) {
      button.dataset.powerReady = 'false';
      // Retain the original photograph when a browser cannot prepare the effect.
    }
  }
  initialize();
})();
