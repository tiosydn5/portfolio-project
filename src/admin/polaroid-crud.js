import { supabase } from '../lib/supabase.js';
import { createEl, safeUrl } from '../lib/sanitize.js';
import {
  confirmAction,
  createMediaUploadField,
  renderEmptyState,
  renderErrorState,
  renderLoadingState,
  showToast,
} from './admin-ui.js';

export async function mountPolaroidCrud(container) {
  renderLoadingState(container, 'Memuat polaroid_photos...');

  let editingId = null;

  async function refresh() {
    const { data, error } = await supabase
      .from('polaroid_photos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      renderErrorState(container, `Gagal memuat polaroid_photos: ${error.message}`, () => refresh());
      return;
    }

    const photos = data || [];
    const editingItem = editingId ? photos.find((p) => p.id === editingId) || null : null;

    const form = createEl('form', { className: 'admin-panel p-6 space-y-5', attrs: { novalidate: '' } });

    const header = createEl(
      'div',
      { className: 'flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(148,163,184,0.16)]' },
      createEl('h2', {
        className: 'font-display text-xl font-bold text-[#F8FAFC]',
        text: editingItem ? 'Sunting Foto Polaroid' : 'Tambah Foto Polaroid',
      }),
      editingItem
        ? createEl('button', { className: 'admin-btn-secondary text-xs', text: 'Batal Sunting', attrs: { type: 'button' } })
        : null
    );
    if (editingItem) {
      header.querySelector('button')?.addEventListener('click', () => {
        editingId = null;
        refresh();
      });
    }

    const mediaField = createMediaUploadField({
      id: 'pl-image-url',
      label: 'Photo Image URL',
      initialUrl: editingItem?.image_url || '',
      folder: 'polaroid',
    });

    const captionInput = createEl('input', {
      className: 'admin-input',
      attrs: { id: 'pl-caption', type: 'text', required: '', maxlength: '120', placeholder: 'Keterangan singkat foto (maks 120 karakter)', value: editingItem?.caption || '' },
    });

    const rotInput = createEl('input', {
      className: 'admin-input font-mono-tabular',
      attrs: { id: 'pl-rotation', type: 'number', min: '-25', max: '25', value: String(editingItem?.rotation_deg ?? -6) },
    });

    const sortInput = createEl('input', {
      className: 'admin-input font-mono-tabular',
      attrs: { id: 'pl-sort', type: 'number', value: String(editingItem?.sort_order ?? 0) },
    });

    const wrap = (id, label, el) =>
      createEl(
        'div',
        { className: 'space-y-1.5' },
        createEl('label', { className: 'block text-sm font-medium text-[#F8FAFC]', text: label, attrs: { for: id } }),
        el
      );

    const grid = createEl(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4' },
      createEl('div', { className: 'sm:col-span-3' }, wrap('pl-caption', 'Caption', captionInput)),
      wrap('pl-rotation', 'Rotasi (-25 sampai 25 deg)', rotInput),
      wrap('pl-sort', 'Urutan (sort_order)', sortInput)
    );

    const submitBtn = createEl('button', {
      className: 'admin-btn-primary',
      text: editingItem ? 'Simpan Perubahan' : 'Tambah Foto',
      attrs: { type: 'submit' },
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const imageUrl = mediaField.getValue();
      const caption = captionInput.value.trim();
      const rotationDeg = Number.parseInt(rotInput.value || '0', 10);
      const sortOrder = Number.parseInt(sortInput.value || '0', 10) || 0;

      if (!imageUrl || !safeUrl(imageUrl)) {
        showToast('Upload gambar atau masukkan URL gambar yang valid.', 'error');
        return;
      }

      if (caption.length < 1 || caption.length > 120) {
        showToast('Caption wajib diisi (1 sampai 120 karakter).', 'error');
        captionInput.focus();
        return;
      }

      if (Number.isNaN(rotationDeg) || rotationDeg < -25 || rotationDeg > 25) {
        showToast('Nilai rotasi harus antara -25 hingga 25 derajat.', 'error');
        rotInput.focus();
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
          showToast('Foto polaroid diperbarui.', 'success');
          editingId = null;
        } else {
          const { error: insErr } = await supabase.from('polaroid_photos').insert(payload);
          if (insErr) throw insErr;
          showToast('Foto polaroid ditambahkan.', 'success');
        }
        await refresh();
      } catch (err) {
        showToast(err?.message || 'Gagal menyimpan foto polaroid.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingItem ? 'Simpan Perubahan' : 'Tambah Foto';
      }
    });

    form.append(header, mediaField.el, grid, submitBtn);

    const listWrap = createEl('div');
    if (photos.length === 0) {
      renderEmptyState(listWrap, 'Belum ada foto di tabel polaroid_photos.');
    } else {
      const box = createEl('div', { className: 'admin-panel px-5' });
      for (const item of photos) {
        const row = createEl('div', {
          className: 'admin-row py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4',
        });

        const thumbUrl = safeUrl(item.image_url);
        const left = createEl(
          'div',
          { className: 'flex items-center gap-3 min-w-0' },
          thumbUrl
            ? createEl('img', {
                className: 'w-16 h-12 rounded-lg object-cover bg-[#151B28] border border-[rgba(148,163,184,0.2)] shrink-0',
                attrs: { src: thumbUrl, alt: item.caption, width: '64', height: '48' },
              })
            : null,
          createEl(
            'div',
            { className: 'min-w-0 space-y-1' },
            createEl('p', { className: 'text-sm font-semibold text-[#F8FAFC] truncate', text: item.caption }),
            createEl('p', {
              className: 'font-mono-tabular text-xs text-[#7B8CA4]',
              text: `Rot: ${item.rotation_deg}deg · Order: ${item.sort_order}`,
            })
          )
        );

        const editBtn = createEl('button', {
          className: 'admin-btn-secondary text-xs px-3',
          text: 'Edit',
          attrs: { type: 'button' },
        });
        editBtn.addEventListener('click', () => {
          editingId = item.id;
          refresh();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const delBtn = createEl('button', {
          className: 'admin-btn-danger text-xs px-3',
          text: 'Hapus',
          attrs: { type: 'button' },
        });
        delBtn.addEventListener('click', async () => {
          const ok = await confirmAction({
            title: 'Hapus Foto Polaroid',
            message: `Yakin ingin menghapus foto "${item.caption}"?`,
          });
          if (!ok) return;
          const { error: delErr } = await supabase.from('polaroid_photos').delete().eq('id', item.id);
          if (delErr) showToast(delErr.message, 'error');
          else showToast('Foto polaroid dihapus.', 'success');
          if (editingId === item.id) editingId = null;
          await refresh();
        });

        row.append(left, createEl('div', { className: 'flex items-center gap-2 shrink-0' }, editBtn, delBtn));
        box.appendChild(row);
      }
      listWrap.appendChild(box);
    }

    container.replaceChildren(form, listWrap);
  }

  await refresh();
}
