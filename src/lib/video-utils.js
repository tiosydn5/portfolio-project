import { safeUrl } from './sanitize.js';

const DIRECT_VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i;
const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const GDRIVE_ID_RE = /^[a-zA-Z0-9_-]{10,}$/;
const VIMEO_ID_RE = /^\d{6,12}$/;

/**
 * Parse a video URL into a safe, embeddable/playable descriptor.
 * Supports:
 * - Direct video files (.mp4, .webm, .mov, .m4v) & Supabase Storage /videos/ uploads
 * - YouTube (watch, youtu.be, shorts, embed)
 * - Google Drive (/file/d/<id>/..., /open?id=<id>)
 * - Vimeo (vimeo.com/<id>)
 */
export function parseVideoSource(rawUrl) {
  const href = safeUrl(rawUrl);
  if (!href) return null;

  // Local static video asset under /assets/...
  if (href.startsWith('/') || href.startsWith('./')) {
    if (DIRECT_VIDEO_EXT_RE.test(href)) {
      return {
        type: 'direct',
        label: 'Video MP4/WebM',
        src: href,
        externalUrl: href,
      };
    }
    return null;
  }

  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = parsed.pathname;

  // 1. YouTube
  if (host === 'youtu.be') {
    const id = pathname.split('/').filter(Boolean)[0] || '';
    if (YOUTUBE_ID_RE.test(id)) {
      return {
        type: 'youtube',
        label: 'YouTube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
        externalUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    let id = '';
    if (pathname === '/watch') {
      id = parsed.searchParams.get('v') || '';
    } else if (pathname.startsWith('/shorts/')) {
      id = pathname.split('/')[2] || '';
    } else if (pathname.startsWith('/embed/')) {
      id = pathname.split('/')[2] || '';
    } else if (pathname.startsWith('/live/')) {
      id = pathname.split('/')[2] || '';
    }

    if (YOUTUBE_ID_RE.test(id)) {
      return {
        type: 'youtube',
        label: 'YouTube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
        externalUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
  }

  // 2. Google Drive
  if (host === 'drive.google.com') {
    let id = '';
    const fileMatch = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      id = fileMatch[1];
    } else {
      id = parsed.searchParams.get('id') || '';
    }

    if (GDRIVE_ID_RE.test(id)) {
      return {
        type: 'gdrive',
        label: 'Google Drive',
        embedUrl: `https://drive.google.com/file/d/${id}/preview`,
        externalUrl: `https://drive.google.com/file/d/${id}/view`,
      };
    }
  }

  // 3. Vimeo
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const segments = pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1] || '';
    if (VIMEO_ID_RE.test(id)) {
      return {
        type: 'vimeo',
        label: 'Vimeo',
        embedUrl: `https://player.vimeo.com/video/${id}`,
        externalUrl: `https://vimeo.com/${id}`,
      };
    }
  }

  // 4. Direct video file (.mp4, .webm, .mov, .m4v) or Supabase storage video path
  if (
    DIRECT_VIDEO_EXT_RE.test(pathname) ||
    pathname.includes('/storage/v1/object/public/portfolio-media/videos/')
  ) {
    return {
      type: 'direct',
      label: 'Video',
      src: href,
      externalUrl: href,
    };
  }

  return null;
}

export function isVideoItem(item) {
  return Boolean(item && parseVideoSource(item.video_url));
}
