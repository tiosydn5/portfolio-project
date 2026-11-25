import { supabase } from '../lib/supabase.js';
import { assetUrl, createEl, safeUrl } from '../lib/sanitize.js';
import {
  createFieldGroup,
  createMediaDropzone,
  createToggleSwitch,
  renderErrorState,
  renderLoadingState,
  showToast,
  studioIcon,
} from './admin-ui.js';

function createSocialRow(social, index, onRemove, onChange) {
  const row = createEl('div', {
    className:
      'studio-divider-row py-4 first:pt-0 last:pb-0 space-y-3',
  });

  const topBar = createEl(
    'div',
    { className: 'flex items-center justify-between gap-2' },
    createEl(
      'div',
      { className: 'flex items-center gap-2 min-w-0' },
      createEl(
        'span',
        {
          className:
            'w-8 h-8 rounded-lg bg-[#DBEAFE] border border-[#0F172A] flex items-center justify-center text-[#1D4ED8] shrink-0',
        },
        studioIcon('link', 'w-4 h-4')
      ),
      createEl('span', {
        className: 'text-sm font-semibold text-[#0B0F19] truncate',
        text: social.label || `Tautan ${index + 1}`,
      })
    )
  );

  const removeBtn = createEl(
    'button',
    {
      className: 'studio-icon-btn studio-icon-btn-danger w-9 h-9 min-w-[36px] min-h-[36px]',
      attrs: {
        type: 'button',
        'aria-label': `Hapus tautan ${social.label || index + 1}`,
      },
    },
    studioIcon('trash', 'w-4 h-4')
  );
  removeBtn.addEventListener('click', () => onRemove(row));
  topBar.appendChild(removeBtn);

  const idInput = createEl('input', {
    className: 'studio-input text-sm min-h-[42px] py-2',
    attrs: {
      id: `social-id-${index}`,
      type: 'text',
      placeholder: 'github / instagram',
      value: social.id || '',
    },
  });

  const labelInput = createEl('input', {
    className: 'studio-input text-sm min-h-[42px] py-2',
    attrs: {
      id: `social-label-${index}`,
      type: 'text',
      placeholder: 'GitHub',
      value: social.label || '',
    },
  });

  const handleInput = createEl('input', {
    className: 'studio-input text-sm min-h-[42px] py-2',
    attrs: {
      id: `social-handle-${index}`,
      type: 'text',
      placeholder: '@satrio',
      value: social.handle || '',
    },
  });

  const urlInput = createEl('input', {
    className: 'studio-input text-sm font-mono-tabular min-h-[42px] py-2',
    attrs: {
      id: `social-url-${index}`,
      type: 'url',
      placeholder: 'https://... (opsional)',
      value: social.url || '',
    },
  });

  const titleLabel = topBar.querySelector('span.truncate');
  for (const input of [idInput, labelInput, handleInput, urlInput]) {
    input.addEventListener('input', () => {
      if (titleLabel && input === labelInput) {
        titleLabel.textContent = labelInput.value.trim() || `Tautan ${index + 1}`;
      }
      if (typeof onChange === 'function') onChange();
    });
  }

  const fieldsGrid = createEl(
    'div',
    { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
    createFieldGroup(`social-label-${index}`, 'Platform', labelInput),
    createFieldGroup(`social-id-${index}`, 'Ikon / Kunci', idInput),
    createFieldGroup(`social-handle-${index}`, 'Nama Tampilan / Handle', handleInput),
    createFieldGroup(`social-url-${index}`, 'Tautan (opsional)', urlInput)
  );

  row.append(topBar, fieldsGrid);

  return {
    el: row,
    readValue: () => {
      const handle = handleInput.value.trim();
      const url = urlInput.value.trim() || null;
      const scrollTarget = social.scrollTarget || null;
      return {
        id: idInput.value.trim().toLowerCase() || 'link',
        label: labelInput.value.trim(),
        handle,
        url,
        scrollTarget,
        copyValue: scrollTarget ? null : handle || null,
      };
    },
  };
}

export async function mountProfileEditor(container) {
  renderLoadingState(container, 'Memuat data profil & tampilan hero...');

  async function loadAndRender() {
    const { data, error } = await supabase
      .from('site_profile')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      renderErrorState(container, `Gagal memuat profil: ${error.message}`, () => loadAndRender());
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

    const form = createEl('form', { className: 'space-y-5', attrs: { novalidate: '' } });

    // Top Studio Page Header
    const headerSaveBtn = createEl(
      'button',
      { className: 'studio-btn-primary text-sm shrink-0', attrs: { type: 'submit' } },
      studioIcon('check', 'w-4 h-4'),
      createEl('span', { text: 'Simpan Profil' })
    );

    const pageHeader = createEl(
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
          text: 'Profil & Hero',
        }),
        createEl('p', {
          className: 'text-sm text-[#475569]',
          text: 'Atur identitas utama, portrait dual-layer, status ketersediaan, dan tautan sosial.',
        })
      ),
      headerSaveBtn
    );

    // Form Controls
    const makeInput = (id, value, placeholder = '') =>
      createEl('input', {
        className: 'studio-input',
        attrs: { id, type: 'text', placeholder, value: value || '' },
      });

    const displayNameInput = makeInput('pf-display-name', profile.display_name, 'Satrio');
    const handleInput = makeInput('pf-handle', profile.handle, '@satrio');
    const fullNameInput = makeInput('pf-full-name', profile.full_name, 'Nama lengkap');
    const taglineInput = makeInput(
      'pf-tagline',
      profile.tagline,
      'Web Development, Graphic Design, Motion Graphics'
    );
    const locationInput = makeInput('pf-location', profile.location_label, 'Jakarta, Indonesia');
    const coordsInput = makeInput('pf-coords', profile.coordinates_label, '6.2088° S, 106.8456° E');
    coordsInput.classList.add('font-mono-tabular');
    const statusTextInput = makeInput(
      'pf-status-text',
      profile.status_text,
      'Available for select projects'
    );

    const bioInput = createEl('textarea', {
      className: 'studio-input resize-y',
      attrs: {
        id: 'pf-bio',
        rows: '3',
        placeholder: 'Ceritakan fokus keahlian dan gaya kerja Anda secara singkat...',
      },
    });
    bioInput.value = profile.bio || '';

    let isDirty = false;
    let stickyBar = null;

    function markDirty() {
      isDirty = true;
      if (stickyBar) stickyBar.classList.add('is-visible');
      syncPreview();
    }

    function clearDirty() {
      isDirty = false;
      if (stickyBar) stickyBar.classList.remove('is-visible');
    }

    const availSwitch = createToggleSwitch({
      id: 'pf-is-available',
      label: 'Tersedia untuk proyek baru',
      description: 'Menampilkan indikator status aktif hijau pada kartu telemetri publik.',
      checked: Boolean(profile.is_available),
      onChange: () => markDirty(),
    });

    // Sub-Card 1: Identitas & Bio
    const identityCard = createEl(
      'section',
      { className: 'studio-card p-5 sm:p-6 space-y-5' },
      createEl(
        'div',
        { className: 'pb-3 border-b border-[rgba(15,23,42,0.12)]' },
        createEl('h3', {
          className: 'font-display text-lg font-bold text-[#0B0F19]',
          text: 'Identitas & Bio',
        }),
        createEl('p', {
          className: 'text-xs text-[#475569] mt-0.5',
          text: 'Tampil pada Hero, kartu Profil, dan kartu Kontak.',
        })
      ),
      createEl(
        'div',
        { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
        createFieldGroup('pf-display-name', 'Nama Panggilan (Hero)', displayNameInput),
        createFieldGroup('pf-handle', 'Handle', handleInput),
        createFieldGroup('pf-full-name', 'Nama Lengkap', fullNameInput),
        createFieldGroup('pf-tagline', 'Fokus / Tagline', taglineInput),
        createFieldGroup('pf-location', 'Lokasi', locationInput),
        createFieldGroup('pf-coords', 'Koordinat', coordsInput)
      ),
      createFieldGroup('pf-bio', 'Bio Singkat', bioInput),
      createEl(
        'div',
        { className: 'pt-4 border-t border-[rgba(15,23,42,0.12)] grid grid-cols-1 sm:grid-cols-2 gap-4 items-center' },
        createFieldGroup('pf-status-text', 'Teks Status Ketersediaan', statusTextInput),
        createEl('div', { className: 'sm:pt-5' }, availSwitch.el)
      )
    );

    // Sub-Card 2: Media & Portraits (3 Visual Dropzones)
    const heroMedia = createMediaDropzone({
      id: 'pf-hero-cutout',
      label: 'Hero Cutout',
      hint: 'PNG transparan / WebP · Maks. 5 MB',
      initialUrl: profile.hero_cutout_url,
      folder: 'profile',
      aspectClass: 'aspect-[4/5]',
      onUrlChange: () => markDirty(),
    });
    const normalMedia = createMediaDropzone({
      id: 'pf-avatar-normal',
      label: 'Portrait Normal',
      hint: 'Rasio 4:5 · Maks. 5 MB',
      initialUrl: profile.avatar_normal_url,
      folder: 'profile',
      aspectClass: 'aspect-[4/5]',
      onUrlChange: () => markDirty(),
    });
    const alterMedia = createMediaDropzone({
      id: 'pf-avatar-alter',
      label: 'Portrait Alter-Ego',
      hint: 'Layer spotlight 4:5 · Maks. 5 MB',
      initialUrl: profile.avatar_alter_url,
      folder: 'profile',
      aspectClass: 'aspect-[4/5]',
      onUrlChange: () => markDirty(),
    });

    const mediaCard = createEl(
      'section',
      { className: 'studio-card p-5 sm:p-6 space-y-5' },
      createEl(
        'div',
        { className: 'pb-3 border-b border-[rgba(15,23,42,0.12)]' },
        createEl('h3', {
          className: 'font-display text-lg font-bold text-[#0B0F19]',
          text: 'Media & Portraits',
        }),
        createEl('p', {
          className: 'text-xs text-[#475569] mt-0.5',
          text: 'Seret foto langsung atau klik area unggah. Gambar otomatis tersimpan ke storage.',
        })
      ),
      createEl(
        'div',
        { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4' },
        heroMedia.el,
        normalMedia.el,
        alterMedia.el
      )
    );

    // Sub-Card 3: Tautan Sosial
    const socialRowsContainer = createEl('div', { className: 'divide-y-0' });
    let socialRowControllers = [];
    let nextSocialIndex = 0;

    const addSocialEntry = (socialData = {}, dirty = false) => {
      const idx = nextSocialIndex++;
      const ctrl = createSocialRow(
        socialData,
        idx,
        (targetEl) => {
          socialRowControllers = socialRowControllers.filter((c) => c.el !== targetEl);
          targetEl.remove();
          markDirty();
        },
        () => markDirty()
      );
      socialRowControllers.push(ctrl);
      socialRowsContainer.appendChild(ctrl.el);
      if (dirty) markDirty();
    };

    const existingSocials = Array.isArray(profile.socials) ? profile.socials : [];
    for (const s of existingSocials) {
      addSocialEntry(s, false);
    }

    const addSocialBtn = createEl(
      'button',
      { className: 'studio-btn-secondary text-xs min-h-[40px] px-3.5', attrs: { type: 'button' } },
      studioIcon('plus', 'w-4 h-4'),
      createEl('span', { text: 'Tambah Tautan' })
    );
    addSocialBtn.addEventListener('click', () =>
      addSocialEntry({ id: '', label: '', handle: '', url: '' }, true)
    );

    const socialsCard = createEl(
      'section',
      { className: 'studio-card p-5 sm:p-6 space-y-4' },
      createEl(
        'div',
        {
          className:
            'pb-3 border-b border-[rgba(15,23,42,0.12)] flex flex-wrap items-center justify-between gap-3',
        },
        createEl(
          'div',
          {},
          createEl('h3', {
            className: 'font-display text-lg font-bold text-[#0B0F19]',
            text: 'Tautan Sosial',
          }),
          createEl('p', {
            className: 'text-xs text-[#475569] mt-0.5',
            text: 'Ditampilkan pada kartu Find Me di bagian kontak.',
          })
        ),
        addSocialBtn
      ),
      socialRowsContainer
    );

    // =========================================================================
    // RIGHT COLUMN: STICKY LIVE MINI-PREVIEW CARD
    // =========================================================================
    const prevHeroImg = createEl('img', {
      className: 'w-20 h-24 object-contain shrink-0 select-none',
      attrs: { alt: 'Pratinjau Hero Cutout' },
    });
    const prevDisplayName = createEl('p', {
      className: 'font-display text-2xl font-bold uppercase text-[#FFFFFF] leading-none tracking-tight',
    });
    const prevFullNameHero = createEl('p', {
      className: 'text-xs text-[#CBD5E1] truncate',
    });
    const prevLocationHero = createEl('span', {
      className: 'font-mono-tabular text-[11px] text-[#93C5FD]',
    });

    const prevHandle = createEl('span', {
      className: 'font-mono-tabular text-xs font-semibold text-[#1D4ED8]',
    });
    const prevProfileTitle = createEl('h4', {
      className: 'font-display text-xl font-bold text-[#0B0F19]',
    });
    const prevTagline = createEl('p', {
      className: 'font-mono-tabular text-xs font-medium text-[#1D4ED8]',
    });
    const prevBio = createEl('p', {
      className: 'text-sm text-[#475569] leading-relaxed',
    });

    const prevStatusDot = createEl('span', {
      className: 'w-2.5 h-2.5 rounded-full shrink-0',
      attrs: { 'aria-hidden': 'true' },
    });
    const prevStatusText = createEl('span', {
      className: 'text-xs font-semibold text-[#0B0F19]',
    });
    const prevCoords = createEl('span', {
      className: 'font-mono-tabular text-xs text-[#FFFFFF]',
    });

    const prevAvatarNormal = createEl('img', {
      className: 'w-full aspect-[4/5] object-cover rounded-xl border-[1.5px] border-[#0F172A] bg-[#0B0F19]',
      attrs: { alt: 'Pratinjau Portrait Normal' },
    });
    const prevAvatarAlter = createEl('img', {
      className: 'w-full aspect-[4/5] object-cover rounded-xl border-[1.5px] border-[#0F172A] bg-[#0B0F19]',
      attrs: { alt: 'Pratinjau Portrait Alter-Ego' },
    });

    const previewAside = createEl(
      'aside',
      { className: 'xl:col-span-5 xl:sticky xl:top-24 space-y-4', attrs: { 'aria-label': 'Pratinjau langsung profil' } },
      createEl(
        'div',
        { className: 'studio-card overflow-hidden' },
        // Top Preview Header
        createEl(
          'div',
          {
            className:
              'px-5 py-3.5 bg-[#E0E7FF] border-b-[1.5px] border-[#0F172A] flex items-center justify-between gap-2',
          },
          createEl('span', {
            className: 'font-display text-sm font-bold text-[#0B0F19]',
            text: 'Pratinjau Langsung',
          }),
          createEl('span', {
            className: 'studio-pill text-[11px]',
            text: 'REAL-TIME',
          })
        ),
        // Mini Obsidian Hero Strip
        createEl(
          'div',
          { className: 'p-5 bg-[#0B0F19] border-b-[1.5px] border-[#0F172A] flex items-end justify-between gap-4' },
          createEl(
            'div',
            { className: 'space-y-1.5 min-w-0' },
            prevLocationHero,
            prevFullNameHero,
            prevDisplayName
          ),
          prevHeroImg
        ),
        // Mini Crisp White Profile Strip
        createEl(
          'div',
          { className: 'p-5 space-y-3 border-b-[1.5px] border-[#0F172A]' },
          createEl(
            'div',
            { className: 'flex items-center justify-between gap-2' },
            createEl('span', { className: 'studio-pill text-[11px]', text: 'PROFILE' }),
            prevHandle
          ),
          createEl('div', { className: 'space-y-0.5' }, prevProfileTitle, prevTagline),
          prevBio
        ),
        // Mini Cobalt Telemetry Strip
        createEl(
          'div',
          { className: 'p-4 bg-[#2563EB] border-b-[1.5px] border-[#0F172A] space-y-3' },
          createEl(
            'div',
            { className: 'flex items-center justify-between gap-2' },
            createEl('span', {
              className: 'font-mono-tabular text-xs font-medium text-[#FFFFFF]',
              text: 'LOKASI & STATUS',
            }),
            prevCoords
          ),
          createEl(
            'div',
            {
              className:
                'bg-[#FFFFFF] border-[1.5px] border-[#0F172A] rounded-xl px-3 py-2 flex items-center gap-2.5',
            },
            prevStatusDot,
            prevStatusText
          )
        ),
        // Mini Dual-Layer Portrait Pair
        createEl(
          'div',
          { className: 'p-5 bg-[#F8FAFC] space-y-2.5' },
          createEl('p', {
            className: 'font-mono-tabular text-xs font-semibold text-[#475569]',
            text: 'DUAL-LAYER PORTRAIT',
          }),
          createEl(
            'div',
            { className: 'grid grid-cols-2 gap-3' },
            createEl(
              'figure',
              { className: 'space-y-1 m-0' },
              prevAvatarNormal,
              createEl('figcaption', {
                className: 'text-xs font-medium text-[#475569] text-center',
                text: 'Normal',
              })
            ),
            createEl(
              'figure',
              { className: 'space-y-1 m-0' },
              prevAvatarAlter,
              createEl('figcaption', {
                className: 'text-xs font-medium text-[#475569] text-center',
                text: 'Alter-Ego',
              })
            )
          )
        )
      )
    );

    function syncPreview() {
      const displayName = displayNameInput.value.trim() || 'Satrio';
      const fullName = fullNameInput.value.trim() || 'Muhammad Syahdan Satrio Kuncoro';
      const handle = handleInput.value.trim() || '@satrio';
      const tagline = taglineInput.value.trim() || 'Web Development, Graphic Design, Motion Graphics';
      const bio = bioInput.value.trim() || 'Belum ada bio singkat.';
      const location = locationInput.value.trim() || 'Jakarta, Indonesia';
      const coords = coordsInput.value.trim() || '6.2088° S, 106.8456° E';
      const statusText = statusTextInput.value.trim() || 'Available for select projects';
      const isAvailable = availSwitch.getValue();

      prevDisplayName.textContent = displayName.toUpperCase();
      prevFullNameHero.textContent = fullName;
      prevLocationHero.textContent = location;
      prevHandle.textContent = handle;
      prevProfileTitle.textContent = displayName;
      prevTagline.textContent = tagline;
      prevBio.textContent = bio;
      prevCoords.textContent = coords;
      prevStatusText.textContent = statusText;
      prevStatusDot.className = isAvailable
        ? 'w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0'
        : 'w-2.5 h-2.5 rounded-full bg-[#64748B] shrink-0';

      prevHeroImg.src =
        safeUrl(heroMedia.getValue()) || assetUrl('/assets/hero-cutout-placeholder.svg');
      prevAvatarNormal.src =
        safeUrl(normalMedia.getValue()) || assetUrl('/assets/avatar-normal-placeholder.svg');
      prevAvatarAlter.src =
        safeUrl(alterMedia.getValue()) || assetUrl('/assets/avatar-alter-placeholder.svg');
    }

    for (const input of [
      displayNameInput,
      handleInput,
      fullNameInput,
      taglineInput,
      bioInput,
      locationInput,
      coordsInput,
      statusTextInput,
    ]) {
      input.addEventListener('input', markDirty);
    }

    // Sticky Save Bar
    const stickyResetBtn = createEl('button', {
      className: 'studio-btn-secondary text-xs min-h-[40px] px-3.5',
      text: 'Batalkan',
      attrs: { type: 'button' },
    });
    stickyResetBtn.addEventListener('click', () => {
      clearDirty();
      loadAndRender();
    });

    const stickySaveBtn = createEl(
      'button',
      { className: 'studio-btn-primary text-xs min-h-[40px] px-4', attrs: { type: 'submit' } },
      studioIcon('check', 'w-4 h-4'),
      createEl('span', { text: 'Simpan Perubahan' })
    );

    stickyBar = createEl(
      'div',
      { className: 'studio-sticky-bar', attrs: { role: 'region', 'aria-label': 'Aksi simpan profil' } },
      createEl(
        'div',
        { className: 'flex items-center gap-2.5' },
        createEl('span', {
          className: 'w-2.5 h-2.5 rounded-full bg-[#60A5FA] shrink-0',
          attrs: { 'aria-hidden': 'true' },
        }),
        createEl('span', {
          className: 'text-sm font-medium text-[#FFFFFF]',
          text: 'Ada perubahan yang belum disimpan',
        })
      ),
      createEl('div', { className: 'flex items-center gap-2' }, stickyResetBtn, stickySaveBtn)
    );

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      let socials = [];
      try {
        socials = socialRowControllers
          .map((c) => c.readValue())
          .filter((s) => s.label && s.handle)
          .map((s) => {
            if (s.url && !safeUrl(s.url)) {
              throw new Error(`Tautan "${s.label}" tidak valid. Gunakan https:// atau mailto:.`);
            }
            return s;
          });
      } catch (err) {
        showToast(err?.message || 'Format tautan sosial tidak valid.', 'error');
        return;
      }

      const payload = {
        id: 1,
        display_name: displayNameInput.value.trim(),
        full_name: fullNameInput.value.trim(),
        handle: handleInput.value.trim(),
        tagline: taglineInput.value.trim(),
        bio: bioInput.value.trim(),
        location_label: locationInput.value.trim(),
        coordinates_label: coordsInput.value.trim(),
        status_text: statusTextInput.value.trim(),
        is_available: availSwitch.getValue(),
        hero_cutout_url: heroMedia.getValue(),
        avatar_normal_url: normalMedia.getValue(),
        avatar_alter_url: alterMedia.getValue(),
        socials,
      };

      if (!payload.display_name || !payload.full_name || !payload.bio) {
        showToast('Nama panggilan, nama lengkap, dan bio singkat wajib diisi.', 'error');
        return;
      }

      headerSaveBtn.disabled = true;
      stickySaveBtn.disabled = true;
      stickySaveBtn.textContent = 'Menyimpan...';

      try {
        const { error: upsertErr } = await supabase
          .from('site_profile')
          .upsert(payload, { onConflict: 'id' });

        if (upsertErr) throw upsertErr;
        clearDirty();
        showToast('Profil & media berhasil disimpan.', 'success');
      } catch (err) {
        showToast(err?.message || 'Gagal menyimpan profil.', 'error');
      } finally {
        headerSaveBtn.disabled = false;
        stickySaveBtn.disabled = false;
        stickySaveBtn.replaceChildren(
          studioIcon('check', 'w-4 h-4'),
          createEl('span', { text: 'Simpan Perubahan' })
        );
      }
    });

    const leftColumn = createEl(
      'div',
      { className: 'xl:col-span-7 space-y-5 min-w-0' },
      identityCard,
      mediaCard,
      socialsCard
    );

    const splitGrid = createEl(
      'div',
      { className: 'grid grid-cols-1 xl:grid-cols-12 gap-5 items-start' },
      leftColumn,
      previewAside
    );

    form.append(pageHeader, splitGrid, stickyBar);
    syncPreview();
    container.replaceChildren(form);
  }

  await loadAndRender();
}
