-- =============================================================================
-- Cyber-Tech Bento Portfolio + Admin CMS : Supabase PostgreSQL Schema
-- =============================================================================
-- BEFORE RUNNING IN SUPABASE SQL EDITOR:
-- 1. Replace '<ADMIN_EMAIL>' inside public.is_portfolio_admin() with your exact
--    Supabase Auth admin email address.
-- 2. In Supabase Dashboard -> Authentication -> Providers -> Email:
--    DISABLE "Allow new users to sign up" after creating your single admin user.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1. Admin Authorization Helper (Case-insensitive JWT email gate)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_portfolio_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT
    auth.role() = 'authenticated'
    AND LOWER(COALESCE(auth.jwt() ->> 'email', '')) = LOWER('<ADMIN_EMAIL>');
$$;

-- -----------------------------------------------------------------------------
-- 2. site_profile (Singleton row enforced via CHECK (id = 1))
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_profile (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name TEXT NOT NULL DEFAULT 'Muhammad Syahdan Satrio Kuncoro'
    CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  display_name TEXT NOT NULL DEFAULT 'Satrio'
    CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 60),
  handle TEXT NOT NULL DEFAULT '@satrio'
    CHECK (char_length(btrim(handle)) BETWEEN 2 AND 40),
  tagline TEXT NOT NULL DEFAULT 'Web Development, Graphic Design, Motion Graphics'
    CHECK (char_length(btrim(tagline)) BETWEEN 2 AND 160),
  bio TEXT NOT NULL DEFAULT 'Membangun antarmuka web presisi, sistem identitas visual, dan motion graphics dari Jakarta, Indonesia.'
    CHECK (char_length(btrim(bio)) BETWEEN 10 AND 1200),
  location_label TEXT NOT NULL DEFAULT 'Jakarta, Indonesia'
    CHECK (char_length(btrim(location_label)) BETWEEN 2 AND 80),
  coordinates_label TEXT NOT NULL DEFAULT '6.2088° S, 106.8456° E'
    CHECK (char_length(btrim(coordinates_label)) BETWEEN 2 AND 60),
  status_text TEXT NOT NULL DEFAULT 'Available for select projects'
    CHECK (char_length(btrim(status_text)) BETWEEN 2 AND 80),
  is_available BOOLEAN NOT NULL DEFAULT true,
  hero_cutout_url TEXT,
  avatar_normal_url TEXT,
  avatar_alter_url TEXT,
  socials JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(socials) = 'array'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_site_profile_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_profile_updated_at ON public.site_profile;
CREATE TRIGGER trg_site_profile_updated_at
  BEFORE UPDATE ON public.site_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.set_site_profile_updated_at();

INSERT INTO public.site_profile (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. showcase_items (Projects, Certificates, Awards)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.showcase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('project', 'certificate', 'award')),
  title TEXT NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 120),
  subtitle TEXT DEFAULT '' CHECK (char_length(btrim(COALESCE(subtitle, ''))) <= 180),
  description TEXT DEFAULT '' CHECK (char_length(btrim(COALESCE(description, ''))) <= 2500),
  tech_tags TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  live_url TEXT,
  repo_url TEXT,
  date_label TEXT DEFAULT '' CHECK (char_length(btrim(COALESCE(date_label, ''))) <= 40),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_showcase_cat_pub_sort
  ON public.showcase_items (category, is_published, sort_order, created_at DESC);

-- -----------------------------------------------------------------------------
-- 4. timeline_entries (Education & Experience)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('education', 'experience')),
  organization TEXT NOT NULL CHECK (char_length(btrim(organization)) BETWEEN 2 AND 120),
  role TEXT NOT NULL CHECK (char_length(btrim(role)) BETWEEN 2 AND 120),
  period TEXT NOT NULL CHECK (char_length(btrim(period)) BETWEEN 2 AND 40),
  description TEXT DEFAULT '' CHECK (char_length(btrim(COALESCE(description, ''))) <= 600),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_type_sort
  ON public.timeline_entries (type, sort_order);

-- -----------------------------------------------------------------------------
-- 5. polaroid_photos (Scatter Gallery)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.polaroid_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL CHECK (char_length(btrim(image_url)) > 0),
  caption TEXT NOT NULL CHECK (char_length(btrim(caption)) BETWEEN 1 AND 120),
  rotation_deg INTEGER NOT NULL DEFAULT 0 CHECK (rotation_deg BETWEEN -25 AND 25),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_polaroid_sort
  ON public.polaroid_photos (sort_order);

-- -----------------------------------------------------------------------------
-- 6. guestbook_comments (Public Insert + Admin Moderation)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.guestbook_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL CHECK (char_length(btrim(author_name)) BETWEEN 2 AND 60),
  author_role TEXT NOT NULL DEFAULT '' CHECK (char_length(btrim(author_role)) <= 40),
  message TEXT NOT NULL CHECK (char_length(btrim(message)) BETWEEN 3 AND 500),
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guestbook_visible_created
  ON public.guestbook_comments (created_at DESC)
  WHERE is_visible = true;

