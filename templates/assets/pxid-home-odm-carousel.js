/* Existing ODM cards become one native swipe surface on compact viewports. */
(function(){
  'use strict';
  var root=document.getElementById('b3-s2');if(!root)return;
  var grid=root.querySelector('.bento'),text=root.querySelector('.t-text'),steps=root.querySelector('.steps');
  var cards=Array.from(grid.querySelectorAll(':scope>.tile[data-step]'));
  if(cards.length!==10)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)'),current=0,raf=0,isCompact=false,jump=0,painted='',targetSlide=null;
  var numbers=Array.from(steps.querySelectorAll('i'));
  steps.removeAttribute('aria-hidden');steps.setAttribute('role','group');steps.setAttribute('aria-label','选择 ODM 服务步骤');
  var buttons=numbers.map(function(n,i){
    var b=document.createElement('button');b.type='button';b.textContent=n.textContent;
    b.setAttribute('aria-label',n.textContent+' '+cards[i].querySelector('.t').textContent);
    b.addEventListener('click',function(){if(isCompact)go(i,false);else cards[i].click();});
    n.replaceWith(b);return b;
  });
  var carousel=document.createElement('div');carousel.className='odm-mobile-carousel';carousel.hidden=true;
  carousel.innerHTML='<div class="odm-carousel-viewport"><div class="odm-carousel-track" role="region" aria-label="ODM 步骤图片，可左右滑动" aria-roledescription="轮播"></div></div>';
  steps.after(carousel);
  var track=carousel.querySelector('.odm-carousel-track');
  var titleNodes=[],detailButtons=[],nextButtons=[];
  cards.forEach(function(card,i){
    card.id='odm-carousel-step-'+String(i+1).padStart(2,'0');buttons[i].setAttribute('aria-controls',card.id);
    card.setAttribute('aria-label','第 '+(i+1)+' 步：'+card.querySelector('.t').textContent+'，查看详情');
    var title=card.querySelector('.t'),details=document.createElement('button');details.type='button';details.className='t odm-step-details';details.textContent=title.textContent;details.setAttribute('aria-label','查看第 '+(i+1)+' 步 '+title.textContent+'的详情');details.setAttribute('aria-haspopup','dialog');titleNodes.push(title);detailButtons.push(details);
    var hint=document.createElement('button');hint.type='button';hint.className='odm-slide-hint';hint.hidden=true;hint.setAttribute('aria-label','下一个服务步骤');hint.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';card.appendChild(hint);nextButtons.push(hint);
    hint.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var n=(current+1)%10;go(n,n!==0);nextButtons[n].focus({preventScroll:true});});
  });
  function paint(i){
    current=Math.max(0,Math.min(9,i));
    var state=current+'|'+isCompact;if(state===painted)return;painted=state;
    buttons.forEach(function(b,k){if(isCompact)b.setAttribute('aria-pressed',String(k===current));else b.removeAttribute('aria-pressed');});
    cards.forEach(function(card,k){card.inert=isCompact&&k!==current;if(isCompact)card.setAttribute('aria-hidden',String(k!==current));else card.removeAttribute('aria-hidden');});
    root.dataset.activeStep=String(current+1).padStart(2,'0');
  }
  function go(i,animate){
    i=Math.max(0,Math.min(9,i));targetSlide=i;paint(i);
    var token=++jump,left=i*track.clientWidth;
    if(animate&&!reduced.matches){track.scrollTo({left:left,behavior:'smooth'});return;}
    // Cancel a swipe's remaining snap/momentum before a numbered jump.
    track.style.scrollSnapType='none';track.scrollTo({left:left,behavior:'instant'});
    requestAnimationFrame(function(){if(token!==jump)return;track.style.scrollSnapType='';track.scrollTo({left:i*track.clientWidth,behavior:'instant'});targetSlide=null;paint(i);});
  }
  track.addEventListener('scroll',function(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;if(!track.clientWidth)return;if(targetSlide!==null){if(Math.abs(track.scrollLeft-targetSlide*track.clientWidth)>1)return;var n=targetSlide;targetSlide=null;paint(n);}else paint(Math.round(track.scrollLeft/track.clientWidth));});},{passive:true});
  track.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var n=(current+(e.key==='ArrowRight'?1:9))%10,arrow=e.target.classList.contains('odm-slide-hint');go(n,Math.abs(n-current)===1);(arrow?nextButtons[n]:detailButtons[n]).focus({preventScroll:true});}});
  var pointer=null,dragged=false;
  track.addEventListener('pointerdown',function(e){pointer={x:e.clientX,y:e.clientY};dragged=false;targetSlide=null;++jump;track.style.scrollSnapType='';});
  track.addEventListener('pointermove',function(e){if(pointer&&Math.abs(e.clientX-pointer.x)>8)dragged=true;});
  track.addEventListener('pointercancel',function(){pointer=null;});
  track.addEventListener('click',function(e){if(dragged&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}pointer=null;dragged=false;},true);

  // Existing detail content is hosted by the parent page, so shortening the
  // section cannot clip a popup or place its close control above the viewport.
  var pop=document.getElementById('odmp'),popHome=pop.parentElement,closeButton=document.getElementById('odmpClose'),portal=null,observer=null;
  function restorePortal(){
    if(!portal)return;closeButton.click();
    if(observer)observer.disconnect();if(portal.open)portal.close();
    parent.document.documentElement.classList.remove('pxid-odm-mobile-open');popHome.appendChild(pop);portal.remove();portal=null;
  }
  function createPortal(){
    if(portal||!parent.HTMLDialogElement)return;
    var pd=parent.document;portal=pd.createElement('dialog');portal.setAttribute('aria-label','ODM 服务步骤介绍');
    portal.id='pxidOdmMobileDialog';
    portal.style.cssText='position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;overflow:hidden;';
    var host=pd.createElement('div');portal.appendChild(host);
    var shadow=host.attachShadow({mode:'open'}),style=pd.createElement('style');
    var source=Array.from(document.querySelectorAll('style')).find(function(s){return s.textContent.indexOf('.odmp-panel')>=0;});
    style.textContent=(source?source.textContent:'')+'\n*{box-sizing:border-box;font-family:Arial,"PingFang SC","Microsoft YaHei",sans-serif}.odmp{font-size:16px;padding:24px 12px}.odmp-panel{width:min(1160px,96vw);height:min(800px,90dvh)}.odmp-body{min-height:0}.odmp-close{width:48px;height:48px}.odmp-media{min-height:0}:host([data-detail-layout="stack"]) .odmp-panel{grid-template-columns:1fr;grid-template-rows:minmax(130px,30%) minmax(0,1fr)}:host([data-detail-layout="stack"]) .odmp-media::after{background:linear-gradient(0deg,#0c0c0e,transparent 40%)}.odmp-body{padding:22px}.odmp-h{font-size:23px}.odmp-cols{grid-template-columns:1fr;gap:14px;margin:20px 0}.odmp-col{padding-top:0;padding-left:32px}.odmp-out{margin-top:12px}:host([data-detail-layout="side"]) .odmp-panel{grid-template-columns:.9fr 1.1fr;grid-template-rows:1fr}:host([data-detail-layout="side"]) .odmp-media{min-height:0}:host([data-detail-layout="side"]) .odmp-h{padding-right:48px}@media(prefers-reduced-motion:reduce){.odmp.on,.odmp-panel{animation:none}}';
    shadow.append(style,pop);pd.body.appendChild(portal);
    portal.addEventListener('cancel',function(e){e.preventDefault();closeButton.click();});
    observer=new MutationObserver(function(){
      if(pop.classList.contains('on')){if(!portal.open){portal.showModal();pd.documentElement.classList.add('pxid-odm-mobile-open');closeButton.focus();}}
      else if(portal.open){portal.close();pd.documentElement.classList.remove('pxid-odm-mobile-open');(isCompact?detailButtons[current]:cards[current]).focus({preventScroll:true});}
    });observer.observe(pop,{attributes:true,attributeFilter:['class']});
  }
  var signature='',layoutFrame=0;
  function fitFrame(){
    var frame=window.frameElement;if(!frame)return;
    var height=Math.ceil(root.getBoundingClientRect().height);
    frame.style.height=(isCompact?height:Math.max(parent.innerHeight,height))+'px';
  }
  function layout(){
    var width=document.documentElement.clientWidth,height=parent.visualViewport?parent.visualViewport.height:parent.innerHeight;
    var touch=navigator.maxTouchPoints>0,key=width+'|'+Math.round(height)+'|'+touch;
    if(key===signature)return;signature=key;
    // Handheld UAs keep the compact interaction even on a very wide inner screen.
    var handheld=touch&&(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||navigator.platform==='MacIntel'||(navigator.userAgentData&&navigator.userAgentData.mobile));
    var wasCompact=isCompact;isCompact=width<=1200||(touch&&width<=1400)||handheld;
    cards.forEach(function(card,i){
      card.setAttribute('role',isCompact?'group':'button');nextButtons[i].hidden=!isCompact;
      if(isCompact){card.removeAttribute('tabindex');card.setAttribute('aria-label','第 '+(i+1)+' 步：'+titleNodes[i].textContent);if(titleNodes[i].parentNode)titleNodes[i].replaceWith(detailButtons[i]);}
      else{card.tabIndex=0;card.setAttribute('aria-label','第 '+(i+1)+' 步：'+titleNodes[i].textContent+'，查看详情');if(detailButtons[i].parentNode)detailButtons[i].replaceWith(titleNodes[i]);}
    });
    var profile=!isCompact?'desktop':width<380?'outer':width<600?'phone':width>height*1.4&&height<600?'landscape':width<960?'inner':'expanded';
    document.documentElement.classList.toggle('odm-compact',isCompact);
    document.documentElement.dataset.odmLayout=profile;root.dataset.odmLayout=profile;
    var content=Math.min(width-32,profile==='expanded'?960:1040);
    root.dataset.odmColumns=(content-27)/10<32?'5':'10';
    root.style.setProperty('--odm-content-width',profile==='expanded'?'960px':'1040px');
    var imageHeight=profile==='landscape'?Math.min(260,height*.55):profile==='expanded'?360:profile==='inner'?Math.min(380,content*.55):content*.625;
    root.style.setProperty('--odm-card-height',Math.round(imageHeight)+'px');
    try{parent.document.getElementById('pxidS2').dataset.odmCompact=String(isCompact);}catch(e){}
    if(isCompact){
      carousel.hidden=false;if(!wasCompact)cards.forEach(function(c){track.appendChild(c);});createPortal();
      if(portal)portal.firstElementChild.dataset.detailLayout=width>=960||(width>=600&&height<600)?'side':'stack';
      requestAnimationFrame(function(){go(current,false);fitFrame();});
    }else{restorePortal();if(wasCompact)cards.forEach(function(c){grid.appendChild(c);});carousel.hidden=true;paint(current);fitFrame();}
  }
  function resize(){if(layoutFrame)return;layoutFrame=requestAnimationFrame(function(){layoutFrame=0;layout();});}
  window.addEventListener('resize',resize,{passive:true});parent.addEventListener('resize',resize,{passive:true});
  if(parent.visualViewport)parent.visualViewport.addEventListener('resize',resize,{passive:true});
  var sizeObserver=new ResizeObserver(function(){resize();fitFrame();});sizeObserver.observe(document.documentElement);sizeObserver.observe(root);
  window.addEventListener('pagehide',function(){restorePortal();sizeObserver.disconnect();parent.removeEventListener('resize',resize);if(parent.visualViewport)parent.visualViewport.removeEventListener('resize',resize);});layout();
})();
