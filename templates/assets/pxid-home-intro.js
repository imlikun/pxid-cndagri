(function(){
  'use strict';
  var loader=document.getElementById('pxidHeroIntro');
  var sec=document.getElementById('pxidS1');
  var copy=sec&&sec.querySelector('.bannerList');
  var video=sec&&sec.querySelector('.pxid-first-film-video');
  if(!loader||!copy||!video)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)').matches||new URLSearchParams(location.search).get('motion')==='reduce';
  var root=document.documentElement,phase='loading',entranceDone=false,mediaReady=false,failed=false;
  var xhr,timer,decodeTimer,skipTimer,lastProgress=0,entranceAnimations=[];
  var source=video.querySelector('source'),url=source&&(source.dataset.src||source.getAttribute('src'));
  if(!url)return;
  root.classList.add('pxid-intro-pending');
  sec.classList.add('pxid-intro-active');
  sec.prepend(loader);
  loader.dataset.introState='loading';
  var progress=loader.querySelector('.pxid-intro-progress'),number=loader.querySelector('.pxid-intro-number');
  var status=loader.querySelector('.pxid-intro-status'),skip=loader.querySelector('.pxid-intro-skip');
  var bike=document.createElement('img');
  bike.className='pxid-intro-bike';bike.src=copy.querySelector('.slogan-f-bike').getAttribute('src');bike.alt='';bike.setAttribute('aria-hidden','true');
  sec.appendChild(bike);
  // Inert only the surrounding UI, never the progress or delayed escape action.
  var surroundings=Array.prototype.slice.call(document.querySelectorAll('#app>header,#app>nav,#app>footer,main>section:not(#pxidS1),#pxidS1 .pager'));
  var inertBefore=surroundings.map(function(node){var old=node.inert;node.inert=true;return old;});
  document.addEventListener('DOMContentLoaded',function(){
    if(phase==='complete')return;
    document.querySelectorAll('#app>header,#app>nav,#app>footer,main>section:not(#pxidS1),#pxidS1 .pager').forEach(function(node){
      if(surroundings.indexOf(node)>=0)return;
      surroundings.push(node);inertBefore.push(node.inert);node.inert=true;
    });
  },{once:true});
  function setProgress(value){
    value=Math.max(lastProgress,Math.min(100,Math.floor(value)));lastProgress=value;
    number.textContent=String(value).padStart(2,'0');
    progress.setAttribute('aria-valuenow',String(value));
    loader.dataset.loadedPercent=String(value);
  }
  function preventScroll(event){
    if(!root.classList.contains('pxid-intro-pending'))return;
    if(event.type==='keydown'&&![' ','ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key))return;
    if(event.target.closest('button'))return;
    event.preventDefault();event.stopImmediatePropagation();
  }
  window.addEventListener('wheel',preventScroll,{capture:true,passive:false});
  window.addEventListener('touchmove',preventScroll,{capture:true,passive:false});
  window.addEventListener('keydown',preventScroll,true);
  function clearInput(){
    window.removeEventListener('wheel',preventScroll,true);window.removeEventListener('touchmove',preventScroll,true);window.removeEventListener('keydown',preventScroll,true);
    surroundings.forEach(function(node,index){node.inert=inertBefore[index];});
  }
  function end(){
    if(phase!=='loading'||!entranceDone||!mediaReady)return;
    phase='morphing';loader.dataset.introState='morphing';
    loader.dataset.introReady='true';
    clearTimeout(timer);clearTimeout(decodeTimer);clearTimeout(skipTimer);
    if(!failed){setProgress(100);status.textContent='READY TO RIDE';}
    sec.classList.add('pxid-intro-copy-hold');
    entranceAnimations.forEach(function(animation){animation.cancel();});
    sec.classList.add('pxid-intro-restore-r');
    loader.dataset.morphStarted=String(performance.now());
    window.dispatchEvent(new CustomEvent('pxid:hero-intro-morph'));
    // The car becomes R only AFTER the complete group has landed. The 240ms
    // is visible transformation, not an empty wait or a playback delay.
    setTimeout(revealVideo,reduced?0:240);
  }
  function revealVideo(){
    phase='releasing';loader.dataset.introState='revealing';
    root.classList.add('pxid-intro-revealing');
    window.pxidHeroIntroReleased=true;
    sec.querySelector('.bannerPic').classList.add('on');
    window.dispatchEvent(new CustomEvent('pxid:hero-intro-release'));
    window.dispatchEvent(new CustomEvent('pxid:hero-intro-reveal'));
    loader.style.opacity='0';
    loader.style.pointerEvents='none';
    setTimeout(function(){
      root.classList.remove('pxid-intro-pending','pxid-intro-revealing');
      sec.classList.remove('pxid-intro-active','pxid-intro-restore-r');
      entranceAnimations.forEach(function(animation){animation.cancel();});
      bike.remove();loader.hidden=true;loader.style.display='none';phase='complete';loader.dataset.introState='complete';
      clearInput();
      window.dispatchEvent(new CustomEvent('pxid:hero-intro-complete'));
      setTimeout(function(){sec.classList.remove('pxid-intro-copy-hold');},1800);
    },reduced?0:340);
  }
  function fallback(){
    if(phase!=='loading')return;
    failed=true;mediaReady=true;
    status.textContent='影片稍后播放';progress.setAttribute('aria-label','进入首页');progress.removeAttribute('aria-valuenow');
    if(xhr&&xhr.readyState!==4)xhr.abort();
    // Keep the existing poster, and let normal streaming retry without blocking.
    video.src=url;video.preload='auto';video.load();
    end();
  }
  skip.addEventListener('click',fallback);
  function mediaDecoded(){
    if(phase!=='loading'||failed||video.readyState<3)return;
    mediaReady=true;end();
  }
  video.addEventListener('canplay',mediaDecoded);
  video.addEventListener('error',function(){if(!failed)fallback();});
  function download(){
    xhr=new XMLHttpRequest();xhr.open('GET',url,true);xhr.responseType='blob';xhr.timeout=45000;
    xhr.onprogress=function(event){
      if(phase!=='loading'||!event.lengthComputable)return;
      // Bytes, not elapsed seconds. Reserve the last point for video decoding.
      setProgress(Math.min(99,event.loaded/event.total*100));
    };
    xhr.onload=function(){
      if(failed||phase!=='loading')return;
      if(xhr.status<200||xhr.status>=300||!xhr.response||!xhr.response.size){fallback();return;}
      setProgress(99);
      video.src=URL.createObjectURL(xhr.response);video.preload='auto';video.load();
      mediaDecoded();decodeTimer=setTimeout(function(){if(!mediaReady)fallback();},12000);
    };
    xhr.onerror=xhr.ontimeout=fallback;
    xhr.send();
  }
  function measure(){
    // Measure once BEFORE motion. No layout reads or JS position calculations
    // run during the entrance; both transforms run on the compositor timeline.
    var letter=copy.querySelector('.slogan-r'),r=letter.getBoundingClientRect(),s=sec.getBoundingClientRect();
    var font=parseFloat(getComputedStyle(letter).fontSize),width=font*.62,height=width*168/256;
    var finalX=r.left-s.left+(r.width-width)/2;
    var finalY=r.top-s.top+(r.height-height)*.62;
    bike.style.width=width+'px';bike.style.height=height+'px';
    return {x:finalX,y:finalY,width:width,copyStart:-(finalX+width+24)};
  }
  function startEntrance(){
    var m=measure();
    var finalTransform='translate3d('+m.x+'px,'+m.y+'px,0)';
    bike.style.transform=finalTransform;
    if(reduced||!copy.animate){
      sec.classList.add('pxid-intro-reduced');
      entranceDone=true;loader.dataset.entranceDone='true';end();return;
    }
    var timing={duration:1600,easing:'linear',fill:'both'};
    var pullEase='cubic-bezier(.3,.3,.25,1)';
    var lead=Math.min(110,innerWidth*.12);
    entranceAnimations=[
      copy.animate([
        {transform:'translate3d('+m.copyStart+'px,0,0)',offset:0},
        {transform:'translate3d('+m.copyStart+'px,0,0)',offset:.25,easing:pullEase},
        {transform:'translate3d(0,0,0)',offset:1}
      ],timing),
      bike.animate([
        {transform:'translate3d('+(-m.width-12)+'px,'+m.y+'px,0)',offset:0},
        {transform:'translate3d('+lead+'px,'+m.y+'px,0)',offset:.25,easing:pullEase},
        {transform:finalTransform,offset:1}
      ],timing),
      copy.animate([{opacity:0,offset:0},{opacity:0,offset:.25},{opacity:1,offset:.34},{opacity:1,offset:1}],timing)
    ];
    sec.classList.add('pxid-intro-running');
    bike.style.opacity='1';
    Promise.all(entranceAnimations.map(function(animation){return animation.ready;})).then(function(){
      var start=entranceAnimations[0].startTime;
      entranceAnimations.forEach(function(animation){animation.startTime=start;});
      loader.dataset.entranceStarted=String(start);
    });
    Promise.all(entranceAnimations.map(function(animation){return animation.finished;})).then(function(){
      entranceDone=true;loader.dataset.entranceDone='true';end();
    }).catch(function(){});
  }
  // A resize during a long transfer still keeps the bike registered to the R.
  window.addEventListener('resize',function(){
    if(phase!=='loading'||!entranceDone)return;
    entranceAnimations.forEach(function(animation){animation.cancel();});
    var m=measure();bike.style.transform='translate3d('+m.x+'px,'+m.y+'px,0)';
  },{passive:true});
  new MutationObserver(function(){
    var first=sec.querySelector('.bannerPic');
    if(first.classList.contains('out')||(!first.classList.contains('on')&&!first.classList.contains('in')))sec.classList.remove('pxid-intro-copy-hold');
  }).observe(sec.querySelector('.bannerPic'),{attributes:true,attributeFilter:['class']});
  // Start only once the already-preloaded SVG is decoded, so a missing first
  // icon frame cannot produce a pop halfway through the movement.
  Promise.resolve(bike.decode?bike.decode():null).catch(function(){}).then(function(){requestAnimationFrame(startEntrance);});
  skipTimer=setTimeout(function(){if(phase==='loading')skip.hidden=false;},10000);
  timer=setTimeout(fallback,46000);
  if(location.protocol==='file:')fallback();else download();
})();
