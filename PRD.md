# PRD.md — Cyber-Tech Bento Portfolio & CMS

## 1. Product Vision
A high-craft, interactive personal portfolio combining the **scrollytelling mechanics and interactive rhythm** of the reference video with a **Bright Editorial Cyber-Tech Bento (Blue Edition)** visual language (clean bright editorial canvas anchored by Cobalt Blue, pastel sky/periwinkle blocks, crisp ink hairlines, and 2 dark Obsidian focal anchor tiles). Backed by a private `/admin` Operate-Mode CMS so the owner can add/edit projects, certificates, awards, experience, profile media, and moderate the live guestbook without touching code.

## 2. Reference Video Mapping (Mechanics ONLY — NOT Visual Theme)
Adopt the *interaction choreography* from the attached reference video, translated into Bright Editorial Cyber-Tech Bento:
1. **Floating Pill Navbar + Interactive Cyber Mascot (Portfolio Assistant Bot Trigger)**:
   - Centered floating pill (`Home`, `About`, `Portfolio`, `Contact`) with `1.5px solid #0F172A` precision border and frosted white surface.
   - Custom obsidian cyber SVG mascot with white protective keyline sits atop the active Cobalt Blue pill (`#2563EB`) and glides via GSAP (`back.out(1.4)`) with subtle directional tilt (`IntersectionObserver` + `offsetLeft`).
   - Clicking the mascot (with `"Tanya Satrio Bot"` hover tooltip on desktop) or the desktop-only bottom-right `"Tanya Bot"` FAB toggles the 100% client-side **Interactive Portfolio Assistant Bot** (`src/components/portfolio-bot.js`), reading hydrated live state (`profile`, `showcase`, `timeline`, `techStack`, `socials`) with zero external API keys, bilingual ID/EN intent matching, Quick Prompt chips, typing indicator, quick navigation actions, `Escape` close, and strict `textContent` rendering.
2. **Bright Editorial Bento Hero Board (3-Layer Scroll-Scrubbed Parallax Focal Stage)**:
   - Framed inside an asymmetric 12-column Bento board on `#F4F6FA`:
     - **Tile H1 (`lg:col-span-8 lg:row-span-2`, Obsidian Anchor `#0B0F19`)**: Choreographed intro reveal (`power4.out` + masked text rise) + scroll-scrubbed 3-Layer Parallax (`hero-coord-grid` depth -> rising & scaling `SATRIO` display typography -> cutout portrait + left/right splitting framing plates via `gsap.timeline({ scrollTrigger: { scrub: 0.8 } })`).
     - **Tile H2 (`lg:col-span-4`, Soft Sky Blue `#DBEAFE`)**: Focus disciplines intro & base specs with magnetic top-right circular action link.
     - **Tile H3 (`lg:col-span-4`, Electric Cobalt `#2563EB`)**: High-contrast quick access CTAs (`Kenali Profil`, `Lihat Showcase`) with tactile press feedback (`scale: 0.97`).
3. **About & Capabilities — Two Spacious Bento Blocks**:
   - **Blok A (Profile Board, 12-Col)**:
     - **Identity & Bio (`lg:col-span-5`, `#FFFFFF`)**: Profile card with outlined `PROFILE` pill and magnetic circular shortcut.
     - **Live WIB Telemetry (`lg:col-span-3`, Electric Cobalt `#2563EB`)**: Real-time WIB clock (`tabular-nums`), general base location (`Jakarta, Indonesia` + `Remote Friendly · ID`, with precise lat/long coordinates intentionally omitted for privacy), direct Contact shortcut button, and white Availability status pill.
     - **Dual-Layer Spotlight Portrait (`lg:col-span-4 lg:row-span-2`, Obsidian Anchor `#0B0F19`)**: Stage strictly locked to `aspect-[4/5]` ratio using `gsap.quickTo` lerped cursor spotlight (`clip-path: circle()`) + reveal toggle button.
     - **Core Stack Infinite Kinetic Marquee (`lg:col-span-8`, Soft Sky Blue `#DBEAFE`)**: Seamless horizontal GSAP loop showcasing `HTML5`, `Tailwind CSS`, `JavaScript`, `Vite`, `Supabase`, `Figma`, `Alight Motion`, and `CapCut` as flat editorial pills that pause smoothly (`timeScale: 0`) on hover/focus.
   - **Blok B (Journey & Directories, 12-Col)**:
     - **Education (`lg:col-span-5`, Soft Periwinkle `#E0E7FF`)**: Concise timeline cards.
     - **Experience (`lg:col-span-7`, `#FFFFFF`)**: Bounded scrollable timeline with fade masks (`data-lenis-prevent`) and mobile expand toggle.
     - **Full-Width 3D Archive Directories (`lg:col-span-12`, Soft Sky Blue `#DBEAFE`)**: 3 interactive folders (`Web & Apps` -> DB `project`, `Graphic Design` -> DB `certificate`, `Credentials` -> DB `award`) tilting front flaps in 3D (`rotateX(-38deg)`) and fanning 3 mini preview cards (`back.out(1.7)`) on hover/focus.
