(function(){
  'use strict';
  var sec=document.getElementById('pxidS1');
  var frame=sec&&sec.querySelector('[data-hero-frame="p6-motion"]');
  var pager=sec&&sec.querySelector('.pxid-p6-layered-pager');
  if(!frame||!pager)return;
  var active=false;
  var ready=false;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function play(){
    frame.classList.remove('is-layered-playing');
    if(!active||!ready)return;
    void frame.offsetWidth;
    frame.classList.add('is-layered-playing');
  }
  function sync(){
    var next=(frame.classList.contains('in')||frame.classList.contains('on')||frame.classList.contains('is-fallback-active'))&&!frame.classList.contains('out');
    if(next===active)return;
    active=next;
    sec.classList.toggle('pxid-p6-layered-active',active);
    play();
  }
  new MutationObserver(sync).observe(frame,{attributes:true,attributeFilter:['class']});
  var images=Array.prototype.slice.call(frame.querySelectorAll('img'));
  Promise.all(images.map(function(img){
    if(img.decode)return img.decode().catch(function(){});
    if(img.complete)return Promise.resolve();
    return new Promise(function(resolve){img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
  })).then(function(){ready=true;frame.classList.add('is-layered-ready');sync();if(active)play();});
  pager.addEventListener('click',function(event){
    if(!active||!ready)return;
    event.stopImmediatePropagation();
    play();
  },true);
  if(reduced.addEventListener)reduced.addEventListener('change',play);
  // A shareable view opens the new scene after the existing carousel is ready.
  if(new URLSearchParams(window.location.search).get('hero')==='p6-motion'){
    var attempts=0;
    var previewTimer=setInterval(function(){
      attempts++;
      if(active){clearInterval(previewTimer);return;}
      var load=document.querySelector('#loadMedia');
      var carouselReady=(load&&getComputedStyle(load.parentElement).display==='none')||(document.documentElement.classList.contains('pxid-fallback-motion')&&sec.querySelector('.is-fallback-active'));
      if(ready&&carouselReady){
        pager.click();
      }
      if(attempts>=40)clearInterval(previewTimer);
    },250);
  }
})();
