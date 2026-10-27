/* Observe real layout state across folding screens; retain each selected gallery image. */
(function(){
 'use strict';
 function ready(){
  var notes=Array.from(document.querySelectorAll('.f3-stage-notes')),compact=null;
  function sync(){var next=document.documentElement.dataset.pxidSiteCompact==='true';if(next===compact)return;compact=next;notes.forEach(function(n){n.open=!next;});}
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-pxid-site-compact']});sync();
  var groups=[['.about-research-grid','设计与工程'],['.about-process-grid','六大制造工艺'],['.about-quality-flow','质量管理环节'],['.about-digital-grid','数字工厂'],['.about-certificates','设计奖项与证书']];
  groups.forEach(function(group){
   var rail=document.querySelector('#app.pxid-about '+group[0]);if(!rail)return;
   rail.classList.add('about-compact-rail');rail.setAttribute('role','region');rail.setAttribute('aria-label',group[1]+'，可左右滑动');rail.setAttribute('tabindex','0');rail.setAttribute('data-lenis-prevent','');rail.setAttribute('data-lenis-prevent-touch','');
   var cards=Array.from(rail.querySelectorAll(group[0]==='.about-quality-flow'?'li':group[0]==='.about-certificates'?'figure':'article')),index=0,frame=0,lastWidth=-1,resizeFrame=0,interaction=0;
   var hint=document.createElement('p');hint.className='about-rail-hint';hint.innerHTML='<span>左右滑动</span><output aria-label="当前浏览项目"></output>';rail.after(hint);
   function update(){frame=0;var x=rail.getBoundingClientRect().left,closest=Infinity;cards.forEach(function(card,i){var d=Math.abs(card.getBoundingClientRect().left-x);if(d<closest){closest=d;index=i;}});hint.lastElementChild.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');rail.dataset.currentItem=String(index);}
   function measure(){var width=rail.clientWidth;if(Math.abs(width-lastWidth)<.5)return;lastWidth=width;var previous=index,stamp=interaction;rail.style.setProperty('--about-card-width',(width<600?width-26:width<1000?(width-38)/2:(width-50)/3)+'px');if(resizeFrame)cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(function(){resizeFrame=0;if(stamp===interaction&&document.documentElement.dataset.pxidSiteCompact==='true'&&cards[previous])rail.scrollLeft+=cards[previous].getBoundingClientRect().left-rail.getBoundingClientRect().left;update();hint.hidden=rail.scrollWidth<=rail.clientWidth+1;});}
   rail.addEventListener('pointerdown',function(){interaction++;},{passive:true});
   rail.addEventListener('scroll',function(){if(!frame)frame=requestAnimationFrame(update);},{passive:true});
   rail.addEventListener('keydown',function(e){if(e.target!==rail||document.documentElement.dataset.pxidSiteCompact!=='true')return;interaction++;var next;if(e.key==='ArrowRight')next=Math.min(cards.length-1,index+1);else if(e.key==='ArrowLeft')next=Math.max(0,index-1);else if(e.key==='Home')next=0;else if(e.key==='End')next=cards.length-1;else return;e.preventDefault();rail.scrollTo({left:rail.scrollLeft+cards[next].getBoundingClientRect().left-rail.getBoundingClientRect().left,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});});
   new ResizeObserver(measure).observe(rail);measure();
  });
  document.querySelectorAll('.f3-c-strip').forEach(function(strip){
   strip.setAttribute('aria-label','阶段照片，可左右滑动或点选');
   var dragging=false,startX=0,startY=0;
   strip.addEventListener('pointerdown',function(e){dragging=false;startX=e.clientX;startY=e.clientY;},{passive:true});
   strip.addEventListener('pointermove',function(e){if(e.buttons&&Math.abs(e.clientX-startX)>8&&Math.abs(e.clientX-startX)>Math.abs(e.clientY-startY))dragging=true;},{passive:true});
   strip.addEventListener('click',function(e){if(dragging){e.preventDefault();e.stopImmediatePropagation();dragging=false;}},true);
   var thumbs=Array.from(strip.children);
   thumbs.forEach(function(t,i){t.addEventListener('keydown',function(e){var j;if(e.key==='ArrowRight')j=(i+1)%thumbs.length;else if(e.key==='ArrowLeft')j=(i+thumbs.length-1)%thumbs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=thumbs.length-1;else return;e.preventDefault();thumbs[j].focus({preventScroll:true});thumbs[j].scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});thumbs[j].click();});});
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
