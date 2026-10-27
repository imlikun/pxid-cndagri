/* Size compact homepage sections from their visible content, including after folding. */
(function(){
 'use strict';
 var scheduled=0,watched=new WeakMap();
 var overviewCSS='html.pxid-overview-compact,html.pxid-overview-compact body{height:auto!important;min-height:0!important;overflow:hidden!important}html.pxid-overview-compact body{display:block!important;max-width:1280px;margin:0 auto!important;padding:36px 20px;--overview-title:34px}.pxid-overview-compact .left{position:static!important;inset:auto!important;width:auto!important;height:auto!important;min-width:0;padding:0!important;display:flex;flex-direction:column}.pxid-overview-compact .left h2{font-size:var(--overview-title)!important;line-height:1.16;letter-spacing:-.025em;margin-bottom:18px}.pxid-overview-compact .left .sub{font-size:14px;line-height:1.75;max-width:none}.pxid-overview-compact .nums{gap:20px 16px;margin:24px 0 0}.pxid-overview-compact .nums>div{padding-top:12px}.pxid-overview-compact .nums b{font-size:26px;line-height:1.12}.pxid-overview-compact .nums span{font-size:12px;line-height:1.5;margin-top:6px}.pxid-overview-compact .cta{margin-top:24px;min-width:0;min-height:44px;height:44px;padding:0 14px;font-size:14px;gap:12px;border-radius:5px;box-shadow:none}.pxid-overview-compact .cta i{width:22px;height:22px;font-size:12px}.pxid-overview-compact .right{position:static!important;inset:auto!important;width:auto!important;height:auto!important;min-width:0;margin:24px 0 0;gap:10px;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}.pxid-overview-compact .card.big{grid-column:1/-1;grid-row:auto;aspect-ratio:16/9}.pxid-overview-compact .card:not(.big){aspect-ratio:4/3}.pxid-overview-compact .cap{padding:12px;gap:6px}.pxid-overview-compact .cap .n{font-size:22px}.pxid-overview-compact .cap .t{font-size:16px}.pxid-overview-compact .cap .s{font-size:12px;line-height:1.5}.pxid-overview-compact[data-overview-layout="inner"] body{display:grid!important;grid-template-columns:minmax(0,.95fr) minmax(0,1.05fr);align-items:center;gap:28px;padding:40px 32px;--overview-title:40px}.pxid-overview-compact[data-overview-layout="inner"] .right{height:var(--overview-images-height,430px)!important;margin:0;grid-template-columns:57fr 40fr;grid-template-rows:1fr 1fr}.pxid-overview-compact[data-overview-layout="inner"] .card.big{grid-column:1;grid-row:1/3;aspect-ratio:auto}.pxid-overview-compact[data-overview-layout="inner"] .card:not(.big){aspect-ratio:auto}.pxid-overview-compact[data-overview-layout="inner"] .cap{padding:10px}.pxid-overview-compact[data-overview-layout="inner"] .cap .t{font-size:14px}.pxid-overview-compact[data-overview-layout="inner"] .cap .s{font-size:11px}';
 function schedule(){if(scheduled)return;scheduled=requestAnimationFrame(function(){scheduled=0;refresh();});}
 function prepare(frame,type){
  var d;try{d=frame.contentDocument;}catch(e){return;}if(!d||!d.body)return;
  var previous=watched.get(frame);if(previous&&previous.doc===d)return;
  if(previous)previous.observer.disconnect();
  var style=d.createElement('style');style.id='pxid-compact-content-fit';
  if(type==='overview')style.textContent=overviewCSS;
  if(type==='products')style.textContent='html.pxid-home-content-compact,html.pxid-home-content-compact body{height:auto!important;min-height:0!important}html.pxid-home-content-compact body{display:block!important}.pxid-home-content-compact #P{padding-bottom:32px!important;min-height:0!important;transform:none!important}';
  if(type==='map')style.textContent='html.pxid-home-map-compact,html.pxid-home-map-compact body{height:auto!important;min-height:0!important;display:block!important}.pxid-home-map-compact #m1{height:auto!important;min-height:0!important;transform:none!important;padding:36px 20px 28px!important}.pxid-home-map-compact #m1 .stage{position:static;inset:auto;display:flex;flex-direction:column;gap:20px;max-width:1280px;margin:0 auto}.pxid-home-map-compact #m1 .mapsvg{position:static!important;inset:auto!important;transform:none!important;max-width:none!important;width:min(100%,680px)!important;height:auto!important;aspect-ratio:1000/1007;align-self:center;order:2}.pxid-home-map-compact #m1 .m1txt{position:static;inset:auto;max-width:none;order:1}.pxid-home-map-compact #m1 .m1txt h2{font-size:34px;line-height:1.15;margin:12px 0 14px}.pxid-home-map-compact #m1 .eyebrow{font-size:11px}.pxid-home-map-compact #m1 .lede{font-size:14px;line-height:1.75}.pxid-home-map-compact #m1 .bar{margin-bottom:14px}.pxid-home-map-compact #m1 .note{font-size:9px;bottom:10px;right:16px}.pxid-home-map-compact[data-map-layout="inner"] #m1{padding:40px 32px 28px!important}.pxid-home-map-compact[data-map-layout="inner"] #m1 .stage{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);align-items:center;gap:32px}.pxid-home-map-compact[data-map-layout="inner"] #m1 .m1txt h2{font-size:40px}';
  d.head.appendChild(style);
  if(type==='overview')d.querySelectorAll('a[href]').forEach(function(a){a.target='_top';});
  var observer=new ResizeObserver(schedule);observer.observe(d.body);
  var content=d.querySelector(type==='overview'?'.left':type==='map'?'#m1':'#P');if(content)observer.observe(content);
  var right=d.querySelector('.right');if(type==='overview'&&right)observer.observe(right);
  watched.set(frame,{doc:d,observer:observer});
  d.addEventListener('DOMContentLoaded',schedule,{once:true});
  if(d.fonts)d.fonts.ready.then(schedule);
 }
 function setHeight(frame,height){height=Math.ceil(height);if(height>0&&Math.abs(frame.getBoundingClientRect().height-height)>1)frame.style.height=height+'px';}
 function refresh(){
  var width=document.documentElement.clientWidth,touch=navigator.maxTouchPoints>0;
  var handheld=touch&&(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||navigator.platform==='MacIntel'||(navigator.userAgentData&&navigator.userAgentData.mobile));
  var compact=width<=1200||(touch&&width<=1400)||handheld;
  document.documentElement.dataset.pxidCompact=String(compact);
  var viewHeight=window.visualViewport?visualViewport.height:innerHeight;
  document.documentElement.style.setProperty('--pxid-manufacturing-height',Math.round(Math.min(520,Math.max(280,width*.56)))+'px');
  document.documentElement.style.setProperty('--pxid-cooperation-height',Math.round(Math.min(640,Math.max(500,viewHeight*.72)))+'px');
  [['.pxid-s7frame','overview'],['.pxid-s4frame','products'],['.pxid-s6frame','map']].forEach(function(item){
   var frame=document.querySelector(item[0]);if(!frame||frame.hidden)return;prepare(frame,item[1]);
   var info=watched.get(frame);if(!info)return;var d=info.doc;
   d.documentElement.classList.toggle(item[1]==='overview'?'pxid-overview-compact':item[1]==='map'?'pxid-home-map-compact':'pxid-home-content-compact',compact);
   if(item[1]==='overview'){
    d.documentElement.dataset.overviewLayout=width>=760?'inner':'outer';
    d.documentElement.style.setProperty('--overview-images-height',Math.round(Math.min(480,Math.max(380,viewHeight*.5)))+'px');
    if(compact){var left=d.querySelector('.left'),right=d.querySelector('.right');if(left&&right)setHeight(frame,d.body.getBoundingClientRect().height);}
    else frame.style.height='';
   }else if(item[1]==='map'){
    d.documentElement.dataset.mapLayout=width>=760?'inner':'outer';
    if(compact){var map=d.querySelector('#m1');if(map)setHeight(frame,map.getBoundingClientRect().height);}else frame.style.height='';
   }else if(compact){var root=d.querySelector('#P');if(root){root.style.transform='';setHeight(frame,root.getBoundingClientRect().height);}}
  });
 }
 document.querySelectorAll('.pxid-s7frame,.pxid-s4frame,.pxid-s6frame').forEach(function(frame){frame.addEventListener('load',function(){prepare(frame,frame.classList.contains('pxid-s7frame')?'overview':frame.classList.contains('pxid-s6frame')?'map':'products');schedule();});});
 window.addEventListener('resize',schedule,{passive:true});if(window.visualViewport)visualViewport.addEventListener('resize',schedule,{passive:true});
 var rootObserver=new ResizeObserver(schedule);rootObserver.observe(document.documentElement);refresh();
})();
