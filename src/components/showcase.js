import {
  gsap,
  pauseSmoothScroll,
  prefersReducedMotion,
  resumeSmoothScroll,
} from '../lib/motion-engine.js';
import { assetUrl, createEl, createSvgIcon, safeUrl } from '../lib/sanitize.js';
import { isVideoItem, parseVideoSource } from '../lib/video-utils.js';

const CATEGORY_META = {
  project: {
    label: 'Web & Apps',
    emptyMessage: 'Belum ada karya Web & Apps yang cocok dengan filter ini.',
  },
  certificate: {
    label: 'Graphic Design',
    emptyMessage: 'Belum ada karya Graphic Design yang cocok dengan filter ini.',
  },
  award: {
    label: 'Credentials',
    emptyMessage: 'Belum ada entri Credentials yang cocok dengan filter ini.',
  },
  video: {
    label: 'Video',
    emptyMessage: 'Belum ada karya Video yang cocok dengan filter ini.',
  },
};

function initKineticBridgeScroll() {
  const band = document.getElementById('kinetic-bridge');
  const word = document.getElementById('kinetic-bridge-word');
  const sub = document.getElementById('kinetic-bridge-sub');
  if (!band || !word) return;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: band,
        start: 'top 94%',
        end: 'bottom 22%',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(
      word,
      { xPercent: -6, scale: 0.88, opacity: 0.42 },
      { xPercent: 4, scale: 1.03, opacity: 1, ease: 'none' },
      0
    );

    if (sub) {
      tl.fromTo(
        sub,
        { xPercent: 6, opacity: 0.35 },
        { xPercent: -3, opacity: 1, ease: 'none' },
        0
      );
    }

    return () => {
      tl.kill();
      gsap.set([word, sub].filter(Boolean), { clearProps: 'transform,opacity' });
    };
  });
}

