import { spawn } from 'node:child_process';

const port = process.env.TEST_PORT || '4101';
const baseUrl = `http://127.0.0.1:${port}`;
const startupTimeoutMs = 15000;
const pollIntervalMs = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  const text = await response.text();
  return { response, text };
}

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  return { response, text, json };
}

async function waitForServer() {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    try {
      const { response, text } = await fetchText('/health');
      if (response.ok && text.includes('"status":"ok"')) {
        return;
      }
    } catch {
      // Keep polling until timeout while the child process boots.
    }

    await sleep(pollIntervalMs);
  }

  throw new Error(`Server did not become ready at ${baseUrl} within ${startupTimeoutMs}ms.`);
}

async function runChecks() {
  const health = await fetchText('/health');
  if (!health.response.ok || !health.text.includes('"status":"ok"')) {
    throw new Error(`Health check failed with status ${health.response.status}: ${health.text}`);
  }

  const firebaseConfig = await fetchText('/firebase-config.js');
  if (!firebaseConfig.response.ok || !firebaseConfig.text.includes('window.FIREBASE_CONFIG')) {
    throw new Error(`Firebase config endpoint failed with status ${firebaseConfig.response.status}.`);
  }

  const chatbotStatus = await fetchJson('/api/chatbot/config/status');
  if (!chatbotStatus.response.ok || !chatbotStatus.json?.status) {
    throw new Error(`Chatbot config status failed with status ${chatbotStatus.response.status}: ${chatbotStatus.text}`);
  }

  const chatbotSession = await fetchJson('/api/chatbot/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  });
  if (!chatbotSession.response.ok || !chatbotSession.json?.sessionId || !chatbotSession.json?.message) {
    throw new Error(`Chatbot session bootstrap failed with status ${chatbotSession.response.status}: ${chatbotSession.text}`);
  }

  const firebaseSecretStatus = await fetchJson('/api/admin/secrets/firebase-config/status');
  if (firebaseSecretStatus.response.status !== 401 || !firebaseSecretStatus.json?.error) {
    throw new Error(
      `Firebase secret status endpoint failed with status ${firebaseSecretStatus.response.status}: ${firebaseSecretStatus.text}`
    );
  }

  const adminPage = await fetchText('/admin');
  const looksLikeHtml = adminPage.text.toLowerCase().includes('<!doctype html') || adminPage.text.toLowerCase().includes('<html');
  if (!adminPage.response.ok || !looksLikeHtml) {
    throw new Error(`Admin route failed with status ${adminPage.response.status}.`);
  }
}

async function main() {
  const child = spawn(process.execPath, ['server.js'], {
    env: {
      ...process.env,
      PORT: port
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    await runChecks();
    console.log(`Smoke test passed against ${baseUrl}`);
  } catch (error) {
    console.error(error.message);
    if (stdout.trim()) {
      console.error('\nServer stdout:\n' + stdout.trim());
    }
    if (stderr.trim()) {
      console.error('\nServer stderr:\n' + stderr.trim());
    }
    process.exitCode = 1;
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
}

main();
