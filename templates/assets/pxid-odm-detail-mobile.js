(function(){
 'use strict';
 function ready(){
  document.querySelectorAll('#odm-stages .f3-c-row').forEach(function(row){
   var fig=row.querySelector('.f3-c-fig'),details=row.querySelector('.f3-stage-notes'),title=row.querySelector('.f3-c-txt h2');
   if(!fig||!details||!title)return;
   details.id=row.id+'-detail';
   var button=document.createElement('button');button.type='button';button.className='f3-photo-detail';button.textContent='阶段详情';
   button.setAttribute('aria-controls',details.id);button.setAttribute('aria-label','查看'+title.textContent.trim()+'的阶段详情');
   function update(){button.setAttribute('aria-expanded',String(details.open));button.textContent=details.open?'收起详情':'阶段详情';}
   button.addEventListener('click',function(){details.open=!details.open;update();});
   details.addEventListener('toggle',update);fig.after(button);row.classList.add('odm-photo-action-ready');update();
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
