/* Scroll-driven depth scene for the PXID history. The page itself remains scrollable. */
(function () {
  'use strict';
  var root=document.querySelector('#milestones.pxid-events-depth');
  if (!root) return;
  var slides=Array.from(root.querySelectorAll('.pe-slide'));
  if (!slides.length) return;
  var scene=root.querySelector('.pe-scene');
  var ghost=root.querySelector('.pe-ghost-year');
  var hint=root.querySelector('.pe-hint-copy');
  var years=root.querySelector('.pe-years');
  var buttons=Array.from(years.querySelectorAll('button'));
  var prev=root.querySelector('.pe-prev');
  var next=root.querySelector('.pe-next');
  var counter=root.querySelector('.pe-counter');
  var status=root.querySelector('.pe-status');
  var header=document.querySelector('#app > header');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktop=window.matchMedia('(min-width:1100px) and (min-height:700px)');
  var selected=-1,pinned=false,start=0,travel=0,unit=1,frame=0;

  function clamp(value,min,max) { return Math.max(min,Math.min(max,value)); }
  function loadImage(index) {
    var slide=slides[index];
    if (!slide) return;
    var image=slide.querySelector('.pe-photo');
    if (image.dataset.src) {
      image.src=image.dataset.src;
      delete image.dataset.src;
    }
  }
  function select(index,manual) {
    index=clamp(index,0,slides.length-1);
    if (index===selected) return;
    selected=index;
    slides.forEach(function (slide,i) {
      if (i===index) {
        slide.setAttribute('aria-current','true');
        slide.removeAttribute('aria-hidden');
      } else {
        slide.removeAttribute('aria-current');
        slide.setAttribute('aria-hidden','true');
      }
      slide.querySelector('.pe-figure').tabIndex=i===index?0:-1;
    });
    buttons.forEach(function (button,i) {
      if (i===index) button.setAttribute('aria-current','date');
      else button.removeAttribute('aria-current');
    });
    var slide=slides[index];
    ghost.textContent=slide.dataset.year;
    prev.disabled=index===0;
    next.disabled=index===slides.length-1;
    counter.innerHTML=String(index+1).padStart(2,'0')+' <i>/</i> '+String(slides.length).padStart(2,'0');
    loadImage(index);
    loadImage(index-1);
    loadImage(index+1);
    loadImage(index+2);
    if (manual) status.textContent=slide.dataset.year+'年，'+slide.querySelector('.pe-title').textContent;
    if (!pinned) {
      var left=buttons[index].offsetLeft-(years.clientWidth-buttons[index].offsetWidth)/2;
      years.scrollTo({left:Math.max(0,left),behavior:reduced.matches?'instant':'smooth'});
    } else {
      var top=buttons[index].offsetTop-(years.clientHeight-buttons[index].offsetHeight)/2;
      years.scrollTo({top:Math.max(0,top),behavior:reduced.matches?'instant':'smooth'});
    }
  }
  function paint(position) {
    slides.forEach(function (slide,index) {
      var distance=index-position;
      if (distance>1.75 || distance<-.78) {
        slide.style.visibility='hidden';
        slide.style.pointerEvents='none';
        return;
      }
      slide.style.visibility='visible';
      slide.style.pointerEvents=distance>-.2 && distance<.35?'auto':'none';
      var x,y,z,opacity,blur,angle;
      if (distance>=0) {
        x=175*distance*unit;
        y=-46*distance*unit;
        z=-370*distance*unit;
        opacity=clamp(1-.75*Math.pow(distance,3),0,1);
        blur=2.8*Math.pow(distance,3)*Math.max(.7,unit);
        angle=-4*distance;
      } else {
        var forward=-distance;
        x=-265*forward*unit;
        y=55*forward*unit;
        z=420*forward*unit;
        opacity=clamp(1-1.8*forward,0,1);
        blur=7*forward*Math.max(.7,unit);
        angle=5*forward;
      }
      slide.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,'+z.toFixed(1)+'px) rotateY('+angle.toFixed(2)+'deg)';
      slide.style.opacity=opacity.toFixed(3);
      slide.style.filter='blur('+blur.toFixed(2)+'px)';
      slide.style.zIndex=String(100-Math.round(distance*10));
    });
    root.style.setProperty('--pe-progress',(position/(slides.length-1)*100)+'%');
  }
  function update() {
    frame=0;
    if (!pinned || travel<=0) return;
    var position=clamp((window.scrollY-start)/travel,0,1)*(slides.length-1);
    select(Math.round(position),false);
    paint(position);
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(update); }
  function choose(index) {
    index=clamp(index,0,slides.length-1);
    select(index,true);
    if (pinned && travel>0) {
      window.scrollTo({top:start+index/(slides.length-1)*travel,behavior:'instant'});
      paint(index);
    } else root.style.setProperty('--pe-progress',(index/(slides.length-1)*100)+'%');
  }
  function measure() {
    var zoom=scene.getBoundingClientRect().width/scene.offsetWidth || 1;
    var headerHeight=header?header.getBoundingClientRect().height:0;
    var available=window.innerHeight-headerHeight;
    pinned=desktop.matches && !reduced.matches;
    hint.textContent=pinned?'SCROLL TO EXPLORE':'SELECT A YEAR';
    root.classList.toggle('pe-pinned',pinned);
    root.style.setProperty('--pe-top',(headerHeight/zoom)+'px');
    root.style.setProperty('--pe-height',(available/zoom)+'px');
    unit=pinned?Math.min(scene.offsetWidth/1920,available/zoom/990):1;
    root.style.setProperty('--pe-u',unit+'px');
    root.style.minHeight=pinned?((available+window.innerHeight*5.2)/zoom)+'px':'';
    start=window.scrollY+root.getBoundingClientRect().top-headerHeight;
    travel=pinned?root.getBoundingClientRect().height-scene.getBoundingClientRect().height:0;
    if (pinned) schedule();
    else {
      slides.forEach(function (slide) {
        slide.style.visibility='';
        slide.style.pointerEvents='';
        slide.style.transform='';
        slide.style.opacity='';
        slide.style.filter='';
        slide.style.zIndex='';
      });
      if (selected<0) select(0,false);
      root.style.setProperty('--pe-progress',(selected/(slides.length-1)*100)+'%');
    }
  }
  buttons.forEach(function (button,index) { button.addEventListener('click',function () { choose(index); }); });
  prev.addEventListener('click',function () { choose(selected-1); });
  next.addEventListener('click',function () { choose(selected+1); });
  root.addEventListener('keydown',function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    var index=selected;
    if (event.key==='ArrowLeft') index--;
    else if (event.key==='ArrowRight') index++;
    else if (event.key==='Home') index=0;
    else if (event.key==='End') index=slides.length-1;
    else return;
    event.preventDefault();
    choose(index);
  });
  var touch=null;
  root.querySelectorAll('.pe-figure').forEach(function (figure) {
    figure.addEventListener('touchstart',function (event) {
      if (event.touches.length===1) touch={x:event.touches[0].clientX,y:event.touches[0].clientY};
    },{passive:true});
    figure.addEventListener('touchend',function (event) {
      if (!touch || !event.changedTouches.length) return;
      var dx=event.changedTouches[0].clientX-touch.x;
      var dy=event.changedTouches[0].clientY-touch.y;
      touch=null;
      if (Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.4) choose(selected+(dx<0?1:-1));
    },{passive:true});
    figure.addEventListener('touchcancel',function () { touch=null; },{passive:true});
  });
  root.classList.add('pe-ready');
  select(0,false);
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('load',measure,{once:true});
  reduced.addEventListener('change',measure);
  if ('ResizeObserver' in window && header) new ResizeObserver(measure).observe(header);
  measure();
})();
