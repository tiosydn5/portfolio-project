-- =============================================================================
-- Replace ONLY public.polaroid_photos with 6 Behind-the-Scenes Process Snapshots
-- AMAN: Tidak menyentuh site_profile, showcase_items, timeline_entries,
--       guestbook_comments, contact_messages, skema, maupun RLS policies.
-- =============================================================================

BEGIN;

DELETE FROM public.polaroid_photos;

INSERT INTO public.polaroid_photos (image_url, caption, rotation_deg, sort_order)
VALUES
  ('/assets/works/process/01-atelier-live-preview.jpg', 'Live build preview · Atelier SaaS Engine', -7, 1),
  ('/assets/works/process/02-canva-coffee-drink-layers.jpg', 'Layering & komposisi poster · Coffee Drink', 5, 2),
  ('/assets/works/process/03-vscode-kronos-accounting.png', 'Logic & KPI engine · Kronos Ledger', 8, 3),
  ('/assets/works/process/04-canva-croffle-layout.jpg', 'Editorial layout & copy · Bahan Dasar', -5, 4),
  ('/assets/works/process/05-vscode-absensi-navigation.png', 'Mobile portal navigation · Absensi App', 4, 5),
  ('/assets/works/process/06-canva-coffee-time-layers.jpg', 'Typography & visual hierarchy · Coffee Time', -8, 6);

COMMIT;
