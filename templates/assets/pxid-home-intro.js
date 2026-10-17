(function(){
  'use strict';
  var loader=document.getElementById('pxidHeroIntro');
  var sec=document.getElementById('pxidS1');
  var copy=sec&&sec.querySelector('.bannerList');
  var video=sec&&sec.querySelector('.pxid-first-film-video');
  if(!loader||!copy||!video)return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)').matches||new URLSearchParams(location.search).get('motion')==='reduce';
  var root=document.documentElement,phase='loading',entranceDone=false,mediaReady=false,failed=false;
  var xhr,timer,decodeTimer,skipTimer,started=performance.now(),lastProgress=0;
  var source=video.querySelector('source'),url=source&&(source.dataset.src||source.getAttribute('src'));
  if(!url)return;
  root.classList.add('pxid-intro-pending');
  sec.classList.add('pxid-intro-active');
  sec.prepend(loader);
  loader.dataset.introState='loading';
  loader.insertAdjacentHTML('beforeend','<div class="pxid-intro-progress" role="progressbar" aria-label="骑行影片加载进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><output class="pxid-intro-number">00</output><span class="pxid-intro-percent" aria-hidden="true">%</span></div><p class="pxid-intro-status" role="status">LOADING THE RIDE</p><button class="pxid-intro-skip" type="button" hidden>先进入首页 ↗</button>');
  var progress=loader.querySelector('.pxid-intro-progress'),number=loader.querySelector('.pxid-intro-number');
  var status=loader.querySelector('.pxid-intro-status'),skip=loader.querySelector('.pxid-intro-skip');
  var bike=document.createElement('img');
  bike.className='pxid-intro-bike';bike.src=copy.querySelector('.slogan-f-bike').getAttribute('src');bike.alt='';bike.setAttribute('aria-hidden','true');
  sec.appendChild(bike);
  // Inert only the surrounding UI, never the progress or delayed escape action.
  var surroundings=Array.prototype.slice.call(document.querySelectorAll('#app>header,#app>nav,#app>footer,main>section:not(#pxidS1),#pxidS1 .pager'));
  var inertBefore=surroundings.map(function(node){var old=node.inert;node.inert=true;return old;});
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
    phase='releasing';loader.dataset.introState=failed?'fallback':'ready';
    loader.dataset.introReady='true';
    clearTimeout(timer);clearTimeout(decodeTimer);clearTimeout(skipTimer);
    if(!failed){setProgress(100);status.textContent='READY TO RIDE';}
    sec.classList.add('pxid-intro-restore-r');
    setTimeout(function(){
      sec.classList.add('pxid-intro-copy-hold');
      window.pxidHeroIntroReleased=true;
      window.dispatchEvent(new CustomEvent('pxid:hero-intro-release'));
      loader.style.opacity='0';
      loader.style.pointerEvents='none';
      setTimeout(function(){
        root.classList.remove('pxid-intro-pending');
        sec.classList.remove('pxid-intro-active','pxid-intro-restore-r');
        bike.remove();loader.hidden=true;loader.style.display='none';phase='complete';loader.dataset.introState='complete';
        clearInput();
        window.dispatchEvent(new CustomEvent('pxid:hero-intro-complete'));
        // Native desktop initialization has an old entrance tween. Keep the real
        // copy fixed until that finishes, then release every normal Hero state.
        setTimeout(function(){sec.classList.remove('pxid-intro-copy-hold');},1800);
      },reduced?0:420);
    },reduced?0:240);
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
  function ease(t){return 1-Math.pow(1-t,3);}
  function animate(now){
    var elapsed=now-started;
    var copyT=reduced?1:Math.max(0,Math.min(1,(elapsed-160)/1320));
    var bikeT=reduced?1:Math.max(0,Math.min(1,elapsed/1480));
    sec.style.setProperty('--intro-copy-x',(-(innerWidth+copy.offsetWidth)*(1-ease(copyT)))+'px');
    // Read the R's final slot by subtracting only our whole-copy translation.
    var letter=copy.querySelector('.slogan-r'),r=letter.getBoundingClientRect(),s=sec.getBoundingClientRect();
    var translation=-(innerWidth+copy.offsetWidth)*(1-ease(copyT));
    var font=parseFloat(getComputedStyle(letter).fontSize),width=font*.78,height=width*168/256;
    var finalX=r.left-s.left-translation+(r.width-width)/2;
    var finalY=r.top-s.top+(r.height-height)*.62;
    bike.style.width=width+'px';bike.style.height=height+'px';
    bike.style.transform='translate3d('+(-width*1.2+(finalX+width*1.2)*ease(bikeT))+'px,'+finalY+'px,0) rotate('+(-4*(1-bikeT))+'deg)';
    bike.style.opacity=reduced?'0':'1';
    if(copyT<1||bikeT<1){requestAnimationFrame(animate);}
    else{entranceDone=true;loader.dataset.entranceDone='true';end();}
  }
  // A resize during a long transfer still keeps the bike registered to the R.
  window.addEventListener('resize',function(){if(phase==='loading'&&entranceDone)animate(performance.now());},{passive:true});
  new MutationObserver(function(){
    var first=sec.querySelector('.bannerPic');
    if(first.classList.contains('out')||(!first.classList.contains('on')&&!first.classList.contains('in')))sec.classList.remove('pxid-intro-copy-hold');
  }).observe(sec.querySelector('.bannerPic'),{attributes:true,attributeFilter:['class']});
  requestAnimationFrame(function(now){started=now;animate(now);});
  skipTimer=setTimeout(function(){if(phase==='loading')skip.hidden=false;},10000);
  timer=setTimeout(fallback,46000);
  if(location.protocol==='file:')fallback();else download();
})();
