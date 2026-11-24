export function initTelemetryClock() {
  const clockEl = document.getElementById('telemetry-clock');
  const copyBtn = document.getElementById('copy-coords-btn');
  const coordsEl = document.getElementById('profile-coordinates');
  const feedbackEl = document.getElementById('telemetry-copy-feedback');

  if (clockEl) {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    let timerId = 0;

    const renderTime = () => {
      clockEl.textContent = `${formatter.format(new Date())} WIB`;
    };

    const start = () => {
      if (timerId) return;
      renderTime();
      timerId = window.setInterval(renderTime, 1000);
    };

    const stop = () => {
      if (!timerId) return;
      window.clearInterval(timerId);
      timerId = 0;
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  if (copyBtn && coordsEl) {
    let feedbackTimer = 0;

    copyBtn.addEventListener('click', async () => {
      const value = coordsEl.textContent?.trim() || '6.2088° S, 106.8456° E';
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        }
        if (feedbackEl) {
          feedbackEl.textContent = 'Koordinat disalin';
        }
      } catch {
        if (feedbackEl) {
          feedbackEl.textContent = `Salin manual: ${value}`;
        }
      }

      if (feedbackTimer) window.clearTimeout(feedbackTimer);
      feedbackTimer = window.setTimeout(() => {
        if (feedbackEl) feedbackEl.textContent = '';
      }, 2000);
    });
  }
}
