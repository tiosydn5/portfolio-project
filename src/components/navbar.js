import { gsap, prefersReducedMotion } from '../lib/motion-engine.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function buildCyberMascot() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 38 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'w-full h-full overflow-visible');

  // Antenna stem + cobalt beacon
  const stem = document.createElementNS(SVG_NS, 'line');
  stem.setAttribute('x1', '19');
  stem.setAttribute('y1', '2');
  stem.setAttribute('x2', '19');
  stem.setAttribute('y2', '6');
  stem.setAttribute('stroke', '#0B0F19');
  stem.setAttribute('stroke-width', '2.2');
  stem.setAttribute('stroke-linecap', 'round');

  const beacon = document.createElementNS(SVG_NS, 'circle');
  beacon.setAttribute('cx', '19');
  beacon.setAttribute('cy', '2');
  beacon.setAttribute('r', '2');
  beacon.setAttribute('fill', '#2563EB');
  beacon.setAttribute('stroke', '#FFFFFF');
  beacon.setAttribute('stroke-width', '1');

  // Side cyber ear nodes
  const earLeft = document.createElementNS(SVG_NS, 'rect');
  earLeft.setAttribute('x', '4.5');
  earLeft.setAttribute('y', '10.5');
  earLeft.setAttribute('width', '3');
  earLeft.setAttribute('height', '6');
  earLeft.setAttribute('rx', '1.2');
  earLeft.setAttribute('fill', '#2563EB');

  const earRight = document.createElementNS(SVG_NS, 'rect');
  earRight.setAttribute('x', '30.5');
  earRight.setAttribute('y', '10.5');
  earRight.setAttribute('width', '3');
  earRight.setAttribute('height', '6');
  earRight.setAttribute('rx', '1.2');
  earRight.setAttribute('fill', '#2563EB');

  // Chassis head with white keyline for high contrast on both light and obsidian surfaces
  const head = document.createElementNS(SVG_NS, 'path');
  head.setAttribute(
    'd',
    'M7 10.5C7 7.3 9.6 5.5 13 5.5H25C28.4 5.5 31 7.3 31 10.5V19C31 20.4 29.9 21.5 28.5 21.5H9.5C8.1 21.5 7 20.4 7 19V10.5Z'
  );
  head.setAttribute('fill', '#0B0F19');
  head.setAttribute('stroke', '#FFFFFF');
  head.setAttribute('stroke-width', '2');
  head.setAttribute('style', 'paint-order: stroke fill;');

  // Visor slit
  const visor = document.createElementNS(SVG_NS, 'rect');
  visor.setAttribute('x', '10.5');
  visor.setAttribute('y', '10');
  visor.setAttribute('width', '17');
  visor.setAttribute('height', '7');
  visor.setAttribute('rx', '3.5');
  visor.setAttribute('fill', '#1E293B');

  // Glowing geometric visor eyes
  const eyeLeft = document.createElementNS(SVG_NS, 'rect');
  eyeLeft.setAttribute('x', '13.5');
  eyeLeft.setAttribute('y', '12.2');
  eyeLeft.setAttribute('width', '3.2');
  eyeLeft.setAttribute('height', '2.8');
  eyeLeft.setAttribute('rx', '0.9');
  eyeLeft.setAttribute('fill', '#60A5FA');

  const eyeRight = document.createElementNS(SVG_NS, 'rect');
  eyeRight.setAttribute('x', '21.3');
  eyeRight.setAttribute('y', '12.2');
  eyeRight.setAttribute('width', '3.2');
  eyeRight.setAttribute('height', '2.8');
  eyeRight.setAttribute('rx', '0.9');
  eyeRight.setAttribute('fill', '#60A5FA');

  // Paws gripping pill top edge
  const pawLeft = document.createElementNS(SVG_NS, 'rect');
  pawLeft.setAttribute('x', '11');
  pawLeft.setAttribute('y', '20.2');
  pawLeft.setAttribute('width', '4.5');
  pawLeft.setAttribute('height', '3');
  pawLeft.setAttribute('rx', '1.4');
  pawLeft.setAttribute('fill', '#2563EB');
  pawLeft.setAttribute('stroke', '#0B0F19');
  pawLeft.setAttribute('stroke-width', '1');

  const pawRight = document.createElementNS(SVG_NS, 'rect');
  pawRight.setAttribute('x', '22.5');
  pawRight.setAttribute('y', '20.2');
  pawRight.setAttribute('width', '4.5');
  pawRight.setAttribute('height', '3');
  pawRight.setAttribute('rx', '1.4');
  pawRight.setAttribute('fill', '#2563EB');
  pawRight.setAttribute('stroke', '#0B0F19');
  pawRight.setAttribute('stroke-width', '1');

  svg.append(
    stem,
    beacon,
    earLeft,
    earRight,
    head,
    visor,
    eyeLeft,
    eyeRight,
    pawLeft,
    pawRight
  );
  return svg;
}

