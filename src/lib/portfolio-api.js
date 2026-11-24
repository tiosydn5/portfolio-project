import { isSupabaseConfigured, supabase } from './supabase.js';
import {
  FALLBACK_EDUCATION,
  FALLBACK_EXPERIENCE,
  FALLBACK_POLAROIDS,
  FALLBACK_PROFILE,
  FALLBACK_SHOWCASE_ITEMS,
  FALLBACK_SOCIALS,
  INITIAL_GUESTBOOK_COMMENTS,
} from './data-fallback.js';

export const SCATTER_SLOTS = [
  { scatterX: '-340px', scatterY: '-135px', defaultRot: -7 },
  { scatterX: '8px', scatterY: '-150px', defaultRot: 5 },
  { scatterX: '345px', scatterY: '-125px', defaultRot: 8 },
  { scatterX: '-325px', scatterY: '138px', defaultRot: -5 },
  { scatterX: '16px', scatterY: '150px', defaultRot: 4 },
  { scatterX: '340px', scatterY: '132px', defaultRot: -8 },
];

const FOLDER_META = [
  { category: 'project', title: 'Projects', subtitle: 'Web builds & interactive systems', prefix: 'PRJ' },
  { category: 'certificate', title: 'Certificates', subtitle: 'Technical credentials & courses', prefix: 'CRT' },
  { category: 'award', title: 'Awards', subtitle: 'Competitions & recognitions', prefix: 'AWD' },
];

export function buildFoldersFromShowcase(items = [], isLive = false) {
  return FOLDER_META.map((meta) => {
    const group = items.filter((item) => item.category === meta.category);
    const countLabel = isLive ? `${group.length} karya` : `${group.length} arsip`;

    const sheets = [0, 1, 2].map((idx) => {
      const entry = group[idx];
      return {
        code: `${meta.prefix}-0${idx + 1}`,
        label: entry ? entry.title : `${meta.title} 0${idx + 1}`,
      };
    });

    return {
      category: meta.category,
      title: meta.title,
      subtitle: meta.subtitle,
      countText: countLabel,
      sheets,
    };
  });
}

function normalizeProfile(row) {
  if (!row) return FALLBACK_PROFILE;
  return {
    displayName: row.display_name || FALLBACK_PROFILE.displayName,
    fullName: row.full_name || FALLBACK_PROFILE.fullName,
    handle: row.handle || FALLBACK_PROFILE.handle,
    tagline: row.tagline || FALLBACK_PROFILE.tagline,
    bio: row.bio || FALLBACK_PROFILE.bio,
    location: row.location_label || FALLBACK_PROFILE.location,
    coordinates: row.coordinates_label || FALLBACK_PROFILE.coordinates,
    statusText: row.status_text || FALLBACK_PROFILE.statusText,
    isAvailable: typeof row.is_available === 'boolean' ? row.is_available : FALLBACK_PROFILE.isAvailable,
    heroCutoutUrl: row.hero_cutout_url || FALLBACK_PROFILE.heroCutoutUrl,
    avatarNormalUrl: row.avatar_normal_url || FALLBACK_PROFILE.avatarNormalUrl,
    avatarAlterUrl: row.avatar_alter_url || FALLBACK_PROFILE.avatarAlterUrl,
  };
}

function normalizeSocials(row) {
  const baseSocials = Array.isArray(row?.socials) ? row.socials : [];
  if (baseSocials.length === 0) return FALLBACK_SOCIALS;

  return baseSocials.map((item, idx) => ({
    id: item.id || `social-${idx}`,
    label: item.label || 'Link',
    handle: item.handle || item.url || '@satrio',
    copyValue: item.copyValue || null,
    url: item.url || null,
    scrollTarget: item.scrollTarget || null,
  }));
}

function normalizeShowcase(rows) {
  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    discipline: Array.isArray(row.tech_tags) && row.tech_tags[0] ? row.tech_tags[0] : 'Portfolio',
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    tech_tags: Array.isArray(row.tech_tags) ? row.tech_tags : [],
    thumbnail_url: row.thumbnail_url || '/assets/showcase/project-atelier.svg',
    live_url: row.live_url || null,
    repo_url: row.repo_url || null,
    date_label: row.date_label || '',
    is_featured: Boolean(row.is_featured),
    is_published: Boolean(row.is_published),
    isSample: false,
  }));
}

