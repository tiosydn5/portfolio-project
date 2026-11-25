const STORAGE_KEY = 'studio_auth_guard_v1';
const IDB_NAME = 'studio_auth_guard_db';
const IDB_VERSION = 1;
const IDB_STORE = 'state';
const IDB_RECORD_KEY = 'guard';

export const GENERIC_AUTH_ERROR = 'Email atau password tidak sesuai.';
export const AUTH_RESPONSE_DELAY_MS = 400;
export const AUTO_RESET_WINDOW_MS = 24 * 60 * 60 * 1000;
export const PERMANENT_ATTEMPT_THRESHOLD = 10;

const LOCKOUT_SCHEDULE_MS = {
  3: 1 * 60 * 1000,
  4: 3 * 60 * 1000,
  5: 1 * 60 * 60 * 1000,
  6: 2 * 60 * 60 * 1000,
  7: 4 * 60 * 60 * 1000,
  8: 8 * 60 * 60 * 1000,
  9: 12 * 60 * 60 * 1000,
};

function defaultState() {
  return {
    attempts: 0,
    lockUntil: null,
    lastFailedAt: null,
    permanentLock: false,
  };
}

function normalizeState(raw, now = Date.now()) {
  if (!raw || typeof raw !== 'object') {
    return defaultState();
  }

  const attempts =
    typeof raw.attempts === 'number' && Number.isFinite(raw.attempts)
      ? Math.max(0, Math.floor(raw.attempts))
      : 0;
  const lastFailedAt =
    typeof raw.lastFailedAt === 'number' && Number.isFinite(raw.lastFailedAt) && raw.lastFailedAt > 0
      ? raw.lastFailedAt
      : null;
  let permanentLock = Boolean(raw.permanentLock) || attempts >= PERMANENT_ATTEMPT_THRESHOLD;
  let lockUntil =
    !permanentLock &&
    typeof raw.lockUntil === 'number' &&
    Number.isFinite(raw.lockUntil) &&
    raw.lockUntil > now
      ? raw.lockUntil
      : null;

  if (!permanentLock && lastFailedAt && now - lastFailedAt >= AUTO_RESET_WINDOW_MS) {
    return defaultState();
  }

  return {
    attempts,
    lockUntil,
    lastFailedAt,
    permanentLock,
  };
}

function readLocalRaw() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLocalState(state) {
  try {
    if (
      state.attempts === 0 &&
      !state.lockUntil &&
      !state.lastFailedAt &&
      !state.permanentLock
    ) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage quota or privacy mode fallback
  }
}

const IDB_TIMEOUT_MS = 400;

function openGuardDb() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }

    let settled = false;
    const finish = (db) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(db);
    };

    const timer = window.setTimeout(() => finish(null), IDB_TIMEOUT_MS);

    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => {
        if (settled) {
          req.result.close();
          return;
        }
        finish(req.result);
      };
      req.onerror = () => finish(null);
      req.onblocked = () => finish(null);
    } catch {
      finish(null);
    }
  });
}

async function readIndexedDbRaw() {
  const db = await openGuardDb();
  if (!db) return null;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      try {
        db.close();
      } catch {
        // ignore close error
      }
      resolve(val);
    };

    const timer = window.setTimeout(() => finish(null), IDB_TIMEOUT_MS);

    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_RECORD_KEY);
      let result = null;
      req.onsuccess = () => {
        result = req.result || null;
      };
      req.onerror = () => finish(null);
      tx.oncomplete = () => finish(result);
      tx.onerror = () => finish(null);
      tx.onabort = () => finish(null);
    } catch {
      finish(null);
    }
  });
}

async function writeIndexedDbState(state) {
  const db = await openGuardDb();
  if (!db) return;

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      try {
        db.close();
      } catch {
        // ignore close error
      }
      resolve();
    };

    const timer = window.setTimeout(finish, IDB_TIMEOUT_MS);

    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const isClean =
        state.attempts === 0 &&
        !state.lockUntil &&
        !state.lastFailedAt &&
        !state.permanentLock;

      if (isClean) {
        store.delete(IDB_RECORD_KEY);
      } else {
        store.put(state, IDB_RECORD_KEY);
      }
      tx.oncomplete = finish;
      tx.onerror = finish;
      tx.onabort = finish;
    } catch {
      finish();
    }
  });
}

