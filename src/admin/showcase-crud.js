import { supabase } from '../lib/supabase.js';
import { assetUrl, createEl, safeUrl } from '../lib/sanitize.js';
import {
  closeSlideDrawer,
  confirmAction,
  createFieldGroup,
  createMediaDropzone,
  createSegmentedControl,
  createToggleSwitch,
  openSlideDrawer,
  renderEmptyState,
  renderErrorState,
  renderLoadingState,
  showToast,
  studioIcon,
} from './admin-ui.js';

const CATEGORY_LABELS = {
  project: 'Project',
  certificate: 'Certificate',
  award: 'Award',
};

export async function mountShowcaseCrud(container, { onDataChange } = {}) {
  renderLoadingState(container, 'Memuat daftar karya & pencapaian...');

  let allItems = [];
  let activeFilter = 'all';
  let searchQuery = '';

  function openShowcaseDrawer(editingItem = null) {
    const form = createEl('form', {
      className: 'space-y-5',
      attrs: { id: 'showcase-drawer-form', novalidate: '' },
    });

    const categorySeg = createSegmentedControl({
      ariaLabel: 'Kategori karya',
      value: editingItem?.category || 'project',
      options: [
        { value: 'project', label: 'Project' },
        { value: 'certificate', label: 'Certificate' },
        { value: 'award', label: 'Award' },
      ],
    });

    const catWrap = createEl(
      'div',
      { className: 'space-y-1.5' },
      createEl('p', { className: 'text-sm font-semibold text-[#0B0F19]', text: 'Kategori' }),
      categorySeg.el
    );

    const thumbDropzone = createMediaDropzone({
      id: 'sc-thumbnail',
      label: 'Gambar Sampul',
      hint: 'Rasio 16:10 · JPG, PNG, WebP, atau AVIF (Maks. 5 MB)',
      initialUrl: editingItem?.thumbnail_url || '',
      folder: 'showcase',
      aspectClass: 'aspect-[16/10]',
    });

    const titleInput = createEl('input', {
      className: 'studio-input',
      attrs: {
        id: 'sc-title',
        type: 'text',
        required: '',
        placeholder: 'Contoh: Sistem Desain Cobalt',
        value: editingItem?.title || '',
      },
    });

    const subtitleInput = createEl('input', {
      className: 'studio-input',
      attrs: {
        id: 'sc-subtitle',
        type: 'text',
        placeholder: 'Ringkasan singkat 1 baris',
        value: editingItem?.subtitle || '',
      },
    });

    const descInput = createEl('textarea', {
      className: 'studio-input resize-y',
      attrs: {
        id: 'sc-desc',
        rows: '3',
        placeholder: 'Jelaskan detail karya, peran, atau pencapaian...',
      },
    });
    descInput.value = editingItem?.description || '';

    const tagsInput = createEl('input', {
      className: 'studio-input',
      attrs: {
        id: 'sc-tags',
        type: 'text',
        placeholder: 'Web Dev, Tailwind CSS, Alight Motion',
        value: Array.isArray(editingItem?.tech_tags) ? editingItem.tech_tags.join(', ') : '',
      },
    });

    const dateInput = createEl('input', {
      className: 'studio-input font-mono-tabular',
      attrs: {
        id: 'sc-date',
        type: 'text',
        placeholder: '2026',
        value: editingItem?.date_label || '',
      },
    });

    const sortInput = createEl('input', {
      className: 'studio-input font-mono-tabular',
      attrs: {
        id: 'sc-sort',
        type: 'number',
        value: String(editingItem?.sort_order ?? 0),
      },
    });

    const liveUrlInput = createEl('input', {
      className: 'studio-input font-mono-tabular text-sm',
      attrs: {
        id: 'sc-live-url',
        type: 'url',
        placeholder: 'https://...',
        value: editingItem?.live_url || '',
      },
    });

    const repoUrlInput = createEl('input', {
      className: 'studio-input font-mono-tabular text-sm',
      attrs: {
        id: 'sc-repo-url',
        type: 'url',
        placeholder: 'https://github.com/...',
        value: editingItem?.repo_url || '',
      },
    });

    const publishedSwitch = createToggleSwitch({
      id: 'sc-published',
      label: 'Tayang di halaman publik',
      description: 'Nonaktifkan jika ingin menyimpan sebagai draf.',
      checked: editingItem ? Boolean(editingItem.is_published) : true,
    });

    const featuredSwitch = createToggleSwitch({
      id: 'sc-featured',
      label: 'Tandai sebagai unggulan',
      description: 'Menyorot item pilihan di koleksi showcase.',
      checked: Boolean(editingItem?.is_featured),
    });

    const metaGrid = createEl(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      createFieldGroup('sc-date', 'Tahun / Tanggal', dateInput),
      createFieldGroup('sc-sort', 'Prioritas Tampil', sortInput, 'Angka lebih kecil tampil lebih awal.')
    );

    const linksGrid = createEl(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      createFieldGroup('sc-live-url', 'Tautan Live Demo (opsional)', liveUrlInput),
      createFieldGroup('sc-repo-url', 'Tautan Repository (opsional)', repoUrlInput)
    );

    const switchesBox = createEl(
      'div',
      { className: 'pt-4 border-t border-[rgba(15,23,42,0.12)] space-y-3' },
      publishedSwitch.el,
      featuredSwitch.el
    );

    form.append(
      catWrap,
      thumbDropzone.el,
      createFieldGroup('sc-title', 'Judul Karya / Pencapaian', titleInput),
      createFieldGroup('sc-subtitle', 'Ringkasan Singkat', subtitleInput),
      createFieldGroup('sc-desc', 'Deskripsi Detail', descInput),
      createFieldGroup('sc-tags', 'Label / Teknologi', tagsInput, 'Pisahkan dengan tanda koma.'),
      metaGrid,
      linksGrid,
      switchesBox
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
        attrs: { type: 'submit', form: 'showcase-drawer-form' },
      },
      studioIcon('check', 'w-4 h-4'),
      createEl('span', { text: editingItem ? 'Simpan Perubahan' : 'Simpan Karya' })
    );

    const footerEl = createEl('div', { className: 'flex items-center gap-2.5' }, cancelBtn, submitBtn);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const title = titleInput.value.trim();
      if (title.length < 2) {
        showToast('Judul minimal 2 karakter.', 'error');
        titleInput.focus();
        return;
      }

      const rawLive = liveUrlInput.value.trim();
      const rawRepo = repoUrlInput.value.trim();
      if (rawLive && !safeUrl(rawLive)) {
        showToast('Tautan Live Demo tidak valid (gunakan https://).', 'error');
        liveUrlInput.focus();
        return;
      }
      if (rawRepo && !safeUrl(rawRepo)) {
        showToast('Tautan Repository tidak valid (gunakan https://).', 'error');
        repoUrlInput.focus();
        return;
      }

      const techTags = tagsInput.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        category: categorySeg.getValue(),
        title,
        subtitle: subtitleInput.value.trim(),
        description: descInput.value.trim(),
        tech_tags: techTags,
        thumbnail_url: thumbDropzone.getValue(),
        live_url: rawLive || null,
        repo_url: rawRepo || null,
        date_label: dateInput.value.trim(),
        sort_order: Number.parseInt(sortInput.value || '0', 10) || 0,
        is_published: publishedSwitch.getValue(),
        is_featured: featuredSwitch.getValue(),
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Menyimpan...';

      try {
        if (editingItem) {
          const { error: upErr } = await supabase
            .from('showcase_items')
            .update(payload)
            .eq('id', editingItem.id);
          if (upErr) throw upErr;
          showToast(`"${title}" berhasil diperbarui.`, 'success');
        } else {
          const { error: insErr } = await supabase.from('showcase_items').insert(payload);
          if (insErr) throw insErr;
          showToast(`"${title}" berhasil ditambahkan.`, 'success');
        }
        closeSlideDrawer();
        await fetchAndRender();
        if (typeof onDataChange === 'function') onDataChange();
      } catch (err) {
        showToast(err?.message || 'Gagal menyimpan karya.', 'error');
        submitBtn.disabled = false;
        submitBtn.replaceChildren(
          studioIcon('check', 'w-4 h-4'),
          createEl('span', { text: editingItem ? 'Simpan Perubahan' : 'Simpan Karya' })
        );
      }
    });

    openSlideDrawer({
      title: editingItem ? 'Sunting Karya' : 'Tambah Karya Baru',
      subtitle: editingItem
        ? `Perbarui detail "${editingItem.title}".`
        : 'Tambahkan proyek, sertifikat, atau penghargaan ke koleksi publik.',
      contentEl: form,
      footerEl,
    });
  }

  function renderView() {
    const query = searchQuery.trim().toLowerCase();
    const byCategory =
      activeFilter === 'all'
        ? allItems
        : allItems.filter((item) => item.category === activeFilter);

    const visibleItems = !query
      ? byCategory
      : byCategory.filter((item) => {
          const haystack = [
            item.title,
            item.subtitle,
            item.date_label,
            ...(item.tech_tags || []),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        });

    const addBtn = createEl(
      'button',
      { className: 'studio-btn-primary text-sm shrink-0', attrs: { type: 'button' } },
      studioIcon('plus', 'w-4 h-4'),
      createEl('span', { text: 'Tambah Karya' })
    );
    addBtn.addEventListener('click', () => openShowcaseDrawer(null));

    const filterSeg = createSegmentedControl({
      ariaLabel: 'Filter kategori showcase',
      value: activeFilter,
      options: [
        { value: 'all', label: 'Semua', badge: allItems.length },
        {
          value: 'project',
          label: 'Projects',
          badge: allItems.filter((i) => i.category === 'project').length,
        },
        {
          value: 'certificate',
          label: 'Certificates',
          badge: allItems.filter((i) => i.category === 'certificate').length,
        },
        {
          value: 'award',
          label: 'Awards',
          badge: allItems.filter((i) => i.category === 'award').length,
        },
      ],
      onChange: (nextVal) => {
        activeFilter = nextVal;
        renderGridOnly();
      },
    });

    const searchInput = createEl('input', {
      className: 'studio-input pl-10 min-h-[44px] py-2 text-sm',
      attrs: {
        id: 'showcase-search-input',
        type: 'search',
        placeholder: 'Cari judul, tag, atau ringkasan...',
        value: searchQuery,
        'aria-label': 'Cari karya showcase',
      },
    });

    const searchWrap = createEl(
      'div',
      { className: 'relative w-full sm:w-72 shrink-0' },
      createEl(
        'span',
        {
          className:
            'absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none',
        },
        studioIcon('search', 'w-4 h-4')
      ),
      searchInput
    );

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
            text: 'Karya & Showcase',
          }),
          createEl('p', {
            className: 'text-sm text-[#475569]',
            text: 'Kelola proyek, sertifikat, dan penghargaan yang tampil di halaman publik.',
          })
        ),
        addBtn
      ),
      createEl(
        'div',
        {
          className:
            'pt-4 border-t border-[rgba(15,23,42,0.12)] flex flex-col xl:flex-row xl:items-center justify-between gap-3',
        },
        filterSeg.el,
        searchWrap
      )
    );

    const gridMount = createEl('div', { className: 'space-y-4' });

    function renderGridOnly() {
      const q = searchQuery.trim().toLowerCase();
      const catList =
        activeFilter === 'all'
          ? allItems
          : allItems.filter((item) => item.category === activeFilter);
      const filtered = !q
        ? catList
        : catList.filter((item) =>
            [item.title, item.subtitle, item.date_label, ...(item.tech_tags || [])]
              .join(' ')
              .toLowerCase()
              .includes(q)
          );

      if (filtered.length === 0) {
        renderEmptyState(
          gridMount,
          q
            ? `Tidak ada karya yang cocok dengan pencarian "${searchQuery}".`
            : 'Belum ada karya di kategori ini. Tambahkan item baru agar langsung tampil di portfolio.',
          {
            title: q ? 'Pencarian tidak ditemukan' : 'Koleksi masih kosong',
            actionLabel: q ? null : 'Tambah Karya',
            onAction: q ? null : () => openShowcaseDrawer(null),
          }
        );
        return;
      }

      const grid = createEl('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' });

      for (const item of filtered) {
        const card = createEl('article', {
          className: 'studio-card studio-card-hover overflow-hidden flex flex-col justify-between',
        });

        const thumbSrc =
          safeUrl(item.thumbnail_url) || assetUrl('/assets/showcase/project-atelier.svg');

        const thumbHeader = createEl(
          'div',
          { className: 'relative bg-[#DBEAFE] border-b-[1.5px] border-[#0F172A] aspect-[16/10] overflow-hidden' },
          createEl('img', {
            className: 'w-full h-full object-cover block',
            attrs: {
              src: thumbSrc,
              alt: item.title,
              loading: 'lazy',
            },
          }),
          createEl(
            'div',
            { className: 'absolute top-3 left-3 flex flex-wrap items-center gap-1.5' },
            createEl('span', {
              className: 'studio-pill studio-pill-sky',
              text: CATEGORY_LABELS[item.category] || item.category,
            }),
            item.date_label
              ? createEl('span', {
                  className: 'studio-pill',
                  text: item.date_label,
                })
              : null
          )
        );

        const tagsRow = createEl('div', { className: 'flex flex-wrap gap-1.5' });
        for (const tag of (item.tech_tags || []).slice(0, 4)) {
          tagsRow.appendChild(
            createEl('span', {
              className:
                'font-mono-tabular text-xs font-medium px-2.5 py-0.5 rounded-lg bg-[#F4F6FA] border border-[rgba(15,23,42,0.2)] text-[#0B0F19]',
              text: tag,
            })
          );
        }

        const body = createEl(
          'div',
          { className: 'p-5 space-y-3 flex-1' },
          createEl(
            'div',
            { className: 'space-y-1' },
            createEl('h3', {
              className: 'font-display text-lg font-bold text-[#0B0F19] leading-snug',
              text: item.title,
            }),
            item.subtitle
              ? createEl('p', {
                  className: 'text-sm text-[#475569] line-clamp-2',
                  text: item.subtitle,
                })
              : null
          ),
          tagsRow.childElementCount > 0 ? tagsRow : null
        );

        // Quick inline switches + Edit/Delete actions
        const pubToggle = createToggleSwitch({
          label: item.is_published ? 'Tayang' : 'Draf',
          checked: Boolean(item.is_published),
          compact: true,
          onChange: async (nextVal) => {
            pubToggle.setDisabled(true);
            const { error: togErr } = await supabase
              .from('showcase_items')
              .update({ is_published: nextVal })
              .eq('id', item.id);
            if (togErr) {
              showToast(togErr.message, 'error');
              pubToggle.setValue(!nextVal);
            } else {
              item.is_published = nextVal;
              showToast(
                nextVal ? `"${item.title}" ditayangkan.` : `"${item.title}" disimpan sebagai draf.`,
                'success'
              );
              if (typeof onDataChange === 'function') onDataChange();
            }
            pubToggle.setDisabled(false);
            renderGridOnly();
          },
        });

        const featToggle = createToggleSwitch({
          label: 'Unggulan',
          checked: Boolean(item.is_featured),
          compact: true,
          onChange: async (nextVal) => {
            featToggle.setDisabled(true);
            const { error: featErr } = await supabase
              .from('showcase_items')
              .update({ is_featured: nextVal })
              .eq('id', item.id);
            if (featErr) {
              showToast(featErr.message, 'error');
              featToggle.setValue(!nextVal);
            } else {
              item.is_featured = nextVal;
              showToast(
                nextVal ? `"${item.title}" ditandai unggulan.` : `Tanda unggulan dilepas.`,
                'success'
              );
            }
            featToggle.setDisabled(false);
          },
        });

        const editBtn = createEl(
          'button',
          { className: 'studio-btn-secondary text-xs min-h-[40px] px-3.5', attrs: { type: 'button' } },
          studioIcon('edit', 'w-3.5 h-3.5'),
          createEl('span', { text: 'Sunting' })
        );
        editBtn.addEventListener('click', () => openShowcaseDrawer(item));

        const delBtn = createEl(
          'button',
          {
            className: 'studio-icon-btn studio-icon-btn-danger w-10 h-10 min-w-[40px] min-h-[40px]',
            attrs: { type: 'button', 'aria-label': `Hapus ${item.title}` },
          },
          studioIcon('trash', 'w-4 h-4')
        );
        delBtn.addEventListener('click', async () => {
          const confirmed = await confirmAction({
            title: 'Hapus Karya',
            message: `Yakin ingin menghapus "${item.title}" secara permanen?`,
          });
          if (!confirmed) return;
          delBtn.disabled = true;
          const { error: delErr } = await supabase
            .from('showcase_items')
            .delete()
            .eq('id', item.id);
          if (delErr) showToast(delErr.message, 'error');
          else showToast(`"${item.title}" berhasil dihapus.`, 'success');
          await fetchAndRender();
          if (typeof onDataChange === 'function') onDataChange();
        });

        const footer = createEl(
          'div',
          {
            className:
              'px-5 py-3.5 bg-[#F8FAFC] border-t border-[rgba(15,23,42,0.12)] flex flex-wrap items-center justify-between gap-3',
          },
          createEl('div', { className: 'flex flex-wrap items-center gap-4' }, pubToggle.el, featToggle.el),
          createEl('div', { className: 'flex items-center gap-2' }, editBtn, delBtn)
        );

        card.append(thumbHeader, body, footer);
        grid.appendChild(card);
      }

      gridMount.replaceChildren(grid);
    }

    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      renderGridOnly();
    });

    renderGridOnly();
    container.replaceChildren(toolbarCard, gridMount);
  }

  async function fetchAndRender() {
    const { data, error } = await supabase
      .from('showcase_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      renderErrorState(container, `Gagal memuat karya: ${error.message}`, () => fetchAndRender());
      return;
    }

    allItems = data || [];
    renderView();
  }

  await fetchAndRender();
}
