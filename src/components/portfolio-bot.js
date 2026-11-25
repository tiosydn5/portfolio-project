import { gsap, prefersReducedMotion, scrollToSection } from '../lib/motion-engine.js';
import { createEl, createSvgIcon } from '../lib/sanitize.js';
import { buildCyberMascot } from './navbar.js';

const QUICK_PROMPTS = [
  'Siapa Satrio?',
  'Karya Web & Apps',
  'Karya Graphic Design',
  'Tools & Tech Stack',
  'Pengalaman',
  'Cara Kontak / Hire',
];

function normalizeQuery(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s&]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAnyKeyword(normalized, keywords) {
  const tokens = new Set(normalized.split(' '));
  return keywords.some((kw) => {
    if (kw.includes(' ')) return normalized.includes(kw);
    return tokens.has(kw) || (kw.length >= 4 && normalized.includes(kw));
  });
}

function summarizeShowcaseList(items, label, max = 3) {
  if (!items || items.length === 0) {
    return `Saat ini belum ada karya ${label} yang dipublikasikan, tapi kamu tetap bisa melihat koleksi lainnya di Showcase Archive.`;
  }
  const preview = items
    .slice(0, max)
    .map((item) => `• ${item.title}${item.date_label ? ` (${item.date_label})` : ''}`)
    .join('\n');
  const more = items.length > max ? `\ndan ${items.length - max} karya lainnya.` : '';
  return `Ada ${items.length} karya di kategori ${label}:\n${preview}${more}`;
}

