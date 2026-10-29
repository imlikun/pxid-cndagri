(function(){
 'use strict';
 var names=['.biz2-grid','.about-metrics','.about-equipment-grid','.cr-protection-flow','.cr-thermal-list','.cr-selection-steps','.cr-vehicle-cards','.prod-steps','.prod-related-grid','.mr-thermal-cards','.mr-adv-cards','.mr-selection-cards','.mr-project-cards','.dl-steps','.odm-handoff-list','.prod-grid__cards','.iot-cap-grid','.iot-scenario-grid'];
 var injected=false, scheduled=0;
 function roots(){var a=[document],host=document.querySelector('.pxid-iot-host');if(host&&host.shadowRoot){a.push(host.shadowRoot);if(!injected){var st=document.createElement('style');st.textContent=window.__pxidRailCss;host.shadowRoot.appendChild(st);injected=true}}return a}
 function update(){
  scheduled=0;var compact=Math.min(document.documentElement.clientWidth,window.innerWidth)<=700;
  roots().forEach(function(root){
   root.querySelectorAll(names.join(',')).forEach(function(el){
    if(el.id==='biz2Grid'&&!el.dataset.pxidRailObserved){el.dataset.pxidRailObserved='1';new MutationObserver(function(){el.scrollLeft=0;schedule()}).observe(el,{childList:true})}
    var on=compact&&el.children.length>1;el.classList.toggle('pxid-inner-rail',on);
    if(on&&!el.hasAttribute('tabindex')){el.setAttribute('tabindex','0');el.dataset.pxidRailTab='1'}
    if(on&&!el.hasAttribute('aria-label')){el.setAttribute('aria-label','可左右滑动查看更多');el.dataset.pxidRailLabel='1'}
    if(!on&&el.dataset.pxidRailTab){el.removeAttribute('tabindex');delete el.dataset.pxidRailTab}
    if(!on&&el.dataset.pxidRailLabel){el.removeAttribute('aria-label');delete el.dataset.pxidRailLabel}
   });
   root.querySelectorAll('main section, #pxiot section, .mr-stator-inner, .mr-thermal-grid, .mr-parameters, .mr-selection-inner, .mr-project-inner, .cr-applications-inner').forEach(function(el){
    if(el.matches('.banner,.pxid-cinema,.news-section,.odm-stage-grid'))return;
    el.classList.remove('pxid-inner-tight-top','pxid-inner-tight-bottom');
    if(!compact)return;var s=getComputedStyle(el);
    if(parseFloat(s.paddingTop)>56)el.classList.add('pxid-inner-tight-top');
    if(parseFloat(s.paddingBottom)>56)el.classList.add('pxid-inner-tight-bottom');
   });
  });
 }
 function schedule(){if(!scheduled)scheduled=requestAnimationFrame(update)}
 window.__pxidRailCss="/* Compact, touch-first rails for related cards on inner pages. */\n.pxid-inner-rail{display:flex!important;grid-template-columns:none!important;grid-auto-flow:initial!important;align-items:stretch!important;gap:12px!important;overflow-x:auto!important;overflow-y:hidden!important;overscroll-behavior-x:contain;touch-action:pan-x pan-y;scroll-snap-type:x proximity;scrollbar-width:thin;scrollbar-color:#d71920 #dedfe1;padding-bottom:10px!important;-webkit-overflow-scrolling:touch}\n.pxid-inner-rail::-webkit-scrollbar{height:3px}\n.pxid-inner-rail::-webkit-scrollbar-thumb{background:#d71920;border-radius:4px}\n.pxid-inner-rail::-webkit-scrollbar-track{background:#dedfe1}\n.pxid-inner-rail>*{flex:0 0 85%!important;min-width:0!important;width:85%!important;max-width:none!important;scroll-snap-align:start;scroll-snap-stop:normal}\n.pxid-inner-rail:focus-visible{outline:2px solid #d71920;outline-offset:3px}\n.pxid-inner-tight-top{padding-top:44px!important}\n.pxid-inner-tight-bottom{padding-bottom:48px!important}\n.about-metrics.pxid-inner-rail>*{flex-basis:43%!important;width:43%!important}\n.cr-protection-flow.pxid-inner-rail>article::after,.cr-selection-steps.pxid-inner-rail>article::after{display:none!important}\n";
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});else update();
 window.addEventListener('resize',schedule,{passive:true});window.addEventListener('load',schedule,{once:true});
})();
