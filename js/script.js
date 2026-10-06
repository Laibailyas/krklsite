(() => {
  'use strict';

  const root   = document.documentElement;
  const video  = document.querySelector('.hero__video');
  const toggle = document.querySelector('[data-video-toggle]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  const menuTriggers = document.querySelectorAll('.menu__trigger');
  menuTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const willExpand = trigger.getAttribute('aria-expanded') !== 'true';
      menuTriggers.forEach((item) => {
        const expanded = item === trigger && willExpand;
        item.setAttribute('aria-expanded', String(expanded));
        item.parentElement.classList.toggle('is-expanded', expanded);
      });
    });
  });

  /* A pointer dot leads while the ring trails for fine pointers. */
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor__dot');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (cursor && cursorDot && finePointer.matches && !reduceMotion.matches) {
    const body = document.body;
    let targetX = 0;
    let targetY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let animationFrame = 0;

    const moveCursor = () => {
      cursorX += (targetX - cursorX) * 0.12;
      cursorY += (targetY - cursorY) * 0.12;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      if (Math.abs(targetX - cursorX) > 0.1 || Math.abs(targetY - cursorY) > 0.1) {
        animationFrame = window.requestAnimationFrame(moveCursor);
      } else {
        animationFrame = 0;
      }
    };

    const queueCursorMove = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(moveCursor);
    };

    document.addEventListener('pointermove', (event) => {
      body.classList.add('has-custom-cursor');
      targetX = event.clientX;
      targetY = event.clientY;
      cursorDot.style.left = `${event.clientX}px`;
      cursorDot.style.top = `${event.clientY}px`;
      cursor.classList.add('is-visible');
      cursorDot.classList.add('is-visible');
      queueCursorMove();
    });

    document.documentElement.addEventListener('pointerenter', () => {
      body.classList.add('has-custom-cursor');
    });
    document.documentElement.addEventListener('pointerleave', () => {
      body.classList.remove('has-custom-cursor');
      cursor.classList.remove('is-visible');
      cursorDot.classList.remove('is-visible');
    });
  }

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