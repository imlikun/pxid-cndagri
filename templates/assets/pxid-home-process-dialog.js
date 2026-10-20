/* Ten existing homepage process cards, one accessible details dialog. */
(function () {
  'use strict';
  var section = document.getElementById('s7b9');
  if (!section || !window.HTMLDialogElement) return;
  var cards = Array.from(section.querySelectorAll('.pxb-tile:not(.pxb-text)'));
  if (cards.length !== 10) return;
  var steps = [
    {en:'PRODUCT DESIGN',summary:'围绕使用场景与产品定位开展外观设计，将创意转化为可以继续深化的产品方案，兼顾骑行体验、品牌识别与制造可行性。',points:['使用场景与定位','草图与外观方案','三维效果表达'],next:'设计方案确认后，进入结构与电控开发。'},
    {en:'STRUCTURAL DESIGN',summary:'将外观方案转化为整车和零部件的工程结构，统筹材料、连接方式与装配空间，让设计逐步具备加工和装配条件。',points:['整车结构布局','关键部件与连接','材料及工艺选型'],next:'与电控开发协同，形成工程样车的开发基础。'},
    {en:'ELECTRONIC SYSTEMS',summary:'围绕车型需求匹配电池、电机与控制系统，协调布线、安装和交互，检查各系统在整车上的配合方式。',points:['三电系统匹配','线束与安装布局','整车功能协同'],next:'机械与电控方案一起进入工程样车验证。'},
    {en:'ENGINEERING PROTOTYPE',summary:'制作接近量产状态的工程样车，通过实车检查结构、装配和电控配合，发现问题并迭代，为后续制造准备提供依据。',points:['样件制作与装配','整车功能验证','问题检查与迭代'],next:'样车方案稳定后，衔接模具与生产工艺准备。'},
    {en:'TOOLING',summary:'根据零件结构和制造工艺完成模具设计、加工与试模，检查成型质量和装配配合，让工程方案进入可重复制造的阶段。',points:['模具结构设计','模具加工与试模','零件成型确认'],next:'模具与工艺确认后，衔接车架和零部件制造。'},
    {en:'FRAME MANUFACTURING',summary:'按照工程图纸与工艺要求组织车架加工和焊接，检查关键尺寸及连接位置，为涂装与整车装配提供稳定的基础。',points:['车架加工与焊接','工装与尺寸检查','装配接口确认'],next:'车架完成检查后进入表面处理与涂装。'},
    {en:'SURFACE FINISHING',summary:'完成车架和相关部件的表面处理与涂装，检查颜色、涂层和外观一致性，使产品的设计表达落实到实际制造中。',points:['表面处理','颜色与涂层','外观一致性检查'],next:'涂装部件经过质量检查，进入后续整车制造环节。'},
    {en:'QUALITY INSPECTION',summary:'围绕来料、制造过程和成品开展质量检查，记录关键尺寸、外观及功能结果，及时发现并处理影响装配和交付的问题。',points:['来料与过程检查','尺寸及外观检查','成品功能检查'],next:'质量检查结果与试验检测相互反馈，推动问题闭环。'},
    {en:'TESTING & VALIDATION',summary:'根据产品和项目要求开展相关试验，检查部件与整车在使用条件下的表现，将试验结果反馈到设计和制造环节。',points:['部件与整车试验','性能及可靠性验证','问题分析与改进'],next:'完成项目所需验证后，衔接批量装配与交付准备。'},
    {en:'SERIAL ASSEMBLY',summary:'将确认后的设计、物料与工艺落实到装配流程，完成整车组装、功能检查和包装，衔接批量生产与项目交付。',points:['整车装配','成品检查','包装与交付准备'],next:'从设计开发到批量生产，各阶段持续协同。'}
  ];
  var dialog = document.createElement('dialog');
  dialog.id = 'pxidProcessDialog';
  dialog.setAttribute('aria-labelledby','ppd-title');
  dialog.setAttribute('aria-describedby','ppd-summary');
  dialog.innerHTML = '<button class="ppd-close" type="button" aria-label="关闭步骤介绍" autofocus><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button>' +
    '<div class="ppd-panel"><div class="ppd-grid"><nav class="ppd-steps" aria-label="选择 ODM 步骤"></nav>' +
    '<figure><img class="ppd-photo" alt=""><figcaption></figcaption></figure>' +
    '<div class="ppd-copy"><p class="ppd-kicker"></p><h2 id="ppd-title"></h2><p class="ppd-summary" id="ppd-summary"></p><h3>这一阶段关注</h3><ul class="ppd-points"></ul><p class="ppd-next-note"></p></div></div>' +
    '<div class="ppd-footer"><button type="button" class="ppd-control ppd-prev"><span class="ppd-arrow" aria-hidden="true">←</span><span class="ppd-control-label"></span></button><p class="ppd-count" aria-live="polite"></p><button type="button" class="ppd-control ppd-next"><span class="ppd-control-label"></span><span class="ppd-arrow" aria-hidden="true">→</span></button></div></div>';
  document.body.appendChild(dialog);
  var thumbnails = dialog.querySelector('.ppd-steps'),photo = dialog.querySelector('.ppd-photo');
  var previous = dialog.querySelector('.ppd-prev'),next = dialog.querySelector('.ppd-next');
  var current = 0,opener = null;
  cards.forEach(function (card,i) {
    var image = card.querySelector('.pxb-img'),title = card.querySelector('.pxb-t').textContent;
    var match = image.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    steps[i].title = title; steps[i].image = match ? match[1] : '';
    card.setAttribute('aria-haspopup','dialog');
    card.setAttribute('aria-controls',dialog.id);
    card.setAttribute('aria-label','查看第 '+(i+1)+' 步：'+title);
    var hint = document.createElement('span');hint.className='pxb-open';hint.setAttribute('aria-hidden','true');hint.textContent='+';card.appendChild(hint);
    var thumb = document.createElement('button');thumb.type='button';thumb.className='ppd-step';thumb.setAttribute('aria-label',String(i+1).padStart(2,'0')+' '+title);
    var img=document.createElement('img');img.src=steps[i].image;img.alt='';img.loading='lazy';
    var number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');thumb.append(img,number);thumbnails.appendChild(thumb);
    thumb.addEventListener('click',function(){select(i);});
    card.addEventListener('click',function(){opener=card;document.documentElement.classList.add('pxid-process-dialog-open');dialog.showModal();select(i);});
  });
  function select(index) {
    current = index;var step=steps[index],num=String(index+1).padStart(2,'0');
    photo.src=step.image;photo.alt=step.title;
    dialog.querySelector('figcaption').textContent=num+' / '+step.title;
    dialog.querySelector('.ppd-kicker').textContent='ODM '+num+' / '+step.en;
    dialog.querySelector('h2').textContent=step.title;
    dialog.querySelector('.ppd-summary').textContent=step.summary;
    var list=dialog.querySelector('.ppd-points');list.replaceChildren();
    step.points.forEach(function(point){var li=document.createElement('li');li.textContent=point;list.appendChild(li);});
    dialog.querySelector('.ppd-next-note').textContent=step.next;
    dialog.querySelector('.ppd-count').textContent=num+' / 10';
    previous.disabled=index===0;next.disabled=index===steps.length-1;
    previous.querySelector('.ppd-control-label').textContent=index===0?'第一步':steps[index-1].title;
    next.querySelector('.ppd-control-label').textContent=index===steps.length-1?'最后一步':steps[index+1].title;
    Array.from(thumbnails.children).forEach(function(button,i){if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    var thumb=thumbnails.children[index];
    if(thumbnails.scrollWidth>thumbnails.clientWidth){thumbnails.scrollLeft=thumb.offsetLeft-thumbnails.offsetLeft-8;}
    else{thumbnails.scrollTop=thumb.offsetTop-thumbnails.offsetTop-8;}
    dialog.dataset.step=num;
  }
  previous.addEventListener('click',function(){if(current>0)select(current-1);});
  next.addEventListener('click',function(){if(current<steps.length-1)select(current+1);});
  function restorePage(){if(dialog.open)return;document.documentElement.classList.remove('pxid-process-dialog-open');if(opener)opener.focus({preventScroll:true});}
  function closeDialog(){dialog.close();restorePage();}
  dialog.querySelector('.ppd-close').addEventListener('click',closeDialog);
  dialog.addEventListener('click',function(event){if(event.target===dialog)closeDialog();});
  dialog.addEventListener('cancel',function(event){event.preventDefault();closeDialog();});
  dialog.addEventListener('close',restorePage);
  dialog.addEventListener('keydown',function(event){if(event.key==='ArrowLeft'&&current>0){event.preventDefault();select(current-1);}else if(event.key==='ArrowRight'&&current<steps.length-1){event.preventDefault();select(current+1);}});
})();
