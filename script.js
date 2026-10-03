(() => {
  'use strict';

  const root   = document.documentElement;
  const video  = document.querySelector('.hero__video');
  const toggle = document.querySelector('[data-video-toggle]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  /* 1 — start the entrance once web fonts are in, so text never jumps ---- */
  const reveal = () => root.classList.add('is-ready');
  if (document.fonts && document.fonts.ready) {
    Promise.race([
      document.fonts.ready,
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]).then(reveal);
  } else {
    reveal();
  }

  if (!video) return;

  /* 2 — background video ------------------------------------------------- */
  let userPaused = false;

  const syncToggle = () => {
    if (!toggle) return;
    const paused = video.paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
  };

  const play = () => {
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => { /* autoplay refused: the poster frame stays visible */ });
    }
  };

  video.muted = true;               // some browsers ignore the attribute alone
  video.setAttribute('playsinline', '');

  const shouldStayStill = () => reduceMotion.matches || saveData;

  if (shouldStayStill()) {
    video.removeAttribute('autoplay');
    video.pause();
    userPaused = true;
  } else {
    play();
  }

  video.addEventListener('play',  syncToggle);
  video.addEventListener('pause', syncToggle);
  // If every <source> fails (file missing / unsupported), hide the element and let
  // the poster — also set as the card's CSS background — carry the frame.
  const sources = video.querySelectorAll('source');
  if (sources.length) {
    sources[sources.length - 1].addEventListener('error', () => { video.hidden = true; });
  }
  video.addEventListener('error', () => { video.hidden = true; });
  // the error may already have fired before this script ran (fast local files)
  window.addEventListener('load', () => {
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) video.hidden = true;
  });
  syncToggle();

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (video.paused) { userPaused = false; play(); }
      else              { userPaused = true;  video.pause(); }
    });
  }

  reduceMotion.addEventListener('change', () => {
    if (reduceMotion.matches) { userPaused = true; video.pause(); }
  });

  /* 3 — don't burn battery on a video nobody can see (stacked mobile layout,
         hidden tab) ---------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.pause();
      else if (!userPaused && !shouldStayStill()) play();
    }, { threshold: 0.15 }).observe(video);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (!userPaused && !shouldStayStill()) play();
  });
})();

/* — center col size logger — remove after getting the values — */
const logCenterSize = () => {
  const s = Math.min(window.innerWidth / 1448, window.innerHeight / 1086);
  const gap = s * 9;
  const pad = s * 24;
  const totalW = window.innerWidth - (pad * 2) - (gap * 2);
  const centerW = totalW * (2.254 / 4.254);
  const centerH = window.innerHeight - (pad * 2);
  alert(`Center col: ${Math.round(centerW)} × ${Math.round(centerH)}px`);
};
logCenterSize();
window.addEventListener('resize', logCenterSize);