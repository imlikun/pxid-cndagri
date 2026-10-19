/* The next real viewport: manual product carousel, independent of the film. */
(function(){
  'use strict';
  var sec=document.getElementById('pxidModelHero');if(!sec)return;
  var slides=Array.prototype.slice.call(sec.querySelectorAll('.pxid-model-slide'));
  var dots=Array.prototype.slice.call(sec.querySelectorAll('[data-model-index]'));
  var frame=sec.querySelector('.pxid-p6-layered'),current=0,visible=false,ready=false,changing=false,timer;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  function play(){frame.classList.remove('is-layered-playing');if(current===0&&visible&&ready){void frame.offsetWidth;frame.classList.add('is-layered-playing');}}
  function change(index){
    if(changing)return;index=(index+slides.length)%slides.length;
    if(index===current){if(index===0)play();return;}
    current=index;changing=true;clearTimeout(timer);
    slides.forEach(function(n,i){n.classList.toggle('is-active',i===current);n.inert=i!==current;n.setAttribute('aria-hidden',String(i!==current));});
    dots.forEach(function(n,i){n.classList.toggle('is-active',i===current);if(i===current)n.setAttribute('aria-current','true');else n.removeAttribute('aria-current');});
    sec.dataset.activeModel=slides[current].dataset.model;play();
    timer=setTimeout(function(){changing=false;},reduced.matches?0:450);
  }
  slides.forEach(function(n,i){n.inert=i!==0;});sec.dataset.activeModel='p6-motion';
  dots.forEach(function(n){n.addEventListener('click',function(){change(Number(n.dataset.modelIndex));});});
  sec.querySelector('[data-model-prev]').addEventListener('click',function(){change(current-1);});
  sec.querySelector('[data-model-next]').addEventListener('click',function(){change(current+1);});
  sec.addEventListener('keydown',function(e){if(e.target.closest('input,textarea,select'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();change(current+(e.key==='ArrowLeft'?-1:1));}});
  var touch=null;
  sec.addEventListener('pointerdown',function(e){if(e.pointerType==='touch')touch={x:e.clientX,y:e.clientY};});
  sec.addEventListener('pointerup',function(e){if(!touch)return;var x=e.clientX-touch.x,y=e.clientY-touch.y;touch=null;if(Math.abs(x)>50&&Math.abs(x)>Math.abs(y)*1.3)change(current+(x<0?1:-1));});
  sec.addEventListener('pointercancel',function(){touch=null;});
  var cursor=document.createElement('span');cursor.className='pxid-hero-switch-cursor';cursor.setAttribute('aria-hidden','true');
  cursor.innerHTML='<span class="pxid-hero-switch-cursor-bubble"><span class="pxid-hero-switch-cursor-arrow">→</span><span class="pxid-hero-switch-cursor-label">下一车型</span></span>';sec.appendChild(cursor);
  function hide(){cursor.classList.remove('is-visible');sec.classList.remove('pxid-hero-follow-on');}
  sec.addEventListener('pointermove',function(e){
    if(!fine.matches||e.pointerType==='touch'||e.target.closest('a,button,.pxid-model-controls')){hide();return;}
    var r=sec.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,left=x<r.width/2;
    cursor.style.setProperty('--pxid-cursor-x',Math.max(65,Math.min(r.width-65,x))+'px');cursor.style.setProperty('--pxid-cursor-y',Math.max(65,Math.min(r.height-65,y))+'px');
    cursor.querySelector('.pxid-hero-switch-cursor-arrow').textContent=left?'←':'→';cursor.querySelector('.pxid-hero-switch-cursor-label').textContent=left?'上一车型':'下一车型';cursor.classList.add('is-visible');sec.classList.add('pxid-hero-follow-on');
  });
  sec.addEventListener('pointerleave',hide);
  sec.addEventListener('click',function(e){if(!fine.matches||e.button!==0||e.target.closest('a,button,.pxid-model-controls')||e.ctrlKey||e.metaKey)return;change(current+(e.clientX-sec.getBoundingClientRect().left<sec.clientWidth/2?-1:1));});
  function header(){var r=sec.getBoundingClientRect();document.documentElement.classList.toggle('pxid-model-view',r.top<=100&&r.bottom>100);}
  new IntersectionObserver(function(entries){var next=entries[0].intersectionRatio>=.50;if(next!==visible){visible=next;play();}header();},{threshold:[0,.25,.5,.75,1]}).observe(sec);
  window.addEventListener('scroll',header,{passive:true});window.addEventListener('resize',function(){header();hide();},{passive:true});
  Promise.all(Array.prototype.map.call(frame.querySelectorAll('img'),function(img){return img.decode?img.decode().catch(function(){}):Promise.resolve();})).then(function(){ready=true;frame.classList.add('is-layered-ready');play();});
  reduced.addEventListener('change',play);header();
})();
