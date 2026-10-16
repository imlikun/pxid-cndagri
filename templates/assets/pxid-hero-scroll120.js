(function(){
  'use strict';
  const story=document.getElementById('scrollStory'),stage=document.getElementById('scrollStage');
  if(!story||!stage)return;
  const media=document.getElementById('mediaWindow'),canvas=document.getElementById('sequenceCanvas'),ctx=canvas.getContext('2d',{alpha:false});
  const opening=document.getElementById('openingCopy'),next=document.getElementById('nextCopy'),destination=document.getElementById('destinationPhoto');
  const header=document.getElementById('siteHeader'),cursor=document.getElementById('imageCursor'),cursorLabel=document.getElementById('cursorLabel');
  const fill=document.getElementById('progressFill'),counter=document.getElementById('currentFrame'),cue=document.getElementById('cueText');
  const status=document.getElementById('sequenceStatus'),poster=document.getElementById('sequencePoster');
  const film=document.getElementById('ridingFilm'),filmLayer=document.getElementById('filmLayer'),filmToggle=document.getElementById('filmToggle'),handoffEdge=document.getElementById('handoffEdge');
  function staticFallback(){if(!poster.dataset.fallback){poster.dataset.fallback='true';poster.src='../assets/pxid/home/mantis-mountain.png';}}
  poster.addEventListener('error',staticFallback);if(poster.complete&&!poster.naturalWidth)staticFallback();
  const reducedQuery=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const smallQuery=matchMedia('(max-width:700px)'),reduceBox=document.getElementById('reduceMotion');
  const base=new URL('../assets/pxid/home/scroll120/',location.href);
  let manifest=null,count=120,width=1280,height=704,p=0,target=0,desired=0,drawn=-1,currentModel=0;
  let start=0,range=innerHeight*1.8,frameId=0,previousTime=0,tau=.22,networkCount=0;
  let startupReady=false,decodeActive=0,hasFailure=false,renderKey='',destroyed=false;
  let filmEnded=false,resumeAfterVisibility=false;
  const blobs=new Map(),network=new Map(),bitmaps=new Map(),decoding=new Map(),queue=[];
  const modelData=[
    ['../assets/pxid/home/mantis-mountain.png','MANTIS P6 全地形电动自行车','MANTIS / ALL-TERRAIN','P6','生而向野。','全地形电动自行车，让设计走进真实的骑行场景。'],
    ['../assets/pxid/home/light-p2-rider.jpg','LIGHT P2 折叠电动自行车','LIGHT / FOLDING','P2','折叠，自由出发。','面向城市与短途出行，探索折叠电动自行车的更多可能。'],
    ['../assets/pxid/home/award-m2-gida.jpg','PXID M2 城市电动摩托车','PXID / URBAN MOBILITY','M2','城市，自在穿行。','从产品设计到工程开发，构建城市电动摩托车方案。']
  ];
  const clamp=v=>Math.max(0,Math.min(1,v));
  const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
  const part=(v,a,b)=>smooth((v-a)/(b-a));
  const simplified=()=>reducedQuery.matches||reduceBox.checked;
  function syncFilmButton(){
    filmToggle.disabled=p>.003;
    filmToggle.textContent=filmEnded?'↺':film.paused?'▷':'Ⅱ';
    filmToggle.setAttribute('aria-label',filmEnded?'重播开场视频':film.paused?'播放开场视频':'暂停开场视频');
  }
  function freezeFilm(ended){
    film.pause();if(ended){filmEnded=true;filmLayer.classList.add('is-ended');}
    syncFilmButton();requestTick();
  }
  function playFilm(){
    if(film.error||film.networkState===3){freezeFilm(true);return;}
    if(simplified()||target>.003||document.hidden){freezeFilm(simplified());return;}
    film.muted=true;film.play().then(syncFilmButton).catch(()=>{if(film.error||film.networkState===3)freezeFilm(true);syncFilmButton();status.textContent='可点击播放开场视频，或向下滚动探索产品';});
  }
  function replay(){
    window.scrollTo({top:start,behavior:'instant'});p=target=0;filmEnded=false;filmLayer.classList.remove('is-ended');film.currentTime=0;chooseModel(0);renderKey='';
    if(simplified())freezeFilm(true);else playFilm();requestTick();
  }
  film.addEventListener('ended',()=>freezeFilm(true));film.addEventListener('play',()=>{syncFilmButton();requestTick();});film.addEventListener('pause',()=>{syncFilmButton();requestTick();});
  film.addEventListener('timeupdate',requestTick);
  film.addEventListener('error',()=>{freezeFilm(true);status.textContent='开场视频未能载入，已显示定帧画面';},true);
  filmToggle.addEventListener('click',()=>{if(filmEnded)replay();else if(film.paused)playFilm();else freezeFilm(false);});
  function fetchBlob(i){
    if(blobs.has(i))return Promise.resolve(blobs.get(i));
    if(network.has(i))return network.get(i);
    const file=manifest&&manifest.frames?manifest.frames[i]:String(i).padStart(5,'0')+'.webp';
    const request=fetch(new URL(file,base)).then(r=>{if(!r.ok)throw Error('frame '+i);return r.blob();}).then(blob=>{
      blobs.set(i,blob);networkCount++;document.getElementById('loadingFill').style.transform='scaleX('+(networkCount/count)+')';return blob;
    }).catch(()=>{hasFailure=true;return null;});
    network.set(i,request);return request;
  }
  async function decode(i){
    if(bitmaps.has(i))return bitmaps.get(i);
    if(decoding.has(i))return decoding.get(i);
    const promise=(async()=>{
      const blob=await fetchBlob(i);if(!blob||destroyed)return null;
      let bitmap;
      if('createImageBitmap' in window)bitmap=await createImageBitmap(blob);
      else{bitmap=new Image();const url=URL.createObjectURL(blob);try{bitmap.src=url;await bitmap.decode();}finally{URL.revokeObjectURL(url);}}
      if(destroyed){if(bitmap.close)bitmap.close();return null;}
      bitmaps.set(i,bitmap);evict();requestTick();return bitmap;
    })().catch(()=>{hasFailure=true;return null;}).finally(()=>decoding.delete(i));
    decoding.set(i,promise);return promise;
  }
  function evict(){
    while(bitmaps.size>28){
      let far=-1,distance=-1;
      bitmaps.forEach((image,i)=>{if(i!==0&&i!==count-1&&Math.abs(i-desired)>distance){far=i;distance=Math.abs(i-desired);}});
      if(far<0)break;const image=bitmaps.get(far);if(image.close)image.close();bitmaps.delete(far);
    }
  }
  function pump(){
    while(decodeActive<4&&queue.length){const i=queue.shift();if(bitmaps.has(i)||decoding.has(i))continue;decodeActive++;decode(i).finally(()=>{decodeActive--;pump();});}
  }
  function demand(i){
    desired=i;const need=[i];for(let offset=1;offset<=5;offset++){if(i+offset<count)need.push(i+offset);if(i-offset>=0)need.push(i-offset);}
    queue.splice(0,queue.length,...need);pump();
  }
  function nearest(i){
    if(bitmaps.has(i))return i;let best=-1,distance=Infinity;
    bitmaps.forEach((image,index)=>{if(Math.abs(i-index)<distance){best=index;distance=Math.abs(i-index);}});return best;
  }
  function render(){
    const imageIndex=nearest(desired);if(imageIndex<0)return;
    const image=bitmaps.get(imageIndex),box=media.getBoundingClientRect();
    const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.round(box.width*dpr)),h=Math.max(1,Math.round(box.height*dpr));
    const key=imageIndex+':'+w+':'+h;if(renderKey===key)return;
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    ctx.fillStyle='#111513';ctx.fillRect(0,0,w,h);
    const iw=image.width||width,ih=image.height||height,scale=Math.min(w/iw,h/ih);
    ctx.drawImage(image,(w-iw*scale)/2,(h-ih*scale)*(smallQuery.matches?.22:.5),iw*scale,ih*scale);
    renderKey=key;drawn=imageIndex;canvas.style.opacity='1';poster.style.opacity='0';stage.dataset.frame=String(imageIndex);
    counter.textContent=String(imageIndex+1).padStart(3,'0');
  }
  function layout(){
    const W=innerWidth,H=innerHeight,mobile=smallQuery.matches;
    const shrink=part(p,.52,.96),endW=mobile?W*.88:W*.54,endH=endW/(width/height);
    const endX=W*.06,endY=mobile?H*.14:(H-endH)*.5;
    media.style.left=(endX*shrink)+'px';media.style.top=(endY*shrink)+'px';
    media.style.width=(W+(endW-W)*shrink)+'px';media.style.height=(H+(endH-H)*shrink)+'px';
    media.style.borderRadius=(14*shrink)+'px';
    document.querySelectorAll('.picture-corner').forEach(e=>e.style.opacity=shrink);
    const reveal=part(p,.01,.30);filmLayer.style.clipPath='inset(0 '+(reveal*100)+'% 0 0)';filmLayer.style.visibility=p>=.301?'hidden':'visible';
    handoffEdge.style.left=((1-reveal)*W)+'px';handoffEdge.style.opacity=String(simplified()?0:Math.sin(reveal*Math.PI)*.6);
    const titleEnd=Number.isFinite(film.duration)?film.duration:6.8;
    const filmTitle=simplified()?1:filmEnded?0:1-part(film.currentTime,titleEnd-1.5,titleEnd-.2);
    const fade=(1-part(p,.01,.18))*filmTitle;opening.style.opacity=fade;opening.style.transform='translateY('+(-55*(1-fade))+'px)';
    const enter=part(p,.76,.98);next.style.opacity=enter;next.style.transform='translateY('+(40*(1-enter))+'px)';
    const active=p>.985;next.inert=!active;next.setAttribute('aria-hidden',String(!active));
    destination.style.opacity=p>.995?'1':'0';media.classList.toggle('is-clickable',fine.matches&&!simplified());if(simplified())cursor.classList.remove('is-visible');
    cursorLabel.textContent=p>.995?'探索产品':'向下探索';cursor.querySelector('b').textContent=p>.995?'↗':'↓';
    cue.textContent=p>.995?'继续滚动，进入 ODM 流程':p>.3?'向下滚动，改变视角':filmEnded?'画面已定帧，滚动探索 P6':'向下滚动，探索下一程';fill.style.transform='scaleX('+p+')';
    stage.dataset.phase=p>.995?'products':p>.3?'orbit':p>.003?'handoff':film.paused?'hold':'film';syncFilmButton();
    stage.dataset.progress=p.toFixed(4);stage.dataset.target=target.toFixed(4);stage.dataset.cache=String(bitmaps.size);
    const after=document.getElementById('nextChapter').getBoundingClientRect().top<header.offsetHeight;header.classList.toggle('is-light',after);
    if(p<.985&&currentModel!==0)chooseModel(0);
  }
  function tick(time){
    frameId=0;const dt=previousTime?Math.min((time-previousTime)/1000,.05):1/60;previousTime=time;
    if(simplified())p=target<.5?0:1;
    else{p+=(target-p)*(1-Math.exp(-dt/tau));if(Math.abs(target-p)<.00008)p=target;}
    layout();const orbit=clamp((p-.3)/.7);stage.dataset.orbit=orbit.toFixed(4);
    const index=simplified()?(p<.5?0:count-1):Math.round(orbit*(count-1));if(index!==desired||!bitmaps.has(index))demand(index);render();
    if(Math.abs(target-p)>.00008&&!simplified())frameId=requestAnimationFrame(tick);
  }
  function requestTick(){if(!frameId&&!destroyed)frameId=requestAnimationFrame(tick);}
  function onScroll(){target=clamp((scrollY-start)/range);if(target>.003&&!film.paused)freezeFilm(false);requestTick();}
  function resize(){start=story.getBoundingClientRect().top+scrollY;range=innerHeight*(smallQuery.matches?1.7:1.8);stage.dataset.range=String(range);renderKey='';onScroll();}
  function chooseModel(i){
    currentModel=i;destination.src=modelData[i][0];destination.alt=modelData[i][1];
    ['modelFamily','modelCode','modelHeadline','modelDescription'].forEach((id,j)=>document.getElementById(id).textContent=modelData[i][j+2]);
    document.querySelectorAll('[data-model]').forEach((b,index)=>{b.classList.toggle('is-current',index===i);b.setAttribute('aria-pressed',String(index===i));});
  }
  document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>chooseModel(Number(b.dataset.model))));
  document.getElementById('replay').addEventListener('click',replay);
  document.getElementById('scrollCue').addEventListener('click',()=>window.scrollTo({top:start+range*(p>.985?1.35:Math.min(1,target+.42)),behavior:simplified()?'instant':'smooth'}));
  document.getElementById('followSpeed').addEventListener('change',e=>{tau=Number(e.target.value);requestTick();});
  function motionChange(){if(simplified())freezeFilm(true);renderKey='';requestTick();}
  reduceBox.addEventListener('change',motionChange);reducedQuery.addEventListener('change',motionChange);
  const motionButton=document.getElementById('motionButton'),motionPanel=document.getElementById('motionPanel');
  motionButton.addEventListener('click',()=>{motionPanel.hidden=!motionPanel.hidden;motionButton.setAttribute('aria-expanded',String(!motionPanel.hidden));});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){motionPanel.hidden=true;motionButton.setAttribute('aria-expanded','false');header.classList.remove('is-menu-open');document.querySelector('.menu-button').setAttribute('aria-expanded','false');}});
  document.querySelector('.menu-button').addEventListener('click',e=>{const on=header.classList.toggle('is-menu-open');e.currentTarget.setAttribute('aria-expanded',String(on));});
  media.addEventListener('pointermove',e=>{if(!fine.matches||simplified())return;cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';cursor.classList.add('is-visible');});
  media.addEventListener('pointerleave',()=>cursor.classList.remove('is-visible'));
  media.addEventListener('click',()=>{if(p>.995)location.href='business.html';else window.scrollTo({top:start+range,behavior:simplified()?'instant':'smooth'});});
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('message',e=>{const iframe=document.getElementById('odmFrame');if(e.origin===location.origin&&e.source===iframe.contentWindow&&e.data&&e.data.type==='pxid-story-odm-height'&&Number.isFinite(e.data.height))iframe.style.height=Math.max(700,innerHeight,e.data.height)+'px';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resumeAfterVisibility=!film.paused;film.pause();}else if(resumeAfterVisibility&&target<.003&&!filmEnded){resumeAfterVisibility=false;playFilm();}});
  window.addEventListener('pagehide',e=>{film.pause();if(e.persisted)return;destroyed=true;bitmaps.forEach(image=>{if(image.close)image.close();});bitmaps.clear();if(frameId)cancelAnimationFrame(frameId);});
  window.addEventListener('pageshow',e=>{if(e.persisted)resize();});
  async function init(){
    try{
      const response=await fetch(new URL('sequence.json',base));if(!response.ok)throw Error('manifest');manifest=await response.json();
      count=manifest.frameCount;width=manifest.width;height=manifest.height;
      await Promise.all([decode(0),decode(count-1)]);startupReady=bitmaps.has(0);stage.setAttribute('aria-busy','false');
      status.textContent=startupReady?'图片序列已准备，可向下滚动':'正在显示静态预览';
      document.getElementById('loadingLine').classList.add('is-ready');resize();
      let nextIndex=0;const worker=async()=>{while(nextIndex<count&&!destroyed){const i=nextIndex++;await fetchBlob(i);}};
      await Promise.all([worker(),worker(),worker(),worker()]);
      stage.dataset.loaded=String(blobs.size);status.textContent=hasFailure?'部分图片尚未载入，已保留可用画面':'图片序列已完整载入';
    }catch(error){staticFallback();stage.setAttribute('aria-busy','false');stage.dataset.error='asset-load';status.textContent='图片未能完整载入，可查看静态预览';resize();}
  }
  resize();init();if(simplified())freezeFilm(true);else playFilm();
})();
