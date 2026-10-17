(function(){
  'use strict';
  var sec=document.querySelector('#pxidS1[data-photo-handoff]');
  var first=sec&&sec.querySelector('[data-hero-frame="video"]');
  var video=first&&first.querySelector('video');
  if(!video)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var photo=document.createElement('div');
  photo.className='pxid-photo-handoff';
  photo.setAttribute('aria-hidden','true');
  photo.inert=true;
  photo.innerHTML='<img class="pxid-photo-handoff-image" src="'+sec.dataset.photoHandoff+'" alt="MANTIS P6 骑行在绿色旷野中" width="2560" height="1441" decoding="async"><div class="pxid-photo-handoff-copy"><h2 class="pxid-photo-handoff-title pxid-first-film-title" aria-label="MOVE BEAUTIFULLY.">M<span>O</span>VE<br>BEAUTI<span class="slogan-f" aria-hidden="true"><span class="slogan-f-glyph">F</span><img class="slogan-f-bike" src="../templates/assets/slogan-motorcycle.svg" alt="" width="256" height="168" draggable="false"></span>ULLY.</h2><p class="pxid-photo-handoff-sub">探索更美的出现方式</p></div><a class="pxid-photo-handoff-cta" href="business.html">探索产品方案 <span aria-hidden="true">↗</span></a>';
  sec.appendChild(photo);
  var prompt=document.createElement('button');
  prompt.type='button';prompt.className='pxid-handoff-prompt';
  prompt.innerHTML='<span>滚动，展开下一程</span><i aria-hidden="true">↓</i>';
  sec.appendChild(prompt);
  var label=prompt.querySelector('span');
  var image=photo.querySelector('img');
  var active=false,ready=false,failed=false,imageFailed=false,unavailable=false,progress=0,target=0,raf=0,timeFrame=0,touchY=null,touchManaged=false,finishRequested=false;
  var classes=['pxid-handoff-outro','pxid-handoff-ready','pxid-handoff-revealing','pxid-handoff-complete','pxid-handoff-locked'];
  video.loop=false;video.removeAttribute('loop');
  function clamp(value){return Math.max(0,Math.min(1,value));}
  function isVisible(){var r=sec.getBoundingClientRect();return active&&r.top>=-8&&r.top<innerHeight*.12&&r.bottom>innerHeight*.7;}
  function lock(on){sec.classList.toggle('pxid-handoff-locked',on);sec.dataset.handoffLocked=String(on);sec.querySelector('.pager').inert=on;}
  function header(){
    var r=sec.getBoundingClientRect(),light=active&&progress>.08&&r.top>=-8&&r.bottom>100;
    document.documentElement.classList.toggle('pxid-handoff-light',light);
  }
  function paint(){
    sec.style.setProperty('--pxid-handoff-edge',(progress*100).toFixed(3)+'%');
    sec.dataset.handoffProgress=progress.toFixed(4);
    sec.classList.toggle('pxid-handoff-revealing',progress>0&&progress<.999);
    sec.classList.toggle('pxid-handoff-complete',progress>=.999);
    photo.inert=progress<.999;photo.setAttribute('aria-hidden',String(progress<.999));
    lock(active&&!failed&&(ready||finishRequested)&&progress<.999&&!reduced.matches);
    label.textContent=progress>=.999?'继续滚动，探索 PXID':'滚动，展开下一程';
    header();
  }
  function animate(){
    raf=0;
    progress=reduced.matches?target:progress+(target-progress)*.17;
    if(Math.abs(target-progress)<.001)progress=target;
    paint();
    if(progress!==target)raf=requestAnimationFrame(animate);
  }
  function reveal(value){target=clamp(value);if(!raf)raf=requestAnimationFrame(animate);}
  function freeze(){
    if(!active||failed)return;
    video.pause();ready=true;finishRequested=false;
    sec.classList.add('pxid-handoff-outro','pxid-handoff-ready');
    if(reduced.matches)reveal(1);else paint();
  }
  function time(){
    timeFrame=0;
    if(!active||ready||failed||video.paused)return;
    if(Number.isFinite(video.duration)&&video.duration>1){
      var remaining=video.duration-video.currentTime;
      if(remaining<=.8){sec.classList.add('pxid-handoff-outro');lock(true);}
    }
    timeFrame=requestAnimationFrame(time);
  }
  function requestFinish(){
    if(finishRequested||ready||failed)return;
    finishRequested=true;
    if(Number.isFinite(video.duration)&&video.duration>1){
      video.currentTime=Math.max(video.currentTime,video.duration-.8);
      sec.classList.add('pxid-handoff-outro');lock(true);
      video.play().catch(function(){freeze();});
    }else{finishRequested=false;unavailable=true;lock(false);}
  }
  function input(delta,event){
    if(reduced.matches||failed||unavailable||!isVisible()||!delta)return false;
    if(ready&&progress>=.999&&target>=1&&delta>0)return false;
    if(ready&&progress<=0&&delta<0)return false;
    if(event){event.preventDefault();event.stopImmediatePropagation();}
    if(!ready){if(delta>0)requestFinish();return true;}
    reveal(target+delta/Math.max(540,innerHeight*.82));
    return true;
  }
  function reset(){
    ready=false;failed=imageFailed||!!video.error;finishRequested=false;progress=target=0;
    classes.forEach(function(name){sec.classList.remove(name);});
    if(raf)cancelAnimationFrame(raf);raf=0;
    photo.inert=true;photo.setAttribute('aria-hidden','true');
    sec.dataset.handoffLocked='false';paint();
  }
  function sync(){
    var next=(first.classList.contains('on')||first.classList.contains('in'))&&!first.classList.contains('out');
    if(next===active)return;
    active=next;
    if(active){reset();if(reduced.matches){ready=true;sec.classList.add('pxid-handoff-outro','pxid-handoff-ready');reveal(1);}else if(!video.paused)time();}
    else{if(timeFrame)cancelAnimationFrame(timeFrame);timeFrame=0;if(raf)cancelAnimationFrame(raf);raf=0;classes.forEach(function(name){sec.classList.remove(name);});lock(false);photo.inert=true;photo.setAttribute('aria-hidden','true');header();}
  }
  video.addEventListener('play',function(){if(!timeFrame&&active&&!ready)time();});
  video.addEventListener('ended',freeze);
  video.addEventListener('loadedmetadata',function(){unavailable=false;});
  video.addEventListener('error',function(){failed=true;lock(false);sec.classList.remove('pxid-handoff-outro');});
  image.addEventListener('error',function(){imageFailed=failed=true;lock(false);sec.classList.remove('pxid-handoff-outro','pxid-handoff-ready');});
  image.decode().catch(function(){});
  new MutationObserver(sync).observe(first,{attributes:true,attributeFilter:['class']});
  window.addEventListener('wheel',function(event){
    if(event.ctrlKey||event.target.closest('header,footer,input,textarea,select,.layer-pop,.pxid-nav-drop'))return;
    input(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1),event);
  },{capture:true,passive:false});
  window.addEventListener('touchstart',function(event){touchManaged=false;touchY=event.touches.length===1?event.touches[0].clientY:null;},{passive:true});
  window.addEventListener('touchmove',function(event){
    if(touchY===null||event.touches.length!==1||event.target.closest('header,a,button,input,textarea'))return;
    var next=event.touches[0].clientY,delta=touchY-next;touchY=next;
    if(touchManaged&&ready&&progress>=.999){event.preventDefault();event.stopImmediatePropagation();return;}
    if(input(delta*1.6,event))touchManaged=true;
  },{capture:true,passive:false});
  window.addEventListener('touchend',function(){touchY=null;touchManaged=false;},{passive:true});
  window.addEventListener('keydown',function(event){
    if(event.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
    if(event.key==='ArrowDown'||event.key==='PageDown'||event.key===' ')input(innerHeight*.26,event);
    if(event.key==='ArrowUp'||event.key==='PageUp')input(-innerHeight*.26,event);
    if(event.key==='End'&&active){ready=true;video.pause();sec.classList.add('pxid-handoff-outro');reveal(1);}
  },true);
  window.addEventListener('click',function(event){
    if(!active||!sec.contains(event.target)||event.target.closest('.pxid-handoff-prompt,header'))return;
    if(sec.dataset.handoffLocked==='true'){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  prompt.addEventListener('click',function(){
    if(progress>=.999){window.scrollTo({top:sec.offsetTop+sec.offsetHeight,behavior:reduced.matches?'instant':'smooth'});return;}
    if(!ready){requestFinish();return;}
    reveal(1);
  });
  window.addEventListener('scroll',header,{passive:true});
  window.addEventListener('resize',header,{passive:true});
  window.addEventListener('pointermove',function(event){
    if(!active||event.pointerType==='touch'||event.target.closest('header')||!sec.contains(event.target))return;
    var nav=document.querySelector('header');
    if(nav&&event.clientY<nav.getBoundingClientRect().bottom){
      sec.querySelectorAll('.pxid-first-film-cursor,.pxid-hero-switch-cursor').forEach(function(cursor){cursor.classList.remove('visible','is-visible');});
      sec.classList.remove('pxid-hero-follow-on');event.stopImmediatePropagation();
    }
  },true);
  reduced.addEventListener('change',function(){if(reduced.matches&&active){video.pause();ready=true;sec.classList.add('pxid-handoff-outro','pxid-handoff-ready');reveal(1);}});
  sync();
})();
