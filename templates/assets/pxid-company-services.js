/* The company service carousel has one motion owner per breakpoint.
   Mobile uses native horizontal scrolling, never a scroll-scrubbed stack. */
(function () {
  'use strict';

  window.pxidInitCompanyServices = function (section, gsap, Swiper, viewport) {
    var rail = section.querySelector('.r4Sw');
    if (!rail || rail.dataset.servicesReady) return;
    rail.dataset.servicesReady = 'true';
    var slides = Array.from(rail.querySelectorAll('.swiper-slide'));
    var background = section.querySelector('.photo');
    var previous = section.querySelector('.r4Prev');
    var next = section.querySelector('.r4Next');
    var counter = section.querySelector('#r4Sum');
    var index = 0;
    var modes = gsap.matchMedia();

    counter.setAttribute('aria-live', 'polite');
    previous.setAttribute('role', 'button');
    next.setAttribute('role', 'button');
    previous.setAttribute('aria-label', '上一项服务');
    next.setAttribute('aria-label', '下一项服务');
    previous.tabIndex = next.tabIndex = 0;
    rail.setAttribute('aria-label', 'ODM 服务范围');
    rail.setAttribute('aria-roledescription', '轮播');
    rail.setAttribute('role', 'region');

    function updateCounter(value) {
      index = Math.max(0, Math.min(slides.length - 1, value));
      counter.textContent = String(index + 1).padStart(2, '0');
    }

    modes.add({
      mobile: '(max-width: 900px)',
      desktop: '(min-width: 901px)',
      reduced: '(prefers-reduced-motion: reduce)'
    }, function (context) {
      var nativeMode = context.conditions.mobile || context.conditions.reduced;
      section.classList.toggle('pxid-services-native', nativeMode);

      if (nativeMode) {
        // This attribute bypasses Lenis; it does NOT prevent browser scrolling.
        section.setAttribute('data-lenis-prevent', '');
        var nestedScrollers = Array.from(rail.querySelectorAll('[data-lenis-prevent]'));
        nestedScrollers.forEach(function (element) { element.removeAttribute('data-lenis-prevent'); });
        background.classList.add('showImg');
        rail.tabIndex = 0;
        var pendingIndex = null;
        var settleTimer;
        var resizeFrame;

        function updateControls() {
          previous.classList.toggle('swiper-button-disabled', index === 0);
          next.classList.toggle('swiper-button-disabled', index === slides.length - 1);
          previous.setAttribute('aria-disabled', String(index === 0));
          next.setAttribute('aria-disabled', String(index === slides.length - 1));
        }

        function goTo(value, instant) {
          pendingIndex = Math.max(0, Math.min(slides.length - 1, value));
          updateCounter(pendingIndex);
          updateControls();
          rail.scrollTo({
            left: pendingIndex * rail.clientWidth,
            behavior: instant || context.conditions.reduced ? 'instant' : 'smooth'
          });
        }

        function onScroll() {
          if (rail.clientWidth) updateCounter(Math.round(rail.scrollLeft / rail.clientWidth));
          updateControls();
          clearTimeout(settleTimer);
          settleTimer = setTimeout(function () { pendingIndex = null; }, 160);
        }

        function onPrevious() { goTo((pendingIndex === null ? index : pendingIndex) - 1); }
        function onNext() { goTo((pendingIndex === null ? index : pendingIndex) + 1); }
        function onKey(event) {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            (event.key === 'ArrowLeft' ? onPrevious : onNext)();
          } else if ((event.key === 'Enter' || event.key === ' ') &&
              (event.target === previous || event.target === next)) {
            event.preventDefault();
            (event.target === previous ? onPrevious : onNext)();
          }
        }
        function onResize() {
          cancelAnimationFrame(resizeFrame);
          resizeFrame = requestAnimationFrame(function () { goTo(index, true); });
        }

        // Only the rail's horizontal scroll is observed. No wheel/touchmove or
        // page-scroll handler can hide or reposition the section.
        previous.addEventListener('click', onPrevious);
        next.addEventListener('click', onNext);
        section.addEventListener('keydown', onKey);
        rail.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        goTo(index, true);

        return function () {
          clearTimeout(settleTimer);
          cancelAnimationFrame(resizeFrame);
          previous.removeEventListener('click', onPrevious);
          next.removeEventListener('click', onNext);
          section.removeEventListener('keydown', onKey);
          rail.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onResize);
          rail.scrollTo({ left: 0, behavior: 'instant' });
          rail.removeAttribute('tabindex');
          section.removeAttribute('data-lenis-prevent');
          section.classList.remove('pxid-services-native');
          nestedScrollers.forEach(function (element) { element.setAttribute('data-lenis-prevent', ''); });
        };
      }

      // Desktop retains the existing stacked presentation. MatchMedia reverts
      // these timelines and their ScrollTriggers BEFORE entering native mode.
      var offsets = viewport.shu ? [30, 20, window.innerWidth * .5] : [150, 80, window.innerHeight * .4];
      gsap.timeline({ scrollTrigger: {
        trigger: section, start: 'top-=' + window.innerHeight,
        end: '+=' + window.innerHeight, scrub: .9
      } }).fromTo(section.querySelector('.inner'), { y: 0 }, { y: offsets[2], ease: 'none' });
      rail.querySelectorAll('.part').forEach(function (part, position) {
        gsap.timeline({ scrollTrigger: {
          trigger: rail, start: 'top-=' + window.innerHeight,
          end: '+=' + window.innerHeight, scrub: .9
        } }).fromTo(part, { x: 20 + offsets[0] * position, y: 30 + offsets[1] * position }, { x: 0, y: 0, ease: 'none' });
      });
      var backgroundObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          background.classList.toggle('showImg', entry.isIntersecting);
        });
      });
      backgroundObserver.observe(section);
      var carousel = new Swiper(rail, {
        initialSlide: index, slidesPerView: 1, speed: 800,
        allowTouchMove: viewport.shu, centeredSlides: true, effect: 'creative',
        creativeEffect: {
          limitProgress: 2,
          prev: { translate: ['0%', '3%', 0], scale: 1.1, opacity: 0 },
          next: { translate: ['0%', '-3%', 0], scale: .97, opacity: .95 }
        },
        on: { slideChangeTransitionStart: function () { updateCounter(this.realIndex); } },
        navigation: { nextEl: next, prevEl: previous }
      });
      return function () {
        index = carousel.realIndex;
        carousel.destroy(true, true);
        backgroundObserver.disconnect();
      };
    });
  };
}());
