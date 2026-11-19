const sidecar = window.sidecar;

const $ = (id) => document.getElementById(id);
const statusPill = $('status-pill');
const biliFrame = $('bili-frame');
const offlineOverlay = $('offline-overlay');
const btnRefresh = $('btn-refresh');
const btnRestart = $('btn-restart');
const btnExternal = $('btn-external');
const btnStart = $('btn-start');

const TARGET_URL = 'http://127.0.0.1:8787/__bili/';

async function callApi(path, options = {}) {
  try {
    const res = await sidecar.fetch(path, {
      method: options.method || 'GET',
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    return await res.json();
  } catch (err) {
    console.error(`API ${path} error:`, err);
    return { error: err.message };
  }
}

async function checkStatus() {
  const res = await callApi('/api/status');
  if (res && res.running) {
    statusPill.className = 'pill online';
    statusPill.textContent = '运行中';
    offlineOverlay.classList.add('hidden');
    // Ensure iframe has src loaded
    if (!biliFrame.src || biliFrame.src === 'about:blank') {
      biliFrame.src = TARGET_URL;
    }
  } else {
    statusPill.className = 'pill offline';
    statusPill.textContent = '未运行';
    offlineOverlay.classList.remove('hidden');
  }
}

// Refresh button
btnRefresh.addEventListener('click', () => {
  btnRefresh.style.transform = 'rotate(180deg)';
  setTimeout(() => (btnRefresh.style.transform = ''), 300);
  biliFrame.src = TARGET_URL;
  checkStatus();
});

// Restart button
btnRestart.addEventListener('click', async () => {
  btnRestart.style.opacity = '0.5';
  statusPill.className = 'pill checking';
  statusPill.textContent = '重启中...';
  const res = await callApi('/api/service-action', {
    method: 'POST',
    body: { action: 'restart' },
  });
  btnRestart.style.opacity = '1';
  if (res && res.success) {
    setTimeout(() => {
      biliFrame.src = TARGET_URL;
      checkStatus();
    }, 1000);
  } else {
    checkStatus();
  }
});

// Start button in offline card
btnStart.addEventListener('click', async () => {
  btnStart.textContent = '正在启动...';
  btnStart.disabled = true;
  const res = await callApi('/api/service-action', {
    method: 'POST',
    body: { action: 'start' },
  });
  btnStart.textContent = '立即启动服务';
  btnStart.disabled = false;
  if (res && res.success) {
    setTimeout(() => {
      biliFrame.src = TARGET_URL;
      checkStatus();
    }, 1000);
  } else {
    alert('启动失败: ' + (res?.error || '未知错误'));
    checkStatus();
  }
});

// External button
btnExternal.addEventListener('click', () => {
  window.open(TARGET_URL, '_blank');
});

// Initial load & periodic health probe
checkStatus();
setInterval(checkStatus, 6000);