function buildBotReply(rawInput, state) {
  const q = normalizeQuery(rawInput);
  const {
    profile = {},
    showcaseItems = [],
    education = [],
    experience = [],
    techStack = [],
    socials = [],
  } = state;

  const displayName = profile.displayName || 'Satrio';
  const fullName = profile.fullName || 'Muhammad Syahdan Satrio Kuncoro';
  const location = profile.location || 'Jakarta, Indonesia';
  const tagline = profile.tagline || 'Web Development, Graphic Design';
  const bio = profile.bio || '';

  const webItems = showcaseItems.filter((i) => i.category === 'project');
  const graphicItems = showcaseItems.filter((i) => i.category === 'certificate');
  const credItems = showcaseItems.filter((i) => i.category === 'award');

  // 1. Contact / Hire / Availability / Socials
  if (
    hasAnyKeyword(q, [
      'kontak',
      'contact',
      'hubungi',
      'hire',
      'freelance',
      'kolaborasi',
      'collab',
      'available',
      'tersedia',
      'open',
      'harga',
      'rate',
      'budget',
      'email',
      'instagram',
      'ig',
      'github',
      'linkedin',
      'sosmed',
      'social',
      'pesan',
      'guestbook',
      'buku tamu',
    ])
  ) {
    const statusLine = profile.isAvailable
      ? `Status saat ini: ${profile.statusText || 'Available for select projects'} (Remote Friendly).`
      : `Status saat ini: ${profile.statusText || 'Sedang fokus proyek berjalan'}, namun pesan tetap terbuka.`;

    const channels = socials
      .map((s) => s.label)
      .filter(Boolean)
      .slice(0, 4)
      .join(', ');

    const channelLine = channels ? `\nKanal tersedia: ${channels}.` : '';
    return {
      text: `${statusLine}${channelLine}\nKamu bisa langsung mengirim pesan proyek lewat Form Kontak atau meninggalkan catatan di Guestbook.`,
      actions: [
        { label: 'Ke Form Kontak', target: '#contact-form-panel' },
        { label: 'Buka Guestbook', target: '#guestbook-form' },
      ],
    };
  }

  // 2. Specific Category: Graphic Design
  if (
    hasAnyKeyword(q, [
      'graphic',
      'grafis',
      'desain',
      'design',
      'poster',
      'brand',
      'branding',
      'visual',
      'logo',
      'layout',
    ]) &&
    !hasAnyKeyword(q, ['web', 'apps', 'aplikasi', 'tool', 'tools', 'stack'])
  ) {
    return {
      text: summarizeShowcaseList(graphicItems, 'Graphic Design'),
      actions: [{ label: 'Buka Tab Graphic Design', target: '#portfolio', showcaseTab: 'certificate' }],
    };
  }

  // 3. Specific Category: Credentials / Awards / Certificates
  if (
    hasAnyKeyword(q, [
      'credential',
      'credentials',
      'sertifikat',
      'certificate',
      'award',
      'penghargaan',
      'prestasi',
      'training',
      'kursus',
      'milestone',
    ])
  ) {
    return {
      text: summarizeShowcaseList(credItems, 'Credentials'),
      actions: [{ label: 'Buka Tab Credentials', target: '#portfolio', showcaseTab: 'award' }],
    };
  }

  // 4. Specific Category: Web & Apps
  if (
    hasAnyKeyword(q, [
      'web',
      'apps',
      'app',
      'aplikasi',
      'website',
      'coding',
      'project',
      'proyek',
      'frontend',
      'fullstack',
      'dev',
    ]) &&
    !hasAnyKeyword(q, ['tool', 'tools', 'stack', 'tech', 'skill', 'keahlian'])
  ) {
    return {
      text: summarizeShowcaseList(webItems, 'Web & Apps'),
      actions: [{ label: 'Buka Tab Web & Apps', target: '#portfolio', showcaseTab: 'project' }],
    };
  }

  // 5. Tools & Tech Stack
  if (
    hasAnyKeyword(q, [
      'tool',
      'tools',
      'stack',
      'tech',
      'skill',
      'skills',
      'keahlian',
      'software',
      'bahasa',
      'pakai',
      'figma',
      'tailwind',
      'supabase',
      'vite',
      'javascript',
      'html',
      'alight',
      'capcut',
      'motion',
    ])
  ) {
    const names = techStack.map((t) => t.name).join(', ');
    return {
      text: `${displayName} menggunakan perangkat kerja berikut:\n${names}.\nFokus utamanya mencakup ${tagline}.`,
      actions: [{ label: 'Lihat Core Stack', target: '#about' }],
    };
  }

  // 6. Experience & Education
  if (
    hasAnyKeyword(q, [
      'pengalaman',
      'experience',
      'kerja',
      'riwayat',
      'karir',
      'career',
      'pendidikan',
      'education',
      'kuliah',
      'sekolah',
      'belajar',
      'background',
      'cv',
    ])
  ) {
    const parts = [];
    if (experience.length > 0) {
      const expLines = experience
        .slice(0, 3)
        .map((e) => `• ${e.role} — ${e.organization} (${e.period})`)
        .join('\n');
      parts.push(`Pengalaman (${experience.length}):\n${expLines}`);
    }
    if (education.length > 0) {
      const eduLines = education
        .slice(0, 2)
        .map((e) => `• ${e.role} — ${e.organization} (${e.period})`)
        .join('\n');
      parts.push(`Pendidikan (${education.length}):\n${eduLines}`);
    }
    const text =
      parts.length > 0
        ? parts.join('\n\n')
        : 'Ringkasan riwayat pendidikan dan pengalaman dapat dilihat langsung di bagian About & Capabilities.';
    return {
      text,
      actions: [{ label: 'Lihat Riwayat', target: '#education-list' }],
    };
  }

  // 7. General Portfolio / Works Overview
  if (hasAnyKeyword(q, ['karya', 'portfolio', 'portofolio', 'showcase', 'hasil', 'works', 'jumlah', 'berapa'])) {
    return {
      text: `Total ada ${showcaseItems.length} item di Showcase Archive:\n• Web & Apps: ${webItems.length}\n• Graphic Design: ${graphicItems.length}\n• Credentials: ${credItems.length}`,
      actions: [
        { label: 'Buka Tab Web & Apps', target: '#portfolio', showcaseTab: 'project' },
        { label: 'Buka Graphic Design', target: '#portfolio', showcaseTab: 'certificate' },
      ],
    };
  }

  // 8. About / Who is Satrio
  if (
    hasAnyKeyword(q, [
      'siapa',
      'who',
      'about',
      'profil',
      'profile',
      'tentang',
      'bio',
      'kenalan',
      'nama',
      'lokasi',
      'asal',
      'dimana',
      'where',
      'domisili',
      'satrio',
    ])
  ) {
    return {
      text: `${fullName} (${displayName}) berbasis di ${location} dengan fokus pada ${tagline}.\n${bio}`,
      actions: [
        { label: 'Lihat Profil Lengkap', target: '#about' },
        { label: 'Lihat Showcase', target: '#portfolio' },
      ],
    };
  }

  // 9. Greetings
  if (hasAnyKeyword(q, ['halo', 'hai', 'hi', 'hello', 'hey', 'pagi', 'siang', 'sore', 'malam', 'oi', 'yo', 'assalamualaikum'])) {
    return {
      text: `Halo! Saya asisten portfolio ${displayName}. Kamu bisa tanya soal profil, karya Web & Apps, Graphic Design, tools yang dipakai, riwayat, atau cara menghubungi ${displayName}.`,
      actions: [],
    };
  }

  // 10. Friendly out-of-scope fallback
  return {
    text: `Maaf, saya khusus membantu informasi seputar portfolio ${displayName} (profil, karya Web & Apps, Graphic Design, Credentials, tools, pengalaman, dan kontak).\nCoba pilih salah satu topik cepat di bawah atau tanyakan hal terkait portfolio ya.`,
    actions: [{ label: 'Lihat Showcase Archive', target: '#portfolio' }],
  };
}

