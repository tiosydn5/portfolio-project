export function initTelemetryClock() {
  const clockEl = document.getElementById('telemetry-clock');

  if (!clockEl) return;

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
