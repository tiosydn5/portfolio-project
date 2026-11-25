import { supabase } from '../lib/supabase.js';
import { createEl } from '../lib/sanitize.js';
import {
  closeSlideDrawer,
  confirmAction,
  createFieldGroup,
  createSegmentedControl,
  openSlideDrawer,
  renderEmptyState,
  renderErrorState,
  renderLoadingState,
  showToast,
  studioIcon,
} from './admin-ui.js';

export async function mountTimelineCrud(container, { onDataChange } = {}) {
  renderLoadingState(container, 'Memuat riwayat pendidikan dan pengalaman...');

  let entries = [];
  let activeType = 'all';

  function openTimelineDrawer(editingItem = null) {
    const form = createEl('form', {
      className: 'space-y-5',
      attrs: { id: 'timeline-drawer-form', novalidate: '' },
    });

    const typeSeg = createSegmentedControl({
      ariaLabel: 'Jenis riwayat',
      value: editingItem?.type || (activeType === 'education' ? 'education' : 'experience'),
      options: [
        { value: 'experience', label: 'Experience' },
        { value: 'education', label: 'Education' },
      ],
    });

    const typeWrap = createEl(
      'div',
      { className: 'space-y-1.5' },
      createEl('p', { className: 'text-sm font-semibold text-[#0B0F19]', text: 'Kategori Riwayat' }),
      typeSeg.el
    );

    const orgInput = createEl('input', {
      className: 'studio-input',
      attrs: {
        id: 'tl-org',
        type: 'text',
        required: '',
        placeholder: 'Nama perusahaan, studio, atau institusi',
        value: editingItem?.organization || '',
      },
    });

    const roleInput = createEl('input', {
      className: 'studio-input',
      attrs: {
        id: 'tl-role',
        type: 'text',
        required: '',
        placeholder: 'Peran kerja atau program studi',
        value: editingItem?.role || '',
      },
    });

    const periodInput = createEl('input', {
      className: 'studio-input font-mono-tabular',
      attrs: {
        id: 'tl-period',
        type: 'text',
        required: '',
        placeholder: '2024 - Sekarang',
        value: editingItem?.period || '',
      },
    });

    const sortInput = createEl('input', {
      className: 'studio-input font-mono-tabular',
      attrs: {
        id: 'tl-sort',
        type: 'number',
        value: String(editingItem?.sort_order ?? 0),
      },
    });

    const descInput = createEl('textarea', {
      className: 'studio-input resize-y',
      attrs: {
        id: 'tl-desc',
        rows: '3',
        placeholder: 'Ringkasan aktivitas, pencapaian, atau fokus utama...',
      },
    });
    descInput.value = editingItem?.description || '';

    const periodGrid = createEl(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      createFieldGroup('tl-period', 'Periode', periodInput),
      createFieldGroup('tl-sort', 'Prioritas Tampil', sortInput, 'Angka kecil tampil lebih atas.')
    );

    form.append(
      typeWrap,
      createFieldGroup('tl-role', 'Peran / Program Studi', roleInput),
      createFieldGroup('tl-org', 'Institusi / Organisasi', orgInput),
      periodGrid,
      createFieldGroup('tl-desc', 'Ringkasan Aktivitas', descInput)
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
        attrs: { type: 'submit', form: 'timeline-drawer-form' },
      },
      studioIcon('check', 'w-4 h-4'),
      createEl('span', { text: editingItem ? 'Simpan Perubahan' : 'Simpan Riwayat' })
    );

    const footerEl = createEl('div', { className: 'flex items-center gap-2.5' }, cancelBtn, submitBtn);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        type: typeSeg.getValue(),
        organization: orgInput.value.trim(),
        role: roleInput.value.trim(),
        period: periodInput.value.trim(),
        description: descInput.value.trim(),
        sort_order: Number.parseInt(sortInput.value || '0', 10) || 0,
      };

      if (payload.organization.length < 2 || payload.role.length < 2 || payload.period.length < 2) {
        showToast('Peran, institusi, dan periode wajib diisi.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';

      try {
        if (editingItem) {
          const { error: upErr } = await supabase
            .from('timeline_entries')
            .update(payload)
            .eq('id', editingItem.id);
          if (upErr) throw upErr;
          showToast('Riwayat berhasil diperbarui.', 'success');
        } else {
          const { error: insErr } = await supabase.from('timeline_entries').insert(payload);
          if (insErr) throw insErr;
          showToast('Riwayat baru berhasil ditambahkan.', 'success');
        }
        closeSlideDrawer();
        await fetchAndRender();
        if (typeof onDataChange === 'function') onDataChange();
      } catch (err) {
        showToast(err?.message || 'Gagal menyimpan riwayat.', 'error');
        submitBtn.disabled = false;
        submitBtn.replaceChildren(
          studioIcon('check', 'w-4 h-4'),
          createEl('span', { text: editingItem ? 'Simpan Perubahan' : 'Simpan Riwayat' })
        );
      }
    });

    openSlideDrawer({
      title: editingItem ? 'Sunting Riwayat' : 'Tambah Riwayat Baru',
      subtitle: editingItem
        ? `Perbarui entri "${editingItem.role}".`
        : 'Tambahkan pengalaman kerja atau pendidikan ke linimasa publik.',
      contentEl: form,
      footerEl,
    });
  }

  function renderView() {
    const addBtn = createEl(
      'button',
      { className: 'studio-btn-primary text-sm shrink-0', attrs: { type: 'button' } },
      studioIcon('plus', 'w-4 h-4'),
      createEl('span', { text: 'Tambah Riwayat' })
    );
    addBtn.addEventListener('click', () => openTimelineDrawer(null));

    const filterSeg = createSegmentedControl({
      ariaLabel: 'Filter jenis riwayat',
      value: activeType,
      options: [
        { value: 'all', label: 'Semua', badge: entries.length },
        {
          value: 'experience',
          label: 'Experience',
          badge: entries.filter((e) => e.type === 'experience').length,
        },
        {
          value: 'education',
          label: 'Education',
          badge: entries.filter((e) => e.type === 'education').length,
        },
      ],
      onChange: (nextVal) => {
        activeType = nextVal;
        renderFeed();
      },
    });

    const toolbarCard = createEl(
      'div',
      { className: 'studio-card p-5 sm:p-6 space-y-4' },
      createEl(
        'div',
        { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4' },
        createEl(
          'div',
          { className: 'space-y-1' },
          createEl('h2', {
            className: 'font-display text-2xl font-bold text-[#0B0F19]',
            text: 'Riwayat Pendidikan & Pengalaman',
          }),
          createEl('p', {
            className: 'text-sm text-[#475569]',
            text: 'Susun perjalanan akademik dan pengalaman profesional secara kronologis.',
          })
        ),
        addBtn
      ),
      createEl(
        'div',
        { className: 'pt-4 border-t border-[rgba(15,23,42,0.12)]' },
        filterSeg.el
      )
    );

    const feedMount = createEl('div', { className: 'space-y-3' });

    function renderFeed() {
      const filtered =
        activeType === 'all' ? entries : entries.filter((e) => e.type === activeType);

      if (filtered.length === 0) {
        renderEmptyState(
          feedMount,
          'Belum ada riwayat pada kategori ini. Tambahkan entri baru agar profil lebih lengkap.',
          {
            title: 'Riwayat masih kosong',
            actionLabel: 'Tambah Riwayat',
            onAction: () => openTimelineDrawer(null),
          }
        );
        return;
      }

      const list = createEl('div', { className: 'space-y-3' });

      for (const entry of filtered) {
        const isEdu = entry.type === 'education';

        const editBtn = createEl(
          'button',
          { className: 'studio-btn-secondary text-xs min-h-[40px] px-3.5', attrs: { type: 'button' } },
          studioIcon('edit', 'w-3.5 h-3.5'),
          createEl('span', { text: 'Sunting' })
        );
        editBtn.addEventListener('click', () => openTimelineDrawer(entry));

        const delBtn = createEl(
          'button',
          {
            className: 'studio-icon-btn studio-icon-btn-danger w-10 h-10 min-w-[40px] min-h-[40px]',
            attrs: { type: 'button', 'aria-label': `Hapus ${entry.role}` },
          },
          studioIcon('trash', 'w-4 h-4')
        );
        delBtn.addEventListener('click', async () => {
          const ok = await confirmAction({
            title: 'Hapus Riwayat',
            message: `Yakin ingin menghapus "${entry.role}" di ${entry.organization}?`,
          });
          if (!ok) return;
          delBtn.disabled = true;
          const { error: delErr } = await supabase
            .from('timeline_entries')
            .delete()
            .eq('id', entry.id);
          if (delErr) showToast(delErr.message, 'error');
          else showToast('Riwayat berhasil dihapus.', 'success');
          await fetchAndRender();
          if (typeof onDataChange === 'function') onDataChange();
        });

        const leftPeriod = createEl(
          'div',
          { className: 'sm:w-44 shrink-0 space-y-2' },
          createEl('span', {
            className: isEdu ? 'studio-pill studio-pill-periwinkle' : 'studio-pill studio-pill-sky',
            text: isEdu ? 'Education' : 'Experience',
          }),
          createEl('p', {
            className: 'font-mono-tabular text-sm font-semibold text-[#1D4ED8]',
            text: entry.period,
          })
        );

        const rightDetail = createEl(
          'div',
          {
            className:
              'flex-1 min-w-0 sm:pl-5 sm:border-l sm:border-[rgba(15,23,42,0.12)] space-y-1.5',
          },
          createEl('h3', {
            className: 'font-display text-lg font-bold text-[#0B0F19] leading-snug',
            text: entry.role,
          }),
          createEl('p', {
            className: 'text-sm font-semibold text-[#334155]',
            text: entry.organization,
          }),
          entry.description
            ? createEl('p', {
                className: 'text-sm text-[#475569] leading-relaxed pt-0.5',
                text: entry.description,
              })
            : null
        );

        const actions = createEl(
          'div',
          { className: 'flex items-center gap-2 shrink-0 self-start sm:self-center' },
          editBtn,
          delBtn
        );

        const card = createEl(
          'article',
          {
            className:
              'studio-card studio-card-hover p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4',
          },
          leftPeriod,
          rightDetail,
          actions
        );

        list.appendChild(card);
      }

      feedMount.replaceChildren(list);
    }

    renderFeed();
    container.replaceChildren(toolbarCard, feedMount);
  }

  async function fetchAndRender() {
    const { data, error } = await supabase
      .from('timeline_entries')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      renderErrorState(container, `Gagal memuat riwayat: ${error.message}`, () => fetchAndRender());
      return;
    }

    entries = data || [];
    renderView();
  }

  await fetchAndRender();
}
