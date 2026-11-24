import './styles/base.css';
import {
  FALLBACK_EDUCATION,
  FALLBACK_EXPERIENCE,
  FALLBACK_POLAROIDS,
  FALLBACK_PROFILE,
  FALLBACK_SHOWCASE_ITEMS,
  FALLBACK_SOCIALS,
  INITIAL_GUESTBOOK_COMMENTS,
  TECH_STACK_ITEMS,
} from './lib/data-fallback.js';
import {
  initSectionReveals,
  initSmoothScroll,
  initTactileControls,
  refreshMotion,
} from './lib/motion-engine.js';
import { safeUrl } from './lib/sanitize.js';
import {
  buildFoldersFromShowcase,
  fetchPortfolioBundle,
  submitContactMessage,
  submitGuestbookComment,
} from './lib/portfolio-api.js';
import { initNavbar } from './components/navbar.js';
import { initHeroParallax } from './components/hero-parallax.js';
import { initSpotlightAvatar } from './components/spotlight-avatar.js';
import { initTelemetryClock } from './components/telemetry-clock.js';
import { initBentoAbout } from './components/bento-about.js';
import { initFolders3D } from './components/folders-3d.js';
import { initShowcase } from './components/showcase.js';
import { initPolaroidScatter } from './components/polaroid-scatter.js';
import { initContactGuestbook } from './components/contact-guestbook.js';

function hydrateProfileFields(profile) {
  const heroDisplayEl = document.getElementById('hero-display-name');
  const heroFullEl = document.getElementById('hero-full-name');
  const heroLocEl = document.getElementById('hero-location');
  const heroCutoutImg = document.getElementById('hero-cutout-img');
  const avatarNormalImg = document.getElementById('avatar-normal-img');
  const avatarAlterImg = document.getElementById('avatar-alter-img');

  const displayNameEl = document.getElementById('profile-display-name');
  const fullNameEl = document.getElementById('profile-full-name');
  const handleEl = document.getElementById('profile-handle');
  const taglineEl = document.getElementById('profile-tagline');
  const bioEl = document.getElementById('profile-bio');
  const statusEl = document.getElementById('profile-status-text');
  const availDotEl = document.getElementById('profile-availability-dot');
  const locationEl = document.getElementById('profile-location');
  const coordsEl = document.getElementById('profile-coordinates');

  const findMeFullName = document.getElementById('find-me-fullname');
  const findMeTagline = document.getElementById('find-me-tagline');
  const findMeStatus = document.getElementById('find-me-status');

  if (heroDisplayEl) heroDisplayEl.textContent = profile.displayName.toUpperCase();
  if (heroFullEl) heroFullEl.textContent = profile.fullName;
  if (heroLocEl) heroLocEl.textContent = profile.location;

  const safeHeroUrl = safeUrl(profile.heroCutoutUrl);
  if (heroCutoutImg && safeHeroUrl) heroCutoutImg.src = safeHeroUrl;

  const safeNormalUrl = safeUrl(profile.avatarNormalUrl);
  if (avatarNormalImg && safeNormalUrl) avatarNormalImg.src = safeNormalUrl;

  const safeAlterUrl = safeUrl(profile.avatarAlterUrl);
  if (avatarAlterImg && safeAlterUrl) avatarAlterImg.src = safeAlterUrl;

  if (displayNameEl) displayNameEl.textContent = profile.displayName;
  if (fullNameEl) fullNameEl.textContent = profile.fullName;
  if (handleEl) handleEl.textContent = profile.handle;
  if (taglineEl) taglineEl.textContent = profile.tagline;
  if (bioEl) bioEl.textContent = profile.bio;
  if (statusEl) statusEl.textContent = profile.statusText;
  if (locationEl) locationEl.textContent = profile.location;
  if (coordsEl) coordsEl.textContent = profile.coordinates;

  if (availDotEl) {
    availDotEl.classList.toggle('bg-[#10B981]', Boolean(profile.isAvailable));
    availDotEl.classList.toggle('bg-[#64748B]', !profile.isAvailable);
  }

  if (findMeFullName) findMeFullName.textContent = profile.fullName;
  if (findMeTagline) findMeTagline.textContent = `${profile.handle} · ${profile.tagline}`;
  if (findMeStatus) {
    findMeStatus.textContent = profile.isAvailable ? 'ACTIVE' : 'BUSY';
    findMeStatus.classList.toggle('text-[#065F46]', Boolean(profile.isAvailable));
    findMeStatus.classList.toggle('text-[#334155]', !profile.isAvailable);
  }
}

async function bootstrapPortfolio() {
  initSmoothScroll();
  initNavbar();
  initHeroParallax();
  initSpotlightAvatar();
  initTelemetryClock();
  initTactileControls();

  let bundle = {
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

  try {
    bundle = await fetchPortfolioBundle();
  } catch {
    // Fallback bundle remains active on network errors
  }

  hydrateProfileFields(bundle.profile);

  const sourceBadge = document.getElementById('showcase-source-badge');
  if (sourceBadge) {
    sourceBadge.textContent = bundle.showcaseIsLive
      ? `ARCHIVE · ${bundle.showcaseItems.length} KARYA`
      : `ARCHIVE · ${bundle.showcaseItems.length} PRATINJAU`;
  }

  initBentoAbout({
    education: bundle.education,
    experience: bundle.experience,
    techStack: TECH_STACK_ITEMS,
  });

  initFolders3D({
    folders: buildFoldersFromShowcase(bundle.showcaseItems, bundle.showcaseIsLive),
  });

  initShowcase({ items: bundle.showcaseItems });
  initPolaroidScatter({ photos: bundle.polaroids });

  initContactGuestbook({
    socials: bundle.socials,
    initialComments: bundle.guestbookComments,
    isLive: bundle.guestbookIsLive,
    onSubmitContact: submitContactMessage,
    onSubmitGuestbook: submitGuestbookComment,
  });

  initSectionReveals();
  refreshMotion();
}

bootstrapPortfolio();