export function initPortfolioBot(state = {}) {
  if (document.getElementById('portfolio-bot-panel')) return;

  let isOpen = false;
  let isAnimating = false;
  let lastOpener = null;
  let typingTimer = 0;

  // 1. Desktop Mini Trigger FAB (Hidden on < 640px so zero overlap with mobile bottom dock)
  const fabMascotWrap = createEl('span', { className: 'w-8 h-5 inline-flex items-center justify-center shrink-0' });
  fabMascotWrap.appendChild(buildCyberMascot());

  const fabBtn = createEl(
    'button',
    {
      className: 'portfolio-bot-fab',
      attrs: {
        id: 'portfolio-bot-fab',
        type: 'button',
        'aria-label': 'Buka Satrio Bot',
        'aria-expanded': 'false',
        'aria-controls': 'portfolio-bot-panel',
      },
    },
    fabMascotWrap,
    createEl('span', { text: 'Tanya Bot' })
  );

  // 2. Floating Bright Bento Chat Panel
  const panel = createEl('section', {
    className: 'portfolio-bot-panel',
    attrs: {
      id: 'portfolio-bot-panel',
      role: 'dialog',
      'aria-label': 'Satrio Portfolio Assistant',
      'data-lenis-prevent': '',
    },
  });
  panel.hidden = true;

  // Header Band (Soft Sky Blue #DBEAFE)
  const headerMascot = createEl(
    'span',
    {
      className:
        'w-10 h-10 rounded-full bg-[#FFFFFF] border-[1.5px] border-[#0F172A] flex items-center justify-center p-1.5 shrink-0',
      attrs: { 'aria-hidden': 'true' },
    },
    buildCyberMascot()
  );

  const closeBtn = createEl(
    'button',
    {
      className: 'bento-circle-btn bento-circle-white',
      attrs: {
        id: 'portfolio-bot-close',
        type: 'button',
        'aria-label': 'Tutup Satrio Bot',
      },
    },
    createSvgIcon({
      className: 'w-4 h-4',
      strokeWidth: '2',
      shapes: [
        { tag: 'line', attrs: { x1: '18', y1: '6', x2: '6', y2: '18' } },
        { tag: 'line', attrs: { x1: '6', y1: '6', x2: '18', y2: '18' } },
      ],
    })
  );

  const header = createEl(
    'div',
    {
      className:
        'px-4 py-3.5 bg-[#DBEAFE] border-b-[1.5px] border-[#0F172A] flex items-center justify-between gap-3 shrink-0',
    },
    createEl(
      'div',
      { className: 'flex items-center gap-3 min-w-0' },
      headerMascot,
      createEl(
        'div',
        { className: 'min-w-0' },
        createEl('h2', {
          className: 'font-display text-base font-bold text-[#0B0F19] leading-tight truncate',
          text: 'Satrio Bot',
        }),
        createEl(
          'p',
          { className: 'flex items-center gap-1.5 font-mono-tabular text-xs font-medium text-[#334155] mt-0.5' },
          createEl('span', {
            className: 'w-2 h-2 rounded-full bg-[#10B981] shrink-0',
            attrs: { 'aria-hidden': 'true' },
          }),
          createEl('span', { text: 'Portfolio Assistant' })
        )
      )
    ),
    closeBtn
  );

  // Messages Feed
  const messagesEl = createEl('div', {
    className: 'bot-messages-scroll',
    attrs: {
      id: 'portfolio-bot-messages',
      role: 'log',
      'aria-live': 'polite',
      tabindex: '0',
    },
  });

  // Quick Prompt Chips Row
  const chipsRow = createEl('div', {
    className:
      'px-3.5 py-2.5 bg-[#F8FAFC] border-t border-[rgba(15,23,42,0.12)] flex items-center gap-2 overflow-x-auto shrink-0',
    attrs: { role: 'group', 'aria-label': 'Pertanyaan cepat' },
  });
  chipsRow.style.scrollbarWidth = 'none';

  for (const promptText of QUICK_PROMPTS) {
    const chip = createEl('button', {
      className: 'bot-chip',
      text: promptText,
      attrs: { type: 'button' },
    });
    chip.addEventListener('click', () => handleUserMessage(promptText));
    chipsRow.appendChild(chip);
  }

  // Input Form
  const inputEl = createEl('input', {
    className:
      'flex-1 min-w-0 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#F8FAFC] border-[1.5px] border-[#0F172A] text-base sm:text-sm text-[#0B0F19] placeholder:text-[#475569]',
    attrs: {
      id: 'portfolio-bot-input',
      type: 'text',
      maxlength: '200',
      placeholder: 'Tanya soal karya, tools, atau kontak...',
      autocomplete: 'off',
      'aria-label': 'Tulis pertanyaan untuk Satrio Bot',
    },
  });

  const sendBtn = createEl(
    'button',
    {
      className:
        'min-w-[44px] min-h-[44px] px-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] border-[1.5px] border-[#0F172A] inline-flex items-center justify-center shrink-0 transition-colors',
      attrs: {
        type: 'submit',
        'aria-label': 'Kirim pertanyaan',
      },
    },
    createSvgIcon({
      className: 'w-4 h-4',
      strokeWidth: '2',
      shapes: [
        { tag: 'line', attrs: { x1: '22', y1: '2', x2: '11', y2: '13' } },
        { tag: 'polygon', attrs: { points: '22 2 15 22 11 13 2 9 22 2' } },
      ],
    })
  );

  const inputForm = createEl(
    'form',
    {
      className:
        'p-3 bg-[#FFFFFF] border-t-[1.5px] border-[#0F172A] flex items-center gap-2 shrink-0',
      attrs: { id: 'portfolio-bot-form', novalidate: '' },
    },
    inputEl,
    sendBtn
  );

  panel.append(header, messagesEl, chipsRow, inputForm);
  document.body.append(fabBtn, panel);

  function syncExpandedAttr(expanded) {
    fabBtn.setAttribute('aria-expanded', String(expanded));
    const navTrigger = document.getElementById('nav-mascot-trigger');
    if (navTrigger) {
      navTrigger.setAttribute('aria-expanded', String(expanded));
    }
  }

  function scrollMessagesToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMessage(role, text, actions = []) {
    const wrap = createEl('div', {
      className: role === 'user' ? 'flex flex-col items-end gap-1.5' : 'flex flex-col items-start gap-2',
    });

    // Strictly uses textContent via createEl -> prevents XSS
    const bubble = createEl('div', {
      className: role === 'user' ? 'bot-bubble bot-bubble-user' : 'bot-bubble bot-bubble-assistant',
      text,
    });
    wrap.appendChild(bubble);

    if (role === 'assistant' && Array.isArray(actions) && actions.length > 0) {
      const actionsRow = createEl('div', { className: 'flex flex-wrap gap-1.5' });
      for (const act of actions) {
        const btn = createEl(
          'button',
          { className: 'bot-action-btn', attrs: { type: 'button' } },
          createEl('span', { text: act.label }),
          createSvgIcon({
            className: 'w-3.5 h-3.5',
            strokeWidth: '2',
            shapes: [
              { tag: 'line', attrs: { x1: '7', y1: '17', x2: '17', y2: '7' } },
              { tag: 'polyline', attrs: { points: '7 7 17 7 17 17' } },
            ],
          })
        );
        btn.addEventListener('click', () => {
          if (act.showcaseTab) {
            window.dispatchEvent(
              new CustomEvent('showcase:select-tab', { detail: { category: act.showcaseTab } })
            );
          }
          if (act.target) {
            scrollToSection(act.target);
          }
          if (window.innerWidth < 640) {
            closePanel();
          }
        });
        actionsRow.appendChild(btn);
      }
      wrap.appendChild(actionsRow);
    }

    messagesEl.appendChild(wrap);
    scrollMessagesToBottom();

    if (!prefersReducedMotion()) {
      gsap.fromTo(
        wrap,
        { opacity: 0, y: 10, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
    }
  }

  function showTypingBubble() {
    const typingEl = createEl(
      'div',
      {
        className: 'bot-bubble bot-bubble-assistant inline-flex items-center gap-1.5 py-3',
        attrs: { 'aria-label': 'Satrio Bot sedang mengetik' },
      },
      createEl('span', { className: 'bot-typing-dot' }),
      createEl('span', { className: 'bot-typing-dot' }),
      createEl('span', { className: 'bot-typing-dot' })
    );
    messagesEl.appendChild(typingEl);
    scrollMessagesToBottom();
    return typingEl;
  }

  function handleUserMessage(rawText) {
    const trimmed = String(rawText || '').trim();
    if (!trimmed) return;

    if (typingTimer) {
      window.clearTimeout(typingTimer);
      typingTimer = 0;
    }

    appendMessage('user', trimmed);
    const reply = buildBotReply(trimmed, state);

    if (prefersReducedMotion()) {
      appendMessage('assistant', reply.text, reply.actions);
      return;
    }

    const typingNode = showTypingBubble();
    typingTimer = window.setTimeout(() => {
      typingNode.remove();
      appendMessage('assistant', reply.text, reply.actions);
      typingTimer = 0;
    }, 350);
  }

  // Initial welcome message
  const ownerName = state.profile?.displayName || 'Satrio';
  appendMessage(
    'assistant',
    `Halo! Saya Satrio Bot. Mau tanya soal profil ${ownerName}, karya Web & Apps, Graphic Design, tech stack, atau cara kolaborasi? Klik topik cepat atau ketik pertanyaanmu di bawah.`,
    []
  );

  function openPanel(openerEl = null) {
    if (isOpen || isAnimating) return;
    isOpen = true;
    lastOpener = openerEl || document.activeElement;
    panel.hidden = false;
    syncExpandedAttr(true);

    if (prefersReducedMotion()) {
      inputEl.focus();
      return;
    }

    isAnimating = true;
    gsap.fromTo(
      panel,
      { opacity: 0, y: 18, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.34,
        ease: 'back.out(1.45)',
        overwrite: 'auto',
        clearProps: 'transform,opacity',
        onComplete: () => {
          isAnimating = false;
          inputEl.focus();
        },
      }
    );
  }

  function closePanel() {
    if (!isOpen || isAnimating) return;
    isOpen = false;
    syncExpandedAttr(false);

    const finalize = () => {
      panel.hidden = true;
      isAnimating = false;
      gsap.set(panel, { clearProps: 'transform,opacity' });
      if (lastOpener && typeof lastOpener.focus === 'function') {
        lastOpener.focus();
        lastOpener = null;
      }
    };

    if (prefersReducedMotion()) {
      finalize();
      return;
    }

    isAnimating = true;
    gsap.to(panel, {
      opacity: 0,
      y: 12,
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: finalize,
    });
  }

  function togglePanel(openerEl = null) {
    if (isOpen) closePanel();
    else openPanel(openerEl);
  }

  fabBtn.addEventListener('click', () => togglePanel(fabBtn));
  closeBtn.addEventListener('click', closePanel);

  inputForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const val = inputEl.value.trim();
    if (!val) return;
    inputEl.value = '';
    handleUserMessage(val);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      closePanel();
    }
  });

  window.addEventListener('portfolio-bot:toggle', (event) => {
    togglePanel(event.detail?.opener || null);
  });
}
