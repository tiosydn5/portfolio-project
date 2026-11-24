import { createEl, safeUrl } from '../lib/sanitize.js';
import { uploadPortfolioMedia, validateRasterFile } from '../lib/storage-upload.js';

export function showToast(message, variant = 'success') {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;

  toast.hidden = false;
  toast.textContent = message;
  toast.className = 'admin-panel px-4 py-3 text-sm font-medium';

  if (variant === 'error') {
    toast.classList.add('text-[#FCA5A5]', 'border-[#B91C1C]');
  } else if (variant === 'info') {
    toast.classList.add('text-[#60A5FA]');
  } else {
    toast.classList.add('text-[#34D399]', 'border-[rgba(16,185,129,0.45)]');
  }
}

export function clearToast() {
  const toast = document.getElementById('admin-toast');
  if (!toast) return;
  toast.hidden = true;
  toast.textContent = '';
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

    const onConfirm = () => cleanup(true);

    dialog.addEventListener('cancel', onCancel);
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

export function renderLoadingState(container, text = 'Memuat data dari Supabase...') {
  container.replaceChildren(
    createEl('div', {
      className: 'admin-panel p-6 text-sm text-[#94A3B8]',
      text,
    })
  );
}

export function renderEmptyState(container, message) {
  container.replaceChildren(
    createEl('div', {
      className: 'admin-panel p-6 text-sm text-[#94A3B8]',
      text: message,
    })
  );
}

export function renderErrorState(container, message, onRetry) {
  const box = createEl(
    'div',
    { className: 'admin-panel p-6 space-y-3 border-[#B91C1C]' },
    createEl('p', { className: 'text-sm text-[#FCA5A5]', text: message })
  );

  if (typeof onRetry === 'function') {
    const btn = createEl('button', {
      className: 'admin-btn-secondary text-sm',
      text: 'Coba Muat Ulang',
      attrs: { type: 'button' },
    });
    btn.addEventListener('click', onRetry);
    box.appendChild(btn);
  }

  container.replaceChildren(box);
}

/**
 * Reusable raster image upload control connected to Supabase bucket `portfolio-media`.
 * Validates JPEG/PNG/WebP/AVIF and <= 5MB before uploading.
 */
export function createMediaUploadField({
  id,
  label,
  initialUrl = '',
  folder = 'general',
  onUrlChange = null,
}) {
  let currentUrl = initialUrl || '';

  const wrapper = createEl('div', { className: 'space-y-2' });
  const labelEl = createEl('label', {
    className: 'block text-sm font-medium text-[#F8FAFC]',
    text: label,
    attrs: { for: id },
  });

  const urlInput = createEl('input', {
    className: 'admin-input font-mono-tabular text-sm',
    attrs: {
      id,
      type: 'url',
      placeholder: 'https://... atau upload file raster (max 5MB)',
      value: currentUrl,
    },
  });

  const row = createEl('div', { className: 'flex flex-wrap items-center gap-3' });

  const fileInput = createEl('input', {
    className: 'sr-only',
    attrs: {
      id: `${id}-file`,
      type: 'file',
      accept: 'image/jpeg,image/png,image/webp,image/avif',
    },
  });

  const uploadBtn = createEl('label', {
    className: 'admin-btn-secondary text-xs px-3.5',
    text: 'Upload Gambar (Max 5MB)',
    attrs: { for: `${id}-file` },
  });

  const previewImg = createEl('img', {
    className: 'w-14 h-14 rounded-lg object-cover bg-[#151B28] border border-[rgba(148,163,184,0.24)]',
    attrs: {
      alt: `Preview ${label}`,
      width: '56',
      height: '56',
    },
  });

  const statusText = createEl('p', {
    className: 'text-xs text-[#7B8CA4]',
    text: 'Format: JPEG, PNG, WebP, atau AVIF.',
  });

  function syncPreview(url) {
    const valid = safeUrl(url);
    if (valid) {
      previewImg.src = valid;
      previewImg.hidden = false;
    } else {
      previewImg.hidden = true;
    }
  }

  urlInput.addEventListener('input', () => {
    currentUrl = urlInput.value.trim();
    syncPreview(currentUrl);
    if (typeof onUrlChange === 'function') onUrlChange(currentUrl);
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const check = validateRasterFile(file);
    if (!check.ok) {
      statusText.textContent = check.error;
      statusText.className = 'text-xs text-[#FCA5A5]';
      fileInput.value = '';
      return;
    }

    uploadBtn.textContent = 'Mengupload...';
    fileInput.disabled = true;
    statusText.textContent = `Mengupload ${file.name}...`;
    statusText.className = 'text-xs text-[#60A5FA]';

    try {
      const { publicUrl } = await uploadPortfolioMedia(file, folder);
      currentUrl = publicUrl;
      urlInput.value = publicUrl;
      syncPreview(publicUrl);
      statusText.textContent = 'Upload berhasil ke portfolio-media.';
      statusText.className = 'text-xs text-[#34D399]';
      if (typeof onUrlChange === 'function') onUrlChange(publicUrl);
    } catch (err) {
      statusText.textContent = err?.message || 'Upload gagal.';
      statusText.className = 'text-xs text-[#FCA5A5]';
    } finally {
      uploadBtn.textContent = 'Upload Gambar (Max 5MB)';
      fileInput.disabled = false;
      fileInput.value = '';
    }
  });

  syncPreview(currentUrl);
  row.append(previewImg, uploadBtn, fileInput);
  wrapper.append(labelEl, urlInput, row, statusText);

  return {
    el: wrapper,
    getValue: () => urlInput.value.trim() || null,
    setValue: (next) => {
      currentUrl = next || '';
      urlInput.value = currentUrl;
      syncPreview(currentUrl);
    },
  };
}