-- -----------------------------------------------------------------------------
-- 7. contact_messages (Public Insert Only, Admin Read/Manage Only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL CHECK (char_length(btrim(sender_name)) BETWEEN 2 AND 80),
  sender_email TEXT NOT NULL CHECK (sender_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message TEXT NOT NULL CHECK (char_length(btrim(message)) BETWEEN 5 AND 2000),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_unread_created
  ON public.contact_messages (is_read, created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polaroid_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- site_profile
DROP POLICY IF EXISTS "Public read site_profile" ON public.site_profile;
CREATE POLICY "Public read site_profile"
  ON public.site_profile FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin manage site_profile" ON public.site_profile;
CREATE POLICY "Admin manage site_profile"
  ON public.site_profile FOR ALL
  USING (public.is_portfolio_admin())
  WITH CHECK (public.is_portfolio_admin());

-- showcase_items
DROP POLICY IF EXISTS "Public read published showcase_items" ON public.showcase_items;
CREATE POLICY "Public read published showcase_items"
  ON public.showcase_items FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admin manage showcase_items" ON public.showcase_items;
CREATE POLICY "Admin manage showcase_items"
  ON public.showcase_items FOR ALL
  USING (public.is_portfolio_admin())
  WITH CHECK (public.is_portfolio_admin());

-- timeline_entries
DROP POLICY IF EXISTS "Public read timeline_entries" ON public.timeline_entries;
CREATE POLICY "Public read timeline_entries"
  ON public.timeline_entries FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin manage timeline_entries" ON public.timeline_entries;
CREATE POLICY "Admin manage timeline_entries"
  ON public.timeline_entries FOR ALL
  USING (public.is_portfolio_admin())
  WITH CHECK (public.is_portfolio_admin());

-- polaroid_photos
DROP POLICY IF EXISTS "Public read polaroid_photos" ON public.polaroid_photos;
CREATE POLICY "Public read polaroid_photos"
  ON public.polaroid_photos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin manage polaroid_photos" ON public.polaroid_photos;
CREATE POLICY "Admin manage polaroid_photos"
  ON public.polaroid_photos FOR ALL
  USING (public.is_portfolio_admin())
  WITH CHECK (public.is_portfolio_admin());

-- guestbook_comments
DROP POLICY IF EXISTS "Public read visible guestbook_comments" ON public.guestbook_comments;
CREATE POLICY "Public read visible guestbook_comments"
  ON public.guestbook_comments FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Public insert guestbook_comments" ON public.guestbook_comments;
CREATE POLICY "Public insert guestbook_comments"
  ON public.guestbook_comments FOR INSERT
  WITH CHECK (is_visible = true);

DROP POLICY IF EXISTS "Admin manage guestbook_comments" ON public.guestbook_comments;
CREATE POLICY "Admin manage guestbook_comments"
  ON public.guestbook_comments FOR ALL
  USING (public.is_portfolio_admin())
  WITH CHECK (public.is_portfolio_admin());

-- contact_messages (No public SELECT)
DROP POLICY IF EXISTS "Public insert contact_messages" ON public.contact_messages;
CREATE POLICY "Public insert contact_messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (is_read = false);

DROP POLICY IF EXISTS "Admin manage contact_messages" ON public.contact_messages;
CREATE POLICY "Admin manage contact_messages"
  ON public.contact_messages FOR ALL
  USING (public.is_portfolio_admin())
  WITH CHECK (public.is_portfolio_admin());

-- -----------------------------------------------------------------------------
-- 9. Storage Bucket: portfolio-media (Public Read, Admin Write, No SVG XSS)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read portfolio-media" ON storage.objects;
CREATE POLICY "Public read portfolio-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-media');

DROP POLICY IF EXISTS "Admin upload portfolio-media" ON storage.objects;
CREATE POLICY "Admin upload portfolio-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-media' AND public.is_portfolio_admin());

DROP POLICY IF EXISTS "Admin update portfolio-media" ON storage.objects;
CREATE POLICY "Admin update portfolio-media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio-media' AND public.is_portfolio_admin())
  WITH CHECK (bucket_id = 'portfolio-media' AND public.is_portfolio_admin());

DROP POLICY IF EXISTS "Admin delete portfolio-media" ON storage.objects;
CREATE POLICY "Admin delete portfolio-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio-media' AND public.is_portfolio_admin());

-- -----------------------------------------------------------------------------
-- 10. Explicit PostgreSQL Role Grants (Required alongside RLS)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_portfolio_admin() TO anon, authenticated;

REVOKE ALL ON TABLE public.site_profile FROM anon;
GRANT SELECT ON TABLE public.site_profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_profile TO authenticated;

REVOKE ALL ON TABLE public.showcase_items FROM anon;
GRANT SELECT ON TABLE public.showcase_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.showcase_items TO authenticated;

REVOKE ALL ON TABLE public.timeline_entries FROM anon;
GRANT SELECT ON TABLE public.timeline_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.timeline_entries TO authenticated;

REVOKE ALL ON TABLE public.polaroid_photos FROM anon;
GRANT SELECT ON TABLE public.polaroid_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.polaroid_photos TO authenticated;

REVOKE ALL ON TABLE public.guestbook_comments FROM anon;
GRANT SELECT, INSERT ON TABLE public.guestbook_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.guestbook_comments TO authenticated;

REVOKE ALL ON TABLE public.contact_messages FROM anon;
GRANT INSERT ON TABLE public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contact_messages TO authenticated;

