import '../styles/admin.css';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import { createSvgIcon } from '../lib/sanitize.js';
import { clearToast, closeSlideDrawer, showToast } from './admin-ui.js';
import {
  AUTH_RESPONSE_DELAY_MS,
  GENERIC_AUTH_ERROR,
  createLoginGuard,
  formatLockCountdown,
  waitMs,
} from './login-guard.js';
import { mountProfileEditor } from './profile-editor.js';
import { mountShowcaseCrud } from './showcase-crud.js';
import { mountTimelineCrud } from './timeline-crud.js';
import { mountPolaroidCrud } from './polaroid-crud.js';
import { mountModeration } from './moderation.js';

const MODULE_LOADERS = {
  profile: mountProfileEditor,
  showcase: mountShowcaseCrud,
  timeline: mountTimelineCrud,
  polaroid: mountPolaroidCrud,
  moderation: mountModeration,
};

function initAdminCms() {
  const headerDot = document.getElementById('admin-header-dot');
  const headerStatusText = document.getElementById('admin-header-status-text');

  const statusEl = document.getElementById('admin-supabase-status');
  const statusHintEl = document.getElementById('admin-supabase-hint');
  const statusDot = document.getElementById('admin-supabase-dot');
  const envGuideEl = document.getElementById('admin-env-guide');

  const authGate = document.getElementById('admin-auth-gate');
  const workspace = document.getElementById('admin-workspace');
  const loginForm = document.getElementById('admin-login-form');
  const loginEmailInput = document.getElementById('admin-login-email');
  const loginPasswordInput = document.getElementById('admin-login-password');
  const loginErrorEl = document.getElementById('admin-login-error');
  const loginSubmitBtn = document.getElementById('admin-login-submit');
  const lockBoxEl = document.getElementById('admin-login-lock-box');
  const lockIconEl = document.getElementById('admin-login-lock-icon');
  const lockTitleEl = document.getElementById('admin-login-lock-title');
  const lockDescEl = document.getElementById('admin-login-lock-desc');
  const lockTimerRowEl = document.getElementById('admin-login-timer-row');
  const lockCountdownEl = document.getElementById('admin-login-countdown');

  const userEmailBadge = document.getElementById('admin-user-email');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const moduleMount = document.getElementById('admin-module-mount');
  const navButtons = Array.from(document.querySelectorAll('[data-admin-module]'));

  let activeModule = 'profile';
  let currentUserId = null;
  let countdownTimerId = 0;
  let wasLocked = false;
  let isSubmitting = false;

  const loginGuard = createLoginGuard();

  function setLoginError(msg) {
    if (!loginErrorEl) return;
    loginErrorEl.textContent = msg || '';
    loginErrorEl.hidden = !msg;
  }

  function stopCountdownTimer() {
    if (!countdownTimerId) return;
    window.clearInterval(countdownTimerId);
    countdownTimerId = 0;
  }

  function setLoginControlsDisabled(disabled, submitLabel) {
    if (loginEmailInput) loginEmailInput.disabled = disabled;
    if (loginPasswordInput) loginPasswordInput.disabled = disabled;
    if (loginSubmitBtn) {
      loginSubmitBtn.disabled = disabled;
      if (submitLabel) loginSubmitBtn.textContent = submitLabel;
    }
  }

  function renderLockStatus() {
    const guardStatus = loginGuard.getStatus();

    if (guardStatus.permanentLock) {
      stopCountdownTimer();
      wasLocked = true;
      setLoginControlsDisabled(true, 'Akses Terkunci');

      if (lockBoxEl) {
        lockBoxEl.className = 'studio-lock-box is-permanent';
        lockBoxEl.hidden = false;
      }
      if (lockIconEl) {
        lockIconEl.replaceChildren(
          createSvgIcon({
            viewBox: '0 0 24 24',
            className: 'w-4 h-4',
            stroke: 'currentColor',
            strokeWidth: '2',
            shapes: [
              { tag: 'rect', attrs: { x: '3', y: '11', width: '18', height: '11', rx: '2' } },
              { tag: 'path', attrs: { d: 'M7 11V7a5 5 0 0 1 10 0v4' } },
            ],
          })
        );
      }
      if (lockTitleEl) lockTitleEl.textContent = 'Akses Studio Terkunci';
      if (lockDescEl) {
        lockDescEl.textContent =
          'Akses masuk dinonaktifkan demi menjaga keamanan studio.';
      }
      if (lockTimerRowEl) lockTimerRowEl.hidden = true;
      return guardStatus;
    }

    if (guardStatus.isCooldown) {
      wasLocked = true;
      setLoginControlsDisabled(true, 'Menunggu Akses Dibuka');

      if (lockBoxEl) {
        lockBoxEl.className = 'studio-lock-box is-cooldown';
        lockBoxEl.hidden = false;
      }
      if (lockIconEl) {
        lockIconEl.replaceChildren(
          createSvgIcon({
            viewBox: '0 0 24 24',
            className: 'w-4 h-4',
            stroke: 'currentColor',
            strokeWidth: '2',
            shapes: [
              { tag: 'circle', attrs: { cx: '12', cy: '12', r: '9' } },
              { tag: 'polyline', attrs: { points: '12 7 12 12 15 14' } },
            ],
          })
        );
      }
      if (lockTitleEl) lockTitleEl.textContent = 'Akses Masuk Ditangguhkan';
      if (lockDescEl) {
        lockDescEl.textContent =
          'Tunggu hingga penghitung waktu selesai sebelum mencoba masuk kembali.';
      }
      if (lockTimerRowEl) lockTimerRowEl.hidden = false;
      if (lockCountdownEl) {
        lockCountdownEl.textContent = formatLockCountdown(
          guardStatus.remainingMs,
          guardStatus.attempts >= 5
        );
      }

      if (!countdownTimerId) {
        countdownTimerId = window.setInterval(() => {
          const nextStatus = loginGuard.getStatus();
          if (!nextStatus.isCooldown && !nextStatus.permanentLock) {
            renderLockStatus();
            return;
          }
          if (lockCountdownEl && nextStatus.isCooldown) {
            lockCountdownEl.textContent = formatLockCountdown(
              nextStatus.remainingMs,
              nextStatus.attempts >= 5
            );
          }
        }, 250);
      }
      return guardStatus;
    }

    stopCountdownTimer();
    if (lockBoxEl) lockBoxEl.hidden = true;
    if (lockTimerRowEl) lockTimerRowEl.hidden = true;

    if (!isSubmitting) {
      setLoginControlsDisabled(false, 'Masuk ke Studio');
    }

    if (wasLocked) {
      wasLocked = false;
      setLoginError('');
    }
    return guardStatus;
  }

  function updateNavBadge(key, value, highlight = false) {
    const badge = document.querySelector(`[data-nav-count="${key}"]`);
    if (!badge) return;
    badge.textContent = String(value);
    badge.classList.toggle('has-unread', Boolean(highlight));
  }

  async function refreshNavCounts() {
    if (!supabase || !currentUserId) return;

    const [showcaseRes, timelineRes, polaroidRes, guestbookRes, unreadInboxRes, totalInboxRes] =
      await Promise.allSettled([
        supabase.from('showcase_items').select('id', { count: 'exact', head: true }),
        supabase.from('timeline_entries').select('id', { count: 'exact', head: true }),
        supabase.from('polaroid_photos').select('id', { count: 'exact', head: true }),
        supabase.from('guestbook_comments').select('id', { count: 'exact', head: true }),
        supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
      ]);

    if (showcaseRes.status === 'fulfilled' && !showcaseRes.value.error) {
      updateNavBadge('showcase', showcaseRes.value.count ?? 0);
    }
    if (timelineRes.status === 'fulfilled' && !timelineRes.value.error) {
      updateNavBadge('timeline', timelineRes.value.count ?? 0);
    }
    if (polaroidRes.status === 'fulfilled' && !polaroidRes.value.error) {
      updateNavBadge('polaroid', polaroidRes.value.count ?? 0);
    }

    const unreadCount =
      unreadInboxRes.status === 'fulfilled' && !unreadInboxRes.value.error
        ? unreadInboxRes.value.count ?? 0
        : 0;
    const gbCount =
      guestbookRes.status === 'fulfilled' && !guestbookRes.value.error
        ? guestbookRes.value.count ?? 0
        : 0;
    const totalInbox =
      totalInboxRes.status === 'fulfilled' && !totalInboxRes.value.error
        ? totalInboxRes.value.count ?? 0
        : 0;

    if (unreadCount > 0) {
      updateNavBadge('moderation', `${unreadCount} baru`, true);
    } else {
      updateNavBadge('moderation', gbCount + totalInbox, false);
    }
  }

  async function renderModule(key) {
    if (!moduleMount) return;
    closeSlideDrawer();
    const loader = MODULE_LOADERS[key] || MODULE_LOADERS.profile;
    activeModule = key;
    clearToast();

    for (const btn of navButtons) {
      const isCurrent = btn.dataset.adminModule === key;
      if (isCurrent) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    }

    await loader(moduleMount, { onDataChange: refreshNavCounts });
  }

  function applySessionState(session) {
    const user = session?.user || null;
    const isAuthenticated = Boolean(user);

    if (authGate) authGate.hidden = isAuthenticated;
    if (workspace) workspace.hidden = !isAuthenticated;
    if (logoutBtn) logoutBtn.hidden = !isAuthenticated;

    if (userEmailBadge) {
      userEmailBadge.hidden = !isAuthenticated;
      userEmailBadge.textContent = user?.email || '';
    }

    if (!isAuthenticated) {
      closeSlideDrawer();
      currentUserId = null;
      if (moduleMount) moduleMount.replaceChildren();
      renderLockStatus();
      return;
    }

    stopCountdownTimer();
    if (currentUserId !== user.id) {
      currentUserId = user.id;
      refreshNavCounts();
      renderModule(activeModule);
    }
  }

  // Always start locked & unmounted until session is proven
  applySessionState(null);

  if (!isSupabaseConfigured || !supabase) {
    stopCountdownTimer();
    if (headerDot) {
      headerDot.classList.remove('bg-[#10B981]');
      headerDot.classList.add('bg-[#2563EB]');
    }
    if (headerStatusText) {
      headerStatusText.textContent = 'Belum Terhubung';
    }
    if (statusDot) {
      statusDot.classList.remove('bg-[#10B981]');
      statusDot.classList.add('bg-[#2563EB]');
    }
    if (statusEl) {
      statusEl.textContent = 'Konfigurasi Supabase belum ditemukan';
    }
    if (statusHintEl) {
      statusHintEl.textContent =
        'Lengkapi file .env dengan URL dan Public Key Supabase untuk mengaktifkan studio.';
    }
    if (envGuideEl) envGuideEl.hidden = false;
    setLoginControlsDisabled(true, 'Lengkapi Konfigurasi .env');
    if (lockBoxEl) lockBoxEl.hidden = true;
    return;
  }

  if (headerDot) {
    headerDot.classList.remove('bg-[#2563EB]');
    headerDot.classList.add('bg-[#10B981]');
  }
  if (headerStatusText) {
    headerStatusText.textContent = 'Terhubung';
  }
  if (statusDot) {
    statusDot.classList.remove('bg-[#2563EB]');
    statusDot.classList.add('bg-[#10B981]');
  }
  if (statusEl) {
    statusEl.textContent = 'Database terhubung dan siap digunakan';
  }
  if (statusHintEl) {
    statusHintEl.textContent = 'Masuk menggunakan email dan kata sandi admin terdaftar.';
  }

  // Reconcile localStorage + IndexedDB guard state immediately on boot
  loginGuard.sync().then(() => {
    if (!currentUserId) renderLockStatus();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !currentUserId) {
      renderLockStatus();
    }
  });

  for (const btn of navButtons) {
    btn.addEventListener('click', () => {
      const target = btn.dataset.adminModule;
      if (target) renderModule(target);
    });
  }

  if (loginForm && loginEmailInput && loginPasswordInput) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (isSubmitting) return;
      setLoginError('');

      await loginGuard.sync();
      const preCheck = renderLockStatus();
      if (preCheck.isLocked) {
        return;
      }

      const email = loginEmailInput.value.trim();
      const password = loginPasswordInput.value;

      if (!email || !password) {
        setLoginError('Email dan kata sandi wajib diisi.');
        return;
      }

      isSubmitting = true;
      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Memverifikasi...';
      }

      const attemptStartedAt = Date.now();

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data?.session) {
          const elapsed = Date.now() - attemptStartedAt;
          if (elapsed < AUTH_RESPONSE_DELAY_MS) {
            await waitMs(AUTH_RESPONSE_DELAY_MS - elapsed);
          }
          await loginGuard.recordFailure();
          setLoginError(GENERIC_AUTH_ERROR);
          return;
        }

        await loginGuard.reset();
        setLoginError('');
        loginPasswordInput.value = '';
        applySessionState(data.session);
      } catch {
        const elapsed = Date.now() - attemptStartedAt;
        if (elapsed < AUTH_RESPONSE_DELAY_MS) {
          await waitMs(AUTH_RESPONSE_DELAY_MS - elapsed);
        }
        await loginGuard.recordFailure();
        setLoginError(GENERIC_AUTH_ERROR);
      } finally {
        isSubmitting = false;
        if (!currentUserId) {
          renderLockStatus();
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      try {
        await supabase.auth.signOut();
        applySessionState(null);
      } catch (err) {
        showToast(err?.message || 'Gagal keluar dari sesi.', 'error');
      } finally {
        logoutBtn.disabled = false;
      }
    });
  }

  supabase.auth.getSession().then(({ data }) => {
    applySessionState(data?.session || null);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    applySessionState(session);
  });
}

initAdminCms();
