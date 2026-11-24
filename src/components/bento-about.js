import { gsap } from '../lib/motion-engine.js';
import { createEl, createSvgIcon } from '../lib/sanitize.js';

function renderTimelineItem(entry, isInitiallyHidden) {
  const li = createEl('li', {
    className:
      'py-3.5 border-b border-[rgba(15,23,42,0.14)] last:border-b-0 flex flex-col gap-1',
  });

  if (isInitiallyHidden) {
    li.setAttribute('data-mobile-collapsible', 'true');
    li.classList.add('hidden', 'lg:flex');
  }

  const headerRow = createEl('div', {
    className: 'flex flex-wrap items-baseline justify-between gap-2',
  });

  headerRow.append(
    createEl('h4', {
      className: 'font-display text-base font-bold text-[#0B0F19]',
      text: entry.role,
    }),
    createEl('span', {
      className: 'font-mono-tabular text-xs font-medium text-[#1D4ED8] shrink-0',
      text: entry.period,
    })
  );

  const orgLine = createEl('p', {
    className: 'text-sm font-medium text-[#334155]',
    text: entry.organization,
  });

  const descLine = createEl('p', {
    className: 'text-xs sm:text-sm text-[#334155] leading-relaxed',
    text: entry.description,
  });

  li.append(headerRow, orgLine, descLine);
  return li;
}

function buildTechPill(tool, isClone = false) {
  const li = createEl('li', {
    className: 'tech-pill-item',
    attrs: isClone ? { 'aria-hidden': 'true' } : {},
  });

  const iconWrap = createEl('span', {
    className: 'w-5 h-5 text-[#1D4ED8] shrink-0 flex items-center justify-center',
  });
  iconWrap.appendChild(
    createSvgIcon({
      viewBox: tool.icon.viewBox,
      className: 'w-5 h-5',
      stroke: 'currentColor',
      strokeWidth: '1.8',
      shapes: tool.icon.shapes,
    })
  );

  const nameSpan = createEl('span', {
    className: 'text-sm font-semibold text-[#0B0F19]',
    text: tool.name,
  });

  const catSpan = createEl('span', {
    className: 'font-mono-tabular text-xs text-[#475569]',
    text: tool.category,
  });

  li.append(iconWrap, nameSpan, catSpan);
  return li;
}

export function initBentoAbout({ education, experience, techStack }) {
  const eduList = document.getElementById('education-list');
  const expList = document.getElementById('experience-list');
  const expToggle = document.getElementById('experience-toggle');
  const techGrid = document.getElementById('tech-stack-grid');

  if (eduList) {
    eduList.replaceChildren();
    if (!education || education.length === 0) {
      eduList.appendChild(
        createEl('li', {
          className: 'py-4 text-sm text-[#334155]',
          text: 'Belum ada riwayat pendidikan yang ditambahkan.',
        })
      );
    } else {
      for (const item of education) {
        eduList.appendChild(renderTimelineItem(item, false));
      }
    }
  }

  if (expList) {
    expList.replaceChildren();
    if (!experience || experience.length === 0) {
      expList.appendChild(
        createEl('li', {
          className: 'py-4 text-sm text-[#334155]',
          text: 'Belum ada riwayat pengalaman yang ditambahkan.',
        })
      );
      if (expToggle) expToggle.hidden = true;
    } else {
      experience.forEach((item, index) => {
        expList.appendChild(renderTimelineItem(item, index >= 3));
      });

      if (expToggle) {
        if (experience.length <= 3) {
          expToggle.hidden = true;
        } else {
          expToggle.hidden = false;
          let expanded = false;
          const total = experience.length;

          const updateToggleState = () => {
            const extraRows = expList.querySelectorAll('[data-mobile-collapsible="true"]');
            for (const row of extraRows) {
              row.classList.toggle('hidden', !expanded);
            }
            expToggle.setAttribute('aria-expanded', String(expanded));
            expToggle.textContent = expanded
              ? 'Ringkas daftar pengalaman'
              : `Lihat semua pengalaman (${total})`;
          };

          expToggle.addEventListener('click', () => {
            expanded = !expanded;
            updateToggleState();
          });

          updateToggleState();
        }
      }
    }
  }

  if (techGrid && Array.isArray(techStack)) {
    const viewport = techGrid.parentElement;
    const mm = gsap.matchMedia();

    const populate = (withClone) => {
      techGrid.replaceChildren();
      for (const tool of techStack) {
        techGrid.appendChild(buildTechPill(tool, false));
      }
      if (withClone) {
        for (const tool of techStack) {
          techGrid.appendChild(buildTechPill(tool, true));
        }
      }
    };

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      populate(true);
      const marqueeTween = gsap.to(techGrid, {
        xPercent: -50,
        duration: 22,
        ease: 'none',
        repeat: -1,
      });

      const pause = () => {
        gsap.to(marqueeTween, {
          timeScale: 0,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const resume = () => {
        gsap.to(marqueeTween, {
          timeScale: 1,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      if (viewport) {
        viewport.addEventListener('pointerenter', pause);
        viewport.addEventListener('pointerleave', resume);
        viewport.addEventListener('focusin', pause);
        viewport.addEventListener('focusout', resume);
      }

      return () => {
        marqueeTween.kill();
        if (viewport) {
          viewport.removeEventListener('pointerenter', pause);
          viewport.removeEventListener('pointerleave', resume);
          viewport.removeEventListener('focusin', pause);
          viewport.removeEventListener('focusout', resume);
        }
        gsap.set(techGrid, { clearProps: 'transform' });
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      populate(false);
    });
  }
}
