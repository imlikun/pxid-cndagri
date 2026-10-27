/* Share compact navigation and content sizing across the actual site pages. */
(function(){
 'use strict';
 var frame=0,last='';
 function sync(){
  frame=0;var root=document.documentElement,w=root.clientWidth,h=window.visualViewport?visualViewport.height:innerHeight,touch=navigator.maxTouchPoints>0;
  var handheld=touch&&(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||navigator.platform==='MacIntel'||(navigator.userAgentData&&navigator.userAgentData.mobile));
  var compact=w<=1200||(touch&&w<=1400)||handheld,profile=w<760?'outer':'inner',key=w+'|'+Math.round(h)+'|'+touch;
  if(key===last)return;last=key;root.dataset.pxidSiteCompact=String(compact);root.dataset.pxidSiteProfile=compact?profile:'desktop';
  root.style.setProperty('--pxid-site-header-height',(w>=760&&h>=560?72:64)+'px');
  root.style.setProperty('--pxid-site-logo-width',w>=760?'110px':'96px');
  root.style.setProperty('--pxid-page-scroll-padding',(parseFloat(getComputedStyle(root).scrollPaddingTop)||0)+'px');
  root.style.setProperty('--pxid-qr-size',w<380?'80px':'96px');
  var menu=document.getElementById('menu');if(!compact&&menu&&menu.getAttribute('aria-expanded')==='true'){menu.click();var first=document.querySelector('header .pcNav a');if(first)first.focus({preventScroll:true});}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(sync);}
 function retainPageOnRotation(){
  // The legacy bundle reloads on aspect-ratio changes; folds must reflow in place.
  var handler=window.onresize,source=handler?String(handler):'';
  if(source.indexOf('location.reload')!==-1&&source.indexOf('innerWidth')!==-1&&source.indexOf('innerHeight')!==-1)window.onresize=null;
  schedule();
 }
 function ready(){
  sync();window.addEventListener('resize',schedule,{passive:true});if(window.visualViewport)visualViewport.addEventListener('resize',schedule,{passive:true});
  retainPageOnRotation();if(document.readyState!=='complete')window.addEventListener('load',function(){setTimeout(retainPageOnRotation,0);},{once:true});
  var observer=new ResizeObserver(schedule);observer.observe(document.documentElement);
  var model=document.getElementById('biz2Modal');if(model){
   var opened=false,returnFocus=null;
   function modalState(){var on=!model.hidden;if(on&&!opened){returnFocus=document.activeElement;var close=model.querySelector('.biz2-x');if(close)close.focus({preventScroll:true});}else if(!on&&opened&&returnFocus&&returnFocus.isConnected)returnFocus.focus({preventScroll:true});opened=on;}
   new MutationObserver(modalState).observe(model,{attributes:true,attributeFilter:['hidden']});modalState();
   document.addEventListener('keydown',function(e){if(!opened||e.key!=='Tab')return;var controls=Array.from(model.querySelectorAll('a[href],button,input,[tabindex="0"]')).filter(function(n){return n.getClientRects().length&&!n.disabled;});if(!controls.length)return;var first=controls[0],lastControl=controls[controls.length-1],active=document.activeElement;if(e.shiftKey&&(active===first||!model.contains(active))){e.preventDefault();lastControl.focus();}else if(!e.shiftKey&&(active===lastControl||!model.contains(active))){e.preventDefault();first.focus();}});
  }
  var stages=document.getElementById('odm-stages');if(stages){
   var belt=stages.querySelector('.f3-idx-a');if(belt){var measure=function(){var height=Math.ceil(belt.getBoundingClientRect().height);document.documentElement.style.setProperty('--pxid-odm-belt-height',height+'px');var placeholder=belt.previousElementSibling;if(belt.classList.contains('belt-fixed')&&placeholder&&placeholder.style.height)placeholder.style.height=height+'px';};var beltObserver=new ResizeObserver(measure);beltObserver.observe(belt);measure();}
  }
 }
 sync();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
