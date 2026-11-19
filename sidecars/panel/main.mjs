import { exec } from 'node:child_process';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { Response, SidecarApp } from 'sidecar_sdk';

const execAsync = promisify(exec);
const HERE = dirname(fileURLToPath(import.meta.url));

const app = new SidecarApp();

const readLocal = (name) => readFileSync(join(HERE, name), 'utf8');

// Pages & Assets
app.page('/', () => readLocal('index.html'));
app.page('/app.js', () => readLocal('app.js'));
app.api('/styles.css', () => new Response(readLocal('styles.css'), { contentType: 'text/css' }), 'GET');

// Helper: probe http://127.0.0.1:8787/__bili/health
function checkBiliHealth(port = 8787) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: '127.0.0.1',
        port,
        path: '/__bili/health',
        timeout: 1500,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve({ ok: res.statusCode === 200, data });
          } catch (_) {
            resolve({ ok: res.statusCode === 200, raw: body });
          }
        });
      }
    );
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, error: 'Request timeout' });
    });
  });
}

// API: Check status of bili daemon
app.api('/api/status', async () => {
  const health = await checkBiliHealth(8787);
  let systemdStatus = 'unknown';

  try {
    const { stdout } = await execAsync('systemctl --user is-active bili.service 2>/dev/null || true');
    systemdStatus = stdout.trim();
  } catch (_) {}

  return {
    running: health.ok,
    port: 8787,
    webUrl: 'http://127.0.0.1:8787/__bili/',
    systemd: systemdStatus,
    health: health.data || null,
    error: health.error || null,
  };
}, 'GET');

// API: Manage service (start/stop/restart)
app.api('/api/service-action', async (query, body) => {
  const action = body?.action || query?.action;
  if (!['start', 'stop', 'restart'].includes(action)) {
    return { success: false, error: 'Invalid action' };
  }

  try {
    await execAsync(`systemctl --user ${action} bili.service`);
    // wait a moment for service to transition
    await new Promise((r) => setTimeout(r, 800));
    const health = await checkBiliHealth(8787);
    return { success: true, action, running: health.ok };
  } catch (err) {
    return { success: false, error: err.message };
  }
}, 'POST');

app.run();

