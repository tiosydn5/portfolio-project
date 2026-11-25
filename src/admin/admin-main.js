import '../styles/admin.css';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import { clearToast, closeSlideDrawer, showToast } from './admin-ui.js';
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

  const userEmailBadge = document.getElementById('admin-user-email');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const moduleMount = document.getElementById('admin-module-mount');
  const navButtons = Array.from(document.querySelectorAll('[data-admin-module]'));

  let activeModule = 'profile';
  let currentUserId = null;

  function setLoginError(msg) {
    if (!loginErrorEl) return;
    loginErrorEl.textContent = msg || '';
    loginErrorEl.hidden = !msg;
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
      return;
    }

    if (currentUserId !== user.id) {
      currentUserId = user.id;
      refreshNavCounts();
      renderModule(activeModule);
    }
  }

  // Always start locked & unmounted until session is proven
  applySessionState(null);

  if (!isSupabaseConfigured || !supabase) {
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
    if (loginEmailInput) loginEmailInput.disabled = true;
    if (loginPasswordInput) loginPasswordInput.disabled = true;
    if (loginSubmitBtn) {
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.textContent = 'Lengkapi Konfigurasi .env';
    }
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

  for (const btn of navButtons) {
    btn.addEventListener('click', () => {
      const target = btn.dataset.adminModule;
      if (target) renderModule(target);
    });
  }

  if (loginForm && loginEmailInput && loginPasswordInput) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setLoginError('');

      const email = loginEmailInput.value.trim();
      const password = loginPasswordInput.value;

      if (!email || !password) {
        setLoginError('Email dan kata sandi wajib diisi.');
        return;
      }

      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Memverifikasi...';
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setLoginError(error.message || 'Gagal masuk. Periksa kembali email dan kata sandi.');
          return;
        }
        loginPasswordInput.value = '';
        applySessionState(data.session);
      } catch (err) {
        setLoginError(err?.message || 'Terjadi gangguan koneksi saat mencoba masuk.');
      } finally {
        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.textContent = 'Masuk ke Studio';
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
