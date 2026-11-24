import { supabase } from '../lib/supabase.js';
import { createEl, safeUrl } from '../lib/sanitize.js';
import {
  createMediaUploadField,
  renderErrorState,
  renderLoadingState,
  showToast,
} from './admin-ui.js';

function createSocialRow(social, index, onRemove) {
  const row = createEl('div', {
    className:
      'grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end pb-3 border-b border-[rgba(148,163,184,0.14)]',
  });

  const idInput = createEl('input', {
    className: 'admin-input text-sm',
    attrs: {
      id: `social-id-${index}`,
      type: 'text',
      placeholder: 'github / linkedin',
      value: social.id || '',
    },
  });

  const labelInput = createEl('input', {
    className: 'admin-input text-sm',
    attrs: {
      id: `social-label-${index}`,
      type: 'text',
      placeholder: 'GitHub',
      value: social.label || '',
    },
  });

  const handleInput = createEl('input', {
    className: 'admin-input text-sm',
    attrs: {
      id: `social-handle-${index}`,
      type: 'text',
      placeholder: '@satrio',
      value: social.handle || '',
    },
  });

  const urlInput = createEl('input', {
    className: 'admin-input text-sm font-mono-tabular',
    attrs: {
      id: `social-url-${index}`,
      type: 'url',
      placeholder: 'https://...',
      value: social.url || '',
    },
  });

  const removeBtn = createEl('button', {
    className: 'admin-btn-danger text-xs w-full sm:w-auto',
    text: 'Hapus',
    attrs: { type: 'button', 'aria-label': `Hapus link sosial ${social.label || index + 1}` },
  });
  removeBtn.addEventListener('click', () => onRemove(row));

  row.append(
    createEl(
      'div',
      { className: 'sm:col-span-2 space-y-1' },
      createEl('label', { className: 'text-xs text-[#94A3B8]', text: 'Key', attrs: { for: `social-id-${index}` } }),
      idInput
    ),
    createEl(
      'div',
      { className: 'sm:col-span-2 space-y-1' },
      createEl('label', { className: 'text-xs text-[#94A3B8]', text: 'Platform', attrs: { for: `social-label-${index}` } }),
      labelInput
    ),
    createEl(
      'div',
      { className: 'sm:col-span-3 space-y-1' },
      createEl('label', { className: 'text-xs text-[#94A3B8]', text: 'Handle / Teks', attrs: { for: `social-handle-${index}` } }),
      handleInput
    ),
    createEl(
      'div',
      { className: 'sm:col-span-4 space-y-1' },
      createEl('label', { className: 'text-xs text-[#94A3B8]', text: 'URL (opsional)', attrs: { for: `social-url-${index}` } }),
      urlInput
    ),
    createEl('div', { className: 'sm:col-span-1' }, removeBtn)
  );

  return {
    el: row,
    readValue: () => ({
      id: idInput.value.trim().toLowerCase() || 'link',
      label: labelInput.value.trim(),
      handle: handleInput.value.trim(),
      url: urlInput.value.trim() || null,
      copyValue: handleInput.value.trim() || null,
    }),
  };
}

