(function(){
  var sec=document.getElementById('pxidS1');
  if(!sec)return;
  var first=sec.querySelector('.bannerPic:first-child');
  var video=first&&first.querySelector('.pxid-first-film-video');
  if(!video)return;
  var cursor=document.createElement('span');
  cursor.className='pxid-first-film-cursor';
  cursor.setAttribute('aria-hidden','true');
  cursor.innerHTML='<span>探索产品</span><span class="arrow">↗</span>';
  sec.appendChild(cursor);
  var active=false;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobile=window.matchMedia('(max-width: 900px)');
  function frameFocus(){
    video.style.objectPosition=mobile.matches?(video.currentTime<2.42?'72% center':video.currentTime<3.9?'55% center':'40% center'):'center center';
  }
  video.addEventListener('timeupdate',frameFocus);
  video.addEventListener('seeked',frameFocus);
  if(mobile.addEventListener)mobile.addEventListener('change',frameFocus);
  function sync(){
    var next=!document.documentElement.classList.contains('pxid-intro-pending')&&(first.classList.contains('on')||first.classList.contains('in'))&&!first.classList.contains('out');
    if(next===active)return;
    active=next;
    sec.classList.toggle('pxid-first-film-on',active);
    cursor.classList.remove('visible');
    if(active&&!reduced.matches){video.currentTime=0;frameFocus();video.play().catch(function(){});}
    else video.pause();
  }
  new MutationObserver(sync).observe(first,{attributes:true,attributeFilter:['class']});
  window.addEventListener('pxid:hero-intro-complete',sync);
  sync();
  sec.addEventListener('pointermove',function(event){
    if(!active||event.pointerType==='touch'||event.target.closest('.pager,.scrEl,.slogan-f')){cursor.classList.remove('visible');return;}
    var bounds=sec.getBoundingClientRect();
    cursor.style.left=(event.clientX-bounds.left)+'px';
    cursor.style.top=(event.clientY-bounds.top)+'px';
    cursor.classList.add('visible');
  });
  sec.addEventListener('pointerleave',function(){cursor.classList.remove('visible');});
  sec.addEventListener('click',function(event){
    if(!active||event.defaultPrevented||event.target.closest('a,button,.pager,.scrEl'))return;
    window.location.href='business.html';
  });
  if(reduced.addEventListener)reduced.addEventListener('change',function(){
    if(reduced.matches)video.pause();
    else if(active)video.play().catch(function(){});
  });
})();
