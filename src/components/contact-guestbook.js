import { gsap, prefersReducedMotion } from '../lib/motion-engine.js';
import { createEl, createSvgIcon, safeUrl } from '../lib/sanitize.js';

const GUESTBOOK_STORAGE_KEY = 'portfolio_guestbook_v2';
const CONTACT_STORAGE_KEY = 'portfolio_contact_preview_v2';
const COOLDOWN_MS = 15000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readStorageArray(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [...fallback];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...fallback];
  } catch {
    return [...fallback];
  }
}

function writeStorageArray(key, list) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

function formatWibDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function socialIconFor(id) {
  if (id === 'github') {
    return createSvgIcon({
      className: 'w-5 h-5',
      shapes: [
        { tag: 'path', attrs: { d: 'M9 19c-4 1.2-4-2-6-2.5m12 4.5v-3.5c0-1 .3-1.8-.8-2.4 2.7-.3 5.5-1.3 5.5-5.8 0-1.3-.5-2.4-1.2-3.2.1-.3.5-1.6-.1-3.2 0 0-1-.3-3.3 1.2a11.3 11.3 0 0 0-6 0C6.8 2.6 5.8 2.9 5.8 2.9c-.6 1.6-.2 2.9-.1 3.2-.8.8-1.2 1.9-1.2 3.2 0 4.5 2.8 5.5 5.5 5.8-.4.4-.7 1-.7 1.9V21' } },
      ],
    });
  }
  if (id === 'linkedin') {
    return createSvgIcon({
      className: 'w-5 h-5',
      shapes: [
        { tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18', rx: '3' } },
        { tag: 'line', attrs: { x1: '8', y1: '11', x2: '8', y2: '16' } },
        { tag: 'circle', attrs: { cx: '8', cy: '8', r: '0.7' } },
        { tag: 'path', attrs: { d: 'M12 16v-5m0 1.5c0-1 .8-1.8 2-1.8s2 .8 2 2.2V16' } },
      ],
    });
  }
  if (id === 'instagram') {
    return createSvgIcon({
      className: 'w-5 h-5',
      shapes: [
        { tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18', rx: '5' } },
        { tag: 'circle', attrs: { cx: '12', cy: '12', r: '4' } },
        { tag: 'circle', attrs: { cx: '17.2', cy: '6.8', r: '0.7' } },
      ],
    });
  }
  return createSvgIcon({
    className: 'w-5 h-5',
    shapes: [
      { tag: 'rect', attrs: { x: '3', y: '5', width: '18', height: '14', rx: '2' } },
      { tag: 'polyline', attrs: { points: '3,7 12,13 21,7' } },
    ],
  });
}

function setFieldError(inputEl, errorEl, message) {
  if (inputEl) {
    if (message) inputEl.setAttribute('aria-invalid', 'true');
    else inputEl.removeAttribute('aria-invalid');
  }
  if (errorEl) {
    errorEl.textContent = message || '';
    errorEl.hidden = !message;
  }
}

function initFindMe3DTilt() {
  const card = document.getElementById('find-me-card');
  const glare = document.getElementById('find-me-glare');
  if (!card) return;

  const mm = gsap.matchMedia();

  mm.add(
    '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    () => {
      gsap.set(card, { transformPerspective: 900 });

      const rotXTo = gsap.quickTo(card, 'rotationX', {
        duration: 0.35,
        ease: 'power3.out',
      });
      const rotYTo = gsap.quickTo(card, 'rotationY', {
        duration: 0.35,
        ease: 'power3.out',
      });

      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const tiltY = (px - 0.5) * 10;
        const tiltX = -(py - 0.5) * 10;

        rotYTo(tiltY);
        rotXTo(tiltX);

        if (glare) {
          glare.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
          glare.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
          glare.style.opacity = '1';
        }
      };

      const onLeave = () => {
        if (glare) glare.style.opacity = '0';
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.55,
          ease: 'elastic.out(1, 0.5)',
          overwrite: 'auto',
        });
      };

      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);

      return () => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
        if (glare) glare.style.opacity = '0';
        gsap.set(card, { clearProps: 'transform' });
      };
    }
  );
}

