import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const mediaDir = path.join(projectRoot, 'media');
const distMediaDir = path.join(projectRoot, 'dist', 'media');

if (!fs.existsSync(mediaDir)) {
  console.warn('[build] media/ directory not found; skipping media copy.');
  process.exit(0);
}

fs.rmSync(distMediaDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(distMediaDir), { recursive: true });
fs.cpSync(mediaDir, distMediaDir, { recursive: true });

console.log('[build] Copied media assets to dist/media');