function normalizePolaroids(rows) {
  return rows.map((row, idx) => {
    const slot = SCATTER_SLOTS[idx % SCATTER_SLOTS.length];
    return {
      id: row.id,
      image_url: row.image_url,
      caption: row.caption,
      date_label: row.created_at ? String(new Date(row.created_at).getFullYear()) : 'Gallery',
      tag: `Frame ${String(idx + 1).padStart(2, '0')}`,
      rotation_deg: typeof row.rotation_deg === 'number' ? row.rotation_deg : slot.defaultRot,
      scatterX: slot.scatterX,
      scatterY: slot.scatterY,
    };
  });
}

export async function fetchPortfolioBundle() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isLive: false,
      profile: FALLBACK_PROFILE,
      socials: FALLBACK_SOCIALS,
      education: FALLBACK_EDUCATION,
      experience: FALLBACK_EXPERIENCE,
      showcaseItems: FALLBACK_SHOWCASE_ITEMS,
      showcaseIsLive: false,
      polaroids: FALLBACK_POLAROIDS,
      guestbookComments: INITIAL_GUESTBOOK_COMMENTS,
      guestbookIsLive: false,
    };
  }

  const [profileRes, showcaseRes, timelineRes, polaroidRes, guestbookRes] =
    await Promise.allSettled([
      supabase.from('site_profile').select('*').eq('id', 1).maybeSingle(),
      supabase
        .from('showcase_items')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('timeline_entries')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('polaroid_photos')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('guestbook_comments')
        .select('id, author_name, author_role, message, created_at')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

  const profileRow =
    profileRes.status === 'fulfilled' && !profileRes.value.error ? profileRes.value.data : null;

  const showcaseRows =
    showcaseRes.status === 'fulfilled' && !showcaseRes.value.error && Array.isArray(showcaseRes.value.data)
      ? showcaseRes.value.data
      : [];
  const showcaseIsLive = showcaseRows.length > 0;

  const timelineRows =
    timelineRes.status === 'fulfilled' && !timelineRes.value.error && Array.isArray(timelineRes.value.data)
      ? timelineRes.value.data
      : [];
  const eduRows = timelineRows.filter((item) => item.type === 'education');
  const expRows = timelineRows.filter((item) => item.type === 'experience');

  const polaroidRows =
    polaroidRes.status === 'fulfilled' && !polaroidRes.value.error && Array.isArray(polaroidRes.value.data)
      ? polaroidRes.value.data
      : [];

  const guestbookOk =
    guestbookRes.status === 'fulfilled' && !guestbookRes.value.error && Array.isArray(guestbookRes.value.data);

  return {
    isLive: true,
    profile: normalizeProfile(profileRow),
    socials: normalizeSocials(profileRow),
    education: eduRows.length > 0 ? eduRows : FALLBACK_EDUCATION,
    experience: expRows.length > 0 ? expRows : FALLBACK_EXPERIENCE,
    showcaseItems: showcaseIsLive ? normalizeShowcase(showcaseRows) : FALLBACK_SHOWCASE_ITEMS,
    showcaseIsLive,
    polaroids: polaroidRows.length > 0 ? normalizePolaroids(polaroidRows) : FALLBACK_POLAROIDS,
    guestbookComments: guestbookOk ? guestbookRes.value.data : INITIAL_GUESTBOOK_COMMENTS,
    guestbookIsLive: guestbookOk,
  };
}

export async function submitContactMessage({ sender_name, sender_email, message }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi.');
  }

  // Never chain .select() on contact_messages because public users do not have SELECT permission
  const { error } = await supabase.from('contact_messages').insert({
    sender_name,
    sender_email,
    message,
    is_read: false,
  });

  if (error) {
    throw new Error(error.message || 'Gagal mengirim pesan ke server.');
  }
}

export async function submitGuestbookComment({ author_name, author_role, message }) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi.');
  }

  const { data, error } = await supabase
    .from('guestbook_comments')
    .insert({
      author_name,
      author_role,
      message,
      is_visible: true,
    })
    .select('id, author_name, author_role, message, created_at')
    .single();

  if (error) {
    throw new Error(error.message || 'Gagal menyimpan komentar.');
  }

  return data;
}
