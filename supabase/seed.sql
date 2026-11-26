-- =============================================================================
-- Cyber-Tech Bento Portfolio + Admin CMS : Optional Starter Seed Data
-- =============================================================================
-- Run this manually in the Supabase SQL Editor AFTER running supabase/schema.sql
-- so a newly provisioned database starts with structured initial content for Satrio.
-- Safe to re-run (idempotent WHERE NOT EXISTS guards on child tables).
-- =============================================================================

-- 1. Site Profile (Singleton id = 1)
INSERT INTO public.site_profile (
  id,
  full_name,
  display_name,
  handle,
  tagline,
  bio,
  location_label,
  coordinates_label,
  status_text,
  is_available,
  hero_cutout_url,
  avatar_normal_url,
  avatar_alter_url,
  socials
)
VALUES (
  1,
  'Muhammad Syahdan Satrio Kuncoro',
  'Satrio',
  '@satrio',
  'Web Development, Graphic Design, Motion Graphics',
  'Mengerjakan antarmuka web modern, sistem visual grafis, dan motion graphics dengan perhatian pada tipografi, struktur layout, serta presisi gerak.',
  'Jakarta, Indonesia',
  '6.2088° S, 106.8456° E',
  'Available for select projects',
  true,
  '/assets/hero-cutout-placeholder.svg',
  '/assets/avatar-normal-placeholder.svg',
  '/assets/avatar-alter-placeholder.svg',
  '[
    {"id":"github","label":"GitHub","handle":"@satrio (Set URL via /admin)","copyValue":"@satrio","url":null},
    {"id":"linkedin","label":"LinkedIn","handle":"Muhammad Syahdan Satrio Kuncoro","copyValue":"Muhammad Syahdan Satrio Kuncoro","url":null},
    {"id":"instagram","label":"Instagram","handle":"@satrio (Set URL via /admin)","copyValue":"@satrio","url":null},
    {"id":"email","label":"Direct Inquiry","handle":"Gunakan formulir kontak di samping","copyValue":null,"scrollTarget":"#contact-form-panel"}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  handle = EXCLUDED.handle,
  tagline = EXCLUDED.tagline,
  bio = EXCLUDED.bio,
  location_label = EXCLUDED.location_label,
  coordinates_label = EXCLUDED.coordinates_label,
  status_text = EXCLUDED.status_text,
  is_available = EXCLUDED.is_available,
  socials = EXCLUDED.socials;

-- 2. Timeline Entries (Education & Experience starter rows)
INSERT INTO public.timeline_entries (type, organization, role, period, description, sort_order)
SELECT 'education', '[Slot Pendidikan Utama · Edit via /admin]', 'Studi & Konsentrasi Akademik', '2024 - Sekarang',
       'Slot pendidikan formal utama yang siap diperbarui langsung melalui Admin CMS.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.timeline_entries WHERE type = 'education');

INSERT INTO public.timeline_entries (type, organization, role, period, description, sort_order)
SELECT 'experience', '[Slot Pengalaman 01 · Edit via /admin]', 'Frontend Web Developer', '2025 - Sekarang',
       'Membangun landing page dan aplikasi web modular dengan kontrol performa animasi dan layout responsif.', 1
WHERE NOT EXISTS (SELECT 1 FROM public.timeline_entries WHERE type = 'experience');

INSERT INTO public.timeline_entries (type, organization, role, period, description, sort_order)
SELECT 'experience', '[Slot Pengalaman 02 · Edit via /admin]', 'Motion Graphics & Video Editor', '2024 - 2025',
       'Memproduksi kinetic typography dan transisi visual menggunakan Alight Motion dan CapCut.', 2
WHERE NOT EXISTS (SELECT 1 FROM public.timeline_entries WHERE type = 'experience' AND sort_order = 2);

-- 3. Showcase Items (3 Web & Apps + 17 Graphic Design real works + 3 Credentials starter slots)
INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'project',
  'Atelier Engine v4 — Multi-Tenant Service SaaS',
  'Platform manajemen order jasa multi-mitra dengan sinkronisasi pelanggan & kasir real-time',
  'Aplikasi web SaaS multi-tenant untuk bisnis Sneakers Care, Laundry, Bengkel Motor, dan Barbershop. Menghubungkan Layar Pelanggan dan Panel Kasir & Kanban lengkap dengan fitur Live Split 1:1 untuk simulasi demo ke mitra.',
  ARRAY['Web Dev', 'SaaS', 'JavaScript', 'UI/UX'],
  '/assets/works/web/atelier-engine-saas.jpg',
  '2026',
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Atelier Engine v4 — Multi-Tenant Service SaaS');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'project',
  'Kronos Ledger — Double-Entry Cloud ERP',
  'Dashboard akuntansi bisnis double-entry, likuiditas kas, piutang/utang & analitik HPP',
  'Sistem cloud accounting & ringkasan eksekutif keuangan yang melacak saldo kas & bank, kalkulasi laba bersih otomatis, status Invoice & Piutang (AR), Utang Usaha (AP), rincian biaya/HPP, hingga Audit Log dengan mode Demo dan koneksi Supabase Live.',
  ARRAY['Web Dev', 'SaaS', 'Supabase', 'JavaScript'],
  '/assets/works/web/kronos-ledger-erp.jpg',
  '2026',
  true,
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Kronos Ledger — Double-Entry Cloud ERP');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'project',
  'Vectra — Mobile Employee Attendance Portal',
  'Web app absensi karyawan mobile-first dengan GPS Geofence, kamera live & anti-fraud',
  'Portal kehadiran karyawan berbasis web mobile dengan validasi radius GPS Geofence akurat, verifikasi kamera live saat clock-in, device binding anti-titip absen, mode offline IndexedDB, manajemen shift, cuti, dan slip gaji.',
  ARRAY['Web Dev', 'UI/UX', 'JavaScript'],
  '/assets/works/web/vectra-attendance-portal.png',
  '2026',
  true,
  true,
  3
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Vectra — Mobile Employee Attendance Portal');

-- Graphic Design Items (DB category: 'certificate')
INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Iced Coffee Feed Series (6-Grid)',
  'Rangkaian konten Instagram terpadu untuk promosi kopi susu & menu kafe',
  'Seri 6 panel feed promosi kafe dalam palet hangat krem-karamel dan oranye dengan headline bertumpuk, kartu daftar menu favorit, dan CTA pemesanan.',
  ARRAY['Social Media', 'F&B Design', 'Branding'],
  '/assets/works/graphic/carousel-coffee-time.jpg',
  '2025',
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Iced Coffee Feed Series (6-Grid)');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Gaming Gear & Console Promo Grid',
  'Paket visual promosi PS5 Slim, headset gaming 90Hz & fullset PC bergaya tekno',
  'Seri 4 panel konten promo toko perlengkapan gaming beraksen cyan-cobalt kontras tinggi dengan produk 3D terisolasi dan gelombang audio.',
  ARRAY['Social Media', 'Poster', 'Branding'],
  '/assets/works/graphic/carousel-playstation-gaming.jpg',
  '2025',
  true,
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Gaming Gear & Console Promo Grid');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Croffle vs Waffle Editorial Carousel',
  'Carousel edukasi kuliner 7 slide untuk kampanye media sosial SB 19',
  'Desain micro-blog Instagram 7 slide membandingkan bahan dasar, tekstur renyah vs fluffy, dan cita rasa croffle serta waffle.',
  ARRAY['Social Media', 'F&B Design', 'Editorial'],
  '/assets/works/graphic/carousel-croffle-vs-waffle.jpg',
  '2025',
  true,
  true,
  3
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Croffle vs Waffle Editorial Carousel');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Paket Menu Trending — Toast & Latte',
  'Poster promo bundling sarapan lengkap dengan integrasi badge GoFood & ShopeeFood',
  'Poster promosi bundling roti panggang premium dan es latte berlatar oranye cerah dengan informasi pemesanan online.',
  ARRAY['F&B Design', 'Poster', 'Branding'],
  '/assets/works/graphic/fnb-paket-menu-trending.jpg',
  '2025',
  false,
  true,
  4
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Paket Menu Trending — Toast & Latte');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Coffee Time — Iced Aren Splash Poster',
  'Poster minuman kopi es dengan tipografi bertumpuk dan efek percikan kopi',
  'Komposisi poster kopi es yang menempatkan foto gelas transparan di depan tipografi COFFEE TIME dan efek splash kopi.',
  ARRAY['F&B Design', 'Poster'],
  '/assets/works/graphic/fnb-iced-coffee-poster.jpg',
  '2025',
  false,
  true,
  5
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Coffee Time — Iced Aren Splash Poster');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Coffee Time Wide Promotion Banner',
  'Banner lanskap 2:1 untuk etalase minuman espresso, matcha & cokelat',
  'Banner horizontal bernuansa cokelat kayu hangat untuk header marketplace dengan tiga varian minuman di atas podium kayu.',
  ARRAY['F&B Design', 'Branding'],
  '/assets/works/graphic/fnb-coffee-time-banner.jpg',
  '2025',
  false,
  true,
  6
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Coffee Time Wide Promotion Banner');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Special Cappuccino Beverage Poster',
  'Poster menu tunggal es cappuccino dengan bingkai ilustrasi biji kopi minimalis',
  'Poster menu 4:5 dengan blok gradien amber sebagai panggung es cappuccino dan pola garis biji kopi minimalis.',
  ARRAY['F&B Design', 'Poster'],
  '/assets/works/graphic/fnb-special-cappuccino.jpg',
  '2025',
  false,
  true,
  7
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Special Cappuccino Beverage Poster');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Signature Coffee Trio Poster',
  'Katalog ringkas varian Milk Coffee, Cappuccino & Aren Latte berlatar langit cerah',
  'Poster showcase tiga varian kopi andalan di atas ilustrasi biji kopi panggang dengan latar langit cerah dan aksen daun.',
  ARRAY['F&B Design', 'Poster'],
  '/assets/works/graphic/fnb-coffee-drink-poster.jpg',
  '2025',
  false,
  true,
  8
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Signature Coffee Trio Poster');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Mie Ayam 10k Mobile Story Poster',
  'Poster promo kuliner Rp10.000 dengan efek keluar bingkai smartphone',
  'Desain promo kuliner berlatar diagonal merah-lime dengan mangkuk mie ayam menembus bingkai Story smartphone dan badge harga 10k.',
  ARRAY['F&B Design', 'Poster', 'Social Media'],
  '/assets/works/graphic/fnb-mie-ayam-promo.jpg',
  '2025',
  false,
  true,
  9
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Mie Ayam 10k Mobile Story Poster');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Fresh & Cold Strawberry Milk Poster',
  'Poster minuman buah segar dengan tipografi vertikal dan 3 badge keunggulan',
  'Poster promo minuman stroberi kontras tinggi dengan tipografi vertikal besar, tiga badge keunggulan, dan tombol Order Now.',
  ARRAY['F&B Design', 'Poster'],
  '/assets/works/graphic/fnb-fresh-strawberry-drink.jpg',
  '2025',
  false,
  true,
  10
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Fresh & Cold Strawberry Milk Poster');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Satrio Dual Discipline Showcase Spread',
  'Poster personal branding dua panel untuk peran Web Developer & Graphic Designer',
  'Desain spread promosi diri membagi panel gelap bertekstur likuid (tipografi SATRIO) dan panel merah editorial untuk profil lintas disiplin.',
  ARRAY['Branding', 'Editorial', 'Poster'],
  '/assets/works/graphic/branding-satrio-dual-spread.jpg',
  '2026',
  true,
  true,
  11
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Satrio Dual Discipline Showcase Spread');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Editor & Designer Profile Card',
  'Kartu identitas digital vertikal dengan pengulangan tipografi solid & outline',
  'Kartu profil vertikal bergaya urban dengan pengulangan kata SATRIO di belakang potret ber-outline putih dan handle media sosial resmi.',
  ARRAY['Branding', 'Social Media'],
  '/assets/works/graphic/branding-satrio-profile-card.jpg',
  '2026',
  false,
  true,
  12
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Editor & Designer Profile Card');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'BMW F30 Dual-Reality Split Edit',
  'Manipulasi foto otomotif dengan efek robekan kertas dan tipografi stensil',
  'Manipulasi visual membelah BMW F30 menjadi sisi monokrom terisolasi (kiri) dan foto realistis aspal (kanan) lewat efek robekan kertas.',
  ARRAY['Poster', 'Editorial'],
  '/assets/works/graphic/editorial-bmw-f30-split.jpg',
  '2025',
  false,
  true,
  13
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'BMW F30 Dual-Reality Split Edit');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Neymar Jr — The Last Jogo Bonito',
  'Poster tribut sepak bola dengan palet kuning-ungu Brasil & lencana perjalanan karier',
  'Poster tribut olahraga dengan dua siluet aksi Neymar Jr, huruf raksasa bertumpuk, dan deretan emblem karier di lengkungan bawah.',
  ARRAY['Poster', 'Editorial'],
  '/assets/works/graphic/sports-neymar-jr-poster.jpg',
  '2025',
  false,
  true,
  14
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Neymar Jr — The Last Jogo Bonito');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Asta — Black Clover Character Poster',
  'Poster karakter anime bertema merah-hitam dengan panel aksi & ringkasan lore',
  'Poster karakter Asta dengan headline tebal, kolase panel aksi bersudut tajam, paragraf pengantar, dan galeri mini 3 kolom.',
  ARRAY['Poster', 'Editorial'],
  '/assets/works/graphic/editorial-asta-black-clover.jpg',
  '2025',
  false,
  true,
  15
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Asta — Black Clover Character Poster');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  '86 Eighty-Six — Dual Character Dossier',
  'Poster profil dua karakter (Shinei Nouzen & Lena Milize) bertekstur atmosferik',
  'Layout dua tingkat mempertemukan Shinei Nouzen dan Lena Milize dengan tipografi judul vertikal, ringkasan peran, dan panel adegan.',
  ARRAY['Poster', 'Editorial'],
  '/assets/works/graphic/editorial-86-character-sheet.jpg',
  '2025',
  false,
  true,
  16
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = '86 Eighty-Six — Dual Character Dossier');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Spider-Man Backstory Editorial Card',
  'Poster bertema komik dengan panel visor close-up, siluet kota & kartu backstory',
  'Poster komik modern memadukan panel visor close-up, jaring laba-laba, siluet kota, dan kartu Backstory bergradient merah-gelap.',
  ARRAY['Poster', 'Editorial'],
  '/assets/works/graphic/comic-spiderman-backstory.jpg',
  '2025',
  false,
  true,
  17
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Spider-Man Backstory Editorial Card');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'award',
  'UI/UX Design Concept Recognition',
  'Slot pengakuan konsep desain antarmuka dan pengalaman pengguna',
  'Slot arsip penghargaan atau pengakuan bidang UI/UX dan desain visual yang dapat diperbarui dari /admin.',
  ARRAY['Figma', 'UI/UX'],
  '/assets/showcase/award-uiux.svg',
  '2025',
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'UI/UX Design Concept Recognition');

