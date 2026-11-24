# STATE.md — Live Project Save-Game

- **Last Updated**: 2026-11-24
- **Current Phase**: Phase 3 + Bright Editorial Visual Overhaul + GSAP & Lenis Motion Overhaul Complete
- **Overall Status**: Full Bright Editorial Cyber-Tech Bento (Blue Edition) Portfolio (`/`) powered by `GSAP` (`ScrollTrigger`, `quickTo`, `matchMedia`) + `Lenis` smooth scrolling and Dark Operate-Mode Admin CMS (`/admin`) with live Supabase hydration, storage media uploaders, Auth Gate, full CRUD across all 5 CMS modules, clean offline/preview fallback, `supabase/schema.sql`, `supabase/seed.sql`, and `.github/workflows/supabase-keepalive.yml`.

## Architecture Snapshot
- **Frontend**: Vite 6 + Multi-Page Vanilla ES Modules (`index.html`, `admin.html`) + Compiled Tailwind CSS v4 + `gsap` + `lenis` (`src/lib/motion-engine.js`)
- **Backend**: Supabase (`@supabase/supabase-js` wired for Public reads/inserts + Admin Auth/CRUD/Storage; falls back seamlessly to `data-fallback.js` + browser preview keys `portfolio_guestbook_v2` & `portfolio_contact_preview_v2` when `.env` is absent)
- **Public Visual System**: Bright Editorial Cyber-Tech Bento (Blue Edition) with two spacious Bento Blocks inside `#about` (Blok A Profile Board + locked `4:5` Spotlight + Core Stack Marquee; Blok B Education + Scrollable Experience + full-width 12-col 3D Interactive Folders), spring navbar pill + outlined cyber mascot, scroll-scrubbed Hero & Kinetic Bridge parallax, sliding Showcase tab pill, desktop ScrollTrigger Polaroid scatter explosion, and 3D perspective lanyard tilt on Find Me card.
- **Admin Visual System**: Preserved Dark Operate-Mode (`--bg-dark-*` tokens, `#B91C1C` admin danger action) with zero regression.
- **Environment Variable Names (never store secret values here)**:
  - App runtime (`.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - GitHub Actions (`supabase-keepalive.yml`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## File Tree
- `AGENT_RULES.md` (Governance + Anti-AI-Slop + Sync Protocol)
- `PRD.md` (Full Specification, Bright Editorial + Motion Engine Architecture, WCAG AA Tokens, & Hardened DB Schema)
- `STATE.md` (This file)
- `CHANGELOG.md` (Dated engineering log)
- `.gitignore`, `.env.example`, `package.json`, `package-lock.json`, `vite.config.js`
- `index.html` (Public Portfolio: Bright Editorial Bento Hero Board, 2-Block `#about` Bento, Kinetic Bridge, Showcase + Sliding Tabs + Spring Modal, Periwinkle Polaroid Scatter + Lightbox, Bright Contact + 3D Find Me Tilt + Guestbook)
- `admin.html` (Private `/admin` Operate-mode CMS with Auth Gate, Navigation Rail, 5 Modules, & Confirmation Dialog)
- `public/favicon.svg`
- `public/assets/` (`hero-cutout-placeholder.svg`, `avatar-normal-placeholder.svg`, `avatar-alter-placeholder.svg`)
- `public/assets/showcase/` (10 Studio SVG thumbnails)
- `public/assets/polaroid/` (6 Studio Frame SVGs)
- `reference/1000535039.mp4` (Phase 0 reference choreography video)
- `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/animations.css`, `src/styles/admin.css`
- `src/lib/sanitize.js`, `src/lib/supabase.js`, `src/lib/data-fallback.js`, `src/lib/storage-upload.js`, `src/lib/portfolio-api.js`, `src/lib/motion-engine.js`
- `src/components/navbar.js`, `src/components/hero-parallax.js`, `src/components/spotlight-avatar.js`, `src/components/telemetry-clock.js`, `src/components/bento-about.js`, `src/components/folders-3d.js`, `src/components/showcase.js`, `src/components/polaroid-scatter.js`, `src/components/contact-guestbook.js`
- `src/admin/admin-main.js`, `src/admin/admin-ui.js`, `src/admin/profile-editor.js`, `src/admin/showcase-crud.js`, `src/admin/timeline-crud.js`, `src/admin/polaroid-crud.js`, `src/admin/moderation.js`
- `src/main.js`
- `supabase/schema.sql`, `supabase/seed.sql`
- `.github/workflows/supabase-keepalive.yml`

## Completed Milestones
- [x] Phase 0: Reference video breakdown, UX/motion conflict audit, WCAG AA contrast audit, & alignment sign-off
- [x] Phase 1: Multi-page Vite + Tailwind v4 scaffold, WCAG AA tokens, `supabase/schema.sql` + keep-alive cron, Navbar + Cyber Mascot, 3-Layer Hero Parallax, Bento About Me + Spotlight + Telemetry + 3D Folders
- [x] Phase 2: Tech Stack update (`Alight Motion`, `CapCut`), Kinetic Bridge (`PORTFOLIO`), 3-Tab Showcase Carousel + Tag Filters + Detail Modal, Polaroid Scatter + Lightbox, Contact Form + `Find Me` ID Badge + XSS-safe Live Guestbook
- [x] Phase 3: Live Supabase client integration (`portfolio-api.js`, `storage-upload.js`), full Operate-mode `/admin` CMS (Auth Gate + 5 CRUD/Moderation modules), `supabase/seed.sql`, responsive & accessibility verification across `320px–1280px`
- [x] Visual Overhaul (2026-11-24): Bright Editorial Cyber-Tech Bento (Blue Edition) palette, `contrast-check.py` WCAG AA verification, clean copy free of dev milestone labels, mobile bottom dock pill calibration.
- [x] Motion Engine & Two-Block Layout Overhaul (2026-11-24): Installed `gsap` + `lenis`, built `src/lib/motion-engine.js`, refactored `#about` into Blok A + Blok B with strict `4:5` Spotlight lock and Core Stack kinetic marquee, fixed `.skip-link` visibility leak (`:focus-visible` only), added Hero scroll-scrubbing, 3D folder fanning, sliding Showcase tab pill + card pop-in + spring dialogs, Polaroid center explosion + hover straighten/lift, 3D Find Me ID card tilt, and Guestbook new comment pop-in; verified across `1280px`, `375px`, and `/admin`.
- [x] Repo Structure & Audit Cleanup (2026-11-24): Fixed misplaced `workflows/supabase-keepalive.yml` -> `.github/workflows/supabase-keepalive.yml` (with dual JWT / `sb_publishable` header support), tightened `safeUrl` validation, prevented null append in Find Me list, preserved `scrollTarget` + unique row IDs in `profile-editor.js`, cleaned Showcase modal metadata separator, and verified `vite build` + headless browser audit.
- [x] Supabase Connection, Secrets & Role Grants (2026-11-24): Configured local gitignored `.env` (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` via publishable key) and set GitHub Actions repository secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) on `tiosydn5/portfolio-project`. Added Section 10 explicit least-privilege PostgreSQL `GRANT` statements in `supabase/schema.sql` after live REST/SDK probing detected PostgreSQL `42501 permission denied` for `anon`.

## Active / Next Action (User Activation Checklist)
1. Run the Section 10 PostgreSQL `GRANT` statements from `supabase/schema.sql` in the live Supabase SQL Editor so `anon` and `authenticated` roles can pass table-level privilege checks before RLS evaluation.
2. Push local `main` commits to `origin/main` so `.github/workflows/supabase-keepalive.yml` goes live on GitHub Actions.
3. Optionally run `supabase/seed.sql` or sign in at `/admin` (`/admin.html`) to upload real assets and manage content, then configure deployment target (Vercel / Netlify / Cloudflare Pages / GitHub Pages).

## Known Issues / Blockers
- Live Supabase tables on project `brqnldutafuopflizrph` currently return `42501 permission denied` to `anon` until the explicit `GRANT` block in `supabase/schema.sql` is executed in Supabase SQL Editor.
- Local `main` is ahead of `origin/main` (pending `git push`).
