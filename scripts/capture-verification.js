import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import sharp from 'sharp';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const brainDir = 'C:\\Users\\Ricardo\\.gemini\\antigravity\\brain\\cdae9f8d-38a2-43c8-87a1-11eb6097fd80';
const userDataDir = path.join(os.tmpdir(), 'chrome-headless-' + Date.now());
const chromeFlags = `--headless=new --disable-gpu --no-sandbox --disable-background-networking --disable-default-apps --disable-sync --hide-scrollbars --user-data-dir="${userDataDir}"`;

async function run() {
  const contatoDesktop = path.join(brainDir, 'contato-desktop-1280px.png');
  const contatoMobile = path.join(brainDir, 'contato-mobile-375px.png');
  const homeCredentials = path.join(brainDir, 'home-credentials-1280px.png');

  console.log('Capturing contact form desktop (1280px)...');
  execSync(`"${chromePath}" ${chromeFlags} --window-size=1280,1800 --screenshot="${contatoDesktop}" http://127.0.0.1:4321/contato`, { timeout: 30000 });

  console.log('Capturing contact form mobile (375px)...');
  execSync(`"${chromePath}" ${chromeFlags} --window-size=375,2200 --screenshot="${contatoMobile}" http://127.0.0.1:4321/contato`, { timeout: 30000 });

  console.log('Capturing home page with credentials (1280px)...');
  execSync(`"${chromePath}" ${chromeFlags} --window-size=1280,3000 --screenshot="${homeCredentials}" http://127.0.0.1:4321/`, { timeout: 30000 });

  // Crop desktop contact buttons
  await sharp(contatoDesktop)
    .extract({ left: 450, top: 1150, width: 750, height: 250 })
    .toFile(path.join(brainDir, 'contato-desktop-buttons.png'));

  // Crop mobile contact buttons
  await sharp(contatoMobile)
    .extract({ left: 0, top: 1450, width: 375, height: 320 })
    .toFile(path.join(brainDir, 'contato-mobile-buttons.png'));

  // Crop credentials section from home
  await sharp(homeCredentials)
    .extract({ left: 100, top: 1350, width: 1080, height: 220 })
    .toFile(path.join(brainDir, 'home-credentials-crop.png'));

  console.log('Done captures and crops!');
}

run().catch(console.error);
