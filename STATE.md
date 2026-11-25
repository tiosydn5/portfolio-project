# STATE.md — Live Project Save-Game

- **Last Updated**: 2026-11-25
- **Current Phase**: Phase 3 + Bright Editorial Public Overhaul + GSAP/Lenis Motion + Bright Bento Studio CMS (`/admin`) + Client-Side Portfolio Assistant Bot Complete
- **Overall Status**: Unified Bright Editorial Cyber-Tech Bento (Blue Edition) Portfolio (`/`) powered by `GSAP` (`ScrollTrigger`, `quickTo`, `matchMedia`) + `Lenis` smooth scrolling, interactive 100% client-side **Portfolio Assistant Bot**, and **Bright Bento Studio CMS (`/admin`)** with live Supabase hydration, drag-and-drop storage dropzones, Split Studio live profile preview, content-first Visual Card Grids, Slide-Over Drawers, rotation slider Polaroid preview, modern Inbox/Guestbook moderation, `supabase/schema.sql`, `supabase/seed.sql`, `.github/workflows/supabase-keepalive.yml`, and `.github/workflows/deploy-pages.yml`.

## Architecture Snapshot
- **Frontend**: Vite 6 + Multi-Page Vanilla ES Modules (`index.html`, `admin.html`) + Compiled Tailwind CSS v4 + `gsap` + `lenis` (`src/lib/motion-engine.js`)
- **Backend**: Supabase (`@supabase/supabase-js` wired for Public reads/inserts + Admin Auth/CRUD/Storage; falls back seamlessly to `data-fallback.js` + browser preview keys `portfolio_guestbook_v2` & `portfolio_contact_preview_v2` when `.env` is absent)
- **Public Visual System**: Bright Editorial Cyber-Tech Bento (Blue Edition) with two spacious Bento Blocks inside `#about` (Blok A Profile Board + locked `4:5` Spotlight + Core Stack Marquee; Blok B Education + Scrollable Experience + full-width 12-col 3D Interactive Folders), spring navbar pill + clickable Cyber Mascot triggering the client-side Portfolio Assistant Bot, scroll-scrubbed Hero & Kinetic Bridge parallax, single-row sliding Showcase tab pill, desktop ScrollTrigger Polaroid scatter explosion, and 3D perspective lanyard tilt on Find Me card.
- **Admin Visual System**: Bright Bento Studio CMS (`#F4F6FA` canvas, `#FFFFFF` Bento cards, `1.5px solid #0F172A` borders, `#2563EB` Cobalt, `#DBEAFE` Sky, `#E0E7FF` Periwinkle, WCAG AA `>= 5.17:1`) with custom monochrome SVG nav icons + live counters, Visual Media Dropzones, tactile Toggle Switches, Segmented Pills, Sticky Save Bar, and GPU-composited Slide-Over Drawers.
- **Environment Variable Names (never store secret values here)**:
  - App runtime (`.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - GitHub Actions (`supabase-keepalive.yml`, `deploy-pages.yml`): `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## File Tree
- `AGENT_RULES.md` (Governance + Anti-AI-Slop + Sync Protocol)
- `PRD.md` (Full Specification, Bright Editorial Public + Bright Bento Studio CMS Architecture, WCAG AA Tokens, & Hardened DB Schema)
- `STATE.md` (This file)
- `CHANGELOG.md` (Dated engineering log)
- `.gitignore`, `.env.example`, `package.json`, `package-lock.json`, `vite.config.js`, `vercel.json`, `netlify.toml`
- `index.html` (Public Portfolio: Bright Editorial Bento Hero Board, 2-Block `#about` Bento, Kinetic Bridge, Showcase + Sliding Tabs + Spring Modal, Periwinkle Polaroid Scatter + Lightbox, Bright Contact + 3D Find Me Tilt + Guestbook, & Footer `Kembali ke Atas` pill with hidden admin entry)
- `admin.html` (Bright Bento Studio CMS shell: sticky header with connection pill, centered Bento Login card, icon sidebar with live badge counters, Slide-Over Drawer, floating toast, & confirmation dialog)
- `public/favicon.svg`
- `public/assets/` (`hero-cutout-placeholder.svg`, `avatar-normal-placeholder.svg`, `avatar-alter-placeholder.svg`)
- `public/assets/showcase/` (10 Studio SVG thumbnails)
- `public/assets/polaroid/` (6 Studio Frame SVGs)
- `reference/1000535039.mp4` (Phase 0 reference choreography video)
- `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/animations.css`, `src/styles/admin.css`
- `src/lib/sanitize.js`, `src/lib/supabase.js`, `src/lib/data-fallback.js`, `src/lib/storage-upload.js`, `src/lib/portfolio-api.js`, `src/lib/motion-engine.js`
- `src/components/navbar.js`, `src/components/hero-parallax.js`, `src/components/spotlight-avatar.js`, `src/components/telemetry-clock.js`, `src/components/bento-about.js`, `src/components/folders-3d.js`, `src/components/showcase.js`, `src/components/polaroid-scatter.js`, `src/components/contact-guestbook.js`, `src/components/portfolio-bot.js`
- `src/admin/admin-main.js`, `src/admin/login-guard.js`, `src/admin/admin-ui.js`, `src/admin/profile-editor.js`, `src/admin/showcase-crud.js`, `src/admin/timeline-crud.js`, `src/admin/polaroid-crud.js`, `src/admin/moderation.js`
- `src/main.js`
- `supabase/schema.sql`, `supabase/seed.sql`
- `.github/workflows/supabase-keepalive.yml`, `.github/workflows/deploy-pages.yml`

## Completed Milestones
- [x] Phase 0: Reference video breakdown, UX/motion conflict audit, WCAG AA contrast audit, & alignment sign-off
- [x] Phase 1: Multi-page Vite + Tailwind v4 scaffold, WCAG AA tokens, `supabase/schema.sql` + keep-alive cron, Navbar + Cyber Mascot, 3-Layer Hero Parallax, Bento About Me + Spotlight + Telemetry + 3D Folders
- [x] Phase 2: Tech Stack update (`Alight Motion`, `CapCut`), Kinetic Bridge (`PORTFOLIO`), 3-Tab Showcase Carousel + Tag Filters + Detail Modal, Polaroid Scatter + Lightbox, Contact Form + `Find Me` ID Badge + XSS-safe Live Guestbook
- [x] Phase 3: Live Supabase client integration (`portfolio-api.js`, `storage-upload.js`), full `/admin` CMS (Auth Gate + 5 CRUD/Moderation modules), `supabase/seed.sql`, responsive & accessibility verification across `320px–1280px`
- [x] Visual Overhaul (2026-11-24): Bright Editorial Cyber-Tech Bento (Blue Edition) palette, `contrast-check.py` WCAG AA verification, clean copy free of dev milestone labels, mobile bottom dock pill calibration.
- [x] Motion Engine & Two-Block Layout Overhaul (2026-11-24): Installed `gsap` + `lenis`, built `src/lib/motion-engine.js`, refactored `#about` into Blok A + Blok B with strict `4:5` Spotlight lock and Core Stack kinetic marquee, fixed `.skip-link` visibility leak (`:focus-visible` only), added Hero scroll-scrubbing, 3D folder fanning, sliding Showcase tab pill + card pop-in + spring dialogs, Polaroid center explosion + hover straighten/lift, 3D Find Me ID card tilt, and Guestbook new comment pop-in; verified across `1280px`, `375px`, and `/admin`.
- [x] Repo Structure & Audit Cleanup (2026-11-24): Fixed misplaced `workflows/supabase-keepalive.yml` -> `.github/workflows/supabase-keepalive.yml` (with dual JWT / `sb_publishable` header support), tightened `safeUrl` validation, prevented null append in Find Me list, preserved `scrollTarget` + unique row IDs in `profile-editor.js`, cleaned Showcase modal metadata separator, and verified `vite build` + headless browser audit.
- [x] Supabase Live Activation, Deployment Routing & Push (2026-11-24): Configured local `.env` & GitHub repository secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), added Section 10 explicit PostgreSQL `GRANT`s in `supabase/schema.sql` (verified `200 OK` across public tables + `401` SELECT lock on `contact_messages`), added `vercel.json` and `netlify.toml` for `/admin` production rewrites, pushed to `origin/main`, and verified live keep-alive workflow.
- [x] GitHub Pages Vite Build & Subpath Support (2026-11-24): Added `VITE_BASE_PATH` support in `vite.config.js`, `%BASE_URL%` prefixes in `index.html` & `admin.html`, base-aware `assetUrl()`/`safeUrl()` in `src/lib/sanitize.js`, and `.github/workflows/deploy-pages.yml` (`actions/deploy-pages@v4`) with GitHub Pages switched from legacy branch serving to `workflow`.
- [x] Bright Bento Studio CMS Overhaul (2026-11-24): Redesigned `admin.html`, `src/styles/admin.css`, and all `src/admin/*` modules into Bright Bento Studio CMS (aligned `#F4F6FA`/`#FFFFFF`/`#2563EB`/`#DBEAFE`/`#E0E7FF` palette, zero DB/AI jargon, monochrome SVG sidebar + live counters, drag-and-drop Visual Media Dropzones, tactile Toggle Switches & Segmented Pills, Split Studio Profile + Real-Time Mini-Preview + Sticky Save Bar, Content-First Showcase Card Grid + Slide-Over Drawer, Visual Timeline Feed + Drawer, Rotated Polaroid Grid + Range Slider Preview Drawer, and Modern Guestbook/Inbox UI) while keeping all Supabase auth/CRUD/Storage/RLS logic intact. Verified `npm run build`, WCAG AA contrast (`>= 5.17:1`), and Playwright audits across `1280px` & `375px`, and deployed via GitHub Pages.
- [x] Showcase Category Display Labels & Visual Snapshots Copy Update (2026-11-24): Updated UI display labels only (`project` -> `Web & Apps`, `certificate` -> `Graphic Design`, `award` -> `Credentials`) across 3D Folders, Showcase Tabs, fallback data, and `/admin` Showcase Manager, and reframed Polaroid Scatter as `Visual Snapshots` with updated default captions—zero layout, CSS, color, animation, or DB enum/schema changes.
- [x] Visual/Privacy Fixes & Client-Side Portfolio Assistant Bot (2026-11-25): Fixed Showcase tabs wrapping & sliding pill vertical stretch (`flex-nowrap`, `whitespace-nowrap`, exact `offsetLeft`/`offsetTop`/`offsetWidth`/`offsetHeight` measurement), locked `ID · JKT` badge to a single line (`whitespace-nowrap shrink-0`), removed precise lat/long coordinates from public Telemetry card in favor of `Remote Friendly · ID` for privacy, and added 100% client-side `src/components/portfolio-bot.js` triggered by the clickable navbar Cyber Mascot (`"Tanya Satrio Bot"` tooltip) and desktop-only bottom-right FAB—zero DB schema changes, zero external API keys, strict `textContent` XSS safety, verified via `npm run build` + Playwright (`1280px`, `375px`, `320px`).
- [x] Public Footer Hygiene & Hidden Admin Access (2026-11-25): Removed the visible `/admin CMS` footer link from `index.html`, replaced it with the `Kembali ke Atas` smooth-scroll pill button targeting `#home` (with `sm:pb-[88px]` desktop clearance above `Tanya Bot`), and wired hidden admin shortcuts (`5x` rapid click on footer `2026` or `Ctrl + Shift + A`) in `src/main.js`; verified `npm run build` + Playwright (`1280px` & `375px`) with `/admin` direct URL route untouched.
- [x] Admin Progressive Login Lockout & Anti-Enumeration Guard (2026-11-25): Added `src/admin/login-guard.js` with serialized `localStorage` + `IndexedDB` mirror persistence (`studio_auth_guard_v1` / `studio_auth_guard_db`), unified `"Email atau password tidak sesuai."` generic error response with `~400ms` delay floor, progressive schedule (`3x: 1m`, `4x: 3m`, `5x: 1h`, `6x: 2h`, `7x: 4h`, `8x: 8h`, `9x: 12h` with zero threshold warning, `10x: permanentLock`), 24-hour auto-reset when `< 10` failures, reset on auth success, and Bright Bento countdown/permanent-lock UI (`admin.html`, `src/styles/admin.css`, `src/admin/admin-main.js`); verified via `npm run build` and Playwright simulation (`1280px` & `375px`) with browser storage cleaned afterward.

## Active / Next Action (User Activation Checklist)
1. Sign in at `/admin` (direct `/admin` URL, `5x` rapid click on footer `2026`, or `Ctrl + Shift + A`) to upload real assets and manage portfolio content across `Web & Apps`, `Graphic Design`, `Credentials`, and `Visual Snapshots`.
2. Optionally connect repo to Vercel or Netlify (with `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` env vars) if deploying on a custom root domain.

## Known Issues / Blockers
- None. Both `/` and `/admin` Bright Bento Studio CMS (with progressive login lockout & anti-enumeration) are verified, pushed to `origin/main`, and deployed to GitHub Pages.
