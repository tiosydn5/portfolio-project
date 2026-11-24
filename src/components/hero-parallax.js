import { gsap } from '../lib/motion-engine.js';

export function initHeroParallax() {
  const heroSection = document.getElementById('home');
  if (!heroSection) return;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const maskLines = gsap.utils.toArray('.hero-mask-line', heroSection);
    const frameLeft = heroSection.querySelector('.hero-frame-left');
    const frameRight = heroSection.querySelector('.hero-frame-right');
    const frameEdgeLeft = heroSection.querySelector('.hero-frame-edge-left');
    const frameEdgeRight = heroSection.querySelector('.hero-frame-edge-right');
    const titleRise = heroSection.querySelector('.hero-title-rise');
    const cutout = heroSection.querySelector('.hero-cutout-fg');
    const cutoutImg = heroSection.querySelector('#hero-cutout-img');
    const radialDepth = heroSection.querySelectorAll('.hero-radial-depth');
    const metaStrip = heroSection.querySelector('.hero-meta-strip');
    const sideTiles = gsap.utils.toArray('[data-hero-side-tile]', heroSection);

    // 1. Page-load Choreographed Intro Timeline (isolated on inner elements, never colliding with scrub)
    const introTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    if (maskLines.length > 0) {
      introTl.from(
        maskLines,
        {
          yPercent: 115,
          duration: 0.88,
          stagger: 0.1,
          clearProps: 'transform',
        },
        0.04
      );
    }

    if (frameEdgeLeft) {
      introTl.from(
        frameEdgeLeft,
        {
          clipPath: 'inset(0 100% 100% 0)',
          duration: 0.85,
          clearProps: 'clipPath',
        },
        0.08
      );
    }

    if (frameEdgeRight) {
      introTl.from(
        frameEdgeRight,
        {
          clipPath: 'inset(100% 0 0 100%)',
          duration: 0.85,
          clearProps: 'clipPath',
        },
        0.12
      );
    }

    if (cutoutImg) {
      introTl.from(
        cutoutImg,
        {
          y: 34,
          scale: 0.94,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        },
        0.12
      );
    }

    if (metaStrip) {
      introTl.from(
        metaStrip,
        {
          y: -12,
          opacity: 0,
          duration: 0.6,
          clearProps: 'transform,opacity',
        },
        0.1
      );
    }

    if (sideTiles.length > 0) {
      introTl.from(
        sideTiles,
        {
          y: 26,
          scale: 0.96,
          opacity: 0,
          duration: 0.72,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        },
        0.16
      );
    }

    // 2. Scroll-Scrubbed 3-Layer Depth Parallax
    const scrubTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    if (radialDepth.length > 0) {
      scrubTl.fromTo(
        radialDepth,
        { yPercent: 0, scale: 1 },
        {
          yPercent: 16,
          scale: 1.08,
          ease: 'none',
        },
        0
      );
    }

    if (titleRise) {
      scrubTl.fromTo(
        titleRise,
        { yPercent: 0, scale: 1, opacity: 1 },
        {
          yPercent: -34,
          scale: 1.14,
          opacity: 0.3,
          ease: 'none',
        },
        0
      );
    }

    if (frameLeft) {
      scrubTl.fromTo(
        frameLeft,
        { xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },
        {
          xPercent: -60,
          yPercent: -24,
          scale: 1.15,
          opacity: 0.15,
          ease: 'none',
        },
        0
      );
    }

    if (frameRight) {
      scrubTl.fromTo(
        frameRight,
        { xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },
        {
          xPercent: 60,
          yPercent: -24,
          scale: 1.15,
          opacity: 0.15,
          ease: 'none',
        },
        0
      );
    }

    if (cutout) {
      scrubTl.fromTo(
        cutout,
        { yPercent: 0, scale: 1 },
        {
          yPercent: 10,
          scale: 1.05,
          ease: 'none',
        },
        0
      );
    }

    return () => {
      introTl.kill();
      scrubTl.kill();
    };
  });
}
