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

export async function mountShowcaseCrud(container) {
  renderLoadingState(container, 'Memuat showcase_items...');

  let activeFilter = 'all';
  let editingId = null;

  async function refresh() {
    const { data, error } = await supabase
      .from('showcase_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      renderErrorState(container, `Gagal memuat showcase_items: ${error.message}`, () => refresh());
      return;
    }

    const items = data || [];
    const editingItem = editingId ? items.find((i) => i.id === editingId) || null : null;

    // Form Panel (Create / Edit)
    const formPanel = createEl('form', { className: 'admin-panel p-6 space-y-5', attrs: { novalidate: '' } });

    const formHeader = createEl(
      'div',
      { className: 'flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(148,163,184,0.16)]' },
      createEl('h2', {
        className: 'font-display text-xl font-bold text-[#F8FAFC]',
        text: editingItem ? `Sunting Item: ${editingItem.title}` : 'Tambah Showcase Item',
      }),
      editingItem
        ? createEl('button', {
            className: 'admin-btn-secondary text-xs',
            text: 'Batal Sunting',
            attrs: { type: 'button' },
          })
        : null
    );

    if (editingItem) {
      formHeader.querySelector('button')?.addEventListener('click', () => {
        editingId = null;
        refresh();
      });
    }

    const catSelect = createEl(
      'select',
      { className: 'admin-input', attrs: { id: 'sc-category' } },
      createEl('option', { text: 'Project', attrs: { value: 'project' } }),
      createEl('option', { text: 'Certificate', attrs: { value: 'certificate' } }),
      createEl('option', { text: 'Award', attrs: { value: 'award' } })
    );
    catSelect.value = editingItem?.category || 'project';

    const titleInput = createEl('input', {
      className: 'admin-input',
      attrs: { id: 'sc-title', type: 'text', required: '', placeholder: 'Judul karya atau sertifikat', value: editingItem?.title || '' },
    });

    const subtitleInput = createEl('input', {
      className: 'admin-input',
      attrs: { id: 'sc-subtitle', type: 'text', placeholder: 'Ringkasan 1 baris', value: editingItem?.subtitle || '' },
    });

    const tagsInput = createEl('input', {
      className: 'admin-input',
      attrs: {
        id: 'sc-tags',
        type: 'text',
        placeholder: 'Web Dev, Tailwind CSS, Alight Motion',
        value: Array.isArray(editingItem?.tech_tags) ? editingItem.tech_tags.join(', ') : '',
      },
    });

    const dateInput = createEl('input', {
      className: 'admin-input font-mono-tabular',
      attrs: { id: 'sc-date', type: 'text', placeholder: '2026', value: editingItem?.date_label || '' },
    });

    const sortInput = createEl('input', {
      className: 'admin-input font-mono-tabular',
      attrs: { id: 'sc-sort', type: 'number', value: String(editingItem?.sort_order ?? 0) },
    });

    const liveUrlInput = createEl('input', {
      className: 'admin-input font-mono-tabular text-sm',
      attrs: { id: 'sc-live-url', type: 'url', placeholder: 'https://demo-url.com', value: editingItem?.live_url || '' },
    });

    const repoUrlInput = createEl('input', {
      className: 'admin-input font-mono-tabular text-sm',
      attrs: { id: 'sc-repo-url', type: 'url', placeholder: 'https://github.com/...', value: editingItem?.repo_url || '' },
    });

    const descInput = createEl('textarea', {
      className: 'admin-input resize-y',
      attrs: { id: 'sc-desc', rows: 3, placeholder: 'Deskripsi studi kasus atau detail kredensial...' },
    });
    descInput.value = editingItem?.description || '';

    const publishedCheck = createEl('input', {
      className: 'w-5 h-5 accent-[#2563EB]',
      attrs: { id: 'sc-published', type: 'checkbox' },
    });
    publishedCheck.checked = editingItem ? Boolean(editingItem.is_published) : true;

    const featuredCheck = createEl('input', {
      className: 'w-5 h-5 accent-[#2563EB]',
      attrs: { id: 'sc-featured', type: 'checkbox' },
    });
    featuredCheck.checked = Boolean(editingItem?.is_featured);

    const thumbField = createMediaUploadField({
      id: 'sc-thumbnail',
      label: 'Thumbnail Image URL',
      initialUrl: editingItem?.thumbnail_url || '',
      folder: 'showcase',
    });

    const fieldWrap = (id, label, control) =>
      createEl(
        'div',
        { className: 'space-y-1.5' },
        createEl('label', { className: 'block text-sm font-medium text-[#F8FAFC]', text: label, attrs: { for: id } }),
        control
      );

    const grid = createEl(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      fieldWrap('sc-category', 'Kategori', catSelect),
      fieldWrap('sc-title', 'Judul', titleInput),
      fieldWrap('sc-subtitle', 'Subjudul', subtitleInput),
      fieldWrap('sc-tags', 'Tech / Discipline Tags (pisahkan koma)', tagsInput),
      fieldWrap('sc-date', 'Label Tahun / Tanggal', dateInput),
      fieldWrap('sc-sort', 'Urutan (sort_order)', sortInput),
      fieldWrap('sc-live-url', 'Live Demo URL (opsional)', liveUrlInput),
      fieldWrap('sc-repo-url', 'Repository URL (opsional)', repoUrlInput)
    );

    const flagsRow = createEl(
      'div',
      { className: 'flex flex-wrap gap-6' },
      createEl(
        'label',
        { className: 'flex items-center gap-2.5 min-h-[44px] text-sm text-[#F8FAFC]', attrs: { for: 'sc-published' } },
        publishedCheck,
        'Published (tampil di publik)'
      ),
      createEl(
        'label',
        { className: 'flex items-center gap-2.5 min-h-[44px] text-sm text-[#F8FAFC]', attrs: { for: 'sc-featured' } },
        featuredCheck,
        'Featured'
      )
    );

    const submitBtn = createEl('button', {
      className: 'admin-btn-primary',
      text: editingItem ? 'Simpan Perubahan' : 'Tambah Showcase',
      attrs: { type: 'submit' },
    });

    formPanel.addEventListener('submit', async (event) => {
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
        showToast('Live Demo URL tidak valid (gunakan https://).', 'error');
        liveUrlInput.focus();
        return;
      }
      if (rawRepo && !safeUrl(rawRepo)) {
        showToast('Repository URL tidak valid (gunakan https://).', 'error');
        repoUrlInput.focus();
        return;
      }

      const techTags = tagsInput.value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        category: catSelect.value,
        title,
        subtitle: subtitleInput.value.trim(),
        description: descInput.value.trim(),
        tech_tags: techTags,
        thumbnail_url: thumbField.getValue(),
        live_url: rawLive || null,
        repo_url: rawRepo || null,
        date_label: dateInput.value.trim(),
        sort_order: Number.parseInt(sortInput.value || '0', 10) || 0,
        is_published: publishedCheck.checked,
        is_featured: featuredCheck.checked,
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
          showToast(`Item "${title}" diperbarui.`, 'success');
          editingId = null;
        } else {
          const { error: insErr } = await supabase.from('showcase_items').insert(payload);
          if (insErr) throw insErr;
          showToast(`Item "${title}" ditambahkan.`, 'success');
        }
        await refresh();
      } catch (err) {
        showToast(err?.message || 'Gagal menyimpan item showcase.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingItem ? 'Simpan Perubahan' : 'Tambah Showcase';
      }
    });

    formPanel.append(formHeader, grid, fieldWrap('sc-desc', 'Deskripsi Detail', descInput), thumbField.el, flagsRow, submitBtn);

    // Filter + List Panel
    const filterBar = createEl('div', { className: 'flex flex-wrap items-center justify-between gap-3' });
    const filterButtonsWrap = createEl('div', { className: 'flex flex-wrap gap-2' });

    for (const [key, label] of [
      ['all', `Semua (${items.length})`],
      ['project', 'Projects'],
      ['certificate', 'Certificates'],
      ['award', 'Awards'],
    ]) {
      const btn = createEl('button', {
        className: activeFilter === key ? 'admin-btn-primary text-xs px-3.5' : 'admin-btn-secondary text-xs px-3.5',
        text: label,
        attrs: { type: 'button', 'aria-pressed': String(activeFilter === key) },
      });
      btn.addEventListener('click', () => {
        activeFilter = key;
        refresh();
      });
      filterButtonsWrap.appendChild(btn);
    }
    filterBar.appendChild(filterButtonsWrap);

    const visibleItems =
      activeFilter === 'all' ? items : items.filter((item) => item.category === activeFilter);

    const listContainer = createEl('div', { className: 'space-y-3' });
    if (visibleItems.length === 0) {
      renderEmptyState(listContainer, 'Belum ada item showcase pada kategori ini. Gunakan formulir di atas untuk menambahkan.');
    } else {
      const tableBox = createEl('div', { className: 'admin-panel divide-y-0 px-5' });
      for (const item of visibleItems) {
        const row = createEl('div', {
          className: 'admin-row py-4 flex flex-col md:flex-row md:items-center justify-between gap-4',
        });

        const info = createEl(
          'div',
          { className: 'flex items-start gap-3 min-w-0' },
          item.thumbnail_url && safeUrl(item.thumbnail_url)
            ? createEl('img', {
                className: 'w-16 h-12 rounded-lg object-cover bg-[#151B28] border border-[rgba(148,163,184,0.2)] shrink-0',
                attrs: { src: safeUrl(item.thumbnail_url), alt: item.title, width: '64', height: '48' },
              })
            : null,
          createEl(
            'div',
            { className: 'min-w-0 space-y-1' },
            createEl(
              'div',
              { className: 'flex flex-wrap items-center gap-2' },
              createEl('span', {
                className: 'font-mono-tabular text-xs px-2 py-0.5 rounded bg-[#151B28] text-[#60A5FA]',
                text: item.category.toUpperCase(),
              }),
              createEl('span', {
                className: item.is_published
                  ? 'font-mono-tabular text-xs text-[#34D399]'
                  : 'font-mono-tabular text-xs text-[#FBBF24]',
                text: item.is_published ? 'PUBLISHED' : 'DRAFT',
              }),
              createEl('span', {
                className: 'font-mono-tabular text-xs text-[#7B8CA4]',
                text: `Order: ${item.sort_order}`,
              })
            ),
            createEl('h3', { className: 'font-display text-base font-bold text-[#F8FAFC]', text: item.title }),
            createEl('p', { className: 'text-sm text-[#94A3B8] truncate', text: item.subtitle || '' })
          )
        );

        const actions = createEl('div', { className: 'flex flex-wrap items-center gap-2 shrink-0' });

        const togglePubBtn = createEl('button', {
          className: 'admin-btn-secondary text-xs px-3',
          text: item.is_published ? 'Unpublish' : 'Publish',
          attrs: { type: 'button' },
        });
        togglePubBtn.addEventListener('click', async () => {
          togglePubBtn.disabled = true;
          const { error: togErr } = await supabase
            .from('showcase_items')
            .update({ is_published: !item.is_published })
            .eq('id', item.id);
          if (togErr) showToast(togErr.message, 'error');
          else showToast(`Status publish "${item.title}" diubah.`, 'success');
          await refresh();
        });

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
          const confirmed = await confirmAction({
            title: 'Hapus Showcase Item',
            message: `Yakin ingin menghapus "${item.title}" secara permanen?`,
          });
          if (!confirmed) return;
          delBtn.disabled = true;
          const { error: delErr } = await supabase.from('showcase_items').delete().eq('id', item.id);
          if (delErr) showToast(delErr.message, 'error');
          else showToast(`"${item.title}" dihapus.`, 'success');
          if (editingId === item.id) editingId = null;
          await refresh();
        });

        actions.append(togglePubBtn, editBtn, delBtn);
        row.append(info, actions);
        tableBox.appendChild(row);
      }
      listContainer.appendChild(tableBox);
    }

    container.replaceChildren(formPanel, filterBar, listContainer);
  }

  await refresh();
}
