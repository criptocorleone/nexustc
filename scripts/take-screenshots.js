import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

const distDir = path.resolve('dist');
const port = 4330;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  let filePath = path.join(distDir, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const outDir = path.resolve('screenshots');
  const brainDir = 'C:\\Users\\Ricardo\\.gemini\\antigravity\\brain\\cdae9f8d-38a2-43c8-87a1-11eb6097fd80';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const userDataDir = path.join(os.tmpdir(), 'chrome-headless-' + Date.now());
  const chromeFlags = `--headless=new --disable-gpu --no-sandbox --disable-background-networking --disable-default-apps --disable-sync --hide-scrollbars --user-data-dir="${userDataDir}"`;

  try {
    const shots = [
      { name: 'home-1280px.png', url: `http://127.0.0.1:${port}/`, width: 1280, height: 2600 },
      { name: 'home-375px.png', url: `http://127.0.0.1:${port}/`, width: 375, height: 3400 },
      { name: 'insights-1280px.png', url: `http://127.0.0.1:${port}/insights/`, width: 1280, height: 2000 },
      { name: 'artigo-marlborough-1280px.png', url: `http://127.0.0.1:${port}/insights/negocio-brasileiro-marlborough-ma/`, width: 1280, height: 2400 },
    ];

    for (const shot of shots) {
      console.log(`Capturing ${shot.name}...`);
      const targetFile = path.join(outDir, shot.name);
      execSync(`"${chromePath}" ${chromeFlags} --window-size=${shot.width},${shot.height} --screenshot="${targetFile}" ${shot.url}`, { timeout: 30000 });
      // Copy to brain dir
      fs.copyFileSync(targetFile, path.join(brainDir, shot.name));
    }

    console.log('All screenshots captured and copied to brain directory.');
  } catch (err) {
    console.error('Error capturing screenshot:', err);
  } finally {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  }
});
