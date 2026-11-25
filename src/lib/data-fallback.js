export const FALLBACK_PROFILE = {
  displayName: 'Satrio',
  fullName: 'Muhammad Syahdan Satrio Kuncoro',
  handle: '@satrio',
  tagline: 'Web Development, Graphic Design, Motion Graphics',
  bio: 'Mengerjakan antarmuka web modern, sistem visual grafis, dan motion graphics dengan perhatian pada tipografi, struktur layout, serta presisi gerak.',
  location: 'Jakarta, Indonesia',
  coordinates: '6.2088° S, 106.8456° E',
  statusText: 'Available for select projects',
  isAvailable: true,
  heroCutoutUrl: '/assets/hero-cutout-placeholder.svg',
  avatarNormalUrl: '/assets/avatar-normal-placeholder.svg',
  avatarAlterUrl: '/assets/avatar-alter-placeholder.svg',
};

export const FALLBACK_EDUCATION = [
  {
    id: 'edu-slot-1',
    organization: 'Institusi Pendidikan Utama',
    role: 'Studi & Konsentrasi Akademik',
    period: '2024 - Sekarang',
    description:
      'Rekayasa perangkat lunak web, desain antarmuka, dan tipografi digital.',
  },
  {
    id: 'edu-slot-2',
    organization: 'Pendidikan Menengah & Dasar Kreatif',
    role: 'Fokus Desain & Rekayasa Dasar',
    period: '2021 - 2024',
    description:
      'Pemrograman web dasar, tata letak grafis, dan motion graphics.',
  },
];

export const FALLBACK_EXPERIENCE = [
  {
    id: 'exp-slot-1',
    organization: 'Proyek Mandiri & Kolaborasi',
    role: 'Frontend Web Developer',
    period: '2025 - Sekarang',
    description:
      'Membangun landing page dan aplikasi web modular dengan kontrol performa animasi dan layout responsif.',
  },
  {
    id: 'exp-slot-2',
    organization: 'Produksi Motion & Visual',
    role: 'Motion Graphics Designer',
    period: '2024 - 2025',
    description:
      'Memproduksi kinetic typography, bumper visual, dan aset transisi presisi untuk kebutuhan konten digital.',
  },
  {
    id: 'exp-slot-3',
    organization: 'Desain Identitas Visual',
    role: 'Graphic Designer',
    period: '2024',
    description:
      'Menyusun identitas visual, poster acara, serta panduan warna dan tipografi lintas media cetak maupun layar.',
  },
  {
    id: 'exp-slot-4',
    organization: 'Eksplorasi UI & Prototipe',
    role: 'UI Prototype Contributor',
    period: '2023 - 2024',
    description:
      'Merancang wireframe interaktif, komponen bento, dan alur navigasi sebelum tahap implementasi kode.',
  },
  {
    id: 'exp-slot-5',
    organization: 'Optimasi Aset Web',
    role: 'Visual Asset & Web Support',
    period: '2023',
    description:
      'Mengoptimalkan aset gambar, ikon vektor, dan penyesuaian tampilan perangkat mobile agar siap rilis.',
  },
];

