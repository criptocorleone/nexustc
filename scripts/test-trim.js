import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const dir = path.resolve('public/clientes');
const files = [
  'anad.png',
  'colegio-brasileiro-islamico.png',
  'colegio-sion-aruja.png',
  'colegio-sion-ipiranga.png',
  'cyber-insurance.png',
  'esg-solutions.png',
  'k2a.png',
  'lgpd-solution.png',
  'pe-de-brinquedo.png',
  'the-chosen.png'
];

async function inspectTrim() {
  console.log('Inspecting trim for all 10 files...\n');
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const image = sharp(filePath);
    const meta = await image.metadata();

    // Perform trim test
    const trimmed = image.clone().trim({ threshold: 10 });
    const trimmedMeta = await trimmed.metadata();
    // In sharp, to get actual trimmed dimensions, we can render to buffer or inspect info
    const { data, info } = await trimmed.toBuffer({ resolveWithObject: true });

    const origW = meta.width;
    const origH = meta.height;
    const origArea = origW * origH;

    const trimW = info.width;
    const trimH = info.height;
    const trimArea = trimW * trimH;

    const areaShrunkPct = ((1 - trimArea / origArea) * 100).toFixed(1);
    const widthShrunkPct = ((1 - trimW / origW) * 100).toFixed(1);
    const heightShrunkPct = ((1 - trimH / origH) * 100).toFixed(1);

    results.push({
      file,
      original: `${origW}x${origH}`,
      trimmed: `${trimW}x${trimH}`,
      widthDiff: `${origW} -> ${trimW} (-${widthShrunkPct}%)`,
      heightDiff: `${origH} -> ${trimH} (-${heightShrunkPct}%)`,
      areaDiff: `-${areaShrunkPct}%`,
      origW, origH, trimW, trimH
    });
  }

  console.table(results, ['file', 'original', 'trimmed', 'widthDiff', 'heightDiff', 'areaDiff']);
}

inspectTrim();
