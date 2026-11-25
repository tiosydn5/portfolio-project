import { supabase } from '../lib/supabase.js';
import { assetUrl, createEl, safeUrl } from '../lib/sanitize.js';
import {
  closeSlideDrawer,
  confirmAction,
  createFieldGroup,
  createMediaDropzone,
  openSlideDrawer,
  renderEmptyState,
  renderErrorState,
  renderLoadingState,
  showToast,
  studioIcon,
} from './admin-ui.js';

function formatDeg(deg) {
  const num = Number(deg) || 0;
  return num > 0 ? `+${num}°` : `${num}°`;
}

export async function mountPolaroidCrud(container, { onDataChange } = {}) {
  renderLoadingState(container, 'Memuat koleksi foto polaroid...');

  let photos = [];

  function openPolaroidDrawer(editingItem = null) {
    const form = createEl('form', {
      className: 'space-y-5',
      attrs: { id: 'polaroid-drawer-form', novalidate: '' },
    });

    const initialRot = typeof editingItem?.rotation_deg === 'number' ? editingItem.rotation_deg : -6;
    const initialUrl = editingItem?.image_url || '';
    const initialCaption = editingItem?.caption || '';

    // Live Rotated Polaroid Mini-Preview
    const liveImg = createEl('img', {
      className: 'w-full aspect-[4/3] object-cover rounded-lg border-[1.5px] border-[#0F172A] bg-[#DBEAFE] block',
      attrs: {
        src: safeUrl(initialUrl) || assetUrl('/assets/polaroid/polaroid-01.svg'),
        alt: 'Pratinjau polaroid',
      },
    });
    const liveCaption = createEl('p', {
      className: 'text-xs font-semibold text-[#0B0F19] truncate pt-2 px-0.5',
      text: initialCaption || 'Keterangan foto tampil di sini',
    });
    const liveDegTag = createEl('span', {
      className: 'font-mono-tabular text-[11px] font-semibold text-[#1D4ED8]',
      text: formatDeg(initialRot),
    });

    const previewCard = createEl(
      'div',
      {
        className:
          'w-52 bg-[#FFFFFF] border-[1.5px] border-[#0F172A] rounded-2xl p-2.5 shadow-sm transition-transform duration-150',
      },
      liveImg,
      createEl(
        'div',
        { className: 'flex items-center justify-between gap-2 pt-2 px-0.5' },
        createEl('span', { className: 'font-mono-tabular text-[11px] text-[#475569]', text: 'PREVIEW' }),
        liveDegTag
      ),
      liveCaption
    );
    previewCard.style.transform = `rotate(${initialRot}deg)`;

    const previewStage = createEl(
      'div',
      {
        className:
          'rounded-2xl bg-[#E0E7FF] border-[1.5px] border-[#0F172A] py-5 px-4 flex items-center justify-center overflow-hidden',
      },
      previewCard
    );

    const mediaDropzone = createMediaDropzone({
      id: 'pl-image-url',
      label: 'Foto Dokumentasi',
      hint: 'Rasio 4:3 disarankan · JPG, PNG, WebP, AVIF (Maks. 5 MB)',
      initialUrl,
      folder: 'polaroid',
      aspectClass: 'aspect-[16/9]',
      onUrlChange: (nextUrl) => {
        liveImg.src = safeUrl(nextUrl) || assetUrl('/assets/polaroid/polaroid-01.svg');
      },
    });

    const captionInput = createEl('input', {
      className: 'studio-input',
      attrs: {
        id: 'pl-caption',
        type: 'text',
        required: '',
        maxlength: '120',
        placeholder: 'Keterangan singkat foto (maks. 120 karakter)',
        value: initialCaption,
      },
    });

    const charCounter = createEl('span', {
      className: 'font-mono-tabular text-xs font-medium text-[#475569]',
      text: `${initialCaption.length} / 120`,
    });

    captionInput.addEventListener('input', () => {
      charCounter.textContent = `${captionInput.value.length} / 120`;
      liveCaption.textContent = captionInput.value.trim() || 'Keterangan foto tampil di sini';
    });

    const captionBlock = createEl(
      'div',
      { className: 'space-y-1.5' },
      createEl(
        'div',
        { className: 'flex items-center justify-between gap-2' },
        createEl('label', {
          className: 'block text-sm font-semibold text-[#0B0F19]',
          text: 'Keterangan Foto',
          attrs: { for: 'pl-caption' },
        }),
        charCounter
      ),
      captionInput
    );

    // Interactive Rotation Range Slider (-25 to +25 deg)
    const rotSlider = createEl('input', {
      className: 'studio-range',
      attrs: {
        id: 'pl-rotation',
        type: 'range',
        min: '-25',
        max: '25',
        step: '1',
        value: String(initialRot),
      },
    });

    const rotReadout = createEl('span', {
      className: 'studio-pill studio-pill-sky',
      text: formatDeg(initialRot),
    });

    const resetRotBtn = createEl('button', {
      className: 'text-xs font-semibold text-[#1D4ED8] hover:underline px-1.5 py-1',
      text: 'Reset 0°',
      attrs: { type: 'button' },
    });

    function syncRotation(val) {
      const clamped = Math.max(-25, Math.min(25, Number.parseInt(val, 10) || 0));
      rotSlider.value = String(clamped);
      rotReadout.textContent = formatDeg(clamped);
      liveDegTag.textContent = formatDeg(clamped);
      previewCard.style.transform = `rotate(${clamped}deg)`;
    }

    rotSlider.addEventListener('input', () => syncRotation(rotSlider.value));
    resetRotBtn.addEventListener('click', () => syncRotation(0));

    const rotationBlock = createEl(
      'div',
      { className: 'space-y-3 pt-1' },
      createEl(
        'div',
        { className: 'flex items-center justify-between gap-2' },
        createEl('label', {
          className: 'block text-sm font-semibold text-[#0B0F19]',
          text: 'Sudut Kemiringan Kartu',
          attrs: { for: 'pl-rotation' },
        }),
        createEl('div', { className: 'flex items-center gap-2' }, resetRotBtn, rotReadout)
      ),
      previewStage,
      rotSlider,
      createEl(
        'div',
        { className: 'flex items-center justify-between font-mono-tabular text-xs text-[#475569]' },
        createEl('span', { text: '-25°' }),
        createEl('span', { text: '0°' }),
        createEl('span', { text: '+25°' })
      )
    );

    const sortInput = createEl('input', {
      className: 'studio-input font-mono-tabular',
      attrs: {
        id: 'pl-sort',
        type: 'number',
        value: String(editingItem?.sort_order ?? 0),
      },
    });

    form.append(
      mediaDropzone.el,
      captionBlock,
      rotationBlock,
      createFieldGroup('pl-sort', 'Prioritas Tampil', sortInput, 'Angka lebih kecil tampil lebih awal.')
    );

    const cancelBtn = createEl('button', {
      className: 'studio-btn-secondary text-sm',
      text: 'Batal',
      attrs: { type: 'button' },
    });
    cancelBtn.addEventListener('click', closeSlideDrawer);

    const submitBtn = createEl(
      'button',
      {
        className: 'studio-btn-primary text-sm',
        attrs: { type: 'submit', form: 'polaroid-drawer-form' },
      },
      studioIcon('check', 'w-4 h-4'),
      createEl('span', { text: editingItem ? 'Simpan Perubahan' : 'Simpan Foto' })
    );

    const footerEl = createEl('div', { className: 'flex items-center gap-2.5' }, cancelBtn, submitBtn);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const imageUrl = mediaDropzone.getValue();
      const caption = captionInput.value.trim();
      const rotationDeg = Number.parseInt(rotSlider.value || '0', 10);
      const sortOrder = Number.parseInt(sortInput.value || '0', 10) || 0;

      if (!imageUrl || !safeUrl(imageUrl)) {
        showToast('Unggah foto atau masukkan tautan gambar yang valid.', 'error');
        return;
      }

      if (caption.length < 1 || caption.length > 120) {
        showToast('Keterangan foto wajib diisi (1 sampai 120 karakter).', 'error');
        captionInput.focus();
        return;
      }

      if (Number.isNaN(rotationDeg) || rotationDeg < -25 || rotationDeg > 25) {
        showToast('Sudut kemiringan harus antara -25° hingga +25°.', 'error');
        rotSlider.focus();
        return;
      }

      const payload = {
        image_url: imageUrl,
        caption,
        rotation_deg: rotationDeg,
        sort_order: sortOrder,
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';

      try {
        if (editingItem) {
          const { error: upErr } = await supabase
            .from('polaroid_photos')
            .update(payload)
            .eq('id', editingItem.id);
          if (upErr) throw upErr;
          showToast('Foto polaroid berhasil diperbarui.', 'success');
        } else {
          const { error: insErr } = await supabase.from('polaroid_photos').insert(payload);
          if (insErr) throw insErr;
          showToast('Foto polaroid baru ditambahkan.', 'success');
        }
        closeSlideDrawer();
        await fetchAndRender();
        if (typeof onDataChange === 'function') onDataChange();
      } catch (err) {
        showToast(err?.message || 'Gagal menyimpan foto polaroid.', 'error');
        submitBtn.disabled = false;
        submitBtn.replaceChildren(
          studioIcon('check', 'w-4 h-4'),
          createEl('span', { text: editingItem ? 'Simpan Perubahan' : 'Simpan Foto' })
        );
      }
    });

    openSlideDrawer({
      title: editingItem ? 'Sunting Foto Polaroid' : 'Tambah Foto Polaroid',
      subtitle: 'Atur gambar, keterangan singkat, dan sudut kemiringan kartu.',
      contentEl: form,
      footerEl,
    });
  }

  function renderView() {
    const addBtn = createEl(
      'button',
      { className: 'studio-btn-primary text-sm shrink-0', attrs: { type: 'button' } },
      studioIcon('plus', 'w-4 h-4'),
      createEl('span', { text: 'Tambah Foto' })
    );
    addBtn.addEventListener('click', () => openPolaroidDrawer(null));

    const toolbarCard = createEl(
      'div',
      {
        className:
          'studio-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
      },
      createEl(
        'div',
        { className: 'space-y-1' },
        createEl('h2', {
          className: 'font-display text-2xl font-bold text-[#0B0F19]',
          text: 'Galeri Polaroid',
        }),
        createEl('p', {
          className: 'text-sm text-[#475569]',
          text: 'Kartu langsung menampilkan sudut kemiringan aslinya. Arahkan kursor untuk meluruskan.',
        })
      ),
      addBtn
    );

    const galleryWrap = createEl('div');

    if (photos.length === 0) {
      renderEmptyState(
        galleryWrap,
        'Belum ada foto dokumentasi di galeri Polaroid. Tambahkan foto pertama Anda.',
        {
          title: 'Galeri masih kosong',
          actionLabel: 'Tambah Foto',
          onAction: () => openPolaroidDrawer(null),
        }
      );
    } else {
      const board = createEl('div', {
        className: 'studio-card studio-card-periwinkle p-6 sm:p-8',
      });

      const grid = createEl('div', {
        className: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7',
      });

      for (const item of photos) {
        const deg = typeof item.rotation_deg === 'number' ? item.rotation_deg : 0;
        const card = createEl('article', { className: 'studio-polaroid-card flex flex-col justify-between gap-3' });
        card.style.setProperty('--card-rot', `${deg}deg`);

        const imgSrc = safeUrl(item.image_url) || assetUrl('/assets/polaroid/polaroid-01.svg');
        const photoFrame = createEl(
          'div',
          { className: 'rounded-xl overflow-hidden border-[1.5px] border-[#0F172A] bg-[#DBEAFE]' },
          createEl('img', {
            className: 'w-full aspect-[4/3] object-cover block',
            attrs: {
              src: imgSrc,
              alt: item.caption,
              loading: 'lazy',
            },
          })
        );

        const metaRow = createEl(
          'div',
          { className: 'flex items-center justify-between gap-2 px-1' },
          createEl('span', {
            className: 'font-mono-tabular text-xs font-semibold text-[#1D4ED8]',
            text: formatDeg(deg),
          }),
          createEl('span', {
            className: 'font-mono-tabular text-xs text-[#475569]',
            text: `#${item.sort_order ?? 0}`,
          })
        );

        const captionEl = createEl('p', {
          className: 'text-sm font-semibold text-[#0B0F19] leading-snug px-1',
          text: item.caption,
        });

        const editBtn = createEl(
          'button',
          { className: 'studio-btn-secondary text-xs min-h-[38px] px-3 flex-1', attrs: { type: 'button' } },
          studioIcon('edit', 'w-3.5 h-3.5'),
          createEl('span', { text: 'Sunting' })
        );
        editBtn.addEventListener('click', () => openPolaroidDrawer(item));

        const delBtn = createEl(
          'button',
          {
            className: 'studio-icon-btn studio-icon-btn-danger w-10 h-10 min-w-[40px] min-h-[40px]',
            attrs: { type: 'button', 'aria-label': `Hapus foto ${item.caption}` },
          },
          studioIcon('trash', 'w-4 h-4')
        );
        delBtn.addEventListener('click', async () => {
          const ok = await confirmAction({
            title: 'Hapus Foto Polaroid',
            message: `Yakin ingin menghapus foto "${item.caption}" secara permanen?`,
          });
          if (!ok) return;
          delBtn.disabled = true;
          const { error: delErr } = await supabase
            .from('polaroid_photos')
            .delete()
            .eq('id', item.id);
          if (delErr) showToast(delErr.message, 'error');
          else showToast('Foto polaroid dihapus.', 'success');
          await fetchAndRender();
          if (typeof onDataChange === 'function') onDataChange();
        });

        const actions = createEl(
          'div',
          { className: 'flex items-center gap-2 pt-2 border-t border-[rgba(15,23,42,0.12)]' },
          editBtn,
          delBtn
        );

        card.append(photoFrame, createEl('div', { className: 'space-y-1' }, metaRow, captionEl), actions);
        grid.appendChild(card);
      }

      board.appendChild(grid);
      galleryWrap.appendChild(board);
    }

    container.replaceChildren(toolbarCard, galleryWrap);
  }

  async function fetchAndRender() {
    const { data, error } = await supabase
      .from('polaroid_photos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      renderErrorState(container, `Gagal memuat galeri polaroid: ${error.message}`, () => fetchAndRender());
      return;
    }

    photos = data || [];
    renderView();
  }

  await fetchAndRender();
}
