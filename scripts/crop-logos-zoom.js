import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import sharp from 'sharp';

const brainDir = 'C:\\Users\\Ricardo\\.gemini\\antigravity\\brain\\cdae9f8d-38a2-43c8-87a1-11eb6097fd80';
const fullImage = path.join(brainDir, 'faixa-logos-clientes-1280px.png');
const cropTarget = path.join(brainDir, 'faixa-logos-zoom-1280px.png');

// Crop the logo band area from the 1280px screenshot
// The logo band is roughly between y=540 and y=800
sharp(fullImage)
  .extract({ left: 0, top: 510, width: 1280, height: 260 })
  .toFile(cropTarget)
  .then(() => console.log('Saved zoom crop to:', cropTarget));
