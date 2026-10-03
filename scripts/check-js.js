import fs from 'fs';

const files = [
  'dist/index.html',
  'dist/solucoes/consultoria-seo/index.html',
  'dist/segmentos/startups-e-saas/index.html',
  'dist/autor/ricardo-zago/index.html',
  'dist/insights/seo-ou-google-ads-por-onde-comecar/index.html',
];

console.log('=== VERIFICAÇÃO DE JAVASCRIPT NO CLIENTE ===\n');

files.forEach((f) => {
  const html = fs.readFileSync(f, 'utf8');
  // External script tags
  const externalScripts = [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  // Inline scripts that are not JSON-LD
  const inlineScripts = [...html.matchAll(/<script(?![^>]*src)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim());

  console.log(`Página: ${f}`);
  console.log(`  Scripts externos (Framework JS): ${externalScripts.length > 0 ? externalScripts.join(', ') : '0 KB (ZERO framework JS)'}`);
  console.log(`  Scripts inline permitidos: ${inlineScripts.length}`);
  inlineScripts.forEach((s, idx) => {
    const preview = s.substring(0, 60).replace(/\s+/g, ' ');
    console.log(`    [${idx + 1}] (${s.length} bytes): ${preview}...`);
  });
  console.log('');
});
