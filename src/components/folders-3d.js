import { gsap, scrollToSection } from '../lib/motion-engine.js';
import { createEl } from '../lib/sanitize.js';

function createMiniPreviewCard(sheet, slotIndex) {
  const card = createEl('div', {
    className: 'folder-sheet p-3 flex flex-col justify-between',
    attrs: { 'aria-hidden': 'true' },
    dataset: { slot: String(slotIndex) },
  });

  const topLine = createEl(
    'div',
    { className: 'flex items-center justify-between gap-2 pb-1.5 border-b border-[rgba(15,23,42,0.14)]' },
    createEl('span', {
      className: 'font-mono-tabular text-[11px] font-semibold text-[#1D4ED8]',
      text: sheet.code,
    }),
    createEl('span', {
      className: 'w-5 h-2 rounded-full bg-[#2563EB]',
    })
  );

  const wireBlock = createEl(
    'div',
    { className: 'space-y-1.5 my-1' },
    createEl('div', { className: 'h-2 w-4/5 rounded bg-[#DBEAFE]' }),
    createEl('div', { className: 'h-2 w-3/5 rounded bg-[#E0E7FF]' })
  );

  const caption = createEl('span', {
    className: 'text-xs font-semibold text-[#0B0F19] truncate',
    text: sheet.label,
  });

  card.append(topLine, wireBlock, caption);
  return card;
}

export function initFolders3D({ folders }) {
  const container = document.getElementById('folders-grid');
  if (!container) return;

  container.replaceChildren();

  for (const folder of folders) {
    const button = createEl('button', {
      className: 'folder-card group',
      attrs: {
        type: 'button',
        'aria-label': `Buka Showcase tab ${folder.title} (${folder.countText})`,
      },
      dataset: { category: folder.category },
    });

    const backplate = createEl('div', { className: 'folder-backplate' });
    const tabEar = createEl('div', {
      className: 'folder-tab-ear',
      attrs: { 'aria-hidden': 'true' },
    });

    const sheetsWrap = createEl('div', {
      className: 'folder-sheets',
      attrs: { 'aria-hidden': 'true' },
    });
    folder.sheets.slice(0, 3).forEach((sheet, idx) => {
      sheetsWrap.appendChild(createMiniPreviewCard(sheet, idx));
    });

    const flap = createEl('div', { className: 'folder-flap' });

    const topRow = createEl(
      'div',
      { className: 'flex items-center justify-between gap-2 w-full' },
      createEl('span', {
        className: 'font-mono-tabular text-xs font-medium text-[#FFFFFF]',
        text: folder.countText,
      }),
      createEl('span', {
        className: 'font-mono-tabular text-xs font-medium text-[#FFFFFF]',
        text: 'Buka tab',
      })
    );

    const bottomRow = createEl(
      'div',
      { className: 'text-left' },
      createEl('h4', {
        className: 'font-display text-xl font-bold text-[#FFFFFF] leading-tight',
        text: folder.title,
      }),
      createEl('p', {
        className: 'text-xs sm:text-sm text-[#FFFFFF] mt-0.5 leading-snug',
        text: folder.subtitle,
      })
    );

    flap.append(topRow, bottomRow);
    backplate.append(tabEar, sheetsWrap, flap);
    button.appendChild(backplate);

    button.addEventListener('click', () => {
      window.dispatchEvent(
        new CustomEvent('showcase:select-tab', {
          detail: { category: folder.category },
        })
      );
      scrollToSection('#portfolio');
    });

    container.appendChild(button);
  }

  // GSAP True 3D Fan-Out Choreography (Desktop Fine Pointer + Focus)
  const mm = gsap.matchMedia();

  mm.add(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    () => {
      const cards = gsap.utils.toArray('.folder-card', container);
      const cleanups = [];

      const fanStates = [
        { x: -34, y: -52, rotation: -14 },
        { x: 0, y: -66, rotation: 0 },
        { x: 34, y: -50, rotation: 14 },
      ];

      const restStates = [
        { x: 0, y: 12, rotation: -4 },
        { x: 0, y: 6, rotation: 0 },
        { x: 0, y: 14, rotation: 5 },
      ];

      for (const card of cards) {
        const flap = card.querySelector('.folder-flap');
        const sheets = Array.from(card.querySelectorAll('.folder-sheet'));

        const openFolder = () => {
          if (flap) {
            gsap.to(flap, {
              rotationX: -38,
              duration: 0.48,
              ease: 'back.out(1.7)',
              overwrite: 'auto',
            });
          }
          sheets.forEach((sheet, idx) => {
            const target = fanStates[idx] || fanStates[1];
            gsap.to(sheet, {
              x: target.x,
              y: target.y,
              rotation: target.rotation,
              duration: 0.54,
              ease: 'back.out(1.7)',
              overwrite: 'auto',
            });
          });
        };

        const closeFolder = () => {
          if (flap) {
            gsap.to(flap, {
              rotationX: 0,
              duration: 0.4,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          }
          sheets.forEach((sheet, idx) => {
            const target = restStates[idx] || restStates[1];
            gsap.to(sheet, {
              x: target.x,
              y: target.y,
              rotation: target.rotation,
              duration: 0.42,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          });
        };

        card.addEventListener('mouseenter', openFolder);
        card.addEventListener('mouseleave', closeFolder);
        card.addEventListener('focusin', openFolder);
        card.addEventListener('focusout', closeFolder);

        cleanups.push(() => {
          card.removeEventListener('mouseenter', openFolder);
          card.removeEventListener('mouseleave', closeFolder);
          card.removeEventListener('focusin', openFolder);
          card.removeEventListener('focusout', closeFolder);
          if (flap) gsap.set(flap, { clearProps: 'transform' });
          gsap.set(sheets, { clearProps: 'transform' });
        });
      }

      return () => {
        for (const fn of cleanups) fn();
      };
    }
  );
}
