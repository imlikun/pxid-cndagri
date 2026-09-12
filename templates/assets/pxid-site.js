(function () {
  'use strict';

  var isFilePreview = window.location.protocol === 'file:';
  var forcedMotionMode = new URLSearchParams(window.location.search).get('motion');
  var prefersReducedMotion = forcedMotionMode === 'reduce' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var deferredMotionSrc = document.body && document.body.getAttribute('data-motion-src');
  var deferredMotionRequested = false;
  if (forcedMotionMode === 'reduce') {
    document.documentElement.classList.add('pxid-reduced-motion');
  }

  function loadDeferredMotion() {
    if (!deferredMotionSrc || deferredMotionRequested || prefersReducedMotion) return;
    deferredMotionRequested = true;
    var script = document.createElement('script');
    script.src = deferredMotionSrc;
    script.async = false;
    script.setAttribute('data-pxid-deferred-motion-loaded', 'true');
    document.body.appendChild(script);
  }

  // file:// 模式下不能依赖模块预加载或远程字体。先把本地懒加载媒体落到真实样式/属性。
  document.querySelectorAll('[data-src]').forEach(function (element) {
    var src = element.getAttribute('data-src');
    if (!src) return;
    var isMobileHero = window.innerWidth <= 900 && element.matches('.home .bannerPic .pic');
    var mobileSrc = element.getAttribute('data-mobile-src');
    var resolvedSrc = isMobileHero && mobileSrc ? mobileSrc : src;
    if (element.tagName === 'IMG') {
      if (!element.getAttribute('src')) element.setAttribute('src', resolvedSrc);
    } else if (!element.style.backgroundImage) {
      element.style.backgroundImage = 'url("' + resolvedSrc.replace(/"/g, '\\"') + '")';
    }
    if (isMobileHero && !element.querySelector('.pxid-mobile-hero-img')) {
      var mobileHeroImage = document.createElement('img');
      mobileHeroImage.className = 'pxid-mobile-hero-img';
      mobileHeroImage.src = resolvedSrc;
      mobileHeroImage.alt = '';
      mobileHeroImage.setAttribute('aria-hidden', 'true');
      element.appendChild(mobileHeroImage);
    }
  });

  var loaderProgressFrame = 0;
  function setLoaderProgress(loader, value) {
    if (!loader) return;
    var progress = Math.max(0, Math.min(100, Math.round(value)));
    var fill = loader.querySelector('.pxid-load-fill');
    var output = loader.querySelector('.pxid-load-value');
    var progressNode = loader.querySelector('.pxid-load-progress');
    if (fill) fill.style.transform = 'scaleX(' + (progress / 100) + ')';
    if (output) output.textContent = String(progress).padStart(2, '0') + '%';
    if (progressNode) progressNode.setAttribute('aria-valuenow', String(progress));
    if (progress === 100) loader.classList.add('is-progress-complete');
  }

  function startLoaderProgress() {
    var loader = document.querySelector('#loading');
    if (!loader || !loader.querySelector('.pxid-load-progress')) return;
    var core = loader.querySelector('.pxid-load-core');
    // 参考动效的手机分支会把 #loadMedia 的父层提前隐藏；在自定义进度启动时恢复该视觉层。
    if (core) {
      core.style.display = 'flex';
      core.style.opacity = '1';
    }
    loader.style.display = 'flex';
    loader.style.opacity = '1';
    if (prefersReducedMotion) {
      setLoaderProgress(loader, 100);
      window.setTimeout(releaseLoader, 120);
      return;
    }
    var startedAt = performance.now();
    var duration = 3050;
    function update(now) {
      if (!loader.isConnected || window.getComputedStyle(loader).display === 'none') return;
      var time = Math.min(1, (now - startedAt) / duration);
      var progress;
      if (time < .82) {
        var firstPhase = time / .82;
        progress = 94 * (1 - Math.pow(1 - firstPhase, 1.65));
      } else {
        progress = 94 + 6 * ((time - .82) / .18);
      }
      setLoaderProgress(loader, progress);
      if (time < 1) {
        loaderProgressFrame = window.requestAnimationFrame(update);
      } else {
        window.setTimeout(releaseLoader, 140);
      }
    }
    setLoaderProgress(loader, 0);
    loaderProgressFrame = window.requestAnimationFrame(update);
  }

  startLoaderProgress();

  function releaseLoader() {
    var loader = document.querySelector('#loading');
    if (!loader) return;
    if (loader.classList.contains('is-releasing')) return;
    loader.classList.add('is-releasing');
    if (loaderProgressFrame) window.cancelAnimationFrame(loaderProgressFrame);
    setLoaderProgress(loader, 100);
    loader.style.opacity = '0';
    loader.style.pointerEvents = 'none';
    window.setTimeout(function () { loader.style.display = 'none'; }, 260);
    var firstPic = document.querySelector('.bannerPic');
    var firstCopy = document.querySelector('.bannerList');
    if (firstPic) firstPic.classList.add('on');
    if (firstCopy && !deferredMotionSrc) {
      firstCopy.style.opacity = '1';
      firstCopy.style.visibility = 'visible';
    }
    if (deferredMotionSrc && !prefersReducedMotion) {
      // The legacy full-screen controller continuously tweened mobile hero copy
      // through near-zero opacity. On touch layouts use the lighter local
      // controller: it keeps one complete reading state on screen, preserves the
      // directional image/copy hand-off, and avoids loading desktop scroll code.
      if (window.matchMedia('(max-width: 900px)').matches) {
        startFallbackMotion();
      } else {
        window.setTimeout(loadDeferredMotion, 220);
      }
    }
    if (prefersReducedMotion) startFallbackMotion();
  }

  function startFallbackMotion() {
    if (document.documentElement.classList.contains('pxid-fallback-motion')) return;
    document.documentElement.classList.add('pxid-fallback-motion');

    document.querySelectorAll('.alanGo, .alanParent, .alanFn').forEach(function (element) {
      element.classList.add('go');
      element.style.opacity = '1';
      element.style.transform = 'none';
      element.style.visibility = 'visible';
    });

    var pictures = Array.prototype.slice.call(document.querySelectorAll('.home .bannerPic'));
    var copies = Array.prototype.slice.call(document.querySelectorAll('.home .bannerList'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.home .BannerDot'));
    var heroIndex = 0;
    function showHero(index) {
      if (!pictures.length) return;
      heroIndex = (index + pictures.length) % pictures.length;
      pictures.forEach(function (item, itemIndex) {
        item.classList.toggle('is-fallback-active', itemIndex === heroIndex);
        item.classList.toggle('on', itemIndex === heroIndex);
      });
      copies.forEach(function (item, itemIndex) {
        item.classList.toggle('is-fallback-active', itemIndex === heroIndex);
      });
      dots.forEach(function (item, itemIndex) {
        item.classList.toggle('on', itemIndex === heroIndex);
      });
    }
    if (pictures.length > 1) {
      showHero(0);
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();
          showHero(index);
        }, true);
      });
      if (!prefersReducedMotion) {
        window.setInterval(function () { showHero(heroIndex + 1); }, 5600);
      }
    }

    var familyCarousel = document.querySelector('.home .r3Sw');
    if (familyCarousel && window.Swiper && !familyCarousel.classList.contains('swiper-initialized')) {
      new window.Swiper(familyCarousel, {
        slidesPerView: window.innerWidth <= 900 ? 'auto' : 3,
        speed: 700,
        spaceBetween: window.innerWidth <= 900 ? 16 : window.innerWidth * .025,
        navigation: { nextEl: '.r3Next', prevEl: '.r3Prev' }
      });
    }

    var servicePictures = Array.prototype.slice.call(document.querySelectorAll('.home .r6Pic'));
    var serviceCopies = Array.prototype.slice.call(document.querySelectorAll('.home .r6List'));
    var serviceSection = document.querySelector('.home .pxid-cooperation');
    var servicePagers = Array.prototype.slice.call(document.querySelectorAll('.home .r6Pager'));
    var serviceIndex = 0;
    function showService(index) {
      if (!servicePictures.length || !serviceCopies.length) return;
      serviceIndex = (index + servicePictures.length) % servicePictures.length;
      servicePictures.forEach(function (item, itemIndex) {
        if (serviceSection) item.classList.remove('out', 'in');
        item.classList.toggle('is-fallback-active', itemIndex === serviceIndex);
        item.classList.toggle('on', itemIndex === serviceIndex);
      });
      serviceCopies.forEach(function (item, itemIndex) {
        item.classList.toggle('is-fallback-active', itemIndex === serviceIndex);
        // The cooperation copies use CSS stagger for title, sentence and CTA.
        if (serviceSection) return;
        item.querySelectorAll('.alan').forEach(function (copy) {
          copy.style.opacity = itemIndex === serviceIndex ? '1' : '0';
          copy.style.transform = 'none';
        });
      });
    }
    if (servicePictures.length > 1 && serviceCopies.length > 1) {
      if (serviceSection && serviceSection.pxidServiceCarousel) {
        serviceSection.pxidServiceCarousel.opt.loop = false;
        serviceSection.pxidServiceCarousel.stop();
      }
      showService(0);
      servicePagers.forEach(function (pager, index) {
        pager.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (serviceIndex !== index) showService(index);
        }, true);
      });
      if (!prefersReducedMotion) {
        window.setInterval(function () {
          if (document.hidden) return;
          if (serviceSection) {
            var bounds = serviceSection.getBoundingClientRect();
            if (serviceSection.dataset.rotationPaused === 'true' || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
          }
          showService(serviceIndex + 1);
        }, 6200);
      }
    }
  }

  function enhanceCooperationEntry() {
    var section = document.querySelector('.home .pxid-cooperation');
    if (!section) return;
    var pictures = Array.prototype.slice.call(section.querySelectorAll('.r6Pic'));
    var copies = Array.prototype.slice.call(section.querySelectorAll('.r6List'));
    var pagers = Array.prototype.slice.call(section.querySelectorAll('.r6Pager'));

    pagers.forEach(function (pager) {
      pager.addEventListener('click', function (event) {
        if (pager.getAttribute('aria-pressed') !== 'true') return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
    });

    function syncState() {
      var moving = pictures.some(function (pic) { return pic.classList.contains('out'); });
      var active = pictures.findIndex(function (pic) { return pic.classList.contains('on'); });
      copies.forEach(function (copy, index) {
        var enabled = !moving && index === active;
        copy.inert = !enabled;
        copy.setAttribute('aria-hidden', String(!enabled));
        copy.querySelectorAll('a').forEach(function (link) {
          link.setAttribute('tabindex', enabled ? '0' : '-1');
        });
      });
      pagers.forEach(function (pager, index) {
        pager.classList.toggle('on', index === active);
        pager.setAttribute('aria-pressed', String(index === active));
      });
    }

    var pointerInside = false;
    function updateRotation() {
      var paused = pointerInside || section.contains(document.activeElement);
      section.dataset.rotationPaused = String(paused);
      var carousel = section.pxidServiceCarousel;
      if (!carousel || document.documentElement.classList.contains('pxid-fallback-motion')) return;
      carousel.stop();
      carousel.opt.loop = !paused && !prefersReducedMotion;
      var bounds = section.getBoundingClientRect();
      if (carousel.opt.loop && !carousel.ani && !document.hidden && bounds.bottom > 0 && bounds.top < window.innerHeight) carousel.loop();
    }
    section.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'touch') return;
      pointerInside = true;
      updateRotation();
    });
    section.addEventListener('pointerleave', function () { pointerInside = false; updateRotation(); });
    section.addEventListener('focusin', updateRotation);
    section.addEventListener('focusout', function () { window.setTimeout(updateRotation, 0); });
    var observer = new MutationObserver(syncState);
    pictures.forEach(function (pic) { observer.observe(pic, {attributes: true, attributeFilter: ['class']}); });
    syncState();
  }
  enhanceCooperationEntry();

  // 原框架正常运行时仍由其完成退场；若 4 秒后加载层仍在，则启用离线兜底动效。
  window.setTimeout(function () {
    var loader = document.querySelector('#loading');
    if (!loader) return;
    var style = window.getComputedStyle(loader);
    var stuck = style.display !== 'none' && Number(style.opacity || 1) > .05;
    if (stuck) {
      releaseLoader();
      if (isFilePreview) startFallbackMotion();
    }
  }, 3800);

  function giveButtonBehavior(element, label) {
    if (!element) return;
    if (label) element.setAttribute('aria-label', label);
    if (element.tagName === 'BUTTON') return;
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    });
  }

  function enhancePageControls() {
    var main = document.querySelector('main');
    if (main) {
      if (!main.id) main.id = 'main-content';
      main.setAttribute('tabindex', '-1');
      if (!document.querySelector('.pxid-skip-link')) {
        var skipLink = document.createElement('a');
        skipLink.className = 'pxid-skip-link';
        skipLink.href = '#' + main.id;
        skipLink.textContent = '跳到主要内容';
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    }

    var pageHeader = document.querySelector('#app > header');
    if (pageHeader) {
      var headerFrame = 0;
      var syncHeaderTone = function () {
        headerFrame = 0;
        pageHeader.classList.toggle('pxid-header-scrolled', window.scrollY > 72);
      };
      window.addEventListener('scroll', function () {
        if (!headerFrame) headerFrame = window.requestAnimationFrame(syncHeaderTone);
      }, { passive: true });
      syncHeaderTone();
    }

    document.querySelectorAll('.layer-search').forEach(function (searchLayer) {
      var searchInput = searchLayer.querySelector('input');
      var searchTrigger = searchLayer.querySelector('.sub');
      if (!searchInput || !searchTrigger) return;
      if (window.innerWidth < 1400) searchInput.setAttribute('placeholder', '搜索');
      searchInput.setAttribute('aria-label', searchInput.getAttribute('placeholder') || '站内搜索');
      giveButtonBehavior(searchTrigger, '搜索');
      searchTrigger.addEventListener('click', function (event) {
        var destination = searchLayer.getAttribute('data-url') || 'search.html';
        var keywords = searchInput.value.trim();
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.href = destination + (keywords ? '?keywords=' + encodeURIComponent(keywords) + '#main' : '');
      }, true);
    });

    var mobileMenu = document.querySelector('.menu');
    var menuButton = document.querySelector('#menu');
    if (mobileMenu) {
      mobileMenu.id = 'pxid-mobile-menu';
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.setAttribute('data-lenis-prevent', '');
      mobileMenu.inert = true;
    }
    if (menuButton && mobileMenu) {
      // Navigation must not depend on the homepage loader or fallback motion.
      document.documentElement.classList.add('pxid-menu-ready');
      giveButtonBehavior(menuButton, '打开导航');
      menuButton.setAttribute('aria-controls', 'pxid-mobile-menu');
      menuButton.setAttribute('aria-expanded', 'false');
      var setMenuState = function (isOpen) {
        document.documentElement.classList.toggle('pxid-menu-open', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        menuButton.classList.toggle('is-opened-navi', isOpen);
        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute('aria-label', isOpen ? '关闭导航' : '打开导航');
        var buttonText = menuButton.querySelector('.txt');
        if (buttonText) buttonText.textContent = isOpen ? '关闭' : 'Menu';
        mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        mobileMenu.inert = !isOpen;
        if (isOpen) window.requestAnimationFrame(function () {
          if (menuButton.getAttribute('aria-expanded') !== 'true') return;
          var firstLink = mobileMenu.querySelector('a[href]');
          if (firstLink) firstLink.focus({preventScroll: true});
        });
      };

      menuButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setMenuState(menuButton.getAttribute('aria-expanded') !== 'true');
      }, true);

      if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', function () { setMenuState(false); });
        });
      }

      document.addEventListener('keydown', function (event) {
        if (menuButton.getAttribute('aria-expanded') !== 'true') return;
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
          event.preventDefault();
          setMenuState(false);
          menuButton.focus({preventScroll: true});
        } else if (event.key === 'Tab') {
          var links = Array.prototype.slice.call(mobileMenu.querySelectorAll('a[href]'));
          var first = links[0];
          var last = links[links.length - 1];
          var active = document.activeElement;
          if (event.shiftKey && (active === first || active === menuButton)) {
            event.preventDefault();
            (active === first ? menuButton : last || menuButton).focus({preventScroll: true});
          } else if (!event.shiftKey && (active === last || active === menuButton)) {
            event.preventDefault();
            (active === last ? menuButton : first || menuButton).focus({preventScroll: true});
          }
        }
      });
    }

    var heroDots = Array.prototype.slice.call(document.querySelectorAll('.home .BannerDot'));
    var syncHeroDots = function () {
      heroDots.forEach(function (dot, index) {
        giveButtonBehavior(dot, '显示第 ' + (index + 1) + ' 个产品');
        if (dot.classList.contains('on')) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    };
    heroDots.forEach(function (dot) {
      new MutationObserver(syncHeroDots).observe(dot, { attributes: true, attributeFilter: ['class'] });
    });
    syncHeroDots();

    [['.r3Prev', '上一个产品'], ['.r3Next', '下一个产品']].forEach(function (definition) {
      var control = document.querySelector(definition[0]);
      if (!control) return;
      giveButtonBehavior(control, definition[1]);
      var syncDisabledState = function () {
        var disabled = control.classList.contains('swiper-button-disabled');
        control.setAttribute('aria-disabled', String(disabled));
        control.tabIndex = disabled ? -1 : 0;
      };
      new MutationObserver(syncDisabledState).observe(control, { attributes: true, attributeFilter: ['class'] });
      syncDisabledState();
    });

    var videoBox = document.querySelector('.home .r4 .videoBox');
    var manufacturingVideo = videoBox && videoBox.querySelector('video');
    if (videoBox && manufacturingVideo && !videoBox.querySelector('.pxid-video-toggle')) {
      var videoToggle = document.createElement('button');
      videoToggle.type = 'button';
      videoToggle.className = 'pxid-video-toggle';
      videoToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="pxid-icon-pause" d="M7 5h3v14H7zM14 5h3v14h-3z"></path><path class="pxid-icon-play" d="M8 5.5 18 12 8 18.5z"></path></svg>';
      var syncVideoState = function () {
        var isPaused = manufacturingVideo.paused;
        videoToggle.classList.toggle('is-paused', isPaused);
        videoToggle.setAttribute('aria-pressed', String(isPaused));
        videoToggle.setAttribute('aria-label', isPaused ? '播放制造视频' : '暂停制造视频');
      };
      videoToggle.addEventListener('click', function () {
        if (manufacturingVideo.paused) manufacturingVideo.play().catch(function () {});
        else manufacturingVideo.pause();
      });
      manufacturingVideo.addEventListener('play', syncVideoState);
      manufacturingVideo.addEventListener('pause', syncVideoState);
      videoBox.appendChild(videoToggle);
      syncVideoState();
    }
  }

  enhancePageControls();

  function enhanceHomepageReadingFlow() {
    if (!document.body.classList.contains('home')) return;

    var flow = [
      { section: '.home .r1', items: ['#r1Txt h2', '#r1Txt > p', '#r1Txt > .layer-btn', '.bg .imgBox'] },
      { section: '.home .r2', items: ['.inner h2'] },
      { section: '.home .r3', items: ['.topic h2', '.topic .set', '.inner > .group'] },
      { section: '.home .r4', items: ['.topic h2', '.topic p', '.topic > .layer-btn'] },
      { section: '.home .r5', items: ['.topic', '.inner > .imgBox'] },
      { section: '.home .pxid-process-section', items: ['.topic', '.pxid-process-rail', '.network-cta'] },
      { section: '.home .r6', items: ['.inner > .group'] }
    ];
    var sections = [];

    flow.forEach(function (definition) {
      var section = document.querySelector(definition.section);
      if (!section) return;
      definition.items.forEach(function (selector, index) {
        var item = section.querySelector(selector);
        if (!item) return;
        item.classList.add('pxid-reading-item');
        item.style.setProperty('--pxid-reading-order', String(index));
      });
      sections.push(section);
    });

    if (!sections.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      sections.forEach(function (section) { section.classList.add('is-reading-active'); });
      return;
    }

    document.documentElement.classList.add('pxid-reading-motion');
    var readingObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-reading-active', entry.isIntersecting);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -14% 0px' });
    sections.forEach(function (section) { readingObserver.observe(section); });
  }

  enhanceHomepageReadingFlow();

  function enhanceNewsReadingFlow() {
    if (!document.body.classList.contains('new')) return;

    var section = document.querySelector('.new main .r1');
    if (!section) return;

    var items = [];
    var heading = section.querySelector('.pxid-section-head');
    var tabs = section.querySelector('.insight-tabs');
    if (heading) items.push(heading);
    if (tabs) items.push(tabs);
    Array.prototype.slice.call(section.querySelectorAll('.insight-card')).forEach(function (card) {
      items.push(card);
    });

    items.forEach(function (item, index) {
      item.classList.add('pxid-news-reading-item');
      item.style.setProperty('--pxid-news-reading-order', String(index));
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-news-reading-active'); });
      return;
    }

    document.documentElement.classList.add('pxid-news-reading-motion');
    var readingObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-news-reading-active', entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (item) { readingObserver.observe(item); });
  }

  function enhanceInsightFilters() {
    if (!document.body.classList.contains('new')) return;

    var root = document.querySelector('.new .insight-grid');
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.new .insight-tabs a'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.new .insight-card'));
    if (!root || !tabs.length || !cards.length) return;

    var filterForLabel = {
      '全部': 'all',
      '企业介绍': '企业介绍',
      '开发流程': '开发流程',
      '产品与奖项': '产品与奖项',
      '制造能力': '制造能力'
    };

    tabs.forEach(function (tab, tabIndex) {
      var label = tab.textContent.trim();
      var filter = filterForLabel[label] || 'all';
      tab.setAttribute('role', 'button');
      tab.setAttribute('aria-pressed', tabIndex === 0 ? 'true' : 'false');
      tab.addEventListener('click', function (event) {
        event.preventDefault();
        tabs.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === tab));
        });
        cards.forEach(function (card) {
          var category = card.querySelector('span');
          var isVisible = filter === 'all' || (category && category.textContent.trim() === filter);
          card.hidden = !isVisible;
          if (isVisible) card.classList.add('is-news-reading-active');
        });
        root.setAttribute('data-active-filter', filter);
      });
    });
  }

  enhanceNewsReadingFlow();
  enhanceInsightFilters();

  function normalizeOfficialProcessCopy() {
    document.querySelectorAll('.navHref, .appNavList span').forEach(function (item) {
      var textNode = item.matches('.navHref') ? item.lastChild : item;
      var label = textNode.textContent.trim();
      if (label === '洞察与资料') textNode.textContent = '新闻与资料';
      if (label === '启动项目') textNode.textContent = '项目咨询';
    });
    document.querySelectorAll('.layer-search input').forEach(function (input) {
      if (window.innerWidth >= 1400) {
        input.setAttribute('placeholder', '搜索产品与资料');
        input.setAttribute('aria-label', '搜索产品与资料');
      }
    });

    function setTitle(selector, text) {
      var title = document.querySelector(selector);
      if (!title) return;
      title.textContent = text;
      title.setAttribute('data-text', text);
    }
    setTitle('.home .r3 .topic h2', '产品系列');
    setTitle('.company .r3 .topic h2', '设计奖项');
    setTitle('.business .r2 .topic h2', 'ODM 服务');

    // Video cover, caption and playback target are paired in company.html.
    // Do not replace captions by slide index: that breaks the content pairing.
    setTitle('.company .r5 .part h2', '项目起点');
    var projectStartCopy = [
      ['仅有产品构想', '可从产品设计开始。'],
      ['已有设计方案或工程样车', '可从结构与电控开发、工程样车或制造环节开始。']
    ];
    document.querySelectorAll('.company .r5 .part .items li').forEach(function (item, index) {
      if (!projectStartCopy[index]) return;
      var title = item.querySelector('h3');
      var description = item.querySelector('p');
      if (title) title.textContent = projectStartCopy[index][0];
      if (description) description.textContent = projectStartCopy[index][1];
    });
    var projectButton = document.querySelector('.company .r5 .part .layer-btn .txt');
    if (projectButton) projectButton.textContent = '提交项目需求';
  }

  normalizeOfficialProcessCopy();

  function enhanceFooter() {
    if (!document.documentElement.classList.contains('chinaLg')) return;
    var footer = document.querySelector('#footer-contact');
    if (!footer) return;

    var isDeepNewsPage = window.location.pathname.indexOf('/cn/news/') !== -1;
    var pagePrefix = isDeepNewsPage ? '../' : '';
    var logoPath = pagePrefix + '../assets/pxid/logo-white.svg';
    var qrPath = pagePrefix + '../assets/pxid/footer/';
    var legacyTopButton = footer.querySelector('.layer-top');

    footer.className = 'wb-footer';
    footer.innerHTML = [
      '<div class="wb-footer-wave" aria-hidden="true">',
        '<svg viewBox="0 0 1440 92" preserveAspectRatio="none" focusable="false">',
          '<path d="M0 54C176 16 315 12 469 38C636 66 770 83 934 55C1097 27 1235 15 1440 46V92H0Z"/>',
        '</svg>',
      '</div>',
      '<div class="wb-footer-inner">',
        '<div class="wb-footer-top">',
          '<a class="wb-footer-logo" href="' + pagePrefix + 'index.html" aria-label="PXID 品向首页">',
            '<img src="' + logoPath + '" alt="PXID 品向">',
          '</a>',
          '<div class="wb-footer-links">',
            '<nav class="wb-footer-col" aria-label="产品方向">',
              '<h3>产品方向</h3>',
              '<a href="' + pagePrefix + 'business.html#ebike">电动自行车</a>',
              '<a href="' + pagePrefix + 'business.html#scooter">电动滑板车</a>',
              '<a href="' + pagePrefix + 'business.html#motorcycle">电动摩托车</a>',
            '</nav>',
            '<nav class="wb-footer-col" aria-label="ODM 服务">',
              '<h3>ODM 服务</h3>',
              '<a href="' + pagePrefix + 'sustainability.html#stage-definition">产品设计</a>',
              '<a href="' + pagePrefix + 'sustainability.html#stage-design">结构与电控系统设计</a>',
              '<a href="' + pagePrefix + 'sustainability.html#stage-engineering">工程样车开发</a>',
              '<a href="' + pagePrefix + 'sustainability.html#stage-delivery">测试与批量生产</a>',
            '</nav>',
            '<nav class="wb-footer-col" aria-label="公司信息">',
              '<h3>公司</h3>',
              '<a href="' + pagePrefix + 'company.html">关于 PXID</a>',
              '<a href="' + pagePrefix + 'news.html">新闻与资料</a>',
              '<a href="' + pagePrefix + 'contact.html">项目咨询</a>',
            '</nav>',
          '</div>',
        '</div>',
        '<div class="wb-footer-mid">',
          '<div class="wb-footer-contact">',
            '<div class="wb-footer-contact-item"><svg class="wb-footer-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><address>江苏省淮安市清江浦区深圳东路18号4号楼</address></div>',
            '<div class="wb-footer-contact-item"><svg class="wb-footer-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 1 2.81.7A2 2 0 0 1 22 16.92z"/></svg><a href="tel:+8618936381099">+86 189 3638 1099</a></div>',
            '<div class="wb-footer-contact-item"><svg class="wb-footer-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg><a href="mailto:inquiry@pxid.com">inquiry@pxid.com</a></div>',
          '</div>',
          '<div class="wb-footer-side">',
            '<div class="wb-footer-share">',
              '<h3>关注 PXID</h3>',
              '<div class="wb-footer-qrs">',
                '<figure class="wb-footer-qr" title="微信"><img src="' + qrPath + 'qr-wechat.svg" alt="PXID 微信二维码" loading="lazy"></figure>',
                '<figure class="wb-footer-qr" title="抖音"><img src="' + qrPath + 'qr-douyin.svg" alt="PXID 抖音二维码" loading="lazy"></figure>',
                '<figure class="wb-footer-qr" title="小红书"><img src="' + qrPath + 'qr-xiaohongshu.svg" alt="PXID 小红书二维码" loading="lazy"></figure>',
                '<figure class="wb-footer-qr" title="视频号"><img src="' + qrPath + 'qr-videochannel.svg" alt="PXID 视频号二维码" loading="lazy"></figure>',
              '</div>',
            '</div>',
            '<div class="wb-footer-subscribe">',
              '<h3>订阅行业资讯</h3>',
              '<form class="wb-footer-subscribe-form">',
                '<label class="sr-only" for="pxid-footer-email">邮箱地址</label>',
                '<input id="pxid-footer-email" name="email" type="email" autocomplete="email" placeholder="Your Email Address_" required>',
                '<button type="submit">订阅 <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>',
              '</form>',
              '<p class="wb-footer-form-status" aria-live="polite"></p>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="wb-footer-bottom">',
          '<p>Copyright © 2026 PXID 品向智造. All rights reserved.</p>',
          '<div>',
            '<a href="' + pagePrefix + 'privacy-policy.html">隐私政策</a>',
            '<span aria-hidden="true">|</span>',
            '<a href="' + pagePrefix + 'legal-notice.html">法律声明</a>',
            '<span aria-hidden="true">|</span>',
            '<span class="wb-footer-top-slot"></span>',
          '</div>',
          '<p>从产品设计到批量生产</p>',
        '</div>',
      '</div>'
    ].join('');

    var topButton = legacyTopButton;
    var topSlot = footer.querySelector('.wb-footer-top-slot');
    if (topButton && topSlot) {
      topButton.className = 'wb-footer-top-link';
      topButton.setAttribute('role', 'button');
      topButton.setAttribute('tabindex', '0');
      topButton.setAttribute('aria-label', '返回顶部');
      topButton.innerHTML = '返回顶部 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
      topSlot.replaceWith(topButton);
    }
    if (topButton) {
      topButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
      topButton.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          topButton.click();
        }
      });
    }

    var subscribeForm = footer.querySelector('.wb-footer-subscribe-form');
    if (subscribeForm) {
      subscribeForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var emailInput = subscribeForm.querySelector('input[type="email"]');
        var formStatus = footer.querySelector('.wb-footer-form-status');
        if (!emailInput || !emailInput.checkValidity()) {
          if (emailInput) emailInput.reportValidity();
          return;
        }
        if (formStatus) formStatus.textContent = '正在打开邮件客户端…';
        window.location.href = 'mailto:inquiry@pxid.com?subject=' + encodeURIComponent('订阅 PXID 行业资讯') + '&body=' + encodeURIComponent('订阅邮箱：' + emailInput.value.trim());
      });
    }

    if (!('IntersectionObserver' in window)) {
      footer.classList.add('is-visible');
    } else {
      var footerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          document.documentElement.classList.toggle('pxid-footer-in-view', entry.isIntersecting);
          if (prefersReducedMotion) {
            footer.classList.add('is-visible');
          } else {
            footer.classList.toggle('is-visible', entry.isIntersecting);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
      footerObserver.observe(footer);
    }
  }

  enhanceFooter();

  var odmIntro = document.querySelector('.pxid-odm-intro');
  if (odmIntro) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      odmIntro.classList.add('is-active');
    } else {
      document.documentElement.classList.add('pxid-r1-motion');
      var odmIntroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle('is-active', entry.isIntersecting);
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
      odmIntroObserver.observe(odmIntro);
    }
  }

  var network = document.querySelector('.pxid-network');
  if (network) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      network.classList.add('is-active');
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
          } else if (entry.boundingClientRect.top > 0 || entry.boundingClientRect.bottom < 0) {
            entry.target.classList.remove('is-active');
          }
        });
      }, { threshold: 0.22, rootMargin: '0px 0px -8% 0px' });
      observer.observe(network);
    }
  }

  var projectForm = document.querySelector('.pxid-project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = projectForm.querySelector('.form-status');
      if (!projectForm.checkValidity()) {
        status.textContent = '请先填写姓名、公司、工作邮箱和联系电话。';
        projectForm.reportValidity();
        return;
      }
      status.textContent = '当前为本地预览版，资料没有发送。正式发布时再连接 PXID 指定的表单接口。';
    });
  }

  document.querySelectorAll('[data-play]').forEach(function (button) {
    button.addEventListener('click', function () {
      var src = button.getAttribute('data-play');
      var pop = document.querySelector('.layer-pop');
      var media = pop && pop.querySelector('.popMedia');
      if (!pop || !media || !src) return;
      media.src = src;
      media.load();
    });
  });

  function enableHomepageHorizontalRails() {
    if (!document.body.classList.contains('home')) return;

    var productRail = document.querySelector('.home .r3Sw');
    var proofRail = document.querySelector('.home .pxid-process-rail');

    if (productRail) {
      productRail.setAttribute('role', 'region');
      productRail.setAttribute('aria-label', '产品系列，可左右滑动');
    }

    function enableProductTouch() {
      if (!productRail || !productRail.swiper) return;
      productRail.swiper.allowTouchMove = true;
      productRail.swiper.params.allowTouchMove = true;
      productRail.swiper.update();
    }

    [0, 800, 2600].forEach(function (delay) {
      window.setTimeout(enableProductTouch, delay);
    });

    function makeRailOperable(rail, label) {
      if (!rail || rail.dataset.pxidRailReady === 'true') return;
      rail.dataset.pxidRailReady = 'true';
      rail.setAttribute('role', 'region');
      rail.setAttribute('aria-label', label);
      rail.setAttribute('tabindex', '0');

      rail.addEventListener('keydown', function (event) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home' || event.key === 'End') {
          rail.scrollTo({left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth'});
          return;
        }
        var step = rail.querySelector('.pxid-process-step');
        var distance = step ? step.getBoundingClientRect().width + 16 : Math.max(220, rail.clientWidth * .72);
        rail.scrollBy({
          left: (event.key === 'ArrowRight' ? 1 : -1) * distance,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });

      var dragging = false;
      var startX = 0;
      var startScrollLeft = 0;
      rail.addEventListener('pointerdown', function (event) {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        dragging = true;
        startX = event.clientX;
        startScrollLeft = rail.scrollLeft;
        rail.classList.add('is-dragging');
        rail.setPointerCapture(event.pointerId);
      });
      rail.addEventListener('pointermove', function (event) {
        if (!dragging) return;
        rail.scrollLeft = startScrollLeft - (event.clientX - startX);
      });
      ['pointerup', 'pointercancel'].forEach(function (eventName) {
        rail.addEventListener(eventName, function (event) {
          if (!dragging) return;
          dragging = false;
          rail.classList.remove('is-dragging');
          if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
        });
      });
    }

    makeRailOperable(proofRail, 'ODM 九步流程，可左右滑动');
    makeRailOperable(productRail, '产品系列，可左右滑动');
  }

  enableHomepageHorizontalRails();
})();