-- 4. Polaroid Gallery (6 behind-the-scenes process snapshots — alternating Dev & Design)
INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/works/process/01-atelier-live-preview.jpg', 'Live build preview · Atelier SaaS Engine', -7, 1
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 1);

INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/works/process/02-canva-coffee-drink-layers.jpg', 'Layering & komposisi poster · Coffee Drink', 5, 2
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 2);

INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/works/process/03-vscode-kronos-accounting.png', 'Logic & KPI engine · Kronos Ledger', 8, 3
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 3);

INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/works/process/04-canva-croffle-layout.jpg', 'Editorial layout & copy · Bahan Dasar', -5, 4
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 4);

INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/works/process/05-vscode-absensi-navigation.png', 'Mobile portal navigation · Absensi App', 4, 5
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 5);

INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/works/process/06-canva-coffee-time-layers.jpg', 'Typography & visual hierarchy · Coffee Time', -8, 6
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 6);

-- 5. Guestbook Starter Welcome Entry
INSERT INTO public.guestbook_comments (author_name, author_role, message, is_visible)
SELECT 'Satrio', 'Owner', 'Database Supabase aktif. Tinggalkan catatanmu melalui formulir guestbook.', true
WHERE NOT EXISTS (SELECT 1 FROM public.guestbook_comments);
