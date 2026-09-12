(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The legacy header script writes inline !important display values after load.
     Keep the 1100px breakpoint authoritative so tablet navigation cannot clip. */
  function syncHeaderBreakpoint() {
    var compact = window.innerWidth <= 1100;
    var desktopNav = document.querySelector('.wb-main-nav');
    var menuToggle = document.querySelector('.wb-menu-toggle');
    var headerCta = document.querySelector('.wb-header-cta');
    if (desktopNav) desktopNav.style.setProperty('display', compact ? 'none' : 'flex', 'important');
    if (menuToggle) menuToggle.style.setProperty('display', compact ? 'flex' : 'none', 'important');
    if (headerCta) headerCta.style.setProperty('display', compact ? 'none' : 'inline-flex', 'important');
  }
  syncHeaderBreakpoint();
  window.addEventListener('load', syncHeaderBreakpoint);
  window.addEventListener('resize', syncHeaderBreakpoint);

  /*
   * The legacy bundle creates its smooth-scroll instance before the homepage
   * media and the V2 sections have settled. On this offline homepage that
   * instance can keep cancelling wheel input while its target remains at 0,
   * so mouse-wheel and PageDown never leave the hero. Once the loader is gone,
   * hand scrolling back to the browser. Native scrolling is the dependable
   * baseline here; the homepage's GSAP/scroll-driven visual effects still read
   * window.scrollY and continue to work.
   */
  function restoreNativePageScroll() {
    var root = document.documentElement;
    var body = document.body;
    var loading = document.querySelector('#loading');
    if (loading && window.getComputedStyle(loading).display !== 'none') return false;

    root.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
    body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
    root.style.removeProperty('scroll-behavior');
    body.style.removeProperty('scroll-behavior');
    root.style.overflowY = 'auto';
    body.style.overflowY = 'visible';
    window.dispatchEvent(new Event('resize'));
    return true;
  }

  function scheduleNativeScrollRestore() {
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (restoreNativePageScroll() || attempts >= 30) window.clearInterval(timer);
    }, 150);
  }

  if (document.readyState === 'complete') scheduleNativeScrollRestore();
  else window.addEventListener('load', scheduleNativeScrollRestore, { once: true });

  /* Distinct, reversible entrances for the V2 homepage sections. Content stays
     visible unless this script and IntersectionObserver are both available. */
  if (!reducedMotion && 'IntersectionObserver' in window) {
    var motionTargets = [
      ['.v2-cases .v2-section-head', 'v2-motion-head'],
      ['.v2-case-stage', 'v2-motion-case'],
      ['.v2-evidence .v2-section-head', 'v2-motion-head'],
      ['.v2-evidence-grid', 'v2-motion-evidence'],
      ['.v2-process .v2-section-head', 'v2-motion-head'],
      ['.v2-process-stage', 'v2-motion-process'],
      ['.v2-industry-layout', 'v2-motion-industries'],
      ['.v2-faq-main', 'v2-motion-faq'],
      ['.v2-final-inner', 'v2-motion-final']
    ];
    var motionElements = [];
    motionTargets.forEach(function (entry) {
      document.querySelectorAll(entry[0]).forEach(function (element) {
        element.classList.add(entry[1]);
        motionElements.push(element);
      });
    });
    document.documentElement.classList.add('v2-motion-ready');
    var motionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-in', entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    motionElements.forEach(function (element) { motionObserver.observe(element); });
  }

  var cases = [
    {
      key: 'T2',
      title: '从产品定义到完整交通工具设计',
      description: '以整车比例、结构关系与关键使用细节为核心，展示一个出行产品如何从设计语言推进到可被工程讨论的完整方案。',
      meta: '产品设计 · 结构细节 · 视觉表达',
      image: 'assets/home-v2/case-t2-main.jpg'
    },
    {
      key: 'P2',
      title: '折叠结构与整车形态协同设计',
      description: '围绕折叠出行场景，在整车辨识度、结构节点与零部件关系之间建立统一的产品表达。',
      meta: '折叠车设计 · 结构节点 · 零部件关系',
      image: 'assets/home-v2/case-p2-main.jpg'
    },
    {
      key: 'OFF ROAD',
      title: '双驱越野滑板车产品设计',
      description: '通过整车姿态、粗壮结构与关键零件细节，建立面向运动户外场景的产品形象与工程沟通基础。',
      meta: '运动出行 · 整车设计 · 关键细节',
      image: 'assets/home-v2/case-offroad-main.jpg'
    }
  ];

  var caseStage = document.querySelector('.v2-case-stage');
  var caseImage = document.querySelector('.v2-case-main');
  var caseName = document.querySelector('.v2-case-name');
  var caseTitle = document.querySelector('.v2-case-copy h3');
  var caseDescription = document.querySelector('.v2-case-copy p');
  var caseMeta = document.querySelector('.v2-case-meta');
  var caseCount = document.querySelector('.v2-case-count');
  var caseTabs = Array.prototype.slice.call(document.querySelectorAll('.v2-case-tab'));
  var caseIndex = 0;

  function setCase(nextIndex, focusTab) {
    if (!caseStage || nextIndex === caseIndex || !cases[nextIndex]) return;
    caseIndex = nextIndex;
    caseStage.dataset.changing = 'true';
    var delay = reducedMotion ? 0 : 220;
    window.setTimeout(function () {
      var item = cases[caseIndex];
      caseImage.removeAttribute('srcset');
      caseImage.removeAttribute('sizes');
      caseImage.src = item.image;
      caseImage.alt = item.title;
      caseName.textContent = item.key;
      caseTitle.textContent = item.title;
      caseDescription.textContent = item.description;
      caseMeta.textContent = item.meta;
      caseCount.textContent = String(caseIndex + 1).padStart(2, '0') + ' / 03';
      caseTabs.forEach(function (tab, index) {
        tab.setAttribute('aria-selected', index === caseIndex ? 'true' : 'false');
        tab.tabIndex = index === caseIndex ? 0 : -1;
      });
      caseStage.dataset.changing = 'false';
      if (focusTab) caseTabs[caseIndex].focus();
    }, delay);
  }

  caseTabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { setCase(index, false); });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var direction = event.key === 'ArrowRight' ? 1 : -1;
      setCase((caseIndex + direction + cases.length) % cases.length, true);
    });
  });

  var evidenceItems = [
    { image: 'upfiles/pxid/svc-01.webp', alt: 'PXID 制造设备与生产现场' },
    { image: 'upfiles/pxid/svc-03.jpg', alt: 'PXID 产品制造过程' },
    { image: 'upfiles/pxid/ipqc-check.jpg', alt: 'PXID 过程质量检查' },
    { image: 'upfiles/pxid/report-archive.jpg', alt: 'PXID 质量报告归档' }
  ];
  var evidenceSticky = document.querySelector('.v2-evidence-sticky');
  var evidenceImage = document.querySelector('.v2-evidence-image');
  var evidenceProgress = document.querySelector('.v2-evidence-progress-bar span');
  var evidenceCounter = document.querySelector('.v2-evidence-progress strong');
  var evidenceSteps = Array.prototype.slice.call(document.querySelectorAll('.v2-evidence-step'));
  var evidenceIndex = 0;

  function setEvidence(index) {
    if (!evidenceItems[index] || index === evidenceIndex) return;
    evidenceIndex = index;
    evidenceSticky.dataset.changing = 'true';
    window.setTimeout(function () {
      evidenceImage.src = evidenceItems[index].image;
      evidenceImage.alt = evidenceItems[index].alt;
      evidenceProgress.style.transform = 'scaleX(' + (index + 1) + ')';
      evidenceCounter.textContent = String(index + 1).padStart(2, '0') + ' / 04';
      evidenceSteps.forEach(function (step, stepIndex) {
        step.classList.toggle('is-active', stepIndex === index);
      });
      evidenceSticky.dataset.changing = 'false';
    }, reducedMotion ? 0 : 180);
  }

  if (evidenceSteps.length) {
    var evidenceTicking = false;
    function updateEvidenceFromScroll() {
      evidenceTicking = false;
      if (window.innerWidth <= 1100) return;
      var targetLine = window.innerHeight * 0.54;
      var bestIndex = 0;
      var bestDistance = Infinity;
      evidenceSteps.forEach(function (step, index) {
        var rect = step.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var distance = Math.abs(center - targetLine);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      setEvidence(bestIndex);
    }
    function requestEvidenceUpdate() {
      if (evidenceTicking) return;
      evidenceTicking = true;
      window.requestAnimationFrame(updateEvidenceFromScroll);
    }
    window.addEventListener('scroll', requestEvidenceUpdate, { passive: true });
    window.addEventListener('resize', requestEvidenceUpdate);
    requestEvidenceUpdate();
  }

  var processItems = [
    { title: '提交资料', description: '提供想法、草图、样品或 3D 图纸，让工程团队首先看见真实需求与约束。', output: '本阶段交付：项目需求清单', image: 'upfiles/pxid/process-01.webp' },
    { title: '需求评估', description: '围绕结构、材料、工艺和目标数量进行可行性判断，提前识别风险点。', output: '本阶段交付：可行性与风险反馈', image: 'upfiles/pxid/process-02.webp' },
    { title: '方案报价', description: '明确工艺路径、开发周期与阶段安排，让成本和时间在启动前可被讨论。', output: '本阶段交付：报价与阶段计划', image: 'upfiles/pxid/process-03.webp' },
    { title: '设计开发', description: '按阶段推进产品设计、工程样机、模具与试产，并在关键节点确认后继续。', output: '本阶段交付：设计文件与样件', image: 'upfiles/pxid/process-04.webp' },
    { title: '量产交付', description: '完成生产、过程管控、装配测试与出货资料整理，形成可追溯的交付闭环。', output: '本阶段交付：产品与质量资料', image: 'upfiles/pxid/process-09.webp' }
  ];
  var processStage = document.querySelector('.v2-process-stage');
  var processImage = document.querySelector('.v2-process-image');
  var processIndexText = document.querySelector('.v2-process-index');
  var processTitle = document.querySelector('.v2-process-copy h3');
  var processDescription = document.querySelector('.v2-process-copy p');
  var processOutput = document.querySelector('.v2-process-output');
  var processTabs = Array.prototype.slice.call(document.querySelectorAll('.v2-process-tab'));
  var processIndex = 0;

  function setProcess(index, focusTab) {
    if (!processItems[index] || index === processIndex) return;
    processIndex = index;
    processStage.dataset.changing = 'true';
    window.setTimeout(function () {
      var item = processItems[index];
      processImage.src = item.image;
      processImage.alt = item.title;
      processIndexText.textContent = String(index + 1).padStart(2, '0');
      processTitle.textContent = item.title;
      processDescription.textContent = item.description;
      processOutput.textContent = item.output;
      processTabs.forEach(function (tab, tabIndex) {
        tab.setAttribute('aria-selected', tabIndex === index ? 'true' : 'false');
        tab.tabIndex = tabIndex === index ? 0 : -1;
      });
      processStage.dataset.changing = 'false';
      if (focusTab) processTabs[index].focus();
    }, reducedMotion ? 0 : 180);
  }

  processTabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { setProcess(index, false); });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      var direction = event.key === 'ArrowRight' ? 1 : -1;
      setProcess((processIndex + direction + processItems.length) % processItems.length, true);
    });
  });

  var industryTabs = Array.prototype.slice.call(document.querySelectorAll('.v2-industry-tab'));
  var industryBackgrounds = Array.prototype.slice.call(document.querySelectorAll('.v2-industry-bg'));
  industryTabs.forEach(function (tab, index) {
    function activate() {
      industryTabs.forEach(function (item, itemIndex) {
        item.setAttribute('aria-selected', itemIndex === index ? 'true' : 'false');
      });
      industryBackgrounds.forEach(function (image, imageIndex) {
        image.classList.toggle('is-active', imageIndex === index);
      });
    }
    tab.addEventListener('mouseenter', activate);
    tab.addEventListener('focus', activate);
    tab.addEventListener('click', activate);
  });
})();
