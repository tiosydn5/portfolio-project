import { gsap, prefersReducedMotion } from '../lib/motion-engine.js';

export function initSpotlightAvatar() {
  const stage = document.getElementById('spotlight-stage');
  const alterLayer = document.getElementById('spotlight-alter');
  const toggleBtn = document.getElementById('spotlight-toggle');
  const statusHint = document.getElementById('spotlight-mode-label');

  if (!stage || !alterLayer || !toggleBtn) return;

  let cachedRect = stage.getBoundingClientRect();
  let isRevealed = false;

  const spotState = {
    x: (cachedRect.width || 320) * 0.5,
    y: (cachedRect.height || 400) * 0.44,
    r: 0,
  };

  function syncSpotCss() {
    alterLayer.style.setProperty('--spot-x', `${spotState.x.toFixed(1)}px`);
    alterLayer.style.setProperty('--spot-y', `${spotState.y.toFixed(1)}px`);
    alterLayer.style.setProperty('--spot-r', `${Math.max(0, spotState.r).toFixed(1)}px`);
  }

  function refreshRect() {
    cachedRect = stage.getBoundingClientRect();
  }

  const xTo = gsap.quickTo(spotState, 'x', {
    duration: 0.34,
    ease: 'power3.out',
    onUpdate: syncSpotCss,
  });

  const yTo = gsap.quickTo(spotState, 'y', {
    duration: 0.34,
    ease: 'power3.out',
    onUpdate: syncSpotCss,
  });

  function clampPoint(clientX, clientY) {
    if (!cachedRect || cachedRect.width === 0 || cachedRect.height === 0) {
      refreshRect();
    }
    const w = cachedRect.width || 320;
    const h = cachedRect.height || 400;
    return {
      x: Math.min(w, Math.max(0, clientX - cachedRect.left)),
      y: Math.min(h, Math.max(0, clientY - cachedRect.top)),
    };
  }

  stage.addEventListener('pointerenter', (event) => {
    refreshRect();
    if (isRevealed) return;
    const pt = clampPoint(event.clientX, event.clientY);

    if (prefersReducedMotion()) {
      spotState.x = pt.x;
      spotState.y = pt.y;
      spotState.r = 128;
      syncSpotCss();
      return;
    }

    gsap.killTweensOf(spotState);
    spotState.x = pt.x;
    spotState.y = pt.y;
    gsap.to(spotState, {
      r: 132,
      duration: 0.38,
      ease: 'back.out(1.6)',
      onUpdate: syncSpotCss,
    });
  });

  stage.addEventListener('pointermove', (event) => {
    if (isRevealed) return;
    const pt = clampPoint(event.clientX, event.clientY);

    if (prefersReducedMotion()) {
      spotState.x = pt.x;
      spotState.y = pt.y;
      spotState.r = 128;
      syncSpotCss();
      return;
    }

    xTo(pt.x);
    yTo(pt.y);

    if (spotState.r < 120) {
      gsap.to(spotState, {
        r: 132,
        duration: 0.34,
        ease: 'back.out(1.6)',
        onUpdate: syncSpotCss,
      });
    }
  });

  function shrinkSpot() {
    if (isRevealed) return;
    if (prefersReducedMotion()) {
      spotState.r = 0;
      syncSpotCss();
      return;
    }

    gsap.to(spotState, {
      r: 0,
      duration: 0.34,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onUpdate: syncSpotCss,
    });
  }

  stage.addEventListener('pointerleave', shrinkSpot);
  stage.addEventListener('pointercancel', shrinkSpot);

  if ('ResizeObserver' in window) {
    const resizeObs = new ResizeObserver(refreshRect);
    resizeObs.observe(stage);
  }

  function syncToggleUI(nextRevealed, animate = true) {
    isRevealed = nextRevealed;
    stage.classList.toggle('is-revealed', nextRevealed);
    toggleBtn.setAttribute('aria-pressed', String(nextRevealed));
    toggleBtn.textContent = nextRevealed ? 'Show Normal Layer' : 'Reveal Alter-Ego';

    if (statusHint) {
      statusHint.textContent = nextRevealed ? 'LAYER: WIREFRAME' : 'LAYER: BASE';
    }

    refreshRect();
    const w = cachedRect.width || 330;
    const h = cachedRect.height || 412;
    const fullRadius = Math.ceil(Math.hypot(w, h) * 1.15);
    const targetR = nextRevealed ? fullRadius : 0;

    if (!animate || prefersReducedMotion()) {
      spotState.x = w * 0.5;
      spotState.y = h * 0.46;
      spotState.r = targetR;
      syncSpotCss();
      return;
    }

    gsap.killTweensOf(spotState);
    gsap.to(spotState, {
      r: targetR,
      duration: nextRevealed ? 0.56 : 0.42,
      ease: 'power3.inOut',
      onUpdate: syncSpotCss,
    });
  }

  toggleBtn.addEventListener('click', () => {
    const next = toggleBtn.getAttribute('aria-pressed') !== 'true';
    syncToggleUI(next, true);
  });

  syncToggleUI(false, false);
}
