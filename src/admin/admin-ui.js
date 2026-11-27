import { createEl, createSvgIcon, safeUrl } from '../lib/sanitize.js';
import {
  uploadPortfolioMedia,
  uploadPortfolioVideo,
  validateRasterFile,
  validateVideoFile,
} from '../lib/storage-upload.js';
import { parseVideoSource } from '../lib/video-utils.js';

const ICON_SHAPES = {
  plus: [
    { tag: 'line', attrs: { x1: '12', y1: '5', x2: '12', y2: '19' } },
    { tag: 'line', attrs: { x1: '5', y1: '12', x2: '19', y2: '12' } },
  ],
  upload: [
    { tag: 'path', attrs: { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' } },
    { tag: 'polyline', attrs: { points: '17 8 12 3 7 8' } },
    { tag: 'line', attrs: { x1: '12', y1: '3', x2: '12', y2: '15' } },
  ],
  edit: [
    { tag: 'path', attrs: { d: 'M12 20h9' } },
    { tag: 'path', attrs: { d: 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z' } },
  ],
  trash: [
    { tag: 'polyline', attrs: { points: '3 6 5 6 21 6' } },
    { tag: 'path', attrs: { d: 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' } },
    { tag: 'path', attrs: { d: 'M10 11v6' } },
    { tag: 'path', attrs: { d: 'M14 11v6' } },
  ],
  search: [
    { tag: 'circle', attrs: { cx: '11', cy: '11', r: '7' } },
    { tag: 'line', attrs: { x1: '21', y1: '21', x2: '16.65', y2: '16.65' } },
  ],
  external: [
    { tag: 'path', attrs: { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' } },
    { tag: 'polyline', attrs: { points: '15 3 21 3 21 9' } },
    { tag: 'line', attrs: { x1: '10', y1: '14', x2: '21', y2: '3' } },
  ],
  link: [
    { tag: 'path', attrs: { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' } },
    { tag: 'path', attrs: { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' } },
  ],
  mail: [
    { tag: 'rect', attrs: { x: '3', y: '5', width: '18', height: '14', rx: '2' } },
    { tag: 'polyline', attrs: { points: '3 7 12 13 21 7' } },
  ],
  check: [
    { tag: 'polyline', attrs: { points: '20 6 9 17 4 12' } },
  ],
  x: [
    { tag: 'line', attrs: { x1: '18', y1: '6', x2: '6', y2: '18' } },
    { tag: 'line', attrs: { x1: '6', y1: '6', x2: '18', y2: '18' } },
  ],
  image: [
    { tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18', rx: '2' } },
    { tag: 'circle', attrs: { cx: '8.5', cy: '8.5', r: '1.5' } },
    { tag: 'polyline', attrs: { points: '21 15 16 10 5 21' } },
  ],
  play: [
    { tag: 'polygon', attrs: { points: '6 4 20 12 6 20 6 4' } },
  ],
  alert: [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
    { tag: 'line', attrs: { x1: '12', y1: '8', x2: '12', y2: '12' } },
    { tag: 'line', attrs: { x1: '12', y1: '16', x2: '12.01', y2: '16' } },
  ],
  mapPin: [
    { tag: 'path', attrs: { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' } },
    { tag: 'circle', attrs: { cx: '12', cy: '10', r: '3' } },
  ],
  rotate: [
    { tag: 'path', attrs: { d: 'M21 12a9 9 0 1 1-2.64-6.36L21 8' } },
    { tag: 'polyline', attrs: { points: '21 3 21 8 16 8' } },
  ],
};

export function studioIcon(name, className = 'w-4 h-4 shrink-0') {
  return createSvgIcon({
    viewBox: '0 0 24 24',
    className,
    stroke: 'currentColor',
    strokeWidth: '2',
    shapes: ICON_SHAPES[name] || ICON_SHAPES.check,
  });
}

let toastTimer = 0;

export function showToast(message, variant = 'success') {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;

  if (toastTimer) {
    window.clearTimeout(toastTimer);
    toastTimer = 0;
  }

  toast.className = 'studio-toast';
  if (variant === 'error') toast.classList.add('is-error');
  else if (variant === 'info') toast.classList.add('is-info');
  else toast.classList.add('is-success');

  const iconName = variant === 'error' ? 'alert' : 'check';
  const closeBtn = createEl(
    'button',
    {
      className:
        'ml-auto inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-[rgba(15,23,42,0.08)] shrink-0',
      attrs: { type: 'button', 'aria-label': 'Tutup notifikasi' },
    },
    studioIcon('x', 'w-4 h-4')
  );
  closeBtn.addEventListener('click', clearToast);

  toast.replaceChildren(
    studioIcon(iconName, 'w-4 h-4 shrink-0'),
    createEl('span', { className: 'leading-snug', text: message }),
    closeBtn
  );
  toast.hidden = false;

  toastTimer = window.setTimeout(() => {
    clearToast();
  }, 4600);
}

export function clearToast() {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  if (toastTimer) {
    window.clearTimeout(toastTimer);
    toastTimer = 0;
  }
  toast.hidden = true;
  toast.replaceChildren();
}

export function formatWibDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function confirmAction({
  title = 'Konfirmasi Penghapusan',
  message = 'Tindakan ini tidak dapat dibatalkan.',
  confirmLabel = 'Hapus Permanen',
}) {
  const dialog = document.getElementById('admin-confirm-dialog');
  const titleEl = document.getElementById('admin-confirm-title');
  const msgEl = document.getElementById('admin-confirm-message');
  const cancelBtn = document.getElementById('admin-confirm-cancel');
  const okBtn = document.getElementById('admin-confirm-ok');

  if (!dialog || !cancelBtn || !okBtn) {
    return Promise.resolve(false);
  }

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  okBtn.textContent = confirmLabel;

  const opener = document.activeElement;

  return new Promise((resolve) => {
    const cleanup = (result) => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('click', onBackdrop);
      cancelBtn.removeEventListener('click', onCancel);
      okBtn.removeEventListener('click', onConfirm);
      if (dialog.open) dialog.close();
      if (opener && typeof opener.focus === 'function') opener.focus();
      resolve(result);
    };

    const onCancel = (e) => {
      e?.preventDefault?.();
      cleanup(false);
    };

    const onBackdrop = (e) => {
      if (e.target === dialog) cleanup(false);
    };

    const onConfirm = () => cleanup(true);

    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('click', onBackdrop);
    cancelBtn.addEventListener('click', onCancel);
    okBtn.addEventListener('click', onConfirm);

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    cancelBtn.focus();
  });
}

export function renderLoadingState(container, text = 'Memuat data...') {
  container.replaceChildren(
    createEl(
      'div',
      { className: 'studio-card p-8 flex items-center gap-3 text-sm font-medium text-[#475569]' },
      createEl('span', {
        className: 'w-2.5 h-2.5 rounded-full bg-[#2563EB] shrink-0',
        attrs: { 'aria-hidden': 'true' },
      }),
      createEl('span', { text })
    )
  );
}

export function renderEmptyState(
  container,
  message,
  { title = 'Belum ada data', actionLabel = null, onAction = null } = {}
) {
  const box = createEl(
    'div',
    { className: 'studio-card p-8 sm:p-10 text-center space-y-3' },
    createEl('h3', { className: 'font-display text-lg font-bold text-[#0B0F19]', text: title }),
    createEl('p', { className: 'text-sm text-[#475569] max-w-md mx-auto', text: message })
  );

  if (actionLabel && typeof onAction === 'function') {
    const btn = createEl(
      'button',
      { className: 'studio-btn-primary text-sm mt-2', attrs: { type: 'button' } },
      studioIcon('plus', 'w-4 h-4'),
      createEl('span', { text: actionLabel })
    );
    btn.addEventListener('click', onAction);
    box.appendChild(btn);
  }

  container.replaceChildren(box);
}

export function renderErrorState(container, message, onRetry) {
  const box = createEl(
    'div',
    { className: 'studio-card p-6 space-y-3 border-[#B91C1C] bg-[#FEF2F2]' },
    createEl(
      'div',
      { className: 'flex items-start gap-2.5 text-[#B91C1C]' },
      studioIcon('alert', 'w-5 h-5 mt-0.5 shrink-0'),
      createEl('p', { className: 'text-sm font-semibold', text: message })
    )
  );

  if (typeof onRetry === 'function') {
    const btn = createEl('button', {
      className: 'studio-btn-secondary text-sm',
      text: 'Muat Ulang',
      attrs: { type: 'button' },
    });
    btn.addEventListener('click', onRetry);
    box.appendChild(btn);
  }

  container.replaceChildren(box);
}

export function createFieldGroup(id, label, control, hint = '') {
  const wrap = createEl('div', { className: 'space-y-1.5' });
  wrap.appendChild(
    createEl('label', {
      className: 'block text-sm font-semibold text-[#0B0F19]',
      text: label,
      attrs: { for: id },
    })
  );
  wrap.appendChild(control);
  if (hint) {
    wrap.appendChild(createEl('p', { className: 'text-xs text-[#475569]', text: hint }));
  }
  return wrap;
}

/**
 * Tactile accessible Toggle Switch (replaces raw browser checkboxes).
 */
export function createToggleSwitch({
  id = '',
  label = '',
  description = '',
  checked = false,
  compact = false,
  onChange = null,
}) {
  let state = Boolean(checked);

  const track = createEl(
    'span',
    { className: 'studio-switch-track', attrs: { 'aria-hidden': 'true' } },
    createEl('span', { className: 'studio-switch-knob' })
  );

  const labelWrap = createEl('span', { className: 'min-w-0' });
  if (label) {
    labelWrap.appendChild(
      createEl('span', {
        className: compact
          ? 'block text-xs font-semibold text-[#0B0F19]'
          : 'block text-sm font-semibold text-[#0B0F19]',
        text: label,
      })
    );
  }
  if (description) {
    labelWrap.appendChild(
      createEl('span', {
        className: 'block text-xs text-[#475569]',
        text: description,
      })
    );
  }

  const button = createEl(
    'button',
    {
      className: 'studio-switch-row',
      attrs: {
        type: 'button',
        role: 'switch',
        'aria-checked': String(state),
        ...(id ? { id } : {}),
      },
    },
    track,
    labelWrap
  );

  function setValue(next, emit = false) {
    state = Boolean(next);
    button.setAttribute('aria-checked', String(state));
    if (emit && typeof onChange === 'function') {
      onChange(state);
    }
  }

  button.addEventListener('click', () => {
    if (button.disabled) return;
    setValue(!state, true);
  });

  return {
    el: button,
    getValue: () => state,
    setValue: (next) => setValue(next, false),
    setDisabled: (disabled) => {
      button.disabled = Boolean(disabled);
    },
  };
}

/**
 * Tactile Segmented Pill Control (replaces raw <select> dropdowns for short option sets).
 */
export function createSegmentedControl({
  ariaLabel = 'Pilihan',
  options = [],
  value = '',
  onChange = null,
}) {
  let currentValue = value || options[0]?.value || '';
  const group = createEl('div', {
    className: 'studio-segmented',
    attrs: { role: 'group', 'aria-label': ariaLabel },
  });

  const buttons = new Map();

  function syncVisuals() {
    for (const [val, btn] of buttons.entries()) {
      btn.setAttribute('aria-pressed', String(val === currentValue));
    }
  }

  for (const opt of options) {
    const btn = createEl(
      'button',
      {
        className: 'studio-segment-btn',
        attrs: {
          type: 'button',
          'aria-pressed': String(opt.value === currentValue),
        },
      },
      createEl('span', { text: opt.label }),
      opt.badge !== undefined
        ? createEl('span', {
            className: 'font-mono-tabular text-xs opacity-85',
            text: `(${opt.badge})`,
          })
        : null
    );

    btn.addEventListener('click', () => {
      if (currentValue === opt.value) return;
      currentValue = opt.value;
      syncVisuals();
      if (typeof onChange === 'function') {
        onChange(currentValue);
      }
    });

    buttons.set(opt.value, btn);
    group.appendChild(btn);
  }

  return {
    el: group,
    getValue: () => currentValue,
    setValue: (next) => {
      currentValue = next;
      syncVisuals();
    },
  };
}

/**
 * Visual Drag-and-Drop Media Dropzone connected to Supabase Storage `portfolio-media`.
 * Preserves raster-only MIME & 5MB validation via storage-upload.js.
 */
export function createMediaDropzone({
  id,
  label,
  hint = 'JPG, PNG, WebP, atau AVIF · Maks. 5 MB',
  initialUrl = '',
  folder = 'general',
  aspectClass = 'aspect-[4/3]',
  onUrlChange = null,
}) {
  let currentUrl = initialUrl || '';

  const wrapper = createEl('div', { className: 'space-y-2' });
  const headerRow = createEl(
    'div',
    { className: 'flex items-center justify-between gap-2' },
    createEl('label', {
      className: 'block text-sm font-semibold text-[#0B0F19]',
      text: label,
      attrs: { for: `${id}-file` },
    })
  );

  const fileInput = createEl('input', {
    className: 'sr-only',
    attrs: {
      id: `${id}-file`,
      type: 'file',
      accept: 'image/jpeg,image/png,image/webp,image/avif',
    },
  });

  const dropzone = createEl('div', { className: 'studio-dropzone' });

  // Preview mode elements
  const previewContainer = createEl('div', { className: 'relative' });
  const previewImg = createEl('img', {
    className: `w-full ${aspectClass} object-cover bg-[#0B0F19] block`,
    attrs: { alt: `Pratinjau ${label}` },
  });

  const previewActions = createEl('div', {
    className:
      'p-2.5 bg-[#FFFFFF] border-t border-[rgba(15,23,42,0.12)] flex items-center justify-between gap-2',
  });

  const replaceBtn = createEl(
    'button',
    { className: 'studio-btn-secondary text-xs min-h-[38px] px-3 flex-1', attrs: { type: 'button' } },
    studioIcon('upload', 'w-3.5 h-3.5'),
    createEl('span', { text: 'Ganti Foto' })
  );
  replaceBtn.addEventListener('click', () => fileInput.click());

  const clearBtn = createEl(
    'button',
    {
      className: 'studio-btn-danger-outline text-xs min-h-[38px] px-3',
      attrs: { type: 'button', 'aria-label': `Hapus ${label}` },
    },
    studioIcon('trash', 'w-3.5 h-3.5')
  );
  clearBtn.addEventListener('click', () => {
    setValue('', true);
    statusText.hidden = true;
    statusText.textContent = '';
  });

  previewActions.append(replaceBtn, clearBtn);
  previewContainer.append(previewImg, previewActions);

  // Empty upload trigger surface
  const emptySurface = createEl(
    'button',
    {
      className: `w-full ${aspectClass} p-4 flex flex-col items-center justify-center text-center gap-2 bg-transparent border-0`,
      attrs: { type: 'button' },
    },
    createEl(
      'span',
      {
        className:
          'w-11 h-11 rounded-full bg-[#DBEAFE] border-[1.5px] border-[#0F172A] flex items-center justify-center text-[#1D4ED8]',
      },
      studioIcon('upload', 'w-5 h-5')
    ),
    createEl('span', {
      className: 'text-sm font-semibold text-[#0B0F19] leading-snug',
      text: 'Klik atau seret gambar ke sini',
    }),
    createEl('span', {
      className: 'text-xs text-[#475569]',
      text: hint,
    })
  );
  emptySurface.addEventListener('click', () => fileInput.click());

  dropzone.append(previewContainer, emptySurface, fileInput);

  // Secondary collapsible manual URL input
  const manualToggle = createEl(
    'button',
    {
      className:
        'inline-flex items-center gap-1.5 text-xs font-medium text-[#1D4ED8] hover:underline py-1',
      attrs: { type: 'button', 'aria-expanded': 'false' },
    },
    studioIcon('link', 'w-3.5 h-3.5'),
    createEl('span', { text: 'Atau tempel tautan gambar manual' })
  );

  const manualWrap = createEl('div', { className: 'pt-1' });
  manualWrap.hidden = true;

  const urlInput = createEl('input', {
    className: 'studio-input font-mono-tabular text-xs min-h-[40px] py-2',
    attrs: {
      id,
      type: 'url',
      placeholder: 'https://...',
      value: currentUrl,
      'aria-label': `Tautan manual ${label}`,
    },
  });
  manualWrap.appendChild(urlInput);

  manualToggle.addEventListener('click', () => {
    const nextOpen = manualWrap.hidden;
    manualWrap.hidden = !nextOpen;
    manualToggle.setAttribute('aria-expanded', String(nextOpen));
    if (nextOpen) urlInput.focus();
  });

  const statusText = createEl('p', {
    className: 'text-xs text-[#475569]',
    text: '',
  });
  statusText.hidden = true;

  function syncPreview() {
    const valid = safeUrl(currentUrl);
    if (valid) {
      previewImg.src = valid;
      previewContainer.hidden = false;
      emptySurface.hidden = true;
      dropzone.classList.add('has-image');
    } else {
      previewImg.removeAttribute('src');
      previewContainer.hidden = true;
      emptySurface.hidden = false;
      dropzone.classList.remove('has-image');
    }
  }

  function setValue(next, emit = false) {
    currentUrl = next || '';
    urlInput.value = currentUrl;
    syncPreview();
    if (emit && typeof onUrlChange === 'function') {
      onUrlChange(currentUrl);
    }
  }

  async function handleFile(file) {
    if (!file) return;
    const check = validateRasterFile(file);
    if (!check.ok) {
      statusText.hidden = false;
      statusText.textContent = check.error;
      statusText.className = 'text-xs font-medium text-[#B91C1C]';
      return;
    }

    replaceBtn.disabled = true;
    emptySurface.disabled = true;
    fileInput.disabled = true;
    statusText.hidden = false;
    statusText.textContent = `Mengunggah ${file.name}...`;
    statusText.className = 'text-xs font-medium text-[#1D4ED8]';

    try {
      const { publicUrl } = await uploadPortfolioMedia(file, folder);
      setValue(publicUrl, true);
      statusText.hidden = false;
      statusText.textContent = 'Gambar berhasil diunggah.';
      statusText.className = 'text-xs font-medium text-[#065F46]';
    } catch (err) {
      statusText.hidden = false;
      statusText.textContent = err?.message || 'Gagal mengunggah gambar.';
      statusText.className = 'text-xs font-medium text-[#B91C1C]';
    } finally {
      replaceBtn.disabled = false;
      emptySurface.disabled = false;
      fileInput.disabled = false;
      fileInput.value = '';
    }
  }

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) handleFile(file);
  });

  urlInput.addEventListener('input', () => {
    currentUrl = urlInput.value.trim();
    syncPreview();
    if (typeof onUrlChange === 'function') {
      onUrlChange(currentUrl);
    }
  });

  // Drag & drop support
  for (const evName of ['dragenter', 'dragover']) {
    dropzone.addEventListener(evName, (event) => {
      event.preventDefault();
      dropzone.classList.add('is-dragover');
    });
  }
  for (const evName of ['dragleave', 'drop']) {
    dropzone.addEventListener(evName, (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-dragover');
    });
  }
  dropzone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  syncPreview();
  wrapper.append(headerRow, dropzone, statusText, manualToggle, manualWrap);

  return {
    el: wrapper,
    getValue: () => urlInput.value.trim() || null,
    setValue: (next) => setValue(next, false),
  };
}

/**
 * Mobile-friendly Video Upload & Embed URL field (MP4/WebM/MOV <= 50 MB or YouTube / Google Drive link).
 */
export function createVideoField({
  id,
  label = 'Video Karya (opsional)',
  hint = 'Unggah MP4/WebM/MOV (Maks. 50 MB) atau tempel tautan YouTube / Google Drive.',
  initialUrl = '',
  folder = 'videos',
}) {
  let currentUrl = initialUrl || '';

  const wrapper = createEl('div', { className: 'space-y-2' });
  const headerRow = createEl(
    'div',
    { className: 'flex items-center justify-between gap-2' },
    createEl('label', {
      className: 'block text-sm font-semibold text-[#0B0F19]',
      text: label,
      attrs: { for: id },
    }),
    createEl('span', {
      className: 'font-mono-tabular text-[11px] font-semibold text-[#475569]',
      text: 'MP4 · YouTube · Drive',
    })
  );

  const fileInput = createEl('input', {
    className: 'sr-only',
    attrs: {
      id: `${id}-file`,
      type: 'file',
      accept: 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov',
    },
  });

  const previewBox = createEl('div', {
    className:
      'rounded-2xl border-[1.5px] border-[#0F172A] bg-[#0B0F19] overflow-hidden',
  });
  previewBox.hidden = true;

  const previewStage = createEl('div', { className: 'w-full' });

  const previewBar = createEl('div', {
    className:
      'px-3 py-2 bg-[#FFFFFF] border-t border-[rgba(15,23,42,0.12)] flex items-center justify-between gap-2',
  });
  const previewSourcePill = createEl('span', {
    className: 'studio-pill studio-pill-sky',
    text: 'Video',
  });
  const clearBtn = createEl(
    'button',
    {
      className: 'studio-btn-danger-outline text-xs min-h-[36px] px-3',
      attrs: { type: 'button', 'aria-label': 'Hapus tautan video' },
    },
    studioIcon('trash', 'w-3.5 h-3.5'),
    createEl('span', { text: 'Hapus' })
  );
  previewBar.append(previewSourcePill, clearBtn);
  previewBox.append(previewStage, previewBar);

  const uploadBtn = createEl(
    'button',
    {
      className: 'studio-btn-secondary text-xs min-h-[44px] w-full justify-center',
      attrs: { type: 'button' },
    },
    studioIcon('upload', 'w-4 h-4'),
    createEl('span', { text: 'Unggah Video dari Galeri (MP4 / WebM · Maks. 50 MB)' })
  );
  uploadBtn.addEventListener('click', () => fileInput.click());

  const urlInput = createEl('input', {
    className: 'studio-input font-mono-tabular text-xs min-h-[44px] py-2',
    attrs: {
      id,
      type: 'url',
      placeholder: 'Atau tempel link YouTube / Google Drive / MP4 (https://...)',
      value: currentUrl,
      'aria-label': label,
    },
  });

  const hintEl = createEl('p', {
    className: 'text-xs text-[#475569]',
    text: hint,
  });

  const statusText = createEl('p', {
    className: 'text-xs font-medium text-[#475569]',
    text: '',
  });
  statusText.hidden = true;

  function syncPreview() {
    previewStage.replaceChildren();
    const trimmed = currentUrl.trim();
    if (!trimmed) {
      previewBox.hidden = true;
      return;
    }

    const parsed = parseVideoSource(trimmed);
    if (!parsed) {
      previewBox.hidden = true;
      return;
    }

    previewBox.hidden = false;
    previewSourcePill.textContent = `Siap diputar · ${parsed.label}`;

    if (parsed.type === 'direct') {
      const videoEl = createEl('video', {
        className: 'w-full max-h-48 bg-[#0B0F19] block mx-auto',
        attrs: {
          controls: '',
          playsinline: '',
          preload: 'metadata',
        },
      });
      videoEl.appendChild(createEl('source', { attrs: { src: parsed.src } }));
      previewStage.appendChild(videoEl);
    } else {
      const embedWrap = createEl('div', {
        className: 'w-full aspect-video max-h-48 bg-[#0B0F19]',
      });
      embedWrap.appendChild(
        createEl('iframe', {
          className: 'w-full h-full border-0 block',
          attrs: {
            src: parsed.embedUrl,
            title: `Pratinjau ${parsed.label}`,
            loading: 'lazy',
            referrerpolicy: 'strict-origin-when-cross-origin',
            allowfullscreen: '',
          },
        })
      );
      previewStage.appendChild(embedWrap);
    }
  }

  function setValue(next) {
    currentUrl = next || '';
    urlInput.value = currentUrl;
    syncPreview();
  }

  clearBtn.addEventListener('click', () => {
    setValue('');
    statusText.hidden = true;
    statusText.textContent = '';
  });

  urlInput.addEventListener('input', () => {
    currentUrl = urlInput.value.trim();
    syncPreview();
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const check = validateVideoFile(file);
    if (!check.ok) {
      statusText.hidden = false;
      statusText.textContent = check.error;
      statusText.className = 'text-xs font-medium text-[#B91C1C]';
      fileInput.value = '';
      return;
    }

    uploadBtn.disabled = true;
    fileInput.disabled = true;
    statusText.hidden = false;
    statusText.textContent = `Mengunggah video ${file.name}...`;
    statusText.className = 'text-xs font-medium text-[#1D4ED8]';

    try {
      const { publicUrl } = await uploadPortfolioVideo(file, folder);
      setValue(publicUrl);
      statusText.hidden = false;
      statusText.textContent = 'Video berhasil diunggah dan siap diputar.';
      statusText.className = 'text-xs font-medium text-[#065F46]';
    } catch (err) {
      statusText.hidden = false;
      statusText.textContent = err?.message || 'Gagal mengunggah video.';
      statusText.className = 'text-xs font-medium text-[#B91C1C]';
    } finally {
      uploadBtn.disabled = false;
      fileInput.disabled = false;
      fileInput.value = '';
    }
  });

  syncPreview();
  wrapper.append(headerRow, previewBox, uploadBtn, fileInput, urlInput, hintEl, statusText);

  return {
    el: wrapper,
    getValue: () => urlInput.value.trim() || null,
    setValue,
  };
}

/**
 * Reusable Slide-Over Drawer for Create/Edit workflows.
 */
let activeDrawerCleanup = null;

export function closeSlideDrawer() {
  if (typeof activeDrawerCleanup === 'function') {
    activeDrawerCleanup();
  }
}

export function openSlideDrawer({
  title = '',
  subtitle = '',
  contentEl = null,
  footerEl = null,
  onClose = null,
}) {
  const root = document.getElementById('admin-drawer-root');
  const backdrop = document.getElementById('admin-drawer-backdrop');
  const panel = document.getElementById('admin-drawer-panel');
  const titleEl = document.getElementById('admin-drawer-title');
  const subtitleEl = document.getElementById('admin-drawer-subtitle');
  const bodyEl = document.getElementById('admin-drawer-body');
  const footerWrap = document.getElementById('admin-drawer-footer');
  const closeBtn = document.getElementById('admin-drawer-close');

  if (!root || !panel || !bodyEl || !footerWrap) return;

  if (typeof activeDrawerCleanup === 'function') {
    activeDrawerCleanup(true);
  }

  const opener = document.activeElement;
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) {
    subtitleEl.textContent = subtitle;
    subtitleEl.hidden = !subtitle;
  }

  bodyEl.replaceChildren();
  if (contentEl) bodyEl.appendChild(contentEl);

  footerWrap.replaceChildren();
  if (footerEl) {
    footerWrap.hidden = false;
    footerWrap.appendChild(footerEl);
  } else {
    footerWrap.hidden = true;
  }

  root.hidden = false;
  root.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  window.requestAnimationFrame(() => {
    root.classList.add('is-open');
  });

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusables = Array.from(
      panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onBackdropClick = () => close();
  const onCloseClick = () => close();

  let closed = false;
  function close(immediate = false) {
    if (closed) return;
    closed = true;
    activeDrawerCleanup = null;

    document.removeEventListener('keydown', onKeyDown);
    backdrop?.removeEventListener('click', onBackdropClick);
    closeBtn?.removeEventListener('click', onCloseClick);
    root.classList.remove('is-open');
    document.body.style.overflow = '';

    const finishHide = () => {
      if (!root.classList.contains('is-open')) {
        root.hidden = true;
        root.setAttribute('aria-hidden', 'true');
        bodyEl.replaceChildren();
        footerWrap.replaceChildren();
      }
      if (!immediate && opener && typeof opener.focus === 'function') {
        opener.focus();
      }
      if (!immediate && typeof onClose === 'function') {
        onClose();
      }
    };

    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishHide();
    } else {
      window.setTimeout(finishHide, 260);
    }
  }

  activeDrawerCleanup = close;

  document.addEventListener('keydown', onKeyDown);
  backdrop?.addEventListener('click', onBackdropClick);
  closeBtn?.addEventListener('click', onCloseClick);

  const firstInput = bodyEl.querySelector('input:not([type="file"]):not([hidden]), textarea, button');
  if (firstInput && typeof firstInput.focus === 'function') {
    window.setTimeout(() => firstInput.focus(), 60);
  } else if (closeBtn) {
    closeBtn.focus();
  }
}