export function initContactGuestbook({
  socials = [],
  initialComments = [],
  isLive = false,
  onSubmitContact = null,
  onSubmitGuestbook = null,
}) {
  const modeBadge = document.getElementById('guestbook-mode-badge');
  if (modeBadge) {
    modeBadge.textContent = isLive ? 'Live Guestbook' : 'Mode Pratinjau';
    modeBadge.className = isLive
      ? 'font-mono-tabular text-xs font-medium px-3 py-1 rounded-full bg-[#DBEAFE] border-[1.5px] border-[#0F172A] text-[#065F46]'
      : 'font-mono-tabular text-xs font-medium px-3 py-1 rounded-full bg-[#E0E7FF] border-[1.5px] border-[#0F172A] text-[#0B0F19]';
  }

  // ---------------------------------------------------------------------------
  // 1. Contact Form (Validation, Honeypot, Cooldown, Supabase / Browser Preview)
  // ---------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactMessage = document.getElementById('contact-message');
  const contactHoneypot = document.getElementById('contact-website');
  const contactNameErr = document.getElementById('contact-name-error');
  const contactEmailErr = document.getElementById('contact-email-error');
  const contactMessageErr = document.getElementById('contact-message-error');
  const contactStatus = document.getElementById('contact-status');
  const contactSubmitBtn = contactForm?.querySelector('button[type="submit"]');

  let lastContactSubmit = 0;

  if (contactForm && contactName && contactEmail && contactMessage) {
    for (const [el, err] of [
      [contactName, contactNameErr],
      [contactEmail, contactEmailErr],
      [contactMessage, contactMessageErr],
    ]) {
      el.addEventListener('input', () => setFieldError(el, err, ''));
    }

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (contactHoneypot && contactHoneypot.value.trim() !== '') {
        contactForm.reset();
        return;
      }

      const now = Date.now();
      if (now - lastContactSubmit < COOLDOWN_MS) {
        const waitSec = Math.ceil((COOLDOWN_MS - (now - lastContactSubmit)) / 1000);
        if (contactStatus) {
          contactStatus.textContent = `Tunggu ${waitSec} detik sebelum mengirim pesan berikutnya.`;
          contactStatus.className = 'text-sm font-medium text-[#B91C1C] pt-1';
        }
        return;
      }

      const nameVal = contactName.value.trim();
      const emailVal = contactEmail.value.trim();
      const msgVal = contactMessage.value.trim();

      let firstInvalid = null;

      if (nameVal.length < 2 || nameVal.length > 80) {
        setFieldError(contactName, contactNameErr, 'Nama wajib diisi (2 sampai 80 karakter).');
        firstInvalid = firstInvalid || contactName;
      } else {
        setFieldError(contactName, contactNameErr, '');
      }

      if (!EMAIL_REGEX.test(emailVal)) {
        setFieldError(
          contactEmail,
          contactEmailErr,
          'Masukkan alamat email yang valid (misalnya nama@domain.com).'
        );
        firstInvalid = firstInvalid || contactEmail;
      } else {
        setFieldError(contactEmail, contactEmailErr, '');
      }

      if (msgVal.length < 5 || msgVal.length > 2000) {
        setFieldError(
          contactMessage,
          contactMessageErr,
          'Pesan minimal 5 karakter dan maksimal 2000 karakter.'
        );
        firstInvalid = firstInvalid || contactMessage;
      } else {
        setFieldError(contactMessage, contactMessageErr, '');
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.textContent = 'Mengirim...';
      }

      try {
        if (isLive && typeof onSubmitContact === 'function') {
          await onSubmitContact({
            sender_name: nameVal,
            sender_email: emailVal,
            message: msgVal,
          });
          if (contactStatus) {
            contactStatus.textContent = 'Pesan berhasil dikirim.';
            contactStatus.className = 'text-sm font-medium text-[#065F46] pt-1';
          }
        } else {
          const existing = readStorageArray(CONTACT_STORAGE_KEY, []);
          existing.unshift({
            id: `msg-${now}`,
            sender_name: nameVal,
            sender_email: emailVal,
            message: msgVal,
            created_at: new Date(now).toISOString(),
          });
          writeStorageArray(CONTACT_STORAGE_KEY, existing.slice(0, 20));
          if (contactStatus) {
            contactStatus.textContent = 'Pesan tersimpan di mode pratinjau lokal browser ini.';
            contactStatus.className = 'text-sm font-medium text-[#065F46] pt-1';
          }
        }

        lastContactSubmit = Date.now();
        contactForm.reset();
      } catch (err) {
        if (contactStatus) {
          contactStatus.textContent = err?.message || 'Gagal mengirim pesan. Coba lagi.';
          contactStatus.className = 'text-sm font-medium text-[#B91C1C] pt-1';
        }
      } finally {
        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.textContent = 'Kirim Pesan';
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Find Me Card + 3D Lanyard Perspective Tilt
  // ---------------------------------------------------------------------------
  initFindMe3DTilt();

  const findMeList = document.getElementById('find-me-list');
  const copyFeedback = document.getElementById('find-me-feedback');

  if (findMeList) {
    findMeList.replaceChildren();
    for (const item of socials) {
      const safeHref = safeUrl(item.url);

      const row = createEl('li', {
        className:
          'py-3 border-b border-[rgba(15,23,42,0.14)] last:border-b-0 flex items-center justify-between gap-3',
      });

      const left = createEl(
        'div',
        { className: 'flex items-center gap-3 min-w-0' },
        createEl(
          'span',
          {
            className:
              'w-10 h-10 rounded-xl bg-[#FFFFFF] border-[1.5px] border-[#0F172A] flex items-center justify-center text-[#1D4ED8] shrink-0',
          },
          socialIconFor(item.id)
        ),
        createEl(
          'div',
          { className: 'min-w-0' },
          createEl('p', {
            className: 'text-sm font-semibold text-[#0B0F19]',
            text: item.label,
          }),
          createEl('p', {
            className: 'font-mono-tabular text-xs text-[#334155] truncate',
            text: item.handle,
          })
        )
      );

      let actionEl = null;
      if (safeHref) {
        actionEl = createEl('a', {
          className: 'btn-editorial-outline text-xs px-3.5 shrink-0',
          text: 'Buka',
          attrs: {
            href: safeHref,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        });
      } else if (item.scrollTarget) {
        actionEl = createEl('a', {
          className: 'btn-editorial-outline text-xs px-3.5 shrink-0',
          text: 'Isi Form',
          attrs: { href: item.scrollTarget },
        });
      } else if (item.copyValue) {
        actionEl = createEl('button', {
          className: 'btn-editorial-outline text-xs px-3.5 shrink-0',
          text: 'Salin',
          attrs: {
            type: 'button',
            'aria-label': `Salin ${item.label} (${item.copyValue})`,
          },
        });

        actionEl.addEventListener('click', async () => {
          try {
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(item.copyValue);
            }
            actionEl.textContent = 'Disalin';
            if (copyFeedback) {
              copyFeedback.textContent = `${item.label}: ${item.copyValue} disalin ke clipboard.`;
            }
            window.setTimeout(() => {
              actionEl.textContent = 'Salin';
            }, 2000);
          } catch {
            if (copyFeedback) {
              copyFeedback.textContent = `Salin manual ${item.label}: ${item.copyValue}`;
            }
          }
        });
      }

      if (actionEl) {
        row.append(left, actionEl);
      } else {
        row.append(left);
      }
      findMeList.appendChild(row);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Live Guestbook (XSS-Safe textContent + Pop-In Animation on New Submit)
  // ---------------------------------------------------------------------------
  const gbForm = document.getElementById('guestbook-form');
  const gbName = document.getElementById('guestbook-name');
  const gbRole = document.getElementById('guestbook-role');
  const gbMsg = document.getElementById('guestbook-message');
  const gbHoneypot = document.getElementById('guestbook-company');
  const gbNameErr = document.getElementById('guestbook-name-error');
  const gbRoleErr = document.getElementById('guestbook-role-error');
  const gbMsgErr = document.getElementById('guestbook-message-error');
  const gbCharCount = document.getElementById('guestbook-char-count');
  const gbStatus = document.getElementById('guestbook-status');
  const gbCountEl = document.getElementById('guestbook-count');
  const gbListEl = document.getElementById('guestbook-list');
  const gbSubmitBtn = gbForm?.querySelector('button[type="submit"]');

  let comments = isLive
    ? [...initialComments]
    : readStorageArray(GUESTBOOK_STORAGE_KEY, initialComments);
  let lastGuestbookSubmit = 0;

  function renderComments(animateNewest = false) {
    if (gbCountEl) {
      gbCountEl.textContent = `Komentar (${comments.length})`;
    }
    if (!gbListEl) return;

    gbListEl.replaceChildren();

    if (comments.length === 0) {
      gbListEl.appendChild(
        createEl('li', {
          className: 'py-6 text-sm text-[#475569] text-center',
          text: 'Belum ada komentar. Jadilah pengunjung pertama yang menulis catatan.',
        })
      );
      return;
    }

    for (const comment of comments) {
      const row = createEl('li', {
        className: 'py-4 border-b border-[rgba(15,23,42,0.14)] last:border-b-0 space-y-1.5',
      });

      const header = createEl('div', {
        className: 'flex flex-wrap items-center justify-between gap-2',
      });

      const authorInfo = createEl(
        'div',
        { className: 'flex flex-wrap items-center gap-2 min-w-0' },
        createEl('span', {
          className: 'text-sm font-semibold text-[#0B0F19]',
          text: comment.author_name,
        }),
        comment.author_role
          ? createEl('span', {
              className:
                'font-mono-tabular text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#E0E7FF] border border-[rgba(15,23,42,0.35)] text-[#0B0F19]',
              text: comment.author_role,
            })
          : null
      );

      const timeEl = createEl('time', {
        className: 'font-mono-tabular text-xs text-[#475569] shrink-0',
        text: formatWibDate(comment.created_at),
        attrs: { datetime: comment.created_at || '' },
      });

      header.append(authorInfo, timeEl);

      // Strict textContent rendering prevents XSS payload execution
      const bodyEl = createEl('p', {
        className: 'text-sm text-[#334155] leading-relaxed break-words',
        text: comment.message,
      });

      row.append(header, bodyEl);
      gbListEl.appendChild(row);
    }

    if (animateNewest && gbListEl.firstElementChild && !prefersReducedMotion()) {
      gsap.fromTo(
        gbListEl.firstElementChild,
        { y: -22, scale: 0.95, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.46,
          ease: 'back.out(1.5)',
          overwrite: 'auto',
          clearProps: 'transform,opacity',
        }
      );
    }
  }

  if (gbMsg && gbCharCount) {
    const syncCharCount = () => {
      gbCharCount.textContent = `${gbMsg.value.length} / 500`;
    };
    gbMsg.addEventListener('input', syncCharCount);
    syncCharCount();
  }

  if (gbForm && gbName && gbRole && gbMsg) {
    for (const [el, err] of [
      [gbName, gbNameErr],
      [gbRole, gbRoleErr],
      [gbMsg, gbMsgErr],
    ]) {
      el.addEventListener('input', () => setFieldError(el, err, ''));
    }

    gbForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (gbHoneypot && gbHoneypot.value.trim() !== '') {
        gbForm.reset();
        return;
      }

      const now = Date.now();
      if (now - lastGuestbookSubmit < COOLDOWN_MS) {
        const waitSec = Math.ceil((COOLDOWN_MS - (now - lastGuestbookSubmit)) / 1000);
        if (gbStatus) {
          gbStatus.textContent = `Tunggu ${waitSec} detik sebelum mengirim komentar lagi.`;
          gbStatus.className = 'text-sm font-medium text-[#B91C1C] pt-1';
        }
        return;
      }

      const authorName = gbName.value.trim();
      const authorRole = gbRole.value.trim();
      const msg = gbMsg.value.trim();

      let firstInvalid = null;

      if (authorName.length < 2 || authorName.length > 60) {
        setFieldError(gbName, gbNameErr, 'Nama wajib diisi (2 sampai 60 karakter).');
        firstInvalid = firstInvalid || gbName;
      } else {
        setFieldError(gbName, gbNameErr, '');
      }

      if (authorRole.length > 40) {
        setFieldError(gbRole, gbRoleErr, 'Role atau tag maksimal 40 karakter.');
        firstInvalid = firstInvalid || gbRole;
      } else {
        setFieldError(gbRole, gbRoleErr, '');
      }

      if (msg.length < 3 || msg.length > 500) {
        setFieldError(gbMsg, gbMsgErr, 'Komentar minimal 3 karakter dan maksimal 500 karakter.');
        firstInvalid = firstInvalid || gbMsg;
      } else {
        setFieldError(gbMsg, gbMsgErr, '');
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (gbSubmitBtn) {
        gbSubmitBtn.disabled = true;
        gbSubmitBtn.textContent = 'Mengirim...';
      }

      try {
        if (isLive && typeof onSubmitGuestbook === 'function') {
          const inserted = await onSubmitGuestbook({
            author_name: authorName,
            author_role: authorRole || 'Visitor',
            message: msg,
          });
          comments.unshift(inserted);
          if (gbStatus) {
            gbStatus.textContent = 'Komentar berhasil diterbitkan ke guestbook.';
            gbStatus.className = 'text-sm font-medium text-[#065F46] pt-1';
          }
        } else {
          const entry = {
            id: `gb-${now}`,
            author_name: authorName,
            author_role: authorRole || 'Visitor',
            message: msg,
            created_at: new Date(now).toISOString(),
          };
          comments.unshift(entry);
          writeStorageArray(GUESTBOOK_STORAGE_KEY, comments);
          if (gbStatus) {
            gbStatus.textContent = 'Komentar berhasil ditambahkan ke buku tamu.';
            gbStatus.className = 'text-sm font-medium text-[#065F46] pt-1';
          }
        }

        lastGuestbookSubmit = Date.now();
        gbForm.reset();
        if (gbCharCount) gbCharCount.textContent = '0 / 500';
        renderComments(true);
      } catch (err) {
        if (gbStatus) {
          gbStatus.textContent = err?.message || 'Gagal mengirim komentar. Coba lagi.';
          gbStatus.className = 'text-sm font-medium text-[#B91C1C] pt-1';
        }
      } finally {
        if (gbSubmitBtn) {
          gbSubmitBtn.disabled = false;
          gbSubmitBtn.textContent = 'Kirim Komentar';
        }
      }
    });
  }

  renderComments(false);
}
