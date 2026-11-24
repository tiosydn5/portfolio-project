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

-- 3. Showcase Items (Projects, Certificates, Awards starter rows)
INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'project',
  'Multi-Tenant Service Engine',
  'Sample CMS · Zero-framework modular web app dengan dashboard manajemen layanan',
  'Sampel proyek Web Development untuk arsitektur multi-tenant berbasis Vanilla ES Modules, Tailwind CSS, dan kontrol data terstruktur.',
  ARRAY['JavaScript', 'Tailwind CSS', 'Web Dev'],
  '/assets/showcase/project-atelier.svg',
  '2026',
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Multi-Tenant Service Engine');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'project',
  'Millisecond Keyframe Transpiler',
  'Sample CMS · Sistem pratinjau kurva gerak dan tipografi kinetik berbasis Canvas',
  'Sampel proyek Motion Graphics yang memetakan kurva keyframe Alight Motion ke timeline eksekusi milidetik.',
  ARRAY['Alight Motion', 'Motion', 'JavaScript'],
  '/assets/showcase/project-mograph.svg',
  '2026',
  true,
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Millisecond Keyframe Transpiler');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'certificate',
  'Modern Frontend Engineering Track',
  'Sample CMS · Slot sertifikat kompetensi HTML semantik, CSS layout, dan DOM aman',
  'Slot terstruktur untuk mengarsipkan sertifikat web development resmi beserta tautan verifikasi kredensial.',
  ARRAY['HTML5', 'JavaScript', 'Web Dev'],
  '/assets/showcase/cert-frontend.svg',
  '2025',
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'Modern Frontend Engineering Track');

INSERT INTO public.showcase_items (
  category, title, subtitle, description, tech_tags, thumbnail_url, date_label, is_featured, is_published, sort_order
)
SELECT
  'award',
  'UI/UX Design Concept Recognition',
  'Sample CMS · Slot penghargaan kompetisi desain antarmuka dan pengalaman pengguna',
  'Slot arsip penghargaan bidang UI/UX dan desain visual yang dapat diperbarui dari /admin.',
  ARRAY['Figma', 'UI/UX'],
  '/assets/showcase/award-uiux.svg',
  '2025',
  true,
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.showcase_items WHERE title = 'UI/UX Design Concept Recognition');

-- 4. Polaroid Gallery (6 starter documentation slots)
INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/polaroid/polaroid-01.svg', 'Sample 01: Layout Bento Grid Desktop Blueprint', -7, 1
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 1);

INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/polaroid/polaroid-02.svg', 'Sample 02: Kalibrasi Bezier Easing Alight Motion', 5, 2
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 2);

INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
SELECT '/assets/polaroid/polaroid-03.svg', 'Sample 03: Eksplorasi Specimen Space Grotesk', 8, 3
WHERE NOT EXISTS (SELECT 1 FROM public.polaroid_photos WHERE sort_order = 3);

-- 5. Guestbook Starter Welcome Entry
INSERT INTO public.guestbook_comments (author_name, author_role, message, is_visible)
SELECT 'Satrio', 'Owner', 'Database Supabase aktif. Tinggalkan catatanmu melalui formulir guestbook.', true
WHERE NOT EXISTS (SELECT 1 FROM public.guestbook_comments);
