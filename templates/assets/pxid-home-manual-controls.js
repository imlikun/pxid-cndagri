(function(){
  'use strict';
  var sec=document.querySelector('#pxidS1[data-hero-manual="true"]');
  var pager=sec&&sec.querySelector('.pager');
  if(!sec||!pager)return;
  var dots=Array.prototype.slice.call(pager.querySelectorAll('.BannerDot'));
  var frames=Array.prototype.slice.call(sec.querySelectorAll('.bannerPic'));
  if(dots.length<2)return;
  var controls=document.createElement('span');
  controls.className='pxid-hero-manual-controls';
  controls.setAttribute('role','group');
  controls.setAttribute('aria-label','手动切换首页画面');
  controls.innerHTML='<button type="button" class="pxid-hero-manual-button pxid-hero-manual-prev" aria-label="上一屏" title="上一屏"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6"/></svg></button><button type="button" class="pxid-hero-manual-button pxid-hero-manual-next" aria-label="下一屏" title="下一屏"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></button>';
  pager.appendChild(controls);
  var prev=controls.querySelector('.pxid-hero-manual-prev');
  var next=controls.querySelector('.pxid-hero-manual-next');
  var cursor=document.createElement('span');
  cursor.className='pxid-hero-switch-cursor';
  cursor.setAttribute('aria-hidden','true');
  cursor.innerHTML='<span class="pxid-hero-switch-cursor-bubble"><span class="pxid-hero-switch-cursor-arrow">→</span><span class="pxid-hero-switch-cursor-label">下一屏</span></span>';
  sec.appendChild(cursor);
  var arrow=cursor.querySelector('.pxid-hero-switch-cursor-arrow');
  var label=cursor.querySelector('.pxid-hero-switch-cursor-label');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  var direction=0;
  var pointer=null;
  var targetX=0,targetY=0,currentX=0,currentY=0;
  var raf=0;
  function index(){var current=dots.findIndex(function(dot){return dot.classList.contains('on');});return current<0?0:current;}
  function busy(){return frames.some(function(frame){return frame.classList.contains('in')||frame.classList.contains('out');});}
  function change(delta){if(busy()||sec.dataset.handoffLocked==="true")return;dots[(index()+delta+dots.length)%dots.length].click();}
  function hide(){direction=0;cursor.classList.remove('is-visible');sec.classList.remove('pxid-hero-follow-on');if(raf){cancelAnimationFrame(raf);raf=0;}}
  function draw(){
    raf=0;
    var amount=reduced.matches?1:.25;
    currentX+=(targetX-currentX)*amount;
    currentY+=(targetY-currentY)*amount;
    cursor.style.setProperty('--pxid-cursor-x',currentX+'px');
    cursor.style.setProperty('--pxid-cursor-y',currentY+'px');
    if(direction&&(Math.abs(targetX-currentX)>.2||Math.abs(targetY-currentY)>.2))raf=requestAnimationFrame(draw);
  }
  function follow(event){
    if(sec.dataset.handoffLocked==="true"||!fine.matches||event.pointerType==='touch'||event.target.closest('a,button,.pager,.scrEl,.slogan-f')){hide();return;}
    var bounds=sec.getBoundingClientRect();
    var x=event.clientX-bounds.left,y=event.clientY-bounds.top;
    // The opener keeps its existing product cursor in the center; its edges navigate.
    if(index()===0&&x>bounds.width*.25&&x<bounds.width*.75){hide();return;}
    direction=x<bounds.width*.5?-1:1;
    arrow.textContent=direction<0?'←':'→';
    label.textContent=direction<0?'上一屏':'下一屏';
    var radius=cursor.querySelector('.pxid-hero-switch-cursor-bubble').offsetWidth/2+10;
    targetX=Math.max(radius,Math.min(bounds.width-radius,x));
    targetY=Math.max(radius,Math.min(bounds.height-radius,y));
    if(!cursor.classList.contains('is-visible')){currentX=targetX;currentY=targetY;}
    cursor.classList.add('is-visible');sec.classList.add('pxid-hero-follow-on');
    if(!raf)raf=requestAnimationFrame(draw);
  }
  prev.addEventListener('click',function(){change(-1);});
  next.addEventListener('click',function(){change(1);});
  sec.addEventListener('pointermove',function(event){pointer=event;follow(event);});
  sec.addEventListener('pointerleave',function(){pointer=null;hide();});
  sec.addEventListener('click',function(event){
    if(!fine.matches||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.target.closest('a,button,.pager,.scrEl,.slogan-f'))return;
    var bounds=sec.getBoundingClientRect(),x=event.clientX-bounds.left;
    if(index()===0&&x>bounds.width*.25&&x<bounds.width*.75)return;
    event.preventDefault();event.stopImmediatePropagation();change(x<bounds.width*.5?-1:1);
  },true);
  sec.addEventListener('keydown',function(event){
    if(event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();change(event.key==='ArrowLeft'?-1:1);}
  });
  function sync(){prev.disabled=next.disabled=busy();if(pointer)follow(pointer);}
  frames.forEach(function(frame){new MutationObserver(sync).observe(frame,{attributes:true,attributeFilter:['class']});});
  sync();
  if(fine.addEventListener)fine.addEventListener('change',hide);
  window.addEventListener('resize',hide);
})();
