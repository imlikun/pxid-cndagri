/* Homepage only: keep offscreen manufacturing media out of the rendering workload. */
(function () {
  var video = document.querySelector('.home .r4 .videoBox video');
  if (!video || !window.IntersectionObserver) return;
  var button = document.querySelector('.home .r4 .pxid-video-toggle');
  var visible = false;
  var userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    new URLSearchParams(location.search).get('motion') === 'reduce' ||
    !!(navigator.connection && navigator.connection.saveData);
  var mobile = window.matchMedia('(max-width: 900px)');
  function sync() {
    if (!visible || document.hidden || mobile.matches || userPaused) { video.pause(); return; }
    var playing = video.play();
    if (playing && playing.catch) playing.catch(function () {});
  }
  if (button) button.addEventListener('click', function () {
    userPaused = !video.paused;
  }, true);
  new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    sync();
  }, { threshold:0 }).observe(video.closest('.videoBox'));
  document.addEventListener('visibilitychange', sync);
  if (mobile.addEventListener) mobile.addEventListener('change', sync);
  video.addEventListener('play', function () {
    if (!visible || document.hidden || mobile.matches) video.pause();
  });
  window.addEventListener('pagehide', function () {video.pause();});
  window.addEventListener('pageshow', sync);
})();