import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const srcFile = 'C:/Users/Ricardo/.gemini/antigravity/brain/cdae9f8d-38a2-43c8-87a1-11eb6097fd80/.user_uploaded/media_1790967821434.png';
const destPng = path.resolve('public/clientes/lgpd-solution.png');
const destWebp = path.resolve('public/clientes/lgpd-solution.webp');

async function processLgpd() {
  console.log('Processing new LGPD Solution logo with transparency...');
  
  const image = sharp(srcFile);
  const trimmed = image.clone().trim({ threshold: 10 });
  const { data: pngBuf, info } = await trimmed.png().toBuffer({ resolveWithObject: true });

  fs.writeFileSync(destPng, pngBuf);
  console.log(`Saved PNG: ${destPng} (${info.width}x${info.height}, ${pngBuf.length} bytes, channels: ${info.channels})`);

  await sharp(pngBuf)
    .webp({ quality: 95, alphaQuality: 100, lossless: false })
    .toFile(destWebp);

  const webpMeta = await sharp(destWebp).metadata();
  console.log(`Saved WebP: ${destWebp} (${webpMeta.width}x${webpMeta.height}, hasAlpha: ${webpMeta.hasAlpha})`);

  // Verify corner pixel of WebP
  const rawWebp = await sharp(destWebp).raw().toBuffer({ resolveWithObject: true });
  console.log('WebP corner pixel (0,0):', {
    r: rawWebp.data[0],
    g: rawWebp.data[1],
    b: rawWebp.data[2],
    a: rawWebp.data[3]
  });
}

processLgpd();
