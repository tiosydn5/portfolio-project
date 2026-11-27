import { isSupabaseConfigured, supabase } from './supabase.js';

export const BUCKET_NAME = 'portfolio-media';
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export function validateRasterFile(file) {
  if (!file) {
    return { ok: false, error: 'Pilih file gambar terlebih dahulu.', ext: null };
  }

  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) {
    return {
      ok: false,
      error: 'Format tidak didukung. Hanya JPEG, PNG, WebP, atau AVIF (SVG ditolak demi keamanan).',
      ext: null,
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      ok: false,
      error: `Ukuran file ${sizeMb} MB melebihi batas maksimal 5 MB.`,
      ext: null,
    };
  }

  return { ok: true, error: null, ext };
}

export async function uploadPortfolioMedia(file, folder = 'general') {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi pada .env.');
  }

  const check = validateRasterFile(file);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const safeFolder = String(folder || 'general').replace(/[^a-z0-9/_-]/gi, '').toLowerCase() || 'general';
  const rand =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  const path = `${safeFolder}/${Date.now()}-${rand}.${check.ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Upload gagal: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('URL publik gambar tidak tersedia dari Supabase Storage.');
  }

  return { publicUrl: data.publicUrl, path };
}

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const ALLOWED_VIDEO_MIME_TYPES = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

export function validateVideoFile(file) {
  if (!file) {
    return { ok: false, error: 'Pilih file video terlebih dahulu.', ext: null };
  }

  let ext = ALLOWED_VIDEO_MIME_TYPES[file.type];
  if (!ext && typeof file.name === 'string') {
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.mp4')) ext = 'mp4';
    else if (lower.endsWith('.webm')) ext = 'webm';
    else if (lower.endsWith('.mov')) ext = 'mov';
  }

  if (!ext) {
    return {
      ok: false,
      error: 'Format video tidak didukung. Gunakan MP4, WebM, atau MOV.',
      ext: null,
    };
  }

  if (file.size > MAX_VIDEO_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      ok: false,
      error: `Ukuran video ${sizeMb} MB melebihi batas maksimal 50 MB. Untuk video besar, tempel tautan YouTube atau Google Drive.`,
      ext: null,
    };
  }

  return { ok: true, error: null, ext };
}

export async function uploadPortfolioVideo(file, folder = 'videos') {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi pada .env.');
  }

  const check = validateVideoFile(file);
  if (!check.ok) {
    throw new Error(check.error);
  }

  const safeFolder =
    String(folder || 'videos')
      .replace(/[^a-z0-9/_-]/gi, '')
      .toLowerCase() || 'videos';
  const rand =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  const path = `${safeFolder}/${Date.now()}-${rand}.${check.ext}`;
  const contentType =
    file.type && ALLOWED_VIDEO_MIME_TYPES[file.type]
      ? file.type
      : check.ext === 'webm'
        ? 'video/webm'
        : check.ext === 'mov'
          ? 'video/quicktime'
          : 'video/mp4';

  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
    cacheControl: '3600',
    contentType,
    upsert: false,
  });

  if (uploadError) {
    const rawMsg = uploadError.message || '';
    if (rawMsg.toLowerCase().includes('mime') || rawMsg.toLowerCase().includes('size')) {
      throw new Error(
        `Upload video ditolak Storage (${rawMsg}). Pastikan SQL supabase/add_video_support.sql sudah dijalankan di Supabase.`
      );
    }
    throw new Error(`Upload video gagal: ${rawMsg}`);
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('URL publik video tidak tersedia dari Supabase Storage.');
  }

  return { publicUrl: data.publicUrl, path };
}

