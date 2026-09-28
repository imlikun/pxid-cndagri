/* Keyboard-accessible conceptual views. No remote command or mock success state. */
(() => {
  const content = {
    meter: {
      day: ['日间：先保证关键内容可辨', '关注屏幕对比度、字体尺寸与安装角度。是否具备自动亮度调节，需要真实型号和光学测试资料确认。'],
      night: ['夜间：降低干扰，保持可读', '夜间阅读需要控制眩光与信息密度。自动主题切换是否支持、触发方式和亮度范围，均需具体型号验证。'],
      alert: ['告警：明确优先级和处理路径', '告警不应仅靠颜色表达。实际告警种类、触发条件、持续时间与恢复方式，需要车端协议和 UI 资料定义。']
    },
    motor: {
      shell: ['外壳与安装界面', '图中可见外壳轮廓。真实壳体材质、连接方式、密封和安装尺寸，需由候选型号工程图确认。'],
      coil: ['铜色绕组外观', '渲染中可见铜色绕组。线径、绕组方式、绝缘等级和实际材料，不能从概念图推断。'],
      shaft: ['轴系与传动关系', '轴承、轴端和传动连接属于关键匹配项。真实装配顺序、公差与载荷路径需工程图和样件确认。']
    },
    iot: {
      owner: ['车主端：从车辆状态出发', '状态、位置、行程、通知和设置应对应具体数据来源与权限。远程操作必须额外核对车端支持、网络与安全条件。'],
      fleet: ['运营端：把设备管理说清楚', '设备列表、在线状态、事件与维护记录应对应真实平台范围。地图、统计和权限字段需正式界面与接口资料验证。']
    }
  };
  document.querySelectorAll('.prod-tabs[role="tablist"]').forEach(list => {
    const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
    const group = tabs[0]?.dataset.group;
    if (!group || !content[group]) return;
    const section = list.closest('section');
    const panel = section.querySelector('[role="tabpanel"]');
    if (!panel) return;
    const activate = (tab, focus = false) => {
      tabs.forEach(item => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      const [title, copy] = content[group][tab.dataset.key];
      panel.querySelector('[data-tab-title]').textContent = title;
      panel.querySelector('[data-tab-copy]').textContent = copy;
      panel.setAttribute('aria-labelledby', tab.id);
      if (group === 'meter') {
        section.querySelector('.meter-scene').dataset.meterScene = tab.dataset.key;
        section.querySelector('.meter-scene-eyebrow').textContent = `UI CONCEPT / ${tab.dataset.key.toUpperCase()}`;
      }
      if (group === 'iot') {
        const mock = section.querySelector('.iot-mock');
        mock.querySelector('.iot-mock-main span').textContent = tab.dataset.key === 'owner' ? '车辆状态' : '设备状态';
        mock.querySelector('.iot-mock-row').innerHTML = tab.dataset.key === 'owner' ? '<span>状态</span><span>行程</span><span>消息</span><span>设置</span>' : '<span>设备</span><span>事件</span><span>维护</span><span>权限</span>';
      }
      if (focus) tab.focus();
    };
    tabs.forEach((tab, index) => {
      tab.id = `${group}-tab-${tab.dataset.key}`;
      tab.setAttribute('aria-controls', `${group}-panel`);
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (next) { event.preventDefault(); activate(next, true); }
      });
    });
    panel.id = `${group}-panel`;
    activate(tabs[0]);
  });
})();
