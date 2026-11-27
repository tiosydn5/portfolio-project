-- =============================================================================
-- Safe Incremental Migration: Enable Video Playback & Upload in Showcase
-- =============================================================================
-- 100% NON-DESTRUCTIVE: Does NOT delete or alter any existing rows, profiles,
-- showcase items, timeline entries, polaroids, guestbook, or RLS policies.
-- Run this once in Supabase Dashboard -> SQL Editor.
-- =============================================================================

BEGIN;

-- 1. Add optional video_url column to showcase_items
ALTER TABLE public.showcase_items
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Allow MP4 / WebM / MOV uploads (up to 50 MB) in portfolio-media bucket
UPDATE storage.buckets
SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
WHERE id = 'portfolio-media';

COMMIT;
