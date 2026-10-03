import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const brainDir = 'C:\\Users\\Ricardo\\.gemini\\antigravity\\brain\\cdae9f8d-38a2-43c8-87a1-11eb6097fd80';
const userDataDir = path.join(os.tmpdir(), 'chrome-headless-' + Date.now());
const chromeFlags = `--headless=new --disable-gpu --no-sandbox --disable-background-networking --disable-default-apps --disable-sync --hide-scrollbars --user-data-dir="${userDataDir}"`;

const target = path.join(brainDir, 'faixa-logos-clientes-1280px.png');
console.log('Capturing client logos banner at 1280px...');
// Let's take a viewport that captures hero bottom + full client logos + top of next section
execSync(`"${chromePath}" ${chromeFlags} --window-size=1280,1200 --screenshot="${target}" http://127.0.0.1:4321/`, { timeout: 30000 });
console.log('Saved:', target, fs.existsSync(target));
