/* PXID Hero: one lifecycle for opening, film, native scroll and layered poster. */
(function () {
  'use strict';
  var sec=document.getElementById('pxidS1'),loader=document.getElementById('pxidHeroIntro');
  if(!sec||!loader)return;
  var root=document.documentElement,first=sec.querySelector('[data-hero-frame="video"]');
  var video=first.querySelector('video'),copy=sec.querySelector('.bannerList'),pager=sec.querySelector('.pager');
  var reduced=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:900px)');
  var phase='intro',released=false,active=true,mediaReady=false,entranceDone=false,failed=false;
  var progress=0,bridgeStarted=false,raf=0,frameCallback=0,bridgeBegan=0,bridgeFrom=0,mediaTime=0;
  var runtime=null,autoTween=null,timeout,skipTimer,lastPercent=0;
  var entrance=[],assets=sec.dataset.storyAssets,typeFrames=[],logoTarget=null;
  var logoImage=copy.querySelector('.pxid-intro-logo'),eyebrowDeparted=false;
  var campaignTitle=copy.querySelector('h1'),design=copy.querySelector('.story-design'),your=copy.querySelector('.story-your'),rLetter=copy.querySelector('.slogan-r'),ide=copy.querySelector('.pxid-intro-tail'),subtitle=copy.querySelector('.pxid-first-film-sub'),eyebrow=copy.querySelector('.pxid-first-film-eyebrow');
  sec.dataset.heroStory='true';
  var shell=document.createElement('div');shell.className='pxid-story-shell';
  sec.parentNode.insertBefore(shell,sec);shell.appendChild(sec);sec.prepend(loader);
  root.classList.add('pxid-intro-pending');sec.classList.add('pxid-intro-active');
  var inertNodes=[],inertValues=[];
  function guardSurroundings(){document.querySelectorAll('#app>header,#app>nav,#app>footer,main>section:not(#pxidS1)').forEach(function(n){if(inertNodes.indexOf(n)<0){inertNodes.push(n);inertValues.push(n.inert);n.inert=true;}});}
  guardSurroundings();document.addEventListener('DOMContentLoaded',function(){if(!released)guardSurroundings();},{once:true});
  loader.dataset.introState='loading';
  var number=loader.querySelector('output'),bar=loader.querySelector('[role="progressbar"]');
  var status=loader.querySelector('[role="status"]'),skip=loader.querySelector('button');
  var bike=document.createElement('div');bike.className='pxid-intro-bike';bike.setAttribute('aria-hidden','true');
  bike.innerHTML='<img src="'+assets+'hero-intro-p6-right-20261017.svg" alt="" width="640" height="372" draggable="false">';
  var bikeImage=bike.firstElementChild;
  sec.appendChild(bike);
  var scene=document.createElement('div');scene.className='pxid-photo-handoff pxid-story-scene';scene.inert=true;scene.setAttribute('aria-hidden','true');
  scene.innerHTML='<div class="pxid-story-landscape"><img class="pxid-story-field" src="'+assets+'hero-empty-field-20261017.webp" alt="" width="1672" height="940" decoding="async"></div>'+
    '<div class="pxid-story-rider"><img src="'+assets+'hero-rider-right-20261017.svg" alt="MANTIS P6 骑行者" width="1100" height="940" decoding="async" draggable="false"></div>'+
    '<div class="pxid-story-grass" aria-hidden="true"></div>'+
    '<div class="pxid-story-photo"><img src="'+sec.dataset.photoHandoff+'" alt="MANTIS P6 骑行实拍" width="2560" height="1441" decoding="async" draggable="false"></div>'+
    '<a class="pxid-photo-handoff-cta" href="business.html">探索产品方案 <span aria-hidden="true">↗</span></a>';
  sec.appendChild(scene);
  var landscape=scene.querySelector('.pxid-story-landscape'),field=scene.querySelector('.pxid-story-field');
  var rider=scene.querySelector('.pxid-story-rider'),grass=scene.querySelector('.pxid-story-grass');
  var finalPhoto=scene.querySelector('.pxid-story-photo'),photoImage=finalPhoto.querySelector('img'),cta=scene.querySelector('a');
  grass.style.backgroundImage='url("'+assets+'hero-empty-field-20261017.webp")';
  var prompt=document.createElement('button');prompt.type='button';prompt.className='pxid-handoff-prompt';
  prompt.innerHTML='<span>向下探索 MANTIS P6</span><i aria-hidden="true">↓</i>';sec.appendChild(prompt);
  var promptLabel=prompt.querySelector('span');
  function clamp(v){return Math.max(0,Math.min(1,v));}
  function smooth(v){v=clamp(v);return v*v*(3-2*v);}
  function start(){return shell.getBoundingClientRect().top+scrollY;}
  function setPhase(value){phase=value;sec.dataset.storyPhase=value;}
  function percent(value){
    value=Math.max(lastPercent,Math.min(100,Math.round(value)));lastPercent=value;
    number.textContent=String(value).padStart(2,'0');bar.setAttribute('aria-valuenow',value);loader.dataset.loadedPercent=value;
  }
  function loadingProgress(){
    if(released||failed)return;
    var buffered=video.buffered.length?video.buffered.end(0):0;
    percent(Math.min(99,Math.min(1,buffered/1.5)*85+(bikeImage.complete&&bikeImage.naturalWidth?10:0)+(video.readyState>=2?4:0)));
    if(video.readyState>=3&&buffered>=Math.min(1.2,video.duration||1.2)){mediaReady=true;finishIntro();}
  }
  function logoLayout(){
    var nav=document.querySelector(mobile.matches?'header .appNav .logoBox img':'header .pcNav .logo img');
    if(!nav)return;
    var r=(mobile.matches?nav.parentElement:nav).getBoundingClientRect();
    var ratio=1200/280,sw=Math.min(r.width,r.height*ratio),sh=sw/ratio;
    logoTarget={x:r.left+(mobile.matches?0:(r.width-sw)/2),y:r.top+(r.height-sh)/2,w:sw};
  }
  function layout(){
    logoLayout();
    var w=sec.clientWidth,h=sec.clientHeight;
    // The true photograph is the final coordinate system, including its standing rider.
    var ratio=2560/1441,iw=Math.max(w,h*ratio),ih=iw/ratio;
    var ix=(w-iw)/2,iy=(h-ih)/2;
    var artWidth=iw*.25;
    rider.style.width=artWidth+'px';rider.style.height=artWidth*940/1100+'px';
    rider.style.left=(ix+iw*.538-artWidth*.609)+'px';
    rider.style.top=(iy+ih*.418)+'px';
    var parts=[design,your,rLetter,ide,subtitle];
    parts.forEach(function(n){n.style.transform='none';});
    // Measure the actual film lettering once; transforms never reflow the words.
    var sr=sec.getBoundingClientRect(),base=parts.map(function(n){var r=n.getBoundingClientRect();return {x:r.left-sr.left,y:r.top-sr.top,w:r.width,h:r.height};});
    var f=parseFloat(getComputedStyle(campaignTitle).fontSize),scale=mobile.matches?.984:6.8/7.6;
    var left=ix+iw*.45-f*scale*.12,right=ix+iw*.575+f*scale*.18,row=iy+ih*.53;
    var targets=mobile.matches?[
      {x:w*.055,y:h*.205},{x:w*.055,y:h*.205+f*1.04},
      {x:w*.055+base[1].w*scale+f*.18,y:h*.205+f*1.04},
      {x:w*.055+(base[1].w+base[2].w)*scale+f*.18,y:h*.205+f*1.04},
      {x:w*.055,y:h*.205+f*2.08+18}
    ]:[
      {x:left-base[0].w*scale,y:row-f*scale*1.1},
      {x:left-base[1].w*scale,y:row},
      {x:ix+iw*.50-base[2].w*scale*.5,y:row},
      {x:right,y:row},
      {x:Math.max(w*.055,left-base[0].w*scale),y:row+f*scale*1.10}
    ];
    typeFrames=parts.map(function(n,i){return {node:n,x:targets[i].x-base[i].x,y:targets[i].y-base[i].y,scale:i===4?1:scale};});
    shell.style.setProperty('--pxid-story-distance','0px');
    if(released)paintType();
  }
  function paintType(){
    var t=smooth(progress),c=smooth((progress-.22)/.30),rgb=[255+(17-255)*c,255+(28-255)*c,255+(25-255)*c].map(Math.round);
    typeFrames.forEach(function(a){a.node.style.transform=progress?'translate3d('+a.x*t+'px,'+a.y*t+'px,0) scale('+(1+(a.scale-1)*t)+')':'';});
    campaignTitle.style.setProperty('--story-ink','rgb('+rgb.join(',')+')');
    subtitle.style.color='rgb('+rgb.join(',')+')';subtitle.style.textShadow=c>.5?'none':'';
    rLetter.style.opacity=mobile.matches?'1':String(1-smooth((progress-.46)/.26));
    rLetter.style.pointerEvents=progress>.05?'none':'';
    eyebrow.style.opacity=eyebrowDeparted?'0':String(1-smooth(progress/.48));
  }
  function inputGuard(event){
    if(!root.classList.contains('pxid-intro-pending'))return;
    if(event.type==='keydown'&&![' ','ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key))return;
    if(event.target.closest('button'))return;
    event.preventDefault();event.stopImmediatePropagation();
  }
  window.addEventListener('wheel',inputGuard,{capture:true,passive:false});
  window.addEventListener('touchmove',inputGuard,{capture:true,passive:false});window.addEventListener('keydown',inputGuard,true);
  function clearGuard(){window.removeEventListener('wheel',inputGuard,true);window.removeEventListener('touchmove',inputGuard,true);window.removeEventListener('keydown',inputGuard,true);inertNodes.forEach(function(n,i){n.inert=inertValues[i];});}
  function finishIntro(){
    if(released||!entranceDone||!mediaReady)return;
    released=true;clearTimeout(timeout);clearTimeout(skipTimer);percent(100);status.textContent=failed?'READY TO EXPLORE':'READY TO RIDE';
    loader.dataset.introState='revealing';sec.classList.add('pxid-intro-copy-hold');
    Promise.resolve().then(function(){
      loader.dataset.introState='revealing';root.classList.add('pxid-intro-revealing');
      window.pxidHeroIntroReleased=true;first.classList.add('on');
      window.dispatchEvent(new CustomEvent('pxid:hero-intro-release'));window.dispatchEvent(new CustomEvent('pxid:hero-intro-reveal'));
      setPhase('film');layout();
      if(!reduced.matches&&!failed){video.play().catch(function(){failMedia();});watchFilm();}
      var reveal=loader.animate([{opacity:1},{opacity:0}],{duration:reduced.matches?0:380,easing:'ease-out',fill:'forwards'});
      reveal.finished.then(function(){
        root.classList.remove('pxid-intro-pending','pxid-intro-revealing');sec.classList.remove('pxid-intro-active','pxid-intro-restore-r');
        entrance.forEach(function(a){a.cancel();});copy.style.transform='';copy.style.opacity='';
        bike.remove();loader.hidden=true;loader.dataset.introState='complete';clearGuard();
        window.dispatchEvent(new CustomEvent('pxid:hero-intro-complete'));
        if(reduced.matches||failed)showStatic();else{runtime=window.pxidMotionRuntime||runtime;paint();}
      });
    });
  }
  function failMedia(){
    if(failed)return;failed=true;mediaReady=true;video.pause();
    if(released){showStatic();return;}finishIntro();
  }
  function enter(){
    logoLayout();layout();
    var typeStyle=getComputedStyle(campaignTitle);
    // The bike leads the whole word and parks beyond E, never inside a letter slot.
    var r=ide.getBoundingClientRect(),sr=sec.getBoundingClientRect(),gap=Math.max(10,parseFloat(typeStyle.fontSize)*.12);
    var x=r.right-sr.left+gap,available=sec.clientWidth-x-sec.clientWidth*.055;
    var w=Math.min(mobile.matches?86:190,available),y=r.top-sr.top+(r.height-w*372/640)/2;
    var target='translate3d('+x+'px,'+y+'px,0)';
    bike.style.width=w+'px';bike.style.height=w*372/640+'px';bike.style.transform=target;
    bike.style.opacity='1';sec.classList.add('pxid-intro-running');
    function flyLogo(instant){
      logoLayout();
      var lr=logoImage.getBoundingClientRect(),sr=sec.getBoundingClientRect();
      // Move the same small wordmark to the opening overlay, retaining its exact screen rectangle.
      loader.appendChild(logoImage);loader.dataset.brandOrigin='eyebrow';
      logoImage.style.left=(lr.left-sr.left)+'px';logoImage.style.top=(lr.top-sr.top)+'px';
      logoImage.style.width=lr.width+'px';logoImage.style.height=lr.height+'px';
      var endLogo=logoTarget?'translate3d('+(logoTarget.x-lr.left)+'px,'+(logoTarget.y-lr.top)+'px,0) scale('+(logoTarget.w/lr.width)+')':'none';
      eyebrowDeparted=true;
      if(instant){logoImage.style.transform=endLogo;eyebrow.style.opacity='0';return [];}
      var flight=logoImage.animate([{transform:'none'},{transform:endLogo}],{duration:650,easing:'cubic-bezier(.3,.1,.2,1)',fill:'forwards'});
      flight.finished.then(function(){logoImage.style.transform=endLogo;});
      return [flight,eyebrow.animate([{opacity:1},{opacity:0}],{duration:220,fill:'forwards'})];
    }
    if(reduced.matches){bike.style.opacity='0';flyLogo(true);entranceDone=true;mediaReady=true;loader.dataset.entranceDone='true';finishIntro();return;}
    var duration=1450,easing='cubic-bezier(.22,.72,.22,1)';
    entrance=[
      bike.animate([{transform:'translate3d('+(-w-20)+'px,'+y+'px,0)'},{transform:target}],{duration:duration,easing:easing,fill:'both'}),
      copy.animate([{transform:'translate3d('+(-innerWidth*.74)+'px,0,0)',opacity:0},{transform:'translate3d(0,0,0)',opacity:1}],{delay:220,duration:1230,easing:easing,fill:'both'})
    ];
    Promise.all(entrance.map(function(a){return a.finished;})).then(function(){
      copy.style.transform='translate3d(0,0,0)';copy.style.opacity='1';
      entrance.forEach(function(a){a.cancel();});bike.style.transform=target;
      // The real bike fades beside RIDE; only the small eyebrow logo enlarges into navigation.
      var landing=[bike.animate([{opacity:1},{opacity:0}],{duration:500,easing:'ease-out',fill:'forwards'})].concat(flyLogo(false));
      entrance=entrance.concat(landing);
      Promise.all(landing.map(function(a){return a.finished;})).then(function(){
        bike.style.opacity='0';eyebrow.style.opacity='0';
        landing.forEach(function(a){a.cancel();});entranceDone=true;loader.dataset.entranceDone='true';finishIntro();
      });
    });
  }
  function lock(value){sec.dataset.handoffLocked=String(value);}
  function refreshHeader(){
    var rect=sec.getBoundingClientRect();
    root.classList.toggle('pxid-story-view',released&&rect.top>=-1&&rect.bottom>=innerHeight-2);
    root.classList.toggle('pxid-handoff-light',progress>.40&&rect.top>-40&&rect.bottom>100);
  }
  function paint(){
    progress=clamp(progress);var p=progress,w=sec.clientWidth,h=sec.clientHeight;
    sec.dataset.handoffProgress=p.toFixed(4);
    var complete=p>=.999,visible=p>.001;
    scene.style.visibility=visible?'visible':'hidden';scene.inert=!complete;scene.setAttribute('aria-hidden',String(!complete));
    sec.classList.toggle('pxid-handoff-revealing',visible&&!complete);sec.classList.toggle('pxid-handoff-complete',complete);
    var fieldIn=smooth(p/.20),move=smooth((p-.08)/.72),photoIn=smooth((p-.66)/.34);
    // Begin with the side-shot horizon, then settle into the photograph's framing.
    landscape.style.opacity=fieldIn;field.style.transform='translate3d('+(-1.2*(1-move))+'%,'+(-7*(1-move))+'%,0) scale('+(1.18-.18*move)+')';
    sec.style.setProperty('--story-film-opacity',String(1-smooth((p-.50)/.20)));
    // Match the last side-view shot using its media coordinate system, then
    // move toward the unchanged photograph's helmet anchor. No scroll input.
    var ratio=(video.videoWidth||1920)/(video.videoHeight||1080),vw=Math.max(w,h*ratio),vh=vw/ratio;
    var vx=(w-vw)*(mobile.matches?.40:.5),vy=(h-vh)/2;
    var startWidth=vw*.27,endWidth=parseFloat(rider.style.width),endX=parseFloat(rider.style.left),endY=parseFloat(rider.style.top);
    var startX=vx+vw*.445-startWidth*.609,startY=vy+vh*.345;
    var scale=startWidth/endWidth,dx=startX-endX,dy=startY-endY;
    rider.style.transform='translate3d('+(dx*(1-move))+'px,'+(dy*(1-move))+'px,0) scale('+(scale+(1-scale)*move)+')';
    rider.style.transformOrigin='0 0';rider.style.opacity=String(smooth(p/.16)*(1-photoIn));
    rider.style.filter='blur('+(2+2*(1-smooth(p/.6)))+'px) brightness('+(.83+.17*move)+')';
    rider.style.setProperty('--rider-solid',(56+34*move)+'%');rider.style.setProperty('--rider-clear',(72+28*move)+'%');
    finalPhoto.style.opacity=photoIn;grass.style.opacity=smooth((p-.18)/.4)*(1-photoIn);
    cta.style.opacity=smooth((p-.86)/.14);paintType();refreshHeader();lock(bridgeStarted&&!complete);
    if(complete){setPhase('poster');video.pause();scene.dataset.finalMedia='original-photo-mirrored';}
  }
  function beginBridge(){
    if(bridgeStarted||reduced.matches||failed)return;
    bridgeStarted=true;mediaTime=video.currentTime;sec.dataset.bridgeMediaTime=mediaTime.toFixed(3);video.pause();
    setPhase('handoff');sec.classList.add('pxid-handoff-outro','pxid-handoff-ready');
    runtime=window.pxidMotionRuntime||runtime;bridgeBegan=performance.now();bridgeFrom=progress;
    if(runtime){autoTween=runtime.gsap.to({p:progress},{p:1,duration:1.22,ease:'none',onUpdate:function(){progress=this.targets()[0].p;paint();},onComplete:function(){progress=1;paint();}});}
    else{function step(now){progress=bridgeFrom+(1-bridgeFrom)*clamp((now-bridgeBegan)/1220);paint();if(progress<1)raf=requestAnimationFrame(step);}raf=requestAnimationFrame(step);}
  }
  function showStatic(){
    if(autoTween)autoTween.kill();if(raf)cancelAnimationFrame(raf);raf=0;
    video.pause();progress=1;bridgeStarted=false;sec.classList.add('pxid-handoff-outro','pxid-handoff-ready');paint();lock(false);setPhase('poster');
  }
  function watchFilm(){
    if(frameCallback||bridgeStarted)return;
    function tick(){
      frameCallback=0;if(video.paused||bridgeStarted||phase==='intro')return;
      if(Number.isFinite(video.duration)&&video.currentTime>=video.duration-.50){beginBridge();return;}
      frameCallback=requestAnimationFrame(tick);
    }
    frameCallback=requestAnimationFrame(tick);
  }
  window.addEventListener('pxid:motion-ready',function(){runtime=window.pxidMotionRuntime;});
  window.addEventListener('scroll',refreshHeader,{passive:true});
  window.addEventListener('resize',function(){layout();paint();},{passive:true});
  video.addEventListener('ended',beginBridge);video.addEventListener('play',watchFilm);video.addEventListener('error',failMedia);
  ['progress','loadeddata','canplay','canplaythrough'].forEach(function(name){video.addEventListener(name,loadingProgress);});
  skip.addEventListener('click',function(){mediaReady=true;if(video.readyState<2)failed=true;finishIntro();});
  prompt.addEventListener('click',function(){var next=document.getElementById('pxidModelHero');if(next)window.scrollTo({top:next.getBoundingClientRect().top+scrollY,behavior:reduced.matches?'instant':'smooth'});});
  document.addEventListener('visibilitychange',function(){if(document.hidden){video.pause();if(autoTween)autoTween.pause();}else{if(autoTween)autoTween.resume();if(released&&!bridgeStarted&&!video.ended&&!failed&&!reduced.matches)video.play().catch(function(){});}});
  reduced.addEventListener('change',function(){if(reduced.matches&&released)showStatic();});
  video.loop=false;video.removeAttribute('loop');video.preload='auto';
  video.src=assets+(mobile.matches?'hero-field-mobile-20261017.mp4':'hero-field-web-20261017.mp4');video.load();
  Promise.resolve(bikeImage.decode?bikeImage.decode():null).catch(function(){}).then(function(){percent(10);requestAnimationFrame(enter);});
  skipTimer=setTimeout(function(){if(!released)skip.hidden=false;},4000);
  timeout=setTimeout(failMedia,12000);
  layout();
})();