4. **Kinetic Bridge, 3-Tab Showcase & Visual Snapshots (Polaroid Scatter)**:
   - Scroll-scrubbed `PORTFOLIO` kinetic typography sweep + counter-scrolling discipline strip (`scrub: 1`).
   - **3-Tab Showcase (`Web & Apps`, `Graphic Design`, `Credentials`)**: Display labels mapped to unchanged backend enum values (`project`, `certificate`, `award`), locked strictly to 1 horizontal row (`flex-nowrap`, `whitespace-nowrap`) with exact active-button bounding measurement on sliding `#showcase-tab-pill` (`back.out(1.4)`), tag filters with staggered card pop-in (`power3.out`), hover thumbnail zoom, and spring-animated Detail Modal (`safeUrl`, focus trap, `Escape`, `Lenis` pause/resume).
   - **Visual Snapshots (Exploding Photo Stack / Polaroid Scatter)** inside a Soft Periwinkle (`#E0E7FF`) Bento frame showcasing finished visual excerpts, UI details, and creative exploration snapshots: desktop center-stack-to-scatter explosion (`ScrollTrigger`, `back.out(1.4)`), hover card straightening & lift (`rotation: 0, scale: 1.07`), toggle button, tablet 3x2 grid, mobile snap-deck, and spring Lightbox.
5. **Bright Editorial Contact, 3D Find Me ID Badge & Live Guestbook**:
   - **Left Column**: Direct Contact Form (`Crisp White #FFFFFF`) saving to `contact_messages` (or browser preview storage) + **Find Me** card (`Soft Sky Blue #DBEAFE`) featuring single-line `ID · JKT` badge (`whitespace-nowrap shrink-0`), 3D perspective lanyard tilt (`gsap.quickTo` on `rotationX`/`rotationY`), and radial glare highlight.
   - **Right Column**: XSS-safe Live Guestbook (`Crisp White #FFFFFF`) rendering comments strictly via `textContent` with slide-down + pop-in animation on new submission.

## 3. Design System — "Bright Editorial Cyber-Tech Bento (Blue Edition)"

### Motion Engine Stack
- **GSAP + ScrollTrigger & Lenis**: Unified desktop smooth wheel scrolling (`Lenis` synced to `gsap.ticker`, auto-disabled under `prefers-reduced-motion: reduce` and `< 1024px`), `ScrollTrigger.batch` kinetic card reveals, `gsap.quickTo` inertia cursor effects, and `gsap.matchMedia()` breakpoint/reduced-motion isolation in `src/lib/motion-engine.js`.

### Surface Modes & Dials
- **Public Portfolio (`/`)**: Surface Mode = `Experience` (Bright Editorial Canvas + Color-Blocked Blue Bento) | Variance: `8/10` | Motion: `8/10` | Density: `5/10`.
- **Admin CMS (`/admin`)**: Surface Mode = `Bright Bento Studio CMS` (Aligned Bright Editorial Canvas `#F4F6FA`, Crisp White Bento `#FFFFFF`, Cobalt Blue `#2563EB`, Sky `#DBEAFE`, Periwinkle `#E0E7FF`, `#0F172A` precision borders) | Variance: `4/10` | Motion: `4/10` | Density: `6/10`.

### Semantic CSS Tokens (`:root`)

    :root {
      /* Legacy Dark Surface Tokens (Retained for Obsidian Hero / Spotlight Accents) */
      --bg-dark-canvas: #07090E;
      --bg-dark-bento: #0E121B;
      --bg-dark-elevated: #151B28;
      --border-dark: rgba(148, 163, 184, 0.16);
      --border-dark-control: #64748B;
      --border-dark-hover: rgba(59, 130, 246, 0.55);
      --text-dark-primary: #F8FAFC;
      --text-dark-secondary: #94A3B8;
      --text-dark-muted: #7B8CA4;

      /* Bright Editorial Cyber-Tech Bento (Blue Edition — Shared by `/` and `/admin`) */
      --bg-canvas: #F4F6FA;
      --bg-card-white: #FFFFFF;
      --bg-card-sky: #DBEAFE;
      --bg-card-periwinkle: #E0E7FF;
      --bg-card-cobalt: #2563EB;
      --bg-card-obsidian: #0B0F19;
      --text-ink: #0B0F19;
      --text-ink-muted: #475569;
      --text-ink-pastel: #334155;
      --border-ink: #0F172A;
      --border-subtle: #CBD5E1;

      /* Brand Accent : Signal Cobalt */
      --accent-primary: #2563EB;
      --accent-fill-hover: #1D4ED8;
      --accent-hover: #3B82F6;
      --accent-signal: #60A5FA;
      --accent-tint: rgba(37, 99, 235, 0.12);

      /* Status */
      --status-live: #10B981;
      --status-live-ink: #065F46;
      --status-danger: #EF4444;
      --status-danger-ink: #B91C1C;

      /* Motion & Radii */
      --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
      --radius-bento: 26px;
      --radius-inner: 14px;
    }

