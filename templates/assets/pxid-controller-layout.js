/* Keep the system-map wires attached to their actual components as the grid resizes. */
(() => {
  const diagram = document.querySelector('.cr-system-diagram');
  if (!diagram) return;
  const svg = diagram.querySelector('.cr-system-wires');
  const product = diagram.querySelector('.cr-system-center img');
  const inputs = [...diagram.querySelectorAll('.cr-system-inputs .cr-sys-card')];
  const outputs = [...diagram.querySelectorAll('.cr-system-outputs .cr-sys-card')];
  const paths = [...svg.querySelectorAll('path.cr-wire-energy,path.cr-wire-signal')];
  if (!product || paths.length !== 6 || inputs.length !== 3 || outputs.length !== 3) return;
  const route = (sx, sy, ex, ey) => {
    if (Math.abs(ey - sy) < 2) return `M${sx} ${sy} H${ex}`;
    const elbow = (sx + ex) / 2;
    const r = Math.min(16, Math.abs(ex - sx) / 5, Math.abs(ey - sy) / 2);
    const direction = Math.sign(ey - sy);
    return `M${sx} ${sy} H${elbow-r} Q${elbow} ${sy} ${elbow} ${sy+direction*r} V${ey-direction*r} Q${elbow} ${ey} ${elbow+r} ${ey} H${ex}`;
  };
  let pending = false;
  const draw = () => {
    pending = false;
    if (getComputedStyle(svg).display === 'none') return;
    const box = diagram.getBoundingClientRect();
    const image = product.getBoundingClientRect();
    if (!box.width || !image.width) return;
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const positions = [.32,.5,.68];
    inputs.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      paths[index].setAttribute('d', route(rect.right-box.left,rect.top+rect.height/2-box.top,image.left+image.width*.04-box.left,image.top+image.height*positions[index]-box.top));
    });
    outputs.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      paths[index+3].setAttribute('d', route(image.right-image.width*.04-box.left,image.top+image.height*positions[index]-box.top,rect.left-box.left,rect.top+rect.height/2-box.top));
    });
    diagram.dataset.layoutReady = 'true';
  };
  const schedule = () => { if (!pending) { pending=true; requestAnimationFrame(draw); } };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    [diagram,product,...inputs,...outputs].forEach(node=>observer.observe(node));
  } else window.addEventListener('resize',schedule,{passive:true});
  product.addEventListener('load',schedule);
  document.fonts?.ready.then(schedule);
  schedule();
})();
