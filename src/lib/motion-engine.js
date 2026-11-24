import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let activeLenis = null;

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function pauseSmoothScroll() {
  if (activeLenis) {
    activeLenis.stop();
  }
}

export function resumeSmoothScroll() {
  if (activeLenis) {
    activeLenis.start();
  }
}

export function scrollToSection(target) {
  const el =
    typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  if (activeLenis) {
    activeLenis.scrollTo(el, {
      offset: window.innerWidth >= 640 ? -92 : -16,
      duration: 1.0,
    });
    return;
  }

  el.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  });
}

export function refreshMotion() {
  ScrollTrigger.refresh();
}

export function initSmoothScroll() {
  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });

    activeLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      if (activeLenis === lenis) {
        activeLenis = null;
      }
    };
  });

  // Intercept internal hash navigation cleanly for both Lenis and native fallback
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || anchor.classList.contains('skip-link')) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    if (activeLenis) {
      event.preventDefault();
      activeLenis.scrollTo(target, {
        offset: window.innerWidth >= 640 ? -92 : -16,
        duration: 1.0,
      });
    }
  });
}

export function initSectionReveals() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const targets = gsap.utils.toArray('[data-bento-reveal]');
    if (targets.length === 0) return;

    gsap.set(targets, {
      y: 28,
      scale: 0.96,
      opacity: 0,
      clipPath: 'inset(5% 3% 5% 3% round 26px)',
    });

    const batchTriggers = ScrollTrigger.batch(targets, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          scale: 1,
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0% round 26px)',
          duration: 0.68,
          stagger: 0.08,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'clipPath,transform,opacity',
        });
      },
    });

    return () => {
      for (const st of batchTriggers) {
        st.kill();
      }
      gsap.set(targets, { clearProps: 'all' });
    };
  });
}

export function initTactileControls() {
  const mm = gsap.matchMedia();

  // Magnetic subtle spring on corner circle action buttons (desktop fine pointer)
  mm.add(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    () => {
      const buttons = gsap.utils.toArray('.bento-circle-btn');
      const cleanups = [];

      for (const btn of buttons) {
        const icon = btn.querySelector('svg');
        const btnX = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
        const btnY = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });
        const iconX = icon
          ? gsap.quickTo(icon, 'x', { duration: 0.3, ease: 'power3.out' })
          : null;
        const iconY = icon
          ? gsap.quickTo(icon, 'y', { duration: 0.3, ease: 'power3.out' })
          : null;

        const onMove = (event) => {
          const rect = btn.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const relX = (event.clientX - rect.left) / rect.width - 0.5;
          const relY = (event.clientY - rect.top) / rect.height - 0.5;
          btnX(relX * 12);
          btnY(relY * 12);
          if (iconX && iconY) {
            iconX(relX * 6);
            iconY(relY * 6);
          }
        };

        const onLeave = () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.55,
            ease: 'elastic.out(1, 0.45)',
            overwrite: 'auto',
          });
          if (icon) {
            gsap.to(icon, {
              x: 0,
              y: 0,
              duration: 0.45,
              ease: 'elastic.out(1, 0.45)',
              overwrite: 'auto',
            });
          }
        };

        btn.addEventListener('pointermove', onMove);
        btn.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          btn.removeEventListener('pointermove', onMove);
          btn.removeEventListener('pointerleave', onLeave);
          gsap.set(btn, { clearProps: 'transform' });
          if (icon) gsap.set(icon, { clearProps: 'transform' });
        });
      }

      return () => {
        for (const fn of cleanups) fn();
      };
    }
  );

  // Tactile scale-down/spring-back feedback for action controls
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const selector =
      '.btn-cobalt, .btn-editorial-outline, .btn-editorial-ink, .btn-light-secondary, .showcase-tab-btn, .bento-circle-btn';
    let pressedEl = null;

    const onDown = (event) => {
      const target = event.target.closest(selector);
      if (!target || target.disabled) return;
      pressedEl = target;
      gsap.to(target, {
        scale: 0.97,
        duration: 0.1,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const releasePressed = () => {
      if (!pressedEl) return;
      const el = pressedEl;
      pressedEl = null;
      gsap.to(el, {
        scale: 1,
        duration: 0.3,
        ease: 'back.out(2)',
        overwrite: 'auto',
        clearProps: 'scale',
      });
    };

    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', releasePressed, { passive: true });
    document.addEventListener('pointercancel', releasePressed, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', releasePressed);
      document.removeEventListener('pointercancel', releasePressed);
    };
  });
}

export { gsap, ScrollTrigger };
