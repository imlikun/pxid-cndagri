/* Native page scroll; manual controls also expose the complete official history. */
(function () {
  'use strict';
  var root=document.querySelector('#milestones.pxid-journey');
  if (!root) return;
  var records;
  try { records=JSON.parse(root.querySelector('.pj-data').textContent); } catch (_) { return; }
  if (!records.length) return;
  var scene=root.querySelector('.pj-scene'), stage=root.querySelector('.pj-stage');
  var figure=root.querySelector('.pj-figure'), photo=root.querySelector('.pj-photo');
  var phase=root.querySelector('.pj-phase'), title=root.querySelector('.pj-title');
  var summary=root.querySelector('.pj-summary'), detail=root.querySelector('.pj-detail');
  var rail=root.querySelector('.pj-rail'), nodes=Array.from(root.querySelectorAll('.pj-node'));
  var buttons=Array.from(rail.querySelectorAll('button'));
  var prev=root.querySelector('.pj-prev'), next=root.querySelector('.pj-next');
  var status=root.querySelector('.pj-status'), header=document.querySelector('#app > header');
  var keys=[2013,2019,2020,2024,2025,2026], selected=0, pinned=false, travel=0, start=0;
  var frame=0, lastY=window.scrollY, manualYear=null, manualY=0, firstMeasure=true;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  var desktop=window.matchMedia('(min-width:1100px) and (min-height:700px)');

  function select(index,manual) {
    index=Math.max(0,Math.min(records.length-1,index));
    var record=records[index];
    if (index!==selected || firstMeasure) {
      selected=index;
      phase.textContent=record.year+' / '+record.label;
      title.textContent=record.title;
      summary.textContent=record.summary;
      detail.textContent=record.detail;
      detail.hidden=!record.detail;
      figure.dataset.year=record.year;
      photo.src=record.image;
      photo.alt=record.imageAlt;
      photo.width=record.width;
      photo.height=record.height;
      if (!reduced.matches && !firstMeasure && phase.animate) {
        [phase,title,figure].forEach(function (element) {
          element.getAnimations().forEach(function (animation) { animation.cancel(); });
          element.animate([{opacity:.35,translate:'0 6px'},{opacity:1,translate:'0 0'}],{duration:320,easing:'ease-out'});
        });
      }
    }
    var small=window.innerWidth<=600;
    nodes.forEach(function (node,i) {
      var delta=i-selected, angle=delta*34*Math.PI/180;
      node.style.left=(50+Math.sin(angle)*(small?43:49))+'%';
      node.style.top=(100-Math.cos(angle)*80)+'%';
      var visible=Math.abs(delta)<=(small?1:2);
      node.toggleAttribute('data-visible',visible);
      node.tabIndex=visible?0:-1;
      node.setAttribute('aria-hidden',String(!visible));
      if (i===selected) node.setAttribute('aria-current','date');
      else node.removeAttribute('aria-current');
      if (i===selected) buttons[i].setAttribute('aria-current','date');
      else buttons[i].removeAttribute('aria-current');
    });
    prev.disabled=selected===0;
    next.disabled=selected===records.length-1;
    var active=buttons[selected];
    rail.scrollTo({left:Math.max(0,active.offsetLeft-(rail.clientWidth-active.offsetWidth)/2),behavior:'instant'});
    if (manual) {
      status.textContent=record.year+'年，'+record.title;
      if (pinned) {
        var k=0;
        while (k<keys.length-2 && record.year>keys[k+1]) k++;
        var part=(record.year-keys[k])/(keys[k+1]-keys[k]);
        var target=start+((k+part)/(keys.length-1))*travel;
        manualYear=record.year;
        manualY=Math.round(target);
        window.scrollTo({top:target,behavior:'instant'});
      }
    }
    // Preload only the nearest photographs; the rest stay deferred.
    [selected-1,selected+1].forEach(function (i) { if (records[i]) { var im=new Image(); im.src=records[i].image; } });
  }
  function update() {
    frame=0;
    var y=window.scrollY, direction=y>=lastY?1:-1;
    lastY=y;
    if (!pinned || travel<=0) return;
    var progress=Math.max(0,Math.min(1,(y-start)/travel));
    var year=keys[Math.round(progress*(keys.length-1))];
    if (manualYear!==null) {
      if (Math.abs(y-manualY)<32) return;
      if ((direction>0 && year<manualYear) || (direction<0 && year>manualYear)) return;
      manualYear=null;
    }
    select(records.findIndex(function (record) { return record.year===year; }),false);
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(update); }
  function measure() {
    var zoom=scene.getBoundingClientRect().width/scene.offsetWidth || 1;
    var headerHeight=header?header.getBoundingClientRect().height:0;
    var available=window.innerHeight-headerHeight;
    pinned=desktop.matches && !reduced.matches;
    root.classList.toggle('pj-pinned',pinned);
    root.style.setProperty('--pj-top',(headerHeight/zoom)+'px');
    root.style.setProperty('--pj-height',(available/zoom)+'px');
    var unit=Math.min(scene.offsetWidth/1920,available/zoom/990);
    root.style.setProperty('--pj-u',unit+'px');
    root.style.minHeight=pinned?((available+window.innerHeight*2)/zoom)+'px':'';
    start=window.scrollY+root.getBoundingClientRect().top-headerHeight;
    travel=pinned?root.getBoundingClientRect().height-scene.getBoundingClientRect().height:0;
    select(selected,false);
    firstMeasure=false;
    schedule();
  }
  buttons.forEach(function (button,i) { button.addEventListener('click',function () { select(i,true); }); });
  nodes.forEach(function (button,i) { button.addEventListener('click',function () { select(i,true); }); });
  prev.addEventListener('click',function () { select(selected-1,true); });
  next.addEventListener('click',function () { select(selected+1,true); });
  root.addEventListener('keydown',function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    var index=selected;
    if (event.key==='ArrowLeft') index--;
    else if (event.key==='ArrowRight') index++;
    else if (event.key==='Home') index=0;
    else if (event.key==='End') index=records.length-1;
    else return;
    event.preventDefault();
    select(index,true);
  });
  var touch=null;
  figure.addEventListener('touchstart',function (event) {
    if (event.touches.length===1) touch={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  figure.addEventListener('touchend',function (event) {
    if (!touch || !event.changedTouches.length) return;
    var dx=event.changedTouches[0].clientX-touch.x, dy=event.changedTouches[0].clientY-touch.y;
    touch=null;
    if (Math.abs(dx)>55 && Math.abs(dx)>Math.abs(dy)*1.4) select(selected+(dx<0?1:-1),true);
  },{passive:true});
  figure.addEventListener('touchcancel',function () { touch=null; },{passive:true});
  root.classList.add('pj-ready');
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',measure,{passive:true});
  window.addEventListener('load',measure,{once:true});
  reduced.addEventListener('change',measure);
  if ('ResizeObserver' in window && header) new ResizeObserver(measure).observe(header);
  measure();
})();