- **WCAG AA Accent Contrast Rules (Verified)**:
  - Canvas `#F4F6FA` & Crisp White `#FFFFFF`: primary ink `#0B0F19` (`17.70:1` / `19.15:1`), muted `#475569` (`7.00:1` / `7.58:1`), Cobalt text `#1D4ED8` (`6.19:1` / `6.70:1`), success `#065F46` (`7.68:1`), error `#B91C1C` (`6.47:1`).
  - Pastel Sky Blue `#DBEAFE` & Periwinkle `#E0E7FF`: ink `#0B0F19` (`>= 15.54:1`), muted `#334155` (`>= 8.40:1`), Cobalt text `#1D4ED8` (`>= 5.44:1`), success `#065F46` (`6.30:1` on Sky), error `#B91C1C` (`5.25:1`).
  - Electric Cobalt `#2563EB` tile: ALL direct text uses pure white `#FFFFFF` (`5.17:1`, or `6.70:1` on hover `#1D4ED8`). Status indicator inside Cobalt tiles sits on a `#FFFFFF` pill with `#0B0F19` text (`19.15:1`).
  - Obsidian Anchor `#0B0F19` tiles (max 2): `#F8FAFC` / `#FFFFFF` (`>= 18.30:1`), `#CBD5E1` (`12.90:1`), `#60A5FA` (`7.53:1`).
  - `/admin` Bright Bento Studio CMS shares the verified Bright Editorial token system (`>= 5.17:1` across all interactive controls, pills, switches, and alerts).

### Typography
- **Display / Headings**: `Space Grotesk` (700, tight tracking `-0.03em`)
- **Body / UI**: `Poppins` (400, 500, 600; body `16px`, line-height `1.6`)
- **Telemetry / Code / Counters**: `JetBrains Mono` (400, 500; `font-variant-numeric: tabular-nums`)

## 4. Admin CMS Specification (`/admin` — "Bright Bento Studio CMS")
Accessible directly via `/admin` (separate Vite entry point `admin.html`) or hidden public shortcuts (`5x` rapid click on the footer year `2026` or `Ctrl + Shift + A` on desktop), with no visible `/admin` link on the public UI (footer right slot holds a `Kembali ke Atas` smooth-scroll pill to `#home`).
- **Shell & Navigation**: Clean sticky editorial header (Supabase live connection dot, admin email badge, `Lihat Web Publik` external link, `Keluar`), monochrome inline SVG navigation rail with live badge counters per module, floating toast notifications, and reusable GPU-composited Slide-Over Drawer (`Escape`/backdrop/focus-trap).
- **Auth Gate (`src/admin/login-guard.js` + `admin-main.js`)**: Centered Bright Bento login card on `#F4F6FA` canvas using Supabase Email/Password auth (public sign-ups disabled in Supabase dashboard) protected by client-side **Anti-Enumeration & Progressive Login Lockout**:
  - Any Supabase auth failure resolves with a single generic alert (`"Email atau password tidak sesuai."`), `~400ms` response floor, and zero attempt counters or permanent-lock warnings.
  - Consecutive failures persist across `localStorage` + `IndexedDB` mirror sync with progressive cooldowns (3x: 1m, 4x: 3m, 5x: 1h, 6x: 2h, 7x: 4h, 8x: 8h, 9x: 12h, 10x: permanent lock), live `JetBrains Mono` `tabular-nums` countdown with auto-unlock on expiry without refresh, automatic 24-hour reset when `< 10` failures, and full state cleanup on successful login; workspace stays strictly hidden & unmounted until authenticated.
