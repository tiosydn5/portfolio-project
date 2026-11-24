import { supabase } from '../lib/supabase.js';
import { createEl } from '../lib/sanitize.js';
import {
  confirmAction,
  renderEmptyState,
  renderErrorState,
  renderLoadingState,
  showToast,
} from './admin-ui.js';

export async function mountTimelineCrud(container) {
  renderLoadingState(container, 'Memuat timeline_entries...');

  let editingId = null;
  let activeType = 'all';

  async function refresh() {
    const { data, error } = await supabase
      .from('timeline_entries')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      renderErrorState(container, `Gagal memuat timeline_entries: ${error.message}`, () => refresh());
      return;
    }

    const entries = data || [];
    const editingItem = editingId ? entries.find((e) => e.id === editingId) || null : null;

    const form = createEl('form', { className: 'admin-panel p-6 space-y-5', attrs: { novalidate: '' } });

    const header = createEl(
      'div',
      { className: 'flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(148,163,184,0.16)]' },
      createEl('h2', {
        className: 'font-display text-xl font-bold text-[#F8FAFC]',
        text: editingItem ? `Sunting Timeline: ${editingItem.role}` : 'Tambah Education / Experience',
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

    const typeSelect = createEl(
      'select',
      { className: 'admin-input', attrs: { id: 'tl-type' } },
      createEl('option', { text: 'Experience', attrs: { value: 'experience' } }),
      createEl('option', { text: 'Education', attrs: { value: 'education' } })
    );
    typeSelect.value = editingItem?.type || 'experience';

    const orgInput = createEl('input', {
      className: 'admin-input',
      attrs: { id: 'tl-org', type: 'text', required: '', placeholder: 'Nama institusi / perusahaan', value: editingItem?.organization || '' },
    });

    const roleInput = createEl('input', {
      className: 'admin-input',
      attrs: { id: 'tl-role', type: 'text', required: '', placeholder: 'Peran / program studi', value: editingItem?.role || '' },
    });

    const periodInput = createEl('input', {
      className: 'admin-input font-mono-tabular',
      attrs: { id: 'tl-period', type: 'text', required: '', placeholder: '2024 - Sekarang', value: editingItem?.period || '' },
    });

    const sortInput = createEl('input', {
      className: 'admin-input font-mono-tabular',
      attrs: { id: 'tl-sort', type: 'number', value: String(editingItem?.sort_order ?? 0) },
    });

    const descInput = createEl('textarea', {
      className: 'admin-input resize-y',
      attrs: { id: 'tl-desc', rows: 3, placeholder: 'Ringkasan aktivitas atau fokus studi...' },
    });
    descInput.value = editingItem?.description || '';

    const wrap = (id, label, el) =>
      createEl(
        'div',
        { className: 'space-y-1.5' },
        createEl('label', { className: 'block text-sm font-medium text-[#F8FAFC]', text: label, attrs: { for: id } }),
        el
      );

    const grid = createEl(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      wrap('tl-type', 'Tipe', typeSelect),
      wrap('tl-period', 'Periode', periodInput),
      wrap('tl-org', 'Organisasi / Institusi', orgInput),
      wrap('tl-role', 'Peran / Gelar', roleInput),
      wrap('tl-sort', 'Urutan (sort_order)', sortInput)
    );

    const submitBtn = createEl('button', {
      className: 'admin-btn-primary',
      text: editingItem ? 'Simpan Perubahan' : 'Tambah Timeline',
      attrs: { type: 'submit' },
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        type: typeSelect.value,
        organization: orgInput.value.trim(),
        role: roleInput.value.trim(),
        period: periodInput.value.trim(),
        description: descInput.value.trim(),
        sort_order: Number.parseInt(sortInput.value || '0', 10) || 0,
      };

      if (payload.organization.length < 2 || payload.role.length < 2 || payload.period.length < 2) {
        showToast('Organisasi, peran, dan periode wajib diisi.', 'error');
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
          showToast('Entri timeline diperbarui.', 'success');
          editingId = null;
        } else {
          const { error: insErr } = await supabase.from('timeline_entries').insert(payload);
          if (insErr) throw insErr;
          showToast('Entri timeline ditambahkan.', 'success');
        }
        await refresh();
      } catch (err) {
        showToast(err?.message || 'Gagal menyimpan timeline.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingItem ? 'Simpan Perubahan' : 'Tambah Timeline';
      }
    });

    form.append(header, grid, wrap('tl-desc', 'Deskripsi', descInput), submitBtn);

    const filterRow = createEl('div', { className: 'flex flex-wrap gap-2' });
    for (const [key, label] of [
      ['all', `Semua (${entries.length})`],
      ['education', 'Education'],
      ['experience', 'Experience'],
    ]) {
      const btn = createEl('button', {
        className: activeType === key ? 'admin-btn-primary text-xs px-3.5' : 'admin-btn-secondary text-xs px-3.5',
        text: label,
        attrs: { type: 'button', 'aria-pressed': String(activeType === key) },
      });
      btn.addEventListener('click', () => {
        activeType = key;
        refresh();
      });
      filterRow.appendChild(btn);
    }

    const filtered = activeType === 'all' ? entries : entries.filter((e) => e.type === activeType);
    const listWrap = createEl('div');

    if (filtered.length === 0) {
      renderEmptyState(listWrap, 'Belum ada entri timeline pada filter ini.');
    } else {
      const box = createEl('div', { className: 'admin-panel px-5' });
      for (const entry of filtered) {
        const row = createEl('div', {
          className: 'admin-row py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3',
        });

        const left = createEl(
          'div',
          { className: 'space-y-1 min-w-0' },
          createEl(
            'div',
            { className: 'flex flex-wrap items-center gap-2' },
            createEl('span', {
              className: 'font-mono-tabular text-xs px-2 py-0.5 rounded bg-[#151B28] text-[#60A5FA]',
              text: entry.type.toUpperCase(),
            }),
            createEl('span', { className: 'font-mono-tabular text-xs text-[#7B8CA4]', text: entry.period })
          ),
          createEl('h3', { className: 'font-display text-base font-bold text-[#F8FAFC]', text: entry.role }),
          createEl('p', { className: 'text-sm text-[#94A3B8]', text: entry.organization })
        );

        const editBtn = createEl('button', {
          className: 'admin-btn-secondary text-xs px-3',
          text: 'Edit',
          attrs: { type: 'button' },
        });
        editBtn.addEventListener('click', () => {
          editingId = entry.id;
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
            title: 'Hapus Entri Timeline',
            message: `Yakin ingin menghapus "${entry.role}" (${entry.organization})?`,
          });
          if (!ok) return;
          const { error: delErr } = await supabase.from('timeline_entries').delete().eq('id', entry.id);
          if (delErr) showToast(delErr.message, 'error');
          else showToast('Entri timeline dihapus.', 'success');
          if (editingId === entry.id) editingId = null;
          await refresh();
        });

        row.append(left, createEl('div', { className: 'flex items-center gap-2 shrink-0' }, editBtn, delBtn));
        box.appendChild(row);
      }
      listWrap.appendChild(box);
    }

    container.replaceChildren(form, filterRow, listWrap);
  }

  await refresh();
}
