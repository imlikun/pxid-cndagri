/* Background media only: the existing r6 carousel still owns slides and copy. */
(function () {
  'use strict';
  var section = document.querySelector('.home .pxid-cooperation');
  if (!section) return;
  var button = section.querySelector('.cooperation-video-toggle');
  var states = Array.prototype.map.call(section.querySelectorAll('.r6Pic'), function (picture) {
    return {picture: picture, frame: picture.querySelector('.pic'), video: picture.querySelector('video'),
      source: '', requested: false, blocked: false, failed: false, token: 0, frameRequest: null};
  });
  if (!button || states.some(function (state) { return !state.video; })) return;

  var portrait = window.matchMedia('(max-width: 900px) and (orientation: portrait)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var forcedReduced = new URLSearchParams(window.location.search).get('motion') === 'reduce';
  var connection = navigator.connection;
  var visible = false;
  var suspended = false;
  var userPaused = false;
  var manualPlayback = false;
  var active = null;

  function currentState() {
    // During the 1.3-second desktop wipe, .on still belongs to the old slide.
    return states.find(function (state) { return state.picture.classList.contains('in'); }) ||
      states.find(function (state) { return state.picture.classList.contains('on'); }) || states[0];
  }
  function allowsPlayback() {
    return !userPaused && (manualPlayback || (!forcedReduced && !reduced.matches && !(connection && connection.saveData)));
  }
  function wantsPlayback(state) {
    return state === active && visible && !document.hidden && !suspended && allowsPlayback() && !state.blocked && !state.failed;
  }
  function cancelFrame(state) {
    if (state.frameRequest !== null && state.video.cancelVideoFrameCallback) {
      state.video.cancelVideoFrameCallback(state.frameRequest);
    }
    state.frameRequest = null;
  }
  function stop(state) {
    state.token += 1;
    state.requested = false;
    cancelFrame(state);
    state.video.pause();
  }
  function updateButton() {
    var running = active && wantsPlayback(active);
    var label = running ? '暂停背景视频' : (active && active.failed ? '重试背景视频' : '播放背景视频');
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    button.setAttribute('data-playing', running ? 'true' : 'false');
  }
  function setPoster(state) {
    var video = state.video;
    var poster = video.getAttribute(portrait.matches ? 'data-poster-mobile' : 'data-poster-desktop');
    video.poster = poster;
    state.frame.style.backgroundImage = 'url("' + poster + '")';
    state.frame.setAttribute('data-src', poster);
  }
  function revealFrame(state) {
    if (!wantsPlayback(state) || state.video.paused || state.video.readyState < 2) return;
    if (state.video.requestVideoFrameCallback) {
      if (state.frameRequest !== null) return;
      var token = state.token;
      state.frameRequest = state.video.requestVideoFrameCallback(function () {
        state.frameRequest = null;
        if (token === state.token && wantsPlayback(state) && !state.video.paused) {
          state.frame.classList.add('is-video-ready');
        }
      });
    } else {
      // playing + HAVE_CURRENT_DATA is the fallback for older Safari.
      state.frame.classList.add('is-video-ready');
    }
  }
  function fail(state, token) {
    if (token !== state.token) return;
    stop(state);
    state.blocked = true;
    state.frame.classList.remove('is-video-ready');
    updateButton();
  }
  function start(state) {
    if (!wantsPlayback(state) || state.requested) return;
    var video = state.video;
    var source = video.getAttribute(portrait.matches ? 'data-video-mobile' : 'data-video-desktop');
    if (state.source !== source) {
      state.frame.classList.remove('is-video-ready');
      state.source = source;
      video.src = source;
      video.load();
    }
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    state.requested = true;
    var token = ++state.token;
    try {
      var attempt = video.play();
      if (attempt && attempt.then) {
        attempt.then(function () {
          if (token !== state.token) {
            if (!wantsPlayback(state)) video.pause();
            return;
          }
          if (!wantsPlayback(state)) { stop(state); return; }
          revealFrame(state);
        }).catch(function () { fail(state, token); });
      }
    } catch (error) { fail(state, token); }
  }
  function sync() {
    var next = currentState();
    if (next !== active) {
      active = next;
      // Re-enter each story at its opening shot. Do not blank the outgoing frame.
      if (active.source && active.video.readyState > 0) {
        active.frame.classList.remove('is-video-ready');
        try { active.video.currentTime = 0; } catch (error) { /* Keep the poster until ready. */ }
      }
    }
    states.forEach(function (state) {
      if (wantsPlayback(state)) start(state);
      else if (state.requested || !state.video.paused) stop(state);
    });
    updateButton();
  }
  function refreshViewport() {
    var rect = section.getBoundingClientRect();
    visible = rect.bottom > 0 && rect.top < window.innerHeight;
    sync();
  }
  function preferenceChanged() {
    manualPlayback = false;
    states.forEach(function (state) {
      stop(state);
      state.frame.classList.remove('is-video-ready');
    });
    sync();
  }
  function formatChanged() {
    states.forEach(function (state) {
      stop(state);
      state.frame.classList.remove('is-video-ready');
      state.source = '';
      state.blocked = false;
      state.failed = false;
      state.video.removeAttribute('src');
      state.video.load();
      setPoster(state);
    });
    sync();
  }
  function listen(query, callback) {
    if (query.addEventListener) query.addEventListener('change', callback);
    else if (query.addListener) query.addListener(callback);
  }

  states.forEach(function (state) {
    setPoster(state);
    state.video.addEventListener('playing', function () {
      if (!wantsPlayback(state)) { stop(state); return; }
      revealFrame(state);
    });
    state.video.addEventListener('timeupdate', function () {
      if (!state.frame.classList.contains('is-video-ready')) revealFrame(state);
    });
    state.video.addEventListener('error', function () {
      // An empty source after a viewport change is not a failed video.
      if (!state.source) return;
      state.failed = true;
      stop(state);
      state.frame.classList.remove('is-video-ready');
      updateButton();
    });
    state.video.addEventListener('pause', function () {
      // A browser can suspend media itself (for example in low-power mode).
      if (state.requested && wantsPlayback(state)) {
        state.requested = false;
        state.blocked = true;
        updateButton();
      }
    });
  });
  button.addEventListener('click', function () {
    if (active && wantsPlayback(active)) {
      userPaused = true;
      manualPlayback = false;
    } else {
      userPaused = false;
      manualPlayback = true;
      states.forEach(function (state) {
        state.blocked = false;
        if (state.failed) { state.source = ''; state.failed = false; }
      });
    }
    refreshViewport();
  });
  button.hidden = false;
  var changes = new MutationObserver(sync);
  states.forEach(function (state) { changes.observe(state.picture, {attributes: true, attributeFilter: ['class']}); });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }, {threshold: 0});
    observer.observe(section);
  } else {
    window.addEventListener('scroll', refreshViewport, {passive: true});
    window.addEventListener('resize', refreshViewport, {passive: true});
  }
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', function () { suspended = true; sync(); });
  window.addEventListener('pageshow', function () { suspended = false; refreshViewport(); });
  listen(portrait, formatChanged);
  listen(reduced, preferenceChanged);
  if (connection && connection.addEventListener) connection.addEventListener('change', preferenceChanged);
  refreshViewport();
})();