function mergeNormalizedStates(a, b, now = Date.now()) {
  const na = normalizeState(a, now);
  const nb = normalizeState(b, now);

  const attempts = Math.max(na.attempts, nb.attempts);
  const permanentLock =
    na.permanentLock || nb.permanentLock || attempts >= PERMANENT_ATTEMPT_THRESHOLD;
  const maxLastFailed = Math.max(na.lastFailedAt || 0, nb.lastFailedAt || 0) || null;
  const maxLockUntil = Math.max(na.lockUntil || 0, nb.lockUntil || 0);
  const lockUntil = !permanentLock && maxLockUntil > now ? maxLockUntil : null;

  if (!permanentLock && maxLastFailed && now - maxLastFailed >= AUTO_RESET_WINDOW_MS) {
    return defaultState();
  }

  return {
    attempts,
    lockUntil,
    lastFailedAt: maxLastFailed,
    permanentLock,
  };
}

export function getLockDurationMs(attempts) {
  if (attempts >= PERMANENT_ATTEMPT_THRESHOLD) return Infinity;
  return LOCKOUT_SCHEDULE_MS[attempts] || 0;
}

export function formatLockCountdown(remainingMs, forceHours = false) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (forceHours || hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function waitMs(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function createLoginGuard() {
  let state = normalizeState(readLocalRaw(), Date.now());
  writeLocalState(state);
  let idbQueue = Promise.resolve();

  function enqueueIdb(task) {
    const run = idbQueue.then(task, task);
    idbQueue = run.catch(() => {});
    return run;
  }

  async function persistBoth(nextState) {
    state = nextState;
    writeLocalState(nextState);
    await enqueueIdb(() => writeIndexedDbState(nextState));
    return state;
  }

  function refreshAutoReset(now = Date.now()) {
    const normalized = normalizeState(state, now);
    const changed =
      normalized.attempts !== state.attempts ||
      normalized.lockUntil !== state.lockUntil ||
      normalized.lastFailedAt !== state.lastFailedAt ||
      normalized.permanentLock !== state.permanentLock;

    if (changed) {
      state = normalized;
      writeLocalState(state);
      void enqueueIdb(() => writeIndexedDbState(state));
    }
    return state;
  }

  return {
    async sync() {
      const now = Date.now();
      const lsRaw = readLocalRaw();
      const idbRaw = await enqueueIdb(() => readIndexedDbRaw());
      const merged = mergeNormalizedStates(lsRaw, idbRaw, now);
      const finalState = mergeNormalizedStates(state, merged, now);
      await persistBoth(finalState);
      return this.getStatus(now);
    },

    getStatus(now = Date.now()) {
      const current = refreshAutoReset(now);
      const remainingMs =
        !current.permanentLock && current.lockUntil ? Math.max(0, current.lockUntil - now) : 0;
      const isCooldown = !current.permanentLock && remainingMs > 0;
      return {
        attempts: current.attempts,
        permanentLock: current.permanentLock,
        isCooldown,
        isLocked: current.permanentLock || isCooldown,
        lockUntil: current.lockUntil,
        remainingMs,
      };
    },

    async recordFailure(now = Date.now()) {
      const current = refreshAutoReset(now);
      if (current.permanentLock) {
        return this.getStatus(now);
      }

      const nextAttempts = Math.min(PERMANENT_ATTEMPT_THRESHOLD, current.attempts + 1);
      const isPermanent = nextAttempts >= PERMANENT_ATTEMPT_THRESHOLD;
      const durationMs = getLockDurationMs(nextAttempts);
      const nextLockUntil = !isPermanent && durationMs > 0 ? now + durationMs : null;

      await persistBoth({
        attempts: nextAttempts,
        lockUntil: nextLockUntil,
        lastFailedAt: now,
        permanentLock: isPermanent,
      });

      return this.getStatus(now);
    },

    async reset() {
      const clean = defaultState();
      await persistBoth(clean);
      return this.getStatus(Date.now());
    },
  };
}
