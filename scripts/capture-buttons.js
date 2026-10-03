import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const brainDir = 'C:\\Users\\Ricardo\\.gemini\\antigravity\\brain\\cdae9f8d-38a2-43c8-87a1-11eb6097fd80';
const userDataDir = path.join(os.tmpdir(), 'chrome-headless-' + Date.now());
const chromeFlags = `--headless=new --disable-gpu --no-sandbox --disable-background-networking --disable-default-apps --disable-sync --hide-scrollbars --user-data-dir="${userDataDir}"`;

const target1 = path.join(brainDir, 'botoes-lado-a-lado-hero.png');
console.log('Capturing target 1 (Hero buttons)...');
execSync(`"${chromePath}" ${chromeFlags} --window-size=1280,850 --screenshot="${target1}" http://127.0.0.1:4321/solucoes/consultoria-seo`, { timeout: 30000 });
console.log('Target 1 exists:', fs.existsSync(target1));

const target2 = path.join(brainDir, 'botoes-lado-a-lado-form.png');
console.log('Capturing target 2 (Form buttons)...');
execSync(`"${chromePath}" ${chromeFlags} --window-size=1280,1650 --screenshot="${target2}" http://127.0.0.1:4321/contato`, { timeout: 30000 });
console.log('Target 2 exists:', fs.existsSync(target2));