export async function mountProfileEditor(container) {
  renderLoadingState(container, 'Memuat data site_profile...');

  async function loadAndRender() {
    const { data, error } = await supabase
      .from('site_profile')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      renderErrorState(container, `Gagal memuat site_profile: ${error.message}`, () => loadAndRender());
      return;
    }

    const profile = data || {
      id: 1,
      display_name: 'Satrio',
      full_name: 'Muhammad Syahdan Satrio Kuncoro',
      handle: '@satrio',
      tagline: 'Web Development, Graphic Design, Motion Graphics',
      bio: '',
      location_label: 'Jakarta, Indonesia',
      coordinates_label: '6.2088° S, 106.8456° E',
      status_text: 'Available for select projects',
      is_available: true,
      hero_cutout_url: '',
      avatar_normal_url: '',
      avatar_alter_url: '',
      socials: [],
    };

    const form = createEl('form', { className: 'admin-panel p-6 space-y-6', attrs: { novalidate: '' } });

    const header = createEl(
      'div',
      { className: 'pb-4 border-b border-[rgba(148,163,184,0.16)] flex flex-wrap items-center justify-between gap-2' },
      createEl(
        'div',
        {},
        createEl('h2', { className: 'font-display text-xl font-bold text-[#F8FAFC]', text: 'Profile & Hero Config' }),
        createEl('p', {
          className: 'text-sm text-[#94A3B8] mt-0.5',
          text: 'Sinkron ke Hero, Identity Bento, Telemetry status, dan kartu Find Me.',
        })
      ),
      createEl('span', { className: 'font-mono-tabular text-xs text-[#7B8CA4]', text: 'SINGLETON ROW ID: 1' })
    );

    const makeField = (id, label, value, type = 'text', extra = {}) => {
      const input = createEl(type === 'textarea' ? 'textarea' : 'input', {
        className: type === 'textarea' ? 'admin-input resize-y' : 'admin-input',
        attrs: {
          id,
          ...(type !== 'textarea' ? { type, value: value || '' } : { rows: extra.rows || 3 }),
          ...extra.attrs,
        },
      });
      if (type === 'textarea') input.value = value || '';

      return {
        el: createEl(
          'div',
          { className: 'space-y-1.5' },
          createEl('label', { className: 'block text-sm font-medium text-[#F8FAFC]', text: label, attrs: { for: id } }),
          input
        ),
        input,
      };
    };

    const displayNameF = makeField('pf-display-name', 'Display Name', profile.display_name);
    const fullNameF = makeField('pf-full-name', 'Nama Lengkap', profile.full_name);
    const handleF = makeField('pf-handle', 'Handle', profile.handle);
    const taglineF = makeField('pf-tagline', 'Tagline / Disiplin', profile.tagline);
    const bioF = makeField('pf-bio', 'Bio Singkat', profile.bio, 'textarea', { rows: 3 });
    const locationF = makeField('pf-location', 'Lokasi', profile.location_label);
    const coordsF = makeField('pf-coords', 'Koordinat', profile.coordinates_label);
    const statusTextF = makeField('pf-status-text', 'Teks Status Ketersediaan', profile.status_text);

    const availCheckbox = createEl('input', {
      className: 'w-5 h-5 accent-[#2563EB]',
      attrs: { id: 'pf-is-available', type: 'checkbox' },
    });
    availCheckbox.checked = Boolean(profile.is_available);

    const availRow = createEl(
      'label',
      {
        className: 'flex items-center gap-3 min-h-[44px] text-sm font-medium text-[#F8FAFC]',
        attrs: { for: 'pf-is-available' },
      },
      availCheckbox,
      'Status Tersedia untuk Proyek Baru (Active Badge)'
    );

    const gridTop = createEl(
      'div',
      { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      displayNameF.el,
      handleF.el,
      fullNameF.el,
      taglineF.el,
      locationF.el,
      coordsF.el,
      statusTextF.el,
      createEl('div', { className: 'flex items-end' }, availRow)
    );

    const heroMedia = createMediaUploadField({
      id: 'pf-hero-cutout',
      label: 'Hero Cutout Image URL',
      initialUrl: profile.hero_cutout_url,
      folder: 'profile',
    });
    const normalMedia = createMediaUploadField({
      id: 'pf-avatar-normal',
      label: 'Portrait Normal Layer URL',
      initialUrl: profile.avatar_normal_url,
      folder: 'profile',
    });
    const alterMedia = createMediaUploadField({
      id: 'pf-avatar-alter',
      label: 'Portrait Alter-Ego Layer URL',
      initialUrl: profile.avatar_alter_url,
      folder: 'profile',
    });

    const mediaGrid = createEl(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-[rgba(148,163,184,0.16)]' },
      heroMedia.el,
      normalMedia.el,
      alterMedia.el
    );

    // Dynamic Social Links Editor
    const socialsWrap = createEl('div', { className: 'space-y-3 pt-4 border-t border-[rgba(148,163,184,0.16)]' });
    const socialRowsContainer = createEl('div', { className: 'space-y-3' });
    let socialRowControllers = [];

    const addSocialEntry = (socialData = {}) => {
      const idx = socialRowControllers.length;
      const ctrl = createSocialRow(socialData, idx, (targetEl) => {
        socialRowControllers = socialRowControllers.filter((c) => c.el !== targetEl);
        targetEl.remove();
      });
      socialRowControllers.push(ctrl);
      socialRowsContainer.appendChild(ctrl.el);
    };

    const existingSocials = Array.isArray(profile.socials) ? profile.socials : [];
    for (const s of existingSocials) {
      addSocialEntry(s);
    }

    const addSocialBtn = createEl('button', {
      className: 'admin-btn-secondary text-xs',
      text: 'Tambah Kanal Sosial',
      attrs: { type: 'button' },
    });
    addSocialBtn.addEventListener('click', () => addSocialEntry({ id: '', label: '', handle: '', url: '' }));

    socialsWrap.append(
      createEl(
        'div',
        { className: 'flex flex-wrap items-center justify-between gap-2' },
        createEl('h3', { className: 'font-display text-base font-bold text-[#F8FAFC]', text: 'Social Links (JSONB)' }),
        addSocialBtn
      ),
      socialRowsContainer
    );

    const saveBtn = createEl('button', {
      className: 'admin-btn-primary',
      text: 'Simpan Profil',
      attrs: { type: 'submit' },
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      let socials = [];
      try {
        socials = socialRowControllers
          .map((c) => c.readValue())
          .filter((s) => s.label && s.handle)
          .map((s) => {
            if (s.url && !safeUrl(s.url)) {
              throw new Error(`URL sosial "${s.label}" tidak valid. Gunakan https:// atau mailto:.`);
            }
            return s;
          });
      } catch (err) {
        showToast(err?.message || 'Format URL sosial tidak valid.', 'error');
        return;
      }

      const payload = {
        id: 1,
        display_name: displayNameF.input.value.trim(),
        full_name: fullNameF.input.value.trim(),
        handle: handleF.input.value.trim(),
        tagline: taglineF.input.value.trim(),
        bio: bioF.input.value.trim(),
        location_label: locationF.input.value.trim(),
        coordinates_label: coordsF.input.value.trim(),
        status_text: statusTextF.input.value.trim(),
        is_available: availCheckbox.checked,
        hero_cutout_url: heroMedia.getValue(),
        avatar_normal_url: normalMedia.getValue(),
        avatar_alter_url: alterMedia.getValue(),
        socials,
      };

      if (!payload.display_name || !payload.full_name || !payload.bio) {
        showToast('Display name, nama lengkap, dan bio wajib diisi.', 'error');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = 'Menyimpan...';

      try {
        const { error: upsertErr } = await supabase
          .from('site_profile')
          .upsert(payload, { onConflict: 'id' });

        if (upsertErr) throw upsertErr;
        showToast('Profil & media berhasil diperbarui di Supabase.', 'success');
      } catch (err) {
        showToast(err?.message || 'Gagal menyimpan profil.', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Simpan Profil';
      }
    });

    form.append(
      header,
      gridTop,
      bioF.el,
      mediaGrid,
      socialsWrap,
      createEl('div', { className: 'pt-2 flex justify-end' }, saveBtn)
    );

    container.replaceChildren(form);
  }

  await loadAndRender();
}
