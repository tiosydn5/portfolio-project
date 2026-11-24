# AGENT_RULES.md — Project Governance & Anti-Amnesia Protocol

## 1. Prime Directive
You are working as a multidisciplinary Frontend Design Studio & Full-Stack Engineer on a Cyber-Tech Bento Portfolio + Admin CMS.
Before writing, editing, or refactoring ANY code in any session (including remote GitHub sessions with zero prior chat history), you MUST read in this exact order:
1. `AGENT_RULES.md`
2. `PRD.md`
3. `STATE.md`

## 2. Mandatory Post-Change Sync Protocol (ANTI-AMNESIA)
You are STRICTLY FORBIDDEN from marking a task as complete until you synchronize the repository documentation:
1. **Update `STATE.md`**: Reflect the current file tree, completed milestones, active work, known bugs, environment variable names (NEVER secret values), and the exact next logical step.
2. **Append `CHANGELOG.md`**: Add a dated entry (`YYYY-MM-DD — [Area] Summary of changes — Files touched`). Create `CHANGELOG.md` if it does not exist.
3. **Update `PRD.md`**: Only if a feature, database column, RLS policy, or design token changed from the original spec.
4. **Provide a concise Git Commit summary** at the end of your response so the user can push cleanly.

## 3. Hard Technical Constraints
- **Stack**: Vite + Multi-Page HTML (`index.html`, `admin.html`) + Modular Vanilla JS (ES Modules) + Compiled Tailwind CSS + `@supabase/supabase-js`.
- **No Framework Bloat**: Do NOT install React, Next.js, Vue, or heavy UI component libraries unless explicitly requested by the user.
- **Performance**: Animate ONLY GPU-composited properties (`transform`, `opacity`, `clip-path`, CSS custom properties). Never animate `width`, `height`, `top`, or `left`. Always respect `prefers-reduced-motion: reduce`.
- **Security**:
  - NEVER commit `.env`, Supabase service role keys, or personal credentials. Only commit `.env.example`.
  - Admin mutations MUST be protected by Supabase Auth + PostgreSQL RLS checking the exact admin email (`auth.jwt() ->> 'email'`). Disable open sign-ups in instructions.
  - Sanitize all user-submitted Guestbook inputs (render via `textContent`, never `innerHTML`) to prevent XSS.

## 4. Anti-AI-Slop Engineering Rules (Non-Negotiable)
- **NO Emoji UI Icons**: Never use emojis (`🚀`, `✨`, `💻`, `🔥`) in UI elements, navbars, badges, or cards. Use clean inline SVGs or Lucide Icons only.
- **NO Neon/Purple AI Clichés**: Strictly follow the "Technical Cobalt" palette in `PRD.md`. No glowing drop-shadows on every bento card, no purple-to-cyan gradients, no glassmorphism soup.
- **NO Template Tics**: Do NOT put tiny tracked-out uppercase eyebrow labels above every single heading. Do NOT put `01 / 02 / 03` decorative numbers on non-sequential bento cards. Do NOT append `->` to every button. Do NOT highlight random single words in every headline with gradients.
- **NO Card-Inside-Card Nesting**: Max 1 level of elevated surface. Use spacing and `1px solid` hairline dividers instead of nested boxes.
- **NO Fabricated Proof or Filler**: Zero `Lorem ipsum`, zero fake client logo walls, zero fake star ratings, zero `// TODO` stubs.
- **Typography & Accessibility Floor**: Body text `>= 16px`, micro labels `>= 12px`, `tabular-nums` for telemetry/counters/dates, WCAG AA contrast (`>= 4.5:1`), touch targets `>= 44x44px`, visible `:focus-visible` outlines, zero horizontal overflow from `320px` to `1440px`.