function attachDialogFocusTrap(dialog, onClose) {
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusables = Array.from(
      dialog.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);

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

export function initShowcase({ items = [] }) {
  initKineticBridgeScroll();

  const tablistEl = document.getElementById('showcase-tablist');
  const tabPill = document.getElementById('showcase-tab-pill');
  const tabButtons = Array.from(document.querySelectorAll('[data-showcase-tab]'));
  const filtersEl = document.getElementById('showcase-filters');
  const countEl = document.getElementById('showcase-count');
  const trackEl = document.getElementById('showcase-track');
  const prevBtn = document.getElementById('showcase-prev');
  const nextBtn = document.getElementById('showcase-next');
  const panelEl = document.getElementById('showcase-tabpanel');

  const modal = document.getElementById('showcase-modal');
  const modalCard = modal?.querySelector('.modal-card-surface');
  const modalCloseBtn = document.getElementById('showcase-modal-close');
  const modalImg = document.getElementById('showcase-modal-img');
  const modalVideoWrap = document.getElementById('showcase-modal-video-wrap');
  const modalMeta = document.getElementById('showcase-modal-meta');
  const modalSampleBadge = document.getElementById('showcase-modal-sample');
  const modalTitle = document.getElementById('showcase-modal-title');
  const modalSubtitle = document.getElementById('showcase-modal-subtitle');
  const modalDesc = document.getElementById('showcase-modal-desc');
  const modalTags = document.getElementById('showcase-modal-tags');
  const modalLinks = document.getElementById('showcase-modal-links');

  if (!trackEl || tabButtons.length === 0) return;

  let activeCategory = 'project';
  let activeTag = 'ALL';
  let lastTriggerEl = null;
  let releaseFocusTrap = null;
  let isModalClosing = false;
  let hasInitializedCards = false;

  function stopModalVideo() {
    if (!modalVideoWrap) return;
    const activeVideo = modalVideoWrap.querySelector('video');
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.removeAttribute('src');
      activeVideo.load();
    }
    modalVideoWrap.replaceChildren();
    modalVideoWrap.hidden = true;
  }

  function positionTabPill(targetBtn, animate = true) {
    if (!tabPill || !targetBtn) return;
    const width = targetBtn.offsetWidth;
    const height = targetBtn.offsetHeight;
    if (width === 0 || height === 0) return;
    const left = targetBtn.offsetLeft;
    const top = targetBtn.offsetTop;

    tabPill.style.width = `${width}px`;
    tabPill.style.height = `${height}px`;

    if (!animate || prefersReducedMotion()) {
      gsap.set(tabPill, { x: left, y: top });
      return;
    }

    gsap.to(tabPill, {
      x: left,
      y: top,
      duration: 0.46,
      ease: 'back.out(1.4)',
      overwrite: 'auto',
    });
  }

  function finalizeCloseModal() {
    isModalClosing = false;
    stopModalVideo();
    if (modalImg) {
      modalImg.hidden = false;
    }
    if (modal && modal.open) {
      modal.close();
    }
    if (modalCard) {
      gsap.set(modalCard, { clearProps: 'transform,opacity' });
    }
    resumeSmoothScroll();

    if (releaseFocusTrap) {
      releaseFocusTrap();
      releaseFocusTrap = null;
    }
    if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
      lastTriggerEl.focus();
      lastTriggerEl = null;
    }
  }

  function closeModal() {
    if (!modal || !modal.open || isModalClosing) return;

    if (prefersReducedMotion() || !modalCard) {
      finalizeCloseModal();
      return;
    }

    isModalClosing = true;
    gsap.to(modalCard, {
      scale: 0.93,
      opacity: 0,
      y: 12,
      duration: 0.2,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: finalizeCloseModal,
    });
  }

  function openModal(item, triggerEl) {
    if (!modal) return;
    isModalClosing = false;
    lastTriggerEl = triggerEl || document.activeElement;
    pauseSmoothScroll();

    const thumbHref =
      safeUrl(item.thumbnail_url) || assetUrl('/assets/showcase/project-atelier.svg');
    const videoSource = parseVideoSource(item.video_url);

    stopModalVideo();

    if (videoSource && modalVideoWrap) {
      if (modalImg) modalImg.hidden = true;
      modalVideoWrap.hidden = false;

      if (videoSource.type === 'direct') {
        const videoEl = createEl('video', {
          className: 'w-full max-h-[60vh] rounded-xl bg-[#0B0F19] block mx-auto',
          attrs: {
            controls: '',
            playsinline: '',
            preload: 'metadata',
            poster: thumbHref,
            'aria-label': `Pemutar video ${item.title}`,
          },
        });
        videoEl.appendChild(
          createEl('source', {
            attrs: { src: videoSource.src },
          })
        );
        modalVideoWrap.appendChild(videoEl);
      } else {
        const embedFrameWrap = createEl('div', {
          className: 'w-full aspect-video max-h-[60vh] rounded-xl overflow-hidden bg-[#0B0F19]',
        });
        const iframeEl = createEl('iframe', {
          className: 'w-full h-full border-0 block',
          attrs: {
            src: videoSource.embedUrl,
            title: `Video ${item.title}`,
            allow:
              'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen',
            allowfullscreen: '',
            loading: 'lazy',
            referrerpolicy: 'strict-origin-when-cross-origin',
          },
        });
        embedFrameWrap.appendChild(iframeEl);
        modalVideoWrap.appendChild(embedFrameWrap);
      }
    } else if (modalImg) {
      modalImg.hidden = false;
      modalImg.src = thumbHref;
      modalImg.alt = `Pratinjau visual ${item.title}`;
    }

    if (modalMeta) {
      const catName = videoSource
        ? CATEGORY_META.video.label
        : CATEGORY_META[item.category]?.label || item.category;
      modalMeta.textContent = [catName, item.discipline || 'Showcase', item.date_label]
        .filter(Boolean)
        .join(' · ');
    }

    if (modalSampleBadge) {
      modalSampleBadge.hidden = !item.isSample;
    }

    if (modalTitle) modalTitle.textContent = item.title;
    if (modalSubtitle) modalSubtitle.textContent = item.subtitle || '';
    if (modalDesc) modalDesc.textContent = item.description || '';

    if (modalTags) {
      modalTags.replaceChildren();
      for (const tag of item.tech_tags || []) {
        modalTags.appendChild(
          createEl('span', {
            className:
              'font-mono-tabular text-xs font-medium px-2.5 py-1 rounded-lg bg-[#F4F6FA] border-[1.5px] border-[#0F172A] text-[#0B0F19]',
            text: tag,
          })
        );
      }
    }

    if (modalLinks) {
      modalLinks.replaceChildren();
      const liveHref = safeUrl(item.live_url);
      const repoHref = safeUrl(item.repo_url);

      if (liveHref) {
        modalLinks.appendChild(
          createEl('a', {
            className: 'btn-cobalt',
            text: 'Buka Live Demo',
            attrs: {
              href: liveHref,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          })
        );
      }

      if (repoHref) {
        modalLinks.appendChild(
          createEl('a', {
            className: 'btn-light-secondary',
            text: 'Buka Repository',
            attrs: {
              href: repoHref,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          })
        );
      }

      if (videoSource?.externalUrl && videoSource.externalUrl !== liveHref) {
        modalLinks.appendChild(
          createEl('a', {
            className: 'btn-light-secondary',
            text:
              videoSource.type === 'direct'
                ? 'Buka Video di Tab Baru'
                : `Tonton di ${videoSource.label}`,
            attrs: {
              href: videoSource.externalUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          })
        );
      }

      if (!liveHref && !repoHref && !videoSource) {
        modalLinks.appendChild(
          createEl('p', {
            className: 'text-sm text-[#475569]',
            text: 'Tautan eksternal belum ditautkan pada entri ini.',
          })
        );
      }
    }

    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }

    if (modalCard && !prefersReducedMotion()) {
      gsap.fromTo(
        modalCard,
        { scale: 0.9, opacity: 0, y: 18 },
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

    releaseFocusTrap = attachDialogFocusTrap(modal, closeModal);
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  if (modal && modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    modal.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeModal();
    });
  }

  function updateCarouselButtons() {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = Math.max(0, trackEl.scrollWidth - trackEl.clientWidth);
    prevBtn.disabled = trackEl.scrollLeft <= 4;
    nextBtn.disabled = maxScroll <= 4 || trackEl.scrollLeft >= maxScroll - 4;
  }

  function renderFilters(categoryItems) {
    if (!filtersEl) return;
    filtersEl.replaceChildren();

    const tagSet = new Set();
    for (const item of categoryItems) {
      for (const tag of item.tech_tags || []) {
        tagSet.add(tag);
      }
    }

    const tags = ['ALL', ...Array.from(tagSet)];
    if (!tags.includes(activeTag)) activeTag = 'ALL';

    for (const tag of tags) {
      const isActive = activeTag === tag;
      const btn = createEl('button', {
        className: isActive
          ? 'min-h-[44px] px-4 rounded-xl text-xs font-mono-tabular font-semibold bg-[#0B0F19] text-[#FFFFFF] border-[1.5px] border-[#0F172A] transition-colors'
          : 'min-h-[44px] px-4 rounded-xl text-xs font-mono-tabular font-semibold bg-[#FFFFFF] text-[#0B0F19] border-[1.5px] border-[#0F172A] hover:bg-[#DBEAFE] transition-colors',
        text: tag === 'ALL' ? 'Semua' : tag,
        attrs: {
          type: 'button',
          'aria-pressed': String(isActive),
        },
      });

      btn.addEventListener('click', () => {
        activeTag = tag;
        renderActiveView(true);
      });

      filtersEl.appendChild(btn);
    }
  }

  function renderCards(filteredItems, totalInCategory, animateEntrance = true) {
    trackEl.replaceChildren();

    if (countEl) {
      const catLabel = CATEGORY_META[activeCategory]?.label || activeCategory;
      countEl.textContent = `Menampilkan ${filteredItems.length} dari ${totalInCategory} ${catLabel}`;
    }

    if (filteredItems.length === 0) {
      const emptyBox = createEl(
        'div',
        {
          className:
            'w-full rounded-[24px] bg-[#FFFFFF] border-[1.5px] border-[#0F172A] p-8 text-center space-y-4',
        },
        createEl('p', {
          className: 'text-base text-[#475569]',
          text: CATEGORY_META[activeCategory]?.emptyMessage || 'Belum ada item di kategori ini.',
        }),
        createEl('button', {
          className: 'btn-light-secondary',
          text: 'Reset Filter',
          attrs: { type: 'button' },
        })
      );

      emptyBox.querySelector('button')?.addEventListener('click', () => {
        activeTag = 'ALL';
        renderActiveView(true);
      });

      trackEl.appendChild(emptyBox);
      updateCarouselButtons();
      return;
    }

    const renderedCards = [];

    for (const item of filteredItems) {
      const hasVideo = isVideoItem(item);
      const card = createEl('article', {
        className:
          'showcase-card rounded-[24px] bg-[#FFFFFF] border-[1.5px] border-[#0F172A] hover:border-[#2563EB] overflow-hidden flex flex-col justify-between',
      });

      const thumbWrap = createEl('div', {
        className: 'relative bg-[#0B0F19] border-b-[1.5px] border-[#0F172A] overflow-hidden',
      });

      const img = createEl('img', {
        className: 'showcase-thumb-img w-full h-auto aspect-[16/10] object-contain p-2 block',
        attrs: {
          src: safeUrl(item.thumbnail_url) || assetUrl('/assets/showcase/project-atelier.svg'),
          alt: `Thumbnail ${item.title}`,
          width: '640',
          height: '400',
          loading: 'lazy',
          decoding: 'async',
        },
      });
      thumbWrap.appendChild(img);

      if (hasVideo) {
        const videoBadge = createEl(
          'span',
          {
            className:
              'absolute top-3 right-3 inline-flex items-center gap-1.5 font-mono-tabular text-xs font-semibold px-2.5 py-1 rounded-full bg-[#0B0F19]/90 text-[#FFFFFF] border border-[#FFFFFF]/30 pointer-events-none',
          },
          createSvgIcon({
            className: 'w-3 h-3',
            fill: 'currentColor',
            stroke: 'currentColor',
            strokeWidth: '1.5',
            shapes: [{ tag: 'polygon', attrs: { points: '6 4 20 12 6 20 6 4' } }],
          }),
          createEl('span', { text: 'Video' })
        );
        thumbWrap.appendChild(videoBadge);
      }

      const body = createEl('div', { className: 'p-5 flex-1 flex flex-col justify-between gap-4' });
      const topContent = createEl('div', { className: 'space-y-2.5' });

      const metaRow = createEl(
        'div',
        { className: 'flex items-center justify-between gap-2' },
        createEl('span', {
          className:
            'font-mono-tabular text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#DBEAFE] border border-[#0F172A] text-[#1D4ED8]',
          text: item.discipline || 'Showcase',
        }),
        createEl('span', {
          className: 'font-mono-tabular text-xs font-medium text-[#475569]',
          text: item.date_label || '',
        })
      );

      const titleEl = createEl('h3', {
        className: 'font-display text-lg font-bold text-[#0B0F19] leading-snug',
        text: item.title,
      });

      const subtitleEl = createEl('p', {
        className: 'text-sm text-[#475569] leading-relaxed',
        text: item.subtitle || '',
      });

      const tagsWrap = createEl('div', { className: 'flex flex-wrap gap-1.5 pt-1' });
      for (const tag of (item.tech_tags || []).slice(0, 3)) {
        tagsWrap.appendChild(
          createEl('span', {
            className:
              'font-mono-tabular text-xs font-medium px-2.5 py-1 rounded-md bg-[#F4F6FA] border border-[rgba(15,23,42,0.22)] text-[#0B0F19]',
            text: tag,
          })
        );
      }

      topContent.append(metaRow, titleEl, subtitleEl, tagsWrap);

      const actionBtn = createEl(
        'button',
        {
          className: 'btn-cobalt w-full',
          attrs: { type: 'button' },
        },
        createEl('span', { text: hasVideo ? 'Putar Video' : 'Lihat Detail' }),
        hasVideo
          ? createSvgIcon({
              className: 'showcase-action-icon w-4 h-4',
              fill: 'currentColor',
              stroke: 'currentColor',
              strokeWidth: '1.5',
              shapes: [{ tag: 'polygon', attrs: { points: '6 4 20 12 6 20 6 4' } }],
            })
          : createSvgIcon({
              className: 'showcase-action-icon w-4 h-4',
              shapes: [
                { tag: 'line', attrs: { x1: '7', y1: '17', x2: '17', y2: '7' } },
                { tag: 'polyline', attrs: { points: '7 7 17 7 17 17' } },
              ],
            })
      );

      actionBtn.addEventListener('click', () => openModal(item, actionBtn));

      body.append(topContent, actionBtn);
      card.append(thumbWrap, body);
      trackEl.appendChild(card);
      renderedCards.push(card);
    }

    trackEl.scrollTo({ left: 0, behavior: 'auto' });
    window.requestAnimationFrame(updateCarouselButtons);

    if (animateEntrance && hasInitializedCards && renderedCards.length > 0 && !prefersReducedMotion()) {
      const visibleWave = renderedCards.slice(0, 6);
      gsap.fromTo(
        visibleWave,
        { y: 34, scale: 0.97, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.85,
          stagger: 0.08,
          ease: 'expo.out',
          overwrite: 'auto',
          clearProps: 'transform,opacity',
        }
      );
    }
    hasInitializedCards = true;
  }

  const hasVideoItems = items.some((item) => isVideoItem(item));
  const videoTabBtn = tabButtons.find((btn) => btn.dataset.showcaseTab === 'video');
  if (videoTabBtn) {
    videoTabBtn.hidden = !hasVideoItems;
  }

  function getVisibleTabButtons() {
    return tabButtons.filter((btn) => !btn.hidden);
  }

  function renderActiveView(animateCards = true) {
    const categoryItems =
      activeCategory === 'video'
        ? items.filter((item) => isVideoItem(item))
        : items.filter((item) => item.category === activeCategory && !isVideoItem(item));
    renderFilters(categoryItems);

    const filtered =
      activeTag === 'ALL'
        ? categoryItems
        : categoryItems.filter((item) => (item.tech_tags || []).includes(activeTag));

    renderCards(filtered, categoryItems.length, animateCards);
  }

  function activateTab(category, shouldFocus = false, animatePill = true) {
    if (!CATEGORY_META[category]) return;
    if (category === 'video' && !hasVideoItems) return;
    activeCategory = category;
    activeTag = 'ALL';

    const visibleTabs = getVisibleTabButtons();
    let selectedBtn = visibleTabs[0] || tabButtons[0];
    for (const btn of tabButtons) {
      const isSelected = !btn.hidden && btn.dataset.showcaseTab === category;
      btn.setAttribute('aria-selected', String(isSelected));
      btn.setAttribute('tabindex', isSelected ? '0' : '-1');
      if (isSelected) {
        selectedBtn = btn;
        if (shouldFocus) btn.focus();
      }
    }

    positionTabPill(selectedBtn, animatePill);

    if (panelEl && selectedBtn?.id) {
      panelEl.setAttribute('aria-labelledby', selectedBtn.id);
    }

    renderActiveView(animatePill);
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.showcaseTab, false, true));

    btn.addEventListener('keydown', (event) => {
      const visibleTabs = getVisibleTabButtons();
      const visibleIdx = visibleTabs.indexOf(btn);
      if (visibleIdx === -1) return;

      let nextIndex = null;
      if (event.key === 'ArrowRight') nextIndex = (visibleIdx + 1) % visibleTabs.length;
      else if (event.key === 'ArrowLeft')
        nextIndex = (visibleIdx - 1 + visibleTabs.length) % visibleTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = visibleTabs.length - 1;

      if (nextIndex !== null) {
        event.preventDefault();
        activateTab(visibleTabs[nextIndex].dataset.showcaseTab, true, true);
      }
    });
  });

  if (prevBtn && nextBtn) {
    const scrollByStep = (dir) => {
      const firstCard = trackEl.querySelector('.showcase-card');
      const step = firstCard ? firstCard.getBoundingClientRect().width + 16 : 320;
      trackEl.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    prevBtn.addEventListener('click', () => scrollByStep(-1));
    nextBtn.addEventListener('click', () => scrollByStep(1));
    trackEl.addEventListener('scroll', updateCarouselButtons, { passive: true });
    window.addEventListener('resize', updateCarouselButtons, { passive: true });
  }

  window.addEventListener('showcase:select-tab', (event) => {
    const category = event.detail?.category;
    if (category && CATEGORY_META[category]) {
      activateTab(category, false, true);
    }
  });

  if (tablistEl && 'ResizeObserver' in window) {
    const tabResizeObs = new ResizeObserver(() => {
      const activeBtn = tabButtons.find((b) => b.dataset.showcaseTab === activeCategory);
      positionTabPill(activeBtn, false);
    });
    tabResizeObs.observe(tablistEl);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      const activeBtn = tabButtons.find((b) => b.dataset.showcaseTab === activeCategory);
      positionTabPill(activeBtn, false);
    });
  }

  activateTab('project', false, false);
}