export const TECH_STACK_ITEMS = [
  {
    name: 'HTML5',
    category: 'Web',
    icon: {
      viewBox: '0 0 24 24',
      shapes: [
        { tag: 'polygon', attrs: { points: '4,3 20,3 18.5,18.5 12,21 5.5,18.5' } },
        { tag: 'polyline', attrs: { points: '16,7 8.5,7 9,11.5 15.5,11.5 15,15.5 12,16.5 9,15.5' } },
      ],
    },
  },
  {
    name: 'Tailwind CSS',
    category: 'Styling',
    icon: {
      viewBox: '0 0 24 24',
      shapes: [
        { tag: 'path', attrs: { d: 'M6 10c1-3 3.5-4 6-3 1.5.6 2.3 1.8 3.5 2.1 1.2.3 2.1-.1 3-1.1-1 3-3.5 4-6 3-1.5-.6-2.3-1.8-3.5-2.1-1.2-.3-2.1.1-3 1.1z' } },
        { tag: 'path', attrs: { d: 'M3 16c1-3 3.5-4 6-3 1.5.6 2.3 1.8 3.5 2.1 1.2.3 2.1-.1 3-1.1-1 3-3.5 4-6 3-1.5-.6-2.3-1.8-3.5-2.1-1.2-.3-2.1.1-3 1.1z' } },
      ],
    },
  },
  {
    name: 'JavaScript',
    category: 'Web',
    icon: {
      viewBox: '0 0 24 24',
      shapes: [
        { tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18', rx: '2' } },
        { tag: 'path', attrs: { d: 'M10 10v6.5c0 1-.8 1.5-1.8 1.5-.8 0-1.4-.3-1.7-.8' } },
        { tag: 'path', attrs: { d: 'M17.5 11.2c-.4-.7-1.1-1.2-2-1.2-1.1 0-1.9.7-1.9 1.6 0 1 .9 1.4 2.1 1.8 1.3.4 2.1.9 2.1 2.1 0 1.2-1 2-2.4 2-1.1 0-2-.5-2.5-1.4' } },
      ],
    },
  },
  {
    name: 'Vite',
    category: 'Build',
    icon: {
      viewBox: '0 0 24 24',
      shapes: [
        { tag: 'polygon', attrs: { points: '3,5 12,20 21,5 12,8' } },
        { tag: 'polyline', attrs: { points: '12,8 10,14 14,12 11.5,18' } },
      ],
    },
  },
  {
    name: 'Supabase',
    category: 'Backend',
    icon: {
      viewBox: '0 0 24 24',
      shapes: [
        { tag: 'polygon', attrs: { points: '13,3 5,13 12,13 11,21 19,11 12,11' } },
      ],
    },
  },
  {
    name: 'Figma',
    category: 'Design',
    icon: {
      viewBox: '0 0 24 24',
      shapes: [
        { tag: 'rect', attrs: { x: '7', y: '3', width: '5', height: '6', rx: '2.5' } },
        { tag: 'rect', attrs: { x: '12', y: '3', width: '5', height: '6', rx: '2.5' } },
        { tag: 'rect', attrs: { x: '7', y: '9', width: '5', height: '6', rx: '2.5' } },
        { tag: 'circle', attrs: { cx: '14.5', cy: '12', r: '2.5' } },
        { tag: 'path', attrs: { d: 'M9.5 15H12v3.5A2.5 2.5 0 1 1 9.5 15Z' } },
      ],
    },
  },
  {
    name: 'Alight Motion',
    category: 'Motion',
    icon: {
      viewBox: '0 0 24 24',
      shapes: [
        { tag: 'circle', attrs: { cx: '12', cy: '12', r: '8.5' } },
        { tag: 'polygon', attrs: { points: '12,6.5 17,16.5 7,16.5' } },
        { tag: 'line', attrs: { x1: '9.5', y1: '13.5', x2: '14.5', y2: '13.5' } },
      ],
    },
  },
  {
    name: 'CapCut',
    category: 'Video',
    icon: {
      viewBox: '0 0 24 24',
      shapes: [
        { tag: 'rect', attrs: { x: '3', y: '5', width: '18', height: '14', rx: '3' } },
        { tag: 'line', attrs: { x1: '7', y1: '9', x2: '17', y2: '15' } },
        { tag: 'line', attrs: { x1: '7', y1: '15', x2: '17', y2: '9' } },
      ],
    },
  },
];

export const SHOWCASE_FOLDERS = [
  {
    category: 'project',
    title: 'Web & Apps',
    subtitle: 'Web apps & AI-assisted builds',
    countText: '4 arsip',
    sheets: [
      { code: 'WEB-01', label: 'Web Architecture' },
      { code: 'WEB-02', label: 'Interactive UI' },
      { code: 'WEB-03', label: 'AI-Assisted App' },
    ],
  },
  {
    category: 'certificate',
    title: 'Graphic Design',
    subtitle: 'Visual identity, posters & layouts',
    countText: '3 arsip',
    sheets: [
      { code: 'GFX-01', label: 'Brand Identity' },
      { code: 'GFX-02', label: 'Editorial Poster' },
      { code: 'GFX-03', label: 'Visual Layout' },
    ],
  },
  {
    category: 'award',
    title: 'Credentials',
    subtitle: 'Certifications, training & milestones',
    countText: '3 arsip',
    sheets: [
      { code: 'CRD-01', label: 'UI/UX Honor' },
      { code: 'CRD-02', label: 'Web Craft' },
      { code: 'CRD-03', label: 'Motion Milestone' },
    ],
  },
];

export const FALLBACK_SHOWCASE_ITEMS = [
  {
    id: 'prj-sample-1',
    category: 'project',
    discipline: 'Web Development',
    title: 'Multi-Tenant Service Engine',
    subtitle: 'Zero-framework modular web app dengan dashboard manajemen layanan',
    description:
      'Arsitektur web multi-tenant berbasis Vanilla ES Modules, Tailwind CSS, dan kontrol data terstruktur untuk pengelolaan layanan bisnis lokal secara cepat.',
    tech_tags: ['JavaScript', 'Tailwind CSS', 'Web Dev'],
    thumbnail_url: '/assets/showcase/project-atelier.svg',
    live_url: null,
    repo_url: null,
    date_label: '2026',
    is_featured: true,
    is_published: true,
    isSample: true,
  },
  {
    id: 'prj-sample-2',
    category: 'project',
    discipline: 'Motion Graphics',
    title: 'Millisecond Keyframe Transpiler',
    subtitle: 'Sistem pratinjau kurva gerak dan tipografi kinetik berbasis Canvas',
    description:
      'Alur kerja motion graphics yang memetakan kurva keyframe Alight Motion ke timeline eksekusi milidetik dengan pratinjau visual dan inspeksi layer.',
    tech_tags: ['Alight Motion', 'Motion', 'JavaScript'],
    thumbnail_url: '/assets/showcase/project-mograph.svg',
    live_url: null,
    repo_url: null,
    date_label: '2026',
    is_featured: true,
    is_published: true,
    isSample: true,
  },
  {
    id: 'prj-sample-3',
    category: 'project',
    discipline: 'Graphic Design',
    title: 'Technical Cobalt Brand System',
    subtitle: 'Panduan tipografi, rasio kontras WCAG AA, dan komponen identitas',
    description:
      'Eksplorasi sistem desain mencakup penyusunan palet warna Technical Cobalt, skala tipografi Space Grotesk dan JetBrains Mono, serta template aset kampanye digital.',
    tech_tags: ['Figma', 'Graphic Design', 'Branding'],
    thumbnail_url: '/assets/showcase/project-cobalt-brand.svg',
    live_url: null,
    repo_url: null,
    date_label: '2025',
    is_featured: false,
    is_published: true,
    isSample: true,
  },
  {
    id: 'prj-sample-4',
    category: 'project',
    discipline: 'Web Development',
    title: 'Compositor Motion Interaction Kit',
    subtitle: 'Kumpulan modul transisi GPU-composited untuk viewport mobile dan desktop',
    description:
      'Katalog interaksi berfokus pada scroll-driven timeline, spotlight pointer dengan isolasi layer paint, dan navigasi adaptif lintas breakpoint 320px hingga 1440px.',
    tech_tags: ['Vite', 'Tailwind CSS', 'Motion'],
    thumbnail_url: '/assets/showcase/project-kinetic-kit.svg',
    live_url: null,
    repo_url: null,
    date_label: '2025',
    is_featured: false,
    is_published: true,
    isSample: true,
  },
  {
    id: 'crt-sample-1',
    category: 'certificate',
    discipline: 'Web Development',
    title: 'Modern Frontend Engineering Track',
    subtitle: 'Kompetensi HTML semantik, CSS layout, dan manipulasi DOM aman',
    description:
      'Dokumentasi kurikulum dan kredensial frontend engineering yang berfokus pada aksesibilitas WCAG AA, struktur layout modern, dan keamanan klien.',
    tech_tags: ['HTML5', 'JavaScript', 'Web Dev'],
    thumbnail_url: '/assets/showcase/cert-frontend.svg',
    live_url: null,
    repo_url: null,
    date_label: '2025',
    is_featured: true,
    is_published: true,
    isSample: true,
  },
  {
    id: 'crt-sample-2',
    category: 'certificate',
    discipline: 'Graphic Design',
    title: 'Design Systems & Visual Grid Architecture',
    subtitle: 'Tata letak komponen, token warna, dan sistem desain antarmuka',
    description:
      'Arsip sertifikasi penyusunan grid editorial, konsistensi token warna, dan penataan hierarki visual untuk produk digital.',
    tech_tags: ['Figma', 'Graphic Design'],
    thumbnail_url: '/assets/showcase/cert-design-system.svg',
    live_url: null,
    repo_url: null,
    date_label: '2024',
    is_featured: false,
    is_published: true,
    isSample: true,
  },
  {
    id: 'crt-sample-3',
    category: 'certificate',
    discipline: 'Motion Graphics',
    title: 'Motion Timing & Video Editing Practice',
    subtitle: 'Komposisi visual, kurva easing, dan pacing editorial gerak',
    description:
      'Sertifikasi teknis pengeditan video dan motion graphics berbasis kurva keyframe menggunakan Alight Motion serta CapCut.',
    tech_tags: ['Alight Motion', 'CapCut', 'Motion'],
    thumbnail_url: '/assets/showcase/cert-motion.svg',
    live_url: null,
    repo_url: null,
    date_label: '2024',
    is_featured: false,
    is_published: true,
    isSample: true,
  },
  {
    id: 'awd-sample-1',
    category: 'award',
    discipline: 'Graphic Design',
    title: 'UI/UX Design Concept Recognition',
    subtitle: 'Apresiasi rancangan antarmuka web dan alur pengalaman pengguna',
    description:
      'Arsip pengakuan konsep desain UI/UX dengan penekanan pada keterbacaan tipografi, keselarasan grid bento, dan kegunaan di layar mobile.',
    tech_tags: ['Figma', 'UI/UX'],
    thumbnail_url: '/assets/showcase/award-uiux.svg',
    live_url: null,
    repo_url: null,
    date_label: '2025',
    is_featured: true,
    is_published: true,
    isSample: true,
  },
  {
    id: 'awd-sample-2',
    category: 'award',
    discipline: 'Web Development',
    title: 'Web Engineering & Craft Selection',
    subtitle: 'Apresiasi pengembangan situs web responsif dan aksesibel',
    description:
      'Catatan apresiasi karya web engineering yang menilai struktur kode bersih, ketahanan responsif mobile, dan efisiensi performa render.',
    tech_tags: ['Vite', 'Web Dev'],
    thumbnail_url: '/assets/showcase/award-web-craft.svg',
    live_url: null,
    repo_url: null,
    date_label: '2025',
    is_featured: false,
    is_published: true,
    isSample: true,
  },
  {
    id: 'awd-sample-3',
    category: 'award',
    discipline: 'Motion Graphics',
    title: 'Kinetic Typography Motion Honor',
    subtitle: 'Apresiasi video pendek dan animasi tipografi ritmis',
    description:
      'Arsip karya motion graphics pilihan yang menyoroti sinkronisasi audio, kurva animasi kustom, dan keterbacaan tipografi gerak.',
    tech_tags: ['Alight Motion', 'CapCut', 'Motion'],
    thumbnail_url: '/assets/showcase/award-motion-type.svg',
    live_url: null,
    repo_url: null,
    date_label: '2024',
    is_featured: false,
    is_published: true,
    isSample: true,
  },
];

export const FALLBACK_POLAROIDS = [
  {
    id: 'pol-01',
    image_url: '/assets/polaroid/polaroid-01.svg',
    caption: 'Cuplikan Layout Bento & Hierarki Antarmuka Web',
    date_label: '2026',
    tag: 'Web & Apps',
    rotation_deg: -7,
    scatterX: '-340px',
    scatterY: '-135px',
  },
  {
    id: 'pol-02',
    image_url: '/assets/polaroid/polaroid-02.svg',
    caption: 'Detail Visual Motion & Tipografi Kinetik',
    date_label: '2026',
    tag: 'Exploration',
    rotation_deg: 5,
    scatterX: '8px',
    scatterY: '-150px',
  },
  {
    id: 'pol-03',
    image_url: '/assets/polaroid/polaroid-03.svg',
    caption: 'Komposisi Poster Editorial Space Grotesk',
    date_label: '2025',
    tag: 'Graphic Design',
    rotation_deg: 8,
    scatterX: '345px',
    scatterY: '-125px',
  },
  {
    id: 'pol-04',
    image_url: '/assets/polaroid/polaroid-04.svg',
    caption: 'Detail UI Mobile & Kartu Interaktif Responsif',
    date_label: '2026',
    tag: 'UI Detail',
    rotation_deg: -5,
    scatterX: '-325px',
    scatterY: '138px',
  },
  {
    id: 'pol-05',
    image_url: '/assets/polaroid/polaroid-05.svg',
    caption: 'Sistem Identitas & Palet Technical Cobalt',
    date_label: '2026',
    tag: 'Graphic Design',
    rotation_deg: 4,
    scatterX: '16px',
    scatterY: '150px',
  },
  {
    id: 'pol-06',
    image_url: '/assets/polaroid/polaroid-06.svg',
    caption: 'Widget Telemetri Jakarta & Kartu Profil',
    date_label: '2026',
    tag: 'Web & Apps',
    rotation_deg: -8,
    scatterX: '340px',
    scatterY: '132px',
  },
];

export const FALLBACK_SOCIALS = [
  {
    id: 'github',
    label: 'GitHub',
    handle: '@satrio',
    copyValue: '@satrio',
    url: null,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'Muhammad Syahdan Satrio Kuncoro',
    copyValue: 'Muhammad Syahdan Satrio Kuncoro',
    url: null,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@satrio',
    copyValue: '@satrio',
    url: null,
  },
  {
    id: 'email',
    label: 'Direct Inquiry',
    handle: 'Gunakan formulir kontak di atas',
    copyValue: null,
    scrollTarget: '#contact-form-panel',
  },
];

export const INITIAL_GUESTBOOK_COMMENTS = [
  {
    id: 'owner-welcome-1',
    author_name: 'Satrio',
    author_role: 'Owner',
    message:
      'Selamat datang di buku tamu publik. Silakan tinggalkan catatan singkat, masukan tata letak, atau sapaan di formulir di atas.',
    created_at: '2026-11-23T12:00:00.000Z',
  },
];