- **Studio Controls**: Drag-and-drop Visual Media Dropzones (with live preview, replace/remove, collapsible manual URL fallback), tactile Toggle Switches (`role="switch"`), Segmented Pill Controls, and Sticky Save Bar.
- **Modules**:
  1. **Profil & Hero (Split Studio + Live Preview)**: Left column Bento sub-cards (`Identitas & Bio`, `Media & Portraits` 3-dropzone grid, `Tautan Sosial`) paired with a sticky right-column Real-Time Live Mini-Preview card and Sticky Save Bar.
  2. **Karya & Showcase (Content-First Grid + Slide-Over Drawer)**: Segmented category tabs, quick search, `+ Tambah Karya`, Visual Card Grid with inline quick `Tayang`/`Unggulan` toggles, and Slide-Over Drawer for Create/Edit.
  3. **Riwayat (Visual Timeline Feed + Slide-Over Drawer)**: Segmented `Semua`/`Experience`/`Education` switcher, crisp visual timeline cards (monospace period left, details right), and Slide-Over Drawer for Create/Edit.
  4. **Galeri Polaroid (Visual Photo Grid + Rotation Slider)**: Periwinkle studio board showing rotated mini Polaroid cards (`rotation_deg`) straightening on hover, plus Slide-Over Drawer with interactive `-25°..+25°` range slider and live tilt preview.
  5. **Buku Tamu & Pesan Masuk (Modern Inbox UI)**: Split segmented tabs for Guestbook comments (author initials avatar, instant `Tampil di Publik` toggle, `textContent` XSS safety) and Contact Inbox (Cobalt unread dot, `Balas Email`, `Tandai Dibaca`, delete confirmation).

## 5. Supabase Database Schema & Security
Run via SQL migration in `/supabase/schema.sql`:
- **`site_profile`**: `id` (int PK default 1, `CHECK (id = 1)` singleton), `full_name`, `display_name`, `handle`, `tagline`, `bio`, `location_label`, `coordinates_label`, `status_text`, `is_available` (bool), `hero_cutout_url`, `avatar_normal_url`, `avatar_alter_url`, `socials` (jsonb array check), `updated_at` (`BEFORE UPDATE` trigger)
- **`showcase_items`**: `id` (uuid PK), `category` (text check in `'project'`, `'certificate'`, `'award'` — displayed in UI as `Web & Apps`, `Graphic Design`, `Credentials`), `title`, `subtitle`, `description`, `tech_tags` (text[]), `thumbnail_url`, `live_url`, `repo_url`, `date_label`, `is_featured` (bool), `is_published` (bool default true), `sort_order` (int default 0), `created_at`
- **`timeline_entries`**: `id` (uuid PK), `type` (text check in `'education'`, `'experience'`), `organization`, `role`, `period`, `description`, `sort_order` (int default 0), `created_at`
- **`polaroid_photos`**: `id` (uuid PK), `image_url`, `caption`, `rotation_deg` (int check `-25..25`), `sort_order` (int default 0), `created_at`
- **`guestbook_comments`**: `id` (uuid PK), `author_name` (text not null, trimmed 2..60), `author_role` (text, trimmed <= 40), `message` (text not null, trimmed 3..500), `is_visible` (bool default true), `created_at` (timestamptz default now())
- **`contact_messages`**: `id` (uuid PK), `sender_name` (trimmed 2..80), `sender_email` (regex format check), `message` (trimmed 5..2000), `is_read` (bool default false), `created_at` (timestamptz default now())
- **Storage Bucket**: `portfolio-media` (public read, 5MB limit, raster MIME whitelist `image/jpeg`, `image/png`, `image/webp`, `image/avif` excluding SVG to prevent stored XSS, admin-only insert/update/delete).
- **Row Level Security (RLS)**:
  - Public `SELECT` on `site_profile`, published `showcase_items`, `timeline_entries`, `polaroid_photos`, and visible `guestbook_comments`.
  - Public `INSERT` ONLY on `guestbook_comments` (`WITH CHECK (is_visible = true)`) and `contact_messages` (`WITH CHECK (is_read = false)`, no public `SELECT`).
  - Full `ALL` privileges strictly gated via `public.is_portfolio_admin()`: `auth.role() = 'authenticated' AND LOWER(COALESCE(auth.jwt() ->> 'email', '')) = LOWER('<ADMIN_EMAIL>')`.

## 6. Supabase Keep-Alive (Free Tier Anti-Pause)
Include `.github/workflows/supabase-keepalive.yml` running every 3 days via cron (`0 0 */3 * *`) to issue a lightweight read request to `site_profile` using GitHub Secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).

## 7. Build Milestones
- **Phase 0**: Reference video audit, architecture critique, & alignment sign-off (NO CODE YET).
- **Phase 1**: Project scaffolding (Vite + Tailwind + Multi-page), Design Tokens, SQL Schema, & Dark Section (Navbar + Mascot, 3-Layer Parallax Hero, Cyber-Tech Bento About Me with Cursor Spotlight & 3D Folders).
- **Phase 2**: Dark-to-Light Transition, 3-Tab Showcase Carousel + Detail Modal, Polaroid Scatter, Contact & Live Guestbook UI.
- **Phase 3**: Supabase integration, `/admin` CMS Dashboard (Auth + full CRUD + Storage upload + Moderation), Seed data, Keep-Alive workflow, & Responsive/Accessibility Audit.