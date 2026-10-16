(function(){
  'use strict';
  var story=document.getElementById('heroStory'),stage=document.getElementById('heroStage');
  if(!story||!stage)return;
  var film=document.getElementById('ridingFilm'),header=document.getElementById('siteHeader');
  var prompt=document.getElementById('scrollPrompt'),promptText=document.getElementById('promptText');
  var scenes=Array.from(document.querySelectorAll('.model-scene')),tabs=Array.from(document.querySelectorAll('.model-tab'));
  var cursor=document.getElementById('storyCursor'),cursorText=document.getElementById('cursorText');
  var toggle=document.getElementById('toggleFilm'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  var fine=matchMedia('(hover:hover) and (pointer:fine)'),small=matchMedia('(max-width:700px)');
  var progress=0,current=0,frozen=false,framePending=false,lastScrollAt=0,autoTimer=null;
  var vh=innerHeight,range=vh*.85,stageEnd=0;
  var names=['MANTIS P6 · 全地形电动自行车','LIGHT P2 · 折叠电动自行车','PXID M2 · 城市电动摩托车'];
  function clamp(v){return Math.min(1,Math.max(0,v));}
  function smooth(v){v=clamp(v);return v*v*(3-2*v);}
  function portion(p,a,b){return smooth((p-a)/(b-a));}
  function freeze(){
    frozen=true;film.pause();stage.classList.add('is-frozen');stage.dataset.frozen='true';
    toggle.textContent='↺';toggle.setAttribute('aria-label','重播开场视频');
    if(progress<.95)promptText.textContent='滚动，进入产品系列';
  }
  film.muted=true;
  film.addEventListener('ended',freeze);
  film.addEventListener('play',function(){toggle.textContent='Ⅱ';toggle.setAttribute('aria-label','暂停开场视频');});
  film.addEventListener('pause',function(){if(!frozen){toggle.textContent='▷';toggle.setAttribute('aria-label','播放开场视频');}});
  function play(){film.play().catch(function(){toggle.textContent='▷';toggle.setAttribute('aria-label','播放开场视频');});}
  if(reduced.matches)freeze();else play();
  function resize(){vh=innerHeight;range=vh*(small.matches?.72:.85);stageEnd=story.offsetTop+story.offsetHeight-vh;update();}
  function productTarget(){return story.offsetTop+range;}
  function enterProducts(){if(reduced.matches){window.scrollTo(0,productTarget());}else window.scrollTo({top:productTarget(),behavior:'smooth'});}
  function restart(){
    window.clearTimeout(autoTimer);autoTimer=null;
    window.scrollTo({top:story.offsetTop,behavior:reduced.matches?'instant':'smooth'});
    frozen=false;stage.classList.remove('is-frozen');stage.dataset.frozen='false';
    film.currentTime=0;if(!reduced.matches)play();else freeze();
  }
  document.getElementById('replayFilm').addEventListener('click',restart);
  toggle.addEventListener('click',function(){if(frozen)restart();else if(film.paused)play();else film.pause();});
  function scheduleAuto(){
    clearTimeout(autoTimer);autoTimer=null;
    if(reduced.matches||progress<.995||document.hidden||scrollY>stageEnd+vh*.1)return;
    autoTimer=setTimeout(function(){if(Date.now()-lastScrollAt<1500){scheduleAuto();return;}change(current+1);},6500);
  }
  function change(index){
    index=(index+scenes.length)%scenes.length;
    current=index;
    scenes.forEach(function(scene,i){var on=i===index;scene.classList.toggle('is-current',on);scene.setAttribute('aria-hidden',String(!on));scene.inert=!on;});
    tabs.forEach(function(tab,i){tab.classList.toggle('is-current',i===index);tab.setAttribute('aria-pressed',String(i===index));});
    document.getElementById('modelCount').textContent=String(index+1).padStart(2,'0');
    document.getElementById('sceneAnnouncement').textContent=names[index];
    stage.dataset.model=scenes[index].dataset.model;
    scheduleAuto();
  }
  tabs.forEach(function(tab){tab.addEventListener('click',function(){change(Number(tab.dataset.slide));if(progress<.99)enterProducts();});});
  document.getElementById('previousModel').addEventListener('click',function(){change(current-1);});
  document.getElementById('nextModel').addEventListener('click',function(){change(current+1);});
  stage.addEventListener('keydown',function(event){if(progress<.99)return;if(event.key==='ArrowRight'){event.preventDefault();change(current+1);}if(event.key==='ArrowLeft'){event.preventDefault();change(current-1);}});
  prompt.addEventListener('click',function(){if(progress<.995)enterProducts();else window.scrollTo({top:document.getElementById('odmContinuation').getBoundingClientRect().top+scrollY,behavior:reduced.matches?'instant':'smooth'});});
  function update(){
    framePending=false;
    var prior=progress;progress=clamp((scrollY-story.offsetTop)/range);
    var reveal=portion(progress,.04,.89),letters=portion(progress,.48,.95),nav=portion(progress,.58,.98);
    stage.style.setProperty('--product-opacity',String(portion(progress,0,.18)));
    stage.style.setProperty('--mask-solid',(105-125*reveal).toFixed(3)+'%');
    stage.style.setProperty('--mask-clear',(120-120*reveal).toFixed(3)+'%');
    stage.style.setProperty('--opening-opacity',String(1-portion(progress,0,.3)));
    stage.style.setProperty('--opening-y',(-40*portion(progress,0,.35)).toFixed(2)+'px');
    stage.style.setProperty('--product-shift',((1-letters)*42).toFixed(2)+'px');
    stage.style.setProperty('--grass-opacity',String(reduced.matches?0:Math.sin(progress*Math.PI)*.48*(1-portion(progress,.65,.93))));
    stage.style.setProperty('--grass-x',(-progress*13).toFixed(2)+'vw');
    stage.style.setProperty('--grass-y',(-Math.sin(progress*Math.PI)*4).toFixed(2)+'vh');
    stage.style.setProperty('--nav-opacity',String(nav));
    stage.dataset.mode=progress>.985?'products':progress>.02?'transition':'film';
    stage.dataset.progress=progress.toFixed(4);
    document.getElementById('storyTrackFill').style.transform='scaleX('+progress+')';
    header.classList.toggle('is-light',scrollY>stageEnd+vh*.62);
    document.getElementById('openingCopy').inert=progress>.2;
    document.getElementById('modelNavigation').inert=progress<.985;
    document.getElementById('deckControls').inert=progress<.985;
    document.getElementById('products').inert=progress<.985;
    document.querySelector('.film-controls').inert=progress>.985;
    promptText.textContent=progress>.985?'继续滚动，探索 ODM':frozen?'滚动，进入产品系列':'滚动，探索下一程';
    cursorText.textContent=progress>.985?'探索车型':'滚动探索';
    cursor.querySelector('i').textContent=progress>.985?'↗':'↓';
    if(progress>.6&&!film.paused)film.pause();
    if(prior<.995&&progress>=.995)scheduleAuto();
    if(progress<.97){clearTimeout(autoTimer);autoTimer=null;if(current!==0)change(0);}
    if(scrollY>stageEnd+vh*.1){clearTimeout(autoTimer);autoTimer=null;cursor.classList.remove('is-visible');}
    if(progress===0&&prior>0&&!frozen&&!reduced.matches)play();
  }
  addEventListener('scroll',function(){lastScrollAt=Date.now();if(!framePending){framePending=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',function(){if(document.hidden){film.pause();clearTimeout(autoTimer);}else{if(progress<.02&&!frozen&&!reduced.matches)play();scheduleAuto();}});
  stage.addEventListener('pointermove',function(event){
    if(!fine.matches||reduced.matches||event.target.closest('a,button,nav')){cursor.classList.remove('is-visible');return;}
    var b=stage.getBoundingClientRect();cursor.style.left=(event.clientX-b.left)+'px';cursor.style.top=(event.clientY-b.top)+'px';cursor.classList.add('is-visible');
    if(progress>.985){var dx=(event.clientX/innerWidth-.5)*7,dy=(event.clientY/innerHeight-.5)*5;stage.style.setProperty('--pointer-x',dx+'px');stage.style.setProperty('--pointer-y',dy+'px');}
  });
  stage.addEventListener('pointerleave',function(){cursor.classList.remove('is-visible');stage.style.setProperty('--pointer-x','0px');stage.style.setProperty('--pointer-y','0px');});
  stage.addEventListener('click',function(event){if(event.target.closest('a,button,nav'))return;if(progress<.985)enterProducts();else location.href='business.html';});
  var menu=document.querySelector('.menu-button');menu.addEventListener('click',function(){var on=header.classList.toggle('is-menu-open');menu.setAttribute('aria-expanded',String(on));});
  addEventListener('message',function(event){var iframe=document.getElementById('odmFrame');if(event.source!==iframe.contentWindow||!event.data||event.data.type!=='pxid-story-odm-height')return;var height=Number(event.data.height);if(Number.isFinite(height)&&height>200&&height<8000)iframe.style.height=Math.ceil(height)+'px';});
  document.querySelector('.skip-link').addEventListener('click',function(event){event.preventDefault();enterProducts();setTimeout(function(){tabs[0].focus({preventScroll:true});},reduced.matches?0:700);});
  resize();
})();
