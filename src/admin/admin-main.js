import '../styles/admin.css';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import { clearToast, showToast } from './admin-ui.js';
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

  async function renderModule(key) {
    if (!moduleMount) return;
    const loader = MODULE_LOADERS[key] || MODULE_LOADERS.profile;
    activeModule = key;
    clearToast();

    for (const btn of navButtons) {
      const isCurrent = btn.dataset.adminModule === key;
      if (isCurrent) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    }

    await loader(moduleMount);
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
      currentUserId = null;
      if (moduleMount) moduleMount.replaceChildren();
      return;
    }

    if (currentUserId !== user.id) {
      currentUserId = user.id;
      renderModule(activeModule);
    }
  }

  // Always start locked & unmounted until session is proven
  applySessionState(null);

  if (!isSupabaseConfigured || !supabase) {
    if (statusDot) {
      statusDot.classList.remove('bg-[#10B981]');
      statusDot.classList.add('bg-[#60A5FA]');
    }
    if (statusEl) {
      statusEl.textContent = 'Supabase belum dikonfigurasi (.env tidak ditemukan)';
    }
    if (statusHintEl) {
      statusHintEl.textContent =
        'Buat file .env dengan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk mengaktifkan login CMS.';
    }
    if (envGuideEl) envGuideEl.hidden = false;
    if (loginEmailInput) loginEmailInput.disabled = true;
    if (loginPasswordInput) loginPasswordInput.disabled = true;
    if (loginSubmitBtn) {
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.textContent = 'Lengkapi .env Terlebih Dahulu';
    }
    return;
  }

  if (statusDot) {
    statusDot.classList.remove('bg-[#60A5FA]');
    statusDot.classList.add('bg-[#10B981]');
  }
  if (statusEl) statusEl.textContent = 'Supabase Terhubung (Menunggu Autentikasi Admin)';
  if (statusHintEl) {
    statusHintEl.textContent = 'Masuk dengan akun admin yang terdaftar pada policy RLS database.';
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
        setLoginError('Email dan password wajib diisi.');
        return;
      }

      if (loginSubmitBtn) {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'Memverifikasi...';
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setLoginError(error.message || 'Gagal masuk. Periksa kembali email dan password.');
          return;
        }
        loginPasswordInput.value = '';
        applySessionState(data.session);
      } catch (err) {
        setLoginError(err?.message || 'Terjadi gangguan koneksi saat login.');
      } finally {
        if (loginSubmitBtn) {
          loginSubmitBtn.disabled = false;
          loginSubmitBtn.textContent = 'Masuk ke Dashboard';
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
