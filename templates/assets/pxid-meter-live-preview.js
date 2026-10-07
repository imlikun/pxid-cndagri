(() => {
 'use strict';
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const NS='http://www.w3.org/2000/svg';
 function mount(id,kind){
  const figure=document.querySelector(`#${id} .meter-visual`), img=figure?.querySelector('img');if(!img)return;
  const stage=document.createElement('div');stage.className='meter-live-stage';stage.dataset.preview=kind;img.before(stage);stage.append(img);
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1536 1024');svg.setAttribute('aria-hidden','true');svg.classList.add('meter-live-glass');
  const defs=`<defs><linearGradient id="${kind}-glass" x2=".8" y2="1"><stop stop-color="#151b1f"/><stop offset=".55" stop-color="#080d10"/><stop offset="1" stop-color="#11161a"/></linearGradient><clipPath id="${kind}-clip"><path d="${kind==='speed'?'M195 242H1340L1426 330V588L1330 670H204L110 588V330Z':'M610 337L1351 343L1410 411L1385 645L1332 700L574 643L516 585L548 411Z'}"/></clipPath></defs>`;
  if(kind==='speed'){
   svg.innerHTML=defs+`<g clip-path="url(#speed-clip)"><path d="M195 242H1340L1426 330V588L1330 670H204L110 588V330Z" fill="url(#speed-glass)"/><text x="768" y="313" text-anchor="middle" fill="#64e6c4" font-size="31" font-weight="600">READY</text><text data-speed x="768" y="480" text-anchor="middle" fill="#fff" font-size="190" font-weight="700" letter-spacing="-8">48</text><text x="768" y="525" text-anchor="middle" fill="#c5ccd4" font-size="35">km/h</text><path d="M270 565H1264" stroke="#535b64"/><path d="M578 551H961" stroke="#e9232d" stroke-width="3"/><rect x="332" y="591" width="83" height="37" rx="5" stroke="#fff" fill="none" stroke-width="3"/><path d="M418 603v13" stroke="#fff" stroke-width="5"/><path d="M340 598v23m18-23v23m18-23v23" stroke="#61edc6" stroke-width="12"/><text x="444" y="622" fill="#fff" font-size="34">82%</text><path d="M610 589v41M928 589v41" stroke="#788088"/><text data-gear x="768" y="622" text-anchor="middle" fill="#fff" font-size="49" font-weight="600">D</text><text x="996" y="622" fill="#a9b3c0" font-size="28">TRIP</text><text x="1080" y="622" fill="#fff" font-size="34">12.8 km</text></g>`;
  }else{
   // Place the live map and turn prompt in the photographed glass planes.
   svg.innerHTML=defs+`<defs><clipPath id="phone-map-clip"><path d="M114 254L379 237L431 695L162 734Z"/></clipPath></defs><g clip-path="url(#phone-map-clip)"><g transform="matrix(.98 -.062 .108 1.04 114 254)"><rect width="280" height="460" fill="#172329"/><g stroke="#35464f" stroke-width="4" fill="none"><path d="M0 46H280M0 112H280M0 197H280M0 287H280M0 376H280M30 0V460M93 0V460M172 0V460M240 0V460M0 420L280 84"/></g><path d="M23 165H67V209H23ZM193 265H243V312H193Z" fill="#24483b"/><path data-route d="M62 370L111 280L111 100L212 100L212 28" fill="none" stroke="#2cddd6" stroke-width="9" stroke-linejoin="round"/><circle cx="212" cy="28" r="12" fill="#10272e" stroke="#66fff4" stroke-width="5"/><g data-cursor transform="translate(62 370)"><circle r="22" fill="#41ede5" opacity=".18"/><path d="M0-15L12 12L0 7L-12 12Z" fill="#d1fff8" stroke="#21d6d0" stroke-width="3"/></g><rect y="390" width="280" height="70" rx="12" fill="#0b181e"/><text x="18" y="419" fill="#fff" font-size="20" font-weight="600">路线预览</text><text data-phone-instruction x="18" y="443" fill="#80e8dd" font-size="14">前方 300 m 右转</text></g></g><g clip-path="url(#navigation-clip)"><path d="M610 337L1351 343L1410 411L1385 645L1332 700L574 643L516 585L548 411Z" fill="url(#navigation-glass)"/><g transform="matrix(.93 .062 -.10 .87 613 350)"><text x="20" y="45" fill="#9ce9d9" font-size="23">NAVIGATION</text><path data-turn d="M220 210V156Q220 117 259 117H300M278 85L315 117L278 148" stroke="#fff" fill="none" stroke-width="22" stroke-linejoin="round"/><text data-distance x="375" y="178" fill="#fff" font-size="92" font-weight="700">300</text><text x="589" y="178" fill="#fff" font-size="58">m</text><text data-direction x="377" y="225" fill="#bdc8d3" font-size="25">TURN RIGHT</text><path d="M0 260H812" stroke="#4a5560"/><text x="108" y="324" fill="#fff" font-size="40">24<tspan font-size="23" fill="#c1ccd6"> km/h</tspan></text><rect x="387" y="295" width="60" height="29" rx="4" fill="none" stroke="#e2f7f3" stroke-width="3"/><path d="M396 301v17m15-17v17m15-17v17" stroke="#6be8c6" stroke-width="9"/><text x="468" y="323" fill="#fff" font-size="29">82%</text><text x="705" y="328" fill="#fff" font-size="45">D</text></g></g>`;
  }
  stage.append(svg);
  const hit=document.createElement('button');hit.type='button';hit.className='meter-live-hit';hit.setAttribute('aria-label',kind==='speed'?'播放或暂停仪表读数演示':'播放或暂停手机导航联动演示');stage.append(hit);
  const controls=document.createElement('div');controls.className='meter-live-controls';controls.innerHTML='<span class="meter-live-tag">概念演示</span><button type="button" data-play>播放演示</button><button type="button" data-reset>重新开始</button><span class="meter-live-status" role="status" aria-live="polite"></span>';stage.after(controls);
  const play=controls.querySelector('[data-play]'),status=controls.querySelector('[role=status]');
  let elapsed=0,running=false,pinned=false,last=0,raf=0,step=0,visible=true,lastPhase='';const duration=kind==='speed'?12000:15000;
  const ease=t=>t*t*(3-2*t);
  function render(){
   let phase;
   if(kind==='speed'){
    const t=elapsed/1000;const speed=t<1?0:t<4?Math.round(48*ease((t-1)/3)):t<8?48:t<11?Math.round(48*(1-ease((t-8)/3))):0;
    svg.querySelector('[data-speed]').textContent=String(speed).padStart(2,'0');svg.querySelector('[data-gear]').textContent=speed?'D':'P';stage.dataset.speed=String(speed);
    phase=t<1?'准备出发':t<4?'起步 · 读数随输出上升':t<8?'巡航 · 主读数保持清晰':t<11?'减速 · 读数平顺回落':'停车 · 回到驻车状态';
   }else{
    const t=elapsed/duration,route=svg.querySelector('[data-route]');
    const corner=(Math.hypot(49,90)+180)/route.getTotalLength(),first=t<corner;
    const distance=first?Math.ceil((1-t/corner)*30)*10:Math.ceil((1-(t-corner)/(1-corner))*20)*10;
    svg.querySelector('[data-distance]').textContent=String(Math.max(0,distance));svg.querySelector('[data-direction]').textContent=first?'TURN RIGHT':'ARRIVAL AHEAD';
    svg.querySelector('[data-turn]').setAttribute('d',first?'M220 210V156Q220 117 259 117H300M278 85L315 117L278 148':'M220 212V90M185 123L220 88L255 123');
    const pt=route.getPointAtLength(route.getTotalLength()*t);svg.querySelector('[data-cursor]').setAttribute('transform',`translate(${pt.x} ${pt.y})`);
    svg.querySelector('[data-phone-instruction]').textContent=first?`前方 ${distance} m 右转`:`距目的地 ${distance} m`;
    stage.dataset.distance=String(distance);stage.dataset.progress=t.toFixed(3);phase=t>=1?'已到达 · 两端提示同步完成':first?'接近路口 · 手机位置与仪表距离同步':'已转向 · 继续前往目的地';
   }
   if(phase!==lastPhase){status.textContent=phase;lastPhase=phase;}
  }
  function stop(){running=false;stage.dataset.running='false';cancelAnimationFrame(raf);play.textContent=reduced.matches?'下一场景':elapsed>=duration?'再次播放':elapsed>0?'继续演示':'播放演示';play.setAttribute('aria-pressed','false');hit.setAttribute('aria-pressed','false');}
  function tick(now){if(!running)return;elapsed=Math.min(duration,elapsed+Math.min(60,now-last));last=now;render();if(elapsed>=duration){stop();play.textContent='再次播放';pinned=false;}else raf=requestAnimationFrame(tick);}
  function start(pin=true){if(reduced.matches){step=(step+1)%5;elapsed=duration*step/4;render();return;}if(pin)pinned=true;if(running)return;if(elapsed>=duration)elapsed=0;running=true;last=performance.now();stage.dataset.running='true';play.textContent='暂停演示';play.setAttribute('aria-pressed','true');hit.setAttribute('aria-pressed','true');render();raf=requestAnimationFrame(tick);}
  function toggle(){if(running&&pinned){pinned=false;stop();}else start(true);}
  play.addEventListener('click',toggle);hit.addEventListener('click',toggle);
  controls.querySelector('[data-reset]').addEventListener('click',()=>{pinned=false;stop();elapsed=0;step=0;render();play.textContent=reduced.matches?'下一场景':'播放演示';});
  stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!reduced.matches&&!pinned&&visible)start(false);});stage.addEventListener('pointerleave',()=>{if(!pinned)stop();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){pinned=false;stop();}},{threshold:.2}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pinned=false;stop();}});reduced.addEventListener('change',()=>{pinned=false;stop();});
  play.textContent=reduced.matches?'下一场景':'播放演示';play.setAttribute('aria-pressed','false');hit.setAttribute('aria-pressed','false');render();
 }
 mount('hierarchy','speed');mount('link','navigation');
})();
