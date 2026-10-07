(() => {
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function hit(target,label){const button=document.createElement('button');button.type='button';button.className='cr-live-hit';button.setAttribute('aria-label',label);button.setAttribute('aria-pressed','false');target.append(button);return button;}
 const diagram=document.querySelector('.cr-system-diagram');
 if(diagram){
  const svg=diagram.querySelector('.cr-system-wires'),base=[...svg.querySelectorAll('.cr-wire-energy,.cr-wire-signal')],cards=[...diagram.querySelectorAll('.cr-system-inputs .cr-sys-card,.cr-system-outputs .cr-sys-card')];
  const pulses=base.map((p,i)=>{p.dataset.flowBase=String(i);const clone=document.createElementNS('http://www.w3.org/2000/svg','path');clone.classList.add('cr-flow-pulse');clone.dataset.flowPulse=String(i);clone.setAttribute('stroke',i===0||i===3?'#ff787c':'#fff');clone.style.color=i===0||i===3?'#ff787c':'#fff';clone.setAttribute('d',p.getAttribute('d'));svg.append(clone);new MutationObserver(()=>clone.setAttribute('d',p.getAttribute('d'))).observe(p,{attributes:true,attributeFilter:['d']});return clone;});
  const caption=document.createElement('div');caption.className='cr-flow-description';caption.innerHTML='<span>概念演示</span><p role="status" aria-live="polite">悬停或点击部件，查看电能与信号如何经过控制器。</p><button type="button" class="cr-live-reset">查看完整链路</button>';diagram.after(caption);
  const routes=[[0,3],[1,3],[2,3],[0,3],[4],[5]];
  const descriptions=['电池 → 控制器 → 电机：红色链路说明电能的输入、调节与输出。','油门 → 控制器：采集加速指令，再协调电机的动力输出。','刹车 → 控制器：采集制动指令，调整动力输出；具体策略由车型配置决定。','控制器 → 电机：依据输入指令与控制策略，调节动力输出。','控制器 ↔ 仪表：运行数据与状态在车端交互，具体协议按型号确认。','控制器 ↔ IoT / 诊断：连接终端与调试方向，实际接口以项目资料为准。'];
  let pinned=-1;const buttons=[];
  function select(index){svg.dataset.flowActive=String(index>=0);diagram.dataset.activeFlow=String(index);base.forEach((p,i)=>{const active=index>=0&&routes[index].includes(i);p.dataset.flowSelected=String(active);pulses[i].dataset.flowSelected=String(active);});cards.forEach((card,i)=>{card.dataset.flowSelected=String(i===index);buttons[i]?.setAttribute('aria-pressed',String(i===index));});caption.querySelector('p').textContent=index<0?'悬停或点击部件，查看电能与信号如何经过控制器。':descriptions[index];}
  cards.forEach((card,i)=>{const title=card.querySelector('b')?.textContent||'部件';const button=hit(card,`查看${title}的连接链路`);buttons.push(button);card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')select(i);});card.addEventListener('pointerleave',()=>select(pinned));button.addEventListener('focus',()=>select(i));button.addEventListener('blur',()=>select(pinned));button.addEventListener('click',()=>{pinned=pinned===i?-1:i;select(pinned);});});
  caption.querySelector('button').addEventListener('click',()=>{pinned=-1;select(-1);});
  let inView=false;
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;diagram.dataset.flowVisible=String(inView&&!document.hidden);},{threshold:.1}).observe(diagram);
  document.addEventListener('visibilitychange',()=>{diagram.dataset.flowVisible=String(inView&&!document.hidden);});select(-1);
 }
 const flow=document.querySelector('.cr-protection-flow');
 if(flow){
  const cards=[...flow.querySelectorAll('article')];const titles=['监测：建立正常状态','判定：识别异常条件','处理：执行保护策略','恢复：确认条件满足'];
  const copy=['持续采集关键参数，了解当前运行状态。此处使用流程示意，不连接真实车辆。','当参数出现异常趋势时，核对触发条件与故障类型；阈值由具体型号和工况确定。','根据异常类型采取限流、降额或停机等保护动作，防止问题进一步扩大。','异常解除且恢复条件满足后，按产品策略自动或手动恢复运行；条件未满足时保持保护。'];
  const panel=document.createElement('div');panel.className='cr-protection-story';panel.innerHTML='<div><small>保护流程 · 概念演示</small><div role="status" aria-live="polite"><h3></h3><p></p></div></div><div class="cr-story-controls"><button type="button" data-story-play>演示一次异常处理</button><button type="button" data-story-reset>回到监测</button></div>';flow.after(panel);
  const play=panel.querySelector('[data-story-play]');let selected=0,timer=0,running=false;const buttons=[];
  function select(index){selected=index;flow.dataset.storyStep=String(index);cards.forEach((card,i)=>{card.dataset.storySelected=String(i===index);buttons[i]?.setAttribute('aria-pressed',String(i===index));});panel.querySelector('h3').textContent=titles[index];panel.querySelector('p').textContent=copy[index];}
  function pause(){clearTimeout(timer);running=false;play.textContent=reduced.matches?'下一步':'演示一次异常处理';play.setAttribute('aria-pressed','false');}
  function advance(){if(!running)return;select(selected+1);if(selected===3){pause();play.textContent='再次演示';}else timer=setTimeout(advance,2200);}
  cards.forEach((card,i)=>{const button=hit(card,`查看保护流程第${i+1}步：${card.querySelector('h3').textContent}`);buttons.push(button);button.addEventListener('click',()=>{pause();select(i);});});
  play.addEventListener('click',()=>{if(reduced.matches){select((selected+1)%4);return;}if(running){pause();return;}select(0);running=true;play.textContent='暂停演示';play.setAttribute('aria-pressed','true');timer=setTimeout(advance,2200);});panel.querySelector('[data-story-reset]').addEventListener('click',()=>{pause();select(0);});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)pause();},{threshold:.05}).observe(panel);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});reduced.addEventListener('change',pause);pause();select(0);
 }
})();
