(() => {
  const boardDetails = {
    connector: {
      number: '01 / VISIBLE DETAIL',
      title: '连接器外观',
      body: '图中右侧可见插接结构。接口的电源、信号定义及针脚顺序，需按实际线束图和选定板件核对。',
      need: '工程资料待补：接口定义、线束图'
    },
    board: {
      number: '02 / VISIBLE DETAIL',
      title: '板面封装器件',
      body: '板面可见多种封装。仅凭概念图无法确认哪颗是主控、驱动或采样器件；具体位号应由 BOM 与原理图确认。',
      need: '工程资料待补：BOM、板图、原理图'
    },
    capacitor: {
      number: '03 / VISIBLE DETAIL',
      title: '柱状元件外观',
      body: '图中能看到柱状元件的造型。它们的类别、规格以及是否属于实际产品板件，不能由渲染图推断。',
      need: '工程资料待补：实物照片、元件规格'
    }
  };

  const boardPanel = document.querySelector('#pcb-description');
  const boardButtons = [...document.querySelectorAll('[data-hotspot]')];
  const leaderLines = [...document.querySelectorAll('.ctrl-pcb-lines [data-line]')];
  function selectBoardDetail(key) {
    const detail = boardDetails[key];
    if (!boardPanel || !detail) return;
    boardPanel.replaceChildren();
    const number = document.createElement('span');
    number.className = 'ctrl-pcb-number';
    number.textContent = detail.number;
    const heading = document.createElement('h3');
    heading.textContent = detail.title;
    const body = document.createElement('p');
    body.textContent = detail.body;
    const need = document.createElement('small');
    need.textContent = detail.need;
    boardPanel.append(number, heading, body, need);
    boardButtons.forEach(button => {
      const active = button.dataset.hotspot === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    leaderLines.forEach(path => path.classList.toggle('is-active', path.dataset.line === key));
  }
  boardButtons.forEach(button => button.addEventListener('click', () => selectBoardDetail(button.dataset.hotspot)));
  selectBoardDetail('connector');

  const scenes = {
    start: { count: '01 / START', title: '起步：先建立平顺的第一感受', body: '讨论转把输入、起步扭矩与限流边界的匹配方式，避免只用“更快”定义起步体验。', input: '电机资料、整车载重、目标起步感受', verify: '样车试骑与实际电流、温升记录' },
    low: { count: '02 / LOW SPEED', title: '低速：让细小指令仍然可控', body: '低速工况重点检查输入分辨率、速度波动和操控一致性。实际控制策略需要在样车上标定。', input: '低速目标、转把特性、传感器资料', verify: '低速试骑与响应记录' },
    accelerate: { count: '03 / ACCELERATION', title: '加速：在响应与边界之间取舍', body: '加速响应需要结合电池放电能力、电机条件与热限制确定，不能由单一峰值参数概括。', input: '加速目标、电池放电边界、电机资料', verify: '对应载荷下的电流与温升记录' },
    cruise: { count: '04 / STEADY RIDING', title: '稳定行驶：关注持续表现', body: '持续运行时需要观察输出稳定性、能耗与热状态。本项是标定关注点，并非对定速巡航功能的承诺。', input: '目标速度、持续工况、整车质量', verify: '连续运行数据与环境条件' },
    load: { count: '05 / LOAD CHANGE', title: '负载变化：重新审视动力余量', body: '坡道、载重或路况变化会改变扭矩与温升需求。具体能力应以选定电机和控制器组合验证。', input: '坡度、载重、使用时长与路况', verify: '样车工况测试与保护动作记录' }
  };
  const tabs = [...document.querySelectorAll('.ctrl-scene-tabs [role="tab"]')];
  const scenePanel = document.querySelector('#scene-panel');
  function selectScene(key, moveFocus = false) {
    const scene = scenes[key];
    if (!scenePanel || !scene) return;
    tabs.forEach(tab => {
      const active = tab.dataset.scene === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) {
        scenePanel.setAttribute('aria-labelledby', tab.id);
        if (moveFocus) tab.focus();
      }
    });
    scenePanel.querySelector('.ctrl-scene-count').textContent = scene.count;
    scenePanel.querySelector('h3').textContent = scene.title;
    scenePanel.querySelector('.ctrl-scene-copy > p').textContent = scene.body;
    const descriptions = scenePanel.querySelectorAll('dd');
    descriptions[0].textContent = scene.input;
    descriptions[1].textContent = scene.verify;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectScene(tab.dataset.scene));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectScene(tabs[next].dataset.scene, true);
    });
  });
})();
