import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const dir = path.resolve('public/clientes');
const files = [
  'anad',
  'colegio-brasileiro-islamico',
  'colegio-sion-aruja',
  'colegio-sion-ipiranga',
  'cyber-insurance',
  'esg-solutions',
  'k2a',
  'lgpd-solution',
  'pe-de-brinquedo',
  'the-chosen'
];

async function trimAll() {
  console.log('Trimming logos with sharp(arquivo).trim({ threshold: 10 })...\n');
  const stats = [];

  for (const name of files) {
    const pngPath = path.join(dir, `${name}.png`);
    const webpPath = path.join(dir, `${name}.webp`);

    const image = sharp(pngPath);
    const origMeta = await image.metadata();

    // Trim with threshold 10 as specified by user
    const trimmed = image.clone().trim({ threshold: 10 });
    const { data: trimmedPngBuf, info: trimInfo } = await trimmed
      .png()
      .toBuffer({ resolveWithObject: true });

    // Save trimmed PNG
    fs.writeFileSync(pngPath, trimmedPngBuf);

    // Save trimmed WebP preserving alpha
    await sharp(trimmedPngBuf)
      .webp({ quality: 90, alphaQuality: 100, lossless: false })
      .toFile(webpPath);

    const origArea = origMeta.width * origMeta.height;
    const trimArea = trimInfo.width * trimInfo.height;
    const areaShrunkPct = ((1 - trimArea / origArea) * 100).toFixed(1);
    const widthShrunkPct = ((1 - trimInfo.width / origMeta.width) * 100).toFixed(1);
    const heightShrunkPct = ((1 - trimInfo.height / origMeta.height) * 100).toFixed(1);

    stats.push({
      logo: name,
      original: `${origMeta.width}x${origMeta.height}`,
      trimmed: `${trimInfo.width}x${trimInfo.height}`,
      widthDiff: `${origMeta.width} -> ${trimInfo.width} (-${widthShrunkPct}%)`,
      heightDiff: `${origMeta.height} -> ${trimInfo.height} (-${heightShrunkPct}%)`,
      areaDiff: `-${areaShrunkPct}%`,
      origWidth: origMeta.width,
      origHeight: origMeta.height,
      newWidth: trimInfo.width,
      newHeight: trimInfo.height,
      areaShrunkPct: parseFloat(areaShrunkPct)
    });
  }

  // Sort by area shrinkage descending (most shrunk first)
  stats.sort((a, b) => b.areaShrunkPct - a.areaShrunkPct);

  console.table(stats, ['logo', 'original', 'trimmed', 'widthDiff', 'heightDiff', 'areaDiff']);
  
  // Save stats as json for reference
  fs.writeFileSync('scripts/trim-stats.json', JSON.stringify(stats, null, 2));
}

trimAll();
