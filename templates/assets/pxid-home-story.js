/* PXID Hero: one lifecycle for opening, film, native scroll and layered poster. */
(function () {
  'use strict';
  var sec=document.getElementById('pxidS1'),loader=document.getElementById('pxidHeroIntro');
  if(!sec||!loader)return;
  var root=document.documentElement,first=sec.querySelector('[data-hero-frame="video"]');
  var video=first.querySelector('video'),copy=sec.querySelector('.bannerList'),pager=sec.querySelector('.pager');
  var reduced=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:900px)');
  var phase='intro',released=false,active=true,mediaReady=false,entranceDone=false,failed=false;
  var auto={value:0},scrollProgress=0,progress=0,bridgeStarted=false,raf=0,frameCallback=0;
  var runtime=null,timeline=null,trigger=null,autoTween=null,timeout,skipTimer,lastPercent=0;
  var entrance=[],objectUrl=null,assets=sec.dataset.storyAssets;
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
    '<div class="pxid-photo-handoff-copy"><h2 class="pxid-photo-handoff-title" aria-label="DESIGN YOUR RIDE"><span class="ride-design">DES<span class="ride-accent">I</span>GN</span><span class="ride-your">YOUR</span><span class="ride-ride"><span class="ride-rider-letter" aria-hidden="true">R</span><span class="ride-accent">I</span>DE</span></h2><p class="pxid-photo-handoff-sub">探索更美的出现方式</p></div>'+
    '<div class="pxid-story-rider"><img src="'+assets+'hero-rider-right-20261017.svg" alt="MANTIS P6 骑行者" width="1100" height="940" decoding="async" draggable="false"></div>'+
    '<div class="pxid-story-grass" aria-hidden="true"></div>'+
    '<a class="pxid-photo-handoff-cta" href="business.html">探索产品方案 <span aria-hidden="true">↗</span></a>';
  sec.appendChild(scene);
  var landscape=scene.querySelector('.pxid-story-landscape'),field=scene.querySelector('.pxid-story-field');
  var rider=scene.querySelector('.pxid-story-rider'),grass=scene.querySelector('.pxid-story-grass');
  var words=scene.querySelector('.pxid-photo-handoff-copy'),title=scene.querySelector('h2'),cta=scene.querySelector('a');
  grass.style.backgroundImage='url("'+assets+'hero-empty-field-20261017.webp")';
  var prompt=document.createElement('button');prompt.type='button';prompt.className='pxid-handoff-prompt';
  prompt.innerHTML='<span>滚动，展开下一程</span><i aria-hidden="true">↓</i>';sec.appendChild(prompt);
  var promptLabel=prompt.querySelector('span');
  function clamp(v){return Math.max(0,Math.min(1,v));}
  function smooth(v){v=clamp(v);return v*v*(3-2*v);}
  function distance(){return mobile.matches?Math.min(420,innerHeight*.46):Math.min(900,Math.max(620,innerHeight*.72));}
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
    var logo=document.querySelector(mobile.matches?'header .appNav .logoBox':'header .pcNav .logo');
    if(!logo)return;var r=logo.getBoundingClientRect(),img=loader.querySelector('.pxid-intro-logo');
    if(r.width){img.style.left=r.left+'px';img.style.top=r.top+'px';img.style.width=r.width+'px';img.style.height=r.height+'px';}
  }
  function layout(){
    logoLayout();
    var w=sec.clientWidth,h=sec.clientHeight;
    var artWidth=mobile.matches?Math.min(w*.96,h*.51*1100/940):Math.min(w*.40,h*.54*1100/940);
    var artHeight=artWidth*940/1100;
    rider.style.width=artWidth+'px';rider.style.height=artHeight+'px';
    rider.style.left=(w*.51-artWidth*.5)+'px';rider.style.top=(mobile.matches?h*.47:h*.395)+'px';
    scene.style.setProperty('--ride-left-edge',w*.417+'px');scene.style.setProperty('--ride-right-edge',w*.63+'px');
    scene.style.setProperty('--ride-row-y',h*.56+'px');scene.style.setProperty('--ride-design-y',h*.42+'px');
    var f=parseFloat(getComputedStyle(title).fontSize),dw=scene.querySelector('.ride-design').getBoundingClientRect().width;
    scene.style.setProperty('--ride-caption-x',Math.max(w*.055,w*.417-dw)+'px');scene.style.setProperty('--ride-caption-y',(h*.56+f*1.08)+'px');
    shell.style.setProperty('--pxid-story-distance',released&&active&&!reduced.matches?distance()+'px':'0px');
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
    loader.dataset.introState='morphing';sec.classList.add('pxid-intro-restore-r','pxid-intro-copy-hold');
    window.dispatchEvent(new CustomEvent('pxid:hero-intro-morph'));
    // Only the R slot changes; the rest of RIDE remains fully visible.
    var morphAnimations=reduced.matches?[]:[
      bike.animate([{opacity:1,transform:bike.style.transform},{opacity:0,transform:bike.style.transform+' scale(.72)'}],{duration:230,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'}),
      copy.querySelector('.slogan-f-glyph').animate([{opacity:.75},{opacity:1}],{duration:230,fill:'forwards'})
    ];
    entrance=entrance.concat(morphAnimations);
    var morph=Promise.all(morphAnimations.map(function(a){return a.finished;}));
    morph.then(function(){
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
        if(reduced.matches||failed)showStatic();else initScroll();
      });
    });
  }
  function failMedia(){
    if(failed)return;failed=true;mediaReady=true;video.pause();
    if(released){showStatic();return;}finishIntro();
  }
  function enter(){
    logoLayout();layout();
    var letter=copy.querySelector('.slogan-r'),r=letter.getBoundingClientRect(),s=sec.getBoundingClientRect();
    var w=Math.max(74,Math.min(190,parseFloat(getComputedStyle(letter).fontSize)*1.24));
    var targetWidth=r.width*.98,x=r.left-s.left+(r.width-targetWidth)/2,y=r.top-s.top+(r.height-targetWidth*940/1620)*.58;
    var target='translate3d('+x+'px,'+y+'px,0) scale('+(targetWidth/w)+')';
    bike.style.width=w+'px';bike.style.height=(w*940/1620)+'px';bike.style.transform=target;
    bike.style.opacity='1';sec.classList.add('pxid-intro-running');
    if(reduced.matches){entranceDone=true;mediaReady=true;loader.dataset.entranceDone='true';finishIntro();return;}
    var duration=1580,lead=Math.min(105,innerWidth*.14),easing='cubic-bezier(.22,.72,.22,1)';
    entrance=[
      bike.animate([
        {transform:'translate3d('+(-w-20)+'px,'+y+'px,0)',offset:0},
        {transform:'translate3d('+lead+'px,'+y+'px,0)',offset:.16,easing:easing},
        {transform:target,offset:1}
      ],{duration:duration,fill:'both'}),
      copy.animate([
        {transform:'translate3d('+(-innerWidth*.74)+'px,0,0)',opacity:0,offset:0},
        {transform:'translate3d('+(-innerWidth*.74)+'px,0,0)',opacity:0,offset:.16,easing:easing},
        {transform:'translate3d(0,0,0)',opacity:1,offset:1}
      ],{duration:duration,fill:'both'})
    ];
    Promise.all(entrance.map(function(a){return a.ready;})).then(function(){var t=entrance[0].startTime;entrance.forEach(function(a){a.startTime=t;});loader.dataset.entranceStarted=t;});
    Promise.all(entrance.map(function(a){return a.finished;})).then(function(){
      copy.style.transform='translate3d(0,0,0)';copy.style.opacity='1';
      entrance.forEach(function(a){a.cancel();});bike.style.transform=target;
      entranceDone=true;loader.dataset.entranceDone='true';finishIntro();
    });
  }
  function lock(value){sec.dataset.handoffLocked=String(value);sec.classList.toggle('pxid-handoff-locked',value);pager.inert=value;}
  function paint(){
    progress=clamp(auto.value+(1-auto.value)*scrollProgress);
    if(!active)return;
    sec.dataset.handoffProgress=progress.toFixed(4);
    sec.style.setProperty('--pxid-handoff-edge',(progress*100).toFixed(3)+'%');
    var visible=progress>.001,complete=progress>=.998;
    var heroRect=sec.getBoundingClientRect();root.classList.toggle('pxid-story-view',released&&active&&heroRect.top>=-1&&heroRect.bottom>=innerHeight-2);
    scene.style.visibility=visible?'visible':'hidden';scene.setAttribute('aria-hidden',String(!complete));scene.inert=!complete;
    sec.classList.toggle('pxid-handoff-revealing',visible&&!complete);sec.classList.toggle('pxid-handoff-complete',complete);
    if(timeline)timeline.progress(progress);
    else{
      landscape.style.clipPath='inset(0 '+((1-smooth(progress/.40))*100)+'% 0 0)';
      landscape.style.setProperty('--story-wipe',(-40+(sec.clientWidth+80)*smooth(progress/.40))+'px');
      rider.style.opacity=smooth((progress-.09)/.28);
      rider.style.transform='translate3d('+(-sec.clientWidth*(mobile.matches?.16:.14)*(1-smooth((progress-.08)/.78)))+'px,'+(-sec.clientHeight*.02*(1-progress))+'px,0) scale('+(.88+.12*smooth(progress/.9))+')';
      field.style.transform='translate3d('+(-1.8+1.8*progress)+'%,0,0) scale(1.04)';
      words.style.opacity=smooth((progress-.38)/.34);words.style.transform='translate3d('+(-sec.clientWidth*.045*(1-smooth((progress-.38)/.42)))+'px,0,0)';
      grass.style.opacity=smooth((progress-.15)/.35);cta.style.opacity=smooth((progress-.86)/.14);
    }
    lock(bridgeStarted&&!complete&&!reduced.matches&&!failed);
    promptLabel.textContent=complete?'继续滚动，探索 PXID':'滚动，展开下一程';
    document.documentElement.classList.toggle('pxid-handoff-light',progress>.32&&sec.getBoundingClientRect().bottom>100&&sec.getBoundingClientRect().top>-20);
    if(complete){setPhase('poster');video.pause();}
  }
  function buildTimeline(){
    if(!runtime||timeline||reduced.matches)return;
    var g=runtime.gsap;
    timeline=g.timeline({paused:true,defaults:{ease:'none'}});
    timeline.fromTo(landscape,{clipPath:'inset(0 100% 0 0)','--story-wipe':'-40px'},{clipPath:'inset(0 0% 0 0)','--story-wipe':function(){return (sec.clientWidth+40)+'px';},duration:.40,ease:'power1.inOut'},0)
      .fromTo(field,{xPercent:-1.8,scale:1.04},{xPercent:0,scale:1.04,duration:1},0)
      .fromTo(rider,{x:function(){return -sec.clientWidth*(mobile.matches?.16:.14);},y:function(){return -sec.clientHeight*.02;},scale:.88},{x:0,y:0,scale:1,duration:.80,ease:'power2.out'},.09)
      .fromTo(rider,{opacity:0},{opacity:1,duration:.16,ease:'power1.out'},.13)
      .fromTo(words,{opacity:0,x:function(){return -sec.clientWidth*.045;}},{opacity:1,x:0,duration:.43,ease:'power2.out'},.38)
      .fromTo(grass,{opacity:0,xPercent:-1},{opacity:1,xPercent:0,duration:.62},.15)
      .fromTo(cta,{opacity:0},{opacity:1,duration:.14},.86);
    paint();
  }
  function scrollUpdate(){
    if(!released||!active||reduced.matches||failed)return;
    scrollProgress=clamp((scrollY-start())/distance());
    if(scrollProgress>.998)scrollProgress=1;
    if(scrollProgress>.0005&&!bridgeStarted)beginBridge();
    paint();
  }
  function initScroll(){
    if(!released||!active||reduced.matches||failed)return;
    layout();
    runtime=window.pxidMotionRuntime||runtime;
    if(runtime){
      buildTimeline();
      if(!trigger)trigger=runtime.ScrollTrigger.create({trigger:shell,start:'top top',end:function(){return '+='+distance();},invalidateOnRefresh:true,onUpdate:scrollUpdate});
      runtime.ScrollTrigger.refresh();
    }
    scrollUpdate();
  }
  function beginBridge(){
    if(bridgeStarted||!active||reduced.matches||failed)return;
    if(autoTween)autoTween.kill();if(raf)cancelAnimationFrame(raf);raf=0;
    bridgeStarted=true;setPhase('handoff');sec.classList.add('pxid-handoff-outro','pxid-handoff-ready');
    // Time handles the first short bridge. Native scroll continues that SAME progress.
    if(runtime){autoTween=runtime.gsap.to(auto,{value:.38,duration:.48,ease:'power2.inOut',onUpdate:paint});}
    else{
      var from=auto.value,began=performance.now();
      function step(now){auto.value=from+(.38-from)*smooth((now-began)/480);paint();if(now-began<480)raf=requestAnimationFrame(step);}
      raf=requestAnimationFrame(step);
    }
  }
  function showStatic(){
    if(trigger){trigger.kill();trigger=null;}if(autoTween)autoTween.kill();if(raf)cancelAnimationFrame(raf);raf=0;video.pause();auto.value=1;scrollProgress=0;bridgeStarted=false;
    shell.style.setProperty('--pxid-story-distance','0px');sec.classList.add('pxid-handoff-outro');paint();lock(false);setPhase('poster');
  }
  function watchFilm(){
    if(frameCallback)return;
    function tick(){
      frameCallback=0;if(!active||video.paused||phase==='intro')return;
      if(Number.isFinite(video.duration)){
        var remaining=video.duration-video.currentTime;
        if(remaining<=1.3)sec.classList.add('pxid-handoff-anticipate');
        if(remaining<=.8)sec.classList.add('pxid-handoff-outro');
      }
      frameCallback=requestAnimationFrame(tick);
    }
    frameCallback=requestAnimationFrame(tick);
  }
  function stopScroll(){
    if(trigger){trigger.kill();trigger=null;}
    if(autoTween){autoTween.kill();autoTween=null;}if(raf)cancelAnimationFrame(raf);raf=0;
    var inHero=sec.getBoundingClientRect().top>=-distance()-10&&sec.getBoundingClientRect().bottom>0;
    shell.style.setProperty('--pxid-story-distance','0px');if(inHero)window.scrollTo({top:start(),behavior:'instant'});
    document.documentElement.classList.remove('pxid-handoff-light','pxid-story-view');
    if(runtime)requestAnimationFrame(function(){runtime.ScrollTrigger.refresh();});
  }
  function sync(){
    if(!released)return;
    var next=(first.classList.contains('on')||first.classList.contains('in')||(root.classList.contains('pxid-fallback-motion')&&pager.querySelector('.BannerDot').classList.contains('on')))&&!first.classList.contains('out');
    if(next===active)return;active=next;
    if(!active){
      video.pause();stopScroll();scene.style.visibility='hidden';scene.inert=true;scene.setAttribute('aria-hidden','true');
      sec.classList.remove('pxid-intro-copy-hold','pxid-handoff-outro','pxid-handoff-ready','pxid-handoff-revealing','pxid-handoff-complete','pxid-handoff-anticipate');lock(false);
    }else{
      if(autoTween)autoTween.kill();auto.value=scrollProgress=progress=0;bridgeStarted=false;
      if(timeline)timeline.progress(0);sec.classList.remove('pxid-handoff-outro');setPhase('film');
      if(reduced.matches||failed)showStatic();else{layout();initScroll();video.currentTime=0;video.play().catch(failMedia);watchFilm();}
    }
  }
  new MutationObserver(sync).observe(first,{attributes:true,attributeFilter:['class']});
  new MutationObserver(sync).observe(pager.querySelector('.BannerDot'),{attributes:true,attributeFilter:['class']});
  window.addEventListener('pxid:motion-ready',function(){runtime=window.pxidMotionRuntime;initScroll();});
  var lastScrollPosition=scrollY;
  window.addEventListener('scroll',function(){
    var upward=scrollY<lastScrollPosition;lastScrollPosition=scrollY;
    if(!trigger)scrollUpdate();
    if(!active)return;
    var rect=sec.getBoundingClientRect();root.classList.toggle('pxid-handoff-light',progress>.32&&rect.top>-20&&rect.bottom>100);
    root.classList.toggle('pxid-story-view',released&&rect.top>=-1&&rect.bottom>=innerHeight-2);
    if(upward&&scrollY-start()<1&&auto.value>0){
      scrollProgress=0;
      if(autoTween)autoTween.kill();
      if(raf)cancelAnimationFrame(raf);raf=0;
      bridgeStarted=false;
      if(runtime)autoTween=runtime.gsap.to(auto,{value:0,duration:.32,onUpdate:paint});else{auto.value=0;paint();}
    }
  },{passive:true});
  window.addEventListener('resize',function(){layout();if(timeline)timeline.invalidate();if(trigger)trigger.refresh();paint();},{passive:true});
  video.addEventListener('ended',beginBridge);video.addEventListener('play',watchFilm);
  video.addEventListener('error',failMedia);
  ['progress','loadeddata','canplay','canplaythrough'].forEach(function(name){video.addEventListener(name,loadingProgress);});
  skip.addEventListener('click',function(){mediaReady=true;if(video.readyState<2)failed=true;finishIntro();});
  prompt.addEventListener('click',function(){
    if(!active)return;
    if(reduced.matches||failed||progress>.998){window.scrollTo({top:start()+shell.offsetHeight,behavior:reduced.matches?'instant':'smooth'});return;}
    beginBridge();window.scrollTo({top:start()+distance(),behavior:'smooth'});
  });
  document.addEventListener('visibilitychange',function(){if(document.hidden)video.pause();else if(active&&released&&!bridgeStarted&&!video.ended&&!failed&&!reduced.matches)video.play().catch(function(){});});
  reduced.addEventListener('change',function(){if(reduced.matches&&released)showStatic();});
  video.loop=false;video.removeAttribute('loop');video.preload='auto';
  video.src=assets+(mobile.matches?'hero-field-mobile-20261017.mp4':'hero-field-web-20261017.mp4');video.load();
  Promise.resolve(bikeImage.decode?bikeImage.decode():null).catch(function(){}).then(function(){percent(10);requestAnimationFrame(enter);});
  skipTimer=setTimeout(function(){if(!released)skip.hidden=false;},4000);
  timeout=setTimeout(failMedia,12000);
  layout();
})();
