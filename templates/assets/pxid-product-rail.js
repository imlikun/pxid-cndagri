/* Mobile owns one native scroll surface; desktop retains the original Swiper. */
(function () {
  'use strict';
  var rail = document.querySelector('.home .r3Sw');
  if (!rail) return;
  var mobile = window.matchMedia('(max-width: 900px)');
  var lastInstance = null;
  var lastMode = null;

  function syncMode() {
    var swiper = rail.swiper;
    if (!swiper || swiper.destroyed) return;
    var changed = swiper !== lastInstance || mobile.matches !== lastMode;
    lastInstance = swiper;
    lastMode = mobile.matches;
    if (mobile.matches) {
      // Disabling the instance prevents its touch handler from consuming the
      // gesture while CSS deliberately disables its translate-based movement.
      if (swiper.enabled !== false) swiper.disable();
      swiper.allowTouchMove = false;
      swiper.params.allowTouchMove = false;
    } else if (changed || swiper.enabled === false) {
      rail.scrollLeft = 0;
      swiper.allowTouchMove = true;
      swiper.params.allowTouchMove = true;
      if (swiper.enabled === false) swiper.enable();
      swiper.update();
    }
  }

  // The original motion bundle can initialise after the loading animation.
  // Observe that late initialisation instead of relying on a fixed timeout.
  new MutationObserver(syncMode).observe(rail, {attributes: true, attributeFilter: ['class']});
  if (mobile.addEventListener) mobile.addEventListener('change', syncMode);
  else mobile.addListener(syncMode);
  syncMode();

  // A mouse drag in a narrow preview must not open the card on release.
  var startX = null;
  var dragged = false;
  rail.addEventListener('pointerdown', function (event) {
    dragged = false;
    startX = mobile.matches && event.pointerType === 'mouse' && event.button === 0 ? event.clientX : null;
  });
  rail.addEventListener('pointermove', function (event) {
    if (startX !== null && Math.abs(event.clientX - startX) > 8) dragged = true;
  });
  rail.addEventListener('pointercancel', function () { startX = null; dragged = false; });
  rail.addEventListener('click', function (event) {
    if (dragged && mobile.matches) { event.preventDefault(); event.stopImmediatePropagation(); }
    startX = null;
    dragged = false;
  }, true);
})();
