(() => {
  const featureButtons = [...document.querySelectorAll('.cr-hotspot, .cr-detail-card')];
  function setFeature(name) {
    featureButtons.forEach((button) => {
      const active = button.dataset.feature === name;
      button.classList.toggle('is-active', active);
      if (button.classList.contains('cr-hotspot')) button.setAttribute('aria-pressed', String(active));
    });
  }
  featureButtons.forEach((button) => button.addEventListener('click', () => setFeature(button.dataset.feature)));

  const scenes = {
    start: {
      title: '起步：先建立平顺的第一感受',
      description: '通过精确的扭矩控制和响应策略，抑制突发冲击，让起步更平稳、自然。',
      points: [['平顺响应', '减少起步瞬间的冲击感'], ['精准控制', '匹配驾驶意图，输出线性动力'], ['自然体验', '让每一次起步都从容可控']]
    },
    slow: {
      title: '低速：保持细腻而可控的响应',
      description: '在停车、转弯与拥挤路段，关注小幅输入和动力变化之间的可预期关系。',
      points: [['细腻输入', '识别低速下的轻微指令'], ['线性输出', '避免动力突然跃变'], ['从容操控', '帮助驾驶者稳定调整速度']]
    },
    accelerate: {
      title: '加速：让动力跟上驾驶意图',
      description: '对加速需求进行连续响应，同时结合电池、电机与整车边界管理输出。',
      points: [['需求识别', '及时感知加速指令'], ['动力协调', '匹配驱动系统的工作范围'], ['输出平顺', '让动力建立更自然']]
    },
    cruise: {
      title: '巡航：持续保持稳定节奏',
      description: '在相对稳定的行驶阶段，关注输出的一致性与持续运行条件。',
      points: [['状态感知', '持续读取关键运行信号'], ['稳定输出', '减少不必要的动力波动'], ['工况核对', '结合车型验证持续表现']]
    },
    load: {
      title: '负载变化：响应真实路况',
      description: '面对载重和坡度变化，调整控制响应，并核对功率、温升与保护边界。',
      points: [['负载识别', '关注运行状态变化'], ['策略调整', '按项目条件配置输出'], ['边界保护', '在真实工况中验证可靠性']]
    }
  };
  const tabs = [...document.querySelectorAll('.cr-scene-tabs [role="tab"]')];
  const title = document.getElementById('cr-scene-title');
  const description = document.getElementById('cr-scene-desc');
  const points = document.getElementById('cr-scene-points');
  function setScene(name) {
    const scene = scenes[name];
    if (!scene) return;
    tabs.forEach((tab) => {
      const selected = tab.dataset.scene === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    title.textContent = scene.title;
    description.textContent = scene.description;
    points.replaceChildren(...scene.points.map(([label, value]) => {
      const item = document.createElement('li');
      const strong = document.createElement('b');
      const span = document.createElement('span');
      strong.textContent = label;
      span.textContent = value;
      item.append(strong, span);
      return item;
    }));
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setScene(tab.dataset.scene));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      setScene(tabs[next].dataset.scene);
      tabs[next].focus();
    });
  });
  setScene('start');
})();
