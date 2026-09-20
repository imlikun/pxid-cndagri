(function(){
  var sec=document.getElementById("pxidS1");if(!sec)return;
  var v=sec.querySelector(".pxid-hero-video");if(!v)return;
  var pager=sec.querySelector(".pager");if(!pager)return;
  pager.addEventListener("click",function(e){
    var t=e.target,b=null;
    while(t&&t!==pager){
      if(t.classList&&(t.classList.contains("BannerDot")||t.classList.contains("pxid-hero-video-dot"))){b=t;break;}
      t=t.parentNode;
    }
    if(!b)return;
    var on=b.classList.contains("pxid-hero-video-dot");
    sec.classList.toggle("pxid-hero-video-on",on);
    if(on){if(v.play)v.play().catch(function(){});}
    else{if(v.pause)v.pause();}
  },true);
})();
