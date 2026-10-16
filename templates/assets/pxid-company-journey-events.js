/* The page scrolls normally; the desktop scene follows it and every year remains directly selectable. */
(function () {
  'use strict';
  var root=document.querySelector('#milestones.pxid-events');
  if (!root) return;
  var records;
  try { records=JSON.parse(root.querySelector('.pj-data').textContent); } catch (_) { return; }
  if (!records || !records.length) return;

  var scene=root.querySelector('.pe-scene');
  var photo=root.querySelector('.pe-photo');
  var figure=root.querySelector('.pe-figure');
  var year=root.querySelector('.pe-year');
  var title=root.querySelector('.pe-title');
  var summary=root.querySelector('.pe-summary');
  var detail=root.querySelector('.pe-detail');
  var phase=root.querySelector('.pe-phase');
  var sequence=root.querySelector('.pe-sequence');
  var counter=root.querySelector('.pe-counter');
  var ghost=root.querySelector('.pe-ghost-year');
  var photoYear=root.querySelector('.pe-photo-year');
  var photoTitle=root.querySelector('.pe-photo-title');
  var nextCard=root.querySelector('.pe-next-card');
  var nextYear=root.querySelector('.pe-next-year');
  var nextTitle=root.querySelector('.pe-next-title');
  var hint=root.querySelector('.pe-hint-copy');
  var years=root.querySelector('.pe-years');
  var buttons=Array.from(years.querySelectorAll('button'));
  var prev=root.querySelector('.pe-prev');
  var next=root.querySelector('.pe-next');
  var status=root.querySelector('.pe-status');
  var header=document.querySelector('#app > header');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktop=window.matchMedia('(min-width:1100px) and (min-height:700px)');
  var selected=-1, pinned=false, start=0, travel=0, frame=0;

  function select(index, manual) {
    index=Math.max(0,Math.min(records.length-1,index));
    if (index===selected) return;
    selected=index;
    var record=records[index];
    var echo=records[index+1] || records[index-1];
    year.textContent=record.year;
    title.textContent=record.title;
    summary.textContent=record.summary;
    detail.textContent=record.detail;
    detail.hidden=!record.detail;
    phase.textContent=record.label;
    sequence.textContent=String(index+1).padStart(2,'0')+' / '+String(records.length).padStart(2,'0');
    counter.innerHTML=String(index+1).padStart(2,'0')+' <i>/</i> '+String(records.length).padStart(2,'0');
    ghost.textContent=record.year;
    photo.src=record.image;
    photo.alt=record.imageAlt;
    photo.width=record.width;
    photo.height=record.height;
    figure.dataset.year=record.year;
    photoYear.textContent=record.year;
    photoTitle.textContent=record.title;
    nextCard.hidden=!echo;
    if (echo) {
      nextYear.textContent=echo.year;
      nextTitle.textContent=echo.title;
    }
    buttons.forEach(function (button,i) {
      if (i===index) button.setAttribute('aria-current','date');
      else button.removeAttribute('aria-current');
    });
    prev.disabled=index===0;
    next.disabled=index===records.length-1;
    root.style.setProperty('--pe-progress',(index/(records.length-1)*100)+'%');

    if (window.innerWidth<1100 || window.innerHeight<700) {
      var left=buttons[index].offsetLeft-(years.clientWidth-buttons[index].offsetWidth)/2;
      years.scrollTo({left:Math.max(0,left),behavior:reduced.matches?'instant':'smooth'});
    } else {
      var top=buttons[index].offsetTop-(years.clientHeight-buttons[index].offsetHeight)/2;
      years.scrollTo({top:Math.max(0,top),behavior:reduced.matches?'instant':'smooth'});
    }
    if (manual) status.textContent=record.year+'年，'+record.title;
    if (!reduced.matches && year.animate) {
      [root.querySelector('.pe-card'),figure].forEach(function (element) {
        element.getAnimations().forEach(function (animation) { animation.cancel(); });
        element.animate([{opacity:.55,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'ease-out'});
      });
    }
    [index-1,index+1].forEach(function (i) {
      if (records[i]) { var image=new Image(); image.src=records[i].image; }
    });
  }

  function update() {
    frame=0;
    if (!pinned || travel<=0) return;
    var progress=Math.max(0,Math.min(1,(window.scrollY-start)/travel));
    select(Math.round(progress*(records.length-1)),false);
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(update); }
  function choose(index) {
    select(index,true);
    if (pinned && travel>0) {
      var target=start+index/(records.length-1)*travel;
      window.scrollTo({top:target,behavior:'instant'});
    }
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
    var unit=pinned?Math.min(scene.offsetWidth/1920,available/zoom/990):1;
    root.style.setProperty('--pe-u',unit+'px');
    root.style.minHeight=pinned?((available+window.innerHeight*2.8)/zoom)+'px':'';
    start=window.scrollY+root.getBoundingClientRect().top-headerHeight;
    travel=pinned?root.getBoundingClientRect().height-scene.getBoundingClientRect().height:0;
    schedule();
  }

  buttons.forEach(function (button,i) { button.addEventListener('click',function () { choose(i); }); });
  prev.addEventListener('click',function () { choose(selected-1); });
  next.addEventListener('click',function () { choose(selected+1); });
  root.addEventListener('keydown',function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    var index=selected;
    if (event.key==='ArrowLeft') index--;
    else if (event.key==='ArrowRight') index++;
    else if (event.key==='Home') index=0;
    else if (event.key==='End') index=records.length-1;
    else return;
    event.preventDefault();
    choose(index);
  });
  var touch=null;
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

  root.classList.add('pe-ready');
  select(0,false);
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('load',measure,{once:true});
  reduced.addEventListener('change',measure);
  if ('ResizeObserver' in window && header) new ResizeObserver(measure).observe(header);
  measure();
})();
