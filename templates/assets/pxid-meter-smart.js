/* Extend the existing accessible tabs with matching, distinct scene photographs. */
(() => {
  const scene = document.querySelector('#app.product-meter [data-meter-scene]');
  if (!scene) return;
  const figures = Array.from(scene.querySelectorAll('[data-scene-media]'));
  const list = scene.querySelector('.meter-scene-copy ul');
  const points = {
    day: ['浅色界面与深色读数形成对比', '速度与次要信息保持稳定位置', '实际亮度、反射与视角按型号验证'],
    night: ['深色界面减少大面积明亮区域', '关键读数保留足够的对比度', '自动切换方式与亮度范围按型号验证'],
    alert: ['图标与文字同时说明提示', '处理建议与状态信息分区显示', '告警触发与恢复方式按车端协议定义']
  };
  const update = () => {
    const key = scene.dataset.meterScene;
    if (!points[key]) return;
    figures.forEach(figure => {
      figure.hidden = figure.dataset.sceneMedia !== key;
      if (!figure.hidden) figure.querySelector('img').loading = 'eager';
    });
    list.replaceChildren(...points[key].map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
  };
  new MutationObserver(update).observe(scene, { attributes: true, attributeFilter: ['data-meter-scene'] });
  update();
})();
