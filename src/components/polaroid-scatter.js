import {
  gsap,
  pauseSmoothScroll,
  prefersReducedMotion,
  resumeSmoothScroll,
  ScrollTrigger,
} from '../lib/motion-engine.js';
import { assetUrl, createEl, safeUrl } from '../lib/sanitize.js';

function parsePx(value, fallback = 0) {
  const num = parseFloat(String(value || ''));
  return Number.isFinite(num) ? num : fallback;
}

function attachLightboxTrap(dialog, onClose, onStep) {
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onStep(1);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onStep(-1);
      return;
    }

    if (event.key !== 'Tab') return;
    const focusables = Array.from(
      dialog.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  dialog.addEventListener('keydown', onKeyDown);
  return () => dialog.removeEventListener('keydown', onKeyDown);
}

export function initPolaroidScatter({ photos = [] }) {
  const stage = document.getElementById('polaroid-stage');
  const toggleScatterBtn = document.getElementById('polaroid-scatter-toggle');
  const mobileCounterEl = document.getElementById('polaroid-mobile-counter');
  const deckPrevBtn = document.getElementById('polaroid-deck-prev');
  const deckNextBtn = document.getElementById('polaroid-deck-next');

  const lightbox = document.getElementById('polaroid-lightbox');
  const lbCard = lightbox?.querySelector('.modal-card-surface');
  const lbCloseBtn = document.getElementById('polaroid-lb-close');
  const lbImg = document.getElementById('polaroid-lb-img');
  const lbCaption = document.getElementById('polaroid-lb-caption');
  const lbMeta = document.getElementById('polaroid-lb-meta');
  const lbCounter = document.getElementById('polaroid-lb-counter');
  const lbPrevBtn = document.getElementById('polaroid-lb-prev');
  const lbNextBtn = document.getElementById('polaroid-lb-next');

  if (!stage) return;

  stage.replaceChildren();

  if (!photos || photos.length === 0) {
    stage.appendChild(
      createEl('p', {
        className: 'text-base text-[#334155] py-12 text-center w-full',
        text: 'Belum ada visual snapshot yang ditampilkan.',
      })
    );
    return;
  }

  let activeLightboxIndex = 0;
  let lastTriggerEl = null;
  let releaseTrap = null;
  let isLbClosing = false;

  function renderLightboxItem(animateSwap = false) {
    const item = photos[activeLightboxIndex];
    if (!item) return;

    if (lbImg) {
      lbImg.src = safeUrl(item.image_url) || assetUrl('/assets/polaroid/polaroid-01.svg');
      lbImg.alt = item.caption;
      if (animateSwap && !prefersReducedMotion()) {
        gsap.fromTo(
          lbImg,
          { opacity: 0.35, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.28,
            ease: 'power2.out',
            overwrite: 'auto',
          }
        );
      }
    }
    if (lbCaption) lbCaption.textContent = item.caption;
    if (lbMeta) lbMeta.textContent = `${item.tag || 'Gallery'} · ${item.date_label || ''}`;
    if (lbCounter) lbCounter.textContent = `${activeLightboxIndex + 1} / ${photos.length}`;
  }

  function stepLightbox(delta) {
    activeLightboxIndex = (activeLightboxIndex + delta + photos.length) % photos.length;
    renderLightboxItem(true);
  }

  function finalizeCloseLightbox() {
    isLbClosing = false;
    if (lightbox && lightbox.open) {
      lightbox.close();
    }
    if (lbCard) {
      gsap.set(lbCard, { clearProps: 'transform,opacity' });
    }
    resumeSmoothScroll();

    if (releaseTrap) {
      releaseTrap();
      releaseTrap = null;
    }
    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
      lastTriggerEl = null;
    }
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.open || isLbClosing) return;

    if (prefersReducedMotion() || !lbCard) {
      finalizeCloseLightbox();
      return;
    }

    isLbClosing = true;
    gsap.to(lbCard, {
      scale: 0.92,
      opacity: 0,
      y: 12,
      duration: 0.2,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: finalizeCloseLightbox,
    });
  }

  function openLightbox(index, triggerEl) {
    if (!lightbox) return;
    isLbClosing = false;
    activeLightboxIndex = index;
    lastTriggerEl = triggerEl || document.activeElement;
    pauseSmoothScroll();
    renderLightboxItem(false);

    if (typeof lightbox.showModal === 'function') {
      lightbox.showModal();
    } else {
      lightbox.setAttribute('open', '');
    }

    if (lbCard && !prefersReducedMotion()) {
      gsap.fromTo(
        lbCard,
        { scale: 0.88, opacity: 0, y: 16 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'back.out(1.5)',
          overwrite: 'auto',
          clearProps: 'transform',
        }
      );
    }

    releaseTrap = attachLightboxTrap(lightbox, closeLightbox, stepLightbox);
    if (lbCloseBtn) lbCloseBtn.focus();
  }

  if (lightbox && lbCloseBtn) {
    lbCloseBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeLightbox();
    });
  }

  if (lbPrevBtn) lbPrevBtn.addEventListener('click', () => stepLightbox(-1));
  if (lbNextBtn) lbNextBtn.addEventListener('click', () => stepLightbox(1));

  const cardElements = [];

  photos.forEach((photo, index) => {
    const numLabel = String(index + 1).padStart(2, '0');
    const stackZ = photos.length - index;

    const cardBtn = createEl('button', {
      className: 'polaroid-card',
      attrs: {
        type: 'button',
        'aria-label': `Inspeksi foto ${numLabel}: ${photo.caption}`,
      },
      dataset: { polaroidIndex: String(index) },
    });

    cardBtn.style.setProperty('--scatter-rot', `${photo.rotation_deg || 0}deg`);
    cardBtn.style.setProperty('--stack-z', String(stackZ));

    const frame = createEl('div', {
      className: 'rounded-lg overflow-hidden bg-[#0B0F19] border-[1.5px] border-[#0F172A]',
    });

    frame.appendChild(
      createEl('img', {
        className: 'w-full h-auto aspect-[4/3] object-contain p-1.5 block select-none',
        attrs: {
          src: safeUrl(photo.image_url) || assetUrl('/assets/polaroid/polaroid-01.svg'),
          alt: photo.caption,
          width: '480',
          height: '360',
          loading: 'lazy',
          decoding: 'async',
        },
      })
    );

    const captionWrap = createEl(
      'div',
      { className: 'pt-3 px-1 space-y-1' },
      createEl(
        'div',
        { className: 'flex items-center justify-between gap-2' },
        createEl('span', {
          className: 'font-mono-tabular text-xs font-semibold text-[#1D4ED8]',
          text: photo.tag || 'Gallery',
        }),
        createEl('span', {
          className: 'font-mono-tabular text-xs font-medium text-[#475569]',
          text: `${numLabel}/${String(photos.length).padStart(2, '0')}`,
        })
      ),
      createEl('p', {
        className: 'text-sm font-semibold text-[#0B0F19] leading-snug',
        text: photo.caption,
      })
    );

    cardBtn.append(frame, captionWrap);
    cardBtn.addEventListener('click', () => openLightbox(index, cardBtn));
    stage.appendChild(cardBtn);
    cardElements.push(cardBtn);
  });

  // Scatter state management across viewports
  let isScattered = false;
  let applyScatterState = (next) => {
    isScattered = next;
    stage.classList.toggle('is-scattered', next);
    if (toggleScatterBtn) {
      toggleScatterBtn.setAttribute('aria-pressed', String(next));
      toggleScatterBtn.textContent = next ? 'Tumpuk Kartu' : 'Sebar Kartu';
    }
  };

  let desktopScatterTrigger = null;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const getScaleFactor = () => (window.innerWidth >= 1200 ? 1 : 0.88);
    const getCoords = (index) => {
      const photo = photos[index] || {};
      const factor = getScaleFactor();
      return {
        x: parsePx(photo.scatterX, 0) * factor,
        y: parsePx(photo.scatterY, 0) * factor,
        rotation: Number(photo.rotation_deg) || 0,
        restRot: ((index % 3) - 1) * 3,
        stackZ: photos.length - index,
      };
    };

    const runLayoutTween = (nextScattered, animate = true) => {
      isScattered = nextScattered;
      stage.classList.toggle('is-scattered', nextScattered);
      if (toggleScatterBtn) {
        toggleScatterBtn.setAttribute('aria-pressed', String(nextScattered));
        toggleScatterBtn.textContent = nextScattered ? 'Tumpuk Kartu' : 'Sebar Kartu';
      }

      cardElements.forEach((card, idx) => {
        const c = getCoords(idx);
        const props = nextScattered
          ? { x: c.x, y: c.y, rotation: c.rotation, scale: 1, zIndex: c.stackZ }
          : { x: 0, y: 0, rotation: c.restRot, scale: 0.92, zIndex: c.stackZ };

        if (!animate || prefersReducedMotion()) {
          gsap.set(card, props);
        } else {
          gsap.to(card, {
            ...props,
            duration: nextScattered ? 0.76 : 0.56,
            delay: nextScattered ? idx * 0.06 : (cardElements.length - 1 - idx) * 0.035,
            ease: nextScattered ? 'back.out(1.4)' : 'power3.out',
            overwrite: 'auto',
          });
        }
      });
    };

    applyScatterState = (next, animate = true) => runLayoutTween(next, animate);

    if (prefersReducedMotion()) {
      runLayoutTween(true, false);
    } else {
      runLayoutTween(false, false);
      desktopScatterTrigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top 76%',
        once: true,
        onEnter: () => {
          runLayoutTween(true, true);
        },
      });
    }

    // Hover / Keyboard focus straighten + lift on top
    const hoverCleanups = [];
    cardElements.forEach((card, idx) => {
      const liftCard = () => {
        if (!isScattered) return;
        const c = getCoords(idx);
        if (prefersReducedMotion()) {
          gsap.set(card, { zIndex: 40 });
          return;
        }
        gsap.to(card, {
          rotation: 0,
          scale: 1.07,
          y: c.y - 14,
          zIndex: 40,
          duration: 0.34,
          ease: 'back.out(1.6)',
          overwrite: 'auto',
        });
      };

      const resetCard = () => {
        if (!isScattered) return;
        const c = getCoords(idx);
        if (prefersReducedMotion()) {
          gsap.set(card, { zIndex: c.stackZ });
          return;
        }
        gsap.to(card, {
          rotation: c.rotation,
          scale: 1,
          y: c.y,
          zIndex: c.stackZ,
          duration: 0.36,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      };

      card.addEventListener('mouseenter', liftCard);
      card.addEventListener('mouseleave', resetCard);
      card.addEventListener('focusin', liftCard);
      card.addEventListener('focusout', resetCard);

      hoverCleanups.push(() => {
        card.removeEventListener('mouseenter', liftCard);
        card.removeEventListener('mouseleave', resetCard);
        card.removeEventListener('focusin', liftCard);
        card.removeEventListener('focusout', resetCard);
      });
    });

    return () => {
      if (desktopScatterTrigger) {
        desktopScatterTrigger.kill();
        desktopScatterTrigger = null;
      }
      for (const fn of hoverCleanups) fn();
      gsap.set(cardElements, { clearProps: 'transform,zIndex' });
    };
  });

  // Tablet & Mobile state fallback
  mm.add('(max-width: 1023px)', () => {
    isScattered = true;
    stage.classList.add('is-scattered');
    if (toggleScatterBtn) {
      toggleScatterBtn.setAttribute('aria-pressed', 'true');
      toggleScatterBtn.textContent = 'Tumpuk Kartu';
    }
    return () => {};
  });

  if (toggleScatterBtn) {
    toggleScatterBtn.addEventListener('click', () => {
      if (desktopScatterTrigger) {
        desktopScatterTrigger.kill();
        desktopScatterTrigger = null;
      }
      applyScatterState(!isScattered, true);
    });
  }

  // Mobile snap-deck counter & single-pointer prev/next parity
  if (mobileCounterEl && cardElements.length > 0 && 'IntersectionObserver' in window) {
    mobileCounterEl.textContent = `1 / ${cardElements.length}`;
    const deckObs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const idx = Number(visible[0].target.dataset.polaroidIndex || 0);
          mobileCounterEl.textContent = `${idx + 1} / ${cardElements.length}`;
        }
      },
      { root: stage, threshold: 0.6 }
    );

    for (const card of cardElements) {
      deckObs.observe(card);
    }
  }

  if (deckPrevBtn && deckNextBtn) {
    const stepDeck = (dir) => {
      const cardWidth = cardElements[0]?.getBoundingClientRect().width || 260;
      stage.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' });
    };
    deckPrevBtn.addEventListener('click', () => stepDeck(-1));
    deckNextBtn.addEventListener('click', () => stepDeck(1));
  }
}