export function initNavbar() {
  const shell = document.getElementById('floating-nav-shell');
  const pill = document.getElementById('floating-nav-pill');
  const activePill = document.getElementById('nav-active-pill');
  const mascotTrack = document.getElementById('nav-mascot-track');
  const navLinks = Array.from(document.querySelectorAll('.nav-link-item'));

  if (!shell || !pill || !activePill || !mascotTrack || navLinks.length === 0) {
    return;
  }

  document.body.classList.add('has-bottom-dock');

  if (!mascotTrack.hasChildNodes()) {
    const mascotBtn = document.createElement('button');
    mascotBtn.id = 'nav-mascot-trigger';
    mascotBtn.type = 'button';
    mascotBtn.className = 'nav-mascot-btn';
    mascotBtn.setAttribute('aria-label', 'Tanya Satrio Bot');
    mascotBtn.setAttribute('aria-expanded', 'false');
    mascotBtn.setAttribute('aria-controls', 'portfolio-bot-panel');

    const tooltip = document.createElement('span');
    tooltip.className = 'nav-mascot-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    tooltip.textContent = 'Tanya Satrio Bot';

    const svgEl = buildCyberMascot();
    mascotBtn.append(svgEl, tooltip);

    mascotBtn.addEventListener('click', () => {
      if (!prefersReducedMotion()) {
        gsap.fromTo(
          svgEl,
          { y: -6, scale: 1.1 },
          { y: 0, scale: 1, duration: 0.42, ease: 'back.out(2)', overwrite: 'auto' }
        );
      }
      window.dispatchEvent(new CustomEvent('portfolio-bot:toggle', { detail: { opener: mascotBtn } }));
    });

    mascotTrack.appendChild(mascotBtn);
  }

  const mascotSvg = mascotTrack.querySelector('svg');
  let currentId = 'home';
  let lastOffsetX = null;

  function updatePillPosition(targetId, animate = true) {
    const link = navLinks.find((el) => el.dataset.target === targetId) || navLinks[0];
    if (!link) return;

    const linkWidth = link.offsetWidth;
    if (linkWidth === 0) return;

    const offsetX = link.offsetLeft;
    const mascotWidth = mascotTrack.offsetWidth || 38;
    const mascotX = offsetX + linkWidth / 2 - mascotWidth / 2;

    activePill.style.width = `${linkWidth}px`;

    const shouldAnimate = animate && !prefersReducedMotion() && lastOffsetX !== null;
    const deltaX = lastOffsetX !== null ? offsetX - lastOffsetX : 0;
    lastOffsetX = offsetX;

    if (!shouldAnimate) {
      gsap.set(activePill, { x: offsetX });
      gsap.set(mascotTrack, { x: mascotX });
      return;
    }

    gsap.to(activePill, {
      x: offsetX,
      duration: 0.52,
      ease: 'back.out(1.4)',
      overwrite: 'auto',
    });

    gsap.to(mascotTrack, {
      x: mascotX,
      duration: 0.56,
      ease: 'back.out(1.55)',
      overwrite: 'auto',
    });

    if (mascotSvg && Math.abs(deltaX) > 4) {
      const tilt = deltaX > 0 ? 15 : -15;
      gsap.fromTo(
        mascotSvg,
        { rotation: tilt, y: -3 },
        {
          rotation: 0,
          y: 0,
          duration: 0.54,
          ease: 'back.out(1.8)',
          overwrite: 'auto',
        }
      );
    }
  }

  function setActiveSection(id, animate = true) {
    if (!id) return;
    currentId = id;
    for (const link of navLinks) {
      if (link.dataset.target === id) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
    updatePillPosition(id, animate);
  }

  for (const link of navLinks) {
    link.addEventListener('click', () => {
      const target = link.dataset.target;
      if (target) setActiveSection(target, true);
    });
  }

  // Observe sections for active pill state
  const sections = Array.from(document.querySelectorAll('section[data-nav-section]'));
  if (sections.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = visible[0].target.getAttribute('id');
          if (id && id !== currentId) {
            setActiveSection(id, true);
          }
        }
      },
      {
        rootMargin: '-28% 0px -48% 0px',
        threshold: [0.05, 0.25, 0.5],
      }
    );

    for (const section of sections) {
      sectionObserver.observe(section);
    }
  }

  if ('ResizeObserver' in window) {
    const resizeObs = new ResizeObserver(() => updatePillPosition(currentId, false));
    resizeObs.observe(pill);
  }

  window.addEventListener('resize', () => updatePillPosition(currentId, false), {
    passive: true,
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => updatePillPosition(currentId, false));
  }

  setActiveSection(currentId, false);
}
