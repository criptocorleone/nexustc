import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import sharp from 'sharp';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const brainDir = 'C:\\Users\\Ricardo\\.gemini\\antigravity\\brain\\cdae9f8d-38a2-43c8-87a1-11eb6097fd80';
const userDataDir = path.join(os.tmpdir(), 'chrome-headless-v-' + Date.now());
const chromeFlags = `--headless=new --disable-gpu --no-sandbox --disable-background-networking --disable-default-apps --disable-sync --hide-scrollbars --user-data-dir="${userDataDir}"`;

async function main() {
  const contatoDeskPath = path.join(brainDir, 'contato-desk.png');
  const contatoMobPath = path.join(brainDir, 'contato-mob.png');
  const homeDeskPath = path.join(brainDir, 'home-desk.png');
  const footerDeskPath = path.join(brainDir, 'footer-desk.png');

  console.log('Capturing contact desktop (1280x1800)...');
  execSync(`"${chromePath}" ${chromeFlags} --window-size=1280,1800 --screenshot="${contatoDeskPath}" http://127.0.0.1:4321/contato`, { timeout: 30000 });

  console.log('Capturing contact mobile (375x2400)...');
  execSync(`"${chromePath}" ${chromeFlags} --window-size=375,2400 --screenshot="${contatoMobPath}" http://127.0.0.1:4321/contato`, { timeout: 30000 });

  console.log('Capturing home desktop (1280x3800)...');
  execSync(`"${chromePath}" ${chromeFlags} --window-size=1280,3800 --screenshot="${homeDeskPath}" http://127.0.0.1:4321/`, { timeout: 30000 });

  // 1. Zoom Desktop Contact Buttons
  await sharp(contatoDeskPath)
    .extract({ left: 450, top: 1100, width: 750, height: 260 })
    .toFile(path.join(brainDir, 'verificacao-contato-desktop-1280px.png'));

  // 2. Zoom Mobile Contact Buttons (find where the buttons are in 375x2400)
  // Let's crop from top 1600 to 1950
  await sharp(contatoMobPath)
    .extract({ left: 0, top: 1600, width: 375, height: 350 })
    .toFile(path.join(brainDir, 'verificacao-contato-mobile-375px.png'));

  // 3. Find and crop the credentials section on home
  await sharp(homeDeskPath)
    .extract({ left: 100, top: 2950, width: 1080, height: 350 })
    .toFile(path.join(brainDir, 'verificacao-credenciais-1280px.png'));

  // 4. Zoom Footer WhatsApp button
  await sharp(contatoDeskPath)
    .extract({ left: 100, top: 1450, width: 500, height: 300 })
    .toFile(path.join(brainDir, 'verificacao-rodape-whatsapp.png'));

  console.log('Finished capturing all verification artifacts!');
}

main().catch(console.error);
